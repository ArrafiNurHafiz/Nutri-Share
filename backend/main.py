"""FastAPI application entry point.

Mirrors server.ts exactly — middleware, rate limiting, SSE, static files, startup.
"""
from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from datetime import UTC, datetime

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.config import settings
from backend.database import close_db, create_tables, init_db
from backend.routers import (
    activity,
    admin,
    analytics,
    auth,
    dashboard,
    donations,
    notifications,
    public,
    recipient,
    reviews,
    topsis,
)
from backend.utils.logger import logger
from backend.utils.upload import save_upload


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Startup and shutdown events.

    Serverless-compatible: no background tasks, no startup TOPSIS run.
    Rate limiter cleanup runs lazily when check() is called.
    TOPSIS is run on-demand by admin via POST /admin/topsis/run.
    """
    settings.validate_production()
    init_db()
    await create_tables()

    logger.info("server_started", port=settings.port, env=settings.environment)
    yield
    await close_db()
    logger.info("server_stopped")


# --- App Setup ---

app = FastAPI(
    title="NutriShare API",
    version="2.3.7",
    lifespan=lifespan,
)

# --- Middleware ---

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins if settings.is_production else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


import time
import uuid

@app.middleware("http")
async def add_security_and_observability(request: Request, call_next):
    """Observability (Request ID & timing) + Security headers + CSRF check."""
    request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:12]
    request.state.request_id = request_id
    start_time = time.perf_counter()

    # CSRF protection: validate Origin/Referer for state-changing methods
    if request.method in ("POST", "PUT", "DELETE", "PATCH"):
        origin = request.headers.get("Origin")
        referer = request.headers.get("Referer")
        allowed = settings.cors_origins if settings.is_production else ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"]

        # Skip CSRF check for health endpoints and auth
        is_public = request.url.path in ("/health", "/health/detailed", "/health/ready", "/api/auth/login", "/api/auth/logout", "/api/auth/register/donor", "/api/auth/register/recipient")

        if not is_public and request.url.path.startswith("/api"):
            has_valid_origin = False
            if origin:
                has_valid_origin = any(origin.startswith(a.rstrip("/")) for a in allowed)
            elif referer:
                has_valid_origin = any(referer.startswith(a.rstrip("/")) for a in allowed)
            # Allow requests without Origin/Referer from same-origin (e.g., curl, Postman in dev)
            if not settings.is_production:
                has_valid_origin = has_valid_origin or not (origin or referer)
            if not has_valid_origin:
                return JSONResponse(status_code=403, content={"message": "CSRF validation failed: invalid origin"})

    response = await call_next(request)
    duration_ms = (time.perf_counter() - start_time) * 1000.0

    # Attach Request ID and Performance metrics to response headers
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time-Ms"] = f"{duration_ms:.2f}"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; object-src 'none'; base-uri 'self'"
    if settings.is_production:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

    if request.url.path != "/health":
        logger.info(
            "http_request",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=round(duration_ms, 2),
        )

    return response


# --- Health Check ---

@app.get("/health")
async def health():
    """Basic health check endpoint."""
    return {"status": "ok", "version": app.version}


@app.get("/health/detailed")
async def health_detailed():
    """Detailed health check with database and service status."""
    from backend.database import get_session_maker
    from sqlalchemy import text

    checks = {
        "status": "healthy",
        "version": app.version,
        "environment": settings.environment,
        "timestamp": datetime.now(UTC).isoformat(),
        "checks": {}
    }

    # Database check
    try:
        maker = get_session_maker()
        async with maker() as session:
            await session.execute(text("SELECT 1"))
        checks["checks"]["database"] = {"status": "healthy"}
    except Exception as e:
        checks["checks"]["database"] = {"status": "unhealthy", "error": str(e)}
        checks["status"] = "degraded"

    # Cache check
    try:
        from backend.services.cache import cache
        cache.set("health_check", "ok", 10)
        if cache.get("health_check") == "ok":
            checks["checks"]["cache"] = {"status": "healthy"}
        else:
            checks["checks"]["cache"] = {"status": "unhealthy"}
            checks["status"] = "degraded"
    except Exception as e:
        checks["checks"]["cache"] = {"status": "unhealthy", "error": str(e)}
        checks["status"] = "degraded"

    return checks


@app.get("/health/ready")
async def health_ready():
    """Readiness probe - indicates if the service is ready to accept traffic."""
    from backend.database import get_session_maker
    from sqlalchemy import text

    try:
        maker = get_session_maker()
        async with maker() as session:
            await session.execute(text("SELECT 1"))
        return {"status": "ready"}
    except Exception:
        raise HTTPException(status_code=503, detail="Service not ready")


# --- API Routers ---

app.include_router(auth.router, prefix="/api")
app.include_router(donations.router, prefix="/api")
app.include_router(public.router, prefix="/api")
app.include_router(recipient.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")
app.include_router(topsis.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(activity.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")


# --- File Upload ---

@app.post("/api/upload")
async def upload_file(request: Request):
    """Handle file upload (photo) with JWT auth via cookie."""
    import jwt as _jwt

    token = request.cookies.get(settings.cookie_name)
    if not token:
        raise HTTPException(status_code=401, detail="Not logged in")
    try:
        _jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except _jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid session")

    form = await request.form()
    file = form.get("photo")
    if not file or not hasattr(file, "read"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file. Use JPEG/PNG/WEBP max 5MB.",
        )
    url = await save_upload(file)  # type: ignore
    return {"url": url}


# --- Error Handlers ---

@app.exception_handler(StarletteHTTPException)
async def starlette_404_handler(request: Request, exc):
    """Handle FastAPI/Starlette 404s for truly unmatched routes."""
    if exc.status_code == 404:
        return JSONResponse(status_code=404, content={"message": "Endpoint not found"})
    return JSONResponse(status_code=exc.status_code, content={"message": exc.detail})


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTPException raised by route handlers."""
    return JSONResponse(status_code=exc.status_code, content={"message": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors and return Node.js-compatible format.

    FastAPI default: { "detail": [{ "loc": [...], "msg": "...", "type": "..." }] }
    NutriShare frontend expects: { "message": "..." }
    """
    first = exc.errors()[0] if exc.errors() else {}
    msg = first.get("msg", "Validation failed")
    return JSONResponse(status_code=422, content={"message": msg})


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Catch-all for unhandled exceptions."""
    logger.error("unhandled_error", error=str(exc))
    return JSONResponse(status_code=500, content={"message": "Internal server error"})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=not settings.is_production,
    )

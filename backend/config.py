from __future__ import annotations

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    environment: str = "development"
    port: int = 3000
    log_level: str = "debug"

    # Auth
    jwt_secret: str = "dev-secret-change-in-production-32chars!"  # min 32 chars untuk HS256
    admin_secret_key: str = "admin-secret-change-me"
    cookie_name: str = "nutrishare_token"
    cookie_domain: str = ""  # set for cross-origin deployments (e.g. ".vercel.app")

    # Database — Supabase PostgreSQL
    database_url: str = ""
    db_path: str = ""  # fallback SQLite path (local dev only)

    # Supabase
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_key: str = ""

    # CORS / Frontend
    allowed_origins: str = "http://localhost:3000,http://localhost:5173"
    frontend_url: str = ""  # for convenience when a single frontend origin is used

    model_config = {"env_prefix": "", "case_sensitive": False, "env_file": ".env"}

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def cors_origins(self) -> list[str]:
        origins = [o.strip() for o in self.allowed_origins.split(",") if o.strip()]
        if self.frontend_url and self.frontend_url not in origins:
            origins.append(self.frontend_url)
        return origins

    def validate_production(self) -> None:
        if not self.is_production:
            return
        errors: list[str] = []
        if self.jwt_secret == "dev-secret-change-in-production-32chars!":
            errors.append("JWT_SECRET is required in production")
        if self.admin_secret_key == "admin-secret-change-me":
            errors.append("ADMIN_SECRET_KEY is required in production")
        if errors:
            raise ValueError("; ".join(errors))


settings = Settings()

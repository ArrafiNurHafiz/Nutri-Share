"""File upload handler — Supabase Storage (production) and local disk (dev only).

Production: uploads to Supabase Storage bucket "nutrishare-uploads"
Dev: writes to local frontend/public/uploads
"""
from __future__ import annotations

import re
import time
from pathlib import Path

from anyio import to_thread
from fastapi import HTTPException, UploadFile

from backend.config import settings

MAX_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_MIMES = {"image/jpeg", "image/png", "image/webp"}
LOCAL_UPLOAD_DIR = Path.cwd() / "frontend" / "public" / "uploads"

# Magic bytes for image format validation (more secure than Content-Type header)
IMAGE_MAGIC_BYTES = {
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"RIFF": "image/webp",
}


def _validate_magic_bytes(contents: bytes) -> str:
    """Validate image by checking magic bytes, not just Content-Type header."""
    detected = None
    for magic, mime in IMAGE_MAGIC_BYTES.items():
        if len(contents) >= len(magic) and contents[: len(magic)] == magic:
            detected = mime
            break
    if detected == "image/webp" and (len(contents) < 12 or contents[8:12] != b"WEBP"):
        detected = None
    if detected is None:
        raise HTTPException(400, "Invalid file. Use JPEG/PNG/WEBP max 5MB.")
    return detected


def _sanitize_filename(original: str) -> str:
    name, ext = Path(original).stem, Path(original).suffix
    safe = re.sub(r"[^a-zA-Z0-9_-]", "_", name)[:50]
    return f"{int(time.time() * 1000)}-{safe}{ext}"


def _save_sync(filepath: Path, contents: bytes) -> None:
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, "wb") as f:
        f.write(contents)


async def _upload_to_supabase(filename: str, contents: bytes) -> str:
    """Upload file to Supabase Storage bucket."""
    from supabase import create_client

    supabase = create_client(settings.supabase_url, settings.supabase_service_key)
    bucket = "nutrishare-uploads"

    # Ensure bucket exists
    try:
        supabase.storage.get_bucket(bucket)
    except Exception:
        supabase.storage.create_bucket(bucket, public=True)

    supabase.storage.from_(bucket).upload(
        path=filename,
        file=contents,
        file_options={"content-type": "image/jpeg", "upsert": "true"},
    )

    public_url = supabase.storage.from_(bucket).get_public_url(filename)
    return public_url


async def save_upload(file: UploadFile) -> str:
    """Validate and save an uploaded file.

    Uses magic byte validation (not just Content-Type header).
    In production (Vercel/cloud), always uploads to Supabase Storage.
    In development (no supabase_service_key), saves to local disk.

    Returns the public URL of the uploaded file.
    """
    if file.content_type not in ALLOWED_MIMES:
        raise HTTPException(status_code=400, detail="Invalid file. Use JPEG/PNG/WEBP max 5MB.")

    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="Invalid file. Use JPEG/PNG/WEBP max 5MB.")

    # Magic byte validation (not relying on spoofable Content-Type)
    _validate_magic_bytes(contents)

    filename = _sanitize_filename(file.filename or "upload")

    # Production / Vercel: always use Supabase Storage
    if settings.supabase_service_key:
        return await _upload_to_supabase(filename, contents)

    # Dev only: local disk (requires writable filesystem)
    if settings.is_production:
        raise HTTPException(
            status_code=500,
            detail="File upload is not configured. Set SUPABASE_SERVICE_KEY in production.",
        )

    filepath = LOCAL_UPLOAD_DIR / filename
    await to_thread.run_sync(_save_sync, filepath, contents)
    return f"/uploads/{filename}"

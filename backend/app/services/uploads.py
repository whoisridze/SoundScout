import asyncio
import time
from pathlib import Path
from typing import Optional

from fastapi import UploadFile

from app.core.config import settings
from app.core.exceptions import ValidationError


UPLOAD_BASE = Path(settings.upload_dir)

EXTENSION_MAP = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}

# Magic bytes for validating actual file content (not just Content-Type header)
_MAGIC_BYTES = {
    "image/jpeg": b"\xff\xd8\xff",
    "image/png": b"\x89PNG\r\n\x1a\n",
    "image/webp": b"RIFF",  # full check: RIFF....WEBP
}


def _validate_magic_bytes(content: bytes, content_type: str) -> bool:
    """Verify file content matches its claimed MIME type via magic bytes."""
    sig = _MAGIC_BYTES.get(content_type)
    if not sig:
        return False
    if not content.startswith(sig):
        return False
    # WebP needs additional check: bytes 8-12 must be "WEBP"
    if content_type == "image/webp" and content[8:12] != b"WEBP":
        return False
    return True


def _safe_resolve(base: Path, url: str) -> Optional[Path]:
    """Resolve a URL-based path and ensure it stays within the upload directory."""
    resolved = (base.parent / url.lstrip("/")).resolve()
    if not str(resolved).startswith(str(base.resolve())):
        return None
    return resolved


async def save_upload(
    file: UploadFile,
    user_id: str,
    subdir: str,
    max_size: int,
    old_url: Optional[str] = None,
) -> str:
    """Validate, save file, delete old, return URL path."""
    if file.content_type not in settings.allowed_image_types:
        raise ValidationError("Invalid file type. Allowed: JPEG, PNG, WebP")

    content = await file.read()
    if len(content) > max_size:
        raise ValidationError(
            f"File too large. Maximum: {max_size // (1024 * 1024)}MB"
        )

    if not _validate_magic_bytes(content, file.content_type):
        raise ValidationError("File content does not match its type")

    # Delete old file if exists (path-traversal safe)
    if old_url:
        old_path = _safe_resolve(UPLOAD_BASE, old_url)
        if old_path and old_path.exists():
            await asyncio.to_thread(old_path.unlink, True)

    # Ensure directory exists
    directory = UPLOAD_BASE / subdir
    await asyncio.to_thread(directory.mkdir, parents=True, exist_ok=True)

    # Save new file
    ext = EXTENSION_MAP.get(file.content_type, "jpg")
    filename = f"{user_id}_{int(time.time())}.{ext}"
    filepath = directory / filename

    await asyncio.to_thread(filepath.write_bytes, content)

    return f"/uploads/{subdir}/{filename}"


async def delete_upload(url: Optional[str]) -> None:
    """Delete a previously uploaded file by its URL path."""
    if not url:
        return
    file_path = _safe_resolve(UPLOAD_BASE, url)
    if file_path and file_path.exists():
        await asyncio.to_thread(file_path.unlink, True)

from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

import httpx

router = APIRouter(prefix="/proxy", tags=["Proxy"])

_client: httpx.AsyncClient | None = None


async def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(timeout=10.0)
    return _client


@router.get("/audio")
async def proxy_audio(url: str = Query(..., description="Deezer preview URL")):
    """Proxy audio previews to avoid CORS/referrer blocks from Deezer CDN."""
    if "dzcdn.net" not in url and "deezer.com" not in url:
        return {"detail": "Only Deezer URLs allowed"}, 400

    client = await _get_client()
    resp = await client.get(url)

    return StreamingResponse(
        content=iter([resp.content]),
        media_type=resp.headers.get("content-type", "audio/mpeg"),
        headers={"Accept-Ranges": "bytes", "Content-Length": resp.headers.get("content-length", "")},
    )

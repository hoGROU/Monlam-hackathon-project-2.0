import httpx

from app.config import MONLAM_API_KEY, MONLAM_BASE_URL

AUDIO_MIME = {
    "wav": "audio/wav",
    "mp3": "audio/mpeg",
    "m4a": "audio/mp4",
    "ogg": "audio/ogg",
    "webm": "audio/webm",
    "flac": "audio/flac",
}


def _guess_mime(filename: str) -> str:
    ext = (filename or "").rsplit(".", 1)[-1].lower()
    return AUDIO_MIME.get(ext, "application/octet-stream")


def _extract_transcript(data) -> str:
    if isinstance(data, str):
        return data

    if isinstance(data, dict):
        for key in ("text", "transcription", "transcript", "result", "output", "data"):
            value = data.get(key)
            if isinstance(value, str) and value.strip():
                return value
            if isinstance(value, (dict, list)):
                nested = _extract_transcript(value)
                if nested:
                    return nested

    if isinstance(data, list) and data:
        parts = [_extract_transcript(v) for v in data]
        return " ".join(p for p in parts if p)

    return ""


def speech_to_text(audio_bytes: bytes, filename: str) -> dict:
    if not (MONLAM_API_KEY and MONLAM_BASE_URL):
        return {
            "success": False,
            "error": "MONLAM_API_KEY / MONLAM_BASE_URL are not configured on the server.",
        }

    try:
        response = httpx.post(
            url=f"{MONLAM_BASE_URL}/api/v1/speech-to-text/",
            headers={"X-API-Key": MONLAM_API_KEY},  # was mistakenly the base URL before
            files={"file": (filename, audio_bytes, _guess_mime(filename))},
            timeout=300,
        )
    except httpx.HTTPError as exc:
        return {"success": False, "error": f"Could not reach the speech service: {exc}"}

    if response.status_code != 200:
        try:
            detail = response.json()
        except Exception:
            detail = response.text
        return {"success": False, "status_code": response.status_code, "error": detail}

    data = response.json()
    text = _extract_transcript(data).strip()

    if not text:
        return {
            "success": False,
            "error": "The speech service returned no transcription.",
            "raw": data,
        }

    return {"success": True, "text": text, "raw": data}

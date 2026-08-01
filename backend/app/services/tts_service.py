import base64

import httpx

from app.config import MONLAM_API_KEY, MONLAM_BASE_URL, monlam_auth_headers

VOICES = [
    "lhasa_female",
    "lhasa_male",
    "amdo_female",
    "amdo_male",
    "kham_female",
    "kham_male",
]


def _find_audio(data):
    """Return (audio_url, audio_base64) from whatever shape the API returns."""
    url = None
    b64 = None

    if isinstance(data, dict):
        for key in ("audio_url", "url", "file_url", "audio_link", "output_url"):
            value = data.get(key)
            if isinstance(value, str) and value.strip():
                url = value
                break

        for key in ("audio_base64", "audio", "audio_content", "base64", "content"):
            value = data.get(key)
            if isinstance(value, str) and len(value) > 100:
                b64 = value
                break

        if not (url or b64):
            for value in data.values():
                if isinstance(value, (dict, list)):
                    nested_url, nested_b64 = _find_audio(value)
                    if nested_url or nested_b64:
                        return nested_url, nested_b64

    elif isinstance(data, list):
        for value in data:
            nested_url, nested_b64 = _find_audio(value)
            if nested_url or nested_b64:
                return nested_url, nested_b64

    return url, b64


def text_to_speech(text: str, voice: str = "lhasa_female") -> dict:
    if not text or not text.strip():
        return {"success": False, "error": "No text was provided."}

    if not (MONLAM_API_KEY and MONLAM_BASE_URL):
        return {
            "success": False,
            "error": "MONLAM_API_KEY / MONLAM_BASE_URL are not configured on the server.",
        }

    # The TTS engine works best on shorter chunks
    snippet = text.strip()[:1000]

    try:
        response = httpx.post(
            url=f"{MONLAM_BASE_URL}/api/v1/text-to-speech/",
            headers=monlam_auth_headers({"Content-Type": "application/json"}),
            json={"text": snippet, "voice_name": voice},
            timeout=300,
        )
    except httpx.HTTPError as exc:
        return {"success": False, "error": f"Could not reach the TTS service: {exc}"}

    if response.status_code != 200:
        try:
            detail = response.json()
        except Exception:
            detail = response.text
        return {"success": False, "status_code": response.status_code, "error": detail}

    content_type = response.headers.get("content-type", "")

    # Some deployments stream raw audio back instead of JSON
    if content_type.startswith("audio/"):
        return {
            "success": True,
            "voice": voice,
            "content_type": content_type,
            "audio_base64": base64.b64encode(response.content).decode("ascii"),
        }

    data = response.json()
    audio_url, audio_b64 = _find_audio(data)

    if audio_url and audio_url.startswith("/"):
        audio_url = f"{MONLAM_BASE_URL}{audio_url}"

    if not (audio_url or audio_b64):
        return {
            "success": False,
            "error": "The TTS service did not return any audio.",
            "raw": data,
        }

    return {
        "success": True,
        "voice": voice,
        "audio_url": audio_url,
        "audio_base64": audio_b64,
        "content_type": "audio/wav",
        "raw": data,
    }

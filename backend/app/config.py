from pathlib import Path

from dotenv import load_dotenv
import os

# backend/app/config.py -> parents[1] == backend/
BACKEND_DIR = Path(__file__).resolve().parents[1]

# Load the .env that ships with the backend, regardless of the current working
# directory the server was started from. `override=False` keeps real environment
# variables (e.g. in Docker / CI) authoritative.
load_dotenv(BACKEND_DIR / ".env", override=False)
# Fall back to the nearest .env found from the CWD (useful for local variations).
load_dotenv(override=False)

def _clean(name: str, *, strip_trailing_slash: bool = False) -> str | None:
    value = (os.getenv(name) or "").strip()
    # Treat the .env.example placeholders as "not set", otherwise the app reports
    # itself as configured and then fails deep inside an API call instead.
    if not value or value.startswith("your_") or value.endswith("_here"):
        return None
    return value.rstrip("/") if strip_trailing_slash else value


MONLAM_API_KEY = _clean("MONLAM_API_KEY")
# Strip a trailing slash so f"{MONLAM_BASE_URL}/api/v1/..." never produces "//".
MONLAM_BASE_URL = _clean("MONLAM_BASE_URL", strip_trailing_slash=True)
ANTHROPIC_API_KEY = _clean("ANTHROPIC_API_KEY")


def monlam_auth_headers(extra: dict | None = None) -> dict:
    """
    Auth headers for the Monlam AI Platform.

    Studio-issued `ml-...` keys are sent in the `X-API-Key` header; a Bearer
    token is rejected with 422 "header x-api-key Field required".

    The host matters: studio keys are only valid on the versioned API host
    (`https://api-v1.monlamai.studio`, per the current Studio docs). The older
    `api.monlamai.studio` host answers 401 "Invalid API Key" for the very same
    key, so MONLAM_BASE_URL must point at the api-v1 host.
    """
    headers = {"x-api-key": MONLAM_API_KEY or ""}
    if extra:
        headers.update(extra)
    return headers

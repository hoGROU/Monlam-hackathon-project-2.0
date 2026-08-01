"""
Debug logging for outbound Monlam API calls.

Enabled with MONLAM_DEBUG=1 in backend/.env (off by default so production logs
stay clean). Secrets are always masked - the API key is never printed in full,
so these logs are safe to paste into a bug report.
"""

import json
import os

SENSITIVE_HEADERS = {"x-api-key", "authorization", "api-key", "apikey"}
MAX_BODY_CHARS = 600


def debug_enabled() -> bool:
    return (os.getenv("MONLAM_DEBUG") or "").strip().lower() in {"1", "true", "yes", "on"}


def mask(value: str) -> str:
    """Show only the first and last 4 characters of a secret."""
    if not value:
        return "(empty)"
    if len(value) <= 8:
        return "*" * len(value)
    return f"{value[:4]}...{value[-4:]} (len={len(value)})"


def safe_headers(headers) -> dict:
    return {
        key: mask(value) if key.lower() in SENSITIVE_HEADERS else value
        for key, value in dict(headers).items()
    }


def _truncate(text: str) -> str:
    if len(text) <= MAX_BODY_CHARS:
        return text
    return f"{text[:MAX_BODY_CHARS]}... [truncated, {len(text)} chars total]"


def log_request(label: str, url: str, headers, body=None) -> None:
    if not debug_enabled():
        return

    print(f"[monlam:{label}] --> POST {url}")
    for key, value in safe_headers(headers).items():
        print(f"[monlam:{label}]     {key}: {value}")

    if body is not None:
        try:
            rendered = json.dumps(body, ensure_ascii=False)
        except (TypeError, ValueError):
            rendered = repr(body)
        print(f"[monlam:{label}]     body: {_truncate(rendered)}")


def log_response(label: str, response) -> None:
    if not debug_enabled():
        return

    print(f"[monlam:{label}] <-- {response.status_code} {response.reason_phrase}")
    content_type = response.headers.get("content-type", "")
    # Never dump raw audio/image bytes into the log
    if content_type.startswith(("audio/", "image/", "video/")):
        print(f"[monlam:{label}]     body: <{content_type}, {len(response.content)} bytes>")
    else:
        print(f"[monlam:{label}]     body: {_truncate(response.text)}")

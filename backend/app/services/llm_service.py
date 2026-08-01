"""
Generic LLM helper.

Tries Anthropic (Claude) first when ANTHROPIC_API_KEY is present, and falls
back to the Monlam chat model. This keeps translation / summary / keyword
extraction working even if only one provider is configured.
"""

import os
import httpx
from dotenv import load_dotenv

from app.config import MONLAM_API_KEY, MONLAM_BASE_URL, monlam_auth_headers

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-3-5-sonnet-20241022")

_anthropic_client = None

if ANTHROPIC_API_KEY:
    try:
        from anthropic import Anthropic
        _anthropic_client = Anthropic(api_key=ANTHROPIC_API_KEY)
    except Exception as exc:  # pragma: no cover
        print("Anthropic client unavailable:", exc)
        _anthropic_client = None


class LLMError(Exception):
    """Raised when every configured provider fails."""


def _ask_claude(system: str, prompt: str, max_tokens: int = 1200) -> str:
    response = _anthropic_client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text


def _ask_monlam(system: str, prompt: str, max_tokens: int = 1200) -> str:
    if not (MONLAM_API_KEY and MONLAM_BASE_URL):
        raise LLMError("Monlam API is not configured")

    response = httpx.post(
        url=f"{MONLAM_BASE_URL}/api/v1/ai/chat",
        headers=monlam_auth_headers({"Content-Type": "application/json"}),
        json={
            "model_name": "melong",
            "temperature": 0.2,
            "max_tokens": max_tokens,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
        },
        timeout=120,
    )

    if response.status_code != 200:
        raise LLMError(f"Monlam chat failed ({response.status_code}): {response.text}")

    data = response.json()
    return extract_text(data)


def extract_text(data) -> str:
    """Pull the assistant text out of the various shapes the API may return."""
    if isinstance(data, str):
        return data

    if isinstance(data, dict):
        for key in ("response", "text", "content", "output", "message", "answer", "result"):
            value = data.get(key)
            if isinstance(value, str) and value.strip():
                return value
            if isinstance(value, (dict, list)):
                nested = extract_text(value)
                if nested:
                    return nested

        choices = data.get("choices")
        if isinstance(choices, list) and choices:
            return extract_text(choices[0])

        data_field = data.get("data")
        if data_field is not None:
            return extract_text(data_field)

    if isinstance(data, list) and data:
        return extract_text(data[0])

    return ""


def ask_llm(system: str, prompt: str, max_tokens: int = 1200) -> str:
    """Ask whichever provider is available. Raises LLMError if all fail."""
    errors = []

    if _anthropic_client:
        try:
            return _ask_claude(system, prompt, max_tokens)
        except Exception as exc:
            errors.append(f"claude: {exc}")

    try:
        return _ask_monlam(system, prompt, max_tokens)
    except Exception as exc:
        errors.append(f"monlam: {exc}")

    raise LLMError(" | ".join(errors) or "No LLM provider configured")

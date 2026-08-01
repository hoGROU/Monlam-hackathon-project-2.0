import httpx

from app.config import MONLAM_API_KEY, MONLAM_BASE_URL, monlam_auth_headers
from app.services.debug_log import log_request, log_response
from app.services.llm_service import extract_text

DEFAULT_SYSTEM = (
    "You are Monlam AI, an expert Tibetan language assistant. "
    "When the user asks for Tibetan, always respond in correct Tibetan Unicode script. "
    "Do not translate into Hindi, Nepali, or Sanskrit unless the user explicitly asks."
)


def ask_monlam(message: str, context: str = "", history: list | None = None) -> dict:
    """
    Ask the Monlam chat model.

    `context` is the OCR'd document text, so answers stay grounded in the
    document the user uploaded. `history` is a list of
    {"role": "user"|"assistant", "content": str}.
    """
    if not (MONLAM_API_KEY and MONLAM_BASE_URL):
        return {
            "success": False,
            "error": "MONLAM_API_KEY / MONLAM_BASE_URL are not configured on the server.",
        }

    system = DEFAULT_SYSTEM
    if context:
        system += (
            "\n\nThe user is asking about the following document. "
            "Ground your answers in it and say so when it does not contain the answer.\n\n"
            f"--- DOCUMENT START ---\n{context[:12000]}\n--- DOCUMENT END ---"
        )

    messages = [{"role": "system", "content": system}]

    for turn in (history or [])[-8:]:
        role = turn.get("role")
        content = (turn.get("content") or "").strip()
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": message})

    url = f"{MONLAM_BASE_URL}/api/v1/ai/chat"
    headers = monlam_auth_headers({"Content-Type": "application/json"})
    payload = {
        "model_name": "melong",
        "temperature": 0.2,
        "max_tokens": 900,
        "messages": messages,
    }

    log_request("chat", url, headers, payload)

    try:
        response = httpx.post(url=url, headers=headers, json=payload, timeout=120)
    except httpx.HTTPError as exc:
        return {"success": False, "error": f"Could not reach the chat service: {exc}"}

    log_response("chat", response)

    if response.status_code != 200:
        try:
            detail = response.json()
        except Exception:
            detail = response.text
        return {
            "success": False,
            "status_code": response.status_code,
            "error": detail,
        }

    data = response.json()
    reply = extract_text(data).strip()

    if not reply:
        return {"success": False, "error": "The chat service returned an empty reply.", "raw": data}

    return {"success": True, "response": reply, "raw": data}

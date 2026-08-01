"""Tibetan -> English translation and keyword extraction."""

import json
import re

from app.services.llm_service import ask_llm, LLMError

TRANSLATE_SYSTEM = (
    "You are an expert translator of Classical and modern Tibetan into English. "
    "Translate faithfully and readably, preserving technical Buddhist terminology. "
    "Keep the paragraph structure of the source. "
    "Return ONLY the English translation with no preamble, notes or commentary."
)

KEYWORD_SYSTEM = (
    "You extract key Tibetan terminology from a passage. "
    'Respond with ONLY a JSON array of objects shaped '
    '[{"term": "wylie or tibetan term", "translation": "short english gloss", '
    '"type": "concept|practice|text|person|place"}]. '
    "Return between 5 and 10 items. No markdown fences, no explanation."
)


def translate_text(text: str, target_language: str = "English") -> str:
    if not text or not text.strip():
        return ""

    prompt = (
        f"Translate the following Tibetan text into {target_language}.\n\n"
        f"---\n{text}\n---"
    )
    return ask_llm(TRANSLATE_SYSTEM, prompt, max_tokens=2000).strip()


def _strip_fences(raw: str) -> str:
    raw = raw.strip()
    raw = re.sub(r"^```[a-zA-Z]*\s*", "", raw)
    raw = re.sub(r"```$", "", raw)
    return raw.strip()


def extract_keywords(text: str, translation: str = "") -> list:
    if not text or not text.strip():
        return []

    prompt = "Tibetan passage:\n" + text
    if translation:
        prompt += "\n\nEnglish translation for reference:\n" + translation

    try:
        raw = _strip_fences(ask_llm(KEYWORD_SYSTEM, prompt, max_tokens=900))
    except LLMError as exc:
        print("Keyword extraction failed:", exc)
        return []

    # Grab the first JSON array in the response
    match = re.search(r"\[.*\]", raw, re.DOTALL)
    if match:
        raw = match.group(0)

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        print("Keyword JSON parse failed:", raw[:300])
        return []

    allowed = {"concept", "practice", "text", "person", "place"}
    keywords = []

    for item in parsed if isinstance(parsed, list) else []:
        if not isinstance(item, dict):
            continue
        term = str(item.get("term", "")).strip()
        if not term:
            continue
        kind = str(item.get("type", "concept")).strip().lower()
        keywords.append({
            "term": term,
            "translation": str(item.get("translation", "")).strip(),
            "type": kind if kind in allowed else "concept",
        })

    return keywords[:12]

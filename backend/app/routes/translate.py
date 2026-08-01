from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.llm_service import LLMError
from app.services.translate_service import extract_keywords, translate_text

router = APIRouter()


class TranslateRequest(BaseModel):
    text: str
    target_language: str = "English"


class KeywordRequest(BaseModel):
    text: str
    translation: str = ""


@router.post("/translate")
def translate(data: TranslateRequest):
    if not data.text.strip():
        raise HTTPException(status_code=400, detail="`text` must not be empty.")

    try:
        return {
            "success": True,
            "translation": translate_text(data.text, data.target_language),
        }
    except LLMError as exc:
        raise HTTPException(status_code=502, detail=str(exc))


@router.post("/keywords")
def keywords(data: KeywordRequest):
    if not data.text.strip():
        raise HTTPException(status_code=400, detail="`text` must not be empty.")

    return {
        "success": True,
        "keywords": extract_keywords(data.text, data.translation),
    }

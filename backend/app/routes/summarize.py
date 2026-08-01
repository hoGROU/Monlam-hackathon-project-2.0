from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.claude_summary import summarize_text
from app.services.llm_service import LLMError

router = APIRouter()


class SummaryRequest(BaseModel):
    text: str


@router.post("/summarize")
def summarize(data: SummaryRequest):
    if not data.text.strip():
        raise HTTPException(status_code=400, detail="`text` must not be empty.")

    try:
        return {"success": True, "summary": summarize_text(data.text)}
    except LLMError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

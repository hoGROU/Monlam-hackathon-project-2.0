from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.tts_service import VOICES, text_to_speech

router = APIRouter()


class TTSRequest(BaseModel):
    text: str
    voice: str = "lhasa_female"


@router.get("/voices")
def voices():
    return {"voices": VOICES}


@router.post("/text-to-speech")
def tts(request: TTSRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="`text` must not be empty.")

    result = text_to_speech(text=request.text, voice=request.voice)

    if not result.get("success"):
        raise HTTPException(status_code=502, detail=str(result.get("error")))

    return result

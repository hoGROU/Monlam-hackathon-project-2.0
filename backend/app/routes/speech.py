from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.crud import (
    save_speech,
    get_speech_history,
    delete_speech,
    delete_all_speech
)

from app.services.speech_service import speech_to_text

router = APIRouter()


@router.post("/speech-to-text")
async def stt(file: UploadFile = File(...), db: Session = Depends(get_db)):

    audio_bytes = await file.read()

    result = speech_to_text(
        audio_bytes=audio_bytes,
        filename=file.filename
    )

    # Adjust this key if your speech service returns a different structure
    if "text" in result:
        save_speech(
            db=db,
            filename=file.filename,
            transcription=result["text"]
        )

    return result


@router.get("/speech-history")
def speech_history(db: Session = Depends(get_db)):
    return get_speech_history(db)


@router.delete("/speech-history/{speech_id}")
def remove_speech(speech_id: int, db: Session = Depends(get_db)):
    return delete_speech(db, speech_id)


@router.delete("/speech-history")
def remove_all_speech(db: Session = Depends(get_db)):
    return delete_all_speech(db)
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.crud import (
    delete_all_ocr,
    delete_ocr,
    get_ocr_history,
    save_ocr,
)
from app.services.ocr_service import ocr_document

router = APIRouter()


@router.post("/ocr")
async def ocr(file: UploadFile = File(...), db: Session = Depends(get_db)):
    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    result = ocr_document(file_bytes=image_bytes, filename=file.filename)

    if not result.get("success"):
        raise HTTPException(status_code=502, detail=str(result.get("error")))

    save_ocr(db=db, filename=file.filename, extracted_text=result["text"])

    return result


@router.get("/ocr-history")
def ocr_history(db: Session = Depends(get_db)):
    return get_ocr_history(db)


@router.delete("/ocr-history/{ocr_id}")
def remove_ocr(ocr_id: int, db: Session = Depends(get_db)):
    return delete_ocr(db, ocr_id)


@router.delete("/ocr-history")
def remove_all_ocr(db: Session = Depends(get_db)):
    return delete_all_ocr(db)

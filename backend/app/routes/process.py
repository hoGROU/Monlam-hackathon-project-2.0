"""
The one-shot document pipeline used by the frontend:

  upload -> OCR -> translation -> summary -> keywords -> saved document

`POST /process` runs it and returns the finished document.
`POST /process/stream` runs it and streams Server-Sent Events so the UI can
show real progress instead of a fake timer.
"""

import asyncio
import json
import time

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database.crud import (
    document_to_dict,
    delete_document,
    get_document,
    get_documents,
    save_document,
    save_ocr,
)
from app.database.database import SessionLocal, get_db
from app.services.claude_summary import summarize_text
from app.services.llm_service import LLMError
from app.services.ocr_service import ocr_document
from app.services.translate_service import extract_keywords, translate_text

router = APIRouter()

MAX_UPLOAD_BYTES = 25 * 1024 * 1024  # 25 MB
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".tif", ".tiff", ".webp"}


def format_size(num_bytes: int) -> str:
    kb = num_bytes / 1024
    if kb < 1024:
        return f"{kb:.0f} KB"
    return f"{kb / 1024:.1f} MB"


def count_words(text: str) -> int:
    return len([w for w in text.split() if w.strip()])


def validate_upload(filename: str, size: int) -> None:
    ext = "." + (filename or "").rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )
    if size > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File is too large ({format_size(size)}). Maximum is {format_size(MAX_UPLOAD_BYTES)}.",
        )
    if size == 0:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")


def run_pipeline(file_bytes: bytes, filename: str, db: Session, on_step=None):
    """Run OCR -> translate -> summarize -> keywords. `on_step` gets progress dicts."""

    def emit(stage, status, **extra):
        if on_step:
            on_step({"stage": stage, "status": status, **extra})

    started = time.time()

    emit("upload", "done", fileName=filename, fileSize=format_size(len(file_bytes)))

    # ---- OCR ----
    emit("ocr", "start")
    ocr = ocr_document(file_bytes, filename)

    if not ocr.get("success"):
        emit("ocr", "error", error=str(ocr.get("error")))
        raise HTTPException(status_code=502, detail=f"OCR failed: {ocr.get('error')}")

    original_text = ocr["text"]
    emit("ocr", "done", pages=ocr.get("pages", 1), confidence=ocr.get("confidence"))

    save_ocr(db=db, filename=filename, extracted_text=original_text)

    # ---- Translation ----
    emit("translation", "start")
    try:
        translation = translate_text(original_text)
        emit("translation", "done")
    except LLMError as exc:
        translation = ""
        emit("translation", "error", error=str(exc))

    # ---- Summary ----
    emit("summary", "start")
    try:
        summary = summarize_text(translation or original_text)
        emit("summary", "done")
    except LLMError as exc:
        summary = ""
        emit("summary", "error", error=str(exc))

    # ---- Keywords ----
    emit("keywords", "start")
    keywords = extract_keywords(original_text, translation)
    emit("keywords", "done", count=len(keywords))

    elapsed = time.time() - started

    doc = save_document(
        db=db,
        file_name=filename,
        file_size=format_size(len(file_bytes)),
        pages=ocr.get("pages", 1),
        word_count=count_words(original_text),
        ocr_confidence=ocr.get("confidence"),
        language="Tibetan (Bod skad)",
        processing_time=f"{elapsed:.1f}s",
        original_text=original_text,
        translation=translation,
        summary=summary,
        keywords=keywords,
    )

    payload = document_to_dict(doc)
    emit("ready", "done", document=payload)
    return payload


@router.post("/process")
async def process(file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_bytes = await file.read()
    validate_upload(file.filename, len(file_bytes))

    document = await asyncio.to_thread(run_pipeline, file_bytes, file.filename, db)
    return {"success": True, "document": document}


@router.post("/process/stream")
async def process_stream(file: UploadFile = File(...)):
    file_bytes = await file.read()
    filename = file.filename
    validate_upload(filename, len(file_bytes))

    queue: asyncio.Queue = asyncio.Queue()
    loop = asyncio.get_running_loop()

    def on_step(event):
        loop.call_soon_threadsafe(queue.put_nowait, event)

    def worker():
        # A worker thread needs its own DB session
        db = SessionLocal()
        try:
            run_pipeline(file_bytes, filename, db, on_step=on_step)
        except HTTPException as exc:
            on_step({"stage": "error", "status": "error", "error": str(exc.detail)})
        except Exception as exc:  # pragma: no cover
            on_step({"stage": "error", "status": "error", "error": str(exc)})
        finally:
            db.close()
            on_step(None)  # sentinel

    async def event_stream():
        task = asyncio.create_task(asyncio.to_thread(worker))
        try:
            while True:
                event = await queue.get()
                if event is None:
                    break
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
        finally:
            await task

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/documents")
def list_documents(db: Session = Depends(get_db)):
    return [document_to_dict(doc) for doc in get_documents(db)]


@router.get("/documents/{document_id}")
def read_document(document_id: int, db: Session = Depends(get_db)):
    doc = get_document(db, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return document_to_dict(doc)


@router.delete("/documents/{document_id}")
def remove_document(document_id: int, db: Session = Depends(get_db)):
    return delete_document(db, document_id)

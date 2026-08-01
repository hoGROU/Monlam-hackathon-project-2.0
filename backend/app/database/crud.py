import json

from sqlalchemy.orm import Session
from app.database.models import (
    ChatHistory,
    Document,
    OCRHistory,
    SpeechHistory
)

# ==========================
# CHAT
# ==========================

def save_chat(db: Session, question: str, answer: str, document_id: int | None = None):
    chat = ChatHistory(
        question=question,
        answer=answer,
        document_id=document_id
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat


def get_chat_history(db: Session):
    return db.query(ChatHistory).order_by(ChatHistory.id.desc()).all()


def delete_chat(db: Session, chat_id: int):
    chat = db.query(ChatHistory).filter(ChatHistory.id == chat_id).first()

    if chat:
        db.delete(chat)
        db.commit()

    return {"message": "Chat deleted successfully"}


def delete_all_chats(db: Session):
    db.query(ChatHistory).delete()
    db.commit()
    return {"message": "All chats deleted successfully"}


# ==========================
# OCR
# ==========================

def save_ocr(db: Session, filename: str, extracted_text: str):
    ocr = OCRHistory(
        filename=filename,
        extracted_text=extracted_text
    )
    db.add(ocr)
    db.commit()
    db.refresh(ocr)
    return ocr


def get_ocr_history(db: Session):
    return db.query(OCRHistory).order_by(OCRHistory.id.desc()).all()


def delete_ocr(db: Session, ocr_id: int):
    ocr = db.query(OCRHistory).filter(OCRHistory.id == ocr_id).first()

    if ocr:
        db.delete(ocr)
        db.commit()

    return {"message": "OCR deleted successfully"}


def delete_all_ocr(db: Session):
    db.query(OCRHistory).delete()
    db.commit()

    return {"message": "All OCR history deleted successfully"}


# ==========================
# SPEECH
# ==========================

def save_speech(db: Session, filename: str, transcription: str):
    speech = SpeechHistory(
        filename=filename,
        transcription=transcription
    )
    db.add(speech)
    db.commit()
    db.refresh(speech)
    return speech


def get_speech_history(db: Session):
    return db.query(SpeechHistory).order_by(SpeechHistory.id.desc()).all()


def delete_speech(db: Session, speech_id: int):
    speech = db.query(SpeechHistory).filter(SpeechHistory.id == speech_id).first()

    if speech:
        db.delete(speech)
        db.commit()

    return {"message": "Speech deleted successfully"}


def delete_all_speech(db: Session):
    db.query(SpeechHistory).delete()
    db.commit()

    return {"message": "All speech history deleted successfully"}


# ==========================
# DOCUMENTS (full pipeline result)
# ==========================

def save_document(db: Session, **fields):
    keywords = fields.pop("keywords", None)
    if keywords is not None:
        fields["keywords_json"] = json.dumps(keywords, ensure_ascii=False)

    doc = Document(**fields)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def get_document(db: Session, document_id: int):
    return db.query(Document).filter(Document.id == document_id).first()


def get_documents(db: Session, limit: int = 50):
    return db.query(Document).order_by(Document.id.desc()).limit(limit).all()


def delete_document(db: Session, document_id: int):
    doc = get_document(db, document_id)

    if doc:
        db.delete(doc)
        db.query(ChatHistory).filter(ChatHistory.document_id == document_id).delete()
        db.commit()

    return {"message": "Document deleted successfully"}


def document_to_dict(doc: Document) -> dict:
    """Shape a Document row into the payload the frontend expects."""
    try:
        keywords = json.loads(doc.keywords_json or "[]")
    except (json.JSONDecodeError, TypeError):
        keywords = []

    return {
        "id": doc.id,
        "fileName": doc.file_name,
        "fileSize": doc.file_size,
        "pages": doc.pages,
        "wordCount": doc.word_count,
        "ocrConfidence": doc.ocr_confidence,
        "language": doc.language,
        "processingTime": doc.processing_time,
        "originalText": doc.original_text or "",
        "translation": doc.translation or "",
        "summary": doc.summary or "",
        "keywords": keywords,
        "createdAt": doc.created_at.isoformat() if doc.created_at else None,
    }

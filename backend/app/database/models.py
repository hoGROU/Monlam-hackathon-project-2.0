from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class ChatHistory(Base):
    __tablename__ = "chat_history"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, index=True, nullable=True)
    question = Column(Text)
    answer = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class OCRHistory(Base):
    __tablename__ = "ocr_history"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    extracted_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class SpeechHistory(Base):
    __tablename__ = "speech_history"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    transcription = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class Document(Base):
    """A fully processed document: OCR + translation + summary + keywords."""

    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String)
    file_size = Column(String)
    pages = Column(Integer, default=1)
    word_count = Column(Integer, default=0)
    ocr_confidence = Column(Float, nullable=True)
    language = Column(String, default="Tibetan (Bod skad)")
    processing_time = Column(String, nullable=True)

    original_text = Column(Text, default="")
    translation = Column(Text, default="")
    summary = Column(Text, default="")
    keywords_json = Column(Text, default="[]")

    created_at = Column(DateTime, default=datetime.utcnow)

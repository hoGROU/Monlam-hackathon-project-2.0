from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load .env
load_dotenv()

# Database
from app.database.database import engine
from app.database.models import Base

# Routers
from app.routes.chat import router as chat_router
from app.routes.ocr import router as ocr_router
from app.routes.speech import router as speech_router
from app.routes.tts import router as tts_router
from app.routes.summarize import router as summarize_router
from app.routes.translate import router as translate_router
from app.routes.process import router as process_router

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Monlam AI Backend",
    version="1.0.0",
    description="Backend for OCR, Translation, Summary, Chat, Speech-to-Text and Text-to-Speech"
)

# -----------------------------
# CORS (so the Vite frontend can call us)
# -----------------------------

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS if o.strip()],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment Variables
API_KEY = os.getenv("MONLAM_API_KEY")
BASE_URL = os.getenv("MONLAM_BASE_URL")


# -----------------------------
# Home
# -----------------------------

@app.get("/")
def home():
    return {
        "message": "Monlam AI Backend is Running!"
    }


# -----------------------------
# Health (used by the frontend to show connection status)
# -----------------------------

@app.get("/health")
def health():
    return {
        "status": "ok",
        "monlam_configured": bool(API_KEY and BASE_URL),
        "anthropic_configured": bool(os.getenv("ANTHROPIC_API_KEY")),
    }


# -----------------------------
# Configuration Check
# -----------------------------

@app.get("/config")
def config():
    return {
        "base_url": BASE_URL,
        "api_key_loaded": API_KEY is not None
    }


# -----------------------------
# Include Routers
# -----------------------------

app.include_router(chat_router)
app.include_router(ocr_router)
app.include_router(speech_router)
app.include_router(tts_router)
app.include_router(summarize_router)
app.include_router(translate_router)
app.include_router(process_router)

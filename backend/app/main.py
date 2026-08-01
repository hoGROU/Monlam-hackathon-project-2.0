from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Importing config loads backend/.env from a path relative to the package, so it
# works no matter which directory the server was started from.
from app.config import ANTHROPIC_API_KEY, MONLAM_API_KEY, MONLAM_BASE_URL

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

# Reuse the validated values from config so /health and /config can't report
# "configured" while the services themselves see placeholders or None.
API_KEY = MONLAM_API_KEY
BASE_URL = MONLAM_BASE_URL


@app.on_event("startup")
def _log_configuration() -> None:
    """
    Print the effective credential configuration on boot.

    Logs the length only - never the key itself - so a bad/truncated value is
    obvious from the logs without leaking the secret.
    """
    print("--- Monlam AI backend configuration ---")
    print(f"  API base URL       : {BASE_URL or '(not set)'}")
    print(f"  MONLAM_API_KEY set : {bool(API_KEY)}")
    print(f"  MONLAM_API_KEY len : {len(API_KEY) if API_KEY else 0}")
    print(f"  Auth header        : x-api-key")
    print(f"  ANTHROPIC_API_KEY  : {'set' if ANTHROPIC_API_KEY else 'not set (falls back to Monlam chat)'}")
    if not (API_KEY and BASE_URL):
        print("  WARNING: Monlam credentials incomplete - OCR/chat/speech will fail.")
    print("---------------------------------------")


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
        "anthropic_configured": bool(ANTHROPIC_API_KEY),
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

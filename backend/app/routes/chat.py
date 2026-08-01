from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.crud import (
    get_chat_history,
    get_document,
    delete_chat,
    delete_all_chats,
    save_chat,
)
from app.services.chat_service import ask_monlam
from app.services.claude_summary import answer_question
from app.services.llm_service import LLMError

router = APIRouter()


class ChatTurn(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    document_id: int | None = None
    context: str = ""
    history: list[ChatTurn] = []


@router.post("/chat")
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="`message` must not be empty.")

    # Prefer the stored document text over anything the client sent
    context = request.context
    if request.document_id:
        doc = get_document(db, request.document_id)
        if doc:
            context = "\n\n".join(
                part for part in [doc.original_text, doc.translation] if part
            )

    history = [turn.model_dump() for turn in request.history]

    result = ask_monlam(request.message, context=context, history=history)

    # If Monlam chat is unavailable, fall back to Claude so chat still works
    if not result.get("success"):
        try:
            reply = answer_question(request.message, context)
            result = {"success": True, "response": reply, "provider": "claude"}
        except LLMError:
            raise HTTPException(
                status_code=502,
                detail=f"Chat is unavailable: {result.get('error')}",
            )

    save_chat(
        db=db,
        question=request.message,
        answer=result["response"],
        document_id=request.document_id,
    )

    return result


@router.get("/chat-history")
def chat_history(db: Session = Depends(get_db)):
    return get_chat_history(db)


@router.delete("/chat-history/{chat_id}")
def remove_chat(chat_id: int, db: Session = Depends(get_db)):
    return delete_chat(db, chat_id)


@router.delete("/chat-history")
def remove_all_chats(db: Session = Depends(get_db)):
    return delete_all_chats(db)

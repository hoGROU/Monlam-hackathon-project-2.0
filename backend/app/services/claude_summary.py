"""Document summarization, backed by Claude with a Monlam fallback."""

from app.services.llm_service import ask_llm

SUMMARY_SYSTEM = (
    "You are Monlam AI, a research assistant for Tibetan texts. "
    "Write a clear, structured summary in English of 2-3 short paragraphs. "
    "Cover the main topic, the structure of the argument, and any key terminology. "
    "Do not invent facts that are not in the text. Return only the summary."
)


def summarize_text(text: str) -> str:
    if not text or not text.strip():
        return ""

    prompt = f"Summarize the following document.\n\n---\n{text}\n---"
    return ask_llm(SUMMARY_SYSTEM, prompt, max_tokens=900).strip()


def answer_question(question: str, context: str = "") -> str:
    """Answer a question grounded in the supplied document text."""
    system = (
        "You are Monlam AI, a research assistant for Tibetan manuscripts. "
        "Answer the user's question using ONLY the document provided. "
        "If the document does not contain the answer, say so plainly. "
        "Be concise and specific."
    )

    if context:
        prompt = (
            f"Document:\n---\n{context[:12000]}\n---\n\nQuestion: {question}"
        )
    else:
        prompt = question

    return ask_llm(system, prompt, max_tokens=900).strip()

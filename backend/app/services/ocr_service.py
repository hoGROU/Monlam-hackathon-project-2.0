import io
import httpx

from app.config import MONLAM_API_KEY, MONLAM_BASE_URL

IMAGE_MIME = {
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "tif": "image/tiff",
    "tiff": "image/tiff",
    "webp": "image/webp",
}


def _guess_mime(filename: str) -> str:
    ext = (filename or "").rsplit(".", 1)[-1].lower()
    return IMAGE_MIME.get(ext, "application/octet-stream")


def _extract_ocr_text(data) -> str:
    """The OCR API may nest the text under different keys - normalize it."""
    if isinstance(data, str):
        return data

    if isinstance(data, dict):
        for key in ("text", "extracted_text", "full_text", "content", "result", "output", "data"):
            value = data.get(key)
            if isinstance(value, str) and value.strip():
                return value
            if isinstance(value, (dict, list)):
                nested = _extract_ocr_text(value)
                if nested:
                    return nested

        # Line/word level results
        for key in ("lines", "pages", "results", "segments"):
            value = data.get(key)
            if isinstance(value, list) and value:
                parts = [_extract_ocr_text(v) for v in value]
                joined = "\n".join(p for p in parts if p)
                if joined.strip():
                    return joined

    if isinstance(data, list) and data:
        parts = [_extract_ocr_text(v) for v in data]
        return "\n".join(p for p in parts if p)

    return ""


def _extract_confidence(data) -> float | None:
    if isinstance(data, dict):
        for key in ("confidence", "avg_confidence", "average_confidence", "score"):
            value = data.get(key)
            if isinstance(value, (int, float)):
                return round(float(value) * 100, 1) if value <= 1 else round(float(value), 1)
        for value in data.values():
            if isinstance(value, (dict, list)):
                found = _extract_confidence(value)
                if found is not None:
                    return found
    if isinstance(data, list):
        for value in data:
            found = _extract_confidence(value)
            if found is not None:
                return found
    return None


def ocr_single_page(image_bytes: bytes, filename: str) -> dict:
    """OCR one image. Always returns a dict with a `success` flag."""
    if not (MONLAM_API_KEY and MONLAM_BASE_URL):
        return {
            "success": False,
            "error": "MONLAM_API_KEY / MONLAM_BASE_URL are not configured on the server.",
        }

    url = f"{MONLAM_BASE_URL}/api/v1/ocr/single-page"

    try:
        response = httpx.post(
            url=url,
            headers={"X-API-Key": MONLAM_API_KEY},
            files={"file": (filename, image_bytes, _guess_mime(filename))},
            timeout=180,
        )
    except httpx.HTTPError as exc:
        return {"success": False, "error": f"Could not reach the OCR service: {exc}"}

    if response.status_code != 200:
        try:
            detail = response.json()
        except Exception:
            detail = response.text
        return {
            "success": False,
            "status_code": response.status_code,
            "error": detail,
        }

    data = response.json()
    text = _extract_ocr_text(data).strip()

    if not text:
        return {
            "success": False,
            "error": "OCR returned no readable text for this image.",
            "raw": data,
        }

    return {
        "success": True,
        "text": text,
        "confidence": _extract_confidence(data),
        "raw": data,
    }


def pdf_to_images(pdf_bytes: bytes, dpi: int = 200, max_pages: int = 10) -> list[bytes]:
    """Render PDF pages to PNG bytes. Requires PyMuPDF (pymupdf)."""
    try:
        import fitz  # PyMuPDF
    except ImportError as exc:
        raise RuntimeError(
            "PDF support requires PyMuPDF. Install it with: pip install pymupdf"
        ) from exc

    images = []
    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
        zoom = dpi / 72
        matrix = fitz.Matrix(zoom, zoom)
        for page in doc[:max_pages]:
            pix = page.get_pixmap(matrix=matrix)
            images.append(pix.tobytes("png"))
    return images


def ocr_document(file_bytes: bytes, filename: str) -> dict:
    """
    OCR an image OR a multi-page PDF.

    Returns: {success, text, pages, confidence, page_texts, errors}
    """
    is_pdf = (filename or "").lower().endswith(".pdf") or file_bytes[:4] == b"%PDF"

    if not is_pdf:
        result = ocr_single_page(file_bytes, filename)
        if not result.get("success"):
            return result
        return {
            "success": True,
            "text": result["text"],
            "pages": 1,
            "confidence": result.get("confidence"),
            "page_texts": [result["text"]],
            "errors": [],
        }

    try:
        images = pdf_to_images(file_bytes)
    except RuntimeError as exc:
        return {"success": False, "error": str(exc)}
    except Exception as exc:
        return {"success": False, "error": f"Could not read the PDF: {exc}"}

    if not images:
        return {"success": False, "error": "The PDF contained no pages."}

    page_texts, confidences, errors = [], [], []

    for index, image in enumerate(images, start=1):
        page = ocr_single_page(image, f"{filename or 'document'}-page-{index}.png")
        if page.get("success"):
            page_texts.append(page["text"])
            if page.get("confidence") is not None:
                confidences.append(page["confidence"])
        else:
            errors.append({"page": index, "error": page.get("error")})

    if not page_texts:
        return {
            "success": False,
            "error": "OCR failed for every page of this PDF.",
            "errors": errors,
        }

    return {
        "success": True,
        "text": "\n\n".join(page_texts),
        "pages": len(images),
        "confidence": round(sum(confidences) / len(confidences), 1) if confidences else None,
        "page_texts": page_texts,
        "errors": errors,
    }

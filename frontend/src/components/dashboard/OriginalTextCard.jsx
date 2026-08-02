import { useDocument } from "../../context/DocumentContext";
import OCRViewer from "../ocr/OCRViewer";

/**
 * OriginalTextCard
 * Thin wrapper that feeds the recognized OCR text into the premium
 * OCRViewer document reader.
 */
export default function OriginalTextCard() {
  const { document: doc } = useDocument();
  const text = doc?.originalText?.trim() || "";

  return <OCRViewer text={text} doc={doc} tibetan />;
}

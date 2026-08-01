import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { mockDocument } from "../data/mockData";
import { processDocumentStream } from "../lib/api";

const DocumentContext = createContext(null);

const CHAT_SUGGESTIONS = [
  "Summarize this document.",
  "Explain the difficult terms.",
  "What is the main topic?",
  "List any names, places or dates.",
];

const EMPTY_DOCUMENT = {
  id: null,
  fileName: "",
  fileSize: "",
  pages: 0,
  wordCount: 0,
  ocrConfidence: null,
  language: "Tibetan (Bod skad)",
  processingTime: null,
  originalText: "",
  translation: "",
  summary: "",
  keywords: [],
};

/** Normalize a backend document into the shape the UI components expect. */
function normalize(doc) {
  if (!doc) return null;
  return {
    ...EMPTY_DOCUMENT,
    ...doc,
    keywords: Array.isArray(doc.keywords) ? doc.keywords : [],
    chatSuggestions: CHAT_SUGGESTIONS,
    chatSeed: [
      {
        role: "assistant",
        text: `I've read "${doc.fileName}". Ask me anything about the text, its terminology, or its structure — my answers are grounded in this document.`,
      },
    ],
  };
}

export function DocumentProvider({ children }) {
  const [file, setFile] = useState(null);
  const [document, setDocument] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | processing | ready | error
  const [progress, setProgress] = useState({ stage: null, events: [] });
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  /** Select a file on the landing page (no network call yet). */
  const selectFile = useCallback((selected) => {
    setFile(selected);
    setError(null);
  }, []);

  /**
   * Run the real backend pipeline against the selected file.
   * `onEvent` lets the processing page mirror live progress.
   */
  const processFile = useCallback(async (targetFile, onEvent) => {
    const active = targetFile || file;
    if (!active) {
      setError("No file selected.");
      setStatus("error");
      return null;
    }

    setStatus("processing");
    setError(null);
    setIsDemo(false);
    setProgress({ stage: "upload", events: [] });

    try {
      const result = await processDocumentStream(active, (event) => {
        setProgress((prev) => ({
          stage: event.stage,
          events: [...prev.events, event],
        }));
        onEvent?.(event);
      });

      const normalized = normalize(result);
      setDocument(normalized);
      setStatus("ready");
      return normalized;
    } catch (err) {
      setError(err.message || "Processing failed.");
      setStatus("error");
      return null;
    }
  }, [file]);

  /** Load the bundled sample so the UI can be explored without a backend. */
  const loadDemoDocument = useCallback(() => {
    const demo = normalize({ ...mockDocument, id: null });
    setDocument(demo);
    setFile({ name: mockDocument.fileName, size: mockDocument.fileSize });
    setStatus("ready");
    setIsDemo(true);
    setError(null);
    return demo;
  }, []);

  /** Replace the current document (e.g. after picking one from history). */
  const setActiveDocument = useCallback((doc) => {
    const normalized = normalize(doc);
    setDocument(normalized);
    setStatus(normalized ? "ready" : "idle");
    setIsDemo(false);
    return normalized;
  }, []);

  const reset = useCallback(() => {
    setFile(null);
    setDocument(null);
    setStatus("idle");
    setProgress({ stage: null, events: [] });
    setError(null);
    setIsDemo(false);
  }, []);

  const value = useMemo(
    () => ({
      file,
      document,
      status,
      progress,
      error,
      isDemo,
      isProcessing: status === "processing",
      hasDocument: Boolean(document),
      selectFile,
      processFile,
      loadDemoDocument,
      setActiveDocument,
      reset,
    }),
    [
      file,
      document,
      status,
      progress,
      error,
      isDemo,
      selectFile,
      processFile,
      loadDemoDocument,
      setActiveDocument,
      reset,
    ]
  );

  return (
    <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>
  );
}

export function useDocument() {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error("useDocument must be used within DocumentProvider");
  return ctx;
}

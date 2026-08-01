/**
 * Single place where the frontend talks to the FastAPI backend.
 *
 * In dev, requests go to `/api/*` and Vite proxies them to the backend
 * (see vite.config.js), so there are no CORS surprises. Set
 * VITE_API_BASE_URL to point at a deployed backend instead.
 */

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(
  /\/$/,
  ""
);

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseError(response) {
  let detail = `Request failed with status ${response.status}`;
  try {
    const data = await response.json();
    if (typeof data?.detail === "string") detail = data.detail;
    else if (data?.detail) detail = JSON.stringify(data.detail);
    else if (data?.error) detail = JSON.stringify(data.error);
    else if (data?.message) detail = data.message;
  } catch {
    try {
      const text = await response.text();
      if (text) detail = text;
    } catch {
      /* keep the default */
    }
  }
  return new ApiError(detail, response.status);
}

async function request(path, { method = "GET", body, signal } = {}) {
  const isFormData = body instanceof FormData;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    signal,
    headers: isFormData || !body ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return null;
  return response.json();
}

/* ------------------------------------------------------------------ */
/* Health                                                              */
/* ------------------------------------------------------------------ */

export function getHealth(signal) {
  return request("/health", { signal });
}

/* ------------------------------------------------------------------ */
/* Document pipeline                                                   */
/* ------------------------------------------------------------------ */

/** Run the whole pipeline in one request. Returns the document object. */
export async function processDocument(file, signal) {
  const form = new FormData();
  form.append("file", file);
  const data = await request("/process", { method: "POST", body: form, signal });
  return data.document;
}

/**
 * Run the pipeline while streaming progress events.
 *
 * @param {File} file
 * @param {(event: {stage: string, status: string, [k: string]: any}) => void} onEvent
 * @returns {Promise<object>} the finished document
 */
export async function processDocumentStream(file, onEvent, signal) {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch(`${API_BASE}/process/stream`, {
    method: "POST",
    body: form,
    signal,
  });

  if (!response.ok) throw await parseError(response);
  if (!response.body) throw new ApiError("Streaming is not supported here.", 500);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let documentResult = null;
  let streamError = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const line = chunk.split("\n").find((l) => l.startsWith("data:"));
      if (!line) continue;

      let event;
      try {
        event = JSON.parse(line.slice(5).trim());
      } catch {
        continue;
      }

      onEvent?.(event);

      if (event.stage === "ready" && event.document) documentResult = event.document;
      if (event.status === "error" && event.stage === "error") streamError = event.error;
      if (event.stage === "ocr" && event.status === "error") streamError = event.error;
    }
  }

  if (documentResult) return documentResult;
  throw new ApiError(streamError || "Processing did not complete.", 502);
}

export function listDocuments(signal) {
  return request("/documents", { signal });
}

export function getDocument(id, signal) {
  return request(`/documents/${id}`, { signal });
}

export function deleteDocument(id) {
  return request(`/documents/${id}`, { method: "DELETE" });
}

/* ------------------------------------------------------------------ */
/* Individual capabilities                                             */
/* ------------------------------------------------------------------ */

export async function runOcr(file, signal) {
  const form = new FormData();
  form.append("file", file);
  return request("/ocr", { method: "POST", body: form, signal });
}

export async function translate(text, targetLanguage = "English", signal) {
  const data = await request("/translate", {
    method: "POST",
    body: { text, target_language: targetLanguage },
    signal,
  });
  return data.translation;
}

export async function summarize(text, signal) {
  const data = await request("/summarize", { method: "POST", body: { text }, signal });
  return data.summary;
}

export async function extractKeywords(text, translation = "", signal) {
  const data = await request("/keywords", {
    method: "POST",
    body: { text, translation },
    signal,
  });
  return data.keywords;
}

export async function sendChatMessage(
  { message, documentId, context = "", history = [] },
  signal
) {
  const data = await request("/chat", {
    method: "POST",
    body: {
      message,
      document_id: documentId ?? null,
      context,
      history: history.map(({ role, content }) => ({ role, content })),
    },
    signal,
  });
  return data.response;
}

export async function textToSpeech(text, voice = "lhasa_female", signal) {
  const data = await request("/text-to-speech", {
    method: "POST",
    body: { text, voice },
    signal,
  });

  if (data.audio_url) return data.audio_url;
  if (data.audio_base64) {
    return `data:${data.content_type || "audio/wav"};base64,${data.audio_base64}`;
  }
  throw new ApiError("No audio was returned.", 502);
}

export async function speechToText(file, signal) {
  const form = new FormData();
  form.append("file", file);
  const data = await request("/speech-to-text", { method: "POST", body: form, signal });
  return data.text;
}

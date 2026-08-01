import { AlertCircle, Bot, Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDocument } from "../../context/DocumentContext";
import { sendChatMessage } from "../../lib/api";

export default function ChatInterface() {
  const { document: doc, isDemo } = useDocument();
  const [messages, setMessages] = useState(doc?.chatSeed ?? []);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const history = messages.map((m) => ({
      role: m.role,
      content: m.text,
    }));

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setIsTyping(true);
    setError(null);

    try {
      const reply = await sendChatMessage({
        message: trimmed,
        documentId: doc?.id ?? null,
        // For the bundled demo there is no server-side document, so send the
        // text along with the request instead.
        context: doc?.id
          ? ""
          : [doc?.originalText, doc?.translation].filter(Boolean).join("\n\n"),
        history,
      });

      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      setError(err.message || "Could not reach the assistant.");
      setMessages((prev) => prev.slice(0, -1));
      setInput(trimmed);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-ink-800 bg-ink-900">
      <div className="flex items-center gap-2 border-b border-ink-800 px-5 py-3.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary-500 to-primary-700 text-white">
          <Sparkles size={13} />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink-50">
            Ask AI about this document
          </p>
          <p className="text-[11px] text-ink-500">
            {isDemo
              ? "Sample document — answers are grounded in the sample text"
              : "Answers are grounded in the uploaded document"}
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="max-h-96 space-y-4 overflow-y-auto px-5 py-5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                m.role === "user"
                  ? "bg-ink-700 text-ink-300"
                  : "bg-primary-950/60 text-primary-400 ring-1 ring-primary-800/50"
              }`}
            >
              {m.role === "user" ? <User size={13} /> : <Bot size={13} />}
            </span>
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "rounded-tr-sm bg-gradient-to-r from-primary-600 to-primary-500 text-white"
                  : "rounded-tl-sm bg-ink-800 text-ink-200"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-950/60 text-primary-400 ring-1 ring-primary-800/50">
              <Bot size={13} />
            </span>
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-ink-800 px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-500 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-500 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-500" />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-5 mb-3 flex items-start gap-2 rounded-lg border border-red-800/60 bg-red-950/30 px-3 py-2">
          <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
          <p className="text-xs leading-relaxed text-red-300">{error}</p>
        </div>
      )}

      {messages.length < 3 && doc?.chatSuggestions?.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-ink-800 px-5 py-3">
          {doc.chatSuggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={isTyping}
              className="rounded-full border border-ink-700 px-3 py-1.5 text-xs font-medium text-ink-300 transition-colors hover:border-primary-700 hover:bg-primary-950/30 hover:text-primary-400 disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-ink-800 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isTyping}
          placeholder="Ask a question about this document…"
          className="flex-1 rounded-lg border border-ink-700 bg-ink-800 px-3.5 py-2.5 text-sm text-ink-100 placeholder:text-ink-500 focus:border-primary-500 focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white transition-colors hover:from-primary-500 hover:to-primary-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

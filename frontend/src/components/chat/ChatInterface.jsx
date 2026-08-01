import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { useDocument } from "../../context/DocumentContext";

function mockReply(question, doc) {
  const q = question.toLowerCase();
  if (q.includes("summar")) {
    return `In short: this folio lays out the lam rim's three-scope framework, then opens with two topics that begin every version of the text — relying properly on a spiritual teacher, and reflecting on how rare and valuable a human rebirth is.`;
  }
  if (q.includes("difficult") || q.includes("word") || q.includes("term")) {
    return `A few terms worth flagging: "dal 'byor" (leisures and endowments) refers to the specific freedoms and conditions that make Dharma practice possible. "Thams cad mkhyen pa" is usually rendered "omniscience" and refers to a buddha's complete knowledge. "Skyes bu gsum" — the "three persons" — is the organizing device for the whole lam rim structure.`;
  }
  if (q.includes("main topic") || q.includes("about")) {
    return `The main topic is the structure of the graduated path (lam rim) to enlightenment, introduced through its three-scope framework and its first two shared preliminaries: reliance on a teacher, and the preciousness of human life.`;
  }
  if (q.includes("date")) {
    return `This folio doesn't contain any explicit dates — it's a doctrinal passage rather than a historical or biographical one. If you'd like, I can check adjacent folios for colophon dates or textual attribution.`;
  }
  return `Good question. Based on this folio, ${doc.fileName.replace(/[-_]/g, " ")}: the passage centers on the lam rim's opening structure — the three scopes, reliance on a teacher, and the value of human rebirth. Want me to go deeper on any one of those?`;
}

export default function ChatInterface() {
  const { document: doc } = useDocument();
  const [messages, setMessages] = useState(doc.chatSeed);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const send = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: mockReply(trimmed, doc) },
      ]);
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
      <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-3.5 dark:border-ink-800">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600 text-white">
          <Sparkles size={13} />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">
            Ask AI about this document
          </p>
          <p className="text-[11px] text-ink-400 dark:text-ink-500">
            Answers are grounded in the uploaded folio
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="max-h-96 space-y-4 overflow-y-auto px-5 py-5"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                m.role === "user"
                  ? "bg-ink-200 text-ink-600 dark:bg-ink-700 dark:text-ink-300"
                  : "bg-primary-100 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400"
              }`}
            >
              {m.role === "user" ? <User size={13} /> : <Bot size={13} />}
            </span>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "rounded-tr-sm bg-primary-600 text-white"
                  : "rounded-tl-sm bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400">
              <Bot size={13} />
            </span>
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-ink-100 px-4 py-3 dark:bg-ink-800">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400 [animation-delay:-0.3s] dark:bg-ink-500" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400 [animation-delay:-0.15s] dark:bg-ink-500" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400 dark:bg-ink-500" />
            </div>
          </div>
        )}
      </div>

      {messages.length < 3 && (
        <div className="flex flex-wrap gap-2 border-t border-ink-100 px-5 py-3 dark:border-ink-800">
          {doc.chatSuggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-ink-700 dark:text-ink-300 dark:hover:border-primary-700 dark:hover:bg-primary-950/30 dark:hover:text-primary-400"
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
        className="flex items-center gap-2 border-t border-ink-100 p-3 dark:border-ink-800"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this document…"
          className="flex-1 rounded-lg border border-ink-200 bg-ink-50 px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-primary-400 focus:bg-white focus:outline-none dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100 dark:placeholder:text-ink-500 dark:focus:bg-ink-900"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

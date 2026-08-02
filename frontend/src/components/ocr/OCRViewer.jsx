import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  blocksToMarkdown,
  blocksToText,
  buildInsights,
  cleanOcrText,
  detectDocumentType,
  parseBlocks,
} from "../../lib/documentParser";
import { baseName, downloadDocx, downloadMarkdown, downloadText } from "../../lib/download";
import { exportDocument } from "../../lib/export";
import AIInsightsPanel from "./AIInsightsPanel";
import DocumentHeader from "./DocumentHeader";
import DocumentRenderer from "./DocumentRenderer";
import SearchBar from "./SearchBar";
import Toolbar from "./Toolbar";

/**
 * A tiny stateful counter handed to the renderer so every search <mark/> gets a
 * stable sequential index during a single render pass.
 */
function useSearchCounter(query, activeIndex) {
  return useMemo(() => {
    let n = 0;
    return {
      activeIndex,
      next() {
        return n++;
      },
      reset() {
        n = 0;
      },
    };
  }, [query, activeIndex]);
}

/**
 * OCRViewer
 * ---------------------------------------------------------------------------
 * A premium AI document reader: structured rendering of OCR output, detected
 * document type, entity highlighting, difficult-word tooltips, in-document
 * search, reading mode, export menu and an AI Insights side panel.
 */
export default function OCRViewer({ text = "", doc = {}, tibetan = false }) {
  const [highlight, setHighlight] = useState(true);

  const [reading, setReading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeHit, setActiveHit] = useState(0);
  const [showInsights, setShowInsights] = useState(true);
  const bodyRef = useRef(null);

  const cleaned = useMemo(() => cleanOcrText(text), [text]);
  const blocks = useMemo(() => parseBlocks(text), [text]);
  const docType = useMemo(() => detectDocumentType(cleaned), [cleaned]);
  const insights = useMemo(() => buildInsights(cleaned, doc), [cleaned, doc]);
  const wordCount = useMemo(() => (cleaned ? cleaned.split(/\s+/).length : 0), [cleaned]);

  const counter = useSearchCounter(query, activeHit);
  counter.reset();

  /* ------------------------------------------------------------- search */

  const totalHits = useMemo(() => {
    if (!query.trim()) return 0;
    const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return (cleaned.match(new RegExp(escaped, "gi")) || []).length;
  }, [query, cleaned]);

  useEffect(() => setActiveHit(0), [query]);

  // Scroll the active match into view whenever it changes.
  useEffect(() => {
    if (!query.trim()) return;
    const node = bodyRef.current?.querySelector(`[data-search-hit="${activeHit}"]`);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeHit, query, highlight, reading]);

  const step = (delta) =>
    setActiveHit((i) => (totalHits ? (i + delta + totalHits) % totalHits : 0));

  // Ctrl/Cmd + F opens the in-document search instead of the browser's.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ------------------------------------------------------------- actions */

  const plain = useMemo(() => blocksToText(blocks), [blocks]);

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(plain);
  }, [plain]);

  const handleExport = useCallback(
    (format) => {
      const name = baseName(doc?.fileName || "document");
      if (format === "pdf") return exportDocument({ ...doc, originalText: cleaned });
      if (format === "txt") return downloadText(plain, `${name}.txt`);
      if (format === "md")
        return downloadMarkdown(blocksToMarkdown(blocks, doc?.fileName || name), `${name}.md`);
      if (format === "docx") return downloadDocx(blocks, `${name}.doc`, doc?.fileName || name);
    },
    [blocks, cleaned, doc, plain]
  );

  if (!cleaned) {

    return (
      <div className="rounded-2xl border border-ink-800 bg-ink-900/70 p-8 text-center">
        <p className="text-sm text-ink-400">No text was recognized in this document.</p>
      </div>
    );
  }

  const hasInsightsPanel = showInsights && !reading;

  return (
    <div className="space-y-4">
      <Toolbar
        onCopy={handleCopy}
        onExport={handleExport}
        onToggleSearch={() => setSearchOpen((v) => !v)}
        onToggleHighlight={() => setHighlight((v) => !v)}
        onToggleReading={() => setReading((v) => !v)}
        searchOpen={searchOpen}
        highlight={highlight}
        reading={reading}
      />


      {searchOpen && (
        <div className="animate-fade-up">
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            total={totalHits}
            activeIndex={activeHit}
            onPrev={() => step(-1)}
            onNext={() => step(1)}
            onClose={() => {
              setSearchOpen(false);
              setQuery("");
            }}
          />
        </div>
      )}

      <div
        className={`grid gap-5 ${
          hasInsightsPanel ? "grid-cols-1 xl:grid-cols-[minmax(0,1fr)_20rem]" : "grid-cols-1"
        }`}
      >
        {/* Document surface */}
        <div
          className={`relative overflow-hidden rounded-2xl border border-ink-800 bg-ink-900/70 shadow-xl shadow-black/25 backdrop-blur-sm transition-all ${
            reading ? "px-5 py-8 sm:px-10 sm:py-12" : "p-5 sm:p-7"
          }`}
        >
          {/* soft top light */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-60"
            style={{
              background:
                "radial-gradient(60% 100% at 50% 0%, rgba(99,102,241,0.10) 0%, transparent 70%)",
            }}
          />

          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <DocumentHeader
                  doc={doc}
                  docType={docType}
                  blockCount={blocks.length}
                  wordCount={wordCount}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowInsights((v) => !v)}
                title={showInsights ? "Hide AI Insights" : "Show AI Insights"}
                className="hidden shrink-0 rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-800 hover:text-primary-300 xl:block"
              >
                {showInsights ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
              </button>
            </div>

            <div ref={bodyRef} className="mt-6 scroll-smooth">
              <DocumentRenderer
                blocks={blocks}
                highlight={highlight}
                search={searchOpen ? query : ""}
                reading={reading}
                tibetan={tibetan}
                counter={counter}
              />
            </div>

            {reading && (
              <p className="mt-10 text-center text-[11px] uppercase tracking-[0.2em] text-ink-600">
                End of document
              </p>
            )}
          </div>
        </div>

        {/* Insights */}
        {hasInsightsPanel && (
          <div className="animate-fade-up xl:sticky xl:top-16 xl:max-h-[calc(100vh-5rem)] xl:overflow-y-auto xl:pr-1">
            <AIInsightsPanel insights={insights} keywords={doc?.keywords} />
          </div>
        )}
      </div>
    </div>
  );
}

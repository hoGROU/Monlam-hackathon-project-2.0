import { FileUp, Info } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatInterface from "../components/chat/ChatInterface";
import DocumentSidebar from "../components/dashboard/DocumentSidebar";
import DocumentTabs from "../components/dashboard/DocumentTabs";
import StatsSidebar from "../components/dashboard/StatsSidebar";
import { useDocument } from "../context/DocumentContext";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { document: doc, isDemo, hasDocument } = useDocument();

  // Landing directly on /dashboard with nothing loaded: go pick a file.
  useEffect(() => {
    if (!hasDocument) navigate("/", { replace: true });
  }, [hasDocument, navigate]);

  if (!doc) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-400">
            Results
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold text-ink-50 sm:text-3xl">
            Document Dashboard
          </h1>
        </div>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 rounded-xl border border-ink-800 bg-ink-900 px-4 py-2 text-sm font-medium text-ink-300 transition-colors hover:border-primary-700 hover:text-primary-400"
        >
          <FileUp size={15} /> New document
        </button>
      </div>

      {isDemo && (
        <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-gold-800/50 bg-gold-950/20 px-4 py-3">
          <Info size={16} className="mt-0.5 shrink-0 text-gold-400" />
          <p className="text-xs leading-relaxed text-gold-300">
            You're viewing a bundled sample document. Upload your own scan or PDF
            from the home page to run the real OCR, translation and summary
            pipeline.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)_260px]">
        <DocumentSidebar />

        <div className="min-w-0 space-y-8">
          <DocumentTabs />
          <ChatInterface />
        </div>

        <StatsSidebar />
      </div>
    </section>
  );
}

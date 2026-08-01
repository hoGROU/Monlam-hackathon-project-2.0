import { useEffect, useState } from "react";
import DocumentSidebar from "../components/dashboard/DocumentSidebar";
import StatsSidebar from "../components/dashboard/StatsSidebar";
import DocumentTabs from "../components/dashboard/DocumentTabs";
import ChatInterface from "../components/chat/ChatInterface";

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900 sm:p-8">
      <div className="skeleton h-4 w-32 rounded" />
      <div className="mt-6 space-y-3">
        <div className="skeleton h-3.5 w-full rounded" />
        <div className="skeleton h-3.5 w-11/12 rounded" />
        <div className="skeleton h-3.5 w-4/5 rounded" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 550);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600 dark:text-primary-400">
          Results
        </p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold text-ink-900 dark:text-ink-50 sm:text-3xl">
          Document Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)_260px]">
        <DocumentSidebar />

        <div className="min-w-0 space-y-8">
          {isLoading ? (
            <div className="space-y-8">
              <div className="skeleton h-11 w-full rounded-xl" />
              <CardSkeleton />
            </div>
          ) : (
            <>
              <DocumentTabs />
              <ChatInterface />
            </>
          )}
        </div>

        <StatsSidebar />
      </div>
    </section>
  );
}

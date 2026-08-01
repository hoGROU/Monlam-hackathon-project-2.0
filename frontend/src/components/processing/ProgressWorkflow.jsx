import { Check, Loader2 } from "lucide-react";
import { processingSteps } from "../../data/mockData";

export default function ProgressWorkflow({ activeIndex }) {
  return (
    <div className="mx-auto max-w-3xl">
      {/* Step rail */}
      <div className="flex items-start justify-between">
        {processingSteps.map((step, i) => {
          const isDone = i < activeIndex;
          const isActive = i === activeIndex;
          return (
            <div key={step.key} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <div className="flex-1">
                  {i !== 0 && (
                    <div
                      className={`h-0.5 w-full transition-colors duration-500 ${
                        isDone || isActive
                          ? "bg-primary-500"
                          : "bg-ink-800"
                      }`}
                    />
                  )}
                </div>
                <div
                  className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300 ${
                    isDone
                      ? "border-success-500 bg-success-500 text-white"
                      : isActive
                      ? "border-primary-500 bg-primary-600 text-white shadow-lg shadow-primary-600/30"
                      : "border-ink-700 bg-ink-900 text-ink-600"
                  }`}
                >
                  {isDone ? (
                    <Check size={16} />
                  ) : isActive ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    i + 1
                  )}
                </div>
                <div className="flex-1">
                  {i !== processingSteps.length - 1 && (
                    <div
                      className={`h-0.5 w-full transition-colors duration-500 ${
                        isDone
                          ? "bg-primary-500"
                          : "bg-ink-800"
                      }`}
                    />
                  )}
                </div>
              </div>
              <span
                className={`mt-2.5 text-center text-xs font-medium sm:text-sm ${
                  isActive
                    ? "text-primary-400"
                    : isDone
                    ? "text-ink-200"
                    : "text-ink-600"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

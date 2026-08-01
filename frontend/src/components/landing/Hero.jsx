import { Sparkles, UploadCloud } from "lucide-react";
import ManuscriptScan from "./ManuscriptScan";

export default function Hero() {
  // Send the user to the upload area instead of straight to /processing -
  // there is no file to process yet at this point.
  const goToUpload = () => {
    document
      .getElementById("upload")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-24">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-800/70 bg-primary-950/40 px-3 py-1 text-xs font-medium text-primary-400">
            <Sparkles size={12} />
            OCR + Translation, purpose-built for classical Tibetan
          </span>

          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink-50 sm:text-5xl lg:text-[3.25rem]">
            Tibetan Research
            <span className="bg-gradient-to-r from-primary-400 via-gold-400 to-primary-400 bg-clip-text text-transparent">
              {" "}Assistant
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-400">
            Upload Tibetan documents and understand them instantly using AI.
            From scanned pecha folios to modern printed text — read, translate,
            and question your sources in one place.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={goToUpload}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/30 transition-all hover:from-primary-500 hover:to-primary-400 hover:shadow-primary-500/40 active:scale-[0.98]"
            >
              <UploadCloud
                size={18}
                className="transition-transform group-hover:-translate-y-0.5"
              />
              Upload a Document
            </button>
            <span className="text-xs font-medium text-ink-500">
              PDF, JPG, PNG · No sign-up required for this demo
            </span>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-ink-800 pt-6">
            <div>
              <dt className="font-mono text-2xl font-semibold text-ink-50">
                96%
              </dt>
              <dd className="text-xs text-ink-500">
                avg. OCR confidence
              </dd>
            </div>
            <div>
              <dt className="font-mono text-2xl font-semibold text-ink-50">
                2
              </dt>
              <dd className="text-xs text-ink-500">
                scripts: u-chen, u-med
              </dd>
            </div>
            <div>
              <dt className="font-mono text-2xl font-semibold text-ink-50">
                {"<20s"}
              </dt>
              <dd className="text-xs text-ink-500">
                per folio, end to end
              </dd>
            </div>
          </dl>
        </div>

        <div
          className="animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          <ManuscriptScan />
        </div>
      </div>
    </section>
  );
}
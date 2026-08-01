const lines = [
  { tibetan: "བྱང་ཆུབ་ལམ་གྱི་རིམ་པ་", en: "The stages of the path" },
  { tibetan: "སྐྱེས་བུ་གསུམ་གྱི་ལམ་", en: "the paths of three persons" },
  { tibetan: "བླ་མ་བསྟེན་པའི་ཚུལ་", en: "reliance on the teacher" },
  { tibetan: "དལ་འབྱོར་རྙེད་དཀའ་བ་", en: "leisures hard to find" },
  { tibetan: "ཐར་པ་དང་མཁྱེན་པ་", en: "liberation and omniscience" },
];

export default function ManuscriptScan() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary-900/30 via-transparent to-gold-900/20 blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border border-ink-800 bg-ink-900 shadow-xl shadow-ink-950/50">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-ink-800 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-ink-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-700" />
          <span className="ml-2 font-mono text-[11px] text-ink-500">
            folio-12.pdf — OCR pass
          </span>
        </div>

        {/* scan area */}
        <div className="relative space-y-4 p-6">
          {lines.map((line, i) => (
            <div key={i} className="space-y-1">
              <p
                className="text-lg leading-relaxed text-ink-100"
                style={{ fontFamily: "Noto Sans Tibetan, serif" }}
              >
                {line.tibetan}
              </p>
              <p className="font-mono text-xs text-primary-400">
                {line.en}
              </p>
            </div>
          ))}

          {/* scanning beam */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-16 animate-scan bg-gradient-to-b from-transparent via-gold-500/20 to-transparent"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-6 top-0 h-px animate-scan bg-gold-400 shadow-[0_0_12px_2px_rgba(251,191,36,0.4)]"
            aria-hidden="true"
          />
        </div>

        <div className="flex items-center justify-between border-t border-ink-800 px-4 py-3">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-success-500">
            <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
            96.4% confidence
          </span>
          <span className="font-mono text-[11px] text-ink-500">
            u-chen script detected
          </span>
        </div>
      </div>
    </div>
  );
}
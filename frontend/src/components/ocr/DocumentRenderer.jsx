import { Check, Copy } from "lucide-react";
import { useState } from "react";
import KeywordHighlights from "./KeywordHighlights";

/** Small hover-reveal "copy this block" affordance. */
function CopyBlock({ value }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }}
      title="Copy this section"
      className="absolute -right-1 top-0 rounded-md p-1.5 text-ink-500 opacity-0 transition-all hover:bg-ink-800 hover:text-primary-300 focus:opacity-100 group-hover:opacity-100"
    >
      {done ? <Check size={13} className="text-success-500" /> : <Copy size={13} />}
    </button>
  );
}

function Block({ block, ctx }) {
  const { reading, tibetan } = ctx;
  const rich = (text, extra = "") => (
    <KeywordHighlights
      text={text}
      highlight={ctx.highlight}
      search={ctx.search}
      searchOffsetRef={ctx.counter}
      className={extra}
    />
  );

  const bodyFont = tibetan
    ? { fontFamily: "'Noto Sans Tibetan', serif" }
    : undefined;
  const bodySize = reading
    ? "text-[1.15rem] leading-[2.05] sm:text-[1.22rem]"
    : "text-[0.975rem] leading-[1.9] sm:text-base";

  switch (block.type) {
    case "heading":
      return block.level === 2 ? (
        <h2
          className={`font-display font-bold tracking-tight text-ink-50 ${
            reading ? "text-2xl sm:text-[1.7rem]" : "text-xl sm:text-2xl"
          }`}
          style={bodyFont}
        >
          {rich(block.text)}
        </h2>
      ) : (
        <h3
          className={`font-display font-semibold tracking-tight text-ink-100 ${
            reading ? "text-xl" : "text-lg"
          }`}
          style={bodyFont}
        >
          {rich(block.text)}
        </h3>
      );

    case "field":
      return (
        <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
          <span className="shrink-0 font-semibold text-ink-300 sm:min-w-[7.5rem]">
            {block.label}:
          </span>
          <span className={`text-ink-100 ${bodySize}`} style={bodyFont}>
            {rich(block.value)}
          </span>
        </div>
      );

    case "salutation":
      return (
        <p className={`font-medium text-ink-100 ${bodySize}`} style={bodyFont}>
          {rich(block.text)}
        </p>
      );

    case "signoff":
      return (
        <p className={`font-medium italic text-ink-200 ${bodySize}`} style={bodyFont}>
          {rich(block.text)}
        </p>
      );

    case "address":
      return (
        <div className={`whitespace-pre-line text-ink-200 ${bodySize}`} style={bodyFont}>
          {block.text.split("\n").map((line, i) => (
            <div key={i}>{rich(line)}</div>
          ))}
        </div>
      );

    case "list":
      return block.ordered ? (
        <ol className={`ml-5 list-decimal space-y-2 text-ink-100 marker:text-primary-400 ${bodySize}`}>
          {block.items.map((it, i) => (
            <li key={i} className="pl-1" style={bodyFont}>
              {rich(it)}
            </li>
          ))}
        </ol>
      ) : (
        <ul className={`ml-5 list-disc space-y-2 text-ink-100 marker:text-primary-400 ${bodySize}`}>
          {block.items.map((it, i) => (
            <li key={i} className="pl-1" style={bodyFont}>
              {rich(it)}
            </li>
          ))}
        </ul>
      );

    case "table":
      return (
        <div className="-mx-1 overflow-x-auto rounded-xl border border-ink-800">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-ink-850/80">
                {block.head.map((c, i) => (
                  <th
                    key={i}
                    className="border-b border-ink-800 px-3 py-2.5 text-left font-semibold text-ink-200"
                  >
                    {rich(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="odd:bg-ink-900/40">
                  {row.map((c, i) => (
                    <td key={i} className="border-b border-ink-800/60 px-3 py-2.5 text-ink-200">
                      {rich(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return (
        <p className={`text-ink-100 ${bodySize}`} style={bodyFont}>
          {rich(block.text)}
        </p>
      );
  }
}

/** Plain text of a block, for the per-section copy button. */
function blockText(b) {
  if (b.type === "field") return `${b.label}: ${b.value}`;
  if (b.type === "list") return b.items.map((i) => `• ${i}`).join("\n");
  if (b.type === "table") return [b.head, ...b.rows].map((r) => r.join("\t")).join("\n");
  return b.text || "";
}

/**
 * DocumentRenderer
 * Renders structured blocks as a faithful, readable reconstruction of the
 * original document layout.
 */
export default function DocumentRenderer({
  blocks = [],
  highlight = true,
  search = "",
  reading = false,
  tibetan = false,
  counter,
}) {
  const ctx = { highlight, search, reading, tibetan, counter };

  if (!blocks.length) {
    return <p className="text-sm italic text-ink-500">No text was recognized in this document.</p>;
  }

  return (
    <article
      className={`mx-auto ${reading ? "max-w-[42rem]" : "max-w-none"}`}
      style={{ scrollBehavior: "smooth" }}
    >
      <div className={reading ? "space-y-7" : "space-y-5"}>
        {blocks.map((block) => (
          <div key={block.id} className="group relative pr-7">
            <Block block={block} ctx={ctx} />
            <CopyBlock value={blockText(block)} />
          </div>
        ))}
      </div>
    </article>
  );
}

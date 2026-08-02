import { findDifficultWords, findEntities } from "../../lib/documentParser";
import DifficultWordTooltip from "./DifficultWordTooltip";

/** Subtle chip styles per entity kind — deliberately low-contrast. */
const CHIP = {
  date: "bg-primary-500/12 text-primary-200 ring-primary-500/25",
  person: "bg-gold-500/12 text-gold-200 ring-gold-500/25",
  org: "bg-emerald-500/12 text-emerald-200 ring-emerald-500/25",
  location: "bg-sky-500/12 text-sky-200 ring-sky-500/25",
  amount: "bg-amber-500/14 text-amber-200 ring-amber-500/30",
  deadline: "bg-rose-500/14 text-rose-200 ring-rose-500/30",
};

const LINKABLE = new Set(["email", "phone", "url"]);

function linkFor(kind, text) {
  if (kind === "email") return `mailto:${text}`;
  if (kind === "phone") return `tel:${text.replace(/[^\d+]/g, "")}`;
  return text.startsWith("http") ? text : `https://${text}`;
}

/**
 * Merge entity, difficult-word and search matches into a single non-overlapping,
 * position-ordered list.
 */
function buildMarks(text, { highlight, search }) {
  const marks = [];

  if (highlight) {
    findEntities(text).forEach((e) => marks.push({ ...e, priority: 2 }));
    findDifficultWords(text).forEach((d) => marks.push({ ...d, priority: 1 }));
  }

  if (search?.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(escaped, "gi");
    let m;
    while ((m = re.exec(text)) !== null) {
      marks.push({
        start: m.index,
        end: m.index + m[0].length,
        kind: "search",
        text: m[0],
        priority: 0, // search always wins
      });
      if (m.index === re.lastIndex) re.lastIndex += 1;
    }
  }

  marks.sort((a, b) => a.start - b.start || a.priority - b.priority);
  const clean = [];
  let cursor = 0;
  marks.forEach((mk) => {
    if (mk.start >= cursor) {
      clean.push(mk);
      cursor = mk.end;
    }
  });
  return clean;
}

/**
 * KeywordHighlights (RichText)
 * Renders a string with clickable contacts, subtle entity chips, dotted
 * "difficult word" tooltips and search-match highlighting.
 */
export default function KeywordHighlights({
  text = "",
  highlight = true,
  search = "",
  searchOffsetRef,
  className = "",
}) {
  const marks = buildMarks(text, { highlight, search });
  if (!marks.length) return <span className={className}>{text}</span>;

  const nodes = [];
  let cursor = 0;

  marks.forEach((mk, i) => {
    if (mk.start > cursor) nodes.push(text.slice(cursor, mk.start));
    const value = text.slice(mk.start, mk.end);

    if (mk.kind === "search") {
      const index = searchOffsetRef ? searchOffsetRef.next() : null;
      nodes.push(
        <mark
          key={`s-${i}`}
          data-search-hit={index ?? undefined}
          className={`rounded px-0.5 ${
            index !== null && index === searchOffsetRef?.activeIndex
              ? "bg-gold-400 text-ink-950 ring-2 ring-gold-300"
              : "bg-gold-500/35 text-ink-50"
          }`}
        >
          {value}
        </mark>
      );
    } else if (mk.kind === "difficult") {
      nodes.push(<DifficultWordTooltip key={`d-${i}`} word={value} entry={mk.entry} />);
    } else if (LINKABLE.has(mk.kind)) {
      nodes.push(
        <a
          key={`l-${i}`}
          href={linkFor(mk.kind, value)}
          target={mk.kind === "url" ? "_blank" : undefined}
          rel="noreferrer"
          className="font-medium text-primary-300 underline decoration-primary-600/50 underline-offset-2 transition-colors hover:text-primary-200"
        >
          {value}
        </a>
      );
    } else {
      nodes.push(
        <span
          key={`e-${i}`}
          title={mk.label}
          className={`rounded px-1 py-0.5 font-medium ring-1 ${CHIP[mk.kind] || ""}`}
        >
          {value}
        </span>
      );
    }
    cursor = mk.end;
  });

  if (cursor < text.length) nodes.push(text.slice(cursor));

  return <span className={className}>{nodes}</span>;
}

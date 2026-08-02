/**
 * documentParser
 * ---------------------------------------------------------------------------
 * A formatting layer that turns a flat OCR text dump into structured blocks the
 * viewer can render as a real document: headings, paragraphs, lists, key/value
 * lines (Subject, Date, To), signature blocks and tables.
 *
 * It never rewrites words — it only repairs whitespace/line-wrapping artefacts
 * and classifies structure, so the meaning of the OCR output is preserved.
 */

/* ------------------------------------------------------------------ cleanup */

/** Characters OCR engines commonly mangle in otherwise clean Latin text. */
const OCR_FIXES = [
  [/\u00a0/g, " "], // nbsp
  [/[’‘]/g, "'"],
  [/[“”]/g, '"'],
  [/\s+([,.;:!?])/g, "$1"], // space before punctuation
  [/([,;:])(?=\S)/g, "$1 "], // missing space after punctuation
  [/\.{4,}/g, "..."],
  [/-{3,}/g, "———"],
  [/[ \t]{2,}/g, " "],
];

/**
 * Repair wrapped lines: OCR emits a newline at every visual line break, which
 * shreds paragraphs. We re-join a line with the next one when it clearly
 * continues mid-sentence.
 */
function unwrapLines(lines) {
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const prev = out[out.length - 1];

    if (
      prev !== undefined &&
      prev.trim() !== "" &&
      line.trim() !== "" &&
      // previous line does not end a sentence / list item
      !/[.!?:;•)]$/.test(prev.trim()) &&
      // previous line is long enough to be a wrapped body line
      prev.trim().length > 45 &&
      // current line starts like a continuation
      /^[a-z\u0F00-\u0FFF(]/.test(line.trim()) &&
      !isListItem(line) &&
      !isKeyValue(line)
    ) {
      // hyphenated word split across lines
      out[out.length - 1] = /\u2010|-$/.test(prev.trim())
        ? prev.trim().replace(/-$/, "") + line.trim()
        : `${prev.trim()} ${line.trim()}`;
    } else {
      out.push(line);
    }
  }
  return out;
}

/** Normalise raw OCR text without altering wording. */
export function cleanOcrText(raw = "") {
  let text = String(raw).replace(/\r\n?/g, "\n");
  OCR_FIXES.forEach(([pattern, replacement]) => {
    text = text.replace(pattern, replacement);
  });
  const lines = unwrapLines(text.split("\n").map((l) => l.replace(/[ \t]+$/g, "")));
  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* ------------------------------------------------------- line classification */

const BULLET_RE = /^\s*([-•*·–—]|\u25cf|\u25aa)\s+(.*)$/;
const NUMBER_RE = /^\s*(\d{1,2}|[ivxlIVXL]{1,5}|[a-zA-Z])[.)]\s+(.+)$/;
const KEYVALUE_RE =
  /^\s*(Subject|Sub|Re|Ref|Reference|Date|To|From|Name|Address|Phone|Mobile|Tel|Email|E-mail|Website|Regarding|Attn|Attention|Invoice No|Invoice Number|Roll No|Class|Department|Designation|Position|Amount|Total|Due Date|Deadline|Place)\s*[:\-–]\s*(.*)$/i;
const SIGNOFF_RE =
  /^\s*(Yours (faithfully|sincerely|truly|obediently)|Sincerely|Regards|Best regards|Warm regards|Thanking you|Thank you|Respectfully|Faithfully yours)\b[,.]?\s*$/i;
const SALUTATION_RE =
  /^\s*(Respected\s+\w+|Dear\s+[\w\s.]+|To whom it may concern|Sir|Madam|Sir\/Madam)\b[,.]?\s*$/i;

function isListItem(line) {
  return BULLET_RE.test(line) || NUMBER_RE.test(line);
}

function isKeyValue(line) {
  return KEYVALUE_RE.test(line);
}

/** A short, title-cased or upper-cased line with no terminal punctuation. */
function isHeading(line, index, allLines) {
  const t = line.trim();
  if (!t || t.length > 90) return false;
  if (/[.,;]$/.test(t)) return false;
  if (isListItem(t) || isKeyValue(t) || SIGNOFF_RE.test(t)) return false;

  const words = t.split(/\s+/);
  const isAllCaps = /^[^a-z]*[A-Z][^a-z]*$/.test(t) && /[A-Z]{2,}/.test(t);
  const isTitleCase =
    words.length <= 10 &&
    words.filter((w) => /^[A-Z\u0F00-\u0FFF]/.test(w)).length >= Math.ceil(words.length * 0.6);
  const followedByBody = allLines[index + 1]?.trim().length > 0;

  return (isAllCaps || (isTitleCase && words.length >= 2)) && (followedByBody || isAllCaps);
}

/** Rough table detection: 2+ consecutive lines with aligned separators. */
function looksLikeTableRow(line) {
  const t = line.trim();
  if (!t) return false;
  const pipes = (t.match(/\|/g) || []).length;
  const tabs = (t.match(/\t/g) || []).length;
  const wideGaps = (t.match(/ {3,}/g) || []).length;
  return pipes >= 2 || tabs >= 1 || wideGaps >= 2;
}

function splitRow(line) {
  const t = line.trim().replace(/^\||\|$/g, "");
  if (t.includes("|")) return t.split("|").map((c) => c.trim());
  if (t.includes("\t")) return t.split("\t").map((c) => c.trim());
  return t.split(/ {3,}/).map((c) => c.trim());
}

/* ------------------------------------------------------------ block builder */

let blockId = 0;
const nextId = () => `blk-${(blockId += 1)}`;

/**
 * Parse cleaned text into an ordered list of typed blocks.
 * @returns {Array<{id:string,type:string,...}>}
 */
export function parseBlocks(text = "") {
  blockId = 0;
  const clean = cleanOcrText(text);
  if (!clean) return [];

  const lines = clean.split("\n");
  const blocks = [];
  let paragraph = [];
  let list = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ id: nextId(), type: "paragraph", text: paragraph.join(" ").trim() });
    paragraph = [];
  };
  const flushList = () => {
    if (!list) return;
    blocks.push({ id: nextId(), ...list });
    list = null;
  };
  const flushAll = () => {
    flushParagraph();
    flushList();
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const t = line.trim();

    if (!t) {
      flushAll();
      continue;
    }

    /* Tables — collect the run of consecutive table-ish lines. */
    if (looksLikeTableRow(line) && looksLikeTableRow(lines[i + 1] || "")) {
      flushAll();
      const rows = [];
      while (i < lines.length && looksLikeTableRow(lines[i])) {
        const cells = splitRow(lines[i]);
        if (!/^[-—|: ]+$/.test(lines[i].trim())) rows.push(cells);
        i += 1;
      }
      i -= 1;
      const width = Math.max(...rows.map((r) => r.length));
      blocks.push({
        id: nextId(),
        type: "table",
        head: rows[0].concat(Array(width - rows[0].length).fill("")),
        rows: rows.slice(1).map((r) => r.concat(Array(width - r.length).fill(""))),
      });
      continue;
    }

    /* Key/value lines: Subject:, Date:, Email: … */
    const kv = t.match(KEYVALUE_RE);
    if (kv) {
      flushAll();
      blocks.push({ id: nextId(), type: "field", label: kv[1], value: kv[2].trim() });
      continue;
    }

    /* Sign-off / salutation */
    if (SIGNOFF_RE.test(t)) {
      flushAll();
      blocks.push({ id: nextId(), type: "signoff", text: t });
      continue;
    }
    if (SALUTATION_RE.test(t)) {
      flushAll();
      blocks.push({ id: nextId(), type: "salutation", text: t });
      continue;
    }

    /* Lists */
    const bullet = t.match(BULLET_RE);
    const numbered = t.match(NUMBER_RE);
    if (bullet || numbered) {
      flushParagraph();
      const ordered = Boolean(numbered);
      const item = (bullet ? bullet[2] : numbered[2]).trim();
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { type: "list", ordered, items: [] };
      }
      list.items.push(item);
      continue;
    }
    flushList();

    /* Headings */
    if (isHeading(t, i, lines)) {
      flushAll();
      const level = /^[^a-z]*$/.test(t) && t.length < 60 ? 2 : 3;
      blocks.push({ id: nextId(), type: "heading", level, text: t });
      continue;
    }

    /* Address-ish short lines clustered together (To, / recipient block) */
    paragraph.push(t);

    // A short line that ends a visual block should not glue onto the next one.
    if (t.length < 45 && /[.!?]$/.test(t) === false && (lines[i + 1] || "").trim().length < 45) {
      blocks.push({ id: nextId(), type: "address", text: paragraph.join("\n") });
      paragraph = [];
    }
  }

  flushAll();
  return blocks;
}

/* --------------------------------------------------------- type detection */

const DOC_TYPES = [
  {
    type: "Application",
    icon: "📄",
    match: /\b(leave application|application for|i (hereby )?request|kindly grant|humbly (request|submit))\b/i,
    weight: 3,
  },
  {
    type: "Official Letter",
    icon: "✉️",
    match: /\b(yours (faithfully|sincerely)|respected sir|to whom it may concern|subject\s*:)\b/i,
    weight: 2,
  },
  {
    type: "Resume",
    icon: "🧑‍💼",
    match: /\b(curriculum vitae|work experience|professional summary|education|skills|references available)\b/i,
    weight: 3,
  },
  {
    type: "Research Paper",
    icon: "🔬",
    match: /\b(abstract|methodology|literature review|references|hypothesis|et al\.|doi:)\b/i,
    weight: 3,
  },
  {
    type: "Invoice",
    icon: "🧾",
    match: /\b(invoice|bill to|amount due|subtotal|tax|gst|total due|payment terms)\b/i,
    weight: 3,
  },
  {
    type: "Certificate",
    icon: "🏅",
    match: /\b(this is to certify|certificate of|has successfully completed|awarded to)\b/i,
    weight: 3,
  },
  {
    type: "Notice",
    icon: "📢",
    match: /\b(notice|hereby informed|all (students|employees|members) are|circular)\b/i,
    weight: 2,
  },
  {
    type: "News Article",
    icon: "📰",
    match: /\b(reported|correspondent|according to sources|press trust|reuters|agency)\b/i,
    weight: 2,
  },
  {
    type: "Form",
    icon: "📝",
    match: /\b(please fill|tick the|signature of applicant|form no|declaration)\b/i,
    weight: 2,
  },
  {
    type: "Identity Document",
    icon: "🪪",
    match: /\b(date of birth|passport no|identity card|nationality|issued on|holder)\b/i,
    weight: 2,
  },
  {
    type: "Book Page",
    icon: "📖",
    match: /\b(chapter\s+[ivxl\d]+|verse|volume\s+\d+)\b/i,
    weight: 2,
  },
  {
    type: "Buddhist Text",
    icon: "☸️",
    match: /[\u0F00-\u0FFF]{20,}/,
    weight: 2,
  },
];

/** Detect the most likely document type from its text. */
export function detectDocumentType(text = "") {
  const scores = DOC_TYPES.map((d) => {
    const hits = (text.match(new RegExp(d.match.source, d.match.flags.replace("g", "") + "g")) || [])
      .length;
    return { ...d, score: hits * d.weight };
  })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!scores.length) return { type: "Document", icon: "📄", confidence: "low" };
  const [best, second] = scores;
  return {
    type: best.type,
    icon: best.icon,
    confidence: !second || best.score >= second.score * 2 ? "high" : "medium",
  };
}

/* ------------------------------------------------------- entity extraction */

const MONTHS =
  "January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec";

export const ENTITY_PATTERNS = [
  {
    kind: "email",
    label: "Email",
    regex: /\b[\w.+-]+@[\w-]+\.[\w.]{2,}\b/g,
  },
  {
    kind: "url",
    label: "Website",
    regex: /\b(?:https?:\/\/|www\.)[\w-]+(?:\.[\w-]+)+(?:\/\S*)?/g,
  },
  {
    kind: "phone",
    label: "Phone",
    regex: /(?:\+\d{1,3}[\s-]?)?(?:\(\d{2,4}\)[\s-]?)?\d{3,5}[\s-]?\d{3,5}(?:[\s-]?\d{2,4})?/g,
    validate: (m) => m.replace(/\D/g, "").length >= 8 && m.replace(/\D/g, "").length <= 15,
  },
  {
    kind: "date",
    label: "Date",
    regex: new RegExp(
      `\\b(?:\\d{1,2}(?:st|nd|rd|th)?\\s+(?:${MONTHS})\\s+\\d{2,4}|(?:${MONTHS})\\s+\\d{1,2},?\\s+\\d{2,4}|\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}|\\d{4}-\\d{2}-\\d{2})\\b`,
      "gi"
    ),
  },
  {
    kind: "amount",
    label: "Amount",
    regex: /(?:[₹$€£¥]\s?\d[\d,]*(?:\.\d{1,2})?|\b(?:Rs\.?|INR|USD|EUR)\s?\d[\d,]*(?:\.\d{1,2})?)/gi,
  },
  {
    kind: "deadline",
    label: "Deadline",
    regex:
      /\b(?:due (?:on|by|date)|deadline|last date|no later than|on or before|expires? on)\b[^.\n]{0,45}/gi,
  },
  {
    kind: "org",
    label: "Organization",
    regex:
      /\b[A-Z][\w&.'-]*(?:\s+[A-Z][\w&.'-]*)*\s+(?:School|College|University|Institute|Hospital|Department|Ministry|Company|Ltd\.?|Limited|Pvt\.?|Corporation|Foundation|Society|Trust|Monastery|Academy|Bank)\b/g,
  },
  {
    kind: "location",
    label: "Location",
    regex:
      /\b(?:Dharamshala|Delhi|New Delhi|Mumbai|Bangalore|Kolkata|Chennai|Lhasa|Kathmandu|Bylakuppe|Mundgod|Sikkim|Ladakh|Tibet|India|Nepal|Bhutan|Shimla|Mcleod Ganj)\b/g,
  },
  {
    kind: "person",
    label: "Name",
    regex:
      /\b(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Prof\.?|Shri|Smt\.?|Ven\.?)\s+[A-Z][\w'-]+(?:\s+[A-Z][\w'-]+){0,2}\b/g,
  },
];

/**
 * Find all entity matches in a string.
 * @returns {Array<{start:number,end:number,kind:string,label:string,text:string}>}
 */
export function findEntities(text = "") {
  const found = [];
  ENTITY_PATTERNS.forEach(({ kind, label, regex, validate }) => {
    const re = new RegExp(regex.source, regex.flags);
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m[0].trim().length < 2) continue;
      if (validate && !validate(m[0])) continue;
      found.push({ start: m.index, end: m.index + m[0].length, kind, label, text: m[0] });
      if (m.index === re.lastIndex) re.lastIndex += 1;
    }
  });

  // Resolve overlaps — keep the longest match at each position.
  found.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
  const result = [];
  let cursor = -1;
  found.forEach((e) => {
    if (e.start >= cursor) {
      result.push(e);
      cursor = e.end;
    }
  });
  return result;
}

/* --------------------------------------------------------- difficult words */

/**
 * A compact glossary of formal/administrative vocabulary that commonly appears
 * in official documents and trips readers up.
 */
export const GLOSSARY = {
  jurisdiction: {
    meaning: "The official authority to make legal decisions and judgements.",
    simple: "The area or subject a court or office is allowed to decide on.",
    pronunciation: "jur-is-DIC-shun",
  },
  affidavit: {
    meaning: "A written statement confirmed by oath, for use as evidence.",
    simple: "A signed promise that what you wrote is true.",
    pronunciation: "af-i-DAY-vit",
  },
  hereby: {
    meaning: "By this document or declaration.",
    simple: "With this letter, right now.",
    pronunciation: "heer-BY",
  },
  henceforth: {
    meaning: "From this time onward.",
    simple: "Starting now.",
    pronunciation: "HENS-forth",
  },
  aforementioned: {
    meaning: "Mentioned or named earlier in the same document.",
    simple: "The thing already mentioned above.",
    pronunciation: "uh-FOR-men-shund",
  },
  stipulated: {
    meaning: "Demanded or specified as part of an agreement.",
    simple: "Clearly stated as a requirement.",
    pronunciation: "STIP-yoo-lay-ted",
  },
  remuneration: {
    meaning: "Money paid for work or a service.",
    simple: "Payment or salary.",
    pronunciation: "ri-myoo-nuh-RAY-shun",
  },
  discrepancy: {
    meaning: "A difference between two things that should match.",
    simple: "A mismatch or inconsistency.",
    pronunciation: "dis-KREP-un-see",
  },
  compliance: {
    meaning: "The act of following a rule, order or request.",
    simple: "Doing what the rules require.",
    pronunciation: "kum-PLY-uns",
  },
  provisional: {
    meaning: "Arranged for the present, possibly to be changed later.",
    simple: "Temporary, not final.",
    pronunciation: "pruh-VIZH-uh-nul",
  },
  endorsement: {
    meaning: "An official act of support or approval.",
    simple: "A formal 'yes, I approve'.",
    pronunciation: "en-DORS-munt",
  },
  reimbursement: {
    meaning: "Repayment of money that someone has already spent.",
    simple: "Getting your money back.",
    pronunciation: "ree-im-BURS-munt",
  },
  prerequisite: {
    meaning: "Something required before something else can happen.",
    simple: "A thing you need first.",
    pronunciation: "pree-REK-wi-zit",
  },
  testimonial: {
    meaning: "A formal statement about someone's character or ability.",
    simple: "A written recommendation.",
    pronunciation: "tes-ti-MOH-nee-ul",
  },
  ratified: {
    meaning: "Formally approved and made valid.",
    simple: "Officially agreed and signed off.",
    pronunciation: "RAT-i-fyd",
  },
  consecrated: {
    meaning: "Made or declared sacred.",
    simple: "Blessed for religious use.",
    pronunciation: "KON-si-kray-ted",
  },
  monastic: {
    meaning: "Relating to monks, nuns or their communities.",
    simple: "To do with monastery life.",
    pronunciation: "muh-NAS-tik",
  },
  scripture: {
    meaning: "Sacred writings of a religion.",
    simple: "Holy texts.",
    pronunciation: "SKRIP-cher",
  },
  lineage: {
    meaning: "A direct line of descent or transmission from teacher to student.",
    simple: "The chain of teachers passing on knowledge.",
    pronunciation: "LIN-ee-ij",
  },
  colophon: {
    meaning: "A note at the end of a manuscript giving details of its production.",
    simple: "The 'who made this and when' note at the end.",
    pronunciation: "KOL-uh-fon",
  },
  manuscript: {
    meaning: "A document written by hand rather than printed.",
    simple: "A hand-written book or page.",
    pronunciation: "MAN-yoo-skript",
  },
  exegesis: {
    meaning: "A critical explanation or interpretation of a text.",
    simple: "A detailed explanation of what a text means.",
    pronunciation: "ek-si-JEE-sis",
  },
  cognizance: {
    meaning: "Knowledge or awareness, especially official notice.",
    simple: "Being officially aware of something.",
    pronunciation: "KOG-ni-zuns",
  },
  pursuant: {
    meaning: "In accordance with, or following on from.",
    simple: "According to.",
    pronunciation: "per-SOO-unt",
  },
  notwithstanding: {
    meaning: "In spite of; despite.",
    simple: "Even though.",
    pronunciation: "not-with-STAN-ding",
  },
  undersigned: {
    meaning: "The person who has signed at the bottom of the document.",
    simple: "The person signing below.",
    pronunciation: "un-der-SYND",
  },
  incumbent: {
    meaning: "Necessary as a duty; or the current holder of an office.",
    simple: "Required of you, or the person currently in the job.",
    pronunciation: "in-KUM-bunt",
  },
};

const GLOSSARY_KEYS = Object.keys(GLOSSARY);

/** Locate glossary words inside a string. */
export function findDifficultWords(text = "") {
  const found = [];
  GLOSSARY_KEYS.forEach((word) => {
    const re = new RegExp(`\\b${word}(s|ed|ing)?\\b`, "gi");
    let m;
    while ((m = re.exec(text)) !== null) {
      found.push({
        start: m.index,
        end: m.index + m[0].length,
        kind: "difficult",
        text: m[0],
        entry: GLOSSARY[word],
      });
    }
  });
  return found.sort((a, b) => a.start - b.start);
}

/* ------------------------------------------------------------- AI insights */

/** Take the N most informative sentences as a lightweight extractive summary. */
function extractiveSummary(text, limit = 3) {
  const sentences = text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 6);
  if (!sentences.length) return [];

  const freq = new Map();
  const stop = new Set(
    "the a an and or of to in for on at is are was were be been with by that this it as from will shall may can".split(
      " "
    )
  );
  sentences.forEach((s) =>
    s
      .toLowerCase()
      .match(/\b[a-z]{4,}\b/g)
      ?.forEach((w) => {
        if (!stop.has(w)) freq.set(w, (freq.get(w) || 0) + 1);
      })
  );

  return sentences
    .map((s, i) => {
      const words = s.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
      const score =
        words.reduce((sum, w) => sum + (freq.get(w) || 0), 0) / (words.length || 1) +
        (i === 0 ? 1.5 : 0); // opening sentence bonus
      return { s, score, i };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .sort((a, b) => a.i - b.i)
    .map((x) => x.s);
}

const ACTION_RE =
  /\b(?:must|should|are required to|is required to|need to|kindly|please|ensure that|submit|attach|bring|complete|sign|return|apply|register|contact)\b[^.\n]{5,120}/gi;
const WARNING_RE =
  /\b(?:failure to|will be (?:rejected|cancelled|liable)|penalty|not be accepted|strictly|mandatory|disqualif\w+|no extension)\b[^.\n]{0,110}/gi;
const REQUIRED_DOC_RE =
  /\b(?:copy of|copies of|attach(?:ed|ing)?|enclosed|enclosure|submit(?:ting)? (?:the|a|your)?)\s+[^.\n]{4,80}/gi;

const uniq = (arr) => [...new Set(arr.map((s) => s.trim()))].filter(Boolean);

/**
 * Build the data behind the "AI Insights" panel using local heuristics so the
 * panel works even before the LLM summary arrives.
 */
export function buildInsights(text = "", doc = {}) {
  const entities = findEntities(text);
  const pick = (kind) => uniq(entities.filter((e) => e.kind === kind).map((e) => e.text));

  return {
    summary: doc.summary?.trim() ? doc.summary.trim() : extractiveSummary(text, 3).join(" "),
    keyPoints: extractiveSummary(text, 5),
    dates: pick("date"),
    people: pick("person"),
    organizations: pick("org"),
    locations: pick("location"),
    amounts: pick("amount"),
    contacts: [...pick("email"), ...pick("phone"), ...pick("url")],
    deadlines: uniq(text.match(/\b(?:deadline|due date|last date)\b[^.\n]{0,80}/gi) || []),
    actionItems: uniq(text.match(ACTION_RE) || []).slice(0, 6),
    warnings: uniq(text.match(WARNING_RE) || []).slice(0, 4),
    requiredDocuments: uniq(text.match(REQUIRED_DOC_RE) || []).slice(0, 6),
  };
}

/* ------------------------------------------------------------ text exports */

/** Flatten parsed blocks back to clean plain text. */
export function blocksToText(blocks = []) {
  return blocks
    .map((b) => {
      switch (b.type) {
        case "heading":
          return b.text;
        case "field":
          return `${b.label}: ${b.value}`;
        case "list":
          return b.items
            .map((it, i) => (b.ordered ? `${i + 1}. ${it}` : `• ${it}`))
            .join("\n");
        case "table":
          return [b.head, ...b.rows].map((r) => r.join("\t")).join("\n");
        default:
          return b.text;
      }
    })
    .join("\n\n");
}

/** Flatten parsed blocks to Markdown. */
export function blocksToMarkdown(blocks = [], title = "Document") {
  const body = blocks
    .map((b) => {
      switch (b.type) {
        case "heading":
          return `${"#".repeat(b.level)} ${b.text}`;
        case "field":
          return `**${b.label}:** ${b.value}`;
        case "list":
          return b.items
            .map((it, i) => (b.ordered ? `${i + 1}. ${it}` : `- ${it}`))
            .join("\n");
        case "table": {
          const head = `| ${b.head.join(" | ")} |`;
          const sep = `| ${b.head.map(() => "---").join(" | ")} |`;
          const rows = b.rows.map((r) => `| ${r.join(" | ")} |`).join("\n");
          return [head, sep, rows].join("\n");
        }
        case "signoff":
        case "salutation":
          return `*${b.text}*`;
        case "address":
          return b.text.split("\n").join("  \n");
        default:
          return b.text;
      }
    })
    .join("\n\n");

  return `# ${title}\n\n${body}\n`;
}

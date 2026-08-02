/**
 * Small client-side file download helpers used by the OCR viewer toolbar.
 * Everything is generated in-browser — no extra dependencies.
 */

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Strip an existing extension from a file name. */
export function baseName(name = "document") {
  return name.replace(/\.[^.]+$/, "") || "document";
}

export function downloadText(text, filename) {
  saveBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), filename);
}

export function downloadMarkdown(markdown, filename) {
  saveBlob(new Blob([markdown], { type: "text/markdown;charset=utf-8" }), filename);
}

const escapeHtml = (v = "") =>
  String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Word-compatible HTML document (.doc). Word opens this natively and keeps
 * headings, lists and tables intact.
 */
export function downloadDocx(blocks, filename, title = "Document") {
  const body = blocks
    .map((b) => {
      switch (b.type) {
        case "heading":
          return `<h${b.level}>${escapeHtml(b.text)}</h${b.level}>`;
        case "field":
          return `<p><b>${escapeHtml(b.label)}:</b> ${escapeHtml(b.value)}</p>`;
        case "list": {
          const tag = b.ordered ? "ol" : "ul";
          return `<${tag}>${b.items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</${tag}>`;
        }
        case "table":
          return `<table border="1" cellspacing="0" cellpadding="6"><tr>${b.head
            .map((c) => `<th>${escapeHtml(c)}</th>`)
            .join("")}</tr>${b.rows
            .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`)
            .join("")}</table>`;
        case "address":
          return `<p>${escapeHtml(b.text).replace(/\n/g, "<br/>")}</p>`;
        case "signoff":
          return `<p><i>${escapeHtml(b.text)}</i></p>`;
        default:
          return `<p>${escapeHtml(b.text)}</p>`;
      }
    })
    .join("\n");

  const html = `<!doctype html><html xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
  body { font-family: Calibri, Georgia, serif; font-size: 12pt; line-height: 1.7; }
  h1,h2,h3 { font-family: Calibri, Arial, sans-serif; }
  table { border-collapse: collapse; width: 100%; }
</style></head>
<body><h1>${escapeHtml(title)}</h1>${body}</body></html>`;

  saveBlob(new Blob([html], { type: "application/msword" }), filename);
}

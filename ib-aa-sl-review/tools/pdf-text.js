// Extracts the text of a PDF (all pages, or a range) using macOS PDFKit.
// Usage: osascript -l JavaScript tools/pdf-text.js <file.pdf> [firstPage] [lastPage]
// Each page starts with a line "=== page N ===".
ObjC.import("Quartz");

function run(argv) {
  const doc = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(argv[0]));
  if (!doc || doc.isNil()) return "cannot open " + argv[0];
  const n = doc.pageCount;
  const first = parseInt(argv[1] || "1", 10), last = Math.min(parseInt(argv[2] || String(n), 10), n);
  const out = [];
  for (let i = first; i <= last; i++) {
    const s = doc.pageAtIndex(i - 1).string;
    out.push("=== page " + i + " ===\n" + (s && !s.isNil() ? s.js : ""));
  }
  return out.join("\n");
}

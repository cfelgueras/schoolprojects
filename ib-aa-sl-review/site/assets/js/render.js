/*
 * Markdown renderer for topic content.
 *
 * Supported syntax on top of normal Markdown:
 *   $...$ and $$...$$          math (KaTeX)
 *   [[SHIFT]]                  calculator key
 *   {{unverified}}             "unverified" badge
 *   :::note|tip|mistake|unverified Title   ...   :::   callout box
 *   :::formula booklet|memorize Title      ...   :::   formula card with badge
 *   :::example Title  question  +++  solution  :::      worked example (solution hidden)
 *   ```graph { ...json... } ```                          interactive graph (see graph.js)
 */
(function () {
  "use strict";

  const CALLOUTS = ["note", "tip", "mistake", "unverified"];
  const FORMULA_BADGES = {
    booklet: '<span class="badge badge-booklet" title="This formula is given in the formula booklet">📘 In formula booklet</span>',
    memorize: '<span class="badge badge-memorize" title="Not in the formula booklet: learn it">🧠 Memorize</span>'
  };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function renderMath(tex, display) {
    try {
      const html = katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: "ignore" });
      return display ? '<div class="math-display">' + html + "</div>" : html;
    } catch (e) {
      return "<code>" + escapeHtml(tex) + "</code>";
    }
  }

  // Markdown + math for a plain chunk (no ::: blocks inside).
  function renderChunk(src) {
    const math = [];
    const hold = (html) => "KXPH" + (math.push(html) - 1) + "XK";

    let s = src
      .replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => "\n\n" + hold(renderMath(tex.trim(), true)) + "\n\n")
      .replace(/\$([^\s$](?:[^$\n]*?[^\s$])?)\$/g, (_, tex) => hold(renderMath(tex, false)))
      .replace(/\[\[([^\]]+)\]\]/g, (_, key) => hold("<kbd>" + escapeHtml(key) + "</kbd>"))
      .replace(/\{\{unverified\}\}/g, () => hold('<span class="badge badge-unverified" title="Not yet checked against the official manual">unverified</span>'));

    let html = marked.parse(s, { gfm: true, breaks: false });
    html = html
      .replace(/<p>(KXPH\d+XK)<\/p>/g, "$1")
      .replace(/KXPH(\d+)XK/g, (_, i) => math[+i])
      .replace(/<table>/g, '<div class="table-scroll"><table>')
      .replace(/<\/table>/g, "</table></div>")
      .replace(/<input disabled="" type="checkbox">/g, '<input type="checkbox">');
    return html;
  }

  function renderBlock(kind, args, body) {
    if (CALLOUTS.includes(kind)) {
      return '<aside class="callout callout-' + kind + '">' +
        (args ? '<div class="callout-title">' + renderInline(args) + "</div>" : "") +
        renderChunk(body) + "</aside>";
    }
    if (kind === "formula") {
      const [type, ...rest] = args.split(" ");
      return '<div class="formula"><div class="formula-head">' + (FORMULA_BADGES[type] || "") +
        "<span>" + renderInline(rest.join(" ")) + "</span></div>" + renderChunk(body) + "</div>";
    }
    if (kind === "example") {
      const [q, sol] = body.split(/^\+\+\+\s*$/m);
      return '<section class="example"><div class="example-title">' + renderInline(args) + "</div>" +
        '<div class="example-q">' + renderChunk(q) + "</div>" +
        (sol ? '<details><summary>Show solution</summary><div class="solution">' + renderChunk(sol) + "</div></details>" : "") +
        "</section>";
    }
    return renderChunk(body);
  }

  function renderInline(s) {
    return renderChunk(s).replace(/^<p>|<\/p>\s*$/g, "");
  }

  // Full document: split out graph fences and ::: blocks, render each piece.
  function renderMarkdown(src) {
    const graphs = [];
    src = src.replace(/```graph\s*\n([\s\S]*?)```/g, (_, json) => "\n:::graph " + (graphs.push(json) - 1) + "\n:::\n");

    const out = [];
    const lines = src.split("\n");
    let buf = [];
    let block = null;

    const flush = () => { if (buf.length) { out.push(renderChunk(buf.join("\n"))); buf = []; } };

    for (const line of lines) {
      if (!block) {
        const m = line.match(/^:::(\w+)\s*(.*)$/);
        if (m) { flush(); block = { kind: m[1], args: m[2].trim(), body: [] }; }
        else buf.push(line);
      } else if (/^:::\s*$/.test(line)) {
        if (block.kind === "graph") {
          out.push('<div class="graph" data-graph="' + escapeHtml(graphs[+block.args]) + '"></div>');
        } else {
          out.push(renderBlock(block.kind, block.args, block.body.join("\n")));
        }
        block = null;
      } else {
        block.body.push(line);
      }
    }
    flush();
    return out.join("\n");
  }

  window.Render = { markdown: renderMarkdown, inline: renderInline, escapeHtml: escapeHtml };
})();

/*
 * Renders one past paper question. Shared by the topic pages and the mock exam.
 *
 * Questions.html(q, opts)
 *   opts.mode          "practice" (markscheme behind a button) | "exam" (no markscheme) | "mark" (markscheme + score inputs)
 *   opts.currentTopic  topic id of the page, to show the *other* topic as "Also: …"
 *   opts.topicTitles   { id: title }
 *   opts.number        optional question number in a mock exam
 */
(function () {
  "use strict";

  const esc = (s) => Render.escapeHtml(s);

  function hasMarkscheme(q) {
    return q.status !== "no-markscheme" && q.parts.some((p) => p.markscheme);
  }

  function reference(q) {
    const p = q.paper;
    return '<span class="ex-ref">' + esc([p.session, p.year, p.timezone].filter(Boolean).join(" ")) +
      " · Question " + esc(q.question) + "</span>";
  }

  function scoreInput(q, i, max) {
    return '<div class="score-row" data-qid="' + esc(q.id) + '" data-part="' + i + '" data-max="' + max + '">' +
      '<span class="score-lbl">Marks you earned</span>' +
      '<button class="step" type="button" data-step="-1" aria-label="One mark less">−</button>' +
      '<output class="score-val">0</output><span class="score-max">/ ' + max + "</span>" +
      '<button class="step" type="button" data-step="1" aria-label="One mark more">+</button></div>';
  }

  function html(q, opts) {
    opts = opts || {};
    const mode = opts.mode || "practice";
    const ms = hasMarkscheme(q);
    const titles = opts.topicTitles || {};
    const other = opts.currentTopic
      ? (q.primaryTopic === opts.currentTopic ? q.secondaryTopic : q.primaryTopic)
      : null;

    const parts = q.parts.map((p, i) => {
      let extra = "";
      if (mode === "practice" && p.markscheme) {
        extra = '<div class="ms" hidden><div class="ms-title">Markscheme</div>' + Render.markdown(p.markscheme) + "</div>";
      } else if (mode === "mark") {
        extra = p.markscheme && ms
          ? '<div class="ms"><div class="ms-title">Markscheme</div>' + Render.markdown(p.markscheme) + "</div>" + scoreInput(q, i, p.marks)
          : '<p class="ex-missing ms-missing">No markscheme for this part — it is not included in your score.</p>';
      }
      return (p.intro ? '<div class="ex-intro">' + Render.markdown(p.intro) + "</div>" : "") +
        '<div class="ex-part">' +
          '<span class="label">' + (p.label ? "(" + esc(p.label) + ")" : "") + "</span>" +
          '<div class="text">' + Render.markdown(p.text) + "</div>" +
          '<span class="marks">[' + p.marks + "]</span>" + extra +
        "</div>";
    }).join("");

    let foot = "";
    if (mode === "practice") {
      foot = ms
        ? '<button class="btn" type="button" data-ms-toggle aria-expanded="false">Show markscheme</button>'
        : '<p class="ex-missing">Markscheme not available yet — your teacher is reviewing this question.</p>';
    }

    return '<article class="exercise" data-paper="' + q.paper.paper + '" data-qid="' + esc(q.id) + '">' +
      '<header class="ex-head">' +
        (opts.number ? '<span class="q-num">Q' + opts.number + "</span>" : '<span class="q-num">Paper ' + q.paper.paper + "</span>") +
        reference(q) +
        '<span class="ex-meta">' + (opts.number ? "Paper " + q.paper.paper + " · " : "") + "[" + q.marks + " marks]</span>" +
        (other && titles[other] ? '<span class="ex-also">Also: ' + esc(titles[other]) + "</span>" : "") +
      "</header>" +
      '<div class="ex-body">' + (q.stem ? Render.markdown(q.stem) : "") + parts + "</div>" +
      (foot ? '<div class="ex-foot">' + foot + "</div>" : "") +
      "</article>";
  }

  window.Questions = { html, hasMarkscheme };
})();

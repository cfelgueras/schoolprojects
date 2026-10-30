/* Home page: topic cards in the teacher's order + search. */
(function () {
  "use strict";

  const esc = (s) => Render.escapeHtml(s);
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  function card(t, areaTitle) {
    const haystack = norm([t.title, t.summary, areaTitle, t.codes.join(" "), (t.keywords || []).join(" ")].join(" "));
    return '<a class="topic-card" href="topic.html#' + encodeURIComponent(t.id) + '" data-search="' + esc(haystack) + '">' +
      '<div class="tc-top"><div class="n">Topic</div><div class="big">' + esc(t.mock || "") + "</div>" +
        '<div class="codes">' + t.codes.map((c) => '<span class="code-chip">' + esc(c) + "</span>").join("") + "</div></div>" +
      '<div class="tc-body"><h3>' + esc(t.title) + "</h3><p>" + esc(t.summary) + '</p><span class="go">Study this topic →</span></div></a>';
  }

  async function init() {
    const root = document.getElementById("topics");
    let syllabus;
    try { syllabus = await App.loadSyllabus(); }
    catch (e) { root.innerHTML = App.fileError(e); return; }

    const areas = Object.fromEntries(syllabus.areas.map((a) => [a.id, a.title]));
    root.innerHTML = App.publishedTopics(syllabus).map((t) => card(t, areas[t.area])).join("");

    const input = document.getElementById("search");
    const status = document.getElementById("search-status");
    input.addEventListener("input", () => {
      const terms = norm(input.value).split(/\s+/).filter(Boolean);
      let shown = 0;
      root.querySelectorAll(".topic-card").forEach((c) => {
        const hit = terms.every((w) => c.dataset.search.includes(w));
        c.hidden = !hit;
        if (hit) shown++;
      });
      status.textContent = terms.length ? (shown ? shown + " topic" + (shown === 1 ? "" : "s") + " found" : "No topics match “" + input.value + "”.") : "";
    });
  }

  // Days to the exam on the prep banner (date chosen in the study plan, or set by the teacher).
  async function countdown() {
    let date = App.store.get("mock-date");
    if (!date) { try { date = (await App.fetchJSON("content/exam.json")).mockDate; } catch (e) { /* optional */ } }
    if (!date) return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const days = Math.round((new Date(date + "T00:00:00") - today) / 86400000);
    if (days < 0) return;
    const el = document.getElementById("pb-count");
    el.innerHTML = days + "<small>day" + (days === 1 ? "" : "s") + " to go</small>";
    el.hidden = false;
  }

  init();
  countdown();
})();

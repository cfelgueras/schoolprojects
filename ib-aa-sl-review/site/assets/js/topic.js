/* Topic page: Theory / Past Paper Practice / Calculator Guide tabs. */
(function () {
  "use strict";

  const esc = (s) => Render.escapeHtml(s);
  const TABS = ["theory", "practice", "gdc"];
  const CALCS = {
    casio: { label: "Casio fx-9860", file: "gdc-casio.md" },
    texas: { label: "Texas Instruments", file: "gdc-texas.md" }
  };

  // Address: topic.html#<topic-id> or topic.html#<topic-id>--<tab> (old ?t= links still work).
  const parseHash = () => {
    const [topic, tab] = decodeURIComponent(location.hash.slice(1)).split("--");
    return { topic: topic || new URLSearchParams(location.search).get("t"), tab };
  };
  const id = parseHash().topic;
  const base = "content/topics/" + encodeURIComponent(id) + "/";
  const loaded = {};
  let topicTitles = {};

  const COMING_SOON = (what) => '<p class="empty-state">' + what + " for this topic: coming soon.</p>";

  // Missing content files mean "not written yet", not an error.
  async function fetchOptional(url) {
    try { return await App.fetchText(url); } catch (e) { return null; }
  }

  // ---------- Theory ----------
  async function loadTheory(panel) {
    const md = await fetchOptional(base + "theory.md");
    if (md === null) { panel.innerHTML = COMING_SOON("Theory"); return; }
    panel.innerHTML =
      '<div class="legend"><span><span class="badge badge-booklet">📘 In formula booklet</span></span>' +
      '<span><span class="badge badge-memorize">🧠 Memorize</span></span></div>' +
      '<div class="prose">' + Render.markdown(md) + "</div>";
    Graph.mountAll(panel);
  }

  // ---------- Past paper practice ----------
  function exerciseHtml(q) {
    return Questions.html(q, { mode: "practice", currentTopic: id, topicTitles });
  }

  function setMs(article, open) {
    article.querySelectorAll(".ms").forEach((m) => (m.hidden = !open));
    const b = article.querySelector("[data-ms-toggle]");
    if (b) { b.textContent = open ? "Hide markscheme" : "Show markscheme"; b.setAttribute("aria-expanded", open); }
  }

  async function loadPractice(panel) {
    const all = await App.loadQuestions();
    // Questions whose main topic is this one first, then those where it is the secondary topic.
    const list = all.filter((q) => q.primaryTopic === id).concat(all.filter((q) => q.secondaryTopic === id));
    if (!list.length) { panel.innerHTML = COMING_SOON("Past paper questions"); return; }
    panel.innerHTML =
      '<div class="toolbar">' +
        '<div class="seg" role="group" aria-label="Filter by paper">' +
          '<button type="button" data-paper="all" aria-pressed="true">All</button>' +
          '<button type="button" data-paper="1" aria-pressed="false">Paper 1</button>' +
          '<button type="button" data-paper="2" aria-pressed="false">Paper 2</button>' +
        "</div>" +
        '<button class="btn" type="button" data-all-ms>Show all markschemes</button>' +
        '<span class="count" aria-live="polite"></span>' +
      "</div>" +
      '<p class="practice-note">Paper 1: no calculator · Paper 2: calculator allowed. Try each question first, then check the markscheme.</p>' +
      '<div class="ex-list">' + list.map(exerciseHtml).join("") + "</div>";

    const count = panel.querySelector(".count");
    const articles = [...panel.querySelectorAll(".exercise")];
    const filter = (paper) => {
      let n = 0;
      articles.forEach((a) => { const ok = paper === "all" || a.dataset.paper === paper; a.hidden = !ok; if (ok) n++; });
      panel.querySelectorAll(".seg button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.paper === paper));
      count.textContent = n + " question" + (n === 1 ? "" : "s");
    };
    filter("all");

    panel.addEventListener("click", (e) => {
      const seg = e.target.closest(".seg button");
      if (seg) return filter(seg.dataset.paper);
      const t = e.target.closest("[data-ms-toggle]");
      if (t) return setMs(t.closest(".exercise"), t.getAttribute("aria-expanded") !== "true");
      const all = e.target.closest("[data-all-ms]");
      if (all) {
        const open = all.textContent.startsWith("Show");
        articles.forEach((a) => setMs(a, open));
        all.textContent = open ? "Hide all markschemes" : "Show all markschemes";
      }
    });
  }

  // ---------- Calculator guide ----------
  async function loadGdc(panel) {
    const chosen = App.store.get("gdc");
    if (!CALCS[chosen]) {
      panel.innerHTML =
        '<div class="calc-ask"><h2>Which calculator do you use?</h2><p>We will remember your choice on this device. You can change it at any time.</p>' +
        '<div class="choices">' + Object.keys(CALCS).map((k) =>
          '<button class="btn btn-primary" type="button" data-calc="' + k + '">' + CALCS[k].label + "</button>").join("") + "</div></div>";
      panel.onclick = (e) => {
        const b = e.target.closest("[data-calc]");
        if (b) { App.store.set("gdc", b.dataset.calc); loadGdc(panel); }
      };
      return;
    }
    const md = (await fetchOptional(base + CALCS[chosen].file)) || ":::note Coming soon\nThe " + CALCS[chosen].label + " guide for this topic is being written.\n:::";
    // Interactive trainer (Casio only) when content/gdc/<topic>.json exists.
    const trainer = chosen === "casio" && (await fetchOptional("content/gdc/" + encodeURIComponent(id) + ".json")) !== null;
    panel.innerHTML =
      (trainer
        ? '<a class="gdc-promo" href="gdc.html#' + encodeURIComponent(id) + '"><span class="ic" aria-hidden="true">🧮</span>' +
          "<div><b>Practise on the interactive calculator</b><span>Press the real keys step by step, with hints.</span></div>" +
          '<span class="go">Start →</span></a>'
        : "") +
      '<div class="calc-picker"><span class="lbl">Calculator:</span><div class="seg" role="group" aria-label="Calculator">' +
      Object.keys(CALCS).map((k) =>
        '<button type="button" data-calc="' + k + '" aria-pressed="' + (k === chosen) + '">' + CALCS[k].label + "</button>").join("") +
      "</div></div>" +
      '<div class="prose">' + Render.markdown(md) + "</div>";
    panel.onclick = (e) => {
      const b = e.target.closest("[data-calc]");
      if (b && b.dataset.calc !== chosen) { App.store.set("gdc", b.dataset.calc); loadGdc(panel); }
    };
    restoreChecklist(panel, "gdc-" + chosen);
    Graph.mountAll(panel);
  }

  // Checklist ticks are remembered per topic on this device.
  function restoreChecklist(panel, key) {
    const k = "check:" + id + ":" + key;
    const boxes = [...panel.querySelectorAll('.prose input[type="checkbox"]')];
    const saved = (App.store.get(k) || "").split("");
    boxes.forEach((b, i) => {
      b.checked = saved[i] === "1";
      b.addEventListener("change", () => App.store.set(k, boxes.map((x) => (x.checked ? "1" : "0")).join("")));
    });
  }

  // ---------- Tabs ----------
  const loaders = { theory: loadTheory, practice: loadPractice, gdc: loadGdc };

  async function show(tab, push) {
    if (!TABS.includes(tab)) tab = "theory";
    TABS.forEach((t) => {
      document.getElementById("tab-" + t).setAttribute("aria-selected", t === tab);
      document.getElementById("panel-" + t).hidden = t !== tab;
    });
    if (push) history.replaceState(null, "", "#" + id + "--" + tab);
    const panel = document.getElementById("panel-" + tab);
    if (!loaded[tab]) {
      loaded[tab] = true;
      try { await loaders[tab](panel); }
      catch (e) { loaded[tab] = false; panel.innerHTML = App.fileError(e); }
    }
  }

  async function init() {
    let syllabus;
    try { syllabus = await App.loadSyllabus(); }
    catch (e) { document.querySelector("main").innerHTML = App.fileError(e); return; }

    const topics = App.publishedTopics(syllabus);
    const idx = topics.findIndex((t) => t.id === id);
    const topic = topics[idx];
    if (!topic) {
      document.querySelector("main").innerHTML = '<div class="wrap"><p class="empty-state">Topic not found. <a href="index.html">Back to all topics</a></p></div>';
      return;
    }
    topicTitles = Object.fromEntries(syllabus.topics.map((t) => [t.id, t.title]));
    const area = syllabus.areas.find((a) => a.id === topic.area);
    document.title = "Topic " + topic.mock + " · " + topic.title + " · AA SL Review";
    document.getElementById("topic-eyebrow").textContent = "Topic " + topic.mock + " · " + area.title;
    document.getElementById("topic-codes").innerHTML =
      topic.codes.map((c) => '<span class="code-chip">' + esc(c) + "</span>").join("");
    document.getElementById("topic-title").textContent = topic.title;

    const href = (t) => "topic.html#" + encodeURIComponent(t.id);
    document.getElementById("topicbar").innerHTML = topics.map((t) =>
      '<a href="' + href(t) + '"' + (t.id === id ? ' aria-current="page"' : "") + "><b>" + esc(t.mock) + "</b>" + esc(t.title.split(":")[0]) + "</a>").join("");
    const current = document.querySelector('#topicbar [aria-current="page"]');
    if (current) current.scrollIntoView({ block: "nearest", inline: "center" });

    const prev = topics[idx - 1], next = topics[idx + 1];
    const link = (t, cls, dir) => t
      ? '<a class="' + cls + '" href="' + href(t) + '"><small>' + dir + "</small>" + esc(t.mock + ". " + t.title) + "</a>"
      : '<span class="' + cls + '"><small>' + dir + "</small>—</span>";
    document.getElementById("pager").innerHTML = link(prev, "prev", "← Previous topic") + link(next, "next", "Next topic →");

    TABS.forEach((t) => document.getElementById("tab-" + t).addEventListener("click", () => show(t, true)));
    // Another topic on the same page (topic bar, pager) needs a fresh load; a tab change does not.
    window.addEventListener("hashchange", () => {
      const h = parseHash();
      if (h.topic !== id) location.reload();
      else show(h.tab, false);
    });
    show(parseHash().tab, false);
  }

  init();
})();

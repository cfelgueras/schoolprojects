/* Exam preparation page: mock exam, flashcards, summaries, study plan, exam technique. */
(function () {
  "use strict";

  const esc = (s) => Render.escapeHtml(s);
  const TABS = ["mock", "flashcards", "summaries", "plan", "technique"];
  const MINUTES_PER_MARK = 90 / 80; // IB SL papers: 90 minutes for 80 marks
  const loaded = {};
  let syllabus, topics, titles, questions;

  // Saved data (per device). Values are JSON.
  const saved = {
    get(key, fallback) { try { const v = App.store.get(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } },
    set(key, value) { App.store.set(key, JSON.stringify(value)); }
  };

  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pct = (e, m) => (m ? Math.round((100 * e) / m) : 0);
  const topicLabel = (id) => { const t = topics.find((x) => x.id === id); return t ? t.mock + ". " + t.title.split(":")[0] : id; };

  // =====================================================================
  // Mock exam
  // =====================================================================
  const mock = { panel: null, cfg: { paper: "mixed", target: 45, topics: null, noMs: false }, exam: null, timer: null, running: false };

  function historyByTopic() {
    const agg = {};
    saved.get("mock-history", []).forEach((h) => {
      Object.entries(h.byTopic || {}).forEach(([id, [e, m]]) => {
        agg[id] = agg[id] || [0, 0];
        agg[id][0] += e; agg[id][1] += m;
      });
    });
    return agg;
  }

  function renderMockSetup() {
    clearInterval(mock.timer);
    window.onbeforeunload = null;
    const cfg = mock.cfg;
    if (!cfg.topics) cfg.topics = topics.map((t) => t.id);
    const history = saved.get("mock-history", []);
    const seg = (name, value, label) =>
      '<button type="button" data-' + name + '="' + value + '" aria-pressed="' + (String(cfg[name]) === String(value)) + '">' + label + "</button>";

    mock.panel.innerHTML =
      '<div class="card">' +
        "<h2>Build a mock exam</h2>" +
        '<p class="sub">Real past paper questions, mixed at random. You get about one minute per mark, like the real exam. The markschemes appear only when you finish.</p>' +
        '<div class="form-row"><span class="form-lbl">Paper</span><div class="seg">' +
          seg("paper", "1", "Paper 1 · no GDC") + seg("paper", "2", "Paper 2 · GDC") + seg("paper", "mixed", "Mixed") + "</div></div>" +
        '<div class="form-row"><span class="form-lbl">Length</span><div class="seg">' +
          seg("target", 30, "Short · 30 marks") + seg("target", 45, "Half · 45 marks") + seg("target", 80, "Full · 80 marks") + "</div></div>" +
        '<div class="form-row"><span class="form-lbl">Topics</span><div class="chips">' +
          topics.map((t) => '<label class="chip-check"><input type="checkbox" data-topic="' + t.id + '"' + (cfg.topics.includes(t.id) ? " checked" : "") + "> " + esc(topicLabel(t.id)) + "</label>").join("") +
        "</div></div>" +
        '<label class="check-line"><input type="checkbox" data-nums' + (cfg.noMs ? " checked" : "") + "> Include questions that do not have a markscheme yet (they will not be scored)</label>" +
        '<p class="pool" aria-live="polite"></p>' +
        '<button class="btn gold big" type="button" data-start>Start mock exam</button>' +
      "</div>" +
      (history.length
        ? '<div class="card"><h2>Your previous mocks</h2><div class="table-scroll"><table class="tbl"><thead><tr><th>Date</th><th>Paper</th><th>Score</th><th>Time</th></tr></thead><tbody>' +
            history.slice().reverse().map((h) =>
              "<tr><td>" + esc(new Date(h.date).toLocaleDateString("en-GB")) + "</td><td>" + esc(h.paper) + "</td><td><b>" + h.earned + " / " + h.max + "</b> (" + pct(h.earned, h.max) + "%)</td><td>" + h.minutesUsed + " min</td></tr>").join("") +
          "</tbody></table></div>" + weakTopicsHtml() + "</div>"
        : "");

    const pool = mock.panel.querySelector(".pool");
    const updatePool = () => {
      const qs = eligible();
      const marks = qs.reduce((s, q) => s + q.marks, 0);
      pool.textContent = qs.length + " questions available (" + marks + " marks) with these settings.";
    };
    updatePool();

    mock.panel.onclick = (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.paper) { cfg.paper = b.dataset.paper; renderMockSetup(); }
      else if (b.dataset.target) { cfg.target = +b.dataset.target; renderMockSetup(); }
      else if ("start" in b.dataset) startMock();
    };
    mock.panel.onchange = (e) => {
      if (e.target.dataset.topic) {
        cfg.topics = [...mock.panel.querySelectorAll("[data-topic]:checked")].map((c) => c.dataset.topic);
      } else if ("nums" in e.target.dataset) cfg.noMs = e.target.checked;
      updatePool();
    };
  }

  function weakTopicsHtml() {
    const agg = historyByTopic();
    const rows = Object.entries(agg).sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1]);
    if (!rows.length) return "";
    return "<h3>By topic (all your mocks)</h3>" + rows.map(([id, [e, m]]) => barRow(topicLabel(id), e, m, id)).join("");
  }

  function barRow(label, e, m, id) {
    const p = pct(e, m);
    return '<div class="bar-row"><span class="bar-lbl">' + (id ? '<a href="topic.html#' + encodeURIComponent(id) + '">' + esc(label) + "</a>" : esc(label)) + "</span>" +
      '<span class="bar"><span style="width:' + p + '%" class="' + (p < 50 ? "low" : p < 70 ? "mid" : "high") + '"></span></span>' +
      '<span class="bar-val">' + e + "/" + m + " · " + p + "%</span></div>";
  }

  function eligible() {
    const c = mock.cfg;
    return questions.filter((q) =>
      (c.paper === "mixed" || String(q.paper.paper) === c.paper) &&
      (c.topics.includes(q.primaryTopic) || (q.secondaryTopic && c.topics.includes(q.secondaryTopic))) &&
      (c.noMs || Questions.hasMarkscheme(q)));
  }

  function startMock() {
    const pool = shuffle(eligible());
    const target = mock.cfg.target;
    const chosen = [];
    let total = 0;
    pool.forEach((q) => { if (total < target - 2 && total + q.marks <= target + 4) { chosen.push(q); total += q.marks; } });
    if (!chosen.length) {
      mock.panel.querySelector(".pool").textContent = "Not enough questions with these settings — choose more topics or a different paper.";
      return;
    }
    // Paper 1 questions first, then Paper 2, Section A before Section B (like the real papers)
    chosen.sort((a, b) => a.paper.paper - b.paper.paper || (a.section || "").localeCompare(b.section || "") || a.marks - b.marks);
    const minutes = Math.max(5, Math.round(total * MINUTES_PER_MARK));
    mock.exam = { questions: chosen, total, minutes, start: Date.now(), end: Date.now() + minutes * 60000, scores: {} };
    renderExam();
  }

  function renderExam() {
    const ex = mock.exam;
    const papers = [...new Set(ex.questions.map((q) => q.paper.paper))];
    mock.panel.innerHTML =
      '<div class="exam-bar"><span class="timer" aria-live="off"></span><span class="exam-info">' + ex.total + " marks · " + ex.minutes + ' min</span><button class="btn gold" type="button" data-finish>Finish &amp; mark</button></div>' +
      '<div class="card exam-rules"><b>Instructions.</b> ' +
        (papers.includes(1) ? "Paper 1 questions: <b>no calculator</b>. " : "") +
        (papers.includes(2) ? "Paper 2 questions: GDC allowed — write down what you put in it. " : "") +
        "Answer on paper, show your working, give answers exactly or to 3 significant figures. When you finish (or the time is up), mark your work with the markschemes.</div>" +
      ex.questions.map((q, i) => Questions.html(q, { mode: "exam", number: i + 1, topicTitles: titles })).join("");

    mock.running = true;
    window.onbeforeunload = () => "Your mock exam is in progress.";
    const timerEl = mock.panel.querySelector(".timer");
    const tick = () => {
      const left = Math.round((ex.end - Date.now()) / 1000);
      const a = Math.abs(left);
      const t = Math.floor(a / 60) + ":" + String(a % 60).padStart(2, "0");
      timerEl.textContent = left >= 0 ? "⏱ " + t + " left" : "⏱ Time is up (+" + t + ")";
      timerEl.classList.toggle("over", left < 0);
      timerEl.classList.toggle("warn", left >= 0 && left < 300);
    };
    tick();
    clearInterval(mock.timer);
    mock.timer = setInterval(tick, 1000);
    mock.panel.onclick = (e) => { if (e.target.closest("[data-finish]")) renderMarking(); };
    mock.panel.onchange = null;
    window.scrollTo({ top: mock.panel.offsetTop - 80 });
  }

  function renderMarking() {
    const ex = mock.exam;
    clearInterval(mock.timer);
    mock.running = false;
    window.onbeforeunload = null;
    ex.minutesUsed = Math.round((Date.now() - ex.start) / 60000);
    ex.scoredMax = 0;
    ex.questions.forEach((q) => { if (Questions.hasMarkscheme(q)) ex.scoredMax += q.marks; });

    mock.panel.innerHTML =
      '<div class="exam-bar"><span class="timer">Marking</span><span class="exam-info live-score"></span><button class="btn gold" type="button" data-results>See my results</button></div>' +
      '<div class="card exam-rules"><b>Mark your work.</b> Compare each part with the markscheme line by line and give yourself the marks you earned (M = method, A = answer, R = reasoning; marks in brackets can be implied by a correct answer). See <a href="#technique">How to read a markscheme</a>.</div>' +
      ex.questions.map((q, i) => Questions.html(q, { mode: "mark", number: i + 1, topicTitles: titles })).join("");

    const live = mock.panel.querySelector(".live-score");
    const update = () => {
      let earned = 0;
      mock.panel.querySelectorAll(".score-row").forEach((r) => (earned += +r.querySelector(".score-val").textContent));
      ex.earned = earned;
      live.textContent = "Score: " + earned + " / " + ex.scoredMax;
    };
    update();

    mock.panel.onclick = (e) => {
      const step = e.target.closest("[data-step]");
      if (step) {
        const row = step.closest(".score-row");
        const out = row.querySelector(".score-val");
        out.textContent = Math.min(+row.dataset.max, Math.max(0, +out.textContent + +step.dataset.step));
        update();
      } else if (e.target.closest("[data-results]")) renderResults();
    };
    window.scrollTo({ top: mock.panel.offsetTop - 80 });
  }

  function renderResults() {
    const ex = mock.exam;
    window.onbeforeunload = null;
    const byTopic = {};
    ex.questions.forEach((q) => {
      if (!Questions.hasMarkscheme(q)) return;
      let e = 0;
      mock.panel.querySelectorAll('.score-row[data-qid="' + q.id + '"]').forEach((r) => (e += +r.querySelector(".score-val").textContent));
      byTopic[q.primaryTopic] = byTopic[q.primaryTopic] || [0, 0];
      byTopic[q.primaryTopic][0] += e;
      byTopic[q.primaryTopic][1] += q.marks;
    });
    const papers = [...new Set(ex.questions.map((q) => q.paper.paper))].sort();
    const record = { date: Date.now(), paper: papers.length > 1 ? "Mixed" : "Paper " + papers[0], earned: ex.earned, max: ex.scoredMax, minutesUsed: ex.minutesUsed, minutes: ex.minutes, byTopic };
    const history = saved.get("mock-history", []);
    history.push(record);
    saved.set("mock-history", history.slice(-30));

    const p = pct(ex.earned, ex.scoredMax);
    const weak = Object.entries(byTopic).filter(([, [e, m]]) => pct(e, m) < 60).map(([id]) => id);
    mock.panel.innerHTML =
      '<div class="card results">' +
        '<p class="eyebrow">Mock exam result</p>' +
        '<div class="big-score">' + ex.earned + "<small> / " + ex.scoredMax + "</small></div>" +
        '<p class="sub">' + p + "% · " + ex.minutesUsed + " of " + ex.minutes + " minutes used" +
          (ex.minutesUsed > ex.minutes ? " — you went over time: practise moving on from questions you are stuck on." : "") + "</p>" +
        "<h3>By topic</h3>" + Object.entries(byTopic).map(([id, [e, m]]) => barRow(topicLabel(id), e, m, id)).join("") +
        (weak.length
          ? '<div class="callout callout-tip"><div class="callout-title">What to revise next</div><p>' +
              weak.map((id) => '<a href="topic.html#' + encodeURIComponent(id) + '">' + esc(topicLabel(id)) + "</a>").join(", ") +
              ". Read the summary, do the flashcards, then retry the past paper questions. Your study plan now puts these topics first.</p></div>"
          : '<div class="callout callout-note"><div class="callout-title">Well done</div><p>Above 60% in every topic. Try a longer mock or the other paper.</p></div>') +
        '<div class="row-btns"><button class="btn" type="button" data-again>Another mock exam</button><button class="btn ghost" type="button" data-review>Review my answers</button></div>' +
      "</div>";
    mock.panel.onclick = (e) => {
      if (e.target.closest("[data-again]")) renderMockSetup();
      if (e.target.closest("[data-review]")) {
        mock.panel.insertAdjacentHTML("beforeend", mock.exam.questions.map((q, i) => Questions.html(q, { mode: "practice", number: i + 1, topicTitles: titles })).join(""));
        e.target.closest("[data-review]").remove();
      }
      const t = e.target.closest("[data-ms-toggle]");
      if (t) {
        const art = t.closest(".exercise"), open = t.getAttribute("aria-expanded") !== "true";
        art.querySelectorAll(".ms").forEach((m) => (m.hidden = !open));
        t.textContent = open ? "Hide markscheme" : "Show markscheme";
        t.setAttribute("aria-expanded", open);
      }
    };
    window.scrollTo({ top: mock.panel.offsetTop - 80 });
  }

  function loadMock(panel) {
    mock.panel = panel;
    renderMockSetup();
  }

  // =====================================================================
  // Flashcards
  // =====================================================================
  async function loadFlashcards(panel) {
    const data = await App.fetchJSON("content/flashcards.json");
    const decks = data.decks;
    let deckId = App.store.get("flash-deck") || "all";
    let queue = [], known = 0, total = 0, flipped = false;

    const start = () => {
      const cards = decks.filter((d) => deckId === "all" || d.topic === deckId)
        .flatMap((d) => d.cards.map((c) => Object.assign({ topic: d.topic }, c)));
      queue = shuffle(cards); known = 0; total = cards.length; flipped = false;
      draw();
    };

    const draw = () => {
      const card = queue[0];
      panel.innerHTML =
        '<div class="chips deck-chips scroll-chips">' +
          ['<button type="button" class="chip' + (deckId === "all" ? " on" : "") + '" data-deck="all">All topics</button>']
            .concat(decks.map((d) => '<button type="button" class="chip' + (deckId === d.topic ? " on" : "") + '" data-deck="' + d.topic + '">' + esc(topicLabel(d.topic)) + "</button>")).join("") +
        "</div>" +
        (card
          ? '<p class="flash-progress">' + queue.length + " to go · " + known + " known · " + total + " cards</p>" +
            '<button type="button" class="flashcard' + (flipped ? " flipped" : "") + '" data-flip aria-live="polite">' +
              '<span class="fc-topic">' + esc(topicLabel(card.topic)) + "</span>" +
              '<span class="fc-side">' + (flipped ? "Answer" : "Question") + "</span>" +
              '<span class="fc-text">' + Render.inline(flipped ? card.back : card.front) + "</span>" +
              '<span class="fc-hint">' + (flipped ? "" : "Tap to see the answer") + "</span>" +
            "</button>" +
            (flipped
              ? '<div class="row-btns center"><button class="btn ghost" type="button" data-again>Again</button><button class="btn" type="button" data-know>Got it</button></div>'
              : '<div class="row-btns center"><button class="btn" type="button" data-flip>Show answer</button></div>')
          : '<div class="card results"><div class="big-score">✓</div><p class="sub">Deck complete — ' + total + ' cards.</p><button class="btn" type="button" data-restart>Shuffle and start again</button></div>') +
        '<p class="fc-legend">📘 = in the formula booklet. Everything else: memorize.</p>';
    };

    panel.onclick = (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.deck) { deckId = b.dataset.deck; App.store.set("flash-deck", deckId); start(); }
      else if ("flip" in b.dataset) { flipped = !flipped; draw(); }
      else if ("know" in b.dataset) { queue.shift(); known++; flipped = false; draw(); }
      else if ("again" in b.dataset) { const c = queue.shift(); queue.splice(Math.min(3, queue.length), 0, c); flipped = false; draw(); }
      else if ("restart" in b.dataset) start();
    };
    start();
  }

  // =====================================================================
  // Summaries
  // =====================================================================
  async function loadSummaries(panel) {
    let current = App.store.get("summary-topic") || topics[0].id;
    const show = async () => {
      let md;
      try { md = await App.fetchText("content/topics/" + encodeURIComponent(current) + "/summary.md"); }
      catch (e) { md = "Summary coming soon."; }
      panel.innerHTML =
        '<div class="chips no-print scroll-chips">' + topics.map((t) =>
          '<button type="button" class="chip' + (t.id === current ? " on" : "") + '" data-sum="' + t.id + '">' + esc(topicLabel(t.id)) + "</button>").join("") + "</div>" +
        '<div class="row-btns no-print"><a class="btn ghost" href="topic.html#' + encodeURIComponent(current) + '">Full theory →</a></div>' +
        '<div class="prose summary">' + '<h2 class="summary-title">' + esc(topicLabel(current)) + "</h2>" + Render.markdown(md) +
          '<p class="fc-legend">📘 in the formula booklet · 🧠 memorize</p></div>';
    };
    panel.onclick = (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.sum) { current = b.dataset.sum; App.store.set("summary-topic", current); show(); }
    };
    await show();
  }

  // =====================================================================
  // Countdown and study plan
  // =====================================================================
  async function loadPlan(panel) {
    let config = {};
    try { config = await App.fetchJSON("content/exam.json"); } catch (e) { /* optional */ }

    const draw = () => {
      const dateStr = App.store.get("mock-date") || config.mockDate || "";
      const done = saved.get("plan-done", {});
      let body = "";

      if (!dateStr) {
        body = '<p class="sub">Enter the date of your exam to get a countdown and a day-by-day plan.</p>';
      } else {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const exam = new Date(dateStr + "T00:00:00");
        const days = Math.round((exam - today) / 86400000);
        if (days < 0) body = '<div class="big-score">Done!</div><p class="sub">The exam date has passed. Set a new date for the next exam.</p>';
        else if (days === 0) body = '<div class="big-score">Today</div><p class="sub">Good luck! Calculator charged, formula booklet, pens. Read every question to the end.</p>';
        else {
          const plan = buildPlan(days, today);
          const allTasks = plan.flatMap((d) => d.tasks);
          const doneCount = allTasks.filter((t) => done[t.key]).length;
          body =
            '<div class="countdown"><span class="big-score">' + days + "</span><span>day" + (days === 1 ? "" : "s") + " to go</span></div>" +
            barRow("Plan completed", doneCount, allTasks.length) +
            plan.map((d) =>
              '<div class="plan-day"><div class="plan-date">' + esc(d.date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })) + "</div>" +
              d.tasks.map((t) =>
                '<label class="plan-task' + (done[t.key] ? " done" : "") + '"><input type="checkbox" data-task="' + esc(t.key) + '"' + (done[t.key] ? " checked" : "") + ">" +
                "<span>" + t.html + "</span></label>").join("") + "</div>").join("");
        }
      }

      panel.innerHTML =
        '<div class="card">' +
          '<div class="form-row"><label class="form-lbl" for="mock-date">' + esc(config.examLabel || "Exam") + " date</label>" +
          '<input type="date" id="mock-date" class="date-input" value="' + esc(dateStr) + '"></div>' +
          body +
        "</div>" +
        '<p class="fc-legend">Topics where you scored lowest in your mock exams come first. Tick tasks as you finish them — your progress is saved on this device.</p>';
    };

    panel.onchange = (e) => {
      if (e.target.id === "mock-date") { App.store.set("mock-date", e.target.value); draw(); }
      else if (e.target.dataset.task) {
        const done = saved.get("plan-done", {});
        done[e.target.dataset.task] = e.target.checked;
        saved.set("plan-done", done);
        e.target.closest(".plan-task").classList.toggle("done", e.target.checked);
        draw();
      }
    };
    draw();
  }

  // Spread the tasks over the days left: weakest topics first, two full mocks at the end.
  function buildPlan(days, today) {
    const agg = historyByTopic();
    const score = (id) => (agg[id] ? agg[id][0] / agg[id][1] : 0.5);
    const order = topics.slice().sort((a, b) => score(a.id) - score(b.id) || a.mock - b.mock);
    const link = (href, text) => '<a href="' + href + '">' + text + "</a>";

    const tasks = [{ key: "technique", html: link("prep.html#technique", "Exam technique") + ": command terms, GDC, accuracy, how markschemes work" }];
    order.forEach((t) => {
      const name = esc(t.mock + ". " + t.title.split(":")[0]);
      tasks.push({ key: "learn:" + t.id, html: "<b>" + name + "</b> — " + link("topic.html#" + t.id + "--theory", "theory") + ", " + link("prep.html#summaries", "summary") + " and " + link("prep.html#flashcards", "flashcards") });
      tasks.push({ key: "practise:" + t.id, html: "<b>" + name + "</b> — " + link("topic.html#" + t.id + "--practice", "past paper questions") + " and " + link("topic.html#" + t.id + "--gdc", "calculator drill") });
    });
    const finals = [
      { key: "mock:p1", html: link("prep.html#mock", "Full mock exam") + ": Paper 1 (no calculator), then mark it" },
      { key: "mock:p2", html: link("prep.html#mock", "Full mock exam") + ": Paper 2 (GDC), then mark it" }
    ];

    // Extra days: review the weakest topics again, then flashcards of everything.
    const slots = days; // today … the day before the exam
    let extra = slots - (tasks.length + finals.length);
    let i = 0;
    while (extra > 0) {
      const t = order[i % Math.min(3, order.length)];
      tasks.push(i < 6
        ? { key: "review" + i + ":" + t.id, html: "<b>Review " + esc(t.mock + ". " + t.title.split(":")[0]) + "</b> — redo the questions you got wrong; " + link("prep.html#mock", "short mock") + " on this topic" }
        : { key: "flash" + i, html: link("prep.html#flashcards", "Flashcards") + ": all topics" });
      i++; extra--;
    }
    const all = tasks.concat(finals);

    const plan = [];
    const perDay = Math.ceil(all.length / slots);
    for (let d = 0, k = 0; d < slots && k < all.length; d++) {
      const date = new Date(today); date.setDate(today.getDate() + d);
      const take = Math.ceil((all.length - k) / (slots - d));
      plan.push({ date, tasks: all.slice(k, k + take) });
      k += take;
    }
    return plan;
  }

  // =====================================================================
  // Exam technique
  // =====================================================================
  async function loadTechnique(panel) {
    const md = await App.fetchText("content/exam-technique.md");
    panel.innerHTML = '<div class="prose">' + Render.markdown(md) + "</div>";
    const boxes = [...panel.querySelectorAll('input[type="checkbox"]')];
    const state = saved.get("technique-check", []);
    boxes.forEach((b, i) => {
      b.checked = !!state[i];
      b.addEventListener("change", () => saved.set("technique-check", boxes.map((x) => x.checked)));
    });
  }

  // =====================================================================
  // Tabs
  // =====================================================================
  const loaders = { mock: loadMock, flashcards: loadFlashcards, summaries: loadSummaries, plan: loadPlan, technique: loadTechnique };

  async function show(tab, push) {
    if (!TABS.includes(tab)) tab = "mock";
    TABS.forEach((t) => {
      document.getElementById("tab-" + t).setAttribute("aria-selected", t === tab);
      document.getElementById("panel-" + t).hidden = t !== tab;
    });
    if (push) history.replaceState(null, "", "#" + tab);
    const panel = document.getElementById("panel-" + tab);
    if (!loaded[tab] || tab === "plan") {
      loaded[tab] = true;
      try { await loaders[tab](panel); }
      catch (e) { loaded[tab] = false; panel.innerHTML = App.fileError(e); }
    }
  }

  async function init() {
    try {
      syllabus = await App.loadSyllabus();
      questions = await App.loadQuestions();
    } catch (e) { document.querySelector("main").innerHTML = App.fileError(e); return; }
    topics = App.publishedTopics(syllabus);
    titles = Object.fromEntries(syllabus.topics.map((t) => [t.id, t.title]));
    TABS.forEach((t) => document.getElementById("tab-" + t).addEventListener("click", () => show(t, true)));
    window.addEventListener("hashchange", () => show(location.hash.slice(1), false));
    show(location.hash.slice(1), false);
  }

  init();
})();

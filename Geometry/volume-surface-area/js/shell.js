// What every page of the app shares: Teacher / Student mode, full screen, hideable side panel,
// keyboard shortcuts, KaTeX, guided steps and "check your understanding" questions.

// ---------- Storage (optional: everything works without it) ----------
export const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem("vsa:" + key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem("vsa:" + key, JSON.stringify(value)); } catch (e) { /* private mode: ignore */ }
  },
};

// ---------- Mode ----------
const modeListeners = [];
export function getMode() { return document.body.classList.contains("mode-teacher") ? "teacher" : "student"; }
export function onModeChange(fn) { modeListeners.push(fn); }
function setMode(mode) {
  document.body.classList.toggle("mode-teacher", mode === "teacher");
  document.body.classList.toggle("mode-student", mode !== "teacher");
  document.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
  store.set("mode", mode);
  modeListeners.forEach((fn) => fn(mode));
}

// ---------- Keyboard shortcuts ----------
const keyHandlers = {};
export function onKey(key, fn) { keyHandlers[key] = fn; }
function typing(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === "TEXTAREA" || tag === "SELECT" || (tag === "INPUT" && el.type !== "button" && el.type !== "checkbox");
}

// ---------- Full screen ----------
function fullscreenElement() { return document.fullscreenElement || document.webkitFullscreenElement; }
export function toggleFullscreen() {
  const el = document.documentElement;
  if (fullscreenElement()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  else if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
}

export function initShell() {
  setMode(store.get("mode", "student"));
  document.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));

  const fs = document.getElementById("fullscreen");
  if (fs) {
    if (!document.documentElement.requestFullscreen && !document.documentElement.webkitRequestFullscreen) fs.hidden = true;
    fs.addEventListener("click", toggleFullscreen);
  }
  const sync = () => document.body.classList.toggle("is-fullscreen", !!fullscreenElement());
  document.addEventListener("fullscreenchange", sync);
  document.addEventListener("webkitfullscreenchange", sync);

  const panelBtn = document.getElementById("toggle-panel");
  const togglePanel = () => {
    const hidden = document.body.classList.toggle("panel-hidden");
    if (panelBtn) panelBtn.textContent = hidden ? "Show panel" : "Hide panel";
  };
  if (panelBtn) panelBtn.addEventListener("click", togglePanel);
  onKey("p", togglePanel);
  onKey("f", toggleFullscreen);

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const el = document.activeElement;
    if (typing(el)) return;
    // sliders keep their own arrow keys; space on a button presses the button
    if (el && el.type === "range" && e.key.startsWith("Arrow")) return;
    if (e.key === " " && el && (el.tagName === "BUTTON" || el.tagName === "A")) return;
    const key = e.key === " " ? "space" : e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (keyHandlers[key]) { e.preventDefault(); keyHandlers[key](e); }
  });
}

// ---------- KaTeX ----------
export function tex(el, src, display = false) {
  if (window.katex) window.katex.render(src, el, { displayMode: display, throwOnError: false });
  else el.textContent = src;
  return el;
}
export function texHTML(src) {
  return window.katex ? window.katex.renderToString(src, { throwOnError: false }) : src;
}

// ---------- Guided steps ----------
// steps: [{ title, html (text or a function returning it), enter(textBox) }]. The arrow keys move between steps.
export function createSteps(box, steps) {
  let i = 0;
  box.innerHTML =
    '<div class="steps-head"><h3>Step by step</h3><span class="count"></span></div>' +
    '<h4 class="step-title"></h4><div class="step-text"></div>' +
    '<div class="step-nav"><button class="btn ghost" type="button" data-go="-1">← Back</button>' +
    '<button class="btn" type="button" data-go="1">Next →</button></div>';
  const prevBtn = box.querySelector('[data-go="-1"]'), nextBtn = box.querySelector('[data-go="1"]');
  function show() {
    const s = steps[i];
    box.querySelector(".count").textContent = i + 1 + " / " + steps.length;
    box.querySelector(".step-title").textContent = s.title;
    box.querySelector(".step-text").innerHTML = (typeof s.html === "function" ? s.html() : s.html) || "";
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === steps.length - 1;
    if (s.enter) s.enter(box.querySelector(".step-text"));
  }
  function go(n) { i = Math.max(0, Math.min(steps.length - 1, n)); show(); }
  prevBtn.addEventListener("click", () => go(i - 1));
  nextBtn.addEventListener("click", () => go(i + 1));
  onKey("ArrowRight", () => go(i + 1));
  onKey("ArrowLeft", () => go(i - 1));
  show();
  return { go, get index() { return i; }, refresh: show };
}

// ---------- Check your understanding ----------
// q: { q, options: [correct, ...wrong], hint, explain }. Options are shuffled; wrong ones stay marked.
export function quiz(box, questions, { onAnswer } = {}) {
  let n = 0;
  function render() {
    const item = questions[n];
    const order = item.options.map((_, k) => k).sort(() => Math.random() - 0.5);
    box.innerHTML =
      '<div class="quiz"><h3>Check your understanding' + (questions.length > 1 ? " · " + (n + 1) + " / " + questions.length : "") + "</h3>" +
      '<p class="q"></p><div class="opts"></div><p class="fb" aria-live="polite"></p><div class="row"></div></div>';
    box.querySelector(".q").innerHTML = item.q;
    const opts = box.querySelector(".opts"), fb = box.querySelector(".fb"), row = box.querySelector(".row");
    order.forEach((k) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "opt"; b.innerHTML = item.options[k];
      b.addEventListener("click", () => {
        if (k === 0) {
          b.classList.add("ok");
          opts.querySelectorAll(".opt").forEach((o) => (o.disabled = true));
          fb.className = "fb ok";
          fb.innerHTML = "Correct! " + (item.explain || "");
          if (n < questions.length - 1) addBtn("Next question →", () => { n++; render(); });
          if (onAnswer) onAnswer(true);
        } else {
          b.classList.add("bad"); b.disabled = true;
          fb.className = "fb bad";
          fb.innerHTML = "Not quite. " + (item.hint ? "Hint: " + item.hint : "Try again.");
          if (onAnswer) onAnswer(false);
        }
      });
      opts.appendChild(b);
    });
    if (item.hint) addBtn("Hint", (btn) => { fb.className = "fb"; fb.innerHTML = "Hint: " + item.hint; btn.remove(); }, true);
    function addBtn(text, fn, ghost) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "btn" + (ghost ? " ghost" : ""); b.textContent = text;
      b.addEventListener("click", () => fn(b));
      row.appendChild(b);
    }
  }
  render();
}

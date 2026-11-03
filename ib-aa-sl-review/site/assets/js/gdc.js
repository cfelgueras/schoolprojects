/*
 * GDC trainer: practise Casio fx-9860GII key sequences step by step.
 *
 * Address: gdc.html#<topic-id> or gdc.html#<topic-id>--<lesson-id>.
 * Lessons live in content/gdc/<topic-id>.json. Each step is one of:
 *   { do, keys: [...], screen }          press these keys in order
 *   { do, select: "GRAPH", screen }      pick an icon in the main menu (arrows + EXE)
 *   { do, scroll: 5, screen }            move the highlighted line (▲ ▼) to line 5
 *   { do, trace: { to, dx }, screen }    move the TRACE cursor (◀ ▶, dx per press) to x = to
 *   { ask, options: [...], answer, why } multiple-choice question about the result
 * A step's `screen` is what the calculator shows once the step is done.
 * `entry: { line, prefix, add }` shows the line being typed; `add[i]` overrides what key i types.
 * Text screens: `lines`, `hl` (inverted line), `right` (right-aligned lines), `fkeys`.
 * Graph screens: `win`, `fns`, `pt`, `label`, `read`; with nothing else they show the graph F-key menu.
 *   `trace: { fn, x, deriv }` puts the TRACE cursor on graph `fn` at x and computes the readout (dY/dX if `deriv`).
 * List screens (STAT): `cols` (List 1, List 2, …), `cur` [list, row], `fkeys`; numbers typed in a step fill the cells live.
 */
(function () {
  "use strict";

  const esc = (s) => Render.escapeHtml(s);
  const inline = (s) => Render.inline(s || "");

  // ---------- Keypad (fx-9860GII layout) ----------
  // [id, label, shift label, extra class]
  const FKEYS = [["F1", "F1", "TRACE"], ["F2", "F2", "ZOOM"], ["F3", "F3", "V-WIN"], ["F4", "F4", "SKETCH"], ["F5", "F5", "G-SOLV"], ["F6", "F6", "G↔T"]];
  const CTRL = [
    [["SHIFT", "SHIFT", "", "k-shift"], ["OPTN", "OPTN"], ["VARS", "VARS"], ["MENU", "MENU", "SET UP"]],
    [["ALPHA", "ALPHA", "", "k-alpha"], ["SQR", "x²", "√"], ["POW", "^", "ˣ√"], ["EXIT", "EXIT", "QUIT"]]
  ];
  const FUNC = [
    [["XT", "X,θ,T"], ["LOG", "log"], ["LN", "ln"], ["SIN", "sin"], ["COS", "cos"], ["TAN", "tan"]],
    [["FRAC", "a b/c"], ["FD", "F↔D"], ["LP", "("], ["RP", ")"], ["COMMA", ","], ["STO", "→"]]
  ];
  const NUM = [
    [["7", "7"], ["8", "8"], ["9", "9"], ["DEL", "DEL", "INS", "k-red"], ["AC", "AC/ON", "OFF", "k-red"]],
    [["4", "4"], ["5", "5"], ["6", "6"], ["MUL", "×"], ["DIV", "÷"]],
    [["1", "1"], ["2", "2"], ["3", "3"], ["ADD", "+"], ["SUB", "−"]],
    [["0", "0"], ["DOT", "."], ["EXP", "EXP", "π"], ["NEG", "(−)", "Ans"], ["EXE", "EXE", "", "k-exe"]]
  ];
  const ARROWS = { UP: "▲", DOWN: "▼", LEFT: "◀", RIGHT: "▶" };

  const LABEL = Object.assign({}, ARROWS);
  [FKEYS, ...CTRL, ...FUNC, ...NUM].forEach((row) => row.forEach((k) => (LABEL[k[0]] = k[1])));

  // What a key adds to the line being typed.
  const TYPED = {
    XT: "X", SQR: "²", POW: "^", LP: "(", RP: ")", COMMA: ",", MUL: "×", DIV: "÷", ADD: "+", SUB: "-", NEG: "-", DOT: ".",
    LOG: "log ", LN: "ln ", SIN: "sin ", COS: "cos ", TAN: "tan "
  };
  const typedText = (id) => TYPED[id] || (/^\d$/.test(id) ? id : "");

  // Physical keyboard shortcuts.
  const KEYBOARD = {
    Enter: "EXE", Escape: "EXIT", Backspace: "DEL", ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT",
    "+": "ADD", "-": "SUB", "*": "MUL", "/": "DIV", "(": "LP", ")": "RP", ".": "DOT", "^": "POW", x: "XT", X: "XT"
  };

  // F-key menu along the bottom of a drawn graph (no SHIFT needed).
  const GRAPH_FKEYS = ["TRACE", "ZOOM", "V-WIN", "SKETCH", "G-SOLV", "G↔T"];

  // Main menu icons, four per row.
  const MENU = ["RUN•MAT", "STAT", "e•ACT", "S•SHT", "GRAPH", "DYNA", "TABLE", "RECUR", "CONICS", "EQUA", "PRGM", "TVM", "LINK", "MEMORY", "SYSTEM"];
  const MENU_COLS = 4;

  const MODES = {
    guided: { label: "Guided", note: "The next key lights up." },
    practice: { label: "Practice", note: "Follow the steps. The key lights up if you press a wrong one." },
    exam: { label: "Exam", note: "Only the task, as in Paper 2. Use a hint if you need one." }
  };

  // ---------- Screen (128 × 64 LCD as SVG) ----------
  const W = 128, H = 64;

  function svgText(x, y, s, opts) {
    const o = opts || {};
    return '<text x="' + x + '" y="' + y + '" font-size="' + (o.size || 7) + '"' +
      (o.anchor ? ' text-anchor="' + o.anchor + '"' : "") + (o.inv ? ' class="inv"' : "") +
      ' xml:space="preserve">' + esc(s) + "</text>";
  }

  function fkeyBar(labels) {
    if (!labels || !labels.length) return "";
    return labels.map((l, i) => l
      ? '<rect class="ink" x="' + (i * 21.3 + 0.5) + '" y="56.5" width="20.3" height="7.5" rx="1"/>' +
        svgText(i * 21.3 + 10.65, 62.6, l, { size: 5.4, anchor: "middle", inv: true })
      : "").join("");
  }

  function textScreen(scr, entry, hl) {
    const lines = (scr.lines || []).slice();
    const right = scr.right || [];
    let entryRow = -1;
    if (entry) {
      entryRow = entry.line != null ? entry.line : 6;
      lines[entryRow] = entry.text;
    }
    let out = "";
    lines.forEach((line, i) => {
      const y = 7 + i * 8;
      const r = right.includes(i) && i !== entryRow;
      const pos = r ? { x: W - 1, anchor: "end" } : { x: 1 };
      if (i === hl && i !== entryRow) {
        out += '<rect class="ink" x="0" y="' + (y - 6.4) + '" width="' + W + '" height="8"/>' + svgText(pos.x, y, line, { inv: true, anchor: pos.anchor });
      } else {
        out += svgText(pos.x, y, line, { anchor: pos.anchor });
      }
    });
    if (entry) out += '<rect class="ink blink" x="' + (1 + entry.text.length * 4.2) + '" y="' + (7 + entryRow * 8 - 6) + '" width="4" height="7"/>';
    return out + fkeyBar(scr.fkeys);
  }

  function menuScreen(sel) {
    const rows = Math.ceil(MENU.length / MENU_COLS);
    const tw = W / MENU_COLS, th = 54 / rows;
    return MENU.map((name, i) => {
      const x = (i % MENU_COLS) * tw, y = Math.floor(i / MENU_COLS) * th + 1;
      const on = name === sel;
      return '<rect class="' + (on ? "ink" : "tile") + '" x="' + (x + 1) + '" y="' + (y + 0.5) + '" width="' + (tw - 2) + '" height="' + (th - 1.5) + '" rx="1.5"/>' +
        svgText(x + tw / 2, y + th / 2 + 2, name, { size: 5.6, anchor: "middle", inv: on });
    }).join("") + svgText(W / 2, 62.5, "MAIN MENU", { size: 5.4, anchor: "middle" });
  }

  // Calculator-style number: 10 significant digits, tiny rounding noise shown as 0.
  const calcNum = (v) => (Math.abs(v) < 1e-9 ? "0" : String(+v.toPrecision(10)));

  // TRACE: the cursor sits on graph `fn` at x; with `deriv` the readout adds dY/dX like Derivative: On.
  function traceView(scr, x) {
    const t = scr.trace;
    const f = new Function("x", "return " + scr.fns[t.fn || 0]);
    const y = f(x), h = 1e-5;
    const read = ["X=" + calcNum(x) + "  Y=" + calcNum(y)];
    if (t.deriv) read.unshift("dY/dX=" + calcNum((f(x + h) - f(x - h)) / (2 * h)));
    return Object.assign({}, scr, { pt: [x, y], read });
  }

  function graphScreen(scr, entry, tx) {
    if (scr.trace) scr = traceView(scr, tx != null ? tx : scr.trace.x);
    const [x0, x1, y0, y1] = scr.win;
    const px = (x) => ((x - x0) / (x1 - x0)) * (W - 1);
    const py = (y) => ((y1 - y) / (y1 - y0)) * (H - 1);
    let out = "";
    if (x0 < 0 && x1 > 0) out += '<line class="axis" x1="' + px(0) + '" y1="0" x2="' + px(0) + '" y2="' + H + '"/>';
    if (y0 < 0 && y1 > 0) out += '<line class="axis" x1="0" y1="' + py(0) + '" x2="' + W + '" y2="' + py(0) + '"/>';
    (scr.fns || []).forEach((src) => {
      const f = new Function("x", "return " + src);
      let d = "", pen = false;
      for (let i = 0; i <= (W - 1) * 2; i++) {
        const x = x0 + ((x1 - x0) * i) / ((W - 1) * 2);
        const y = f(x);
        const ok = isFinite(y) && y >= y0 - (y1 - y0) && y <= y1 + (y1 - y0);
        if (ok) { d += (pen ? "L" : "M") + px(x).toFixed(2) + " " + py(y).toFixed(2); pen = true; }
        else pen = false;
      }
      out += '<path class="curve" d="' + d + '"/>';
    });
    if (scr.pt) {
      const cx = px(scr.pt[0]), cy = py(scr.pt[1]);
      out += '<g class="blink"><line class="cursor" x1="' + (cx - 3) + '" y1="' + cy + '" x2="' + (cx + 3) + '" y2="' + cy + '"/>' +
        '<line class="cursor" x1="' + cx + '" y1="' + (cy - 3) + '" x2="' + cx + '" y2="' + (cy + 3) + '"/></g>';
    }
    if (scr.label) out += '<rect class="lcd" x="0" y="0" width="' + (scr.label.length * 3.4 + 3) + '" height="7.5"/>' + svgText(1, 6, scr.label, { size: 5.6 });
    const read = entry ? entry.text : scr.read;
    if (read) {
      // One or more readout lines along the bottom, the last one on the bottom row.
      const lines = [].concat(read);
      lines.forEach((line, i) => {
        const y = 62.5 - (lines.length - 1 - i) * 7.5;
        out += '<rect class="lcd" x="0" y="' + (y - 6.5) + '" width="' + W + '" height="8"/>' + svgText(1, y, line, { size: 5.6 });
      });
      if (entry) out += '<rect class="ink blink" x="' + (1 + read.length * 3.4) + '" y="57" width="3" height="6"/>';
    }
    const idle = !scr.fkeys && !scr.pt && !scr.label && !read;
    return out + fkeyBar(idle ? GRAPH_FKEYS : scr.fkeys);
  }

  // STAT list editor: List 1–4 in a grid, the current cell inverted, the number being typed on the bottom line.
  function listScreen(scr, buf) {
    const cols = scr.cols || [], cur = scr.cur || [0, 0];
    const NC = 4, ROWS = 4, x0 = 11, cw = (W - x0) / NC, y0 = 16;
    const top = Math.max(0, cur[1] - ROWS + 1);
    let out = "";
    for (let c = 0; c < NC; c++) out += svgText(x0 + c * cw + cw / 2, 6.3, "List " + (c + 1), { size: 5.4, anchor: "middle" });
    out += svgText(1, 13.8, "SUB", { size: 5 });
    for (let r = 0; r < ROWS; r++) {
      const i = top + r, y = y0 + r * 8;
      out += svgText(1, y + 6.3, String(i + 1), { size: 5.4 });
      for (let c = 0; c < NC; c++) {
        const v = cols[c] && cols[c][i] != null ? String(cols[c][i]) : "";
        const on = c === cur[0] && i === cur[1];
        if (on) out += '<rect class="ink" x="' + (x0 + c * cw) + '" y="' + y + '" width="' + cw + '" height="8"/>';
        out += svgText(x0 + (c + 1) * cw - 1.5, y + 6.3, v, { size: 5.4, anchor: "end", inv: on });
      }
    }
    const yEnd = y0 + ROWS * 8;
    for (let r = 0; r <= ROWS + 1; r++) out += '<line class="grid" x1="0" y1="' + (8 + r * 8) + '" x2="' + W + '" y2="' + (8 + r * 8) + '"/>';
    for (let c = 0; c <= NC; c++) out += '<line class="grid" x1="' + (x0 + c * cw) + '" y1="0" x2="' + (x0 + c * cw) + '" y2="' + yEnd + '"/>';
    if (buf) out += svgText(1, 54.5, buf, { size: 6 }) + '<rect class="ink blink" x="' + (1.5 + buf.length * 3.6) + '" y="49" width="3" height="6.5"/>';
    return out + fkeyBar(scr.fkeys);
  }

  function screenSvg(scr, o) {
    const body = scr.type === "menu" ? menuScreen(o.menuSel || scr.sel)
      : scr.type === "graph" ? graphScreen(scr, o.entry, o.tx)
      : scr.type === "list" ? listScreen(o.list || scr, o.buf)
      : textScreen(scr, o.entry, o.hl != null ? o.hl : scr.hl);
    const shift = o.shift ? '<rect class="ink" x="' + (W - 7) + '" y="0" width="7" height="7.5"/>' + svgText(W - 3.5, 6, "S", { size: 6, anchor: "middle", inv: true }) : "";
    return '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Calculator screen">' +
      '<rect class="lcd" width="' + W + '" height="' + H + '"/>' + body + shift + "</svg>";
  }

  // ---------- Calculator body ----------
  function keyHtml(k, cls) {
    const [id, label, shift, extra] = k;
    return '<button type="button" class="key ' + (cls || "") + " " + (extra || "") + '" data-key="' + id + '" aria-label="' + esc(label) + '">' +
      (shift ? '<span class="k-sh">' + esc(shift) + "</span>" : "") + '<span class="k-lb">' + esc(label) + "</span></button>";
  }

  function calculatorHtml() {
    const row = (keys, cls) => '<div class="k-row">' + keys.map((k) => keyHtml(k, cls)).join("") + "</div>";
    return '<div class="calc" aria-label="fx-9860GII calculator">' +
      '<div class="calc-brand"><span>fx-9860GII</span></div>' +
      '<div class="calc-screen" id="screen"></div>' +
      '<div class="k-fn">' + row(FKEYS, "key-f") + "</div>" +
      '<div class="k-mid"><div class="k-ctrl">' + CTRL.map((r) => row(r)).join("") + "</div>" +
        '<div class="dpad">' + Object.keys(ARROWS).map((id) =>
          '<button type="button" class="key key-arrow a-' + id.toLowerCase() + '" data-key="' + id + '" aria-label="' + id.toLowerCase() + ' arrow">' + ARROWS[id] + "</button>").join("") + "</div></div>" +
      '<div class="k-func">' + FUNC.map((r) => row(r, "key-s")).join("") + "</div>" +
      '<div class="k-num">' + NUM.map((r) => row(r, "key-n")).join("") + "</div>" +
      "</div>";
  }

  // ---------- Trainer ----------
  const parseHash = () => {
    const [topic, lesson] = decodeURIComponent(location.hash.slice(1)).split("--");
    return { topic, lesson };
  };

  const S = {
    data: null, topicTitle: "", lesson: null, step: 0, keyIdx: 0, typed: "", menuSel: null,
    shift: false, mistakes: 0, wrongHere: 0, hintShown: false, done: false, answered: null, tried: [],
    // Every visit starts in Guided; the mode buttons change it for this page only.
    mode: "guided"
  };

  const progressKey = () => "gdc-done:" + S.data.topic;
  const doneSet = () => new Set((App.store.get(progressKey()) || "").split(",").filter(Boolean));

  const current = () => S.lesson.steps[S.step];
  const screenBefore = (i) => (i === 0 ? S.lesson.start : S.lesson.steps[i - 1].screen || screenBefore(i - 1));
  const shownScreen = () => (S.done ? screenBefore(S.lesson.steps.length) : screenBefore(S.step));

  function startLesson(id) {
    S.lesson = S.data.lessons.find((l) => l.id === id) || S.data.lessons[0];
    Object.assign(S, { step: 0, mistakes: 0, done: false });
    resetStep();
    history.replaceState(null, "", "#" + S.data.topic + "--" + S.lesson.id);
    renderLessons();
    renderAll();
  }

  function resetStep() {
    Object.assign(S, { keyIdx: 0, typed: "", shift: false, wrongHere: 0, hintShown: false, answered: null, tried: [] });
    const scr = S.done ? null : screenBefore(S.step);
    S.menuSel = scr && scr.type === "menu" ? scr.sel : null;
    S.hl = scr && current().scroll != null ? scr.hl || 0 : null;
    // A list editor is edited live: typed numbers go into cells as the student presses EXE.
    S.list = scr && scr.type === "list" ? { fkeys: scr.fkeys, cols: (scr.cols || []).map((c) => c.slice()), cur: (scr.cur || [0, 0]).slice() } : null;
    S.buf = "";
    S.tx = scr && scr.trace && current().trace ? scr.trace.x : null;
    // Options are written with the right answer first; show them in a random order.
    const st = S.done ? null : current();
    S.order = st && st.ask ? st.options.map((_, i) => i).sort(() => Math.random() - 0.5) : null;
  }

  // The key the student should press next, or null.
  function expectedKey() {
    const st = current();
    if (S.done || !st || st.ask) return null;
    if (st.select) {
      const from = MENU.indexOf(S.menuSel), to = MENU.indexOf(st.select);
      if (from === to) return "EXE";
      const dr = Math.floor(to / MENU_COLS) - Math.floor(from / MENU_COLS);
      if (dr) return dr > 0 ? "DOWN" : "UP";
      return to > from ? "RIGHT" : "LEFT";
    }
    if (st.scroll != null) return st.scroll > S.hl ? "DOWN" : "UP";
    if (st.trace) return st.trace.to > S.tx ? "RIGHT" : "LEFT";
    return st.keys[S.keyIdx];
  }

  function showKeyGlow() {
    const st = current();
    if (S.mode === "guided") return true;
    return S.wrongHere >= (S.mode === "practice" ? 1 : 3) || (st && st.select && S.wrongHere >= 2);
  }

  function press(id) {
    const st = current();
    if (S.done || !st || st.ask) return;
    flashKey(id);

    if (st.select) {
      const i = MENU.indexOf(S.menuSel);
      const moves = { LEFT: -1, RIGHT: 1, UP: -MENU_COLS, DOWN: MENU_COLS };
      if (moves[id]) {
        const j = i + moves[id];
        if (j >= 0 && j < MENU.length) S.menuSel = MENU[j];
        return renderAll();
      }
      if (id === "EXE" && S.menuSel === st.select) return nextStep();
      return wrong(id === "EXE" ? "That opens **" + S.menuSel + "**. Move to **" + st.select + "** first." : null);
    }

    if (st.scroll != null) {
      const lines = (screenBefore(S.step).lines || []).length;
      if (id === "UP" || id === "DOWN") {
        S.hl = Math.max(0, Math.min(lines - 1, S.hl + (id === "DOWN" ? 1 : -1)));
        return S.hl === st.scroll ? nextStep() : renderAll();
      }
      return wrong(null);
    }

    if (st.trace) {
      if (id === "LEFT" || id === "RIGHT") {
        S.tx = +(S.tx + (id === "RIGHT" ? 1 : -1) * st.trace.dx).toFixed(10);
        return Math.abs(S.tx - st.trace.to) < 1e-9 ? nextStep() : renderAll();
      }
      return wrong(null);
    }

    if (id !== st.keys[S.keyIdx]) return wrong(null);
    const add = st.entry && st.entry.add && st.entry.add[S.keyIdx];
    S.keyIdx++;
    S.typed += add != null ? add : typedText(id);
    if (S.list) editList(id);
    S.shift = id === "SHIFT";
    if (S.keyIdx === st.keys.length) return nextStep();
    renderAll();
  }

  function editList(id) {
    const L = S.list, [c, r] = L.cur;
    if (/^\d$/.test(id) || id === "DOT" || id === "NEG") S.buf += typedText(id);
    else if (id === "EXE" && S.buf) {
      (L.cols[c] = L.cols[c] || [])[r] = S.buf;
      L.cur = [c, r + 1];
      S.buf = "";
    } else if (id === "RIGHT" || id === "LEFT") L.cur = [Math.max(0, c + (id === "RIGHT" ? 1 : -1)), r];
    else if (id === "DOWN" || id === "UP") L.cur = [c, Math.max(0, r + (id === "DOWN" ? 1 : -1))];
  }

  function wrong(msg) {
    S.mistakes++;
    S.wrongHere++;
    S.shift = false;
    const screen = document.getElementById("screen");
    screen.classList.remove("shake");
    void screen.offsetWidth;
    screen.classList.add("shake");
    const exp = expectedKey();
    let text = msg;
    if (!text) {
      if (S.mode === "practice") text = (current().hint ? current().hint + " " : "") + "Press [[" + LABEL[exp] + "]].";
      else if (S.mode === "guided" || showKeyGlow()) text = "Not that key. Press [[" + LABEL[exp] + "]].";
      else if (S.mode === "practice") text = current().hint || "Read the step again and look for the key on the calculator.";
      else text = "Not quite. Try again, or use **Show hint**.";
    }
    feedback(text, "bad");
    renderAll(true);
  }

  function nextStep() {
    S.step++;
    if (S.step >= S.lesson.steps.length) {
      S.done = true;
      const set = doneSet();
      set.add(S.lesson.id);
      App.store.set(progressKey(), [...set].join(","));
      renderLessons();
    }
    resetStep();
    feedback("", "");
    renderAll();
  }

  function answer(i) {
    const st = current();
    if (S.answered === st.answer) return;
    S.answered = i;
    S.tried.push(i);
    if (i !== st.answer) { S.mistakes++; S.wrongHere++; }
    renderAll();
  }

  function feedback(md, kind) {
    const el = document.getElementById("feedback");
    el.className = "gdc-feedback" + (kind ? " fb-" + kind : "");
    el.innerHTML = md ? inline(md) : "";
  }

  function flashKey(id) {
    const b = document.querySelector('.calc [data-key="' + id + '"]');
    if (!b) return;
    b.classList.remove("pressed");
    void b.offsetWidth;
    b.classList.add("pressed");
  }

  // ---------- Rendering ----------
  function renderAll(keepFeedback) {
    const st = current();
    const scr = shownScreen();
    const entry = !S.done && st && st.entry && S.keyIdx > 0 ? { line: st.entry.line, text: (st.entry.prefix || "") + S.typed } : null;
    document.getElementById("screen").innerHTML = screenSvg(scr, { menuSel: S.menuSel, hl: S.hl, entry, shift: S.shift, list: S.done ? null : S.list, buf: S.buf, tx: S.tx });

    document.querySelectorAll(".calc .key").forEach((b) => b.classList.remove("glow"));
    const exp = expectedKey();
    if (exp && showKeyGlow()) {
      const b = document.querySelector('.calc [data-key="' + exp + '"]');
      if (b) b.classList.add("glow");
    }
    document.querySelector(".calc").classList.toggle("calc-idle", S.done || !!(st && st.ask));

    renderPanel();
    if (!keepFeedback) feedback("", "");
  }

  function stepItem(st, i) {
    const state = S.done || i < S.step ? "done" : i === S.step ? "now" : "next";
    const text = st.ask ? "**Think:** " + st.ask : st.do;
    return '<li class="st-' + state + '"><span class="st-n">' + (state === "done" ? "✓" : i + 1) + "</span><div>" + inline(text) + "</div></li>";
  }

  function renderPanel() {
    const L = S.lesson, st = current();
    const total = L.steps.length;
    let html = '<div class="gdc-task"><div class="gdc-task-head"><span class="chip">' + esc(L.tool) + "</span>" +
      (L.unverified ? '<span class="badge badge-unverified" title="Not yet checked against the official manual">unverified</span>' : "") + "</div>" +
      "<h2>" + esc(L.title) + '</h2><div class="gdc-task-q">' + inline(L.task) + "</div></div>";

    html += '<div class="gdc-progress" aria-label="Step ' + Math.min(S.step + 1, total) + " of " + total + '"><span style="width:' + ((S.done ? total : S.step) / total) * 100 + '%"></span></div>';

    if (S.mode === "exam" && !S.done) {
      html += '<p class="gdc-count">Step ' + (S.step + 1) + " of " + total + "</p>";
      if (st && !st.ask) {
        html += S.hintShown
          ? '<div class="gdc-hint">' + inline(st.do) + "</div>"
          : '<button type="button" class="btn ghost" data-hint>Show hint</button>';
      }
    } else {
      html += '<ol class="gdc-steps mode-' + S.mode + '">' + L.steps.map(stepItem).join("") + "</ol>";
    }

    if (!S.done && st && st.ask) {
      const ok = S.answered === st.answer;
      html += '<div class="gdc-ask"><p>' + inline(st.ask) + '</p><div class="gdc-options">' +
        S.order.map((i) => {
          const cls = i === st.answer && ok ? " opt-ok" : S.tried.includes(i) && i !== st.answer ? " opt-bad" : "";
          return '<button type="button" class="gdc-opt' + cls + '" data-opt="' + i + '"' + (ok || S.tried.includes(i) ? " disabled" : "") + ">" + inline(st.options[i]) + "</button>";
        }).join("") + "</div>" +
        (S.answered != null ? '<p class="gdc-why ' + (ok ? "fb-ok" : "fb-bad") + '">' + (ok ? "Correct. " + inline(st.why) : "Not quite. Look at the screen and try again.") + "</p>" : "") +
        (ok ? '<button type="button" class="btn btn-primary" data-continue>Continue</button>' : "") + "</div>";
    }

    if (S.done) {
      const idx = S.data.lessons.indexOf(L);
      const next = S.data.lessons[idx + 1];
      html += '<div class="gdc-result"><div class="gdc-result-head">' + (S.mistakes ? "Done: " + S.mistakes + " mistake" + (S.mistakes === 1 ? "" : "s") : "Done: no mistakes") + "</div>" +
        inline(L.result) + '<div class="gdc-result-actions"><button type="button" class="btn ghost" data-restart>Try again</button>' +
        (next ? '<button type="button" class="btn btn-primary" data-lesson="' + esc(next.id) + '">Next: ' + esc(next.title) + " →</button>" : "") +
        "</div></div>";
    }

    const panel = document.getElementById("gdc-panel");
    panel.innerHTML = html;
    const now = panel.querySelector(".st-now");
    if (now && window.matchMedia("(min-width: 900px)").matches) now.scrollIntoView({ block: "nearest" });
  }

  function renderLessons() {
    const done = doneSet();
    document.getElementById("gdc-lessons").innerHTML = S.data.lessons.map((l, i) =>
      '<button type="button" class="gdc-lesson" data-lesson="' + esc(l.id) + '" aria-pressed="' + (l === S.lesson) + '">' +
      "<b>" + (done.has(l.id) ? "✓" : String.fromCharCode(65 + i)) + "</b>" + esc(l.title) + "</button>").join("");
    document.querySelectorAll("#gdc-modes button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.mode === S.mode));
    document.getElementById("gdc-mode-note").textContent = MODES[S.mode].note;
  }

  // ---------- Events ----------
  function bind() {
    document.querySelector(".calc").addEventListener("click", (e) => {
      const k = e.target.closest("[data-key]");
      if (k) press(k.dataset.key);
    });
    document.addEventListener("keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.closest("button, input, textarea, select") && (e.key === "Enter" || e.key === " ")) return;
      const id = KEYBOARD[e.key] || (/^\d$/.test(e.key) ? e.key : null);
      if (!id) return;
      e.preventDefault();
      press(id);
    });
    document.querySelector(".gdc-main").addEventListener("click", (e) => {
      const t = e.target;
      const lesson = t.closest("[data-lesson]");
      if (lesson) { startLesson(lesson.dataset.lesson); return window.scrollTo({ top: document.querySelector(".gdc-bar").offsetTop - 8, behavior: "smooth" }); }
      const mode = t.closest("[data-mode]");
      if (mode) { S.mode = mode.dataset.mode; return startLesson(S.lesson.id); }
      const opt = t.closest("[data-opt]");
      if (opt) return answer(+opt.dataset.opt);
      if (t.closest("[data-continue]")) return nextStep();
      if (t.closest("[data-restart]")) return startLesson(S.lesson.id);
      if (t.closest("[data-hint]")) { S.hintShown = true; return renderPanel(); }
    });
  }

  async function init() {
    // A page outside this site (Use of GDC) brings its own lessons: <body data-gdc-lessons="lessons/" data-gdc-default="list">.
    // Its lesson files then carry their own headings (eyebrow, heading) instead of the IB syllabus.
    const own = document.body.dataset.gdcLessons;
    let { topic, lesson } = parseHash();
    if (own && !topic) topic = document.body.dataset.gdcDefault;
    const main = document.querySelector("main");
    let syllabus;
    try {
      if (own) S.data = await App.fetchJSON(own + encodeURIComponent(topic) + ".json");
      else [syllabus, S.data] = await Promise.all([App.loadSyllabus(), App.fetchJSON("content/gdc/" + encodeURIComponent(topic) + ".json")]);
    } catch (e) {
      main.innerHTML = '<div class="wrap"><p class="empty-state">The calculator trainer for this topic is coming soon. <a href="' + (own ? "../" : "index.html") + '">Back</a></p></div>';
      return;
    }
    if (own) {
      document.title = S.data.heading + " · Use of GDC";
      document.getElementById("gdc-eyebrow").textContent = S.data.eyebrow;
      document.getElementById("gdc-title").innerHTML = esc(S.data.heading) + " <em>on the GDC</em>";
    } else {
      const t = syllabus.topics.find((x) => x.id === topic);
      document.title = "Calculator · " + t.title + " · AA SL Review";
      document.getElementById("gdc-eyebrow").textContent = "Topic " + t.mock + " · Calculator trainer";
      document.getElementById("gdc-title").innerHTML = esc(t.title.split(":")[0]) + " <em>on the GDC</em>";
      document.getElementById("gdc-back").href = "topic.html#" + encodeURIComponent(topic) + "--gdc";
    }
    document.getElementById("gdc-modes").innerHTML = Object.keys(MODES).map((m) =>
      '<button type="button" data-mode="' + m + '" aria-pressed="false">' + MODES[m].label + "</button>").join("");
    document.getElementById("gdc-calc").innerHTML = calculatorHtml();
    bind();
    startLesson(lesson);
    // Back/forward or an edited address: another topic needs a fresh load, another lesson does not.
    window.addEventListener("hashchange", () => {
      const h = parseHash();
      if (h.topic !== topic) location.reload();
      else if (h.lesson !== S.lesson.id) startLesson(h.lesson);
    });
  }

  init();
})();

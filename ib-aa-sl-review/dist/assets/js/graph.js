/*
 * Lightweight SVG function grapher (no dependencies).
 *
 * Config (JSON inside a ```graph fence):
 *   expr              "a*(x-h)^2+k"   JS-style expression in x; ^ means power
 *   params            { "a": [min, max, start, step], ... }  sliders
 *   x, y              [min, max] view window
 *   points            [["xExpr", "yExpr", "label"], ...]   exprs may use params
 *   axis              "xExpr"  dashed vertical line (axis of symmetry)
 *   highlight         "negative" | "positive"  mark where f(x) < 0 or > 0 on the x-axis
 *   showDiscriminant  true  show Δ and the nature of the roots (quadratics only)
 *   caption           text under the graph
 */
(function () {
  "use strict";

  const W = 400, H = 300, PAD = 4;
  const NS = "http://www.w3.org/2000/svg";

  function compile(expr, names) {
    const js = expr.replace(/\^/g, "**").replace(/(\d)\s*([a-z(])/gi, "$1*$2");
    // eslint-disable-next-line no-new-func
    return new Function(...names, "with (Math) { return (" + js + "); }");
  }

  function fmt(v) {
    if (!isFinite(v)) return "—";
    const r = Math.round(v * 1000) / 1000;
    return (Object.is(r, -0) ? 0 : r).toString().replace("-", "−");
  }

  function niceStep(range) {
    const raw = range / 8;
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / p;
    return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * p;
  }

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function mount(container) {
    let cfg;
    try { cfg = JSON.parse(container.getAttribute("data-graph")); }
    catch (e) { container.textContent = "Graph configuration error."; return; }

    const params = cfg.params || {};
    const names = Object.keys(params);
    const values = {};
    names.forEach((n) => (values[n] = params[n][2]));

    const f = compile(cfg.expr, ["x", ...names]);
    const pts = (cfg.points || []).map(([xe, ye, label]) => ({ fx: compile(xe, names), fy: compile(ye, names), label }));
    const axisFn = cfg.axis ? compile(cfg.axis, names) : null;

    const [x0, x1] = cfg.x || [-10, 10];
    const [y0, y1] = cfg.y || [-10, 10];
    const sx = (x) => PAD + ((x - x0) / (x1 - x0)) * (W - 2 * PAD);
    const sy = (y) => H - PAD - ((y - y0) / (y1 - y0)) * (H - 2 * PAD);

    const svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": cfg.caption || "Graph" });
    container.appendChild(svg);

    // Static layer: grid, axes, ticks
    const grid = el("g", {}, svg);
    const xs = niceStep(x1 - x0), ys = niceStep(y1 - y0);
    for (let x = Math.ceil(x0 / xs) * xs; x <= x1; x += xs) {
      el("line", { class: "g-grid", x1: sx(x), x2: sx(x), y1: 0, y2: H }, grid);
      if (Math.abs(x) > 1e-9) {
        const t = el("text", { class: "g-tick", x: sx(x), y: Math.min(H - 6, Math.max(14, sy(0) + 14)), "text-anchor": "middle" }, grid);
        t.textContent = fmt(x);
      }
    }
    for (let y = Math.ceil(y0 / ys) * ys; y <= y1; y += ys) {
      el("line", { class: "g-grid", x1: 0, x2: W, y1: sy(y), y2: sy(y) }, grid);
      if (Math.abs(y) > 1e-9) {
        const t = el("text", { class: "g-tick", x: Math.min(W - 6, Math.max(6, sx(0) - 5)), y: sy(y) + 4, "text-anchor": sx(0) < 30 ? "start" : "end" }, grid);
        t.textContent = fmt(y);
      }
    }
    if (y0 <= 0 && y1 >= 0) el("line", { class: "g-axis", x1: 0, x2: W, y1: sy(0), y2: sy(0) }, grid);
    if (x0 <= 0 && x1 >= 0) el("line", { class: "g-axis", x1: sx(0), x2: sx(0), y1: 0, y2: H }, grid);

    const dyn = el("g", {}, svg);

    // Controls
    let readout = null;
    if (names.length) {
      const controls = document.createElement("div");
      controls.className = "graph-controls";
      names.forEach((n) => {
        const [min, max, , step] = params[n];
        const label = document.createElement("label");
        const out = document.createElement("output");
        const input = document.createElement("input");
        Object.assign(input, { type: "range", min, max, step, value: values[n] });
        input.setAttribute("aria-label", n);
        input.addEventListener("input", () => { values[n] = +input.value; out.textContent = fmt(values[n]); draw(); });
        out.textContent = fmt(values[n]);
        label.append(n + " =", out, input);
        controls.appendChild(label);
      });
      container.appendChild(controls);
    }
    if (cfg.showDiscriminant || names.length) {
      readout = document.createElement("div");
      readout.className = "graph-readout";
      readout.setAttribute("aria-live", "polite");
      container.appendChild(readout);
    }
    if (cfg.caption) {
      const c = document.createElement("p");
      c.className = "graph-caption";
      c.textContent = cfg.caption;
      container.appendChild(c);
    }

    function draw() {
      while (dyn.firstChild) dyn.removeChild(dyn.firstChild);
      const pv = names.map((n) => values[n]);
      const fx = (x) => f(x, ...pv);

      // Highlight intervals of the x-axis where f < 0 (or > 0)
      if (cfg.highlight) {
        const want = cfg.highlight === "negative" ? (v) => v < 0 : (v) => v > 0;
        const N = 600;
        let start = null;
        for (let i = 0; i <= N; i++) {
          const x = x0 + ((x1 - x0) * i) / N;
          const ok = want(fx(x));
          if (ok && start === null) start = x;
          if ((!ok || i === N) && start !== null) {
            el("line", { class: "g-hl", x1: sx(start), x2: sx(x), y1: sy(0), y2: sy(0) }, dyn);
            start = null;
          }
        }
      }

      if (axisFn) {
        const ax = axisFn(...pv);
        el("line", { class: "g-sym", x1: sx(ax), x2: sx(ax), y1: 0, y2: H }, dyn);
      }

      // Curve
      let d = "", pen = false;
      const N = 400;
      for (let i = 0; i <= N; i++) {
        const x = x0 + ((x1 - x0) * i) / N;
        const y = fx(x);
        if (!isFinite(y) || y < y0 - (y1 - y0) || y > y1 + (y1 - y0)) { pen = false; continue; }
        d += (pen ? "L" : "M") + sx(x).toFixed(1) + " " + sy(y).toFixed(1);
        pen = true;
      }
      el("path", { class: "g-curve", d }, dyn);

      // Points
      pts.forEach((p) => {
        const px = p.fx(...pv), py = p.fy(...pv);
        if (px < x0 || px > x1 || py < y0 || py > y1) return;
        el("circle", { class: "g-pt", cx: sx(px), cy: sy(py), r: 4.5 }, dyn);
        if (p.label) {
          const right = sx(px) < W - 90;
          const t = el("text", { class: "g-pt-label", x: sx(px) + (right ? 8 : -8), y: sy(py) - 8, "text-anchor": right ? "start" : "end" }, dyn);
          t.textContent = p.label === "vertex" ? "(" + fmt(px) + ", " + fmt(py) + ")" : p.label;
        }
      });

      if (readout) {
        const parts = [];
        if (names.length) parts.push(names.map((n) => n + " = " + fmt(values[n])).join(",  "));
        if (cfg.showDiscriminant) {
          const c = fx(0), a = (fx(1) + fx(-1) - 2 * c) / 2, b = (fx(1) - fx(-1)) / 2;
          const disc = b * b - 4 * a * c;
          const nature = Math.abs(disc) < 1e-9 ? "two equal real roots" : disc > 0 ? "two distinct real roots" : "no real roots";
          parts.push("Δ = " + fmt(disc) + "  →  " + nature);
        }
        readout.textContent = parts.join("   ·   ");
      }
    }
    draw();
  }

  window.Graph = { mountAll: (root) => root.querySelectorAll(".graph[data-graph]").forEach(mount) };
})();

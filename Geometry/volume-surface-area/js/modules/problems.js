// Module 7 · Real-world Problems
import { createViewer, THREE } from "../viewer.js";
import { initShell, onKey, createSteps, quiz, tex, store } from "../shell.js";
import { geo, glassMat, waterMat, solidMat, outlined } from "../solids.js";
import { n, eqv, sliders, tabs, formulaBar, workingHTML, dimLine, COLORS, v3 } from "../kit.js";
import * as F from "../formulas.js";

const { PI, floor, cbrt, sqrt } = Math;
const pick = (a) => a[floor(Math.random() * a.length)];
const big = (x) => x.toLocaleString("en-GB").replace(/,/g, "\\,");
const ease = (t) => t * t * (3 - 2 * t);

initShell();
const viewer = createViewer(document.getElementById("viewer"));
const $ = (id) => document.getElementById(id);

// ---------- Problems: gen() → numbers; text; solution lines; answer; 3D scene with an animation ----------
const PROBLEMS = {
  tank: {
    name: "Filling a tank",
    gen() {
      const cyl = Math.random() < 0.5, q = pick([4, 5, 6, 8, 10, 12]);
      return cyl ? { cyl, r: pick([20, 25, 30, 35]), h: pick([50, 60, 80, 100]), q } : { cyl, l: pick([40, 50, 60, 80]), w: pick([30, 40, 50]), h: pick([30, 40, 50, 60]), q };
    },
    text: (p) => (p.cyl
      ? `A cylindrical tank has radius <b>${p.r} cm</b> and height <b>${p.h} cm</b>.`
      : `A tank in the shape of a cuboid measures <b>${p.l} cm</b> by <b>${p.w} cm</b> by <b>${p.h} cm</b>.`) +
      ` Water flows in at <b>${p.q} litres per minute</b>. How long does it take to fill the empty tank? Give your answer in minutes.`,
    solve(p) {
      const V = p.cyl ? F.cylinder.volume(p.r, p.h) : p.l * p.w * p.h, L = V / 1000, t = L / p.q;
      return {
        answer: t, unit: "minutes", units: ["minutes", "seconds", "litres", "cm³"],
        lines: [
          ["Volume of the tank", p.cyl ? "V = \\pi \\times " + p.r + "^2 \\times " + p.h + eqv(V) + "\\ \\text{cm}^3" : `V = ${p.l} \\times ${p.w} \\times ${p.h} = ${big(V)}\\ \\text{cm}^3`],
          ["Change to litres: ÷ 1000", (p.cyl ? n(V) : big(V)) + " \\div 1000" + eqv(L) + "\\ \\text{litres}"],
          ["Time = volume ÷ rate", n(L) + " \\div " + p.q + eqv(t) + "\\ \\text{minutes}"],
        ],
      };
    },
    build(p, sol) {
      const k = 6 / Math.max(p.cyl ? 2 * p.r : p.l, p.h);
      const R = viewer.root, H = p.h * k;
      R.add(outlined(p.cyl ? geo.cylinder(p.r * k, H) : geo.box(p.l * k, p.w * k, H), glassMat()));
      const water = new THREE.Mesh(p.cyl ? geo.cylinder(p.r * k * 0.99, 1) : geo.box(p.l * k * 0.99, p.w * k * 0.99, 1), waterMat());
      water.scale.y = 0.0001;
      const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 12), waterMat());
      const clock = viewer.label("t = 0 min", "lbl key");
      clock.position.set(0, H + 1.6, 0);
      R.add(water, stream, clock);
      const w = p.cyl ? p.r * k : (p.l * k) / 2;
      R.add(dimLine(viewer, v3(-w - 0.35, 0, 0), v3(-w - 0.35, H, 0), "h = " + p.h + " cm", { r: 0.03 }));
      return (u) => {
        water.scale.y = Math.max(u * H, 0.0001);
        stream.visible = u > 0 && u < 1;
        stream.position.set(0, (H + 1.2 + u * H) / 2, 0);
        stream.scale.y = H + 1.2 - u * H;
        clock.element.textContent = "t = " + n(u * sol.answer) + " min";
      };
    },
    duration: 6,
  },
  melt: {
    name: "Melt and recast",
    gen() {
      const toSpheres = Math.random() < 0.55;
      const b = { a: pick([10, 12, 15]), b: pick([6, 8, 10]), c: pick([4, 5, 6]) };
      return toSpheres ? { ...b, toSpheres, r: pick([1.5, 2, 2.5]) } : { ...b, toSpheres, R: pick([3, 4, 5]) };
    },
    text: (p) => `A metal cuboid measures <b>${p.a} cm</b> by <b>${p.b} cm</b> by <b>${p.c} cm</b>. It is melted down and made into ` +
      (p.toSpheres ? `spheres of radius <b>${p.r} cm</b>. How many <b>complete</b> spheres can be made?` : `a cylinder of radius <b>${p.R} cm</b>. Find the height of the cylinder.`),
    solve(p) {
      const V = p.a * p.b * p.c;
      if (p.toSpheres) {
        const v = F.sphere.volume(p.r), q = V / v;
        return {
          answer: floor(q), unit: "spheres", units: ["spheres", "cm³", "cm"], integer: true,
          lines: [
            ["Volume of the metal", `V = ${p.a} \\times ${p.b} \\times ${p.c} = ${V}\\ \\text{cm}^3`],
            ["Volume of one sphere", "\\tfrac{4}{3}\\pi \\times " + n(p.r) + "^3" + eqv(v) + "\\ \\text{cm}^3"],
            ["Number of spheres", V + " \\div " + n(v) + "\\ldots" + eqv(q)],
            ["Only complete spheres: round down", "\\text{" + floor(q) + " spheres}"],
          ],
        };
      }
      const h = V / (PI * p.R * p.R);
      return {
        answer: h, unit: "cm", units: ["cm", "cm²", "cm³"],
        lines: [
          ["The volume stays the same", `V = ${p.a} \\times ${p.b} \\times ${p.c} = ${V}\\ \\text{cm}^3`],
          ["Cylinder: πR²h = V", "\\pi \\times " + p.R + "^2 \\times h = " + V],
          ["Solve for h", "h = \\frac{" + V + "}{\\pi \\times " + p.R + "^2}" + eqv(h) + "\\ \\text{cm}"],
        ],
      };
    },
    build(p, sol) {
      const k = 5 / Math.max(p.a, p.b, 8), R = viewer.root;
      const block = outlined(geo.box(p.a * k, p.b * k, p.c * k), solidMat("#9aa3ad"));
      block.position.x = -3.5;
      R.add(block, dimLine(viewer, v3(-3.5 - (p.a * k) / 2, 0, (p.b * k) / 2 + 0.3), v3(-3.5 + (p.a * k) / 2, 0, (p.b * k) / 2 + 0.3), p.a + " cm", { r: 0.025 }));
      let grow;
      if (p.toSpheres) {
        const N = Math.min(sol.answer, 400), side = Math.ceil(sqrt(N)), r = p.r * k;
        const balls = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 20, 12), solidMat("#b8c0c8"), N);
        const m = new THREE.Matrix4();
        for (let i = 0; i < N; i++) { m.makeTranslation(1 + (i % side) * 2.1 * r, r, ((floor(i / side) - side / 2) * 2.1 * r)); balls.setMatrixAt(i, m); }
        balls.count = 0;
        R.add(balls);
        grow = (u) => { balls.count = floor(u * N); };
      } else {
        const cyl = outlined(geo.cylinder(p.R * k, 1), solidMat("#b8c0c8"));
        cyl.position.x = 3;
        cyl.scale.y = 0.0001;
        const lbl = viewer.label("h = ?", "lbl key");
        R.add(cyl, lbl);
        grow = (u) => { cyl.scale.y = Math.max(u * sol.answer * k, 0.0001); lbl.position.set(3 + p.R * k + 0.8, u * sol.answer * k, 0); lbl.element.textContent = u >= 1 ? "h ≈ " + n(sol.answer) + " cm" : "h = ?"; };
      }
      return (u) => { block.scale.setScalar(Math.max(cbrt(1 - u), 0.0001)); grow(u); };
    },
    duration: 4,
  },
  paint: {
    name: "Painting",
    gen: () => ({ r: pick([0.6, 0.8, 1, 1.2]), h: pick([1.5, 2, 2.5, 3]), k: pick([8, 10, 12]) }),
    text: (p) => `A closed cylindrical water tank has radius <b>${p.r} m</b> and height <b>${p.h} m</b>. The whole outside, including the top and bottom, is painted. One litre of paint covers <b>${p.k} m²</b>. How many litres of paint are needed?`,
    solve(p) {
      const A = F.cylinder.surfaceArea(p.r, p.h), L = A / p.k;
      return {
        answer: L, unit: "litres", units: ["litres", "m²", "m³"],
        lines: [
          ["Surface area: 2 circles + curved surface", "A = 2\\pi \\times " + n(p.r) + "^2 + 2\\pi \\times " + n(p.r) + " \\times " + n(p.h) + eqv(A) + "\\ \\text{m}^2"],
          ["Litres = area ÷ area per litre", n(A) + " \\div " + p.k + eqv(L) + "\\ \\text{litres}"],
        ],
      };
    },
    build(p) {
      const k = 2.6 / Math.max(p.r, p.h / 2), R = viewer.root, H = p.h * k, r = p.r * k;
      R.add(outlined(geo.cylinder(r, H), solidMat("#c9ced4")));
      const paint = new THREE.Mesh(geo.cylinder(r * 1.01, 1), solidMat(COLORS[5]));
      paint.scale.y = 0.0001;
      R.add(paint, dimLine(viewer, v3(r + 0.4, 0, 0), v3(r + 0.4, H, 0), "h = " + p.h + " m", { r: 0.03 }), dimLine(viewer, v3(0, H + 0.03, 0), v3(-r, H + 0.03, 0), "r = " + p.r + " m", { r: 0.03 }));
      return (u) => { paint.scale.y = Math.max(u * H * 1.005, 0.0001); };
    },
    duration: 3,
  },
  rise: {
    name: "Rising water",
    gen() { const R = pick([6, 8, 10]), r = pick([3, 4, 5].filter((x) => x < R - 1)); return { R, r, d: pick([2 * r + 2, 2 * r + 4, 2 * r + 5]) }; },
    text: (p) => `A cylinder of radius <b>${p.R} cm</b> contains water to a depth of <b>${p.d} cm</b>. A metal sphere of radius <b>${p.r} cm</b> is dropped in and sinks to the bottom. By how much does the water level rise?`,
    solve(p) {
      const v = F.sphere.volume(p.r), rise = v / (PI * p.R * p.R);
      return {
        answer: rise, unit: "cm", units: ["cm", "cm²", "cm³"],
        lines: [
          ["The water rises by the volume of the sphere", "V = \\tfrac{4}{3}\\pi \\times " + p.r + "^3" + eqv(v) + "\\ \\text{cm}^3"],
          ["That volume is a cylinder of radius " + p.R + " and height x", "\\pi \\times " + p.R + "^2 \\times x = " + n(v)],
          ["Solve for x", "x = \\frac{" + n(v) + "}{\\pi \\times " + p.R + "^2}" + eqv(rise) + "\\ \\text{cm}"],
        ],
      };
    },
    build(p, sol) {
      const k = 3 / p.R, R = viewer.root, H = (p.d + sol.answer + p.r) * k;
      R.add(outlined(geo.cylinder(p.R * k, H), glassMat()));
      const water = new THREE.Mesh(geo.cylinder(p.R * k * 0.99, 1), waterMat());
      const ball = outlined(geo.sphere(p.r * k), solidMat("#9aa3ad"), { edges: false });
      const top = H + p.r * k * 2.4;
      R.add(water, ball, dimLine(viewer, v3(-p.R * k - 0.4, 0, 0), v3(-p.R * k - 0.4, p.d * k, 0), "d = " + p.d + " cm", { r: 0.03 }));
      const lbl = viewer.label("", "lbl key");
      R.add(lbl);
      return (u) => {
        const drop = ease(Math.min(1, u * 1.4));
        ball.position.y = (top - p.r * k) * (1 - drop);
        // the level rises as the ball goes under: use the part of the ball below the surface
        const c = ball.position.y + p.r * k, rr = p.r * k, A = PI * (p.R * k) ** 2;
        let L = p.d * k;
        for (let i = 0; i < 30; i++) { const dd = Math.max(0, Math.min(2 * rr, L - (c - rr))); L = p.d * k + (PI * dd * dd * (3 * rr - dd)) / 3 / A; }
        water.scale.y = L;
        lbl.position.set(p.R * k + 1, L, 0);
        lbl.element.textContent = "rise = " + n((L - p.d * k) / k) + " cm";
      };
    },
    duration: 3,
  },
  same: { name: "Same volume, different SA", explore: true },
};

// ---------- State ----------
const S = { tab: "tank", p: null, sol: null, u: 0, playing: false, scene: null, score: store.get("problems", { right: 0, tries: 0 }) };
const prob = () => PROBLEMS[S.tab];

function newProblem() {
  S.p = prob().gen();
  S.sol = prob().solve(S.p);
  S.u = 0; S.playing = false;
  build(); renderMain(); makeSteps();
}
function build() {
  viewer.clear();
  if (prob().explore) { buildExplore(); return; }
  S.scene = prob().build(S.p, S.sol);
  S.scene(S.u);
  syncFoot();
}
viewer.onTick((dt) => {
  if (!S.playing || prob().explore) return;
  S.u = Math.min(1, S.u + dt / prob().duration);
  S.scene(S.u);
  if (S.u >= 1) { S.playing = false; syncFoot(); }
});
function play() {
  if (prob().explore) return;
  if (S.u >= 1) S.u = 0;
  S.playing = !S.playing; syncFoot();
}
function syncFoot() {
  $("play").hidden = !!prob().explore;
  $("new").hidden = !!prob().explore;
  $("play").textContent = S.playing ? "Pause" : S.u >= 1 ? "Play again" : "Play";
}
$("play").addEventListener("click", play);
$("new").addEventListener("click", newProblem);
onKey("space", play);
onKey("n", newProblem);
onKey("r", () => viewer.resetView());
$("reset-view").addEventListener("click", () => viewer.resetView());

// ---------- Answer box ----------
function renderMain() {
  if (prob().explore) return renderExplore();
  const sol = S.sol;
  const units = [...sol.units].sort();
  $("main").innerHTML = `<h3>Problem</h3><p class="problem">${prob().text(S.p)}</p>
    <div class="answer student-only"><input type="text" id="ans" inputmode="decimal" placeholder="Answer" aria-label="Answer">
      <select id="ans-unit" class="field" aria-label="Unit"><option value="">unit…</option>${units.map((u) => `<option>${u}</option>`).join("")}</select>
      <button class="btn" type="button" id="check">Check</button></div>
    <p class="fb" id="fb" aria-live="polite"></p>
    <p class="hint student-only">Give your answer to 3 significant figures${sol.integer ? " (a whole number here)" : ""}. <span class="score">Score: ${S.score.right} / ${S.score.tries}</span></p>`;
  $("check").addEventListener("click", check);
  $("ans").addEventListener("keydown", (e) => { if (e.key === "Enter") check(); });
}
function check() {
  const sol = S.sol, raw = $("ans").value.trim(), unit = $("ans-unit").value, fb = $("fb");
  const val = parseFloat(raw.replace(/\s/g, ""));
  if (!raw) { fb.className = "fb bad"; fb.textContent = "Type an answer first."; return; }
  const ok = sol.integer ? val === sol.answer : F.checkAnswer(val, sol.answer);
  S.score.tries++;
  if (ok && unit === sol.unit) {
    S.score.right++;
    fb.className = "fb ok"; fb.textContent = "Correct! " + (sol.integer ? sol.answer : F.sig(sol.answer)) + " " + sol.unit + ". Press Next in the steps to see the full working.";
    S.playing = true; S.u = 0; syncFoot();
  } else if (ok) {
    fb.className = "fb bad"; fb.textContent = "The number is right, but check the unit.";
  } else {
    fb.className = "fb bad"; fb.textContent = "Not quite. Hint: " + sol.lines[0][0].toLowerCase() + " first. You can see the working step by step.";
  }
  store.set("problems", S.score);
  document.querySelector("#main .score").textContent = "Score: " + S.score.right + " / " + S.score.tries;
}

function makeSteps() {
  if (prob().explore) return makeExploreSteps();
  const lines = S.sol.lines;
  const list = [{ title: "Read the problem", html: "<p>" + prob().text(S.p) + "</p>", enter: () => { S.u = 0; S.playing = false; S.scene(0); syncFoot(); } }];
  lines.forEach((_, i) => list.push({
    title: "Step " + (i + 1) + ": " + lines[i][0],
    html: workingHTML(lines.slice(0, i + 1)),
    enter: () => { if (i === lines.length - 1) { S.u = 0; S.playing = true; syncFoot(); } },
  }));
  list.push({ title: "Answer", html: workingHTML(lines) + `<p class="big-count" style="font-size:1.5rem">${S.sol.integer ? S.sol.answer : F.sig(S.sol.answer)} ${S.sol.unit}</p>`, enter: () => { S.u = 1; S.playing = false; S.scene(1); syncFoot(); } });
  createSteps($("steps"), list);
  formulaBar($("formulas"), [
    ["v", "\\text{Cuboid } V = lwh, \\quad \\text{cylinder } V = \\pi r^2 h, \\quad \\text{sphere } V = \\tfrac{4}{3}\\pi r^3"],
    ["l", "1000\\ \\text{cm}^3 = 1\\ \\text{litre}"],
    ["t", "\\text{time} = \\text{volume} \\div \\text{rate}"],
    ["a", "\\text{Cylinder } SA = 2\\pi r^2 + 2\\pi r h"],
  ], { tank: "t", melt: "v", paint: "a", rise: "v" }[S.tab]);
}

// ---------- Same volume, different surface area ----------
const E = { shape: "cuboid", V: 1000, x: 6 };
function exploreDims() {
  const { V, x } = E;
  return E.shape === "cuboid" ? { h: V / (x * x), A: 2 * x * x + (4 * V) / x, best: cbrt(V) } : { h: V / (PI * x * x), A: 2 * PI * x * x + (2 * V) / x, best: cbrt(V / (2 * PI)) };
}
function buildExplore() {
  const { h } = exploreDims(), k = 0.4;
  viewer.root.add(outlined(E.shape === "cuboid" ? geo.box(E.x * k, E.x * k, h * k) : geo.cylinder(E.x * k, h * k), solidMat("#c9a36a")));
  const w = E.shape === "cuboid" ? (E.x * k) / 2 : E.x * k;
  viewer.root.add(dimLine(viewer, v3(w + 0.4, 0, 0), v3(w + 0.4, h * k, 0), "h ≈ " + n(h) + " cm", { r: 0.03 }),
    dimLine(viewer, v3(-w, 0, w + 0.4), v3(E.shape === "cuboid" ? w : 0, 0, w + 0.4), (E.shape === "cuboid" ? "x = " : "r = ") + n(E.x) + " cm", { r: 0.03 }));
  syncFoot();
}
function renderExplore() {
  const { h, A, best } = exploreDims(), cub = E.shape === "cuboid";
  $("main").innerHTML = `<h3>Packaging</h3><p class="problem">Every box below holds <b>${E.V} cm³</b>. Which shape uses the <b>least cardboard</b>?</p>
    <div class="seg" role="group" aria-label="Shape"><button type="button" data-s="cuboid" aria-pressed="${cub}">Square-based cuboid</button><button type="button" data-s="cylinder" aria-pressed="${!cub}">Cylinder</button></div>` +
    workingHTML([
      ["Height from the volume", (cub ? "h = \\frac{V}{x^2} = \\frac{" + E.V + "}{" + n(E.x) + "^2}" : "h = \\frac{V}{\\pi r^2} = \\frac{" + E.V + "}{\\pi \\times " + n(E.x) + "^2}") + eqv(h) + "\\ \\text{cm}"],
      ["Surface area", (cub ? "SA = 2x^2 + 4xh" : "SA = 2\\pi r^2 + 2\\pi r h") + eqv(A) + "\\ \\text{cm}^2"],
    ]) + '<canvas class="chart" id="chart" aria-label="Graph of surface area against ' + (cub ? "x" : "r") + '"></canvas>' +
    `<p class="hint">Smallest surface area when ${cub ? "x" : "r"} ≈ ${n(best)} cm: ${cub ? "a <b>cube</b>." : "the height equals the diameter (<b>h = 2r</b>)."}</p>`;
  $("main").querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { E.shape = b.dataset.s; E.x = E.shape === "cuboid" ? 6 : 3; renderControlsExplore(); build(); renderExplore(); }));
  drawChart();
}
function drawChart() {
  const c = $("chart"), dpr = window.devicePixelRatio || 1, W = c.clientWidth, H = c.clientHeight;
  c.width = W * dpr; c.height = H * dpr;
  const g = c.getContext("2d");
  g.scale(dpr, dpr);
  const cs = getComputedStyle(document.documentElement);
  const [lo, hi] = E.shape === "cuboid" ? [3, 25] : [2, 12];
  const f = (x) => (E.shape === "cuboid" ? 2 * x * x + (4 * E.V) / x : 2 * PI * x * x + (2 * E.V) / x);
  const xs = Array.from({ length: 120 }, (_, i) => lo + ((hi - lo) * i) / 119), ys = xs.map(f);
  const ymax = Math.max(...ys), ymin = Math.min(...ys) * 0.9;
  const X = (x) => 36 + ((x - lo) / (hi - lo)) * (W - 46), Y = (y) => H - 22 - ((y - ymin) / (ymax - ymin)) * (H - 34);
  g.strokeStyle = cs.getPropertyValue("--line"); g.lineWidth = 1;
  g.beginPath(); g.moveTo(36, 8); g.lineTo(36, H - 22); g.lineTo(W - 6, H - 22); g.stroke();
  g.fillStyle = cs.getPropertyValue("--muted"); g.font = "12px Nunito Sans, sans-serif";
  g.fillText(E.shape === "cuboid" ? "x (cm)" : "r (cm)", W - 50, H - 6); g.fillText("SA", 4, 16);
  g.strokeStyle = cs.getPropertyValue("--navy"); g.lineWidth = 2.5;
  g.beginPath(); xs.forEach((x, i) => (i ? g.lineTo(X(x), Y(ys[i])) : g.moveTo(X(x), Y(ys[i])))); g.stroke();
  g.fillStyle = "#d55e00";
  g.beginPath(); g.arc(X(E.x), Y(f(E.x)), 5, 0, 2 * PI); g.fill();
}
function renderControlsExplore() {
  const defs = [["V", "Volume V", E.V, 200, 3000, 100, "cm³"], E.shape === "cuboid" ? ["x", "Base side x", E.x, 3, 25, 0.5] : ["x", "Radius r", E.x, 2, 12, 0.25]];
  sliders($("controls"), defs, E, () => { build(); renderExplore(); });
}
function makeExploreSteps() {
  const set = (shape, x) => () => { E.shape = shape; if (x) E.x = x; renderControlsExplore(); build(); renderExplore(); };
  createSteps($("steps"), [
    { title: "Same volume", html: "<p>A company needs a box that holds a fixed volume. Changing the shape changes how much cardboard it needs: the <b>surface area</b>.</p>", enter: set("cuboid", 15) },
    { title: "Tall and thin, or short and wide", html: "<p>Move the slider. Very flat or very tall boxes both need a lot of cardboard.</p>", enter: set("cuboid", 4) },
    { title: "The best cuboid", html: "<p>The smallest surface area is a <b>cube</b>.</p>", enter: set("cuboid", Math.round(cbrt(E.V) * 2) / 2) },
    { title: "The best cylinder", html: "<p>For a cylinder, the best is when the height equals the diameter.</p>", enter: set("cylinder", Math.round(cbrt(E.V / (2 * PI)) * 4) / 4) },
  ]);
  formulaBar($("formulas"), [["c", "\\text{Cuboid: } SA = 2x^2 + 4xh, \\ h = \\frac{V}{x^2}"], ["y", "\\text{Cylinder: } SA = 2\\pi r^2 + 2\\pi r h, \\ h = \\frac{V}{\\pi r^2}"]], E.shape === "cuboid" ? "c" : "y");
}

function setTab(k) {
  S.tab = k;
  tabs($("tabs"), Object.entries(PROBLEMS).map(([key, p]) => [key, p.name]), k, setTab);
  $("controls-panel").hidden = !prob().explore;
  if (prob().explore) { renderControlsExplore(); build(); renderExplore(); makeExploreSteps(); viewer.frame(v3(0, 2.5, 0), 6, v3(0.8, 0.6, 1.2)); return; }
  newProblem();
  viewer.frame(v3(0, 2.6, 0), 6.5, v3(0.5, 0.45, 1.2));
}

quiz($("quiz"), [
  { q: "A tank holds 150 litres. Water flows in at 6 litres per minute. How long does it take to fill?", options: ["25 minutes", "900 minutes", "144 minutes", "2.5 minutes"], hint: "Time = volume ÷ rate.", explain: "150 ÷ 6 = 25 minutes." },
  { q: "When a solid is melted and recast, what stays the same?", options: ["The volume", "The surface area", "The shape", "The height"], hint: "No metal is lost.", explain: "So set the two volumes equal." },
  { q: "You can make 23.8 spheres from the metal. How many complete spheres is that?", options: ["23", "24", "23.8", "20"], hint: "A part of a sphere is not a sphere.", explain: "Always round down here." },
]);

setTab("tank");

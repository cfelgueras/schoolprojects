// Module 3 · Why one third? Pour a pyramid or cone into the prism or cylinder with the same base and height;
// lower a sphere into the cylinder that just holds it (Archimedes).
import { createViewer, THREE } from "../viewer.js";
import { initShell, onKey, createSteps, quiz, tex, texHTML } from "../shell.js";
import { geo, glassMat, waterMat, solidMat, outlined } from "../solids.js";
import { n, work, sliders, defaults, tabs, formulaBar, workingHTML, dimLine, COLORS, v3 } from "../kit.js";
import * as F from "../formulas.js";

const { PI, cbrt, max, min } = Math;
const ease = (t) => t * t * (3 - 2 * t);

const MODES = {
  pyramid: { name: "Pyramid → prism", dims: [["b", "Base side b", 4, 2, 6], ["h", "Height h", 5, 2, 7]] },
  cone: { name: "Cone → cylinder", dims: [["r", "Radius r", 2, 1, 3], ["h", "Height h", 5, 2, 7]] },
  sphere: { name: "Sphere & cylinder", dims: [["r", "Radius r", 2.5, 1, 3.5]] },
};

initShell();
const viewer = createViewer(document.getElementById("viewer"));
const $ = (id) => document.getElementById(id);
const S = { mode: "pyramid", dims: {}, playing: false, focus: null };
Object.keys(MODES).forEach((k) => (S.dims[k] = defaults(MODES[k].dims)));
const d = () => S.dims[S.mode];

// ---------- Pour animation (pyramid / cone) ----------
// phases of one pour: fill the cup, carry it over, tip it, pour, bring it back
const PHASES = [["fill", 1.3], ["move", 0.9], ["tip", 0.6], ["pour", 1.4], ["back", 1.0]];
let A = null; // animation state and the 3D objects it moves

function buildPour() {
  const { h } = d(), cone = S.mode === "cone";
  const w = cone ? 2 * d().r : d().b, D = w / 2 + 2.2;
  // container: prism or cylinder with the same base and height
  const container = outlined(cone ? geo.cylinder(d().r, h) : geo.box(w, w, h), glassMat());
  container.position.x = D;
  const tankWater = new THREE.Mesh(cone ? geo.cylinder(d().r * 0.985, 1) : geo.box(w * 0.985, w * 0.985, 1), waterMat());
  tankWater.position.x = D;
  tankWater.scale.y = 0.0001;
  // cup: the pyramid or cone upside down; its pivot is the middle of its open top
  const cup = new THREE.Group();
  const shape = () => (cone ? geo.cone(d().r, h) : geo.pyramid(w, w, h)).rotateX(PI).translate(0, h, 0); // apex at the bottom (y = 0)
  const glass = outlined(shape(), glassMat("#f3c77a"));
  glass.position.y = -h;
  const waterHolder = new THREE.Group();
  waterHolder.position.y = -h;
  const cupWater = new THREE.Mesh(shape(), waterMat());
  cupWater.scale.setScalar(0.0001);
  waterHolder.add(cupWater);
  cup.add(glass, waterHolder);
  const home = v3(-D, h, 0), over = v3(D - w * 0.15, h + 0.6, 0);
  cup.position.copy(home);
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1, 12), waterMat());
  stream.visible = false;
  viewer.root.add(container, tankWater, cup, stream);

  const r = 0.035;
  viewer.root.add(dimLine(viewer, v3(D + w / 2 + 0.35, 0, w / 2), v3(D + w / 2 + 0.35, h, w / 2), "h = " + n(h) + " cm", { r }));
  viewer.root.add(dimLine(viewer, v3(-D - w / 2 - 0.35, 0, 0), v3(-D - w / 2 - 0.35, h, 0), "h = " + n(h) + " cm", { r }));
  viewer.root.add(dimLine(viewer, v3(D - w / 2, 0, w / 2 + 0.3), v3(D + w / 2, 0, w / 2 + 0.3), (cone ? "2r = " + n(w) : "b = " + n(w)) + " cm", { r }));

  A = { kind: "pour", pours: 0, phase: -1, t: 0, fill: 0, level: 0, cup, cupWater, tankWater, stream, home, over, h };
}

function stepPour(dt) {
  if (A.phase < 0) return;
  const [name, dur] = PHASES[A.phase];
  A.t = min(1, A.t + dt / dur);
  const k = ease(A.t);
  A.stream.visible = false;
  if (name === "fill") {
    A.fill = A.t;
    const top = v3(A.home.x, A.h + 3, 0), bottom = v3(A.home.x, cbrt(max(A.fill, 0.001)) * A.h, 0);
    showStream(top, bottom);
  } else if (name === "move") {
    A.cup.position.lerpVectors(A.home, A.over, k);
  } else if (name === "tip") {
    A.cup.rotation.z = -1.9 * k;
  } else if (name === "pour") {
    A.fill = 1 - A.t;
    A.level = (A.pours + A.t) / 3;
    showStream(A.cup.position, v3(A.cup.position.x, max(A.level * A.h, 0.02), 0));
  } else if (name === "back") {
    A.cup.rotation.z = -1.9 * (1 - k);
    A.cup.position.lerpVectors(A.over, A.home, k);
  }
  A.cupWater.scale.setScalar(max(cbrt(A.fill) * 0.97, 0.0001)); // volume grows with the cube of the depth
  A.tankWater.scale.y = max(A.level * A.h, 0.0001);
  if (A.t >= 1) {
    A.t = 0;
    A.phase++;
    if (A.phase === PHASES.length) {
      A.pours++;
      A.phase = -1;
      // keep pouring until the prism or cylinder is full, unless paused
      if (A.pours < 3 && S.playing && !A.once) A.phase = 0;
      else S.playing = false;
      A.once = false;
      renderMain(); syncButtons();
    }
  }
}
function showStream(p, q) {
  A.stream.visible = true;
  A.stream.position.copy(p).add(q).multiplyScalar(0.5);
  A.stream.scale.y = max(p.distanceTo(q), 0.01);
}

// ---------- Archimedes (sphere) ----------
function buildSphere() {
  const { r } = d(), H = 2 * r;
  const tube = outlined(geo.cylinder(r, H), glassMat());
  const water = new THREE.Mesh(geo.cylinder(r * 0.985, 1), waterMat());
  water.scale.y = H;
  const ball = outlined(geo.sphere(r * 0.985), solidMat(COLORS[0]), { edges: false });
  ball.position.y = -r * 0.985; // geo.sphere sits on y = 0: move it so its centre is the origin
  const holder = new THREE.Group();
  holder.add(ball);
  const top = H + 1.3 * r;
  holder.position.y = top;
  const puddle = new THREE.Mesh(new THREE.RingGeometry(r * 1.02, r * 1.03, 64).rotateX(-PI / 2), waterMat());
  puddle.position.y = 0.01;
  viewer.root.add(tube, water, holder, puddle);
  const rr = 0.03;
  viewer.root.add(dimLine(viewer, v3(r + 0.35, 0, 0), v3(r + 0.35, H, 0), "2r = " + n(H) + " cm", { r: rr }));
  viewer.root.add(dimLine(viewer, v3(0, H + 0.02, 0), v3(r, H + 0.02, 0), "r = " + n(r) + " cm", { r: rr }));
  A = { kind: "sphere", phase: -1, t: 0, water, holder, puddle, r, H, top, Vw: PI * r * r * H, spilled: 0, done: false };
}
// volume of the ball below the height y (ball centre at c)
function below(y, c, r) { const dd = Math.max(0, Math.min(2 * r, y - (c - r))); return (PI * dd * dd * (3 * r - dd)) / 3; }
function stepSphere(dt) {
  if (A.phase < 0) return;
  const dur = A.phase === 1 ? 0.7 : 2.6;
  A.t = min(1, A.t + dt / dur);
  const k = ease(A.t), { r, H, top } = A;
  const c = A.phase === 0 ? top + (r - top) * k : A.phase === 2 ? r + (top - r) * k : r;
  A.holder.position.y = c;
  // water level: the water plus the part of the ball under the surface fill the tube up to the level
  const area = PI * r * r, full = area * H - below(H, c, r);
  if (A.Vw > full) { A.spilled += A.Vw - full; A.Vw = full; }
  let lo = 0, hi = H;
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (area * m - below(m, c, r) < A.Vw) lo = m; else hi = m; }
  A.water.scale.y = max(lo, 0.0001);
  const f = A.spilled / (area * H);
  A.puddle.geometry.dispose();
  A.puddle.geometry = new THREE.RingGeometry(r * 1.02, r * (1.03 + 1.6 * f), 64).rotateX(-PI / 2);
  if (A.t >= 1) {
    A.t = 0; A.phase++;
    if (A.phase === 3) { A.phase = -1; A.done = true; S.playing = false; syncButtons(); }
    renderMain();
  }
}

viewer.onTick((dt) => {
  if (!A || !S.playing) return;
  (A.kind === "pour" ? stepPour : stepSphere)(dt);
  if (S.playing && A.kind === "sphere") renderMain();
});

// ---------- Controls ----------
function play() {
  if (S.playing) { S.playing = false; syncButtons(); return; }
  if (A.kind === "pour") {
    if (A.pours >= 3 && A.phase < 0) build();
    if (A.phase < 0) A.phase = 0;
  } else {
    if (A.done) build();
    if (A.phase < 0) A.phase = 0;
  }
  S.playing = true; syncButtons();
}
function pourOnce() {
  if (A.kind !== "pour" || S.playing) return;
  if (A.pours >= 3) build();
  A.phase = 0; A.once = true; S.playing = true; syncButtons();
}
function syncButtons() {
  const sphere = S.mode === "sphere";
  $("play").textContent = S.playing ? "Pause" : sphere ? (A && A.done ? "Again" : "Lower the sphere") : A && A.pours >= 3 ? "Again" : "Pour until full";
  $("once").hidden = sphere;
  $("count").textContent = sphere ? "" : "Pours: " + (A ? A.pours : 0) + " / 3";
}
$("play").addEventListener("click", play);
$("once").addEventListener("click", pourOnce);
$("empty").addEventListener("click", () => { S.playing = false; build(); });
onKey("space", play);
onKey("r", () => viewer.resetView());
$("reset-view").addEventListener("click", () => viewer.resetView());

// ---------- Panels ----------
function renderMain() {
  const box = $("main");
  if (S.mode === "sphere") {
    const { r } = d(), cyl = F.cylinder.volume(r, 2 * r), sph = F.sphere.volume(r);
    const pct = A ? Math.round((A.spilled / cyl) * 100) : 0;
    box.innerHTML = `<h3>Water spilled</h3><p class="big-count">${pct}%</p><p class="hint">of the water in the cylinder.${A && A.done ? " The water left fills <b>⅓</b> of the cylinder." : ""}</p>` +
      workingHTML([
        ["Cylinder (radius r, height 2r)", work("V", "\\pi r^2 \\times 2r = 2\\pi r^3 = 2\\pi \\times " + n(r) + "^3", cyl, 2 * r ** 3, "cm3")],
        ["Sphere = ⅔ of the cylinder", work("V", "\\tfrac{2}{3} \\times 2\\pi r^3 = \\tfrac{4}{3}\\pi r^3 = \\tfrac{4}{3}\\pi \\times " + n(r) + "^3", sph, (4 / 3) * r ** 3, "cm3")],
        ["Hemisphere = half a sphere", work("V", "\\tfrac{2}{3}\\pi r^3", F.hemisphere.volume(r), (2 / 3) * r ** 3, "cm3")],
      ]);
  } else {
    const { h } = d(), cone = S.mode === "cone";
    const base = cone ? F.area.circle(d().r) : d().b ** 2;
    const baseTex = cone ? "\\pi \\times " + n(d().r) + "^2" : n(d().b) + "^2";
    const piK = cone ? d().r ** 2 : undefined;
    box.innerHTML = `<h3>Pours</h3><p class="big-count">${A ? A.pours : 0} / 3</p>` +
      `<p class="hint">${A && A.pours >= 3 ? "Full! It takes exactly 3 " + (cone ? "cones" : "pyramids") + " to fill the " + (cone ? "cylinder" : "prism") + "." : "Same base, same height."}</p>` +
      workingHTML([
        [cone ? "Cylinder" : "Prism (cuboid)", work("V", baseTex + " \\times " + n(h), base * h, piK && piK * h, "cm3")],
        [(cone ? "Cone" : "Pyramid") + " = ⅓ of it", work("V", "\\tfrac{1}{3} \\times " + baseTex + " \\times " + n(h), (base * h) / 3, piK && (piK * h) / 3, "cm3")],
      ]);
  }
  formulaBar($("formulas"), [
    ["pyramid", "\\text{Pyramid: } V = \\tfrac{1}{3} \\times \\text{base area} \\times h"],
    ["cone", "\\text{Cone: } V = \\tfrac{1}{3}\\pi r^2 h"],
    ["sphere", "\\text{Sphere: } V = \\tfrac{4}{3}\\pi r^3"],
    ["hemi", "\\text{Hemisphere: } V = \\tfrac{2}{3}\\pi r^3"],
  ], S.focus || S.mode);
}

function build() {
  viewer.clear();
  S.playing = false;
  if (S.mode === "sphere") buildSphere(); else buildPour();
  renderMain(); syncButtons();
}
function frame() {
  if (S.mode === "sphere") viewer.frame(v3(0, d().r * 2, 0), d().r * 3.2, v3(0.35, 0.35, 1));
  else {
    const w = S.mode === "cone" ? 2 * d().r : d().b;
    viewer.frame(v3(0, d().h * 0.9, 0), w / 2 + 2.2 + w * 0.9 + 0.8, v3(0.15, 0.45, 1));
  }
}

// The formula first, then a prediction, then the animation that checks it
const FORMULA = {
  pyramid: ["V = \\colorbox{#fff1cc}{$\\tfrac{1}{3}$} \\times \\text{base area} \\times h", "pyramid", "prism"],
  cone: ["V = \\colorbox{#fff1cc}{$\\tfrac{1}{3}$}\\pi r^2 h", "cone", "cylinder"],
  sphere: ["V = \\tfrac{4}{3}\\pi r^3", "sphere", "cylinder"],
};
function formulaHTML(src) { return `<div class="formula on" style="font-size:1.35em;margin:10px 0">${texHTML(src)}</div>`; }
// buttons to guess; the guess is remembered for the last step
function predictHTML(options) {
  return `<div class="row-gap" data-predict>${options.map((o) => `<button class="btn ghost" type="button" data-guess="${o}">${o}</button>`).join("")}</div><p class="fb" data-said></p>`;
}
function wirePredict(box) {
  box.querySelectorAll("[data-guess]").forEach((b) => b.addEventListener("click", () => {
    S.guess = b.dataset.guess;
    box.querySelectorAll("[data-guess]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    box.querySelector("[data-said]").textContent = "You said " + S.guess + ". Press Next to check.";
  }));
  if (S.guess) { const b = box.querySelector(`[data-guess="${S.guess}"]`); if (b) b.click(); }
}
function guessLine(right) {
  if (!S.guess) return "";
  return S.guess === right ? `<p class="fb ok">You predicted ${S.guess}: correct!</p>` : `<p class="fb bad">You predicted ${S.guess}. The answer is ${right}.</p>`;
}

function makeSteps() {
  const set = (focus) => () => { S.focus = focus; renderMain(); };
  const run = () => { if (!S.playing) play(); };
  const [src, solid, holder] = FORMULA[S.mode];
  S.guess = null;
  const list = S.mode === "sphere" ? [
    { title: "The formula", html: "<p>The volume of a sphere is</p>" + formulaHTML(src) + "<p>Where does it come from? Compare the sphere with the cylinder that fits it exactly: radius <b>r</b>, height <b>2r</b>.</p>", enter: () => { build(); set("sphere")(); } },
    { title: "Predict", html: "<p>The cylinder is full of water. We lower the sphere in. What fraction of the water spills out?</p>" + predictHTML(["½", "⅔", "¾"]), enter: (box) => { set("sphere")(); wirePredict(box); } },
    { title: "Lower the sphere", html: "<p>The sphere pushes out water equal to its own volume. Watch how much spills.</p>", enter: () => { set("sphere")(); run(); } },
    { title: "⅔ of the cylinder", html: () => guessLine("⅔") + "<p>Exactly <b>⅔</b> of the water spills, so the sphere is ⅔ of the cylinder:</p>" + formulaHTML("\\tfrac{2}{3} \\times \\pi r^2 \\times 2r = \\tfrac{4}{3}\\pi r^3"), enter: set("sphere") },
    { title: "Hemisphere", html: "<p>A hemisphere is half a sphere:</p>" + formulaHTML("V = \\tfrac{2}{3}\\pi r^3"), enter: set("hemi") },
  ] : [
    { title: "The formula", html: `<p>The volume of a ${solid} is</p>` + formulaHTML(src) + `<p>Where does the <b>⅓</b> come from? Compare it with a ${holder} with the <b>same base</b> and the <b>same height</b>.</p>`, enter: () => { build(); set(S.mode)(); } },
    { title: "Predict", html: `<p>How many ${solid}s full of water does it take to fill the ${holder}?</p>` + predictHTML(["2", "3", "4"]), enter: (box) => { set(S.mode)(); wirePredict(box); } },
    { title: "Fill and pour", html: `<p>Fill the ${solid} with water and pour it in. <span class='student-only'>Press <b>Pour once</b>.</span></p>`, enter: () => { set(S.mode)(); if (A.pours === 0 && !S.playing) pourOnce(); } },
    { title: "Keep pouring", html: "<p>Keep pouring until it is full.</p>", enter: () => { set(S.mode)(); run(); } },
    { title: "One third", html: () => guessLine("3") + `<p>It takes <b>3</b>, so the ${solid} is <b>⅓</b> of the ${holder}:</p>` + formulaHTML(src), enter: set(S.mode) },
  ];
  createSteps($("steps"), list);
}

function setMode(k) {
  S.mode = k; S.focus = null;
  tabs($("tabs"), Object.entries(MODES).map(([key, m]) => [key, m.name]), k, setMode);
  sliders($("controls"), MODES[k].dims, S.dims[k], () => { build(); frame(); });
  build(); frame(); makeSteps();
}

quiz($("quiz"), [
  { q: "A cone and a cylinder have the same base and height. The cylinder holds 600 cm³. The cone holds…", options: ["200 cm³", "300 cm³", "1800 cm³", "400 cm³"], hint: "How many cones fill the cylinder?", explain: "⅓ × 600 = 200 cm³." },
  { q: "A sphere fits exactly inside a cylinder. The sphere's volume is what fraction of the cylinder's?", options: ["⅔", "⅓", "½", "¾"], hint: "Think about how much water spilled.", explain: "That is why V = ⅔ × 2πr³ = 4/3 πr³." },
  { q: "Volume of a hemisphere with radius 3 cm:", options: ["18π cm³", "36π cm³", "9π cm³", "27π cm³"], hint: "Half of 4/3 πr³.", explain: "⅔ × π × 27 = 18π ≈ 56.5 cm³." },
]);

setMode("pyramid");

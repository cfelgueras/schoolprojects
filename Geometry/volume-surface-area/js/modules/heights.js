// Module 4 · Slant height vs Perpendicular height
import { createViewer, THREE } from "../viewer.js";
import { initShell, onKey, createSteps, quiz } from "../shell.js";
import { geo, glassMat, outlined } from "../solids.js";
import { n, eqv, unitTex, sliders, tabs, formulaBar, workingHTML, dimLine, rightAngle, triangle, v3 } from "../kit.js";
import * as F from "../formulas.js";

const H_COL = 0x0072b2, SLANT_COL = 0xd55e00, BASE_COL = 0xb07800, TRI_COL = 0xcc79a7;
const cm = unitTex.cm;

const SOLIDS = {
  cone: { name: "Cone", slant: "l" },
  square: { name: "Square-based pyramid", slant: "s" },
  rect: { name: "Rectangular pyramid", slant: "s" },
};

initShell();
const viewer = createViewer(document.getElementById("viewer"));
const $ = (id) => document.getElementById(id);
const S = {
  solid: "cone", reverse: false,
  show: { h: true, slant: true, tri: true },
  dims: { cone: { r: 3, h: 4, l: 5 }, square: { b: 6, h: 4, s: 5 }, rect: { a: 8, b: 6, h: 4 } },
  focus: null,
};
const d = () => S.dims[S.solid];

// the dimensions that are worked out instead of set: keep them in step with the sliders
function solve() {
  const D = d();
  if (S.solid === "cone") {
    if (S.reverse) { D.l = Math.max(D.l, D.r + 0.5); D.h = F.cone.height(D.r, D.l); } else D.l = F.cone.slantHeight(D.r, D.h);
  } else if (S.solid === "square") {
    if (S.reverse) { D.s = Math.max(D.s, D.b / 2 + 0.5); D.h = Math.sqrt(D.s ** 2 - (D.b / 2) ** 2); } else D.s = F.pyramid.faceHeightA(D.b, D.b, D.h);
  }
}

// ---------- 3D ----------
function build() {
  viewer.clear();
  solve();
  const D = d(), r = 0.045, R = viewer.root;
  if (S.solid === "cone") {
    R.add(outlined(geo.cone(D.r, D.h), glassMat("#7fb0e0")));
    const O = v3(0, 0, 0), A = v3(0, D.h, 0), P = v3(D.r * 0.82, 0, -D.r * 0.57); // across the default view, so the triangle faces the camera
    R.add(dimLine(viewer, O, P, "r = " + n(D.r), { color: BASE_COL, r, offset: v3(0, -0.3, 0) }));
    if (S.show.h) R.add(dimLine(viewer, O, A, "h = " + n(D.h), { color: H_COL, r, dashed: true, cls: "lbl h", offset: v3(-0.6, 0, 0) }),
      rightAngle(O, P.clone().normalize(), v3(0, 1, 0), 0.35));
    if (S.show.slant) R.add(dimLine(viewer, P, A, "l = " + n(D.l), { color: SLANT_COL, r: r * 1.2, cls: "lbl s", offset: v3(0.6, 0.2, 0) }));
    if (S.show.tri) R.add(triangle(O, P, A, TRI_COL));
  } else {
    const a = S.solid === "rect" ? D.a : D.b, b = D.b;
    R.add(outlined(geo.pyramid(a, b, D.h), glassMat("#7fb0e0")));
    const O = v3(0, 0, 0), A = v3(0, D.h, 0), M = v3(0, 0, b / 2);
    R.add(dimLine(viewer, O, M, (S.solid === "rect" ? "b/2 = " : "b/2 = ") + n(b / 2), { color: BASE_COL, r, offset: v3(-0.5, -0.25, 0) }));
    if (S.show.h) R.add(dimLine(viewer, O, A, "h = " + n(D.h), { color: H_COL, r, dashed: true, cls: "lbl h", offset: v3(-0.6, 0, 0) }),
      rightAngle(O, v3(0, 0, 1), v3(0, 1, 0), 0.35));
    const sA = F.pyramid.faceHeightA(a, b, D.h);
    if (S.show.slant) R.add(dimLine(viewer, M, A, (S.solid === "rect" ? "s₁ = " : "s = ") + n(sA), { color: SLANT_COL, r: r * 1.2, cls: "lbl s", offset: v3(0, 0, 0.5) }));
    if (S.show.tri) R.add(triangle(O, M, A, TRI_COL));
    if (S.solid === "rect") {
      // the side faces have a different slant height
      const N = v3(a / 2, 0, 0), sB = F.pyramid.faceHeightB(a, b, D.h);
      R.add(dimLine(viewer, O, N, "a/2 = " + n(a / 2), { color: BASE_COL, r, offset: v3(0, -0.3, -0.3) }));
      if (S.show.slant) R.add(dimLine(viewer, N, A, "s₂ = " + n(sB), { color: SLANT_COL, r: r * 1.2, cls: "lbl s", offset: v3(0.5, 0, 0) }));
      if (S.show.tri) R.add(triangle(O, N, A, 0x56b4e9));
      if (S.show.h) R.add(rightAngle(O, v3(1, 0, 0), v3(0, 1, 0), 0.35));
    }
  }
  renderMain();
}
function frame() {
  const D = d(), w = S.solid === "cone" ? 2 * D.r : Math.max(D.b, D.a || 0);
  viewer.frame(v3(0, D.h / 2, 0), Math.max(w, D.h) * 0.8, v3(0.9, 0.45, 1.3));
}

// ---------- Working with Pythagoras ----------
function renderWorking() {
  const D = d(), sq = (x) => n(x) + "^2";
  let lines;
  if (S.solid === "cone") {
    lines = S.reverse
      ? [["h² + r² = l², so h² = l² − r²", "h = \\sqrt{l^2 - r^2} = \\sqrt{" + sq(D.l) + " - " + sq(D.r) + "}" + eqv(D.h) + cm]]
      : [["l² = r² + h²", "l = \\sqrt{r^2 + h^2} = \\sqrt{" + sq(D.r) + " + " + sq(D.h) + "}" + eqv(D.l) + cm]];
  } else if (S.solid === "square") {
    lines = S.reverse
      ? [["h² + (b/2)² = s², so h² = s² − (b/2)²", "h = \\sqrt{s^2 - \\left(\\tfrac{b}{2}\\right)^2} = \\sqrt{" + sq(D.s) + " - " + sq(D.b / 2) + "}" + eqv(D.h) + cm]]
      : [["s² = h² + (b/2)²", "s = \\sqrt{h^2 + \\left(\\tfrac{b}{2}\\right)^2} = \\sqrt{" + sq(D.h) + " + " + sq(D.b / 2) + "}" + eqv(D.s) + cm]];
  } else {
    lines = [
      ["Front and back faces (on side a)", "s_1 = \\sqrt{h^2 + \\left(\\tfrac{b}{2}\\right)^2} = \\sqrt{" + sq(D.h) + " + " + sq(D.b / 2) + "}" + eqv(F.pyramid.faceHeightA(D.a, D.b, D.h)) + cm],
      ["Side faces (on side b)", "s_2 = \\sqrt{h^2 + \\left(\\tfrac{a}{2}\\right)^2} = \\sqrt{" + sq(D.h) + " + " + sq(D.a / 2) + "}" + eqv(F.pyramid.faceHeightB(D.a, D.b, D.h)) + cm],
    ];
  }
  return "<h3>Pythagoras</h3>" + workingHTML(lines);
}

// "Which height do you need?"
const TASKS = [
  ["the <b>volume</b> of a cone", "h", "Volume uses the perpendicular height: V = ⅓πr²h."],
  ["the <b>curved surface area</b> of a cone", "slant", "Curved surface area = πrl, with the slant height l."],
  ["the <b>total surface area</b> of a cone", "slant", "πr² + πrl: the curved part needs l."],
  ["the <b>volume</b> of a pyramid", "h", "V = ⅓ × base area × h, with the perpendicular height."],
  ["the area of one <b>triangular face</b> of a pyramid", "slant", "The height of the triangle is the slant height s."],
  ["the <b>total surface area</b> of a pyramid", "slant", "The triangles need the slant height s."],
  ["how much <b>water</b> a cone-shaped cup holds", "h", "That is a volume, so it needs h."],
  ["the area of <b>paper</b> for a cone-shaped party hat", "slant", "The paper is the curved surface: πrl."],
];
const T = { i: Math.floor(Math.random() * TASKS.length), right: 0, tries: 0, answered: false };
function renderTask() {
  const [task, , why] = TASKS[T.i];
  const fb = T.answered === false ? "" : T.answered === "ok" ? `<p class="fb ok">Correct! ${why}</p>` : `<p class="fb bad">Not this one. ${why}</p>`;
  return `<h3>Which height do you need?</h3><p class="problem">To find ${task}:</p>
    <div class="row-gap"><button class="btn ghost" type="button" data-pick="h">Perpendicular height h</button>
    <button class="btn ghost" type="button" data-pick="slant">Slant height (l or s)</button></div>${fb}
    <div class="row-gap"><span class="score">Score: ${T.right} / ${T.tries}</span>${T.answered ? '<button class="btn" type="button" data-next>Next task →</button>' : ""}</div>`;
}

function renderMain() {
  $("main").innerHTML = renderWorking() + '<hr style="border:0;border-top:1px solid var(--line);margin:14px 0">' + renderTask();
  $("main").querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => {
    if (T.answered) return;
    T.tries++;
    T.answered = b.dataset.pick === TASKS[T.i][1] ? "ok" : "bad";
    if (T.answered === "ok") T.right++;
    renderMain();
  }));
  const next = $("main").querySelector("[data-next]");
  if (next) next.addEventListener("click", () => { T.i = (T.i + 1 + Math.floor(Math.random() * (TASKS.length - 1))) % TASKS.length; T.answered = false; renderMain(); });

  const cone = S.solid === "cone";
  formulaBar($("formulas"), cone ? [
    ["py", "l^2 = r^2 + h^2"],
    ["h", "V = \\tfrac{1}{3}\\pi r^2 \\color{#0072B2}{h}"],
    ["slant", "\\text{Curved surface area} = \\pi r \\color{#D55E00}{l}"],
  ] : [
    ["py", "s^2 = h^2 + \\left(\\tfrac{b}{2}\\right)^2"],
    ["h", "V = \\tfrac{1}{3} \\times \\text{base area} \\times \\color{#0072B2}{h}"],
    ["slant", "\\text{Triangular face} = \\tfrac{1}{2} \\times b \\times \\color{#D55E00}{s}"],
  ], S.focus);
}

// ---------- Controls ----------
function renderControls() {
  const box = $("controls");
  const defs = S.solid === "cone"
    ? [["r", "Radius r", 3, 1, 6], S.reverse ? ["l", "Slant height l", 5, 1.5, 12] : ["h", "Perpendicular height h", 4, 1, 10]]
    : S.solid === "square"
      ? [["b", "Base side b", 6, 1, 10], S.reverse ? ["s", "Slant height s", 5, 1, 12] : ["h", "Perpendicular height h", 4, 1, 10]]
      : [["a", "Base side a", 8, 1, 10], ["b", "Base side b", 6, 1, 10], ["h", "Perpendicular height h", 4, 1, 10]];
  sliders(box, defs, d(), () => build());
  if (S.solid !== "rect") {
    const p = document.createElement("div");
    p.className = "seg";
    p.style.marginTop = "6px";
    const sl = SOLIDS[S.solid].slant;
    p.innerHTML = `<button type="button" data-rev="0" aria-pressed="${!S.reverse}">Find ${sl}</button><button type="button" data-rev="1" aria-pressed="${S.reverse}">Find h</button>`;
    p.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      solve();
      S.reverse = b.dataset.rev === "1";
      // round the value the slider will now control, so it sits on the slider's steps
      const D = d(), k = S.solid === "cone" ? "l" : "s";
      if (S.reverse) D[k] = Math.round(D[k] * 2) / 2; else D.h = Math.round(D.h * 2) / 2;
      renderControls(); build();
    }));
    box.prepend(p);
  }
}
function syncToggles() {
  ["h", "slant", "tri"].forEach((k) => { $("show-" + k).checked = S.show[k]; });
}
["h", "slant", "tri"].forEach((k) => $("show-" + k).addEventListener("change", (e) => { S.show[k] = e.target.checked; build(); }));

function setSolid(k) {
  S.solid = k; S.reverse = false;
  tabs($("tabs"), Object.entries(SOLIDS).map(([key, s]) => [key, s.name]), k, setSolid);
  renderControls(); build(); frame();
}
onKey("r", () => viewer.resetView());
$("reset-view").addEventListener("click", () => viewer.resetView());

const show = (h, slant, tri, focus) => () => { S.show = { h, slant, tri }; S.focus = focus; syncToggles(); build(); };
createSteps($("steps"), [
  { title: "Two different heights", html: "<p>Cones and pyramids have <b>two heights</b>. Mixing them up is one of the most common mistakes.</p>", enter: show(true, true, false, null) },
  { title: "Perpendicular height h", html: "<p>From the top straight down to the <b>centre of the base</b>, at right angles to it. It is <b>inside</b> the solid.</p><p>Use it for the <b>volume</b>.</p>", enter: show(true, false, false, "h") },
  { title: "Slant height", html: "<p>Along the <b>outside surface</b>, from the top down to the edge of the base. Cone: <b>l</b>; pyramid: <b>s</b>, the height of a triangular face.</p><p>Use it for the <b>curved surface area</b> or the <b>triangular faces</b>.</p>", enter: show(false, true, false, "slant") },
  { title: "The right-angled triangle", html: "<p>h, the slant height and the radius (or half the base) make a <b>right-angled triangle</b>. The slant height is the hypotenuse, so it is always the longest.</p><p>Use <b>Pythagoras</b> to find one from the other two.</p>", enter: show(true, true, true, "py") },
  { title: "Which height do you need?", html: "<p>Try the tasks in the panel below: decide which height each one needs.</p>", enter: show(true, true, true, null) },
]);

quiz($("quiz"), [
  { q: "A cone has r = 5 cm and l = 13 cm. Its perpendicular height is…", options: ["12 cm", "8 cm", "18 cm", "√194 cm"], hint: "h² = l² − r².", explain: "√(169 − 25) = √144 = 12 cm." },
  { q: "Which is always the longest?", options: ["The slant height", "The perpendicular height", "The radius", "They can be equal"], hint: "It is the hypotenuse of the right-angled triangle.", explain: "The hypotenuse is the longest side of a right-angled triangle." },
  { q: "A square-based pyramid has base 10 cm and h = 12 cm. The slant height of a face is…", options: ["13 cm", "15.6 cm", "11 cm", "22 cm"], hint: "s² = h² + (b/2)².", explain: "√(144 + 25) = √169 = 13 cm." },
]);

setSolid("cone");

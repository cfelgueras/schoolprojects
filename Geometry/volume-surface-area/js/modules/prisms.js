// Module 2 · Prisms: Cross-section × Length
import { createViewer, THREE } from "../viewer.js";
import { initShell, onKey, tex, createSteps, quiz } from "../shell.js";
import { geo, solidMat } from "../solids.js";
import { n, work, sliders, defaults, tabs, formulaBar, workingHTML, dimLine, COLORS, v3 } from "../kit.js";
import * as F from "../formulas.js";

const { PI, cos, sin } = Math;

// Cross-sections: points [x, y] with y up, standing on y = 0, and marks [from, to, text] in the same plane
const SHAPES = {
  rectangle: {
    name: "Rectangle",
    dims: [["w", "Width w", 4, 1, 8], ["h", "Height h", 3, 1, 8]],
    points: ({ w, h }) => [[-w / 2, 0], [w / 2, 0], [w / 2, h], [-w / 2, h]],
    marks: ({ w, h }) => [[[-w / 2, 0], [w / 2, 0], "w"], [[-w / 2, 0], [-w / 2, h], "h"]],
    area: ({ w, h }) => F.area.rectangle(w, h),
    formula: "A = w \\times h",
    sub: ({ w, h }) => n(w) + " \\times " + n(h),
  },
  triangle: {
    name: "Triangle",
    dims: [["b", "Base b", 5, 1, 8], ["h", "Height h", 4, 1, 8]],
    points: ({ b, h }) => [[-b / 2, 0], [b / 2, 0], [-b / 2, h]],
    marks: ({ b, h }) => [[[-b / 2, 0], [b / 2, 0], "b"], [[-b / 2, 0], [-b / 2, h], "h"]],
    area: ({ b, h }) => F.area.triangle(b, h),
    formula: "A = \\tfrac{1}{2} \\times b \\times h",
    sub: ({ b, h }) => "\\tfrac{1}{2} \\times " + n(b) + " \\times " + n(h),
  },
  trapezium: {
    name: "Trapezium",
    dims: [["a", "Top a", 3, 1, 8], ["b", "Bottom b", 6, 1, 8], ["h", "Height h", 3, 1, 8]],
    points: ({ a, b, h }) => [[-b / 2, 0], [b / 2, 0], [a / 2, h], [-a / 2, h]],
    marks: ({ a, b, h }) => [[[-b / 2, 0], [b / 2, 0], "b"], [[-a / 2, h], [a / 2, h], "a"], [[0, 0], [0, h], "h"]],
    area: ({ a, b, h }) => F.area.trapezium(a, b, h),
    formula: "A = \\tfrac{1}{2}(a + b) \\times h",
    sub: ({ a, b, h }) => "\\tfrac{1}{2}(" + n(a) + " + " + n(b) + ") \\times " + n(h),
  },
  lshape: {
    name: "L-shape",
    dims: [["W", "Width W", 6, 2, 8], ["H", "Height H", 5, 2, 8], ["w", "Cut-out width w", 3, 0.5, 7.5], ["h", "Cut-out height h", 3, 0.5, 7.5]],
    // keep the cut-out smaller than the outside rectangle
    fix: (d) => { d.w = Math.min(d.w, d.W - 0.5); d.h = Math.min(d.h, d.H - 0.5); },
    points: ({ W, H, w, h }) => [[-W / 2, 0], [W / 2, 0], [W / 2, H - h], [W / 2 - w, H - h], [W / 2 - w, H], [-W / 2, H]],
    marks: ({ W, H, w, h }) => [[[-W / 2, 0], [W / 2, 0], "W"], [[-W / 2, 0], [-W / 2, H], "H"], [[W / 2 - w, H], [W / 2, H], "w", true], [[W / 2, H - h], [W / 2, H], "h", true]],
    area: ({ W, H, w, h }) => F.area.lShape(W, H, w, h),
    formula: "A = W \\times H - w \\times h",
    sub: ({ W, H, w, h }) => n(W) + " \\times " + n(H) + " - " + n(w) + " \\times " + n(h),
  },
  circle: {
    name: "Circle (cylinder)",
    dims: [["r", "Radius r", 2.5, 0.5, 4]],
    points: ({ r }) => Array.from({ length: 64 }, (_, k) => [r * cos((2 * PI * k) / 64), r + r * sin((2 * PI * k) / 64)]),
    marks: ({ r }) => [[[0, r], [r, r], "r"]],
    area: ({ r }) => F.area.circle(r),
    formula: "A = \\pi r^2",
    sub: ({ r }) => "\\pi \\times " + n(r) + "^2",
    piK: ({ r }) => r * r,
  },
};

initShell();
const viewer = createViewer(document.getElementById("viewer"));
const $ = (id) => document.getElementById(id);
const S = { shape: "rectangle", dims: {}, len: 8, u: 0, target: 0, slices: false, focus: null };
Object.keys(SHAPES).forEach((k) => (S.dims[k] = defaults(SHAPES[k].dims)));

const shape = () => SHAPES[S.shape];
const L = () => S.len * S.u;

// ---------- 3D ----------
let prism = null;
function build() {
  viewer.clear();
  const sh = shape(), d = S.dims[S.shape];
  if (sh.fix) sh.fix(d);
  const pts = sh.points(d), len = Math.max(L(), 0.001), x0 = -S.len / 2;
  const g = geo.prism(pts, len).translate(x0 + len / 2, 0, 0);
  // material 0 = the two ends (the cross-section), 1 = the sides
  prism = new THREE.Mesh(g, [solidMat(COLORS[0]), solidMat(COLORS[1])]);
  prism.add(new THREE.LineSegments(new THREE.EdgesGeometry(g, 25), new THREE.LineBasicMaterial({ color: 0x1b2430 })));
  viewer.root.add(prism);

  const to3 = ([sx, sy], x = x0) => v3(x - 0.02, sy, -sx);
  const size = Math.max(S.len, 6), r = size / 220;
  // cross-section dimensions, on the end that stays still
  // labels pushed off the shape: below horizontal lines, beside vertical ones
  sh.marks(d).forEach(([p, q, k, gold]) => {
    const flat = p[1] === q[1], side = (p[0] + q[0]) / 2;
    const offset = flat ? v3(0, p[1] === 0 ? -0.45 : 0.45, 0) : v3(0, 0, side <= 0 ? 0.7 : -0.7);
    viewer.root.add(dimLine(viewer, to3(p), to3(q), k + " = " + n(d[k]) + " cm", { r, color: gold ? 0x8a5a1c : 0x6b4410, offset }));
  });
  // length, along the bottom edge
  const zEdge = Math.max(...pts.map(([sx]) => -sx)) + size * 0.04;
  if (L() > 0.05) viewer.root.add(dimLine(viewer, v3(x0, 0, zEdge), v3(x0 + L(), 0, zEdge), "length = " + n(L()) + " cm", { r }));
  // 1 cm slices: the same cross-section repeated along the prism
  if (S.slices) {
    const loop = pts.map((p) => to3(p, 0)).concat([to3(pts[0], 0)]);
    for (let x = 1; x < L() - 1e-6; x += 1) {
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(loop), new THREE.LineBasicMaterial({ color: 0x8a5a1c }));
      line.position.x = x0 + x + 0.02;
      viewer.root.add(line);
    }
  }
  renderWorking();
}
function frame() { viewer.frame(v3(0, 2.5, 0), Math.max(S.len, 7) * 0.62, v3(-0.75, 0.6, 1.1)); }

// ---------- Extrude animation ----------
viewer.onTick((dt) => {
  if (S.u === S.target) return;
  const step = dt * 0.45;
  S.u = Math.abs(S.target - S.u) <= step ? S.target : S.u + Math.sign(S.target - S.u) * step;
  syncExtrude(); build();
});
function syncExtrude() {
  $("extrude").value = Math.round(S.u * 100);
  $("extrude-out").textContent = n(L()) + " cm";
  $("play").textContent = S.u !== S.target ? "Pause" : S.u > 0.5 ? "Shrink" : "Extrude";
}
function playPause() {
  S.target = S.u !== S.target ? S.u : S.u > 0.5 ? 0 : 1;
  syncExtrude();
}
$("extrude").addEventListener("input", (e) => { S.u = S.target = e.target.value / 100; syncExtrude(); build(); });
$("play").addEventListener("click", playPause);
onKey("space", playPause);
onKey("r", () => viewer.resetView());
$("reset-view").addEventListener("click", () => viewer.resetView());
$("slices").addEventListener("change", (e) => { S.slices = e.target.checked; build(); });

// ---------- Panels ----------
function renderWorking() {
  const sh = shape(), d = S.dims[S.shape], A = sh.area(d), piK = sh.piK ? sh.piK(d) : undefined;
  const lines = [
    ["Area of the cross-section", work(sh.formula, sh.sub(d), A, piK)],
    ["Volume = area of cross-section × length", work("V", n(A) + " \\times " + n(L()), A * L(), piK !== undefined ? piK * L() : undefined, "cm3")],
  ];
  $("main").innerHTML = "<h3>Working</h3>" + workingHTML(lines) +
    (S.slices && L() >= 1 ? `<p class="hint">Length ${n(L())} cm, so ${n(L())} slices of 1 cm, each with volume ${n(A)} × 1 = ${n(A)} cm³.</p>` : "") +
    (S.shape === "circle" ? '<div class="note-box"><p><b>A cylinder is a prism</b> with a circular cross-section, so its volume is <b>πr² × h</b>.</p></div>' : "");
  formulaBar($("formulas"), [
    ["shape", sh.formula],
    ["prism", "V = \\text{area of cross-section} \\times \\text{length}"],
    ["cyl", "\\text{Cylinder: } V = \\pi r^2 h"],
  ], S.focus || (S.shape === "circle" ? "cyl" : null));
}

function renderControls() {
  const sh = shape();
  sliders($("controls"), sh.dims.concat([["len", "Full length", S.len, 2, 12]]), Object.assign(S.dims[S.shape], { len: S.len }), (id) => {
    if (id === "len") S.len = S.dims[S.shape].len;
    build();
  });
}

function setShape(k) {
  S.shape = k;
  tabs($("tabs"), Object.entries(SHAPES).map(([key, s]) => [key, s.name]), k, setShape);
  renderControls(); build();
}

// ---------- Steps ----------
const go = (u, focus, slices) => () => {
  S.target = u; S.focus = focus;
  if (slices !== undefined) { S.slices = slices; $("slices").checked = slices; }
  syncExtrude(); build();
};
createSteps($("steps"), [
  { title: "The cross-section", html: "<p>A <b>prism</b> has the same shape all the way along it: its <b>cross-section</b>. Choose a shape above and find its area.</p>", enter: go(0, "shape", false) },
  { title: "Extrude it", html: "<p>Stretch the cross-section out into a prism. <span class='student-only'>Move the <b>Extrude</b> slider.</span></p>", enter: go(1, null) },
  { title: "Slices of 1 cm", html: "<p>Cut the prism into slices 1 cm thick. Each slice has volume <b>area × 1</b>, and there are as many slices as centimetres of length.</p>", enter: go(1, "prism", true) },
  { title: "Volume", html: "<p>So the volume of any prism is</p><p><b>V = area of cross-section × length</b></p>", enter: go(1, "prism", false) },
  { title: "A cylinder is a prism", html: "<p>A cylinder has a circular cross-section, so V = πr² × h.</p>", enter: () => { if (S.shape !== "circle") setShape("circle"); go(1, "cyl", false)(); } },
]);

quiz($("quiz"), [
  { q: "A prism has a cross-section of area 12 cm² and length 5 cm. Its volume is…", options: ["60 cm³", "17 cm³", "60 cm²", "120 cm³"], hint: "Volume = area of cross-section × length.", explain: "12 × 5 = 60 cm³." },
  { q: "Which of these is a prism?", options: ["A cylinder", "A cone", "A sphere", "A pyramid"], hint: "A prism has the same cross-section all the way along.", explain: "Its cross-section is always the same circle." },
  { q: "A cylinder has radius 3 cm and height 10 cm. Its volume is…", options: ["90π cm³", "30π cm³", "60π cm³", "9π cm³"], hint: "Area of the circle = πr², then × the height.", explain: "π × 3² × 10 = 90π ≈ 283 cm³." },
]);

setShape("rectangle");
syncExtrude();
frame();

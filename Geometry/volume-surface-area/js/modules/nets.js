// Module 1 · Nets & Surface Area
import { createViewer, THREE } from "../viewer.js";
import { buildFoldable } from "../foldable.js";
import { initShell, onKey, tex, texHTML, createSteps, quiz, onModeChange } from "../shell.js";
import * as F from "../formulas.js";
import { n, work, unitTex } from "../kit.js";

const { PI, sin, cos, atan2, hypot, acos } = Math;
const N = 36; // sides of the polygon that stands in for a circle

// Okabe–Ito colours: told apart with every common type of colour blindness
const C = ["#E69F00", "#56B4E9", "#009E73", "#F0E442", "#0072B2", "#D55E00", "#CC79A7"];

const cm = unitTex.cm;

// ---------- Flat nets ----------
// regular N-gon around (cx, cz); vertex k at angle start + dir·2πk/N
function ngon(cx, cz, r, start, dir = -1) {
  const pts = [];
  for (let k = 0; k < N; k++) { const t = start + (dir * 2 * PI * k) / N; pts.push([cx + r * cos(t), cz + r * sin(t)]); }
  return pts;
}
const all = (poly) => poly.map((_, k) => [k, (k + 1) % poly.length]);

function cuboidNet({ l, w, h }) {
  const x = l / 2, z = w / 2;
  const rect = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
  return {
    size: Math.max(l, w, h),
    faces: [
      { part: "bottom", poly: rect(-x, -z, x, z), parent: -1, label: true },
      { part: "front", poly: rect(-x, z, x, z + h), parent: 0, hinge: [[-x, z], [x, z]], fold: PI / 2, label: true },
      { part: "back", poly: rect(-x, -z - h, x, -z), parent: 0, hinge: [[-x, -z], [x, -z]], fold: PI / 2, label: true },
      { part: "top", poly: rect(-x, -z - h - w, x, -z - h), parent: 2, hinge: [[-x, -z - h], [x, -z - h]], fold: PI / 2, label: true },
      { part: "right", poly: rect(x, -z, x + h, z), parent: 0, hinge: [[x, -z], [x, z]], fold: PI / 2, label: true },
      { part: "left", poly: rect(-x - h, -z, -x, z), parent: 0, hinge: [[-x, -z], [-x, z]], fold: PI / 2, label: true },
    ],
    marks: [
      { face: 0, a: [-x, z], b: [x, z], text: "l = " + n(l) + " cm" },
      { face: 0, a: [x, -z], b: [x, z], text: "w = " + n(w) + " cm" },
      { face: 1, a: [-x, z], b: [-x, z + h], text: "h = " + n(h) + " cm" },
    ],
  };
}

function prismNet({ b, h, l }) {
  const x = l / 2, z = b / 2, s = F.triangularPrism.side(b, h), fold = PI - atan2(h, z);
  return {
    size: Math.max(b, h, l),
    faces: [
      { part: "bottom", poly: [[-x, -z], [x, -z], [x, z], [-x, z]], parent: -1, label: true },
      { part: "front", poly: [[-x, z], [x, z], [x, z + s], [-x, z + s]], parent: 0, hinge: [[-x, z], [x, z]], fold, label: true },
      { part: "back", poly: [[-x, -z - s], [x, -z - s], [x, -z], [-x, -z]], parent: 0, hinge: [[-x, -z], [x, -z]], fold, label: true },
      { part: "right", poly: [[x, -z], [x, z], [x + h, 0]], parent: 0, hinge: [[x, -z], [x, z]], fold: PI / 2, label: true },
      { part: "left", poly: [[-x, -z], [-x, z], [-x - h, 0]], parent: 0, hinge: [[-x, -z], [-x, z]], fold: PI / 2, label: true },
    ],
    marks: [
      { face: 0, a: [-x, z], b: [x, z], text: "l = " + n(l) + " cm" },
      { face: 3, a: [x, -z], b: [x, z], text: "b = " + n(b) + " cm" },
      { face: 3, a: [x, 0], b: [x + h, 0], text: "h = " + n(h) + " cm" },
      { face: 1, a: [-x, z], b: [-x, z + s], text: "s" },
    ],
  };
}

function pyramidNet({ b, h }) {
  const z = b / 2, s = F.pyramid.faceHeightA(b, b, h), fold = PI - atan2(h, z);
  return {
    size: Math.max(b, h),
    faces: [
      { part: "base", poly: [[-z, -z], [z, -z], [z, z], [-z, z]], parent: -1, label: true },
      { part: "front", poly: [[-z, z], [z, z], [0, z + s]], parent: 0, hinge: [[-z, z], [z, z]], fold, label: true },
      { part: "back", poly: [[-z, -z], [z, -z], [0, -z - s]], parent: 0, hinge: [[-z, -z], [z, -z]], fold, label: true },
      { part: "right", poly: [[z, -z], [z, z], [z + s, 0]], parent: 0, hinge: [[z, -z], [z, z]], fold, label: true },
      { part: "left", poly: [[-z, -z], [-z, z], [-z - s, 0]], parent: 0, hinge: [[-z, -z], [-z, z]], fold, label: true },
    ],
    marks: [
      { face: 0, a: [z, -z], b: [z, z], text: "b = " + n(b) + " cm" },
      { face: 1, a: [0, z], b: [0, z + s], text: "s" },
    ],
  };
}

// Cylinder: the curved surface is a chain of thin strips that rolls up around the circles
function cylinderNet({ r, h }) {
  const c = 2 * r * sin(PI / N), a = r * cos(PI / N);
  const base = ngon(0, 0, r, PI / 2 + PI / N);
  const faces = [
    { part: "bottom", poly: base, parent: -1, label: true, labelAt: [0, -r * 0.45], gold: all(base) },
    { part: "curved", poly: [[-c / 2, a], [c / 2, a], [c / 2, a + h], [-c / 2, a + h]], parent: 0,
      hinge: [[-c / 2, a], [c / 2, a]], fold: PI / 2, outline: [[0, 1], [2, 3]], gold: [[0, 1]], label: true },
  ];
  const right = (N - 2) / 2, left = N - 1 - right;
  for (let k = 1, prev = 1; k <= right; k++) {
    const x0 = c / 2 + (k - 1) * c, x1 = x0 + c;
    faces.push({ part: "curved", poly: [[x0, a], [x1, a], [x1, a + h], [x0, a + h]], parent: prev,
      hinge: [[x0, a], [x0, a + h]], fold: (2 * PI) / N, outline: k === right ? [[0, 1], [1, 2], [2, 3]] : [[0, 1], [2, 3]], gold: [[0, 1]] });
    prev = faces.length - 1;
  }
  for (let k = 1, prev = 1; k <= left; k++) {
    const x1 = -c / 2 - (k - 1) * c, x0 = x1 - c;
    faces.push({ part: "curved", poly: [[x0, a], [x1, a], [x1, a + h], [x0, a + h]], parent: prev,
      hinge: [[x1, a], [x1, a + h]], fold: (2 * PI) / N, outline: k === left ? [[0, 1], [2, 3], [3, 0]] : [[0, 1], [2, 3]], gold: [[0, 1]] });
    prev = faces.length - 1;
  }
  const top = ngon(0, a + h + a, r, -PI / 2 - PI / N, 1);
  const outer = 1 + right, xr = c / 2 + right * c; // last strip on the right: h is marked on its outer edge
  faces.push({ part: "top", poly: top, parent: 1, hinge: [[-c / 2, a + h], [c / 2, a + h]], fold: PI / 2, label: true });
  return {
    size: Math.max(2 * r, h),
    faces,
    marks: [
      { face: 0, a: [0, 0], b: [a, 0], text: "r = " + n(r) + " cm" },
      { face: outer, a: [xr, a], b: [xr, a + h], text: "h = " + n(h) + " cm" },
      { face: 1, a: [-c / 2, a], b: [c / 2, a], text: "2πr ≈ " + n(2 * PI * r) + " cm", gold: true },
    ],
  };
}

// Cone: the curved surface is a fan of thin triangles around the apex; flat, they make a sector
function coneNet({ r, h }) {
  const c = 2 * r * sin(PI / N), a = r * cos(PI / N), l = F.cone.slantHeight(r, h), s = hypot(h, a);
  const base = ngon(0, 0, r, PI / 2 + PI / N);
  const Q = [0, a + s], L0 = [-c / 2, a], R0 = [c / 2, a];
  const aR = atan2(R0[1] - Q[1], R0[0] - Q[0]), aL = atan2(L0[1] - Q[1], L0[0] - Q[0]), step = aR - aL;
  const at = (t) => [Q[0] + l * cos(t), Q[1] + l * sin(t)];
  // angle between neighbouring triangles of the fan when the cone is closed
  const fold = acos((h * h * cos((2 * PI) / N) + a * a) / (h * h + a * a));
  const faces = [
    { part: "bottom", poly: base, parent: -1, label: true, labelAt: [0, -r * 0.45], gold: all(base) },
    { part: "curved", poly: [L0, R0, Q], parent: 0, hinge: [L0, R0], fold: PI - atan2(h, a), outline: [[0, 1]], gold: [[0, 1]], label: true },
  ];
  const right = (N - 2) / 2, left = N - 1 - right;
  for (let k = 1, prev = 1; k <= right; k++) {
    const P0 = at(aR + (k - 1) * step), P1 = at(aR + k * step);
    faces.push({ part: "curved", poly: [P0, P1, Q], parent: prev, hinge: [Q, P0], fold,
      outline: k === right ? [[0, 1], [1, 2]] : [[0, 1]], gold: [[0, 1]] });
    prev = faces.length - 1;
  }
  for (let k = 1, prev = 1; k <= left; k++) {
    const P0 = at(aL - (k - 1) * step), P1 = at(aL - k * step);
    faces.push({ part: "curved", poly: [P1, P0, Q], parent: prev, hinge: [Q, P0], fold,
      outline: k === left ? [[0, 1], [0, 2]] : [[0, 1]], gold: [[0, 1]] });
    prev = faces.length - 1;
  }
  const edge = faces.length - 1, P = at(aL - left * step); // l is marked on the outer edge of the sector
  return {
    size: Math.max(2 * r, h),
    faces,
    marks: [
      { face: 0, a: [0, 0], b: [a, 0], text: "r = " + n(r) + " cm" },
      { face: edge, a: Q, b: P, text: "l " + (F.isExact(l) ? "= " : "≈ ") + n(l) + " cm" },
      { face: 1, a: L0, b: R0, text: "arc = 2πr", gold: true },
    ],
  };
}

// ---------- The solids: dimensions, parts of the surface, formulas, questions ----------
const SOLIDS = {
  cuboid: {
    name: "Cuboid",
    intro: "A cuboid has <b>6 rectangular faces</b>. Opposite faces are the same size.",
    dims: [["l", "Length l", 6, 1, 10], ["w", "Width w", 4, 1, 10], ["h", "Height h", 3, 1, 10]],
    net: cuboidNet,
    colors: { bottom: C[0], top: C[1], front: C[2], back: C[3], left: C[4], right: C[5] },
    formulas: [
      ["rect", "\\text{Rectangle} = \\text{length} \\times \\text{width}"],
      ["total", "SA = 2(lw + lh + wh)"],
    ],
    parts: ({ l, w, h }) => [
      ["bottom", "Bottom", "rect", work("l \\times w", n(l) + " \\times " + n(w), l * w)],
      ["top", "Top", "rect", work("l \\times w", n(l) + " \\times " + n(w), l * w), "Same as the bottom."],
      ["front", "Front", "rect", work("l \\times h", n(l) + " \\times " + n(h), l * h)],
      ["back", "Back", "rect", work("l \\times h", n(l) + " \\times " + n(h), l * h), "Same as the front."],
      ["left", "Left", "rect", work("w \\times h", n(w) + " \\times " + n(h), w * h)],
      ["right", "Right", "rect", work("w \\times h", n(w) + " \\times " + n(h), w * h), "Same as the left."],
    ],
    total: ({ l, w, h }) => work("SA", "2(" + n(l * w) + " + " + n(l * h) + " + " + n(w * h) + ")", F.cuboid.surfaceArea(l, w, h)),
    quiz: [
      { q: "How many faces does a cuboid have?", options: ["6", "4", "8", "12"], hint: "Count the rectangles in the net.", explain: "Top, bottom, front, back, left and right." },
      { q: "Which face has the same area as the front?", options: ["The back", "The top", "The left", "The bottom"], hint: "Look for the face opposite the front.", explain: "Opposite faces of a cuboid are identical." },
    ],
  },
  prism: {
    name: "Triangular prism",
    intro: "This triangular prism has <b>2 triangles</b> (the ends) and <b>3 rectangles</b>. The triangle is isosceles, with base b and height h.",
    dims: [["b", "Triangle base b", 6, 1, 10], ["h", "Triangle height h", 4, 1, 10], ["l", "Length l", 9, 1, 12]],
    net: prismNet,
    colors: { bottom: C[0], front: C[2], back: C[3], right: C[1], left: C[6] },
    formulas: [
      ["tri", "\\text{Triangle} = \\tfrac{1}{2} \\times b \\times h"],
      ["rect", "\\text{Rectangle} = \\text{length} \\times \\text{width}"],
      ["side", "s = \\sqrt{\\left(\\tfrac{b}{2}\\right)^2 + h^2}"],
      ["total", "SA = 2 \\times \\tfrac{1}{2}bh + bl + 2sl"],
    ],
    parts: ({ b, h, l }) => {
      const s = F.triangularPrism.side(b, h);
      const sTex = "s = \\sqrt{" + n(b / 2) + "^2 + " + n(h) + "^2}" + (F.isExact(s) ? " = " : " \\approx ") + n(s) + cm;
      return [
        ["right", "Triangle (end)", "tri", work("\\tfrac{1}{2} \\times b \\times h", "\\tfrac{1}{2} \\times " + n(b) + " \\times " + n(h), 0.5 * b * h)],
        ["left", "Triangle (other end)", "tri", work("\\tfrac{1}{2} \\times b \\times h", "\\tfrac{1}{2} \\times " + n(b) + " \\times " + n(h), 0.5 * b * h), "Same as the first triangle."],
        ["bottom", "Bottom rectangle", "rect", work("b \\times l", n(b) + " \\times " + n(l), b * l)],
        ["front", "Sloping rectangle", "side", work("s \\times l", n(s) + " \\times " + n(l), s * l), "First find the sloping side s with Pythagoras: " + texHTML(sTex)],
        ["back", "Other sloping rectangle", "rect", work("s \\times l", n(s) + " \\times " + n(l), s * l), "Same as the first sloping rectangle."],
      ];
    },
    total: ({ b, h, l }) => work("SA", n(b * h) + " + " + n(b * l) + " + 2 \\times " + n(F.triangularPrism.side(b, h) * l), F.triangularPrism.surfaceArea(b, h, l)),
    quiz: [
      { q: "Which shapes make the net of a triangular prism?", options: ["2 triangles and 3 rectangles", "3 triangles and 2 rectangles", "4 triangles", "2 triangles and 2 rectangles"], hint: "Count the ends and the sides separately.", explain: "The two ends are triangles; each side of the triangle gives a rectangle." },
      { q: "To find the area of a sloping rectangle you need…", options: ["the sloping side s, found with Pythagoras", "the height h of the triangle", "the base b", "the volume"], hint: "The width of the sloping rectangle is the slanted side of the triangle.", explain: "s = √((b/2)² + h²); its area is s × l." },
    ],
  },
  cylinder: {
    name: "Cylinder",
    intro: "A cylinder has <b>2 circles</b> and a <b>curved surface</b>. Watch what the curved surface becomes when it is unrolled.",
    dims: [["r", "Radius r", 3, 1, 6], ["h", "Height h", 7, 1, 10]],
    net: cylinderNet,
    colors: { bottom: C[0], top: C[1], curved: C[2] },
    formulas: [
      ["circle", "\\text{Circle} = \\pi r^2"],
      ["curved", "\\text{Curved surface area} = 2\\pi r \\times h = 2\\pi r h"],
      ["total", "SA = 2\\pi r^2 + 2\\pi r h"],
    ],
    gold: "curved",
    parts: ({ r, h }) => [
      ["bottom", "Bottom circle", "circle", work("\\pi r^2", "\\pi \\times " + n(r) + "^2", PI * r * r, r * r)],
      ["top", "Top circle", "circle", work("\\pi r^2", "\\pi \\times " + n(r) + "^2", PI * r * r, r * r), "Same as the bottom."],
      ["curved", "Curved surface", "curved", work("2\\pi r \\times h", "2\\pi \\times " + n(r) + " \\times " + n(h), 2 * PI * r * h, 2 * r * h),
        "Unrolled, it is a <b>rectangle</b>. Its length wraps exactly once around the circle, so it is the <b>circumference 2πr</b> (gold). Its width is the height h."],
    ],
    total: ({ r, h }) => work("SA", "2\\pi \\times " + n(r) + "^2 + 2\\pi \\times " + n(r) + " \\times " + n(h), F.cylinder.surfaceArea(r, h), 2 * r * r + 2 * r * h),
    quiz: [
      { q: "When the curved surface of a cylinder is unrolled, its length is…", options: ["the circumference, 2πr", "the radius, r", "the area of the circle, πr²", "the height, h"], hint: "The rectangle wraps once around the circle.", explain: "So the curved surface area is 2πr × h." },
      { q: "Curved surface area of a cylinder:", options: ["2πrh", "πr²h", "πrh", "2πr²"], hint: "Rectangle: length × width, and the length is 2πr.", explain: "2πr × h = 2πrh." },
    ],
  },
  pyramid: {
    name: "Square-based pyramid",
    intro: "A square-based pyramid has a <b>square base</b> and <b>4 identical triangles</b>.",
    dims: [["b", "Base side b", 6, 1, 10], ["h", "Perpendicular height h", 4, 1, 10]],
    net: pyramidNet,
    colors: { base: C[0], front: C[2], back: C[3], right: C[1], left: C[6] },
    formulas: [
      ["square", "\\text{Square} = b^2"],
      ["side", "s = \\sqrt{h^2 + \\left(\\tfrac{b}{2}\\right)^2}"],
      ["tri", "\\text{Triangle} = \\tfrac{1}{2} \\times b \\times s"],
      ["total", "SA = b^2 + 4 \\times \\tfrac{1}{2} b s"],
    ],
    parts: ({ b, h }) => {
      const s = F.pyramid.faceHeightA(b, b, h), t = 0.5 * b * s;
      const sTex = "s = \\sqrt{" + n(h) + "^2 + " + n(b / 2) + "^2}" + (F.isExact(s) ? " = " : " \\approx ") + n(s) + cm;
      const tri = work("\\tfrac{1}{2} \\times b \\times s", "\\tfrac{1}{2} \\times " + n(b) + " \\times " + n(s), t);
      return [
        ["base", "Square base", "square", work("b^2", n(b) + "^2", b * b)],
        ["front", "Triangle", "side", tri, "The height of each triangle is the <b>slant height s</b>, not h. Find it with Pythagoras: " + texHTML(sTex)],
        ["right", "Triangle", "tri", tri, "All 4 triangles are the same."],
        ["back", "Triangle", "tri", tri],
        ["left", "Triangle", "tri", tri],
      ];
    },
    total: ({ b, h }) => work("SA", n(b * b) + " + 4 \\times " + n(0.5 * b * F.pyramid.faceHeightA(b, b, h)), F.pyramid.surfaceArea(b, b, h)),
    quiz: [
      { q: "The height of each triangular face is…", options: ["the slant height s", "the perpendicular height h", "the base b", "half the base"], hint: "Measure along the face, from the middle of the base edge to the top.", explain: "s = √(h² + (b/2)²)." },
      { q: "How many faces does a square-based pyramid have?", options: ["5", "4", "6", "8"], hint: "The base, plus one triangle on each side of the square.", explain: "1 square + 4 triangles." },
    ],
  },
  cone: {
    name: "Cone",
    intro: "A cone has a <b>circular base</b> and a <b>curved surface</b>. Watch what the curved surface becomes when it is unrolled.",
    dims: [["r", "Radius r", 3, 1, 6], ["h", "Perpendicular height h", 6, 1, 10]],
    net: coneNet,
    colors: { bottom: C[0], curved: C[4] },
    formulas: [
      ["circle", "\\text{Circle} = \\pi r^2"],
      ["slant", "l = \\sqrt{r^2 + h^2}"],
      ["curved", "\\text{Curved surface area} = \\pi r l"],
      ["total", "SA = \\pi r^2 + \\pi r l"],
    ],
    gold: "curved",
    parts: ({ r, h }) => {
      const l = F.cone.slantHeight(r, h);
      const lTex = "l = \\sqrt{" + n(r) + "^2 + " + n(h) + "^2}" + (F.isExact(l) ? " = " : " \\approx ") + n(l) + cm;
      return [
        ["bottom", "Base circle", "circle", work("\\pi r^2", "\\pi \\times " + n(r) + "^2", PI * r * r, r * r)],
        ["curved", "Curved surface", "curved", work("\\pi r l", "\\pi \\times " + n(r) + " \\times " + n(l), PI * r * l, r * l),
          "Unrolled, it is a <b>sector</b> of a circle with radius l, the slant height: " + texHTML(lTex) +
          ". Its arc (gold) is the circumference of the base, 2πr. The whole circle of radius l would have area πl² and circumference 2πl, so the sector is the fraction " +
          texHTML("\\tfrac{2\\pi r}{2\\pi l} = \\tfrac{r}{l}") + " of it: " + texHTML("\\tfrac{r}{l} \\times \\pi l^2 = \\pi r l") + "."],
      ];
    },
    total: ({ r, h }) => { const l = F.cone.slantHeight(r, h); return work("SA", "\\pi \\times " + n(r) + "^2 + \\pi \\times " + n(r) + " \\times " + n(l), F.cone.surfaceArea(r, l), r * r + r * l); },
    quiz: [
      { q: "The curved surface of a cone unrolls into…", options: ["a sector", "a triangle", "a rectangle", "a full circle"], hint: "It has two straight edges (the slant height) and one curved edge.", explain: "A sector of radius l whose arc is 2πr." },
      { q: "Curved surface area of a cone:", options: ["πrl", "πr²", "2πrh", "⅓πr²h"], hint: "It uses the slant height l, not h.", explain: "The sector is r/l of a circle of area πl², which gives πrl." },
      { q: "A cone has r = 3 cm and h = 4 cm. What is l?", options: ["5 cm", "7 cm", "1 cm", "12 cm"], hint: "l² = r² + h².", explain: "√(9 + 16) = √25 = 5." },
    ],
  },
  sphere: {
    name: "Sphere",
    intro: "A sphere has <b>no net</b>: its surface cannot be flattened without stretching or tearing it.",
    dims: [["r", "Radius r", 3, 1, 6]],
    sphere: true,
    colors: { sphere: C[1], circles: C[0] },
    formulas: [
      ["circle", "\\text{Circle} = \\pi r^2"],
      ["total", "SA = 4\\pi r^2"],
    ],
    parts: ({ r }) => [
      ["circles", "4 circles of radius r", "circle", work("4 \\times \\pi r^2", "4 \\times \\pi \\times " + n(r) + "^2", 4 * PI * r * r, 4 * r * r),
        "The surface of a sphere has exactly the same area as <b>4 circles</b> with the same radius."],
    ],
    total: ({ r }) => work("SA", "4\\pi \\times " + n(r) + "^2", F.sphere.surfaceArea(r), 4 * r * r),
    quiz: [
      { q: "Surface area of a sphere:", options: ["4πr²", "πr²", "2πr²", "⁴⁄₃πr³"], hint: "It is the same as 4 circles of radius r.", explain: "4 × πr² = 4πr²." },
      { q: "Why does a sphere have no net?", options: ["Its surface cannot be flattened without stretching", "It has too many faces", "It has no edges, so it has no area", "It is too small"], hint: "Try to flatten the peel of an orange.", explain: "That is why we use the formula 4πr² instead." },
    ],
  },
};

// ---------- Page ----------
initShell();
const viewer = createViewer(document.getElementById("viewer"));
const S = { solid: "cuboid", dims: {}, u: 0, target: 0, revealed: 0, sel: null, fold: null, sphereParts: null, finale: false };
Object.keys(SOLIDS).forEach((k) => { S.dims[k] = {}; SOLIDS[k].dims.forEach(([id, , v]) => (S.dims[k][id] = v)); });

const $ = (id) => document.getElementById(id);
const unfoldInput = $("unfold"), unfoldOut = $("unfold-out"), playBtn = $("play");

function solid() { return SOLIDS[S.solid]; }
function partsNow() { return solid().parts(S.dims[S.solid]); }

// ---------- 3D ----------
function build(reframe) {
  viewer.clear();
  S.fold = null; S.sphereParts = null;
  const sol = solid(), d = S.dims[S.solid];
  if (sol.sphere) buildSphere(d.r);
  else {
    S.fold = buildFoldable(viewer, sol.net(d), sol.colors);
    S.fold.setUnfold(S.u);
  }
  applyHighlight();
  if (reframe) frame();
}

function frame() {
  const sol = solid(), d = S.dims[S.solid];
  if (sol.sphere) viewer.frame(new THREE.Vector3(2.1 * d.r, 0.6 * d.r, 0), 2.7 * d.r, new THREE.Vector3(0.2, 0.6, 1));
  else {
    const net = sol.net(d);
    viewer.frame(new THREE.Vector3(0, net.size * 0.15, 0), Math.max(buildRadius(net) * 0.82, net.size * 0.8), new THREE.Vector3(0.55, 1.05, 1.25));
  }
}
function buildRadius(net) {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  net.faces.forEach((f) => f.poly.forEach(([x, z]) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z); }));
  return Math.hypot(maxX - minX, maxZ - minZ) / 2;
}

// Sphere: no net. Show it beside 4 circles of the same radius (they grow in at the "4 circles" step).
function buildSphere(r) {
  const cols = solid().colors;
  const mat = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, side: THREE.DoubleSide });
  const sph = new THREE.Mesh(new THREE.SphereGeometry(r, 64, 32), mat(cols.sphere));
  sph.position.set(0, r, 0);
  sph.userData.part = "sphere";
  viewer.root.add(sph);
  const lbl = viewer.label("r = " + n(r) + " cm", "lbl dim");
  lbl.position.set(r / 2, r, 0);
  const radius = new THREE.Mesh(new THREE.CylinderGeometry(r / 80, r / 80, r, 8), new THREE.MeshBasicMaterial({ color: 0x6b4410 }));
  radius.rotation.z = PI / 2; radius.position.set(r / 2, r, 0);
  viewer.root.add(lbl, radius);
  const discs = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const disc = new THREE.Mesh(new THREE.CircleGeometry(r, 64), mat(cols.circles));
    disc.rotation.x = -PI / 2;
    disc.position.set(2.2 * r + (i % 2) * 2.1 * r, 0.01, (i < 2 ? -1 : 1) * 1.05 * r);
    disc.userData.part = "circles";
    const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, r, r).getPoints(64)), new THREE.LineBasicMaterial({ color: 0x1b2430 }));
    disc.add(ring);
    discs.add(disc);
  }
  discs.scale.setScalar(S.u > 0.5 ? 1 : 0.0001);
  viewer.root.add(discs);
  S.sphereParts = { sph, discs, mats: { sphere: sph.material, circles: discs.children[0].material } };
  discs.children.forEach((dd) => (dd.material = S.sphereParts.mats.circles));
}

function applyHighlight() {
  if (S.fold) {
    S.fold.highlight(S.sel);
    const parts = partsNow(), sol = solid();
    parts.forEach(([id], i) => {
      const value = areaOf(id);
      S.fold.setLabel(id, i < S.revealed || S.finale ? value : "");
    });
    S.fold.showGold(!!sol.gold && S.sel === sol.gold && S.u > 0.02);
  } else if (S.sphereParts) {
    const { mats } = S.sphereParts;
    Object.entries(mats).forEach(([k, m]) => {
      m.emissive.set(k === S.sel ? m.color : 0x000000);
      m.emissiveIntensity = k === S.sel ? 0.3 : 0;
    });
  }
}
// "24 cm²" style label for a part, taken from the end of its working
function areaOf(id) {
  const row = partsNow().find((p) => p[0] === id);
  if (!row) return "";
  const m = row[3].match(/(?:=|\\approx)\s*([\d.]+)\\ \\text\{cm\}\^2$/);
  return m ? m[1] + " cm²" : "";
}

// ---------- Unfold animation ----------
viewer.onTick((dt) => {
  if (S.u === S.target) return;
  const step = dt * 0.55;
  S.u = Math.abs(S.target - S.u) <= step ? S.target : S.u + Math.sign(S.target - S.u) * step;
  setU(S.u, false);
});
function setU(u, fromSlider) {
  S.u = u;
  if (fromSlider) S.target = u;
  if (S.fold) S.fold.setUnfold(u);
  if (S.sphereParts) S.sphereParts.discs.scale.setScalar(Math.max(0.0001, u));
  unfoldInput.value = Math.round(u * 100);
  unfoldOut.textContent = Math.round(u * 100) + "%";
  playBtn.textContent = S.u !== S.target ? "Pause" : u > 0.5 ? (solid().sphere ? "Hide circles" : "Fold") : solid().sphere ? "Show circles" : "Unfold";
  applyHighlight();
}
function animateTo(t) { S.target = t; }
function playPause() {
  if (S.u !== S.target) S.target = S.u;
  else S.target = S.u > 0.5 ? 0 : 1;
  setU(S.u, false);
}
unfoldInput.addEventListener("input", () => setU(unfoldInput.value / 100, true));
playBtn.addEventListener("click", playPause);
onKey("space", playPause);
onKey("r", () => viewer.resetView());
$("reset-view").addEventListener("click", () => viewer.resetView());

// Click a face in 3D: select its part (and its row in the sum)
viewer.onClick((hit) => {
  const part = hit && hit.object.userData.part;
  S.sel = part && part !== S.sel ? part : null;
  renderSum(); applyHighlight(); renderFormulas();
});

// ---------- Panels ----------
function renderTabs() {
  const box = $("solid-tabs");
  box.innerHTML = "";
  Object.entries(SOLIDS).forEach(([k, sol]) => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = sol.name;
    b.setAttribute("aria-pressed", String(k === S.solid));
    b.addEventListener("click", () => selectSolid(k));
    box.appendChild(b);
  });
}

function renderDims() {
  const box = $("dims"), d = S.dims[S.solid];
  box.innerHTML = "";
  solid().dims.forEach(([id, label, , min, max]) => {
    const row = document.createElement("div");
    row.className = "dim-row";
    row.innerHTML = `<label for="dim-${id}">${label}</label><output>${n(d[id])} cm</output>` +
      `<input type="range" id="dim-${id}" min="${min}" max="${max}" step="0.5" value="${d[id]}">`;
    row.querySelector("input").addEventListener("input", (e) => {
      d[id] = parseFloat(e.target.value);
      row.querySelector("output").textContent = n(d[id]) + " cm";
      build(false); renderDimsExtra(); renderSum();
    });
    box.appendChild(row);
  });
  renderDimsExtra();
}

// the slant height worked out from the current dimensions, under the sliders
function renderDimsExtra() {
  const d = S.dims[S.solid], extra = $("dims-extra");
  const line = (text, sym, v) => text + " " + texHTML(sym + (F.isExact(v) ? " = " : " \\approx ") + n(v) + cm);
  extra.innerHTML =
    S.solid === "cone" ? line("Slant height", "l = \\sqrt{r^2 + h^2}", F.cone.slantHeight(d.r, d.h)) :
    S.solid === "pyramid" ? line("Slant height of each triangle", "s = \\sqrt{h^2 + \\left(\\tfrac{b}{2}\\right)^2}", F.pyramid.faceHeightA(d.b, d.b, d.h)) :
    S.solid === "prism" ? line("Sloping side", "s = \\sqrt{\\left(\\tfrac{b}{2}\\right)^2 + h^2}", F.triangularPrism.side(d.b, d.h)) : "";
}

function renderFormulas() {
  const box = $("formulas"), sol = solid();
  const parts = partsNow();
  const selRow = parts.find((p) => p[0] === S.sel);
  const on = S.finale ? "total" : selRow ? selRow[2] : null;
  box.innerHTML = "";
  sol.formulas.forEach(([id, src]) => {
    const div = document.createElement("div");
    div.className = "formula" + (id === on ? " on" : "");
    tex(div, src);
    box.appendChild(div);
  });
}

function renderSum() {
  const list = $("sum"), parts = partsNow(), colors = solid().colors;
  list.innerHTML = "";
  parts.slice(0, S.finale ? parts.length : S.revealed).forEach(([id, name, , calc, note]) => {
    const li = document.createElement("li");
    li.className = id === S.sel ? "on" : "";
    li.innerHTML = `<span class="chip" style="background:${colors[id]}"></span><span class="what">${name}</span><span class="calc"></span>` +
      (note ? `<span class="note">${note}</span>` : "");
    tex(li.querySelector(".calc"), calc);
    li.addEventListener("click", () => { S.sel = S.sel === id ? null : id; renderSum(); applyHighlight(); renderFormulas(); });
    list.appendChild(li);
  });
  const total = $("total");
  total.hidden = !S.finale;
  if (S.finale) tex(total, "\\text{Total } " + solid().total(S.dims[S.solid]));
  $("sum-empty").hidden = S.revealed > 0 || S.finale;
}

// ---------- Steps ----------
let steps = null;
function makeSteps() {
  const sol = solid(), parts = partsNow();
  const list = [];
  list.push({
    title: sol.sphere ? "A sphere" : "The " + sol.name.toLowerCase(),
    html: "<p>" + sol.intro + "</p><p class='student-only'>Drag the solid to turn it. Pinch or scroll to zoom.</p>",
    enter: () => { S.revealed = 0; S.sel = null; S.finale = false; animateTo(0); update(); },
  });
  if (!sol.sphere) {
    list.push({
      title: "Unfold it into a net",
      html: "<p>The net is the solid opened out flat. Every face of the solid is a shape in the net.</p>" +
        "<p class='student-only'>Move the <b>Unfold</b> slider to fold and unfold it slowly.</p>",
      enter: () => { S.revealed = 0; S.sel = null; S.finale = false; animateTo(1); update(); },
    });
  }
  parts.forEach(([id, name], i) => {
    list.push({
      title: (sol.sphere ? "" : "Face by face: ") + name,
      html: "<p>Find the area of each part of the net. The part is lit up in the 3D view and added to the sum.</p>",
      enter: () => { S.revealed = i + 1; S.sel = id; S.finale = false; animateTo(1); update(); },
    });
  });
  list.push({
    title: "Add them up",
    html: "<p>The <b>surface area</b> is the total area of all the faces, so it is the area of the net.</p>" +
      "<p class='student-only'>Click a row of the sum, or a face in 3D, to see where it is.</p>",
    enter: () => { S.revealed = parts.length; S.sel = null; S.finale = true; update(); },
  });
  steps = createSteps($("steps"), list);
}

function update() { renderSum(); applyHighlight(); renderFormulas(); }

function selectSolid(k) {
  S.solid = k; S.u = 0; S.target = 0; S.sel = null; S.revealed = 0; S.finale = false;
  renderTabs(); renderDims(); build(true); setU(0, true);
  $("unfold-label").textContent = solid().sphere ? "4 circles" : "Unfold";
  makeSteps(); update();
  quiz($("quiz"), solid().quiz);
}

onModeChange(() => setTimeout(frame, 50));
const asked = new URLSearchParams(location.search).get("solid");
selectSolid(asked in SOLIDS ? asked : "cuboid");

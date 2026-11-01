// Module 5 · Composite Solids & Frustums
import { createViewer, THREE } from "../viewer.js";
import { initShell, onKey, createSteps, quiz } from "../shell.js";
import { geo, solidMat, glassMat, outlined } from "../solids.js";
import { n, eqv, work, unitTex, sliders, defaults, tabs, formulaBar, workingHTML, dimLine, COLORS, HIDDEN, v3 } from "../kit.js";
import * as F from "../formulas.js";

const { PI, hypot } = Math;
const cm2 = unitTex.cm2, cm3 = unitTex.cm3;
const pk = (k) => F.piForm(k).replace("π", "\\pi"); // coefficient of π in TeX

// ---------- Building blocks ----------
function part(mesh, offset, ...extras) {
  const g = new THREE.Group();
  g.add(mesh, ...extras);
  return { group: g, offset };
}
// a face hidden by the join, drawn in red at height y
function hiddenDisc(viewer, r, y, label) {
  const m = new THREE.Mesh(geo.disc(r * 0.995), new THREE.MeshBasicMaterial({ color: HIDDEN, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
  m.position.y = y;
  m.userData.hidden = true;
  if (label) { const l = labelFor(viewer, "hidden: not in SA"); m.add(l); l.position.set(r * 0.9, 0, r * 0.5); }
  return m;
}
function hiddenSquare(viewer, a, y, label) {
  const m = new THREE.Mesh(geo.square(a * 0.995), new THREE.MeshBasicMaterial({ color: HIDDEN, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
  m.position.y = y;
  m.userData.hidden = true;
  if (label) { const l = labelFor(viewer, "hidden: not in SA"); m.add(l); l.position.set(a * 0.55, 0, a * 0.4); }
  return m;
}
function labelFor(viewer, text) { return viewer.label(text, "lbl red"); }

// ---------- The solids ----------
// each: dims, build(d) → { parts: [{group, offset}] }, volume(d) → lines, area(d) → lines, frustum?: true
const SOLIDS = {
  hemiCyl: {
    name: "Hemisphere on cylinder",
    dims: [["r", "Radius r", 3, 1, 5], ["h", "Cylinder height h", 6, 1, 10]],
    build: (V, { r, h }) => ({
      parts: [
        part(outlined(geo.cylinder(r, h), solidMat(COLORS[1])), v3(0, 0, 0), hiddenDisc(V, r, h, true), dimLine(V, v3(r + 0.4, 0, 0), v3(r + 0.4, h, 0), "h = " + n(h), { r: 0.04 }), dimLine(V, v3(0, 0.02, 0), v3(-r, 0.02, 0), "r = " + n(r), { r: 0.04 })),
        part(outlined(geo.hemisphere(r), solidMat(COLORS[0])), v3(0, r + 1.5, 0), hiddenDisc(V, r, 0.01)),
      ].map((p, i) => (i === 1 ? (p.group.position.y = h, p) : p)),
    }),
    volume: ({ r, h }) => [
      ["Hemisphere", work("", "\\tfrac{2}{3}\\pi \\times " + n(r) + "^3", F.hemisphere.volume(r), (2 / 3) * r ** 3, "cm3")],
      ["+ Cylinder", work("", "\\pi \\times " + n(r) + "^2 \\times " + n(h), F.cylinder.volume(r, h), r * r * h, "cm3")],
      ["= Total volume", work("V", n(F.hemisphere.volume(r)) + " + " + n(F.cylinder.volume(r, h)), F.composite.hemisphereOnCylinder.volume(r, h), (2 / 3) * r ** 3 + r * r * h, "cm3")],
    ],
    area: ({ r, h }) => [
      ["Curved surface of the hemisphere", work("", "2\\pi \\times " + n(r) + "^2", 2 * PI * r * r, 2 * r * r)],
      ["Curved surface of the cylinder", work("", "2\\pi \\times " + n(r) + " \\times " + n(h), 2 * PI * r * h, 2 * r * h)],
      ["Bottom circle", work("", "\\pi \\times " + n(r) + "^2", PI * r * r, r * r)],
      ["Two circles where they join: hidden", work("", "2 \\times \\pi r^2", 2 * PI * r * r, 2 * r * r), "out red"],
      ["= Total surface area", work("SA", "2\\pi r^2 + 2\\pi r h + \\pi r^2", F.composite.hemisphereOnCylinder.surfaceArea(r, h), 3 * r * r + 2 * r * h)],
    ],
  },
  coneCyl: {
    name: "Cone on cylinder",
    dims: [["r", "Radius r", 3, 1, 5], ["h", "Cylinder height h", 5, 1, 10], ["k", "Cone height k", 4, 1, 8]],
    build: (V, { r, h, k }) => {
      const top = part(outlined(geo.cone(r, k), solidMat(COLORS[0])), v3(0, 1.5, 0), hiddenDisc(V, r, 0.01), dimLine(V, v3(0, 0, 0), v3(0, k, 0), "k = " + n(k), { r: 0.04, dashed: true }));
      top.group.position.y = h;
      return { parts: [part(outlined(geo.cylinder(r, h), solidMat(COLORS[1])), v3(), hiddenDisc(V, r, h, true), dimLine(V, v3(r + 0.4, 0, 0), v3(r + 0.4, h, 0), "h = " + n(h), { r: 0.04 }), dimLine(V, v3(0, 0.02, 0), v3(-r, 0.02, 0), "r = " + n(r), { r: 0.04 })), top] };
    },
    volume: ({ r, h, k }) => [
      ["Cone", work("", "\\tfrac{1}{3}\\pi \\times " + n(r) + "^2 \\times " + n(k), F.cone.volume(r, k), (r * r * k) / 3, "cm3")],
      ["+ Cylinder", work("", "\\pi \\times " + n(r) + "^2 \\times " + n(h), F.cylinder.volume(r, h), r * r * h, "cm3")],
      ["= Total volume", work("V", n(F.cone.volume(r, k)) + " + " + n(F.cylinder.volume(r, h)), F.composite.coneOnCylinder.volume(r, h, k), (r * r * k) / 3 + r * r * h, "cm3")],
    ],
    area: ({ r, h, k }) => {
      const l = F.cone.slantHeight(r, k);
      return [
        ["Slant height of the cone", "l = \\sqrt{" + n(r) + "^2 + " + n(k) + "^2}" + eqv(l) + unitTex.cm],
        ["Curved surface of the cone", work("", "\\pi \\times " + n(r) + " \\times " + n(l), PI * r * l, r * l)],
        ["Curved surface of the cylinder", work("", "2\\pi \\times " + n(r) + " \\times " + n(h), 2 * PI * r * h, 2 * r * h)],
        ["Bottom circle", work("", "\\pi \\times " + n(r) + "^2", PI * r * r, r * r)],
        ["Two circles where they join: hidden", work("", "2 \\times \\pi r^2", 2 * PI * r * r, 2 * r * r), "out red"],
        ["= Total surface area", work("SA", "\\pi r l + 2\\pi r h + \\pi r^2", F.composite.coneOnCylinder.surfaceArea(r, h, k), r * l + 2 * r * h + r * r)],
      ];
    },
  },
  coneHemi: {
    name: "Cone on hemisphere",
    dims: [["r", "Radius r", 3, 1, 5], ["k", "Cone height k", 7, 1, 10]],
    build: (V, { r, k }) => {
      const bowl = part(outlined(geo.hemisphere(r, false), solidMat(COLORS[2])), v3(), hiddenDisc(V, r, 0.0, true), dimLine(V, v3(0, 0.02, 0), v3(-r, 0.02, 0), "r = " + n(r), { r: 0.04 }));
      bowl.group.position.y = r;
      const top = part(outlined(geo.cone(r, k), solidMat(COLORS[0])), v3(0, 1.5, 0), hiddenDisc(V, r, 0.01), dimLine(V, v3(0, 0, 0), v3(0, k, 0), "k = " + n(k), { r: 0.04, dashed: true }));
      top.group.position.y = r;
      return { parts: [bowl, top] };
    },
    volume: ({ r, k }) => [
      ["Cone", work("", "\\tfrac{1}{3}\\pi \\times " + n(r) + "^2 \\times " + n(k), F.cone.volume(r, k), (r * r * k) / 3, "cm3")],
      ["+ Hemisphere", work("", "\\tfrac{2}{3}\\pi \\times " + n(r) + "^3", F.hemisphere.volume(r), (2 / 3) * r ** 3, "cm3")],
      ["= Total volume", work("V", n(F.cone.volume(r, k)) + " + " + n(F.hemisphere.volume(r)), F.composite.coneOnHemisphere.volume(r, k), (r * r * k) / 3 + (2 / 3) * r ** 3, "cm3")],
    ],
    area: ({ r, k }) => {
      const l = F.cone.slantHeight(r, k);
      return [
        ["Slant height of the cone", "l = \\sqrt{" + n(r) + "^2 + " + n(k) + "^2}" + eqv(l) + unitTex.cm],
        ["Curved surface of the cone", work("", "\\pi \\times " + n(r) + " \\times " + n(l), PI * r * l, r * l)],
        ["Curved surface of the hemisphere", work("", "2\\pi \\times " + n(r) + "^2", 2 * PI * r * r, 2 * r * r)],
        ["Two circles where they join: hidden", work("", "2 \\times \\pi r^2", 2 * PI * r * r, 2 * r * r), "out red"],
        ["= Total surface area", work("SA", "\\pi r l + 2\\pi r^2", F.composite.coneOnHemisphere.surfaceArea(r, k), r * l + 2 * r * r)],
      ];
    },
  },
  hole: {
    name: "Cuboid with a hole",
    dims: [["l", "Length l", 8, 3, 10], ["w", "Width w", 6, 3, 10], ["h", "Height h", 4, 1, 8], ["r", "Hole radius r", 1.5, 0.5, 4]],
    fix: (d) => { d.r = Math.min(d.r, Math.min(d.l, d.w) / 2 - 0.4); },
    build: (V, { l, w, h, r }) => {
      const sh = new THREE.Shape([v2(-l / 2, -w / 2), v2(l / 2, -w / 2), v2(l / 2, w / 2), v2(-l / 2, w / 2)]);
      sh.holes.push(new THREE.Path().absarc(0, 0, r, 0, 2 * PI, true));
      const g = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false, curveSegments: 48 }).rotateX(-PI / 2);
      const block = outlined(g, [solidMat(COLORS[1]), solidMat(COLORS[2])]);
      // the cylinder that was drilled out, with its two circles in red
      const plug = new THREE.Group();
      plug.add(outlined(geo.cylinder(r * 0.99, h), glassMat("#d0342c")), hiddenDisc(V, r, 0.01), hiddenDisc(V, r, h, true));
      return {
        parts: [
          part(block, v3(), dimLine(V, v3(-l / 2, 0, w / 2 + 0.4), v3(l / 2, 0, w / 2 + 0.4), "l = " + n(l), { r: 0.04 }),
            dimLine(V, v3(l / 2 + 0.4, 0, -w / 2), v3(l / 2 + 0.4, 0, w / 2), "w = " + n(w), { r: 0.04 }),
            dimLine(V, v3(l / 2 + 0.4, 0, w / 2), v3(l / 2 + 0.4, h, w / 2), "h = " + n(h), { r: 0.04 })),
          part(plug, v3(0, h + 1.5, 0), dimLine(V, v3(0, h, 0), v3(r, h, 0), "r = " + n(r), { r: 0.03 })),
        ],
      };
    },
    volume: ({ l, w, h, r }) => [
      ["Cuboid", work("", n(l) + " \\times " + n(w) + " \\times " + n(h), l * w * h, undefined, "cm3")],
      ["− Cylinder (the hole)", work("", "\\pi \\times " + n(r) + "^2 \\times " + n(h), F.cylinder.volume(r, h), r * r * h, "cm3")],
      ["= Volume", work("V", n(l * w * h) + " - " + n(F.cylinder.volume(r, h)), F.composite.cuboidWithHole.volume(l, w, h, r), undefined, "cm3")],
    ],
    area: ({ l, w, h, r }) => [
      ["Surface area of the cuboid", work("", "2(" + n(l * w) + " + " + n(l * h) + " + " + n(w * h) + ")", F.cuboid.surfaceArea(l, w, h))],
      ["− the two circles cut out of the top and bottom", work("", "2 \\times \\pi \\times " + n(r) + "^2", 2 * PI * r * r, 2 * r * r), "red"],
      ["+ the inside of the hole (curved surface)", work("", "2\\pi \\times " + n(r) + " \\times " + n(h), 2 * PI * r * h, 2 * r * h)],
      ["= Total surface area", work("SA", n(F.cuboid.surfaceArea(l, w, h)) + " - " + n(2 * PI * r * r) + " + " + n(2 * PI * r * h), F.composite.cuboidWithHole.surfaceArea(l, w, h, r))],
    ],
  },
  cubePyr: {
    name: "Cuboid + pyramid",
    dims: [["a", "Base side a", 6, 2, 10], ["h", "Cuboid height h", 5, 1, 10], ["p", "Pyramid height p", 4, 1, 8]],
    build: (V, { a, h, p }) => {
      const top = part(outlined(geo.pyramid(a, a, p), solidMat(COLORS[0])), v3(0, 1.5, 0), hiddenSquare(V, a, 0.01), dimLine(V, v3(0, 0, 0), v3(0, p, 0), "p = " + n(p), { r: 0.04, dashed: true }));
      top.group.position.y = h;
      return { parts: [part(outlined(geo.box(a, a, h), solidMat(COLORS[1])), v3(), hiddenSquare(V, a, h, true), dimLine(V, v3(a / 2 + 0.4, 0, a / 2), v3(a / 2 + 0.4, h, a / 2), "h = " + n(h), { r: 0.04 }), dimLine(V, v3(-a / 2, 0, a / 2 + 0.4), v3(a / 2, 0, a / 2 + 0.4), "a = " + n(a), { r: 0.04 })), top] };
    },
    volume: ({ a, h, p }) => [
      ["Cuboid", work("", n(a) + "^2 \\times " + n(h), a * a * h, undefined, "cm3")],
      ["+ Pyramid", work("", "\\tfrac{1}{3} \\times " + n(a) + "^2 \\times " + n(p), (a * a * p) / 3, undefined, "cm3")],
      ["= Total volume", work("V", n(a * a * h) + " + " + n((a * a * p) / 3), F.composite.prismWithPyramid.volume(a, h, p), undefined, "cm3")],
    ],
    area: ({ a, h, p }) => {
      const s = F.pyramid.faceHeightA(a, a, p);
      return [
        ["Slant height of a triangle", "s = \\sqrt{" + n(p) + "^2 + " + n(a / 2) + "^2}" + eqv(s) + unitTex.cm],
        ["4 triangles", work("", "4 \\times \\tfrac{1}{2} \\times " + n(a) + " \\times " + n(s), 2 * a * s)],
        ["4 sides of the cuboid", work("", "4 \\times " + n(a) + " \\times " + n(h), 4 * a * h)],
        ["Bottom square", work("", n(a) + "^2", a * a)],
        ["Two squares where they join: hidden", work("", "2 \\times " + n(a) + "^2", 2 * a * a), "out red"],
        ["= Total surface area", work("SA", n(2 * a * s) + " + " + n(4 * a * h) + " + " + n(a * a), F.composite.prismWithPyramid.surfaceArea(a, h, p))],
      ];
    },
  },
  coneFrustum: {
    name: "Frustum of a cone",
    frustum: true,
    dims: [["R", "Bottom radius R", 4, 1.5, 6], ["r", "Top radius r", 2, 0.5, 5.5], ["h", "Frustum height h", 4, 1, 8]],
    fix: (d) => { d.r = Math.min(d.r, d.R - 0.5); },
    build: (V, { R, r, h }) => {
      const H = F.coneFrustum.fullHeight(R, r, h), top = part(outlined(geo.cone(r, H - h), glassMat("#e69f00")), v3(0, 2.5, 0),
        dimLine(V, v3(0, 0, 0), v3(0, H - h, 0), "H − h = " + n(H - h), { r: 0.04, dashed: true, offset: v3(-0.9, 0, 0) }));
      top.group.position.y = h;
      return {
        parts: [part(outlined(geo.frustum(R, r, h), solidMat(COLORS[4])), v3(),
          dimLine(V, v3(0, 0.02, 0), v3(R, 0.02, 0), "R = " + n(R), { r: 0.04 }), dimLine(V, v3(0, h + 0.02, 0), v3(r, h + 0.02, 0), "r = " + n(r), { r: 0.04 }),
          dimLine(V, v3(-R - 0.4, 0, 0), v3(-R - 0.4, h, 0), "h = " + n(h), { r: 0.04 }),
          dimLine(V, v3(R + 0.9, 0, 0), v3(R + 0.9, H, 0), "H = " + n(H), { r: 0.04, color: 0x0072b2, cls: "lbl h" })), top],
      };
    },
    volume: ({ R, r, h }) => {
      const H = F.coneFrustum.fullHeight(R, r, h);
      return [
        ["Similar triangles: H / R = (H − h) / r", "H = \\frac{hR}{R - r} = \\frac{" + n(h) + " \\times " + n(R) + "}{" + n(R) + " - " + n(r) + "}" + eqv(H) + unitTex.cm],
        ["Big cone", work("", "\\tfrac{1}{3}\\pi \\times " + n(R) + "^2 \\times " + n(H), F.cone.volume(R, H), (R * R * H) / 3, "cm3")],
        ["− Small cone", work("", "\\tfrac{1}{3}\\pi \\times " + n(r) + "^2 \\times " + n(H - h), F.cone.volume(r, H - h), (r * r * (H - h)) / 3, "cm3")],
        ["= Volume of the frustum", work("V", n(F.cone.volume(R, H)) + " - " + n(F.cone.volume(r, H - h)), F.coneFrustum.volume(R, r, h), (h * (R * R + R * r + r * r)) / 3, "cm3")],
      ];
    },
    area: ({ R, r, h }) => {
      const H = F.coneFrustum.fullHeight(R, r, h), L = hypot(R, H), l = hypot(r, H - h);
      return [
        ["Slant heights", "L = \\sqrt{" + n(R) + "^2 + " + n(H) + "^2}" + eqv(L) + ", \\quad l = \\sqrt{" + n(r) + "^2 + " + n(H - h) + "^2}" + eqv(l)],
        ["Curved surface = πRL − πrl", work("", "\\pi \\times " + n(R) + " \\times " + n(L) + " - \\pi \\times " + n(r) + " \\times " + n(l), F.coneFrustum.curvedSurfaceArea(R, r, h))],
        ["+ both circles", work("", "\\pi \\times " + n(R) + "^2 + \\pi \\times " + n(r) + "^2", PI * (R * R + r * r), R * R + r * r)],
        ["= Total surface area", work("SA", n(F.coneFrustum.curvedSurfaceArea(R, r, h)) + " + " + n(PI * (R * R + r * r)), F.coneFrustum.surfaceArea(R, r, h))],
      ];
    },
  },
  pyrFrustum: {
    name: "Frustum of a pyramid",
    frustum: true,
    dims: [["A", "Bottom side A", 8, 2, 10], ["a", "Top side a", 4, 1, 9], ["h", "Frustum height h", 4, 1, 8]],
    fix: (d) => { d.a = Math.min(d.a, d.A - 1); },
    build: (V, { A, a, h }) => {
      const H = F.pyramidFrustum.fullHeight(A, a, h), top = part(outlined(geo.pyramid(a, a, H - h), glassMat("#e69f00")), v3(0, 2.5, 0),
        dimLine(V, v3(0, 0, 0), v3(0, H - h, 0), "H − h = " + n(H - h), { r: 0.04, dashed: true, offset: v3(-0.9, 0, 0) }));
      top.group.position.y = h;
      return {
        parts: [part(outlined(geo.squareFrustum(A, a, h), solidMat(COLORS[4])), v3(),
          dimLine(V, v3(-A / 2, 0, A / 2 + 0.4), v3(A / 2, 0, A / 2 + 0.4), "A = " + n(A), { r: 0.04 }),
          dimLine(V, v3(-a / 2, h, a / 2 + 0.2), v3(a / 2, h, a / 2 + 0.2), "a = " + n(a), { r: 0.04 }),
          dimLine(V, v3(-A / 2 - 0.4, 0, 0), v3(-A / 2 - 0.4, h, 0), "h = " + n(h), { r: 0.04 }),
          dimLine(V, v3(A / 2 + 0.9, 0, 0), v3(A / 2 + 0.9, H, 0), "H = " + n(H), { r: 0.04, color: 0x0072b2, cls: "lbl h" })), top],
      };
    },
    volume: ({ A, a, h }) => {
      const H = F.pyramidFrustum.fullHeight(A, a, h);
      return [
        ["Similar triangles: H / A = (H − h) / a", "H = \\frac{hA}{A - a} = \\frac{" + n(h) + " \\times " + n(A) + "}{" + n(A) + " - " + n(a) + "}" + eqv(H) + unitTex.cm],
        ["Big pyramid", work("", "\\tfrac{1}{3} \\times " + n(A) + "^2 \\times " + n(H), (A * A * H) / 3, undefined, "cm3")],
        ["− Small pyramid", work("", "\\tfrac{1}{3} \\times " + n(a) + "^2 \\times " + n(H - h), (a * a * (H - h)) / 3, undefined, "cm3")],
        ["= Volume of the frustum", work("V", n((A * A * H) / 3) + " - " + n((a * a * (H - h)) / 3), F.pyramidFrustum.volume(A, a, h), undefined, "cm3")],
      ];
    },
    area: ({ A, a, h }) => {
      const s = F.pyramidFrustum.faceHeight(A, a, h);
      return [
        ["Height of each trapezium face", "s = \\sqrt{" + n(h) + "^2 + " + n((A - a) / 2) + "^2}" + eqv(s) + unitTex.cm],
        ["4 trapezium faces", work("", "4 \\times \\tfrac{1}{2}(" + n(A) + " + " + n(a) + ") \\times " + n(s), 2 * (A + a) * s)],
        ["+ both squares", work("", n(A) + "^2 + " + n(a) + "^2", A * A + a * a)],
        ["= Total surface area", work("SA", n(2 * (A + a) * s) + " + " + n(A * A + a * a), F.pyramidFrustum.surfaceArea(A, a, h))],
      ];
    },
  },
};
function v2(x, y) { return new THREE.Vector2(x, y); }

// ---------- Page ----------
initShell();
const viewer = createViewer(document.getElementById("viewer"));
const $ = (id) => document.getElementById(id);
const S = { solid: "hemiCyl", dims: {}, u: 0, target: 0, focus: null };
Object.keys(SOLIDS).forEach((k) => (S.dims[k] = defaults(SOLIDS[k].dims)));
const sol = () => SOLIDS[S.solid];
let parts = [], hiddenBits = [];

function build() {
  viewer.clear();
  const d = S.dims[S.solid];
  if (sol().fix) sol().fix(d);
  parts = sol().build(viewer, d).parts;
  parts.forEach((p) => { p.home = p.group.position.clone(); viewer.root.add(p.group); });
  hiddenBits = [];
  viewer.root.traverse((o) => { if (o.userData.hidden) hiddenBits.push(o); });
  place();
  renderMain();
}
function place() {
  const k = S.u * S.u * (3 - 2 * S.u);
  parts.forEach((p) => p.group.position.copy(p.home).addScaledVector(p.offset, k));
  // the hidden faces (and their labels) only show while the parts are apart
  hiddenBits.forEach((m) => m.traverse((o) => { o.visible = S.u > 0.03; })); // labels too: CSS2D ignores the parent's visibility
}
function frame() {
  // fit both the joined solid and its parts pulled apart
  const box = new THREE.Box3(), u = S.u;
  [0, 1].forEach((k) => { S.u = k; place(); parts.forEach((p) => box.expandByObject(p.group)); });
  S.u = u; place();
  const c = box.getCenter(new THREE.Vector3()), r = box.getSize(new THREE.Vector3()).length() / 2;
  viewer.frame(c.add(v3(0, 0.8, 0)), r * 0.95 + 1, v3(0.85, 0.5, 1.3));
}

viewer.onTick((dt) => {
  if (S.u === S.target) return;
  const step = dt * 0.6;
  S.u = Math.abs(S.target - S.u) <= step ? S.target : S.u + Math.sign(S.target - S.u) * step;
  sync(); place();
});
function sync() {
  $("sep").value = Math.round(S.u * 100);
  const f = sol().frustum;
  $("play").textContent = S.u !== S.target ? "Pause" : S.u > 0.5 ? (f ? "Put back" : "Join") : f ? "Lift off small " + (S.solid === "coneFrustum" ? "cone" : "pyramid") : "Separate";
  $("sep-label").textContent = f ? "Lift off" : "Separate";
}
function playPause() { S.target = S.u !== S.target ? S.u : S.u > 0.5 ? 0 : 1; sync(); }
$("sep").addEventListener("input", (e) => { S.u = S.target = e.target.value / 100; sync(); place(); });
$("play").addEventListener("click", playPause);
onKey("space", playPause);
onKey("r", () => viewer.resetView());
$("reset-view").addEventListener("click", () => viewer.resetView());

function renderMain() {
  const d = S.dims[S.solid];
  $("main").innerHTML = "<h3>Volume</h3>" + workingHTML(sol().volume(d)) + "<h3 style='margin-top:14px'>Surface area</h3>" + workingHTML(sol().area(d)) +
    (sol().frustum ? "" : "<p class='hint'><span class='legend-red'>Red</span>: faces hidden inside the solid where the parts join. They are not part of the surface area.</p>");
  formulaBar($("formulas"), sol().frustum ? [
    ["sim", "\\text{Similar triangles: } \\frac{H}{R} = \\frac{H - h}{r}"],
    ["vol", "V = V_{\\text{big}} - V_{\\text{small}}"],
    ["sa", "\\text{Curved SA} = \\pi R L - \\pi r l"],
  ] : [
    ["vol", "V = V_1 + V_2 \\quad (\\text{or } V_1 - V_2 \\text{ for a hole})"],
    ["sa", "SA = \\text{outside faces only}"],
  ], S.focus);
}

let steps;
function makeSteps() {
  const at = (u, focus) => () => { S.target = u; S.focus = focus; sync(); renderMain(); };
  const f = sol().frustum, what = S.solid === "coneFrustum" ? "cone" : "pyramid";
  steps = createSteps($("steps"), f ? [
    { title: "A frustum", html: `<p>A <b>frustum</b> is a ${what} with its top cut off, parallel to the base.</p>`, enter: at(0, null) },
    { title: `Big ${what} − small ${what}`, html: `<p>Put the small ${what} back on top: the frustum is the big ${what} minus the small one.</p>`, enter: at(1, "vol") },
    { title: "Find the missing height", html: `<p>The big and the small ${what} are <b>similar</b>, so H / R = (H − h) / r. Solve it for H.</p>`, enter: at(1, "sim") },
    { title: "Volume", html: "<p>V = V(big) − V(small), both with their own heights.</p>", enter: at(0.4, "vol") },
    { title: "Surface area", html: S.solid === "coneFrustum" ? "<p>Curved surface = πRL − πrl, plus <b>both</b> circles for the total.</p>" : "<p>4 trapezium faces plus both squares.</p>", enter: at(0, "sa") },
  ] : [
    { title: "A composite solid", html: "<p>This solid is made of simpler solids joined together.</p>", enter: at(0, null) },
    { title: "Separate the parts", html: "<p>Pull the parts apart to see the solids it is made of.</p>", enter: at(1, null) },
    { title: "Volume", html: S.solid === "hole" ? "<p>A hole is <b>taken away</b>: volume of the cuboid − volume of the cylinder.</p>" : "<p>Add the volumes of the parts.</p>", enter: at(1, "vol") },
    { title: "Hidden faces", html: S.solid === "hole" ? "<p>The two red circles are cut out, but the inside of the hole is new surface: add it.</p>" : "<p>Where the parts join, two faces end up <b>inside</b> the solid (red). Leave them out of the surface area.</p>", enter: at(1, "sa") },
    { title: "Join them again", html: "<p>Only the outside of the solid counts in the surface area.</p>", enter: at(0, "sa") },
  ]);
}

function setSolid(k) {
  S.solid = k; S.u = S.target = 0; S.focus = null;
  tabs($("tabs"), Object.entries(SOLIDS).map(([key, s]) => [key, s.name]), k, setSolid);
  sliders($("controls"), sol().dims, S.dims[k], () => build());
  build(); sync(); frame(); makeSteps();
}

quiz($("quiz"), [
  { q: "A hemisphere sits on a cylinder with the same radius. Which faces are NOT part of the surface area?", options: ["The two circles where they join", "The bottom circle", "The curved surface of the cylinder", "None of them"], hint: "Which faces end up inside the solid?", explain: "They are hidden inside, so leave them out." },
  { q: "A frustum is cut from a cone of height 12 cm; the small cone removed has height 4 cm. The frustum's height is…", options: ["8 cm", "16 cm", "4 cm", "3 cm"], hint: "Height of the big cone − height of the small cone.", explain: "12 − 4 = 8 cm." },
  { q: "A cylindrical hole is drilled right through a cuboid. The surface area…", options: ["loses 2 circles and gains the inside of the hole", "loses 2 circles only", "stays the same", "gains 2 circles"], hint: "Think about the top, the bottom and the inside of the hole.", explain: "SA = cuboid − 2πr² + 2πrh." },
]);

setSolid("hemiCyl");

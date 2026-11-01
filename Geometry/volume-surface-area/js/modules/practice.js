// Module 8 · Practice: exam-style questions with random numbers, a labelled diagram, units, hints and worked solutions
import { createViewer, THREE } from "../viewer.js";
import { initShell, onKey, createSteps, store } from "../shell.js";
import { geo, solidMat, glassMat, outlined } from "../solids.js";
import { n, eqv, formulaBar, workingHTML, dimLine, COLORS, v3 } from "../kit.js";
import * as F from "../formulas.js";

const { PI, floor, cbrt } = Math;
const ri = (a, b) => a + floor(Math.random() * (b - a + 1));
const pick = (a) => a[floor(Math.random() * a.length)];
const U = { cm: "\\ \\text{cm}", cm2: "\\ \\text{cm}^2", cm3: "\\ \\text{cm}^3" };
const piT = (k) => F.piForm(k).replace("π", "\\pi");

initShell();
const viewer = createViewer(document.getElementById("viewer"));
const $ = (id) => document.getElementById(id);

// ---------- Diagrams: the solid with the given measurements labelled ----------
// d: { kind, dims (real values), labels: [[from, to, text]] in real units }
function draw(d) {
  viewer.clear();
  const big = Math.max(...Object.values(d.dims)), k = 5 / big, D = {};
  Object.entries(d.dims).forEach(([key, v]) => (D[key] = v * k));
  const R = viewer.root, mat = solidMat(COLORS[d.color || 1]);
  const add = (g, opts) => R.add(outlined(g, opts && opts.glass ? glassMat() : mat));
  const L = (p, q, text, opts = {}) => R.add(dimLine(viewer, p, q, text, { r: 0.03, ...opts }));
  switch (d.kind) {
    case "cuboid": add(geo.box(D.l, D.w, D.h));
      L(v3(-D.l / 2, 0, D.w / 2 + 0.35), v3(D.l / 2, 0, D.w / 2 + 0.35), d.t.l); L(v3(D.l / 2 + 0.35, 0, -D.w / 2), v3(D.l / 2 + 0.35, 0, D.w / 2), d.t.w); L(v3(-D.l / 2 - 0.35, 0, D.w / 2), v3(-D.l / 2 - 0.35, D.h, D.w / 2), d.t.h); break;
    case "cylinder": add(geo.cylinder(D.r, D.h));
      L(v3(0, D.h + 0.02, 0), v3(D.r, D.h + 0.02, 0), d.t.r); L(v3(-D.r - 0.35, 0, 0), v3(-D.r - 0.35, D.h, 0), d.t.h); break;
    case "cone": add(geo.cone(D.r, D.h), { glass: true });
      L(v3(0, 0.02, 0), v3(D.r, 0.02, 0), d.t.r);
      if (d.t.h) L(v3(0, 0, 0), v3(0, D.h, 0), d.t.h, { dashed: true, offset: v3(-0.5, 0, 0) });
      if (d.t.l) L(v3(-D.r, 0, 0), v3(0, D.h, 0), d.t.l, { offset: v3(-0.5, 0.2, 0) }); break;
    case "sphere": R.add(outlined(geo.sphere(D.r), mat, { edges: false })); L(v3(0, D.r, 0), v3(D.r, D.r, 0), d.t.r); break;
    case "hemisphere": add(geo.hemisphere(D.r)); R.add(outlined(geo.disc(D.r), mat)); L(v3(0, 0.02, 0), v3(D.r, 0.02, 0), d.t.r); break;
    case "pyramid": add(geo.pyramid(D.b, D.b, D.h), { glass: true });
      L(v3(-D.b / 2, 0, D.b / 2 + 0.3), v3(D.b / 2, 0, D.b / 2 + 0.3), d.t.b); L(v3(0, 0, 0), v3(0, D.h, 0), d.t.h, { dashed: true, offset: v3(-0.5, 0, 0) }); break;
    case "triprism": {
      R.add(outlined(geo.prism([[-D.b / 2, 0], [D.b / 2, 0], [-D.b / 2, D.h]], D.l), mat));
      const x0 = -D.l / 2;
      L(v3(x0, 0, D.b / 2), v3(x0, 0, -D.b / 2), d.t.b, { offset: v3(0, -0.35, 0) }); L(v3(x0, 0, D.b / 2), v3(x0, D.h, D.b / 2), d.t.h, { offset: v3(0, 0, 0.6) });
      L(v3(x0, 0, -D.b / 2 - 0.3), v3(-x0, 0, -D.b / 2 - 0.3), d.t.l); break;
    }
    case "trapprism": {
      R.add(outlined(geo.prism([[-D.b / 2, 0], [D.b / 2, 0], [D.a / 2, D.h], [-D.a / 2, D.h]], D.l), mat));
      const x0 = -D.l / 2;
      L(v3(x0, 0, D.b / 2), v3(x0, 0, -D.b / 2), d.t.b, { offset: v3(0, -0.35, 0) }); L(v3(x0, D.h, D.a / 2), v3(x0, D.h, -D.a / 2), d.t.a, { offset: v3(0, 0.35, 0) });
      L(v3(x0, 0, 0), v3(x0, D.h, 0), d.t.h, { dashed: true, offset: v3(0, 0, 0.6) }); L(v3(x0, 0, -D.b / 2 - 0.3), v3(-x0, 0, -D.b / 2 - 0.3), d.t.l); break;
    }
    case "hemicyl": add(geo.cylinder(D.r, D.h)); { const t = outlined(geo.hemisphere(D.r), solidMat(COLORS[0])); t.position.y = D.h; R.add(t); }
      L(v3(0, 0.02, 0), v3(D.r, 0.02, 0), d.t.r); L(v3(-D.r - 0.35, 0, 0), v3(-D.r - 0.35, D.h, 0), d.t.h); break;
    case "frustum": add(geo.frustum(D.R, D.r, D.h));
      L(v3(0, 0.02, 0), v3(D.R, 0.02, 0), d.t.R); L(v3(0, D.h + 0.02, 0), v3(D.r, D.h + 0.02, 0), d.t.r); L(v3(-D.R - 0.35, 0, 0), v3(-D.R - 0.35, D.h, 0), d.t.h); break;
  }
  const box = new THREE.Box3().setFromObject(R), s = box.getBoundingSphere(new THREE.Sphere());
  viewer.frame(s.center, s.radius * 1.05 + 0.6, v3(0.8, 0.55, 1.25));
}

// ---------- Question generators ----------
// each returns { text, answer, unit, units, piK?, integer?, hint, lines, diagram, formulas }
const Q = [
  { topic: "nets", level: "core", gen() {
    const l = ri(4, 12), w = ri(3, 9), h = ri(2, 8), A = F.cuboid.surfaceArea(l, w, h);
    return { text: `A cuboid measures ${l} cm by ${w} cm by ${h} cm. Find its total surface area.`, answer: A, unit: "cm²", units: ["cm", "cm²", "cm³"],
      hint: "There are 3 pairs of identical rectangles.", formulas: [["SA = 2(lw + lh + wh)"]],
      lines: [["Pairs of faces", `2(${l} \\times ${w} + ${l} \\times ${h} + ${w} \\times ${h})`], ["Total", `2(${l * w} + ${l * h} + ${w * h}) = ${A}` + U.cm2]],
      diagram: { kind: "cuboid", dims: { l, w, h }, t: { l: l + " cm", w: w + " cm", h: h + " cm" } } };
  } },
  { topic: "nets", level: "core", gen() {
    const r = ri(2, 9), h = ri(3, 15), inPi = Math.random() < 0.4, k = 2 * r * r + 2 * r * h;
    return { text: `A closed cylinder has radius ${r} cm and height ${h} cm. Find its total surface area${inPi ? ", giving your answer <b>in terms of π</b>" : ""}.`,
      answer: PI * k, piK: inPi ? k : undefined, unit: "cm²", units: ["cm", "cm²", "cm³"],
      hint: "Two circles and a curved surface (a rectangle 2πr long).", formulas: [["SA = 2\\pi r^2 + 2\\pi r h"]],
      lines: [["Two circles", `2\\pi \\times ${r}^2 = ${piT(2 * r * r)}`], ["Curved surface", `2\\pi \\times ${r} \\times ${h} = ${piT(2 * r * h)}`], ["Total", `${piT(k)}` + eqv(PI * k) + U.cm2]],
      diagram: { kind: "cylinder", dims: { r, h }, t: { r: "r = " + r + " cm", h: h + " cm" } } };
  } },
  { topic: "nets", level: "extended", gen() {
    const [r, h, l] = pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [7, 24, 25]]), inPi = Math.random() < 0.4, k = r * r + r * l;
    return { text: `A solid cone has base radius ${r} cm and slant height ${l} cm. Find its total surface area${inPi ? " in terms of π" : ""}.`,
      answer: PI * k, piK: inPi ? k : undefined, unit: "cm²", units: ["cm", "cm²", "cm³"],
      hint: "Curved surface area = πrl, plus the circular base.", formulas: [["\\text{Curved SA} = \\pi r l"], ["SA = \\pi r^2 + \\pi r l"]],
      lines: [["Curved surface", `\\pi \\times ${r} \\times ${l} = ${piT(r * l)}`], ["Base", `\\pi \\times ${r}^2 = ${piT(r * r)}`], ["Total", piT(k) + eqv(PI * k) + U.cm2]],
      diagram: { kind: "cone", dims: { r, h }, t: { r: r + " cm", l: "l = " + l + " cm" } } };
  } },
  { topic: "nets", level: "extended", gen() {
    const r = pick([2, 3, 4.5, 5, 6, 7.5]), inPi = Math.random() < 0.4;
    return { text: `Find the surface area of a sphere with radius ${r} cm${inPi ? ", in terms of π" : ""}.`, answer: 4 * PI * r * r, piK: inPi ? 4 * r * r : undefined, unit: "cm²", units: ["cm²", "cm³", "cm"],
      hint: "SA = 4πr².", formulas: [["SA = 4\\pi r^2"]], lines: [["Formula", `4\\pi \\times ${n(r)}^2 = ${piT(4 * r * r)}` + eqv(4 * PI * r * r) + U.cm2]],
      diagram: { kind: "sphere", dims: { r }, t: { r: n(r) + " cm" }, color: 0 } };
  } },
  { topic: "prisms", level: "core", gen() {
    const b = ri(3, 10), h = ri(3, 9), l = ri(6, 15), V = 0.5 * b * h * l;
    return { text: `The cross-section of this prism is a right-angled triangle with base ${b} cm and height ${h} cm. The prism is ${l} cm long. Find its volume.`,
      answer: V, unit: "cm³", units: ["cm²", "cm³", "cm"], hint: "Area of the triangle × length.", formulas: [["V = \\text{area of cross-section} \\times \\text{length}"]],
      lines: [["Area of the cross-section", `\\tfrac{1}{2} \\times ${b} \\times ${h} = ${n(0.5 * b * h)}` + U.cm2], ["Volume", `${n(0.5 * b * h)} \\times ${l} = ${n(V)}` + U.cm3]],
      diagram: { kind: "triprism", dims: { b, h, l }, t: { b: b + " cm", h: h + " cm", l: l + " cm" } } };
  } },
  { topic: "prisms", level: "core", gen() {
    const b = ri(6, 12), a = ri(2, b - 2), h = ri(3, 8), l = ri(5, 14), A = F.area.trapezium(a, b, h);
    return { text: `A prism has a trapezium cross-section with parallel sides ${a} cm and ${b} cm, ${h} cm apart. It is ${l} cm long. Find its volume.`,
      answer: A * l, unit: "cm³", units: ["cm²", "cm³", "cm"], hint: "Trapezium area = ½(a + b)h.", formulas: [["\\text{Trapezium} = \\tfrac{1}{2}(a + b)h"], ["V = A \\times l"]],
      lines: [["Area of the cross-section", `\\tfrac{1}{2}(${a} + ${b}) \\times ${h} = ${n(A)}` + U.cm2], ["Volume", `${n(A)} \\times ${l} = ${n(A * l)}` + U.cm3]],
      diagram: { kind: "trapprism", dims: { a, b, h, l }, t: { a: a + " cm", b: b + " cm", h: h + " cm", l: l + " cm" } } };
  } },
  { topic: "prisms", level: "core", gen() {
    const r = ri(2, 8), h = ri(4, 20), inPi = Math.random() < 0.4;
    return { text: `Find the volume of a cylinder with radius ${r} cm and height ${h} cm${inPi ? ", in terms of π" : ""}.`, answer: PI * r * r * h, piK: inPi ? r * r * h : undefined, unit: "cm³", units: ["cm²", "cm³", "cm"],
      hint: "A cylinder is a prism: πr² × h.", formulas: [["V = \\pi r^2 h"]], lines: [["Volume", `\\pi \\times ${r}^2 \\times ${h} = ${piT(r * r * h)}` + eqv(PI * r * r * h) + U.cm3]],
      diagram: { kind: "cylinder", dims: { r, h }, t: { r: "r = " + r + " cm", h: h + " cm" } } };
  } },
  { topic: "prisms", level: "core", gen() {
    const r = ri(3, 8), h = ri(5, 20), V = Math.round(PI * r * r * h);
    const hh = V / (PI * r * r);
    return { text: `A cylinder has volume ${V} cm³ and radius ${r} cm. Find its height.`, answer: hh, unit: "cm", units: ["cm", "cm²", "cm³"],
      hint: "Put the numbers into V = πr²h and divide.", formulas: [["V = \\pi r^2 h \\Rightarrow h = \\frac{V}{\\pi r^2}"]],
      lines: [["Substitute", `${V} = \\pi \\times ${r}^2 \\times h`], ["Divide", `h = \\frac{${V}}{\\pi \\times ${r}^2}` + eqv(hh) + U.cm]],
      diagram: { kind: "cylinder", dims: { r, h: hh }, t: { r: "r = " + r + " cm", h: "h = ?" } } };
  } },
  { topic: "third", level: "extended", gen() {
    const r = ri(2, 9), h = ri(4, 15), inPi = Math.random() < 0.3 && F.isExact((r * r * h) / 3);
    return { text: `A cone has radius ${r} cm and perpendicular height ${h} cm. Find its volume${inPi ? " in terms of π" : ""}.`, answer: (PI * r * r * h) / 3, piK: inPi ? (r * r * h) / 3 : undefined, unit: "cm³", units: ["cm²", "cm³", "cm"],
      hint: "⅓ of the cylinder with the same base and height.", formulas: [["V = \\tfrac{1}{3}\\pi r^2 h"]],
      lines: [["Volume", `\\tfrac{1}{3}\\pi \\times ${r}^2 \\times ${h}` + (F.isExact((r * r * h) / 3) ? " = " + piT((r * r * h) / 3) : "") + eqv((PI * r * r * h) / 3) + U.cm3]],
      diagram: { kind: "cone", dims: { r, h }, t: { r: r + " cm", h: "h = " + h + " cm" } } };
  } },
  { topic: "third", level: "extended", gen() {
    const b = ri(3, 12), h = ri(4, 15), V = (b * b * h) / 3;
    return { text: `A pyramid has a square base of side ${b} cm and perpendicular height ${h} cm. Find its volume.`, answer: V, unit: "cm³", units: ["cm²", "cm³", "cm"],
      hint: "⅓ × base area × height.", formulas: [["V = \\tfrac{1}{3} \\times \\text{base area} \\times h"]],
      lines: [["Base area", `${b}^2 = ${b * b}` + U.cm2], ["Volume", `\\tfrac{1}{3} \\times ${b * b} \\times ${h}` + eqv(V) + U.cm3]],
      diagram: { kind: "pyramid", dims: { b, h }, t: { b: b + " cm", h: h + " cm" } } };
  } },
  { topic: "third", level: "extended", gen() {
    const r = pick([2, 3, 4, 5, 6, 1.5, 2.5, 7]), hemi = Math.random() < 0.4, inPi = Math.random() < 0.3;
    const k = hemi ? (2 / 3) * r ** 3 : (4 / 3) * r ** 3;
    return { text: `Find the volume of a ${hemi ? "hemisphere" : "sphere"} with radius ${r} cm${inPi && F.isExact(k) ? " in terms of π" : ""}.`, answer: PI * k, piK: inPi && F.isExact(k) ? k : undefined,
      unit: "cm³", units: ["cm²", "cm³", "cm"], hint: hemi ? "Half of 4/3 πr³." : "V = 4/3 πr³.", formulas: [[hemi ? "V = \\tfrac{2}{3}\\pi r^3" : "V = \\tfrac{4}{3}\\pi r^3"]],
      lines: [["Volume", (hemi ? "\\tfrac{2}{3}" : "\\tfrac{4}{3}") + `\\pi \\times ${n(r)}^3` + (F.isExact(k) ? " = " + piT(k) : "") + eqv(PI * k) + U.cm3]],
      diagram: { kind: hemi ? "hemisphere" : "sphere", dims: { r }, t: { r: n(r) + " cm" }, color: 0 } };
  } },
  { topic: "third", level: "extended", gen() {
    const r = pick([2.5, 3, 3.5, 4, 4.5, 5, 6]), V = Math.round(F.sphere.volume(r));
    const rr = F.sphere.radiusFromVolume(V);
    return { text: `A sphere has volume ${V} cm³. Find its radius.`, answer: rr, unit: "cm", units: ["cm", "cm²", "cm³"], hint: "Rearrange V = 4/3 πr³ for r³, then take the cube root.",
      formulas: [["V = \\tfrac{4}{3}\\pi r^3 \\Rightarrow r = \\sqrt[3]{\\frac{3V}{4\\pi}}"]],
      lines: [["Substitute", `${V} = \\tfrac{4}{3}\\pi r^3`], ["r³", `r^3 = \\frac{3 \\times ${V}}{4\\pi}` + eqv((3 * V) / (4 * PI))], ["Cube root", `r = \\sqrt[3]{${n((3 * V) / (4 * PI))}}` + eqv(rr) + U.cm]],
      diagram: { kind: "sphere", dims: { r: rr }, t: { r: "r = ?" }, color: 0 } };
  } },
  { topic: "heights", level: "extended", gen() {
    const r = ri(3, 9), h = ri(4, 14), l = F.cone.slantHeight(r, h), A = PI * r * l;
    return { text: `A cone has radius ${r} cm and perpendicular height ${h} cm. Find its curved surface area.`, answer: A, unit: "cm²", units: ["cm", "cm²", "cm³"],
      hint: "First find the slant height l with Pythagoras.", formulas: [["l = \\sqrt{r^2 + h^2}"], ["\\text{Curved SA} = \\pi r l"]],
      lines: [["Slant height", `l = \\sqrt{${r}^2 + ${h}^2}` + eqv(l) + U.cm], ["Curved surface area", `\\pi \\times ${r} \\times ${n(l)}\\ldots` + eqv(A) + U.cm2]],
      diagram: { kind: "cone", dims: { r, h }, t: { r: r + " cm", h: "h = " + h + " cm", l: "l = ?" } } };
  } },
  { topic: "heights", level: "extended", gen() {
    const [r, h, l] = pick([[5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [7, 24, 25], [3, 4, 5]]), V = (PI * r * r * h) / 3;
    return { text: `A cone has radius ${r} cm and slant height ${l} cm. Find its volume.`, answer: V, unit: "cm³", units: ["cm²", "cm³", "cm"],
      hint: "Volume needs the perpendicular height: h² = l² − r².", formulas: [["h = \\sqrt{l^2 - r^2}"], ["V = \\tfrac{1}{3}\\pi r^2 h"]],
      lines: [["Perpendicular height", `h = \\sqrt{${l}^2 - ${r}^2} = ${h}` + U.cm], ["Volume", `\\tfrac{1}{3}\\pi \\times ${r}^2 \\times ${h} = ${piT((r * r * h) / 3)}` + eqv(V) + U.cm3]],
      diagram: { kind: "cone", dims: { r, h }, t: { r: r + " cm", l: "l = " + l + " cm", h: "h = ?" } } };
  } },
  { topic: "composite", level: "extended", gen() {
    const r = ri(2, 6), h = ri(4, 12), V = F.composite.hemisphereOnCylinder.volume(r, h);
    return { text: `A solid is made of a cylinder of radius ${r} cm and height ${h} cm with a hemisphere on top. Find its volume.`, answer: V, unit: "cm³", units: ["cm²", "cm³", "cm"],
      hint: "Add the volume of the cylinder and of the hemisphere.", formulas: [["V = \\pi r^2 h + \\tfrac{2}{3}\\pi r^3"]],
      lines: [["Cylinder", `\\pi \\times ${r}^2 \\times ${h} = ${piT(r * r * h)}`], ["Hemisphere", `\\tfrac{2}{3}\\pi \\times ${r}^3` + (F.isExact((2 / 3) * r ** 3) ? " = " + piT((2 / 3) * r ** 3) : eqv(F.hemisphere.volume(r)))],
        ["Total", "V" + eqv(V) + U.cm3]],
      diagram: { kind: "hemicyl", dims: { r, h }, t: { r: r + " cm", h: h + " cm" } } };
  } },
  { topic: "composite", level: "extended", gen() {
    const [R, r, h] = pick([[6, 3, 4], [8, 4, 6], [9, 3, 8], [10, 5, 7], [6, 2, 5]]), H = F.coneFrustum.fullHeight(R, r, h), V = F.coneFrustum.volume(R, r, h);
    return { text: `A frustum has base radius ${R} cm, top radius ${r} cm and height ${h} cm. It is cut from a cone. Find the volume of the frustum.`, answer: V, unit: "cm³", units: ["cm²", "cm³", "cm"],
      hint: "Use similar triangles to find the height H of the whole cone, then big cone − small cone.", formulas: [["\\frac{H}{R} = \\frac{H - h}{r}"], ["V = V_{\\text{big}} - V_{\\text{small}}"]],
      lines: [["Similar triangles", `H = \\frac{${h} \\times ${R}}{${R} - ${r}}` + eqv(H) + U.cm], ["Big cone", `\\tfrac{1}{3}\\pi \\times ${R}^2 \\times ${n(H)}` + eqv(F.cone.volume(R, H))],
        ["Small cone", `\\tfrac{1}{3}\\pi \\times ${r}^2 \\times ${n(H - h)}` + eqv(F.cone.volume(r, H - h))], ["Frustum", `${n(F.cone.volume(R, H))} - ${n(F.cone.volume(r, H - h))}` + eqv(V) + U.cm3]],
      diagram: { kind: "frustum", dims: { R, r, h }, t: { R: R + " cm", r: r + " cm", h: h + " cm" } } };
  } },
  { topic: "units", level: "core", gen() {
    const kind = pick(["m3cm3", "cm2m2", "cm3l", "m3l"]);
    if (kind === "m3cm3") { const v = pick([0.5, 1.2, 2, 2.5, 3.4, 0.08]); return unitQ(`Change ${v} m³ into cm³.`, v * 1e6, "cm³", ["cm³", "cm²", "litres"], "1 m³ = 100 × 100 × 100 cm³.", [["1 m = 100 cm, so", "1\\ \\text{m}^3 = 1\\,000\\,000\\ \\text{cm}^3"], ["Multiply", `${v} \\times 1\\,000\\,000 = ${big(v * 1e6)}` + U.cm3]], { l: 1, w: 1, h: 1 }, v + " m³"); }
    if (kind === "cm2m2") { const v = pick([4500, 25000, 800, 12000, 360]); return unitQ(`Change ${big(v, true)} cm² into m².`, v / 1e4, "m²", ["m²", "m³", "cm"], "1 m² = 100 × 100 cm².", [["1 m = 100 cm, so", "1\\ \\text{m}^2 = 10\\,000\\ \\text{cm}^2"], ["Divide", `${big(v)} \\div 10\\,000 = ${n(v / 1e4)}\\ \\text{m}^2`]], { l: 1, w: 1, h: 0.05 }, big(v, true) + " cm²"); }
    if (kind === "cm3l") { const v = pick([2500, 750, 12000, 480, 36000]); return unitQ(`A container holds ${big(v, true)} cm³ of water. How many litres is that?`, v / 1000, "litres", ["litres", "ml", "cm²"], "1000 cm³ = 1 litre.", [["1000 cm³ = 1 litre", `${big(v)} \\div 1000 = ${n(v / 1000)}\\ \\text{litres}`]], { l: 1, w: 1, h: 1 }, big(v, true) + " cm³"); }
    const v = pick([0.6, 1.5, 2, 3.2]); return unitQ(`A tank has a volume of ${v} m³. How many litres does it hold?`, v * 1000, "litres", ["litres", "ml", "cm³"], "1 m³ = 1000 litres.", [["1 m³ = 1 000 000 cm³ = 1000 litres", `${v} \\times 1000 = ${n(v * 1000)}\\ \\text{litres}`]], { l: 1, w: 1, h: 1 }, v + " m³");
  } },
  { topic: "problems", level: "core", gen() {
    const l = pick([50, 60, 80, 100]), w = pick([30, 40, 50]), h = pick([40, 50, 60]), q = pick([5, 6, 8, 10, 12]), L = (l * w * h) / 1000, t = L / q;
    return { text: `An empty tank is a cuboid ${l} cm by ${w} cm by ${h} cm. Water flows in at ${q} litres per minute. How many minutes does it take to fill it?`, answer: t, unit: "minutes", units: ["minutes", "litres", "seconds"],
      hint: "Volume in cm³ → litres (÷ 1000) → ÷ rate.", formulas: [["1000\\ \\text{cm}^3 = 1\\ \\text{litre}"], ["\\text{time} = \\text{volume} \\div \\text{rate}"]],
      lines: [["Volume", `${l} \\times ${w} \\times ${h} = ${big(l * w * h)}` + U.cm3], ["Litres", `${big(l * w * h)} \\div 1000 = ${n(L)}`], ["Time", `${n(L)} \\div ${q}` + eqv(t) + "\\ \\text{minutes}"]],
      diagram: { kind: "cuboid", dims: { l, w, h }, t: { l: l + " cm", w: w + " cm", h: h + " cm" }, color: 1 } };
  } },
  { topic: "problems", level: "extended", gen() {
    const a = pick([10, 12, 15]), b = pick([8, 10]), c = pick([5, 6]), r = pick([1.5, 2]), V = a * b * c, v = F.sphere.volume(r), N = floor(V / v);
    return { text: `A metal cuboid ${a} cm by ${b} cm by ${c} cm is melted and made into spheres of radius ${r} cm. How many complete spheres can be made?`, answer: N, integer: true, unit: "spheres", units: ["spheres", "cm³"],
      hint: "Volume of the metal ÷ volume of one sphere, then round down.", formulas: [["V = \\tfrac{4}{3}\\pi r^3"]],
      lines: [["Metal", `${a} \\times ${b} \\times ${c} = ${V}` + U.cm3], ["One sphere", `\\tfrac{4}{3}\\pi \\times ${r}^3` + eqv(v) + U.cm3], ["Divide and round down", `${V} \\div ${n(v)}\\ldots` + eqv(V / v) + "\\ \\Rightarrow\\ " + N]],
      diagram: { kind: "cuboid", dims: { l: a, w: b, h: c }, t: { l: a + " cm", w: b + " cm", h: c + " cm" }, color: 6 } };
  } },
];
function big(x, plain) { const s = x.toLocaleString("en-GB"); return plain ? s.replace(/,/g, " ") : s.replace(/,/g, "\\,"); }
function unitQ(text, answer, unit, units, hint, lines, dims, label) {
  return { text, answer, unit, units, hint, lines, formulas: [["1\\ \\text{m} = 100\\ \\text{cm}"], ["1000\\ \\text{cm}^3 = 1\\ \\text{litre}"]], diagram: { kind: "cuboid", dims, t: { l: label, w: "", h: "" }, color: 0 } };
}
const TOPICS = [["all", "All topics"], ["nets", "Nets & surface area"], ["prisms", "Prisms & cylinders"], ["third", "Pyramids, cones & spheres"], ["heights", "Slant height"], ["composite", "Composite & frustums"], ["units", "Units & capacity"], ["problems", "Real-world problems"]];

// ---------- State ----------
const S = { topic: "all", level: "both", q: null, tried: false, score: store.get("practice", { right: 0, tries: 0, streak: 0 }) };

function next() {
  const pool = Q.filter((q) => (S.topic === "all" || q.topic === S.topic) && (S.level === "both" || q.level === S.level));
  const g = pick(pool.length ? pool : Q);
  S.q = { ...g.gen(), level: g.level };
  S.tried = false;
  draw(S.q.diagram);
  render();
  $("steps").innerHTML = "<h3>Worked solution</h3><p class='hint'>Try it first. If you get stuck, use the hint or show the worked solution.</p>";
  formulaBar($("formulas"), S.q.formulas.map((f, i) => [i, f[0]]), null);
}

function render() {
  const q = S.q;
  $("main").innerHTML = `<h3>${q.level === "core" ? "Core" : "Extended"} · Question</h3><p class="problem">${q.text}</p>
    <div class="answer"><input type="text" id="ans" inputmode="decimal" placeholder="${q.piK !== undefined ? "e.g. 12π" : "Answer"}" aria-label="Answer">
    <select id="unit" class="field" aria-label="Unit"><option value="">unit…</option>${[...q.units].sort().map((u) => `<option>${u}</option>`).join("")}</select>
    <button class="btn" type="button" id="check">Check</button></div>
    <p class="hint">${q.piK !== undefined ? "Type the answer in terms of π, like <b>12π</b> (or 12pi)." : q.integer ? "A whole number." : "To 3 significant figures."}</p>
    <p class="fb" id="fb" aria-live="polite"></p>
    <div class="row-gap"><button class="btn ghost" type="button" id="hint">Hint</button><button class="btn ghost" type="button" id="show">Show worked solution</button><button class="btn" type="button" id="next">Next question →</button></div>
    <p class="hint" style="margin-top:10px"><span class="score">Score: ${S.score.right} / ${S.score.tries}</span> · streak ${S.score.streak}</p>`;
  $("check").addEventListener("click", check);
  $("ans").addEventListener("keydown", (e) => { if (e.key === "Enter") check(); });
  $("hint").addEventListener("click", () => { const fb = $("fb"); fb.className = "fb"; fb.textContent = "Hint: " + q.hint; });
  $("show").addEventListener("click", showSolution);
  $("next").addEventListener("click", next);
}

// "12π", "12 pi", "12" → coefficient of π (or null if there is no π)
function parsePi(raw) {
  const m = raw.replace(/\s/g, "").toLowerCase().match(/^([0-9.]*)(?:\*)?(π|pi)$/);
  if (!m) return null;
  return m[1] === "" ? 1 : parseFloat(m[1]);
}
function check() {
  const q = S.q, raw = $("ans").value.trim(), unit = $("unit").value, fb = $("fb");
  if (!raw) { fb.className = "fb bad"; fb.textContent = "Type an answer first."; return; }
  let ok;
  if (q.piK !== undefined) {
    const k = parsePi(raw);
    ok = k !== null && Math.abs(k - q.piK) < 1e-6 * Math.max(1, q.piK);
    if (k === null && F.checkAnswer(parseFloat(raw), q.answer)) { fb.className = "fb bad"; fb.textContent = "That is the right size, but give it in terms of π, like " + F.piForm(2) + "."; return; }
  } else {
    const v = parseFloat(raw.replace(/\s|,/g, ""));
    ok = q.integer ? v === q.answer : F.checkAnswer(v, q.answer);
  }
  if (!S.tried) { S.score.tries++; S.tried = true; }
  if (ok && unit === q.unit) {
    S.score.right++; S.score.streak++;
    fb.className = "fb ok";
    fb.textContent = "Correct! " + (q.piK !== undefined ? F.piForm(q.piK) : q.integer ? q.answer : F.sig(q.answer)) + " " + q.unit;
    S.tried = "done";
  } else {
    S.score.streak = 0;
    fb.className = "fb bad";
    fb.textContent = ok ? "The number is right. Now choose the right unit." : !unit ? "Not quite. Check your working, and choose a unit too." : "Not quite. Try again, or use the hint.";
  }
  store.set("practice", S.score);
  document.querySelector("#main .score").parentElement.innerHTML = `<span class="score">Score: ${S.score.right} / ${S.score.tries}</span> · streak ${S.score.streak}`;
}
function showSolution() {
  const lines = S.q.lines, list = lines.map((l, i) => ({ title: l[0], html: workingHTML(lines.slice(0, i + 1)) }));
  list.push({ title: "Answer", html: workingHTML(lines) + `<p class="big-count" style="font-size:1.5rem">${S.q.piK !== undefined ? F.piForm(S.q.piK) : S.q.integer ? S.q.answer : F.sig(S.q.answer)} ${S.q.unit}</p>` });
  createSteps($("steps"), list);
  $("steps").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ---------- Filters ----------
$("controls").innerHTML = `<div class="answer"><select id="f-topic" class="field" aria-label="Topic">${TOPICS.map(([k, t]) => `<option value="${k}">${t}</option>`).join("")}</select>
  <select id="f-level" class="field" aria-label="Level"><option value="both">Core + Extended</option><option value="core">Core</option><option value="extended">Extended</option></select></div>
  <div class="row-gap"><button class="btn ghost" type="button" id="reset-score">Reset score</button></div>`;
$("f-topic").addEventListener("change", (e) => { S.topic = e.target.value; next(); });
$("f-level").addEventListener("change", (e) => { S.level = e.target.value; next(); });
$("reset-score").addEventListener("click", () => { S.score = { right: 0, tries: 0, streak: 0 }; store.set("practice", S.score); render(); });
$("new").addEventListener("click", next);
onKey("n", next);
onKey("r", () => viewer.resetView());
$("reset-view").addEventListener("click", () => viewer.resetView());
// a topic can be opened directly: practice.html?topic=heights
const asked = new URLSearchParams(location.search).get("topic");
if (TOPICS.some(([k]) => k === asked)) { S.topic = asked; $("f-topic").value = asked; }
$("tabs").hidden = true;
$("quiz").hidden = true;
next();

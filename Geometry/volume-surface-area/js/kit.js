// Small building blocks shared by the modules: working lines in TeX, sliders, tabs, the formula bar,
// dimension lines and right-angle marks in 3D.
import { THREE } from "./viewer.js";
import { tex } from "./shell.js";
import * as F from "./formulas.js";

export const n = (x) => F.num(x);
export const unitTex = { cm: "\\ \\text{cm}", cm2: "\\ \\text{cm}^2", cm3: "\\ \\text{cm}^3", m: "\\ \\text{m}", m2: "\\ \\text{m}^2", m3: "\\ \\text{m}^3", "": "" };

// "= 24" or "\approx 28.3"
export const eqv = (x) => (F.isExact(x) ? " = " : " \\approx ") + n(x);

// "sym = substitution (= kπ) = value unit". piK: the coefficient of π, shown only if it is exact.
export function work(sym, sub, value, piK, unit = "cm2") {
  let s = (sym ? sym + " = " : "") + sub;
  if (piK !== undefined && F.isExact(piK)) s += " = " + F.piForm(piK).replace("π", "\\pi");
  return s + eqv(value) + unitTex[unit];
}

// Okabe–Ito colours (safe for colour blindness)
export const COLORS = ["#E69F00", "#56B4E9", "#009E73", "#F0E442", "#0072B2", "#D55E00", "#CC79A7"];
export const HIDDEN = "#d0342c"; // faces hidden where two solids join

// ---------- Panels ----------
// defs: [id, label, value, min, max, step = 0.5, unit = "cm"]
export function sliders(box, defs, values, onChange) {
  box.innerHTML = "";
  defs.forEach(([id, label, , min, max, step = 0.5, unit = "cm"]) => {
    const row = document.createElement("div");
    row.className = "dim-row";
    const fmt = () => n(values[id]) + (unit ? " " + unit : "");
    row.innerHTML = `<label for="in-${id}">${label}</label><output>${fmt()}</output>` +
      `<input type="range" id="in-${id}" min="${min}" max="${max}" step="${step}" value="${values[id]}">`;
    row.querySelector("input").addEventListener("input", (e) => {
      values[id] = parseFloat(e.target.value);
      row.querySelector("output").textContent = fmt();
      onChange(id);
    });
    box.appendChild(row);
  });
}
export const defaults = (defs) => Object.fromEntries(defs.map((d) => [d[0], d[2]]));

// items: [[key, label]]
export function tabs(box, items, current, onSelect) {
  box.innerHTML = "";
  items.forEach(([key, label]) => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = label;
    b.setAttribute("aria-pressed", String(key === current));
    b.addEventListener("click", () => { tabs(box, items, key, onSelect); onSelect(key); });
    box.appendChild(b);
  });
}

// list: [[id, tex]]; the formula with id === on is highlighted
export function formulaBar(box, list, on) {
  box.innerHTML = "";
  list.forEach(([id, src]) => {
    const div = document.createElement("div");
    div.className = "formula" + (id === on ? " on" : "");
    tex(div, src);
    box.appendChild(div);
  });
}

// lines of working: [[label, tex], ...] or [tex, ...]
export function workingHTML(lines) {
  return lines.map((l) => {
    const [label, src] = Array.isArray(l) ? l : ["", l];
    const el = document.createElement("div");
    el.className = "work-line";
    if (label) el.innerHTML = `<span class="wl">${label}</span>`;
    const t = document.createElement("span");
    tex(t, src);
    el.appendChild(t);
    return el.outerHTML;
  }).join("");
}

export function hide(id, hidden) { const el = document.getElementById(id); if (el) el.hidden = hidden; }

// ---------- 3D helpers ----------
const rodGeo = new THREE.CylinderGeometry(1, 1, 1, 8);
export function rod(p, q, color = 0x6b4410, r = 0.04) {
  const len = p.distanceTo(q);
  const m = new THREE.Mesh(rodGeo, new THREE.MeshBasicMaterial({ color }));
  m.scale.set(r, len, r);
  m.position.copy(p).add(q).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), q.clone().sub(p).normalize());
  return m;
}

// a dimension line from p to q with a label in the middle; dashed draws it as short pieces
export function dimLine(viewer, p, q, text, { color = 0x6b4410, r = 0.04, cls = "lbl dim", dashed = false, offset = null } = {}) {
  const g = new THREE.Group();
  if (dashed) {
    const pieces = Math.max(3, Math.round(p.distanceTo(q) / (r * 9)));
    for (let i = 0; i < pieces; i += 2) {
      g.add(rod(p.clone().lerp(q, i / pieces), p.clone().lerp(q, Math.min(1, (i + 1) / pieces)), color, r));
    }
  } else g.add(rod(p, q, color, r));
  if (text) {
    const lbl = viewer.label(text, cls);
    lbl.position.copy(p).add(q).multiplyScalar(0.5);
    if (offset) lbl.position.add(offset);
    g.add(lbl);
    g.userData.label = lbl;
  }
  return g;
}

// little square marking a right angle at corner, along unit directions u and v
export function rightAngle(corner, u, v, size, color = 0x1b2430) {
  const a = corner.clone().add(u.clone().multiplyScalar(size));
  const b = a.clone().add(v.clone().multiplyScalar(size));
  const c = corner.clone().add(v.clone().multiplyScalar(size));
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b, c]), new THREE.LineBasicMaterial({ color }));
}

// a filled triangle (for the right-angled triangles inside cones and pyramids)
export function triangle(a, b, c, color, opacity = 0.55) {
  const geo = new THREE.BufferGeometry().setFromPoints([a, b, c]);
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false }));
}

export function v3(x, y, z) { return new THREE.Vector3(x, y, z); }

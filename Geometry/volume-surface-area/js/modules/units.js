// Module 6 · Unit Cubes & Conversions
import { createViewer, THREE } from "../viewer.js";
import { initShell, onKey, createSteps, quiz, tex } from "../shell.js";
import { geo, glassMat, waterMat, outlined } from "../solids.js";
import { n, sliders, tabs, formulaBar, workingHTML, dimLine, COLORS, v3 } from "../kit.js";
import * as F from "../formulas.js";

initShell();
const viewer = createViewer(document.getElementById("viewer"));
const $ = (id) => document.getElementById(id);
const fmt = (x) => (Math.abs(x) >= 1e4 || (Math.abs(x) < 1e-3 && x !== 0) ? x.toLocaleString("en-GB", { maximumSignificantDigits: 10 }).replace(/,/g, " ") : n(x));
const big = (x) => x.toLocaleString("en-GB").replace(/,/g, " ");
const tx = (str) => String(str).replace(/ /g, "\\,"); // spaces inside TeX numbers

const TABS = [["cubes", "Unit cubes"], ["metre", "1 m³ in cm³"], ["capacity", "Capacity"], ["convert", "Converter"]];
const S = { tab: "cubes", cubes: { l: 4, w: 3, h: 2 }, shown: 0, target: 0, metre: { mode: "volume", stage: 0, grow: 1 }, tank: { l: 40, w: 30, h: 30 }, level: 0, filling: false };
let anim = null; // per-tab animation step

// ---------- Unit cubes: a cuboid built from 1 cm cubes ----------
function buildCubes() {
  viewer.clear();
  const { l, w, h } = S.cubes, N = l * w * h;
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.92, 0.92, 0.92), new THREE.MeshStandardMaterial({ roughness: 0.6 }), N);
  const m = new THREE.Matrix4(), col = new THREE.Color();
  let i = 0;
  for (let y = 0; y < h; y++) for (let z = 0; z < w; z++) for (let x = 0; x < l; x++) {
    m.makeTranslation(x - l / 2 + 0.5, y + 0.5, z - w / 2 + 0.5);
    mesh.setMatrixAt(i, m);
    mesh.setColorAt(i, col.set(COLORS[[1, 0, 2, 4, 6, 5, 3, 1][y % 8]]));
    i++;
  }
  mesh.count = Math.round(S.shown);
  viewer.root.add(mesh);
  const outline = outlined(geo.box(l, w, h), glassMat("#ffffff"), {});
  viewer.root.add(outline);
  viewer.root.add(dimLine(viewer, v3(-l / 2, 0, w / 2 + 0.5), v3(l / 2, 0, w / 2 + 0.5), "l = " + l + " cm", { r: 0.03 }),
    dimLine(viewer, v3(l / 2 + 0.5, 0, -w / 2), v3(l / 2 + 0.5, 0, w / 2), "w = " + w + " cm", { r: 0.03 }),
    dimLine(viewer, v3(-l / 2 - 0.5, 0, w / 2), v3(-l / 2 - 0.5, h, w / 2), "h = " + h + " cm", { r: 0.03 }));
  anim = (dt) => {
    if (S.shown === S.target) return;
    S.shown = Math.min(S.target, S.shown + dt * Math.max(6, N / 3));
    mesh.count = Math.floor(S.shown);
    renderMain();
  };
  renderMain();
}

// ---------- 1 m³ = 1 000 000 cm³ (scale: 1 m = 10 units, so 1 cm = 0.1) ----------
function buildMetre() {
  viewer.clear();
  const M = S.metre, vol = M.mode === "volume", st = M.stage, c = 0.1;
  const R = viewer.root;
  if (vol) R.add(outlined(geo.box(10, 10, 10), glassMat("#9cc3e6")));
  else { const sq = outlined(geo.square(10), glassMat("#9cc3e6")); sq.position.y = 0.01; R.add(sq); }
  R.add(dimLine(viewer, v3(-5, 0, 5.6), v3(5, 0, 5.6), "1 m = 100 cm", { r: 0.05 }));
  if (st >= 1) {
    // one row of 100 small cubes (or squares) along the front edge
    const g = vol ? new THREE.BoxGeometry(c * 0.86, c * 0.86, c * 0.86) : new THREE.PlaneGeometry(c * 0.86, c * 0.86).rotateX(-Math.PI / 2);
    const count = st === 1 ? 100 : 10000;
    const mesh = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ color: COLORS[0], side: THREE.DoubleSide }), count);
    const m = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      const x = i % 100, z = Math.floor(i / 100);
      m.makeTranslation(-5 + c * (x + 0.5), vol ? c / 2 : 0.02, 5 - c * (z + 0.5));
      mesh.setMatrixAt(i, m);
    }
    mesh.count = Math.max(1, Math.round(count * (st === 1 || st === 2 ? M.grow : 1)));
    R.add(mesh);
    anim = (dt) => { if (M.grow < 1) { M.grow = Math.min(1, M.grow + dt * 0.7); mesh.count = Math.max(1, Math.round(count * M.grow)); } };
  } else anim = null;
  if (vol && st >= 3) {
    // the layers of 10 000 cubes, stacked up 100 times
    const layers = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ color: COLORS[0], transparent: true, opacity: 0.9 });
    const slab = new THREE.BoxGeometry(10, c * 0.9, 10), edges = new THREE.EdgesGeometry(slab);
    for (let k = 1; k < 100; k++) {
      const s = new THREE.Mesh(slab, mat);
      s.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x8a5a1c })));
      s.position.y = c * (k + 0.5);
      s.visible = false;
      layers.add(s);
    }
    R.add(layers);
    let t = 0;
    anim = (dt) => { t = Math.min(99, t + dt * 40); layers.children.forEach((s, k) => (s.visible = k < t)); };
  }
  if (st >= 1) R.add(dimLine(viewer, v3(-5, c * 1.4, 5.25), v3(-5 + c, c * 1.4, 5.25), "1 cm", { r: 0.01, cls: "lbl key" }));
  renderMain();
}

// ---------- Capacity: a tank filling up (scale: 10 cm = 1 unit) ----------
function buildTank() {
  viewer.clear();
  const { l, w, h } = S.tank, k = 0.1;
  const R = viewer.root;
  R.add(outlined(geo.box(l * k, w * k, h * k), glassMat()));
  const water = new THREE.Mesh(geo.box(l * k * 0.99, w * k * 0.99, 1), waterMat());
  water.scale.y = Math.max(S.level * h * k, 0.0001);
  R.add(water);
  // a 10 cm cube = 1 litre, next to it for size
  const litre = outlined(geo.box(1, 1, 1), waterMat());
  litre.position.set(l * k / 2 + 1.6, 0, 0);
  R.add(litre);
  const lb = viewer.label("1 litre = 10 × 10 × 10 cm³", "lbl key");
  lb.position.set(l * k / 2 + 1.6, 1.5, 0);
  R.add(lb);
  R.add(dimLine(viewer, v3(-l * k / 2, 0, w * k / 2 + 0.4), v3(l * k / 2, 0, w * k / 2 + 0.4), "l = " + n(l) + " cm", { r: 0.03 }),
    dimLine(viewer, v3(l * k / 2 + 0.4, 0, -w * k / 2), v3(l * k / 2 + 0.4, 0, w * k / 2), "w = " + n(w) + " cm", { r: 0.03 }),
    dimLine(viewer, v3(-l * k / 2 - 0.4, 0, w * k / 2), v3(-l * k / 2 - 0.4, h * k, w * k / 2), "h = " + n(h) + " cm", { r: 0.03 }));
  anim = (dt) => {
    if (!S.filling) return;
    S.level = Math.min(1, S.level + dt * 0.18);
    water.scale.y = Math.max(S.level * h * k, 0.0001);
    if (S.level >= 1) { S.filling = false; syncFoot(); }
    renderMain();
  };
  renderMain();
}

// ---------- Converter ----------
const UNITS = {
  length: { units: ["mm", "cm", "m", "km"], power: 1 },
  area: { units: ["mm²", "cm²", "m²", "km²"], power: 2 },
  volume: { units: ["mm³", "cm³", "m³", "ml", "litres"], power: 3 },
};
const C = { kind: "volume", from: "m³", to: "cm³", value: 2.5 };
const base = (u) => u.replace(/[²³]/, "");
// value of 1 unit in cm (length), cm² (area) or cm³ (volume)
function inCm(u, kind) {
  if (u === "ml") return 1;
  if (u === "litres") return 1000;
  return F.units.convert(1, base(u), "cm", UNITS[kind].power);
}
function conversionSteps() {
  const { kind, from, to, value } = C, p = UNITS[kind].power;
  const factor = inCm(from, kind) / inCm(to, kind), result = value * factor;
  const sup = p === 1 ? "" : p === 2 ? "^2" : "^3";
  const lines = [];
  const linkLength = (a, b) => {
    const k = F.units.convert(1, a, b);
    return k >= 1 ? `1\\ \\text{${a}} = ${tx(big(k))}\\ \\text{${b}}` : `1\\ \\text{${b}} = ${tx(big(1 / k))}\\ \\text{${a}}`;
  };
  const cap = (u) => u === "ml" || u === "litres";
  if (!cap(from) && !cap(to)) {
    const a = base(from), b = base(to), k = F.units.convert(1, a, b);
    if (a !== b) {
      lines.push(["Start from lengths", linkLength(a, b)]);
      if (p > 1) {
        const kk = k >= 1 ? k : 1 / k, [big1, small1] = k >= 1 ? [a, b] : [b, a];
        lines.push([p === 2 ? "Square it: a square of side 1 " + big1 : "Cube it: a cube of side 1 " + big1,
          `1\\ \\text{${big1}}${sup} = ${Array(p).fill(tx(big(kk))).join(" \\times ")} = ${tx(big(kk ** p))}\\ \\text{${small1}}${sup}`]);
      }
    }
  } else {
    lines.push(["Capacity", "1\\ \\text{cm}^3 = 1\\ \\text{ml}, \\quad 1000\\ \\text{cm}^3 = 1\\ \\text{litre}, \\quad 1\\ \\text{m}^3 = 1000\\ \\text{litres}"]);
  }
  const tu = (u) => (u === "ml" || u === "litres" ? `\\ \\text{${u}}` : `\\ \\text{${base(u)}}${sup}`);
  if (factor >= 1) lines.push([`Converting to a smaller unit: multiply by ${big(factor)}`, `${n(value)}${tu(from)} \\times ${tx(big(factor))} = ${tx(fmt(result))}${tu(to)}`]);
  else lines.push([`Converting to a bigger unit: divide by ${big(1 / factor)}`, `${n(value)}${tu(from)} \\div ${tx(big(1 / factor))} = ${tx(fmt(result))}${tu(to)}`]);
  return { lines, factor, result };
}
function buildConvert() {
  viewer.clear();
  // a cube (or square, or rod) of the starting unit, labelled with how many of the new unit fit in it
  const { kind, from, to } = C, { factor } = conversionSteps();
  const shape = kind === "length" ? geo.box(8, 0.3, 0.3) : kind === "area" ? geo.square(6) : geo.box(5, 5, 5);
  const m = outlined(shape, glassMat("#e6a64a"));
  viewer.root.add(m);
  const lb = viewer.label(`1 ${from} = ${fmt(factor)} ${to}`, "lbl key");
  lb.position.set(0, kind === "volume" ? 6 : 1.2, 0);
  viewer.root.add(lb);
  anim = null;
  renderMain();
}

// ---------- Panels ----------
function renderMain() {
  const box = $("main");
  if (S.tab === "cubes") {
    const { l, w, h } = S.cubes, N = l * w * h;
    box.innerHTML = `<h3>Cubes</h3><p class="big-count">${Math.floor(S.shown)}</p><p class="hint">cubes of 1 cm³ so far</p>` +
      workingHTML([["Cubes in one layer", `${l} \\times ${w} = ${l * w}`], ["Layers", `${h}`], ["Volume", `V = l \\times w \\times h = ${l} \\times ${w} \\times ${h} = ${N}\\ \\text{cm}^3`]]);
  } else if (S.tab === "metre") {
    const vol = S.metre.mode === "volume", st = S.metre.stage;
    const counts = vol ? ["1 m³", "100 cubes in a row", "100 × 100 = 10 000 cubes in a layer", "10 000 × 100 = 1 000 000 cubes"] : ["1 m²", "100 squares in a row", "100 × 100 = 10 000 squares"];
    box.innerHTML = `<h3>${vol ? "Cubes of 1 cm³" : "Squares of 1 cm²"}</h3><p class="big-count">${["1", "100", "10 000", "1 000 000"][st]}</p><p class="hint">${counts[st] || ""}</p>` +
      workingHTML(vol
        ? [["1 m = 100 cm, so", "1\\ \\text{m}^3 = 100 \\times 100 \\times 100 = 1\\,000\\,000\\ \\text{cm}^3"], ["Not 100!", "\\text{Length} \\times 100, \\quad \\text{area} \\times 100^2, \\quad \\text{volume} \\times 100^3"]]
        : [["1 m = 100 cm, so", "1\\ \\text{m}^2 = 100 \\times 100 = 10\\,000\\ \\text{cm}^2"]]);
  } else if (S.tab === "capacity") {
    const { l, w, h } = S.tank, V = l * w * h, now = Math.round(V * S.level);
    box.innerHTML = `<h3>Water in the tank</h3><p class="big-count">${fmt(now / 1000)} litres</p><p class="hint">${fmt(now)} cm³ = ${fmt(now)} ml</p>` +
      workingHTML([["Volume of the tank", `V = ${n(l)} \\times ${n(w)} \\times ${n(h)} = ${tx(big(V))}\\ \\text{cm}^3`], ["In litres (÷ 1000)", `${tx(big(V))} \\div 1000 = ${tx(fmt(V / 1000))}\\ \\text{litres}`]]);
  } else {
    const opts = (list, sel) => list.map((u) => `<option${u === sel ? " selected" : ""}>${u}</option>`).join("");
    const { lines, result } = conversionSteps();
    box.innerHTML = `<h3>Converter</h3>
      <div class="answer"><select id="c-kind" class="field" aria-label="Quantity">${["length", "area", "volume"].map((k) => `<option value="${k}"${k === C.kind ? " selected" : ""}>${k === "volume" ? "volume / capacity" : k}</option>`).join("")}</select></div>
      <div class="answer"><input type="number" id="c-val" value="${C.value}" step="any" aria-label="Value">
        <select id="c-from" class="field" aria-label="From">${opts(UNITS[C.kind].units, C.from)}</select> →
        <select id="c-to" class="field" aria-label="To">${opts(UNITS[C.kind].units, C.to)}</select></div>
      <p class="big-count" style="font-size:1.6rem;margin-top:12px">${fmt(result)} ${C.to}</p>` + workingHTML(lines);
    $("c-kind").addEventListener("change", (e) => { C.kind = e.target.value; const u = UNITS[C.kind].units; C.from = u[2]; C.to = u[1]; buildConvert(); });
    $("c-val").addEventListener("change", (e) => { C.value = parseFloat(e.target.value) || 0; renderMain(); });
    $("c-from").addEventListener("change", (e) => { C.from = e.target.value; buildConvert(); });
    $("c-to").addEventListener("change", (e) => { C.to = e.target.value; buildConvert(); });
  }
  formulaBar($("formulas"), [
    ["len", "1\\ \\text{m} = 100\\ \\text{cm}, \\quad 1\\ \\text{cm} = 10\\ \\text{mm}"],
    ["area", "1\\ \\text{m}^2 = 10\\,000\\ \\text{cm}^2, \\quad 1\\ \\text{cm}^2 = 100\\ \\text{mm}^2"],
    ["vol", "1\\ \\text{m}^3 = 1\\,000\\,000\\ \\text{cm}^3, \\quad 1\\ \\text{cm}^3 = 1000\\ \\text{mm}^3"],
    ["cap", "1\\ \\text{cm}^3 = 1\\ \\text{ml}, \\quad 1000\\ \\text{cm}^3 = 1\\ \\text{litre}"],
  ], S.tab === "capacity" ? "cap" : S.tab === "metre" ? (S.metre.mode === "volume" ? "vol" : "area") : S.tab === "convert" ? (C.kind === "length" ? "len" : C.kind === "area" ? "area" : "vol") : null);
}

// ---------- Foot controls ----------
function syncFoot() {
  $("play").hidden = S.tab === "convert" || S.tab === "metre";
  $("modes").hidden = S.tab !== "metre";
  $("play").textContent = S.tab === "cubes" ? (S.shown >= S.target && S.shown > 0 ? "Build again" : "Build") : S.filling ? "Pause" : S.level >= 1 ? "Empty and fill again" : "Fill";
  document.querySelectorAll("#modes [data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === S.metre.mode)));
}
function play() {
  if (S.tab === "cubes") { const N = S.cubes.l * S.cubes.w * S.cubes.h; S.shown = 0; S.target = N; buildCubes(); }
  else if (S.tab === "capacity") { if (S.level >= 1) S.level = 0; S.filling = !S.filling; buildTank(); }
  syncFoot();
}
$("play").addEventListener("click", play);
onKey("space", play);
document.querySelectorAll("#modes [data-m]").forEach((b) => b.addEventListener("click", () => {
  S.metre.mode = b.dataset.m; S.metre.stage = Math.min(S.metre.stage, b.dataset.m === "area" ? 2 : 3); makeSteps(); syncFoot();
}));
onKey("r", () => viewer.resetView());
$("reset-view").addEventListener("click", () => viewer.resetView());
viewer.onTick((dt) => { if (anim) anim(dt); });

// ---------- Tabs and steps ----------
function frame() {
  if (S.tab === "cubes") viewer.frame(v3(0, S.cubes.h / 2, 0), Math.max(S.cubes.l, S.cubes.w, S.cubes.h) * 0.9 + 1, v3(0.8, 0.8, 1.2));
  else if (S.tab === "metre") viewer.frame(v3(0, 4, 0), 11.5, v3(0.7, 0.75, 1.2));
  else if (S.tab === "capacity") viewer.frame(v3(1, S.tank.h * 0.05, 0), Math.max(S.tank.l, S.tank.h) * 0.07 + 1.5, v3(0.6, 0.6, 1.2));
  else viewer.frame(v3(0, 2.5, 0), 6, v3(0.7, 0.6, 1.2));
}
function makeSteps() {
  let list;
  if (S.tab === "cubes") list = [
    { title: "Volume counts cubes", html: "<p>The volume of a solid is how many <b>1 cm cubes</b> fit inside it. Each one is <b>1 cm³</b>.</p>", enter: () => { S.shown = 0; S.target = 0; buildCubes(); } },
    { title: "Build it", html: "<p>Fill the cuboid one layer at a time. <span class='student-only'>Change the sizes and build it again.</span></p>", enter: () => { S.shown = 0; S.target = S.cubes.l * S.cubes.w * S.cubes.h; buildCubes(); syncFoot(); } },
    { title: "Layers", html: "<p>One layer has <b>l × w</b> cubes, and there are <b>h</b> layers, so V = l × w × h.</p>", enter: () => { S.target = S.shown = S.cubes.l * S.cubes.w * S.cubes.h; buildCubes(); } },
  ];
  else if (S.tab === "metre") {
    const vol = S.metre.mode === "volume";
    const st = (k) => () => { S.metre.stage = k; S.metre.grow = k === 1 || k === 2 ? 0 : 1; buildMetre(); };
    list = [
      { title: vol ? "A cube of 1 m" : "A square of 1 m", html: `<p>Each side is <b>1 m = 100 cm</b>. How many ${vol ? "1 cm cubes" : "1 cm squares"} fit inside? <b>Not 100!</b></p>`, enter: st(0) },
      { title: "One row", html: `<p>Along one edge: <b>100</b> ${vol ? "cubes" : "squares"}.</p>`, enter: st(1) },
      { title: vol ? "One layer" : "The whole square", html: `<p>100 rows of 100: <b>100 × 100 = 10 000</b>${vol ? " cubes in the bottom layer." : " squares, so 1 m² = 10 000 cm²."}</p>`, enter: st(2) },
    ];
    if (vol) list.push({ title: "All the layers", html: "<p>100 layers of 10 000: <b>100 × 100 × 100 = 1 000 000</b>, so 1 m³ = 1 000 000 cm³.</p>", enter: st(3) });
  } else if (S.tab === "capacity") list = [
    { title: "Capacity", html: "<p><b>Capacity</b> is how much a container holds. <b>1 cm³ = 1 ml</b>, and <b>1000 cm³ = 1 litre</b>: a 10 cm cube.</p>", enter: () => { S.level = 0; S.filling = false; buildTank(); syncFoot(); } },
    { title: "Fill the tank", html: "<p>Watch the litres go up as the tank fills.</p>", enter: () => { S.level = 0; S.filling = true; buildTank(); syncFoot(); } },
    { title: "Work it out", html: "<p>Find the volume in cm³, then divide by 1000 to get litres.</p>", enter: () => { S.filling = false; S.level = 1; buildTank(); syncFoot(); } },
  ];
  else list = [{ title: "Converter", html: "<p>Choose a quantity, a value and two units. The steps show <b>why</b> the number is what it is.</p><p>Remember: for area use the factor <b>squared</b>, for volume <b>cubed</b>.</p>", enter: buildConvert }];
  createSteps($("steps"), list);
}
function setTab(k) {
  S.tab = k;
  tabs($("tabs"), TABS, k, setTab);
  $("controls-panel").hidden = k === "metre" || k === "convert";
  if (k === "cubes") sliders($("controls"), [["l", "Length l", 4, 1, 8, 1], ["w", "Width w", 3, 1, 8, 1], ["h", "Height h", 2, 1, 8, 1]], S.cubes, () => { S.shown = S.target = S.cubes.l * S.cubes.w * S.cubes.h; buildCubes(); });
  if (k === "capacity") sliders($("controls"), [["l", "Length l", 40, 10, 100, 5], ["w", "Width w", 30, 10, 100, 5], ["h", "Height h", 30, 10, 100, 5]], S.tank, () => { buildTank(); frame(); });
  makeSteps(); syncFoot(); frame();
}

quiz($("quiz"), [
  { q: "How many cm³ are there in 1 m³?", options: ["1 000 000", "100", "10 000", "1000"], hint: "1 m = 100 cm, and a cube has three dimensions.", explain: "100 × 100 × 100 = 1 000 000." },
  { q: "A tank holds 24 000 cm³. How many litres is that?", options: ["24", "240", "2.4", "24 000"], hint: "1000 cm³ = 1 litre.", explain: "24 000 ÷ 1000 = 24 litres." },
  { q: "3 m² in cm² is…", options: ["30 000 cm²", "300 cm²", "3000 cm²", "3 000 000 cm²"], hint: "1 m² = 100 × 100 cm².", explain: "3 × 10 000 = 30 000 cm²." },
]);

setTab("cubes");

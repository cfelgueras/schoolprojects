// A net that folds into a solid. The net is described flat, in one plane (x, z), as a tree of faces:
// each face (except the first) hangs from its parent along a hinge edge and turns by `fold` radians
// when the solid is closed. setUnfold(0) = solid, setUnfold(1) = flat net.
//
// net = {
//   faces: [{ part, poly: [[x, z], ...], parent (index, -1 for the base), hinge: [[x, z], [x, z]], fold,
//             outline: [[i, j], ...] (edges to draw, default all), gold: [[i, j], ...] (highlighted edges),
//             label: true (the part's area label goes on this face), labelAt: [x, z] (where; default the middle) }],
//   marks: [{ face, a: [x, z], b: [x, z], text, gold }]   dimension lines with a label
// }
import { THREE } from "./viewer.js";

const INK = 0x1b2430, GOLD = 0xc8901f;

export function buildFoldable(viewer, net, colors) {
  const group = new THREE.Group();
  const parts = {}; // part -> { material, color, label, meshes: [] }
  const hinges = [];
  const goldBits = [];
  const size = net.size || 5;
  const thick = size / 140;

  // Centre of the flat net: the net slides there as it opens, so both the solid and the net stay centred
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  net.faces.forEach((f) => f.poly.forEach(([x, z]) => {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
  }));
  const centre = [(minX + maxX) / 2, (minZ + maxZ) / 2];
  const radius = Math.hypot(maxX - minX, maxZ - minZ) / 2;

  function partOf(name) {
    if (!parts[name]) {
      const color = new THREE.Color(colors[name]);
      parts[name] = {
        color,
        material: new THREE.MeshStandardMaterial({
          color, side: THREE.DoubleSide, roughness: 0.75, metalness: 0,
          polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
        }),
        meshes: [],
        label: null,
      };
    }
    return parts[name];
  }

  // a thin rod from p to q (both THREE.Vector3), used for highlighted edges and dimension lines
  function rod(p, q, color, r) {
    const len = p.distanceTo(q);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 8), new THREE.MeshBasicMaterial({ color }));
    m.position.copy(p).add(q).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), q.clone().sub(p).normalize());
    return m;
  }

  const anchors = net.faces.map((f) => (f.parent < 0 ? [0, 0] : f.hinge[0]));
  const groups = [];
  net.faces.forEach((f, i) => {
    const A = anchors[i];
    const P = f.parent < 0 ? [0, 0] : anchors[f.parent];
    const g = new THREE.Group();
    g.position.set(A[0] - P[0], 0, A[1] - P[1]);
    const local = (pt, y = 0) => new THREE.Vector3(pt[0] - A[0], y, pt[1] - A[1]);

    // the face itself
    const shape = new THREE.Shape(f.poly.map(([x, z]) => new THREE.Vector2(x - A[0], -(z - A[1]))));
    const geo = new THREE.ShapeGeometry(shape);
    geo.rotateX(-Math.PI / 2);
    const part = partOf(f.part);
    const mesh = new THREE.Mesh(geo, part.material);
    mesh.userData.part = f.part;
    part.meshes.push(mesh);
    g.add(mesh);

    // its outline
    const edges = f.outline || f.poly.map((_, k) => [k, (k + 1) % f.poly.length]);
    const pts = [];
    edges.forEach(([a, b]) => { pts.push(local(f.poly[a]), local(f.poly[b])); });
    const lines = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: INK }));
    g.add(lines);

    // highlighted edges (e.g. the circumference 2πr), hidden until asked for
    (f.gold || []).forEach(([a, b]) => {
      const m = rod(local(f.poly[a]), local(f.poly[b]), GOLD, thick * 1.6);
      m.visible = false;
      goldBits.push(m);
      g.add(m);
    });

    // area label of the part, at the middle of this face
    if (f.label) {
      let cx = 0, cz = 0;
      f.poly.forEach(([x, z]) => { cx += x; cz += z; });
      const lbl = viewer.label("", "lbl hide");
      lbl.position.copy(local(f.labelAt || [cx / f.poly.length, cz / f.poly.length]));
      part.label = lbl;
      g.add(lbl);
    }

    // hinge: axis along the hinge edge, turning so that the face rises above its parent
    if (f.parent >= 0) {
      const [H0, H1] = f.hinge;
      const d = [H1[0] - H0[0], H1[1] - H0[1]];
      let cx = 0, cz = 0;
      f.poly.forEach(([x, z]) => { cx += x; cz += z; });
      const o = [cx / f.poly.length - H0[0], cz / f.poly.length - H0[1]];
      const up = d[1] * o[0] - d[0] * o[1]; // y of (d × o): the side the face lies on
      hinges.push({ g, axis: new THREE.Vector3(d[0], 0, d[1]).normalize(), angle: f.fold * (up > 0 ? 1 : -1) });
    }
    groups.push(g);
    (f.parent < 0 ? group : groups[f.parent]).add(g);
  });

  // dimension lines with labels (they fold with their face)
  (net.marks || []).forEach((mk) => {
    const A = anchors[mk.face];
    const p = new THREE.Vector3(mk.a[0] - A[0], 0, mk.a[1] - A[1]), q = new THREE.Vector3(mk.b[0] - A[0], 0, mk.b[1] - A[1]);
    const m = rod(p, q, mk.gold ? GOLD : 0x6b4410, thick * (mk.gold ? 1.6 : 1));
    const lbl = viewer.label(mk.text, mk.gold ? "lbl key" : "lbl dim");
    lbl.position.copy(p).add(q).multiplyScalar(0.5);
    if (mk.gold) { m.visible = false; lbl.visible = false; goldBits.push(m, lbl); }
    groups[mk.face].add(m, lbl);
  });

  viewer.root.add(group);

  let unfold = 0;
  function setUnfold(u) {
    unfold = u;
    hinges.forEach((h) => h.g.quaternion.setFromAxisAngle(h.axis, h.angle * (1 - u)));
    group.position.set(-centre[0] * u, 0, -centre[1] * u);
  }
  setUnfold(0);

  return {
    group,
    radius,
    setUnfold,
    get unfold() { return unfold; },
    // light up one part and fade the rest; null = everything normal
    highlight(name) {
      Object.keys(parts).forEach((k) => {
        const p = parts[k], m = p.material;
        const faded = name && k !== name;
        m.transparent = faded;
        m.opacity = faded ? 0.25 : 1;
        m.depthWrite = !faded;
        m.emissive.copy(k === name ? p.color : new THREE.Color(0));
        m.emissiveIntensity = k === name ? 0.35 : 0;
      });
    },
    setLabel(name, text) {
      const p = parts[name];
      if (!p || !p.label) return;
      p.label.element.textContent = text;
      p.label.element.classList.toggle("hide", !text);
    },
    showGold(on) { goldBits.forEach((m) => (m.visible = on)); },
  };
}

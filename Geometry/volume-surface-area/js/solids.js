// Ready-made solids for the modules. Each one sits on y = 0, centred on the y-axis, with its outline drawn.
import { THREE } from "./viewer.js";

const { PI, SQRT2 } = Math;
const LINE = new THREE.LineBasicMaterial({ color: 0x1b2430 });

export function solidMat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.7, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, ...opts });
}
export function glassMat(color = "#9cc3e6") {
  return new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.22, roughness: 0.2, side: THREE.DoubleSide, depthWrite: false });
}
export function waterMat() {
  return new THREE.MeshStandardMaterial({ color: "#2f86d6", transparent: true, opacity: 0.72, roughness: 0.3, side: THREE.DoubleSide, depthWrite: false });
}

// mesh + its sharp edges
export function outlined(geo, mat, { edges = true, angle = 25, lineMat = LINE } = {}) {
  const mesh = new THREE.Mesh(geo, mat);
  if (edges) mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, angle), lineMat));
  return mesh;
}

// ---------- Geometries (base on y = 0) ----------
export const geo = {
  box: (l, w, h) => new THREE.BoxGeometry(l, h, w).translate(0, h / 2, 0),
  cylinder: (r, h, seg = 64) => new THREE.CylinderGeometry(r, r, h, seg).translate(0, h / 2, 0),
  cone: (r, h, seg = 64) => new THREE.ConeGeometry(r, h, seg).translate(0, h / 2, 0),
  // frustum: bottom radius R, top radius r
  frustum: (R, r, h, seg = 64) => new THREE.CylinderGeometry(r, R, h, seg).translate(0, h / 2, 0),
  // square frustum / pyramid / cuboid from a 4-sided "cylinder": bottom side A, top side a
  squareFrustum: (A, a, h) => new THREE.CylinderGeometry(a / SQRT2, A / SQRT2, h, 4).rotateY(PI / 4).translate(0, h / 2, 0),
  sphere: (r) => new THREE.SphereGeometry(r, 64, 32).translate(0, r, 0),
  // dome (up) or bowl (down), flat face on y = 0
  hemisphere: (r, up = true) => new THREE.SphereGeometry(r, 64, 16, 0, 2 * PI, up ? 0 : PI / 2, PI / 2),
  disc: (r, seg = 64) => new THREE.CircleGeometry(r, seg).rotateX(-PI / 2),
  square: (a) => new THREE.PlaneGeometry(a, a).rotateX(-PI / 2),
  // pyramid with a rectangular base a (along x) × b (along z)
  pyramid(a, b, h) {
    const x = a / 2, z = b / 2;
    const P = [[-x, 0, -z], [x, 0, -z], [x, 0, z], [-x, 0, z]], T = [0, h, 0];
    const tris = [[P[0], P[2], P[1]], [P[0], P[3], P[2]], [P[3], P[2], T], [P[2], P[1], T], [P[1], P[0], T], [P[0], P[3], T]];
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(tris.flat(2), 3));
    g.computeVertexNormals();
    return g;
  },
  // any polygon cross-section (points [x, y]) extruded along x by length l, standing on y = 0
  prism(points, l) {
    const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
    return new THREE.ExtrudeGeometry(shape, { depth: Math.max(l, 0.001), bevelEnabled: false, curveSegments: 48 })
      .rotateY(PI / 2).translate(-l / 2, 0, 0);
  },
};

// quick solids: geometry name + arguments → outlined mesh
export function solid(kind, args, color, opts) {
  return outlined(geo[kind](...args), opts && opts.glass ? glassMat(color) : solidMat(color), opts);
}

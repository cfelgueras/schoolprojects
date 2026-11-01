// Every area and volume formula in the app, plus rounding and number formatting.
// Pure functions with no DOM or Three.js, so tests.html can check them all.

const { PI, sqrt, hypot } = Math;

// ---------- 2D areas (cross-sections and faces) ----------
export const area = {
  rectangle: (l, w) => l * w,
  triangle: (b, h) => 0.5 * b * h,
  trapezium: (a, b, h) => 0.5 * (a + b) * h,
  circle: (r) => PI * r * r,
  circumference: (r) => 2 * PI * r,
  // L-shape: an outer W × H rectangle with a w × h rectangle cut from one corner
  lShape: (W, H, w, h) => W * H - w * h,
  sector: (r, angleDeg) => (angleDeg / 360) * PI * r * r,
  arc: (r, angleDeg) => (angleDeg / 360) * 2 * PI * r,
};

// ---------- Solids ----------
export const cuboid = {
  volume: (l, w, h) => l * w * h,
  surfaceArea: (l, w, h) => 2 * (l * w + l * h + w * h),
};

export const prism = {
  volume: (crossSectionArea, length) => crossSectionArea * length,
};

// Triangular prism with an isosceles cross-section: base b, triangle height h, length l
export const triangularPrism = {
  side: (b, h) => hypot(b / 2, h),
  volume: (b, h, l) => area.triangle(b, h) * l,
  surfaceArea: (b, h, l) => 2 * area.triangle(b, h) + b * l + 2 * triangularPrism.side(b, h) * l,
};

export const cylinder = {
  volume: (r, h) => PI * r * r * h,
  curvedSurfaceArea: (r, h) => 2 * PI * r * h,
  surfaceArea: (r, h) => 2 * PI * r * r + 2 * PI * r * h,
};

export const cone = {
  slantHeight: (r, h) => hypot(r, h),
  height: (r, l) => sqrt(l * l - r * r),
  volume: (r, h) => (PI * r * r * h) / 3,
  curvedSurfaceArea: (r, l) => PI * r * l,
  surfaceArea: (r, l) => PI * r * r + PI * r * l,
  // the curved surface unrolls into a sector of radius l with this angle
  sectorAngle: (r, l) => (360 * r) / l,
};

// Pyramid with a rectangular base a × b (square base: a = b) and perpendicular height h
export const pyramid = {
  volume: (a, b, h) => (a * b * h) / 3,
  // height of the triangular face on the side of length a (and on the side of length b)
  faceHeightA: (a, b, h) => hypot(h, b / 2),
  faceHeightB: (a, b, h) => hypot(h, a / 2),
  edge: (a, b, h) => hypot(h, a / 2, b / 2),
  surfaceArea: (a, b, h) => a * b + a * pyramid.faceHeightA(a, b, h) + b * pyramid.faceHeightB(a, b, h),
};

export const sphere = {
  volume: (r) => (4 / 3) * PI * r ** 3,
  surfaceArea: (r) => 4 * PI * r * r,
  radiusFromVolume: (V) => Math.cbrt((3 * V) / (4 * PI)),
  radiusFromSurfaceArea: (A) => sqrt(A / (4 * PI)),
};

export const hemisphere = {
  volume: (r) => (2 / 3) * PI * r ** 3,
  curvedSurfaceArea: (r) => 2 * PI * r * r,
  surfaceArea: (r) => 3 * PI * r * r,
};

// Frustum of a cone: bottom radius R, top radius r, perpendicular height h
export const coneFrustum = {
  // height of the whole cone, from similar triangles: H / R = (H - h) / r
  fullHeight: (R, r, h) => (h * R) / (R - r),
  slantHeight: (R, r, h) => hypot(R - r, h),
  volume: (R, r, h) => (PI * h * (R * R + R * r + r * r)) / 3,
  curvedSurfaceArea: (R, r, h) => PI * (R + r) * coneFrustum.slantHeight(R, r, h),
  surfaceArea: (R, r, h) => coneFrustum.curvedSurfaceArea(R, r, h) + PI * R * R + PI * r * r,
};

// Frustum of a square-based pyramid: bottom side A, top side a, perpendicular height h
export const pyramidFrustum = {
  fullHeight: (A, a, h) => (h * A) / (A - a),
  volume: (A, a, h) => (h * (A * A + A * a + a * a)) / 3,
  faceHeight: (A, a, h) => hypot(h, (A - a) / 2),
  surfaceArea: (A, a, h) => A * A + a * a + 2 * (A + a) * pyramidFrustum.faceHeight(A, a, h),
};

// ---------- Composite solids (the hidden faces where the parts join are left out) ----------
export const composite = {
  hemisphereOnCylinder: {
    volume: (r, h) => hemisphere.volume(r) + cylinder.volume(r, h),
    surfaceArea: (r, h) => hemisphere.curvedSurfaceArea(r) + cylinder.curvedSurfaceArea(r, h) + area.circle(r),
  },
  coneOnCylinder: {
    volume: (r, hCyl, hCone) => cylinder.volume(r, hCyl) + cone.volume(r, hCone),
    surfaceArea: (r, hCyl, hCone) =>
      cone.curvedSurfaceArea(r, cone.slantHeight(r, hCone)) + cylinder.curvedSurfaceArea(r, hCyl) + area.circle(r),
  },
  coneOnHemisphere: {
    volume: (r, hCone) => cone.volume(r, hCone) + hemisphere.volume(r),
    surfaceArea: (r, hCone) => cone.curvedSurfaceArea(r, cone.slantHeight(r, hCone)) + hemisphere.curvedSurfaceArea(r),
  },
  // cuboid l × w × h with a cylindrical hole of radius r right through its height
  cuboidWithHole: {
    volume: (l, w, h, r) => cuboid.volume(l, w, h) - cylinder.volume(r, h),
    surfaceArea: (l, w, h, r) => cuboid.surfaceArea(l, w, h) - 2 * area.circle(r) + cylinder.curvedSurfaceArea(r, h),
  },
  // cuboid a × a × h with a square-based pyramid (base a, height p) on top
  prismWithPyramid: {
    volume: (a, h, p) => cuboid.volume(a, a, h) + pyramid.volume(a, a, p),
    surfaceArea: (a, h, p) => a * a + 4 * a * h + 2 * a * pyramid.faceHeightA(a, a, p),
  },
};

// ---------- Units ----------
// how many of the smaller unit fit in one of the bigger unit, for length, area and volume
const LENGTH = { mm: 0.001, cm: 0.01, m: 1, km: 1000 };
export const units = {
  convert(value, from, to, power = 1) {
    return value * (LENGTH[from] / LENGTH[to]) ** power;
  },
  cm3ToMl: (v) => v,
  cm3ToLitres: (v) => v / 1000,
  litresToCm3: (v) => v * 1000,
  m3ToLitres: (v) => v * 1000,
};

// ---------- Rounding and formatting ----------
// Round to n significant figures (Cambridge: 3 s.f. unless exact)
export function roundSig(x, n = 3) {
  if (x === 0 || !isFinite(x)) return x;
  const d = n - 1 - Math.floor(Math.log10(Math.abs(x)));
  const f = 10 ** d;
  return Math.round(x * f) / f;
}

// x to n s.f. as text, keeping trailing zeros (2.50) and never using e-notation
export function sig(x, n = 3) {
  if (x === 0) return "0";
  const d = n - 1 - Math.floor(Math.log10(Math.abs(x)));
  const r = roundSig(x, n);
  return d > 0 ? r.toFixed(d) : String(r);
}

// Is x a "nice" exact number (an integer or at most 3 decimal places)?
export function isExact(x) {
  return Math.abs(x * 1000 - Math.round(x * 1000)) < 1e-7 && Math.abs(x) < 1e7;
}

// A clean number for the working: exact values as they are, others to 3 s.f.
export function num(x) {
  return isExact(x) ? String(Math.round(x * 1000) / 1000) : sig(x);
}

// A coefficient of π, e.g. 9 → "9π", 1 → "π", 2.25 → "2.25π"
export function piForm(k) {
  if (!isExact(k)) return sig(k) + "π";
  const s = num(k);
  return s === "1" ? "π" : s + "π";
}

// "= 24" if exact, "≈ 28.3" otherwise
export function result(x) {
  return (isExact(x) ? "= " : "≈ ") + num(x);
}

// Within tolerance of the 3 s.f. answer (accepts slight rounding differences)
export function checkAnswer(given, exact) {
  if (!isFinite(given)) return false;
  if (exact === 0) return Math.abs(given) < 1e-9;
  return Math.abs(given - exact) / Math.abs(exact) <= 0.006 || roundSig(given) === roundSig(exact);
}

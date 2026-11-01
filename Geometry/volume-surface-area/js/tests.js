// Checks every formula in formulas.js against values worked out by hand. Run by tests.html.
import * as F from "./formulas.js";

const { PI } = Math;

export function run() {
  const results = [];
  function eq(name, got, want, tol = 1e-9) {
    const ok = typeof want === "string" ? got === want : Math.abs(got - want) <= tol * Math.max(1, Math.abs(want));
    results.push({ name, ok, got, want });
  }

  // 2D areas
  eq("rectangle 6 × 4", F.area.rectangle(6, 4), 24);
  eq("triangle b 6, h 4", F.area.triangle(6, 4), 12);
  eq("trapezium a 3, b 5, h 4", F.area.trapezium(3, 5, 4), 16);
  eq("circle r 3", F.area.circle(3), 9 * PI);
  eq("circumference r 3", F.area.circumference(3), 6 * PI);
  eq("L-shape 8 × 6 minus 3 × 2", F.area.lShape(8, 6, 3, 2), 42);
  eq("sector r 6, 90°", F.area.sector(6, 90), 9 * PI);
  eq("arc r 6, 60°", F.area.arc(6, 60), 2 * PI);

  // Cuboid and prisms
  eq("cuboid V 6 × 4 × 3", F.cuboid.volume(6, 4, 3), 72);
  eq("cuboid SA 6 × 4 × 3", F.cuboid.surfaceArea(6, 4, 3), 108);
  eq("prism V cross-section 12, length 10", F.prism.volume(12, 10), 120);
  eq("triangular prism sloping side b 6, h 4", F.triangularPrism.side(6, 4), 5);
  eq("triangular prism V b 6, h 4, l 10", F.triangularPrism.volume(6, 4, 10), 120);
  eq("triangular prism SA b 6, h 4, l 10", F.triangularPrism.surfaceArea(6, 4, 10), 24 + 60 + 100);

  // Cylinder
  eq("cylinder V r 3, h 5", F.cylinder.volume(3, 5), 45 * PI);
  eq("cylinder curved SA r 3, h 5", F.cylinder.curvedSurfaceArea(3, 5), 30 * PI);
  eq("cylinder SA r 3, h 5", F.cylinder.surfaceArea(3, 5), 48 * PI);

  // Cone
  eq("cone slant height r 3, h 4", F.cone.slantHeight(3, 4), 5);
  eq("cone height r 3, l 5", F.cone.height(3, 5), 4);
  eq("cone V r 3, h 4", F.cone.volume(3, 4), 12 * PI);
  eq("cone curved SA r 3, l 5", F.cone.curvedSurfaceArea(3, 5), 15 * PI);
  eq("cone SA r 3, l 5", F.cone.surfaceArea(3, 5), 24 * PI);
  eq("cone sector angle r 3, l 5", F.cone.sectorAngle(3, 5), 216);
  eq("cone: sector area = curved SA", F.area.sector(5, F.cone.sectorAngle(3, 5)), F.cone.curvedSurfaceArea(3, 5));

  // Pyramids
  eq("square pyramid V b 6, h 4", F.pyramid.volume(6, 6, 4), 48);
  eq("square pyramid face height b 6, h 4", F.pyramid.faceHeightA(6, 6, 4), 5);
  eq("square pyramid SA b 6, h 4", F.pyramid.surfaceArea(6, 6, 4), 36 + 60);
  eq("rectangular pyramid V 8 × 6, h 4", F.pyramid.volume(8, 6, 4), 64);
  eq("rectangular pyramid face height on side 8", F.pyramid.faceHeightA(8, 6, 4), 5);
  eq("rectangular pyramid face height on side 6", F.pyramid.faceHeightB(8, 6, 4), Math.sqrt(32));
  eq("rectangular pyramid SA 8 × 6, h 4", F.pyramid.surfaceArea(8, 6, 4), 48 + 40 + 6 * Math.sqrt(32));
  eq("rectangular pyramid edge 8 × 6, h 4", F.pyramid.edge(8, 6, 4), Math.sqrt(41));

  // Sphere and hemisphere
  eq("sphere V r 3", F.sphere.volume(3), 36 * PI);
  eq("sphere SA r 3", F.sphere.surfaceArea(3), 36 * PI);
  eq("sphere radius from V 36π", F.sphere.radiusFromVolume(36 * PI), 3);
  eq("sphere radius from SA 100π", F.sphere.radiusFromSurfaceArea(100 * PI), 5);
  eq("hemisphere V r 3", F.hemisphere.volume(3), 18 * PI);
  eq("hemisphere curved SA r 3", F.hemisphere.curvedSurfaceArea(3), 18 * PI);
  eq("hemisphere SA r 3", F.hemisphere.surfaceArea(3), 27 * PI);
  eq("Archimedes: sphere = 2/3 of its cylinder", F.sphere.volume(3) / F.cylinder.volume(3, 6), 2 / 3);
  eq("cone = 1/3 of its cylinder", F.cone.volume(3, 7) / F.cylinder.volume(3, 7), 1 / 3);

  // Frustums: R 6, r 3, h 4 cut from a cone of height 8 (similar triangles) with slant 10
  eq("cone frustum full height", F.coneFrustum.fullHeight(6, 3, 4), 8);
  eq("cone frustum slant height", F.coneFrustum.slantHeight(6, 3, 4), 5);
  eq("cone frustum V = big − small", F.coneFrustum.volume(6, 3, 4), F.cone.volume(6, 8) - F.cone.volume(3, 4));
  eq("cone frustum V", F.coneFrustum.volume(6, 3, 4), 84 * PI);
  eq("cone frustum curved SA = πRL − πrl", F.coneFrustum.curvedSurfaceArea(6, 3, 4), PI * 6 * 10 - PI * 3 * 5);
  eq("cone frustum SA", F.coneFrustum.surfaceArea(6, 3, 4), 45 * PI + 36 * PI + 9 * PI);
  eq("pyramid frustum full height", F.pyramidFrustum.fullHeight(6, 3, 4), 8);
  eq("pyramid frustum V = big − small", F.pyramidFrustum.volume(6, 3, 4), F.pyramid.volume(6, 6, 8) - F.pyramid.volume(3, 3, 4));
  eq("pyramid frustum face height", F.pyramidFrustum.faceHeight(10, 4, 4), 5);
  eq("pyramid frustum SA", F.pyramidFrustum.surfaceArea(10, 4, 4), 100 + 16 + 4 * 0.5 * (10 + 4) * 5);

  // Composite solids
  eq("hemisphere on cylinder V r 3, h 5", F.composite.hemisphereOnCylinder.volume(3, 5), 18 * PI + 45 * PI);
  eq("hemisphere on cylinder SA r 3, h 5", F.composite.hemisphereOnCylinder.surfaceArea(3, 5), 18 * PI + 30 * PI + 9 * PI);
  eq("cone on cylinder V r 3, 5, 4", F.composite.coneOnCylinder.volume(3, 5, 4), 45 * PI + 12 * PI);
  eq("cone on cylinder SA r 3, 5, 4", F.composite.coneOnCylinder.surfaceArea(3, 5, 4), 15 * PI + 30 * PI + 9 * PI);
  eq("cone on hemisphere V r 3, h 4", F.composite.coneOnHemisphere.volume(3, 4), 12 * PI + 18 * PI);
  eq("cone on hemisphere SA r 3, h 4", F.composite.coneOnHemisphere.surfaceArea(3, 4), 15 * PI + 18 * PI);
  eq("cuboid with hole V", F.composite.cuboidWithHole.volume(10, 8, 5, 2), 400 - 20 * PI);
  eq("cuboid with hole SA", F.composite.cuboidWithHole.surfaceArea(10, 8, 5, 2), 2 * (80 + 50 + 40) - 8 * PI + 20 * PI);
  eq("cuboid + pyramid V a 6, h 5, p 4", F.composite.prismWithPyramid.volume(6, 5, 4), 180 + 48);
  eq("cuboid + pyramid SA a 6, h 5, p 4", F.composite.prismWithPyramid.surfaceArea(6, 5, 4), 36 + 120 + 60);

  // Units
  eq("1 m = 100 cm", F.units.convert(1, "m", "cm"), 100);
  eq("1 m² = 10 000 cm²", F.units.convert(1, "m", "cm", 2), 10000);
  eq("1 m³ = 1 000 000 cm³", F.units.convert(1, "m", "cm", 3), 1e6);
  eq("2500 mm² = 25 cm²", F.units.convert(2500, "mm", "cm", 2), 25);
  eq("1000 cm³ = 1 litre", F.units.cm3ToLitres(1000), 1);
  eq("1 m³ = 1000 litres", F.units.m3ToLitres(1), 1000);

  // Rounding and formatting
  eq("roundSig 28.274 → 28.3", F.roundSig(28.274), 28.3);
  eq("roundSig 1234.5 → 1230", F.roundSig(1234.5), 1230);
  eq("roundSig 0.012345 → 0.0123", F.roundSig(0.012345), 0.0123);
  eq("sig 2.5 → 2.50", F.sig(2.5), "2.50");
  eq("sig 1234.5 → 1230", F.sig(1234.5), "1230");
  eq("sig 0.99999 → 1.00", F.sig(0.99999), "1.00");
  eq("sig 99.96 → 100", F.sig(99.96), "100");
  eq("num 24 → 24", F.num(24), "24");
  eq("num 28.274… → 28.3", F.num(9 * PI), "28.3");
  eq("piForm 9 → 9π", F.piForm(9), "9π");
  eq("piForm 1 → π", F.piForm(1), "π");
  eq("result exact", F.result(24), "= 24");
  eq("result rounded", F.result(9 * PI), "≈ 28.3");
  eq("checkAnswer 28.3 for 9π", F.checkAnswer(28.3, 9 * PI) ? 1 : 0, 1);
  eq("checkAnswer 28.27 for 9π", F.checkAnswer(28.27, 9 * PI) ? 1 : 0, 1);
  eq("checkAnswer 28 rejected for 9π", F.checkAnswer(28, 9 * PI) ? 1 : 0, 0);
  eq("checkAnswer 29 rejected for 9π", F.checkAnswer(29, 9 * PI) ? 1 : 0, 0);

  return results;
}

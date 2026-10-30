// Renders one page of a PDF to PNG using macOS PDFKit (no extra installs).
// Usage: osascript -l JavaScript tools/render-page.js <file.pdf> <pageNumber (1-based)> <out.png> [scale=3]
ObjC.import("AppKit");
ObjC.import("Quartz");

function run(argv) {
  const [pdfPath, pageStr, outPath, scaleStr] = argv;
  const scale = parseFloat(scaleStr || "3");
  const doc = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(pdfPath));
  if (!doc || doc.isNil()) return "cannot open " + pdfPath;
  const page = doc.pageAtIndex(parseInt(pageStr, 10) - 1);
  const box = page.boundsForBox($.kPDFDisplayBoxMediaBox);
  const w = Math.round(box.size.width * scale), h = Math.round(box.size.height * scale);

  const rep = $.NSBitmapImageRep.alloc.initWithBitmapDataPlanesPixelsWidePixelsHighBitsPerSampleSamplesPerPixelHasAlphaIsPlanarColorSpaceNameBytesPerRowBitsPerPixel(
    null, w, h, 8, 4, true, false, $.NSDeviceRGBColorSpace, 0, 0);
  const ctx = $.NSGraphicsContext.graphicsContextWithBitmapImageRep(rep);
  $.NSGraphicsContext.saveGraphicsState;
  $.NSGraphicsContext.setCurrentContext(ctx);
  $.NSColor.whiteColor.setFill;
  $.NSRectFill($.NSMakeRect(0, 0, w, h));
  const cg = ctx.CGContext;
  $.CGContextScaleCTM(cg, scale, scale);
  page.drawWithBoxToContext($.kPDFDisplayBoxMediaBox, cg);
  $.NSGraphicsContext.restoreGraphicsState;

  const png = rep.representationUsingTypeProperties($.NSBitmapImageFileTypePNG, $({}));
  png.writeToFileAtomically(outPath, true);
  return "ok " + w + "x" + h;
}

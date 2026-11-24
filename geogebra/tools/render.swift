// render manifest.json out.mp4
// Draws each GeoGebra screenshot with an animated cursor, click rings and a caption band, adds the voice clips.
import Foundation
import AVFoundation
import CoreGraphics
import CoreText
import ImageIO

struct Card: Decodable { let title: String; let sub: String }
struct Frame: Decodable {
  let image: String?; let dur: Double
  let cur: [Double]?; let from: [Double]?; let click: String?
  let cap: String?; let chap: String?; let card: Card?
  let ring: [Double]?   // [x, y, w, h] highlight box in CSS px
  let mv: Double?       // seconds the cursor takes to move
}
struct Clip: Decodable { let file: String; let start: Double }
struct Manifest: Decodable { let frames: [Frame]; let audio: [Clip]; let css: [Double] }

let args = CommandLine.arguments
let man = try! JSONDecoder().decode(Manifest.self, from: Data(contentsOf: URL(fileURLWithPath: args[1])))
let out = URL(fileURLWithPath: args[2]), tmp = URL(fileURLWithPath: args[2] + ".v.mov")
try? FileManager.default.removeItem(at: out); try? FileManager.default.removeItem(at: tmp)

let W = 1920, H = 1080, BAND = 130.0
let k = Double(W) / man.css[0]               // CSS px -> video px
let contentH = man.css[1] * k
let fps = 30.0
let writer = try! AVAssetWriter(outputURL: tmp, fileType: .mov)
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: W, AVVideoHeightKey: H,
  AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 3_000_000, AVVideoMaxKeyFrameIntervalKey: 150, AVVideoAllowFrameReorderingKey: false,
    AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel]])
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB, kCVPixelBufferWidthKey as String: W, kCVPixelBufferHeightKey as String: H])
writer.add(input); writer.startWriting(); writer.startSession(atSourceTime: .zero)

let rgb = CGColorSpaceCreateDeviceRGB()
func col(_ hex: UInt32, _ a: CGFloat = 1) -> CGColor {
  CGColor(red: CGFloat((hex >> 16) & 255) / 255, green: CGFloat((hex >> 8) & 255) / 255, blue: CGFloat(hex & 255) / 255, alpha: a)
}
let NAVY = col(0x00478e), GOLD = col(0xddaf71), INK = col(0x1b2430), WHITE = col(0xffffff), ORANGE = col(0xe8590c)

var cache: [String: CGImage] = [:]
func image(_ p: String) -> CGImage {
  if let c = cache[p] { return c }
  let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: p) as CFURL, nil)!
  let img = CGImageSourceCreateImageAtIndex(src, 0, nil)!
  cache = [p: img]   // keep only the latest one
  return img
}

func font(_ name: String, _ size: CGFloat) -> CTFont { CTFontCreateWithName(name as CFString, size, nil) }
// draws text wrapped inside rect (CG coordinates, origin bottom-left); returns nothing
func text(_ ctx: CGContext, _ s: String, _ f: CTFont, _ c: CGColor, _ rect: CGRect, center: Bool = false) {
  var align: CTTextAlignment = center ? .center : .left
  let ps = withUnsafeBytes(of: &align) { ptr in
    CTParagraphStyleCreate([CTParagraphStyleSetting(spec: .alignment, valueSize: MemoryLayout<CTTextAlignment>.size, value: ptr.baseAddress!)], 1)
  }
  let attr = NSAttributedString(string: s, attributes: [
    NSAttributedString.Key(kCTFontAttributeName as String): f,
    NSAttributedString.Key(kCTForegroundColorAttributeName as String): c,
    NSAttributedString.Key(kCTParagraphStyleAttributeName as String): ps])
  let fs = CTFramesetterCreateWithAttributedString(attr)
  // vertically centre the text block inside rect
  let size = CTFramesetterSuggestFrameSizeWithConstraints(fs, CFRange(location: 0, length: 0), nil, CGSize(width: rect.width, height: .greatestFiniteMagnitude), nil)
  let r = CGRect(x: rect.minX, y: rect.midY - size.height / 2, width: rect.width, height: ceil(size.height) + 2)
  let frame = CTFramesetterCreateFrame(fs, CFRange(location: 0, length: 0), CGPath(rect: r, transform: nil), nil)
  CTFrameDraw(frame, ctx)
}

func cursorPath(_ x: CGFloat, _ y: CGFloat) -> CGPath {
  // classic arrow, tip at (x, y), CG coords (y up), scaled
  let s: CGFloat = 1.5
  let pts: [(CGFloat, CGFloat)] = [(0, 0), (0, -17), (4, -13), (7, -20), (10, -19), (7, -12), (12, -12)]
  let p = CGMutablePath()
  p.move(to: CGPoint(x: x, y: y))
  for (dx, dy) in pts.dropFirst() { p.addLine(to: CGPoint(x: x + dx * s, y: y + dy * s)) }
  p.closeSubpath()
  return p
}

func draw(_ f: Frame, _ t: Double) -> CVPixelBuffer {
  var pb: CVPixelBuffer?
  CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &pb)
  CVPixelBufferLockBaseAddress(pb!, [])
  let ctx = CGContext(data: CVPixelBufferGetBaseAddress(pb!), width: W, height: H, bitsPerComponent: 8,
    bytesPerRow: CVPixelBufferGetBytesPerRow(pb!), space: rgb, bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)!
  ctx.interpolationQuality = .high
  ctx.setShouldAntialias(true)
  if let c = f.card {
    ctx.setFillColor(NAVY); ctx.fill(CGRect(x: 0, y: 0, width: W, height: H))
    ctx.setFillColor(GOLD); ctx.fill(CGRect(x: 0, y: H - 14, width: W, height: 14))
    text(ctx, c.title, font("Georgia-Bold", 92), WHITE, CGRect(x: 160, y: 560, width: 1600, height: 200), center: true)
    text(ctx, c.sub, font("HelveticaNeue", 46), GOLD, CGRect(x: 160, y: 380, width: 1600, height: 160), center: true)
  } else {
    ctx.setFillColor(WHITE); ctx.fill(CGRect(x: 0, y: 0, width: W, height: H))
    let img = image(f.image!)
    ctx.draw(img, in: CGRect(x: 0, y: Double(H) - contentH, width: Double(W), height: contentH))
    // highlight box
    if let r = f.ring {
      let rect = CGRect(x: r[0] * k, y: Double(H) - (r[1] + r[3]) * k, width: r[2] * k, height: r[3] * k).insetBy(dx: -6, dy: -6)
      ctx.setStrokeColor(ORANGE); ctx.setLineWidth(5)
      ctx.addPath(CGPath(roundedRect: rect, cornerWidth: 10, cornerHeight: 10, transform: nil)); ctx.strokePath()
    }
    // caption band
    ctx.setFillColor(INK); ctx.fill(CGRect(x: 0, y: 0, width: Double(W), height: BAND))
    ctx.setFillColor(GOLD); ctx.fill(CGRect(x: 0, y: BAND, width: Double(W), height: 4))
    if let ch = f.chap { text(ctx, ch.uppercased(), font("HelveticaNeue-Bold", 24), GOLD, CGRect(x: 40, y: 82, width: 1840, height: 36)) }
    if let cap = f.cap { text(ctx, cap, font("HelveticaNeue-Medium", 38), WHITE, CGRect(x: 40, y: 10, width: 1840, height: 78)) }
    // cursor: moves from `from` to `cur` during the first 0.6 s, then the click ring
    if let c = f.cur {
      var x = c[0], y = c[1]
      let move = f.mv ?? 0.6
      if let fr = f.from {
        let u = min(1, t / move), e = u < 0.5 ? 2 * u * u : 1 - pow(-2 * u + 2, 2) / 2
        x = fr[0] + (c[0] - fr[0]) * e; y = fr[1] + (c[1] - fr[1]) * e
      }
      let X = CGFloat(x * k), Y = CGFloat(Double(H) - y * k)
      if let click = f.click {
        let t0 = f.from == nil ? 0.0 : (f.mv ?? 0.6)
        let u = (t - t0) / 0.45
        if u >= 0 && u <= 1 {
          let r = CGFloat(12 + 30 * u)
          ctx.setStrokeColor(click == "right" ? col(0x0072b2, CGFloat(1 - u)) : col(0xe8590c, CGFloat(1 - u)))
          ctx.setLineWidth(6); ctx.strokeEllipse(in: CGRect(x: X - r, y: Y - r, width: 2 * r, height: 2 * r))
        }
      }
      ctx.addPath(cursorPath(X, Y)); ctx.setFillColor(col(0x111111)); ctx.fillPath()
      ctx.addPath(cursorPath(X, Y)); ctx.setStrokeColor(WHITE); ctx.setLineWidth(2.5); ctx.strokePath()
    }
  }
  CVPixelBufferUnlockBaseAddress(pb!, [])
  return pb!
}

var t = 0.0
var lastAt = -1.0
func append(_ pb: CVPixelBuffer, _ at: Double) {
  while !input.isReadyForMoreMediaData { usleep(1000) }
  let ok = adaptor.append(pb, withPresentationTime: CMTime(value: CMTimeValue((at * 600).rounded()), timescale: 600))
  if !ok { print("append failed at", at, writer.error as Any); exit(1) }
  lastAt = at
}
var lastPB: CVPixelBuffer?
for f in man.frames {
  let animated = f.from != nil || f.click != nil
  if animated {
    let n = max(1, Int((f.dur * fps).rounded()))
    let animN = min(n, Int(((f.from != nil ? (f.mv ?? 0.6) : 0) + 0.5) * fps))
    for i in 0..<animN { let pb = draw(f, Double(i) / fps); append(pb, t + Double(i) / fps); lastPB = pb }
    if animN < n { let pb = draw(f, 99); append(pb, t + Double(animN) / fps); lastPB = pb }
  } else {
    let pb = draw(f, 0); append(pb, t); lastPB = pb
  }
  t += f.dur
}
append(lastPB!, t)
input.markAsFinished()
writer.endSession(atSourceTime: CMTime(value: CMTimeValue((t * 600).rounded()), timescale: 600))
let sem = DispatchSemaphore(value: 0)
writer.finishWriting { sem.signal() }; sem.wait()

let comp = AVMutableComposition()
let video = AVURLAsset(url: tmp)
let vt = comp.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid)!
try! vt.insertTimeRange(CMTimeRange(start: .zero, duration: video.duration), of: video.tracks(withMediaType: .video)[0], at: .zero)
let at = comp.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid)!
for c in man.audio {
  let a = AVURLAsset(url: URL(fileURLWithPath: c.file))
  // inserting past the end of the track would close the gap, so fill the silence first
  var start = CMTime(seconds: c.start, preferredTimescale: 600)
  let end = at.timeRange.end
  if start > end { at.insertEmptyTimeRange(CMTimeRange(start: end, end: start)) } else { start = end }
  try! at.insertTimeRange(CMTimeRange(start: .zero, duration: a.duration), of: a.tracks(withMediaType: .audio)[0], at: start)
}
let ex = AVAssetExportSession(asset: comp, presetName: AVAssetExportPresetPassthrough)!
ex.outputURL = out; ex.outputFileType = .mp4; ex.shouldOptimizeForNetworkUse = true
ex.exportAsynchronously { sem.signal() }; sem.wait()
if ex.status != .completed { print("export failed:", ex.error as Any); exit(1) }
try? FileManager.default.removeItem(at: tmp)
print("ok", out.path, String(format: "%.1f s", t))

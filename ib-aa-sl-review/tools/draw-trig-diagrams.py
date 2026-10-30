"""Draws the unit-circle diagrams used in the trigonometry theory.
Run from the project folder: python3 tools/draw-trig-diagrams.py
Writes site/content/topics/geometry-trigonometry/img/unit-circle-signs.svg and other-solutions.svg."""
import os
from math import cos, sin, radians

OUT = os.path.join(os.path.dirname(__file__), "..", "site", "content", "topics", "geometry-trigonometry", "img")
NAVY, INK, GOLD, GREEN, RED, MUTED, CREAM = "#00478e", "#14304f", "#c19355", "#23895c", "#b9472f", "#8a97a8", "#f7f4ed"
SANS = "'Nunito Sans', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"
SERIF = "'Source Serif 4', Georgia, 'Times New Roman', serif"
CX, CY, R = 320, 240, 160


def t(x, y, s, size=20, anchor="middle", fill=INK, weight=700, family=SANS, style="normal"):
    return (f'<text x="{x:.1f}" y="{y:.1f}" font-family="{family}" font-size="{size}" font-weight="{weight}" '
            f'font-style="{style}" text-anchor="{anchor}" fill="{fill}">{s}</text>')


def frac(x, y, num, den, size=20):
    return (t(x, y - 6, num, size, family=SERIF, weight=600) +
            f'<line x1="{x - 11}" y1="{y}" x2="{x + 11}" y2="{y}" stroke="{INK}" stroke-width="1.6"/>' +
            t(x, y + size - 1, den, size, family=SERIF, weight=600))


def frame():
    """Background, unit circle, x and y axes, the angles where the circle meets the axes, quadrant numerals."""
    s = [f'<rect width="640" height="480" rx="18" fill="{CREAM}"/>',
         f'<defs><marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">'
         f'<path d="M0 0 L10 5 L0 10 z" fill="{INK}"/></marker></defs>',
         f'<circle cx="{CX}" cy="{CY}" r="{R}" fill="#fff" stroke="{NAVY}" stroke-width="3"/>',
         f'<line x1="60" y1="{CY}" x2="595" y2="{CY}" stroke="{INK}" stroke-width="2.2" marker-end="url(#ar)"/>',
         f'<line x1="{CX}" y1="462" x2="{CX}" y2="22" stroke="{INK}" stroke-width="2.2" marker-end="url(#ar)"/>',
         t(604, CY + 6, "x", 20, "start", INK, 600, SERIF, "italic"),
         t(CX + 10, 24, "y", 20, "start", INK, 600, SERIF, "italic")]
    for (x, y) in [(CX + R, CY), (CX, CY - R), (CX - R, CY), (CX, CY + R)]:
        s.append(f'<circle cx="{x}" cy="{y}" r="5" fill="{NAVY}"/>')
    s += [t(CX + R + 12, CY - 12, "0", 20, "start", INK, 600, SERIF),
          t(CX + R + 12, CY + 28, "2π", 20, "start", INK, 600, SERIF),
          frac(CX + 28, CY - R - 20, "π", "2"),
          t(CX - R - 12, CY - 12, "π", 20, "end", INK, 600, SERIF),
          frac(CX + 32, CY + R + 26, "3π", "2")]
    for (x, y, n) in [(530, 72, "I"), (110, 72, "II"), (110, 428, "III"), (530, 428, "IV")]:
        s.append(t(x, y, n, 26, "middle", MUTED, 800, SERIF))
    return s


def svg(body, title, desc):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" role="img" aria-labelledby="t d">'
            f'<title id="t">{title}</title><desc id="d">{desc}</desc>' + "".join(body) + "</svg>\n")


def write(name, text):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        f.write(text)


# ---------- 1. Signs of sin, cos and tan in each quadrant ----------
def sign_line(x, y, fn, plus):
    c, sym = (GREEN, "+") if plus else (RED, "−")
    return (f'<text x="{x}" y="{y}" font-family="{SANS}" font-size="21" font-weight="800" text-anchor="middle" fill="{INK}">'
            f'{fn} <tspan fill="{c}" font-weight="900">{sym}</tspan></text>')


b = frame()
# quadrant: (column x, first row y, signs of sin, cos, tan)
for x, y0, (sp, cp, tp) in [(CX + 72, 150, (1, 1, 1)), (CX - 72, 150, (1, 0, 0)), (CX - 72, 282, (0, 0, 1)), (CX + 72, 282, (0, 1, 0))]:
    b += [sign_line(x, y0, "sin", sp), sign_line(x, y0 + 26, "cos", cp), sign_line(x, y0 + 52, "tan", tp)]
write("unit-circle-signs.svg", svg(b, "Signs of sin, cos and tan in each quadrant",
      "Unit circle on x and y axes. Quadrant I: sin, cos, tan positive. Quadrant II: sin positive, cos and tan negative. "
      "Quadrant III: tan positive, sin and cos negative. Quadrant IV: cos positive, sin and tan negative. "
      "The circle meets the axes at 0 or 2π, π/2, π and 3π/2."))

# ---------- 2. The other solutions: the same angle θ from the x-axis in every quadrant ----------
TH = 35
b = frame()
for a in (TH, 180 - TH, 180 + TH, 360 - TH):
    px, py = CX + R * cos(radians(a)), CY - R * sin(radians(a))
    b.append(f'<line x1="{CX}" y1="{CY}" x2="{px:.1f}" y2="{py:.1f}" stroke="{GOLD}" stroke-width="3"/>')
    b.append(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="6" fill="{GOLD}" stroke="#fff" stroke-width="2"/>')
r = 46
# (arc start, start angle, end angle, SVG sweep flag)
for (sx, sy), a0, a1, sweep in [((CX + r, CY), 0, TH, 0), ((CX - r, CY), 180, 180 - TH, 1),
                                ((CX - r, CY), 180, 180 + TH, 0), ((CX + r, CY), 0, -TH, 1)]:
    ex, ey = CX + r * cos(radians(a1)), CY - r * sin(radians(a1))
    b.append(f'<path d="M{sx} {sy} A{r} {r} 0 0 {sweep} {ex:.1f} {ey:.1f}" fill="none" stroke="{GOLD}" stroke-width="2.4"/>')
    mid = (a0 + a1) / 2
    b.append(t(CX + 66 * cos(radians(mid)), CY - 66 * sin(radians(mid)) + 6, "θ", 19, "middle", GOLD, 700, SERIF, "italic"))
for x, y, anc, rad, deg in [(478, 122, "start", "θ", ""), (162, 122, "end", "π − θ", "180° − θ"),
                            (162, 368, "end", "π + θ", "180° + θ"), (478, 368, "start", "2π − θ", "360° − θ")]:
    b.append(t(x, y, rad, 26, anc, NAVY, 700, SERIF, "italic"))
    if deg:
        b.append(t(x, y + 24, deg, 16, anc, INK, 600, SANS))
write("other-solutions.svg", svg(b, "Finding the other solutions of a trig equation",
      "Unit circle with the same angle θ marked from the x-axis in every quadrant. Quadrant I: θ. Quadrant II: π − θ (180° − θ). "
      "Quadrant III: π + θ (180° + θ). Quadrant IV: 2π − θ (360° − θ)."))
print("ok")

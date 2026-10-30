# Geometry and trigonometry

:::note What this topic covers
- Right-angled trigonometry; angles of elevation and depression.
- 3D: distance and midpoint; volume and surface area of solids; angles between lines and between a line and a plane.
- Sine rule (and the ambiguous case), cosine rule, area of a triangle.
- Radians, arc length and sector area; the unit circle; exact values.
- $\tan\theta = \dfrac{\sin\theta}{\cos\theta}$ and the Pythagorean identity.
- Trigonometric equations; graphs of trigonometric functions, their transformations and models.
:::

## Key terms

| Term | Meaning |
|---|---|
| **Angle of elevation / depression** | Angle measured up / down from the **horizontal**. |
| **Radian** | The angle at the centre of a circle subtended by an arc equal to the radius. $\pi \text{ rad} = 180^\circ$. |
| **Unit circle** | Circle of radius $1$ centred at the origin. The point at angle $\theta$ is $(\cos\theta,\ \sin\theta)$. |
| **Amplitude** | Half the distance between maximum and minimum. |
| **Period** | The length of one complete cycle. |
| **Principal axis** | The horizontal line midway between maximum and minimum. |

## 1. Right-angled trigonometry

:::formula memorize SOH CAH TOA
$$\sin\theta = \dfrac{\text{opp}}{\text{hyp}} \qquad \cos\theta = \dfrac{\text{adj}}{\text{hyp}} \qquad \tan\theta = \dfrac{\text{opp}}{\text{adj}}$$
:::

:::example Worked example 1 — angle of elevation
**Question.** From a point $50$ m from the base of a tower, the angle of elevation of the top is $32^\circ$. Find the height of the tower.

+++

$h = 50\tan 32^\circ \approx 31.2$ m.
:::

## 2. Geometry in 3D

:::formula booklet Distance and midpoint in 3D
$$d = \sqrt{(x_1 - x_2)^2 + (y_1 - y_2)^2 + (z_1 - z_2)^2} \qquad \left(\dfrac{x_1 + x_2}{2},\ \dfrac{y_1 + y_2}{2},\ \dfrac{z_1 + z_2}{2}\right)$$
:::

:::formula booklet Volumes and surface areas
| Solid | Volume | Surface area |
|---|---|---|
| Right pyramid | $V = \dfrac{1}{3}Ah$ | add the areas of the faces |
| Right cone | $V = \dfrac{1}{3}\pi r^2 h$ | curved surface $A = \pi r l$ ($l$ = slant height) |
| Sphere | $V = \dfrac{4}{3}\pi r^3$ | $A = 4\pi r^2$ |

Also in the booklet (prior learning): cuboid, cylinder, prism, curved surface of a cylinder $2\pi r h$.
:::

:::formula memorize Hemisphere (half a sphere)
$$V = \dfrac{2}{3}\pi r^3 \qquad \text{curved surface} = 2\pi r^2 \qquad \text{total surface (with the flat circle)} = 3\pi r^2$$
:::

:::example Worked example 2 — cone
**Question.** A cone has radius $4$ cm and height $9$ cm. Find its volume and total surface area.

+++

$V = \dfrac{1}{3}\pi(4)^2(9) = 48\pi \approx 151$ cm$^3$.

Slant height $l = \sqrt{4^2 + 9^2} = \sqrt{97}$. Total surface $= \pi(4)\sqrt{97} + \pi(4)^2 \approx 174$ cm$^2$.
:::

**Angles in 3D.** Find a right-angled triangle that contains the angle. The angle between a line and a plane is the angle between the line and its **projection** onto the plane.

:::example Worked example 3 — angle between a line and a plane
**Question.** A cuboid has a base $6$ cm by $8$ cm and height $5$ cm. Find the angle between a space diagonal and the base.

+++

Diagonal of the base: $\sqrt{6^2 + 8^2} = 10$. In the right-angled triangle (base diagonal, height):
$$\tan\theta = \dfrac{5}{10} \ \Rightarrow\ \theta \approx 26.6^\circ$$
:::

## 3. Non-right-angled triangles

:::formula booklet Sine rule, cosine rule, area
$$\dfrac{a}{\sin A} = \dfrac{b}{\sin B} = \dfrac{c}{\sin C}$$
$$c^2 = a^2 + b^2 - 2ab\cos C \qquad \cos C = \dfrac{a^2 + b^2 - c^2}{2ab}$$
$$A = \dfrac{1}{2}ab\sin C$$
:::

| You know | Use |
|---|---|
| Two angles and a side, or two sides and a non-included angle | Sine rule |
| Two sides and the included angle, or all three sides | Cosine rule |

:::example Worked example 4 — sine rule
**Question.** In triangle ABC, $A = 40^\circ$, $B = 65^\circ$ and $a = 12$. Find $b$.

+++

$$\dfrac{b}{\sin 65^\circ} = \dfrac{12}{\sin 40^\circ} \ \Rightarrow\ b = \dfrac{12\sin 65^\circ}{\sin 40^\circ} \approx 16.9$$
:::

:::example Worked example 5 — cosine rule and area
**Question.** $a = 7$, $b = 9$, $C = 50^\circ$. Find $c$ and the area of the triangle.

+++

$c^2 = 49 + 81 - 2(7)(9)\cos 50^\circ \approx 49.0 \Rightarrow c \approx 7.00$.

Area $= \dfrac{1}{2}(7)(9)\sin 50^\circ \approx 24.1$.
:::

**The ambiguous case.** When you use the sine rule to find an **angle**, $\sin B = k$ has two solutions between $0^\circ$ and $180^\circ$: $B$ and $180^\circ - B$. Both are valid if the angles of the triangle still add to less than $180^\circ$.

:::example Worked example 6 — ambiguous case
**Question.** In triangle ABC, $a = 8$, $b = 10$ and $A = 35^\circ$. Find the possible values of $B$.

+++

$$\sin B = \dfrac{10\sin 35^\circ}{8} \approx 0.717 \ \Rightarrow\ B \approx 45.8^\circ \ \text{or}\ B \approx 180^\circ - 45.8^\circ = 134.2^\circ$$
Check: $35^\circ + 134.2^\circ < 180^\circ$, so **both** triangles exist.
:::

## 4. Radians, arcs and sectors

$\pi \text{ rad} = 180^\circ$. To convert degrees to radians multiply by $\dfrac{\pi}{180}$; e.g. $150^\circ = \dfrac{5\pi}{6}$.

:::formula booklet Arc length and sector area ($\theta$ in radians)
$$l = r\theta \qquad A = \dfrac{1}{2}r^2\theta$$
:::

:::example Worked example 7 — arc and sector
**Question.** A sector has radius $6$ cm and angle $1.2$ radians. Find the arc length, the perimeter and the area.

+++

Arc $= 6(1.2) = 7.2$ cm. Perimeter $= 7.2 + 6 + 6 = 19.2$ cm. Area $= \dfrac{1}{2}(36)(1.2) = 21.6$ cm$^2$.
:::

## 5. The unit circle and identities

- On the unit circle, the point at angle $\theta$ is $(\cos\theta,\ \sin\theta)$.
- **Signs in each quadrant:**

![Unit circle on the x and y axes. Quadrant I: sin, cos and tan positive. Quadrant II: only sin positive. Quadrant III: only tan positive. Quadrant IV: only cos positive. The circle meets the axes at 0 or 2π, π/2, π and 3π/2.](content/topics/geometry-trigonometry/img/unit-circle-signs.svg)

  $\tan\theta = \dfrac{\sin\theta}{\cos\theta}$, so $\tan$ is positive where $\sin$ and $\cos$ have the same sign (I and III).
- **Symmetry:** $\sin(\pi - \theta) = \sin\theta$, $\cos(-\theta) = \cos\theta$, $\cos(2\pi - \theta) = \cos\theta$.

:::formula booklet Identities
$$\tan\theta = \dfrac{\sin\theta}{\cos\theta} \qquad \cos^2\theta + \sin^2\theta = 1$$
(The double-angle identities are also in the booklet, but they are not part of this mock.)
:::

:::formula memorize Exact values
| $\theta$ | $0$ | $\dfrac{\pi}{6}$ | $\dfrac{\pi}{4}$ | $\dfrac{\pi}{3}$ | $\dfrac{\pi}{2}$ |
|---|---|---|---|---|---|
| $\sin\theta$ | $0$ | $\dfrac{1}{2}$ | $\dfrac{\sqrt{2}}{2}$ | $\dfrac{\sqrt{3}}{2}$ | $1$ |
| $\cos\theta$ | $1$ | $\dfrac{\sqrt{3}}{2}$ | $\dfrac{\sqrt{2}}{2}$ | $\dfrac{1}{2}$ | $0$ |
| $\tan\theta$ | $0$ | $\dfrac{\sqrt{3}}{3}$ | $1$ | $\sqrt{3}$ | undefined |

Use the unit circle to get their multiples, e.g. $\cos\dfrac{2\pi}{3} = -\dfrac{1}{2}$.
:::

:::example Worked example 8 — using the identity
**Question.** $\sin\theta = \dfrac{3}{5}$ and $\theta$ is obtuse. Find $\cos\theta$ and $\tan\theta$.

+++

$\cos^2\theta = 1 - \dfrac{9}{25} = \dfrac{16}{25}$. $\theta$ is obtuse, so $\cos\theta < 0$: $\cos\theta = -\dfrac{4}{5}$, and $\tan\theta = \dfrac{3}{5} \div \left(-\dfrac{4}{5}\right) = -\dfrac{3}{4}$.
:::

## 6. Trigonometric equations

1. Isolate the trig function.
2. Find the first solution (exact values or GDC).
3. Use the unit circle / symmetry to find **all** solutions in the given interval. If the angle is $2x$, extend the interval for $2x$ first.

### Finding the other solutions

![Unit circle with the same angle θ measured from the x-axis in every quadrant. Quadrant I: θ. Quadrant II: π − θ (180° − θ). Quadrant III: π + θ (180° + θ). Quadrant IV: 2π − θ (360° − θ).](content/topics/geometry-trigonometry/img/other-solutions.svg)

1. Find $\theta$, the angle in quadrant I, with the value **without its sign** (exact values or $\sin^{-1}$, $\cos^{-1}$, $\tan^{-1}$ on the GDC).
2. Use the **sign** to choose the quadrants (diagram in section 5).
3. Write the angle for each quadrant with the diagram above.
4. Add or subtract $2\pi$ ($360^\circ$) until you have every solution in the interval.

**Example:** $\cos x = -\dfrac{1}{2}$, $0 \leq x \leq 2\pi$. Without the sign, $\cos\theta = \dfrac{1}{2}$ gives $\theta = \dfrac{\pi}{3}$. $\cos$ is negative in II and III: $x = \pi - \dfrac{\pi}{3} = \dfrac{2\pi}{3}$ or $x = \pi + \dfrac{\pi}{3} = \dfrac{4\pi}{3}$.

:::example Worked example 9 — without a calculator
**Question.** Solve $2\cos^2 x - \cos x - 1 = 0$ for $0 \leq x \leq 2\pi$.

+++

$(2\cos x + 1)(\cos x - 1) = 0$.

$\cos x = -\dfrac{1}{2} \Rightarrow x = \dfrac{2\pi}{3},\ \dfrac{4\pi}{3}$. $\quad \cos x = 1 \Rightarrow x = 0,\ 2\pi$.
:::

:::example Worked example 10 — with a calculator
**Question.** Solve $3\sin 2x = 1$ for $0 \leq x \leq \pi$.

+++

$\sin 2x = \dfrac{1}{3}$, with $0 \leq 2x \leq 2\pi$:
$2x \approx 0.3398$ or $2x \approx \pi - 0.3398 = 2.8018$, so $x \approx 0.170$ or $x \approx 1.40$.
:::

## 7. Trigonometric functions and models

| | $y = \sin x$ | $y = \cos x$ | $y = \tan x$ |
|---|---|---|---|
| Domain | all real $x$ | all real $x$ | $x \neq \dfrac{\pi}{2} + k\pi$ |
| Range | $-1 \leq y \leq 1$ | $-1 \leq y \leq 1$ | all real $y$ |
| Period | $2\pi$ | $2\pi$ | $\pi$ |

:::formula memorize $y = a\sin\big(b(x - c)\big) + d$
- Amplitude $= \lvert a\rvert$. Period $= \dfrac{2\pi}{b}$ (or $\dfrac{360^\circ}{b}$).
- Horizontal translation $c$; principal axis $y = d$.
- Maximum $= d + \lvert a\rvert$, minimum $= d - \lvert a\rvert$.
:::

```graph
{
  "expr": "a*sin(b*(x-c))+d",
  "params": { "a": [-4, 4, 2, 0.5], "b": [0.5, 3, 1, 0.5], "c": [-3, 3, 0, 0.25], "d": [-3, 4, 1, 0.5] },
  "x": [-0.5, 12.6], "y": [-6, 8],
  "caption": "y = a sin(b(x − c)) + d. Amplitude |a|, period 2π divided by b, principal axis y = d."
}
```

:::example Worked example 11 — a tide model
**Question.** The depth of water is $h(t) = 2.5\cos\left(\dfrac{\pi t}{6}\right) + 4$ metres, $t$ hours after midnight. Find the amplitude, the period, and the maximum and minimum depths.

+++

Amplitude $2.5$ m. Period $= \dfrac{2\pi}{\frac{\pi}{6}} = 12$ hours. Maximum $4 + 2.5 = 6.5$ m, minimum $4 - 2.5 = 1.5$ m.
:::

## Common mistakes

:::mistake Common mistakes
- **Calculator in the wrong angle mode.** Degrees for triangles given in degrees; **radians** for arcs, sectors and trig functions of $x$.
- **Missing solutions** of trig equations. Check every quadrant and the full interval (and extend the interval for $2x$).
- **Ignoring the ambiguous case** when the sine rule is used to find an angle.
- **Cosine rule order of operations.** Calculate $2ab\cos C$ before subtracting.
- **Arc / sector formulas with degrees.** $l = r\theta$ only works with $\theta$ in radians.
- **Sign of $\cos$ or $\tan$ for obtuse angles** — they are negative.
:::

## Exam tips

:::tip Exam tips
- **Paper 1:** exact values, trig equations with the unit circle, identities, arcs and sectors in terms of $\pi$, transformations of trig graphs.
- **Paper 2:** sine and cosine rules, 3D problems, models with decimal answers, trig equations by graph (intersection).
- Draw and label a diagram for every triangle and 3D question.
- Give angles to 3 s.f. in degrees (e.g. $26.6^\circ$) or radians as asked.
:::

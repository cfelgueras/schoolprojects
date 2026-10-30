# Straight lines

:::note What this topic covers
- Pythagoras' theorem and its converse.
- Midpoint of a line segment and the distance between two points.
- Gradient and intercepts; the forms $y = mx + c$, $ax + by + d = 0$ and $y - y_1 = m(x - x_1)$.
- Parallel and perpendicular lines; the perpendicular bisector.
:::

## Key terms

| Term | Meaning |
|---|---|
| **Gradient** ($m$) | The steepness of a line: the change in $y$ for each increase of $1$ in $x$. Positive gradient goes up from left to right. |
| **$y$-intercept** | Where the line meets the $y$-axis: the point $(0,\ c)$. |
| **$x$-intercept** | Where the line meets the $x$-axis: put $y = 0$. |
| **Parallel lines** | Lines with the same gradient. They never meet. |
| **Perpendicular lines** | Lines that meet at a right angle. |
| **Midpoint** | The point exactly halfway between two points. |
| **Perpendicular bisector** of $[\text{AB}]$ | The line through the midpoint of $[\text{AB}]$ that is perpendicular to $[\text{AB}]$. Every point on it is the same distance from A and from B. |

## 1. Pythagoras' theorem and its converse

:::formula memorize Pythagoras' theorem
In a right-angled triangle with hypotenuse $c$:
$$a^2 + b^2 = c^2$$
**Converse:** if the sides of a triangle satisfy $a^2 + b^2 = c^2$, then the triangle is right-angled (the right angle is opposite $c$).
:::

## 2. Distance and midpoint

:::formula booklet Distance between two points
$$d = \sqrt{(x_1 - x_2)^2 + (y_1 - y_2)^2}$$
This is Pythagoras' theorem with the horizontal and vertical differences as the two shorter sides.
:::

:::formula booklet Midpoint of a line segment
$$\left(\dfrac{x_1 + x_2}{2},\ \dfrac{y_1 + y_2}{2}\right)$$
:::

## 3. Gradient and the equation of a line

:::formula booklet Gradient
$$m = \dfrac{y_2 - y_1}{x_2 - x_1}$$
- Horizontal line ($y = k$): $m = 0$.
- Vertical line ($x = k$): gradient undefined.
:::

:::formula booklet Three forms of the equation of a line
| Form | Equation | Best for |
|---|---|---|
| Gradient-intercept | $y = mx + c$ | Reading the gradient and $y$-intercept |
| General | $ax + by + d = 0$ | Answers "in the form $ax + by + d = 0$" (usually integers) |
| Point-gradient | $y - y_1 = m(x - x_1)$ | Writing the line when you know a point and the gradient |

Some books write $y = mx + b$: it is the same form.
:::

Use the sliders to see what $m$ and $c$ do.

```graph
{
  "expr": "m*x+c",
  "params": { "m": [-4, 4, 1, 0.25], "c": [-6, 6, 2, 0.5] },
  "x": [-8, 8], "y": [-8, 8],
  "points": [["0", "c", "y-intercept"]],
  "caption": "y = mx + c. The gradient m sets the steepness; c is where the line crosses the y-axis."
}
```

:::example Worked example 1 — line through two points
**Question.** Find the equation of the line through $(2,\ -1)$ and $(6,\ 7)$. Give your answer in the form $ax + by + d = 0$.

+++

$$m = \dfrac{7 - (-1)}{6 - 2} = \dfrac{8}{4} = 2$$
Point-gradient form with $(2,\ -1)$:
$$y + 1 = 2(x - 2) \ \Rightarrow\ y = 2x - 5 \ \Rightarrow\ 2x - y - 5 = 0$$
:::

## 4. Parallel and perpendicular lines

:::formula memorize Parallel and perpendicular gradients
- Parallel: $m_1 = m_2$
- Perpendicular: $m_1 \times m_2 = -1$, that is $m_2 = -\dfrac{1}{m_1}$ ("negative reciprocal")
:::

:::example Worked example 2 — perpendicular line through a point
**Question.** Find the equation of the line through $(3,\ 4)$ perpendicular to $2x + 3y - 6 = 0$.

+++

Rearrange to find the gradient: $3y = -2x + 6 \Rightarrow y = -\dfrac{2}{3}x + 2$, so $m_1 = -\dfrac{2}{3}$.

Perpendicular gradient: $m_2 = \dfrac{3}{2}$.
$$y - 4 = \dfrac{3}{2}(x - 3) \ \Rightarrow\ 2y - 8 = 3x - 9 \ \Rightarrow\ 3x - 2y - 1 = 0$$
Check: $(3,\ 4)$ gives $9 - 8 - 1 = 0$ ✓.
:::

## 5. The perpendicular bisector

To find the perpendicular bisector of $[\text{AB}]$:

1. Find the midpoint M of $[\text{AB}]$.
2. Find the gradient of $[\text{AB}]$ and take the negative reciprocal.
3. Write the line through M with that gradient.

:::example Worked example 3 — perpendicular bisector
**Question.** $\text{A}(-1,\ 2)$ and $\text{B}(5,\ 6)$. Find the equation of the perpendicular bisector of $[\text{AB}]$.

+++

Midpoint: $\text{M} = \left(\dfrac{-1 + 5}{2},\ \dfrac{2 + 6}{2}\right) = (2,\ 4)$.

Gradient of $[\text{AB}]$: $\dfrac{6 - 2}{5 - (-1)} = \dfrac{4}{6} = \dfrac{2}{3}$, so the perpendicular gradient is $-\dfrac{3}{2}$.
$$y - 4 = -\dfrac{3}{2}(x - 2) \ \Rightarrow\ y = -\dfrac{3}{2}x + 7 \ \Rightarrow\ 3x + 2y - 14 = 0$$
:::

:::example Worked example 4 — is the triangle right-angled?
**Question.** $\text{P}(1,\ 1)$, $\text{Q}(4,\ 5)$ and $\text{R}(8,\ 2)$. Show that triangle PQR is right-angled.

+++

**Method 1 (converse of Pythagoras).**
$$\text{PQ}^2 = 3^2 + 4^2 = 25, \quad \text{QR}^2 = 4^2 + 3^2 = 25, \quad \text{PR}^2 = 7^2 + 1^2 = 50$$
$\text{PQ}^2 + \text{QR}^2 = 50 = \text{PR}^2$, so the angle at Q is $90^\circ$.

**Method 2 (gradients).** $m_{\text{PQ}} = \dfrac{4}{3}$, $m_{\text{QR}} = \dfrac{-3}{4}$ and $\dfrac{4}{3} \times \left(-\dfrac{3}{4}\right) = -1$, so $\text{PQ} \perp \text{QR}$.
:::

## 6. Where two lines meet

Solve the two equations simultaneously (substitution or elimination). On Paper 2 you can use the GDC.

:::example Worked example 5 — intersection of two lines
**Question.** Find the point where $y = 2x - 5$ meets $x + y = 7$.

+++

Substitute: $x + (2x - 5) = 7 \Rightarrow 3x = 12 \Rightarrow x = 4$, then $y = 2(4) - 5 = 3$. The lines meet at $(4,\ 3)$.
:::

## Common mistakes

:::mistake Common mistakes
- **Mixing the order in the gradient.** Use $\dfrac{y_2 - y_1}{x_2 - x_1}$ with the same point first on top and bottom.
- **Perpendicular gradient with the wrong sign.** The negative reciprocal of $-\dfrac{2}{3}$ is $+\dfrac{3}{2}$.
- **Reading the gradient from the general form without rearranging.** In $2x + 3y - 6 = 0$ the gradient is $-\dfrac{2}{3}$, not $2$.
- **Naming the line instead of writing an equation.** Write $y = 3x + 26$, not $L = 3x + 26$ (the markscheme does not accept it).
- **General form not in the required form.** If the question says "$ax + by + d = 0$ where $a, b, d \in \mathbb{Z}$", clear the fractions.
- **Vertical lines.** A line parallel to the $y$-axis is $x = k$; it has no gradient.
:::

## Exam tips

:::tip Exam tips
- This topic is almost always **Paper 1**: exact fractions, no calculator.
- In multi-part questions the line from part (a) is reused in part (b) — e.g. "the line $L$ passes through $(k,\ 2)$, find $k$": substitute the point into your equation.
- A perpendicular bisector question earns marks for the **midpoint**, the **perpendicular gradient** and the **equation** — show all three.
- Draw a quick sketch: it catches sign errors in gradients.
:::

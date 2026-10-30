# Quadratic functions, equations & inequalities

:::note What this topic covers (SL 2.6 – 2.7)
- The quadratic function $f(x) = ax^2 + bx + c$ and its graph: $y$-intercept, axis of symmetry, vertex.
- The three forms of a quadratic and how to move between them.
- Solving quadratic **equations**: factorising, the quadratic formula, technology.
- Solving quadratic **inequalities**.
- The **discriminant** $\Delta = b^2 - 4ac$ and the nature of the roots.
:::

## Key terms

| Term | Meaning |
|---|---|
| **Quadratic function** | A function $f(x) = ax^2 + bx + c$ with $a \neq 0$. Its graph is a **parabola**. |
| **Vertex** | The turning point of the parabola: the minimum point if $a > 0$, the maximum point if $a < 0$. |
| **Axis of symmetry** | The vertical line through the vertex. The parabola is a mirror image on each side of it. |
| **Roots / zeros** | The solutions of $f(x) = 0$. On the graph they are the $x$-intercepts. |
| **$y$-intercept** | The point where the graph meets the $y$-axis, $(0, c)$. |
| **Discriminant** | $\Delta = b^2 - 4ac$. Its sign tells you how many real roots there are. |

## 1. The shape of the graph

The sign of $a$ decides which way the parabola opens:

- $a > 0$: opens **upwards** ("smile"), the vertex is a **minimum**.
- $a < 0$: opens **downwards** ("frown"), the vertex is a **maximum**.

The larger $|a|$ is, the narrower the parabola. Use the sliders to explore the vertex form.

```graph
{
  "expr": "a*(x-h)^2+k",
  "params": { "a": [-3, 3, 1, 0.25], "h": [-5, 5, 2, 0.5], "k": [-5, 5, -3, 0.5] },
  "x": [-8, 8], "y": [-8, 8],
  "points": [["h", "k", "vertex"]],
  "axis": "h",
  "caption": "y = a(x − h)² + k. The vertex is (h, k) and the axis of symmetry is x = h. Notice that a = 0 is not a parabola."
}
```

## 2. The three forms of a quadratic

Each form makes a different feature of the graph easy to read.

:::formula memorize Standard form
$$f(x) = ax^2 + bx + c$$
- $y$-intercept: $(0,\ c)$.
:::

:::formula booklet Axis of symmetry (from standard form)
$$x = -\dfrac{b}{2a}$$
Substitute this $x$-value back into $f(x)$ to get the $y$-coordinate of the vertex.
:::

:::formula memorize Factorised (intercept) form
$$f(x) = a(x - p)(x - q)$$
- $x$-intercepts: $(p,\ 0)$ and $(q,\ 0)$.
- The axis of symmetry is halfway between the roots: $x = \dfrac{p + q}{2}$.
:::

:::formula memorize Vertex form
$$f(x) = a(x - h)^2 + k$$
- Vertex: $(h,\ k)$. Axis of symmetry: $x = h$.
- Watch the sign: $f(x) = 2(x + 3)^2 - 1$ has vertex $(-3,\ -1)$.
:::

### Finding the vertex from the standard form

1. Find the $x$-coordinate with the axis of symmetry: $h = -\dfrac{b}{2a}$.
2. Substitute it into the function to get the $y$-coordinate: $k = f(h)$.
3. If you need the vertex form, write $f(x) = a(x - h)^2 + k$ with the same $a$.

:::example Worked example 1 — features of a quadratic
**Question.** Let $f(x) = 2x^2 - 12x + 10$. Find the vertex of the graph of $f$, write $f(x)$ in the form $a(x-h)^2 + k$ and in the form $a(x-p)(x-q)$, and state the intercepts.

+++

**Vertex.**
$$h = -\dfrac{b}{2a} = -\dfrac{-12}{2 \times 2} = 3, \qquad k = f(3) = 2(9) - 12(3) + 10 = -8$$
The vertex is $(3,\ -8)$, a minimum because $a = 2 > 0$.

**Vertex form.** Same $a = 2$:
$$f(x) = 2(x - 3)^2 - 8$$

**Factorised form.**
$$f(x) = 2\left(x^2 - 6x + 5\right) = 2(x - 1)(x - 5)$$

**Intercepts.**
- $x$-intercepts $(1,\ 0)$ and $(5,\ 0)$. Check: the axis of symmetry is halfway between them, $\dfrac{1 + 5}{2} = 3$ ✓.
- $y$-intercept $(0,\ 10)$.
:::

```graph
{
  "expr": "2*x^2-12*x+10",
  "x": [-1, 7], "y": [-10, 12],
  "points": [["3", "-8", "vertex (3, −8)"], ["1", "0", "(1, 0)"], ["5", "0", "(5, 0)"], ["0", "10", "(0, 10)"]],
  "axis": "3",
  "caption": "f(x) = 2x² − 12x + 10 = 2(x − 3)² − 8 = 2(x − 1)(x − 5)"
}
```

## 3. Solving quadratic equations

Rearrange to the form $ax^2 + bx + c = 0$ first. Then choose a method:

| Method | Best when… |
|---|---|
| Factorising | The roots are "nice" integers or simple fractions. |
| Quadratic formula | It does not factorise easily (always works). |
| GDC (Paper 2) | Any Paper 2 question — but write down the equation you are solving. |

:::formula booklet Quadratic formula
$$ax^2 + bx + c = 0 \ \Rightarrow\ x = \dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a}, \quad a \neq 0$$
:::

:::example Worked example 2 — the quadratic formula (Paper 1 style)
**Question.** Solve $3x^2 - 2x - 2 = 0$, giving your answers in the form $\dfrac{p \pm \sqrt{q}}{r}$.

+++

$a = 3$, $b = -2$, $c = -2$.
$$x = \dfrac{-(-2) \pm \sqrt{(-2)^2 - 4(3)(-2)}}{2(3)} = \dfrac{2 \pm \sqrt{4 + 24}}{6} = \dfrac{2 \pm \sqrt{28}}{6}$$
Since $\sqrt{28} = 2\sqrt{7}$:
$$x = \dfrac{2 \pm 2\sqrt{7}}{6} = \dfrac{1 \pm \sqrt{7}}{3}$$
:::

## 4. The discriminant and the nature of the roots

:::formula booklet Discriminant
$$\Delta = b^2 - 4ac$$
:::

:::formula memorize Nature of the roots
| Discriminant | Roots of $ax^2 + bx + c = 0$ | Graph of $y = ax^2 + bx + c$ |
|---|---|---|
| $\Delta > 0$ | Two distinct real roots | Crosses the $x$-axis twice |
| $\Delta = 0$ | Two equal real roots (one repeated root) | Touches the $x$-axis at the vertex |
| $\Delta < 0$ | No real roots | Does not meet the $x$-axis |

"Real roots" (with no other word) means $\Delta \geq 0$.
:::

```graph
{
  "expr": "x^2+b*x+c",
  "params": { "b": [-6, 6, 2, 0.5], "c": [-5, 8, 1, 0.5] },
  "x": [-8, 8], "y": [-6, 10],
  "showDiscriminant": true,
  "caption": "y = x² + bx + c. Change b and c and watch the sign of Δ = b² − 4c."
}
```

:::example Worked example 3 — equal roots
**Question.** The equation $x^2 + kx + 9 = 0$ has two equal real roots. Find the possible values of $k$.

+++

Two equal roots $\Rightarrow \Delta = 0$:
$$k^2 - 4(1)(9) = 0 \ \Rightarrow\ k^2 = 36 \ \Rightarrow\ k = 6 \ \text{or}\ k = -6$$
:::

:::example Worked example 4 — no real roots (an inequality in $k$)
**Question.** Find the set of values of $k$ for which $2x^2 + 4x + k = 0$ has no real roots.

+++

No real roots $\Rightarrow \Delta < 0$:
$$4^2 - 4(2)(k) < 0 \ \Rightarrow\ 16 - 8k < 0 \ \Rightarrow\ k > 2$$
:::

:::example Worked example 5 — a line tangent to a parabola
**Question.** The line $y = mx - 1$ is a tangent to the curve $y = x^2 + 3$. Find the possible values of $m$.

+++

At the intersection: $x^2 + 3 = mx - 1$, so $x^2 - mx + 4 = 0$.

A tangent meets the curve at exactly one point, so this equation has two equal roots:
$$\Delta = (-m)^2 - 4(1)(4) = 0 \ \Rightarrow\ m^2 = 16 \ \Rightarrow\ m = \pm 4$$
:::

## 5. Solving quadratic inequalities

Never divide or "solve like an equation" and stop. Use the graph:

1. Rearrange so one side is $0$: e.g. $ax^2 + bx + c < 0$.
2. Find the roots of $ax^2 + bx + c = 0$ (the **critical values**).
3. Sketch the parabola and read off where it is below ($< 0$) or above ($> 0$) the $x$-axis.

For $a > 0$ with roots $p < q$:

- $ax^2 + bx + c < 0 \iff p < x < q$ (between the roots, one interval).
- $ax^2 + bx + c > 0 \iff x < p$ or $x > q$ (outside the roots, two intervals).

:::example Worked example 6 — a quadratic inequality
**Question.** Solve $x^2 - x - 6 < 0$.

+++

Roots: $x^2 - x - 6 = (x - 3)(x + 2) = 0 \Rightarrow x = -2$ or $x = 3$.

The parabola opens upwards and is **below** the $x$-axis between the roots:
$$-2 < x < 3$$
:::

```graph
{
  "expr": "x^2-x-6",
  "x": [-5, 6], "y": [-8, 8],
  "highlight": "negative",
  "points": [["-2", "0", "−2"], ["3", "0", "3"]],
  "caption": "The highlighted part of the x-axis is where x² − x − 6 < 0, that is −2 < x < 3."
}
```

## 6. Applications of quadratic functions

Many real situations are modelled by a quadratic: the height of a projectile, an area with a fixed perimeter, profit as a function of price. The questions are usually the same three:

| The question asks for… | Use |
|---|---|
| The **maximum** or **minimum** value | The vertex: $x = -\dfrac{b}{2a}$, then substitute (or GDC MAX / MIN) |
| **When** / **where** the quantity equals a value | Solve the quadratic equation |
| **For which values** the quantity is above / below a value | Solve the quadratic inequality |

Always check the answer makes sense in context (e.g. time $t \geq 0$, lengths positive) and give units.

:::example Worked example 7 — maximum area (Paper 1 style)
**Question.** A farmer has $40$ m of fencing to build a rectangular pen against a long wall, so only three sides need fencing. The side perpendicular to the wall is $x$ m. Find the maximum area of the pen.

+++

The side parallel to the wall is $40 - 2x$, so the area is
$$A(x) = x(40 - 2x) = -2x^2 + 40x$$
$a = -2 < 0$, so the vertex is a maximum:
$$x = -\dfrac{40}{2(-2)} = 10, \qquad A(10) = 10(40 - 20) = 200$$
Maximum area $= 200 \text{ m}^2$ (when the pen is $10$ m by $20$ m).
:::

:::example Worked example 8 — a projectile (Paper 2 style)
**Question.** A ball is thrown so that its height after $t$ seconds is $h(t) = -4.9t^2 + 14t + 1.5$ metres. Find the maximum height and the time when the ball hits the ground.

+++

**Maximum height.** GDC (G-Solv MAX) or $t = -\dfrac{14}{2(-4.9)} \approx 1.43$ s, giving $h \approx 11.5$ m.

**Hits the ground.** Solve $-4.9t^2 + 14t + 1.5 = 0$: $t \approx 2.96$ s (reject the negative root, $t \approx -0.103$).
:::

## Common mistakes

:::mistake Common mistakes
- **Wrong sign of the vertex.** $f(x) = (x + 4)^2 - 5$ has vertex $(-4,\ -5)$, not $(4,\ -5)$.
- **Not rearranging first.** In $x^2 = 5x$, do not divide by $x$ (you lose the root $x = 0$). Write $x^2 - 5x = 0 \Rightarrow x(x - 5) = 0$.
- **Inequality answers written as one interval when there are two.** $x^2 > 9$ means $x < -3$ or $x > 3$, not $-3 > x > 3$.
- **"Real roots" vs "two distinct real roots".** Real roots: $\Delta \geq 0$. Two distinct real roots: $\Delta > 0$.
- **Ignoring $a \neq 0$.** If the coefficient of $x^2$ contains $k$ (e.g. $kx^2 + 4x + 1 = 0$), the equation is only quadratic when $k \neq 0$. Mention it.
- **Squaring a negative without brackets.** With $b = -3$, $b^2 = (-3)^2 = 9$, not $-9$.
:::

## Exam tips

:::tip Exam tips
- **Paper 1 (no calculator):** expect factorising, finding the vertex with $-\dfrac{b}{2a}$, exact answers with surds, and discriminant questions with a parameter $k$. Leave answers exact (e.g. $\dfrac{1 \pm \sqrt{7}}{3}$) unless told otherwise.
- **Paper 2 (calculator):** use the GDC for roots, the vertex (max/min), intersections and inequalities — but **write down the equation or the function you put in the calculator**. Calculator syntax is not accepted as working.
- Command terms: **"write down"** = little or no working needed; **"find" / "show that"** = working required; **"hence"** = you must use the previous part.
- In discriminant questions, write the condition first ($\Delta = 0$, $\Delta > 0$, $\Delta < 0$) — it usually earns a method mark on its own.
- Give non-exact answers to **3 significant figures** unless the question says otherwise.
- Look for "hidden quadratics", e.g. $e^{2x} - 5e^x + 6 = 0$ is a quadratic in $e^x$.
:::

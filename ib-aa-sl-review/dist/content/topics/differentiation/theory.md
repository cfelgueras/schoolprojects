# Calculus 1: basic differentiation

:::note What this topic covers
- The idea of a limit; estimating a limit from a table or graph.
- The derivative as the gradient function and as a rate of change; notation.
- Increasing and decreasing functions; the sign of $f'(x)$.
- Derivatives of $x^n$ ($n \in \mathbb{Z}$), polynomials, $e^x$ and $\ln x$; sums and multiples.
- Tangents and normals.
- Second derivative; maximum, minimum and inflexion points; concavity; graphs of $f$, $f'$ and $f''$.
:::

## Key terms

| Term | Meaning |
|---|---|
| **Limit** | The value $f(x)$ approaches as $x$ approaches a number: $\displaystyle\lim_{x \to a} f(x)$. |
| **Derivative** $f'(x)$ or $\dfrac{\mathrm{d}y}{\mathrm{d}x}$ | The gradient of the curve at each point; the rate of change of $y$ with respect to $x$. |
| **Tangent** | The line that touches the curve at a point with the same gradient. |
| **Normal** | The line through the same point, perpendicular to the tangent. |
| **Stationary point** | A point where $f'(x) = 0$ (maximum, minimum or horizontal inflexion). |
| **Point of inflexion** | A point where the concavity changes ($f''$ changes sign). |
| **Concave up** and **concave down** | $f''(x) > 0$: the curve bends up, like a cup. $f''(x) < 0$: it bends down. |

## 1. Limits and the derivative

The gradient of a curve at a point is the **limit** of the gradients of chords as the second point gets closer and closer.

:::example Worked example 1 — estimating a limit from a table
**Question.** Estimate $\displaystyle\lim_{h \to 0} \dfrac{(2 + h)^2 - 4}{h}$ and explain what it represents.

+++

| $h$ | $0.1$ | $0.01$ | $0.001$ |
|---|---|---|---|
| $\dfrac{(2 + h)^2 - 4}{h}$ | $4.1$ | $4.01$ | $4.001$ |

The values approach $4$, so the limit is $4$. It is the gradient of $y = x^2$ at $x = 2$.
:::

**Notation:** $f'(x)$, $\dfrac{\mathrm{d}y}{\mathrm{d}x}$ and $\dfrac{\mathrm{d}}{\mathrm{d}x}\big(f(x)\big)$ all mean the derivative. $f'(a)$ is the gradient at $x = a$; in context it is the **rate of change** (e.g. m s$^{-1}$).

## 2. Rules of differentiation

:::formula booklet Derivative of $x^n$
$$f(x) = x^n \ \Rightarrow\ f'(x) = nx^{n-1}$$
:::

:::formula booklet Derivatives of $e^x$ and $\ln x$
$$f(x) = e^x \Rightarrow f'(x) = e^x \qquad\qquad f(x) = \ln x \Rightarrow f'(x) = \dfrac{1}{x}$$
:::

:::formula memorize Sums and multiples
$$\dfrac{\mathrm{d}}{\mathrm{d}x}\big(k\,f(x)\big) = k\,f'(x) \qquad \dfrac{\mathrm{d}}{\mathrm{d}x}\big(f(x) + g(x)\big) = f'(x) + g'(x) \qquad \dfrac{\mathrm{d}}{\mathrm{d}x}(c) = 0$$
:::

**Before differentiating, rewrite** fractions and roots as powers: $\dfrac{2}{x^3} = 2x^{-3}$.

:::example Worked example 2 — differentiating
**Question.** Differentiate (a) $f(x) = 3x^4 - \dfrac{2}{x} + 5$ (b) $y = 4e^x - 3\ln x$.

+++

(a) $f(x) = 3x^4 - 2x^{-1} + 5 \Rightarrow f'(x) = 12x^3 + 2x^{-2} = 12x^3 + \dfrac{2}{x^2}$

(b) $\dfrac{\mathrm{d}y}{\mathrm{d}x} = 4e^x - \dfrac{3}{x}$
:::

## 3. Tangents and normals

:::formula memorize Tangent and normal at $x = a$
1. Point: $\big(a,\ f(a)\big)$. Gradient of tangent: $m = f'(a)$.
2. Tangent: $y - f(a) = f'(a)(x - a)$.
3. Normal: gradient $-\dfrac{1}{f'(a)}$, through the same point.
:::

:::example Worked example 3 — tangent and normal
**Question.** Find the equations of the tangent and the normal to $y = x^3 - 2x + 1$ at $x = 2$.

+++

Point: $y = 8 - 4 + 1 = 5$, so $(2,\ 5)$. $\dfrac{\mathrm{d}y}{\mathrm{d}x} = 3x^2 - 2 = 10$ at $x = 2$.

Tangent: $y - 5 = 10(x - 2) \Rightarrow y = 10x - 15$.

Normal: gradient $-\dfrac{1}{10}$: $y - 5 = -\dfrac{1}{10}(x - 2) \Rightarrow y = -\dfrac{1}{10}x + \dfrac{26}{5}$.
:::

## 4. Increasing and decreasing

- $f'(x) > 0$ → $f$ is **increasing**. $\ f'(x) < 0$ → $f$ is **decreasing**.
- To find the intervals: solve $f'(x) = 0$, then test the sign of $f'$ in each interval (sign diagram).

## 5. Stationary points and their nature

:::formula memorize Classifying stationary points ($f'(a) = 0$)
| Test | Maximum | Minimum |
|---|---|---|
| Sign of $f'$ around $a$ | $+ \ \to\ -$ | $- \ \to\ +$ |
| Second derivative | $f''(a) < 0$ | $f''(a) > 0$ |

If $f''(a) = 0$, the second derivative test fails: use the sign of $f'$.
:::

:::formula memorize Points of inflexion and concavity
- **Point of inflexion:** $f''(x) = 0$ **and $f''$ changes sign**.
- With **zero gradient** ($f' = 0$ too, e.g. $y = x^3$ at $0$) or **non-zero gradient**.
- Concave up: $f''(x) > 0$. Concave down: $f''(x) < 0$.
:::

:::example Worked example 4 — full function analysis
**Question.** $f(x) = x^3 - 3x^2 - 9x + 2$. Find and classify the stationary points, the point of inflexion, and the intervals where $f$ is increasing and concave down.

+++

$f'(x) = 3x^2 - 6x - 9 = 3(x - 3)(x + 1) = 0 \Rightarrow x = -1$ or $x = 3$.

$f(-1) = 7$, $f(3) = -25$. $\ f''(x) = 6x - 6$:
- $f''(-1) = -12 < 0$ → **maximum** $(-1,\ 7)$.
- $f''(3) = 12 > 0$ → **minimum** $(3,\ -25)$.

$f''(x) = 0 \Rightarrow x = 1$, and $f''$ changes sign → **point of inflexion** $(1,\ -9)$.

Increasing: $x < -1$ or $x > 3$. Concave down: $x < 1$.
:::

```graph
{
  "expr": "x^3-3*x^2-9*x+2",
  "x": [-3, 5.5], "y": [-30, 14],
  "points": [["-1", "7", "max (−1, 7)"], ["3", "-25", "min (3, −25)"], ["1", "-9", "inflexion (1, −9)"]],
  "caption": "f(x) = x³ − 3x² − 9x + 2: maximum, minimum and point of inflexion."
}
```

:::example Worked example 5 — inflexion or not?
**Question.** Show that $y = x^3$ has a point of inflexion at the origin but $y = x^4$ does not.

+++

$y = x^3$: $y'' = 6x$ is $0$ at $x = 0$ and changes sign ($-$ to $+$) → inflexion with **zero gradient**.

$y = x^4$: $y'' = 12x^2$ is $0$ at $x = 0$ but is positive on both sides → **no** inflexion (it is a minimum).
:::

:::example Worked example 6 — with $e^x$
**Question.** Find the minimum point of $y = e^x - 2x$.

+++

$\dfrac{\mathrm{d}y}{\mathrm{d}x} = e^x - 2 = 0 \Rightarrow x = \ln 2$, $\ y = 2 - 2\ln 2$.

$\dfrac{\mathrm{d}^2y}{\mathrm{d}x^2} = e^x > 0$, so it is a minimum: $(\ln 2,\ 2 - 2\ln 2)$.
:::

## 6. Graphs of $f$, $f'$ and $f''$

| On the graph of $f$ | On the graph of $f'$ | On the graph of $f''$ |
|---|---|---|
| Increasing | above the $x$-axis | — |
| Maximum / minimum | crosses the $x$-axis (root) | — |
| Point of inflexion | maximum or minimum of $f'$ | crosses the $x$-axis |
| Concave up | increasing | above the $x$-axis |

## 7. Rate of change in context

:::example Worked example 7 — rate of change
**Question.** The volume of a balloon is $V(t) = 4t^2 + 3t$ cm$^3$ after $t$ seconds. Find the rate at which the volume is increasing when $t = 2$.

+++

$V'(t) = 8t + 3$, so $V'(2) = 19$ cm$^3$ s$^{-1}$.
:::

## Common mistakes

:::mistake Common mistakes
- **Differentiating a fraction term by term.** Rewrite $\dfrac{2}{x}$ as $2x^{-1}$ first.
- **Normal gradient.** It is $-\dfrac{1}{f'(a)}$, not $-f'(a)$.
- **Using $f'(a)$ as the $y$-coordinate.** The point is $\big(a,\ f(a)\big)$.
- **Inflexion = $f''(x) = 0$ only.** You must also show that $f''$ **changes sign**.
- **"Justify" without a reason.** Write the sign of $f'$ or $f''$ explicitly (e.g. "$f''(x) < 0$ for $x < 2$").
- **Forgetting that $\ln x$ needs $x > 0$** when answering about domains.
:::

## Exam tips

:::tip Exam tips
- **Paper 1:** differentiate by hand, tangents and normals, stationary points with exact values, sketches of $f'$ and $f''$.
- **Paper 2:** gradients at a point (GDC $\dfrac{\mathrm{d}}{\mathrm{d}x}$), maximum / minimum of complicated functions, rates of change in context.
- "**Justify**" a maximum / minimum / concavity → state the sign of $f'$ or $f''$ (sign diagram or second derivative test).
- In context questions, include **units** for rates of change.
:::

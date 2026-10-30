# Functions and transformations

:::note What this topic covers
- Functions, notation, domain, range, image; key features of graphs.
- Composite functions, inverse functions and the identity function.
- Rational functions: $\dfrac{1}{x}$ and $\dfrac{ax + b}{cx + d}$; asymptotes and the informal idea of a limit.
- Transformations of graphs.
- Using technology: graphs, sums and differences of functions, intersections, solving unfamiliar equations.
:::

## Key terms

| Term | Meaning |
|---|---|
| **Function** | A rule that gives **exactly one** output for each input. |
| **Domain** | The set of input values ($x$-values) allowed. |
| **Range** | The set of output values ($y$-values) the function actually takes. |
| **Image** | The output for a given input: the image of $2$ under $f$ is $f(2)$. |
| **Roots / zeros** | Values of $x$ with $f(x) = 0$ ($x$-intercepts). |
| **Composite function** | $(f \circ g)(x) = f(g(x))$: apply $g$ first, then $f$. |
| **Inverse function** $f^{-1}$ | Undoes $f$: if $f(a) = b$ then $f^{-1}(b) = a$. |
| **Identity function** | $x \mapsto x$. $(f \circ f^{-1})(x) = (f^{-1} \circ f)(x) = x$. |
| **Asymptote** | A line the graph gets closer and closer to. |

## 1. Domain, range and key features

- **Domain restrictions** come from: dividing by zero ($x \neq$ value), square roots of negatives (inside $\geq 0$), logarithms (inside $> 0$), or the context.
- **Range**: sketch the graph (or use the GDC) and read the lowest and highest $y$-values.
- **Key features** to find on a graph: intercepts, roots, maximum and minimum points, asymptotes.

:::example Worked example 1 — domain and range
**Question.** $f(x) = \sqrt{x - 3} + 1$. Find the largest possible domain of $f$ and the corresponding range.

+++

The square root needs $x - 3 \geq 0$, so the domain is $x \geq 3$.

$\sqrt{x - 3} \geq 0$, so $f(x) \geq 1$. The range is $f(x) \geq 1$.
:::

## 2. Composite functions

:::formula memorize Composite function
$$(f \circ g)(x) = f\big(g(x)\big)$$
Work **from the inside out**: apply $g$ first, then $f$. In general $f \circ g \neq g \circ f$.
:::

:::example Worked example 2 — composite functions
**Question.** $f(x) = 2x + 1$ and $g(x) = x^2 - 3$. Find (a) $(f \circ g)(x)$, (b) $(g \circ f)(x)$, (c) $(f \circ g)(2)$.

+++

(a) $(f \circ g)(x) = f(x^2 - 3) = 2(x^2 - 3) + 1 = 2x^2 - 5$

(b) $(g \circ f)(x) = g(2x + 1) = (2x + 1)^2 - 3 = 4x^2 + 4x - 2$

(c) $(f \circ g)(2) = 2(2)^2 - 5 = 3$
:::

## 3. Inverse functions

- Only a **one-to-one** function has an inverse (each $y$ comes from one $x$). Sometimes the domain is restricted to make it one-to-one.
- The graph of $y = f^{-1}(x)$ is the **reflection of $y = f(x)$ in the line $y = x$**.
- Domain of $f^{-1}$ = range of $f$; range of $f^{-1}$ = domain of $f$.

**To find $f^{-1}(x)$:** write $y = f(x)$, swap $x$ and $y$, then make $y$ the subject.

:::example Worked example 3 — finding an inverse
**Question.** Find $f^{-1}(x)$ for (a) $f(x) = 4x - 3$, (b) $f(x) = \dfrac{2x + 1}{x - 3}$, $x \neq 3$.

+++

(a) $x = 4y - 3 \Rightarrow y = \dfrac{x + 3}{4}$, so $f^{-1}(x) = \dfrac{x + 3}{4}$.

(b) $x = \dfrac{2y + 1}{y - 3} \Rightarrow x(y - 3) = 2y + 1 \Rightarrow xy - 2y = 3x + 1 \Rightarrow y(x - 2) = 3x + 1$
$$f^{-1}(x) = \dfrac{3x + 1}{x - 2}, \quad x \neq 2$$
:::

```graph
{
  "expr": "4*x-3",
  "x": [-6, 6], "y": [-6, 6],
  "points": [["1", "1", "(1, 1) on y = x"]],
  "caption": "f(x) = 4x − 3. Its inverse (x + 3) divided by 4 is the reflection of this line in y = x; they meet on y = x at (1, 1)."
}
```

## 4. Rational functions and asymptotes

:::formula memorize The reciprocal function
$$f(x) = \dfrac{1}{x}, \quad x \neq 0$$
- Vertical asymptote $x = 0$, horizontal asymptote $y = 0$.
- It is **self-inverse**: $f^{-1}(x) = \dfrac{1}{x}$ (the graph is symmetric in $y = x$).
:::

:::formula memorize Asymptotes of $f(x) = \dfrac{ax + b}{cx + d}$
- Vertical asymptote: $x = -\dfrac{d}{c}$ (where the denominator is $0$).
- Horizontal asymptote: $y = \dfrac{a}{c}$ (ratio of the $x$-coefficients).
- $x$-intercept: $x = -\dfrac{b}{a}$. $\ y$-intercept: $y = \dfrac{b}{d}$.
:::

**Limit notation (informal).** $\displaystyle\lim_{x \to \infty} f(x) = L$ means "as $x$ gets very large, $f(x)$ gets closer and closer to $L$". So $y = L$ is a horizontal asymptote. Example: $\displaystyle\lim_{x \to \infty} \dfrac{1}{x} = 0$.

```graph
{
  "expr": "a/(x-h)+k",
  "params": { "a": [-4, 4, 1, 0.5], "h": [-4, 4, 2, 0.5], "k": [-4, 4, 1, 0.5] },
  "x": [-8, 8], "y": [-8, 8],
  "axis": "h",
  "caption": "y = a divided by (x − h), plus k. The dashed line is the vertical asymptote x = h; the horizontal asymptote is y = k."
}
```

:::example Worked example 4 — a rational function
**Question.** $f(x) = \dfrac{2x + 1}{x - 3}$. Write down the equations of the asymptotes and the axis intercepts.

+++

- Vertical asymptote: $x = 3$. Horizontal asymptote: $y = \dfrac{2}{1} = 2$.
- $x$-intercept: $2x + 1 = 0 \Rightarrow \left(-\dfrac{1}{2},\ 0\right)$.
- $y$-intercept: $f(0) = \dfrac{1}{-3}$, so $\left(0,\ -\dfrac{1}{3}\right)$.
:::

## 5. Transformations of graphs

:::formula memorize Transformations
| New function | Transformation of $y = f(x)$ |
|---|---|
| $y = f(x) + b$ | Translation $b$ units **up** (vertical) |
| $y = f(x - a)$ | Translation $a$ units **right** (horizontal) |
| $y = p\,f(x)$ | Vertical stretch, scale factor $p$ |
| $y = f(qx)$ | Horizontal stretch, scale factor $\dfrac{1}{q}$ |
| $y = -f(x)$ | Reflection in the $x$-axis |
| $y = f(-x)$ | Reflection in the $y$-axis |

Translations can be written as a vector: $\begin{pmatrix} a \\ b \end{pmatrix}$.
:::

**Inside the bracket → horizontal, and it does the "opposite"** ($f(x - 2)$ moves right; $f(2x)$ squashes by $\dfrac{1}{2}$). **Outside → vertical, and it does what it says.**

:::example Worked example 5 — describing transformations
**Question.** The point $(4,\ 5)$ lies on $y = f(x)$. Describe the transformations that map $f$ to $g(x) = 2f(x - 1) + 3$ and find the image of $(4,\ 5)$.

+++

- Translation $1$ unit right: $(4,\ 5) \to (5,\ 5)$.
- Vertical stretch, scale factor $2$: $(5,\ 5) \to (5,\ 10)$.
- Translation $3$ units up: $(5,\ 10) \to (5,\ 13)$.

The image is $(5,\ 13)$. (Vertical stretch **before** the vertical translation.)
:::

## 6. Polynomial functions

- The **degree** of a polynomial is its highest power of $x$: $3x^4 - x + 2$ has degree $4$.
- **Equality of coefficients:** if two polynomials are equal for all $x$, the coefficients of each power of $x$ are equal. For example, if $x^2 + bx + 6 \equiv (x + 2)(x + c)$, then $2 + c = b$ and $2c = 6$, so $c = 3$, $b = 5$.

## 7. Solving equations with technology

Equations such as $2^x = x + 5$ cannot be solved with algebra. On **Paper 2**:

1. Graph both sides: $y = 2^x$ and $y = x + 5$.
2. Find the intersections (GDC: G-Solv ISCT).
3. Write the $x$-values: $x \approx -4.97$ or $x = 3$.

```graph
{
  "expr": "2^x-(x+5)",
  "x": [-7, 5], "y": [-6, 8],
  "points": [["-4.968", "0", "x ≈ −4.97"], ["3", "0", "x = 3"]],
  "caption": "The roots of y = 2^x − (x + 5) are the solutions of 2^x = x + 5."
}
```

Use the same idea for the **sum or difference** of two functions: enter $f(x) + g(x)$ (or $f(x) - g(x)$) as one graph on the GDC.

## Common mistakes

:::mistake Common mistakes
- **Order in a composite.** $(f \circ g)(x)$ means $g$ first. Write $f(g(x))$ to remind yourself.
- **$f^{-1}(x)$ is not $\dfrac{1}{f(x)}$.** The inverse undoes $f$; the reciprocal is something else.
- **Forgetting the domain of the inverse.** It is the range of $f$.
- **Horizontal transformations in the wrong direction.** $f(x + 3)$ moves the graph $3$ units **left**.
- **Range written as a domain.** Ranges use $f(x)$ or $y$: "$f(x) \geq 1$", not "$x \geq 1$".
- **Rounding intersection values too early.** Keep the GDC value and round the final answer to 3 s.f.
:::

## Exam tips

:::tip Exam tips
- **Paper 1:** composite and inverse functions by algebra, asymptotes of $\dfrac{ax + b}{cx + d}$, describing transformations.
- **Paper 2:** "solve", "find the intersection", "find the range" with complicated functions → sketch with the GDC and **write down the equation you solved**.
- When asked to **sketch**, label intercepts, turning points and asymptotes (with their equations) and respect the given domain.
- To describe a transformation, give the **type** (translation / stretch / reflection), the **direction** and the **amount**. Do not write "move".
:::

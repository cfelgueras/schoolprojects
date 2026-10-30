# Exponents and logarithms

:::note What this topic covers
- Laws of exponents (integer and fractional) and exponential equations.
- Exponential functions and their graphs; the horizontal asymptote; limit notation.
- Logarithms: definition, laws, change of base, natural logarithms and the number $e$.
- Logarithmic functions and their graphs; the vertical asymptote; $a^x$ and $\log_a x$ as inverses.
- Logarithmic equations and "hidden quadratics".
- Applications: growth and decay.
:::

## Key terms

| Term | Meaning |
|---|---|
| **Base** and **exponent** | In $a^x$, $a$ is the base and $x$ the exponent (power, index). |
| **Logarithm** | $\log_a b$ is the exponent you put on $a$ to get $b$. |
| **Natural logarithm** | $\ln x = \log_e x$, where $e \approx 2.71828$. |
| **Exponential growth / decay** | $y = A\,e^{kt}$ with $k > 0$ (growth) or $k < 0$ (decay). |
| **Asymptote** | A line the graph approaches but never reaches. |

## 1. Laws of exponents

:::formula memorize Laws of exponents
$$a^m \times a^n = a^{m+n} \qquad \dfrac{a^m}{a^n} = a^{m-n} \qquad (a^m)^n = a^{mn}$$
$$(ab)^n = a^n b^n \qquad a^0 = 1 \qquad a^{-n} = \dfrac{1}{a^n}$$
$$a^{\frac{1}{n}} = \sqrt[n]{a} \qquad a^{\frac{m}{n}} = \left(\sqrt[n]{a}\right)^m$$
:::

:::example Worked example 1 — simplifying
**Question.** Simplify (a) $8^{\frac{2}{3}} \times 2^{-1}$ (b) $\left(27x^6\right)^{\frac{1}{3}}$.

+++

(a) $8^{\frac{2}{3}} = \left(\sqrt[3]{8}\right)^2 = 4$, so $4 \times \dfrac{1}{2} = 2$.

(b) $27^{\frac{1}{3}} \times \left(x^6\right)^{\frac{1}{3}} = 3x^2$.
:::

## 2. Exponential equations

- **Same base:** write both sides as powers of the same number, then equate the exponents.
- **Different bases:** take logarithms of both sides (or use the definition of a logarithm).

:::example Worked example 2 — same base
**Question.** Solve $9^{x+1} = 27^x$.

+++

$$\left(3^2\right)^{x+1} = \left(3^3\right)^x \ \Rightarrow\ 3^{2x+2} = 3^{3x} \ \Rightarrow\ 2x + 2 = 3x \ \Rightarrow\ x = 2$$
:::

:::example Worked example 3 — taking logarithms
**Question.** Solve $5^x = 12$, giving your answer to 3 significant figures.

+++

$$x = \log_5 12 = \dfrac{\ln 12}{\ln 5} \approx 1.54$$
:::

## 3. Logarithms

:::formula booklet Definition of a logarithm
$$a^x = b \ \Leftrightarrow\ x = \log_a b, \quad a > 0,\ b > 0,\ a \neq 1$$
:::

:::formula booklet Laws of logarithms and change of base
$$\log_a xy = \log_a x + \log_a y \qquad \log_a \dfrac{x}{y} = \log_a x - \log_a y \qquad \log_a x^m = m\log_a x$$
$$\log_a x = \dfrac{\log_b x}{\log_b a}$$
:::

:::formula booklet Exponentials and logarithms as inverses
$$a^x = e^{x \ln a} \qquad \log_a a^x = x = a^{\log_a x}, \quad a,\ x > 0,\ a \neq 1$$
:::

:::formula memorize Values to know
$\log_a 1 = 0$, $\ \log_a a = 1$, $\ \ln 1 = 0$, $\ \ln e = 1$. The logarithm of a negative number or of $0$ does not exist.
:::

:::example Worked example 4 — combining logarithms
**Question.** Write $2\log 3 + \log 4 - \log 6$ as a single logarithm.

+++

$$\log 3^2 + \log 4 - \log 6 = \log \dfrac{9 \times 4}{6} = \log 6$$
:::

:::example Worked example 5 — change of base
**Question.** Find the exact value of $\log_8 32$.

+++

$$\log_8 32 = \dfrac{\log_2 32}{\log_2 8} = \dfrac{5}{3}$$
:::

## 4. Graphs of exponential and logarithmic functions

| | $y = a^x$ ($a > 1$) | $y = \log_a x$ ($a > 1$) |
|---|---|---|
| Domain | all real $x$ | $x > 0$ |
| Range | $y > 0$ | all real $y$ |
| Intercept | $(0,\ 1)$ | $(1,\ 0)$ |
| Asymptote | horizontal, $y = 0$ | vertical, $x = 0$ |

They are **inverse functions**: each graph is the reflection of the other in $y = x$.

**Limit notation.** $\displaystyle\lim_{x \to -\infty} e^x = 0$: as $x$ becomes very negative, $e^x$ approaches $0$, so $y = 0$ is a horizontal asymptote.

```graph
{
  "expr": "a^x",
  "params": { "a": [0.2, 4, 2, 0.1] },
  "x": [-5, 5], "y": [-1, 8],
  "points": [["0", "1", "(0, 1)"]],
  "caption": "y = a^x. For a > 1 it grows, for 0 < a < 1 it decays. Every graph passes through (0, 1) and approaches y = 0."
}
```

## 5. Logarithmic equations

1. Use the laws to combine into a single logarithm.
2. Rewrite with the definition: $\log_a(\ldots) = c \Rightarrow (\ldots) = a^c$.
3. **Check every solution** in the original equation: the argument of each logarithm must be positive.

:::example Worked example 6 — a logarithmic equation
**Question.** Solve $\log_2(x + 3) + \log_2(x - 3) = 4$.

+++

$$\log_2\big((x + 3)(x - 3)\big) = 4 \ \Rightarrow\ x^2 - 9 = 2^4 = 16 \ \Rightarrow\ x^2 = 25$$
$x = 5$ or $x = -5$. For $x = -5$, $\log_2(x - 3) = \log_2(-8)$ does not exist, so **$x = 5$ only**.
:::

## 6. Hidden quadratics

If you see $e^{2x}$ and $e^x$ (or $4^x$ and $2^x$), substitute $u = e^x$ (or $u = 2^x$), since $e^{2x} = \left(e^x\right)^2$.

:::example Worked example 7 — hidden quadratic
**Question.** Solve $e^{2x} - 5e^x + 4 = 0$.

+++

Let $u = e^x$: $u^2 - 5u + 4 = 0 \Rightarrow (u - 4)(u - 1) = 0$.

$e^x = 4 \Rightarrow x = \ln 4$, $\quad e^x = 1 \Rightarrow x = 0$.

(If one value of $u$ were negative, reject it: $e^x > 0$ always.)
:::

## 7. Applications: growth and decay

:::example Worked example 8 — doubling time (Paper 2 style)
**Question.** A population is modelled by $P(t) = 500e^{0.03t}$, where $t$ is in years. Find (a) the initial population, (b) the time for the population to double.

+++

(a) $P(0) = 500$.

(b) $500e^{0.03t} = 1000 \Rightarrow e^{0.03t} = 2 \Rightarrow t = \dfrac{\ln 2}{0.03} \approx 23.1$ years.
:::

## Common mistakes

:::mistake Common mistakes
- $\log(x + y) \neq \log x + \log y$. The product law is $\log(xy) = \log x + \log y$.
- $\dfrac{\log x}{\log y} \neq \log \dfrac{x}{y}$ (that is the change-of-base form, not the quotient law).
- $(a + b)^2 \neq a^2 + b^2$, and $e^{x+2} = e^x \times e^2$, not $e^x + e^2$.
- **Not checking solutions** of logarithmic equations — negative arguments are not allowed.
- **Negative exponent read as a negative number.** $2^{-3} = \dfrac{1}{8}$, not $-8$.
- On the GDC, $\log$ is base $10$ and $\ln$ is base $e$.
:::

## Exam tips

:::tip Exam tips
- **Paper 1:** laws of exponents and logarithms, exact answers such as $x = \ln 4$ or $\dfrac{5}{3}$, hidden quadratics.
- **Paper 2:** growth / decay models, equations that need a graph (intersection).
- "Give your answer in the form $\ln a$" means **do not** give a decimal.
- When a question says "show that", every law you use should be visible in your working.
:::

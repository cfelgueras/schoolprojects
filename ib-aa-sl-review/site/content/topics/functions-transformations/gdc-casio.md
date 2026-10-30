:::unverified Partly checked
Key sequences are for the **fx-9860GII / fx-9860GIII**. Items marked {{unverified}} have not been checked against the official Casio manual yet.
:::

## Paper 1 or Paper 2?

| Type of question | Paper |
|---|---|
| Find $(f \circ g)(x)$ or $f^{-1}(x)$ algebraically | **Paper 1** |
| Asymptotes of $\dfrac{ax + b}{cx + d}$, describing transformations | **Paper 1** |
| Range of a complicated function | **Paper 2** — GRAPH, G-Solv MAX / MIN |
| Solve an "unfamiliar" equation, e.g. $2^x = x + 5$ | **Paper 2** — GRAPH ISCT |
| Intersections of two curves | **Paper 2** — GRAPH ISCT |
| Value of $f(x)$ or $x$ for a given $y$ | **Paper 2** — G-Solv Y-CAL / X-CAL |

## What you need to be able to do

- [ ] Graph a function and choose a good **V-Window**.
- [ ] Graph a function on a **restricted domain**.
- [ ] Use **G-Solv**: ROOT, MAX, MIN, Y-ICPT, ISCT, Y-CAL, X-CAL.
- [ ] Graph the **sum or difference** of two functions.
- [ ] Use **TABLE** to see what happens near an asymptote.

## Keys and menus you will use

| What | Where | Keys |
|---|---|---|
| Graph | GRAPH | [[MENU]] → GRAPH → Y1 … → [[F6]] DRAW |
| View window | GRAPH | [[SHIFT]] [[F3]] V-WIN |
| Graph solve | graph screen | [[F5]] G-SOLV → ROOT [[F1]], MAX [[F2]], MIN [[F3]], Y-ICPT [[F4]], ISCT [[F5]] |
| $y$ for a given $x$ / $x$ for a given $y$ | graph screen | G-SOLV → [[F6]] → [[F1]] Y-CAL / [[F2]] X-CAL {{unverified}} |
| Table of values | TABLE | [[MENU]] → TABLE → [[F5]] SET → [[F6]] TABL |
| Solve an equation (all solutions as a list) | RUN-MAT | [[OPTN]] → [[F4]] CALC → [[F5]] SolveN: `SolveN(expression, X, min, max)` solves expression $= 0$ {{unverified}} |

## Step by step

### A. Graph on a restricted domain

**Example:** $f(x) = x^2 - 4x + 1$ for $0 \leq x \leq 5$.

1. [[MENU]] → **GRAPH**. In Y1 type the function, then `,` `[` `0` `,` `5` `]` and [[EXE]]. The square brackets are [[SHIFT]] [[+]] and [[SHIFT]] [[−]] {{unverified}}.
2. [[F6]] DRAW. Only the part between $x = 0$ and $x = 5$ is drawn.
3. **Range:** use G-SOLV → MIN for the lowest point $(2,\ -3)$ and Y-CAL at $x = 5$ for the end point $(5,\ 6)$. Range: $-3 \leq f(x) \leq 6$.

### B. Solve an unfamiliar equation

**Example:** $2^x = x + 5$.

1. Y1: `2` [[^]] [[X,θ,T]]. Y2: [[X,θ,T]] `+5`.
2. [[F6]] DRAW → [[F5]] → [[F5]] **ISCT**.
3. First intersection $x \approx -4.97$; press [[▶]] for the next: $x = 3$.

### C. Sum or difference of two functions

Put $f$ in Y1 and $g$ in Y2. In Y3 type `Y1+Y2` using [[VARS]] → [[F4]] GRPH → [[F1]] Y → `1` {{unverified}}. Deselect Y1 and Y2 with [[F1]] SEL so only Y3 is drawn.

### D. Behaviour near an asymptote (TABLE)

**Example:** $f(x) = \dfrac{2x + 1}{x - 3}$.

1. [[MENU]] → **TABLE**, Y1 = `(2X+1)÷(X−3)`. Use brackets around the numerator and the denominator.
2. [[F5]] SET: Start $= 2.9$, End $= 3.1$, Step $= 0.05$ → [[F6]] TABL. The values blow up near $x = 3$ (vertical asymptote).
3. Try Start $= 100$, End $= 1000$, Step $= 100$: the values approach $2$ (horizontal asymptote $y = 2$).

## Practice drill — do it until it is automatic

| # | Task | Tool | Answer |
|---|---|---|---|
| 1 | Solve $2^x = x + 5$ | ISCT | $x \approx -4.97$, $x = 3$ |
| 2 | Range of $f(x) = x^2 - 4x + 1$, $0 \leq x \leq 5$ | MIN + Y-CAL | $-3 \leq f(x) \leq 6$ |
| 3 | Solve $\ln x = 3 - x$ | ISCT | $x \approx 2.21$ |
| 4 | Asymptotes of $y = \dfrac{3x - 2}{x + 1}$ (check with TABLE) | TABLE | $x = -1$, $y = 3$ |
| 5 | Maximum of $f(x) = x\,e^{-x}$ | MAX | $(1,\ 0.368)$ |

:::unverified Partly checked
Key sequences are for the **fx-9860GII / fx-9860GIII**. The logarithm template (MATH → logab) has been checked against copies of the Casio manual; items marked {{unverified}} have not.
:::

## Paper 1 or Paper 2?

| Type of question | Paper |
|---|---|
| Laws of exponents and logarithms, exact answers | **Paper 1** |
| Same-base exponential equations, hidden quadratics | **Paper 1** |
| $a^x = b$ with a decimal answer | **Paper 2** — $\ln$ / logab in RUN-MAT |
| Growth / decay models | **Paper 2** |
| Equations such as $2^x = 3 - x$ | **Paper 2** — GRAPH ISCT |

## What you need to be able to do

- [ ] Evaluate $\ln$, $\log$ (base 10) and $\log_a b$ for any base.
- [ ] Enter $e^x$ and powers correctly.
- [ ] Solve exponential equations graphically (ISCT).
- [ ] Use a growth model: find a value and solve for the time.

## Keys and menus you will use

| What | Where | Keys |
|---|---|---|
| Natural log | RUN-MAT | [[ln]] |
| Log base 10 | RUN-MAT | [[log]] |
| Log with any base | RUN-MAT (Math input mode) | [[F4]] MATH → [[F2]] logab |
| $e^x$ | RUN-MAT | [[SHIFT]] [[ln]] |
| Power | RUN-MAT | [[^]] |
| Intersection | GRAPH | [[F5]] G-SOLV → [[F5]] ISCT |
| Solve an equation (all solutions as a list) | RUN-MAT | [[OPTN]] → [[F4]] CALC → [[F5]] SolveN: `SolveN(expression, X, min, max)` solves expression $= 0$ {{unverified}} |

## Step by step

### A. Logarithm with any base

**Example:** $\log_5 12$.

1. [[MENU]] → **RUN-MAT** (Math input mode).
2. [[F4]] **MATH** → [[F2]] **logab**. A template $\log_{\square}\square$ appears.
3. Type `5`, move right with [[▶]], type `12`, [[EXE]]: $1.54$.

Or use change of base: `ln 12 ÷ ln 5`.

### B. Solve an exponential equation with GRAPH

**Example:** $2^x = 3 - x$.

1. [[MENU]] → GRAPH. Y1: `2` [[^]] [[X,θ,T]]; Y2: `3` `−` [[X,θ,T]].
2. [[F6]] DRAW → [[F5]] → [[F5]] **ISCT**: $x = 1$.

### C. Growth model

**Example:** $P(t) = 500e^{0.03t}$. When does $P$ reach $1000$?

1. GRAPH: Y1: `500` [[SHIFT]] [[ln]] `(0.03` [[X,θ,T]] `)`; Y2: `1000`.
2. V-Window: Xmin $= 0$, Xmax $= 40$, Ymin $= 0$, Ymax $= 1500$.
3. ISCT: $t \approx 23.1$.

Alternatively solve by hand: $t = \dfrac{\ln 2}{0.03}$ and evaluate in RUN-MAT.

## Practice drill — do it until it is automatic

| # | Task | Tool | Answer |
|---|---|---|---|
| 1 | $\log_2 50$ | logab | $5.64$ |
| 2 | Solve $3^x = 20$ | logab or ln | $x \approx 2.73$ |
| 3 | Solve $e^{0.2x} = 7$ | ln | $x \approx 9.73$ |
| 4 | Solve $2^x = 3 - x$ | ISCT | $x = 1$ |
| 5 | $P(t) = 500e^{0.03t}$: time to reach $1000$ | ISCT | $t \approx 23.1$ |

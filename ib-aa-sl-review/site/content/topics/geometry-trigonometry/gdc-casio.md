:::unverified Partly checked
Key sequences are for the **fx-9860GII / fx-9860GIII**. Items marked {{unverified}} have not been checked against the official Casio manual yet.
:::

## Paper 1 or Paper 2?

| Type of question | Paper |
|---|---|
| Exact values, identities, trig equations with the unit circle | **Paper 1** |
| Arc length / sector area in terms of $\pi$ | **Paper 1** |
| Sine rule, cosine rule, area with decimals | **Paper 2** — RUN-MAT |
| 3D distances, volumes, angles | **Paper 2** — RUN-MAT |
| Trig equations with no exact solution, models | **Paper 2** — GRAPH ISCT |

## What you need to be able to do

- [ ] **Check the angle mode** (Deg or Rad) every time.
- [ ] Use $\sin^{-1}$, $\cos^{-1}$, $\tan^{-1}$.
- [ ] Solve a trig equation on an interval with GRAPH ISCT.
- [ ] Find max / min of a trig model.

## Keys and menus you will use

| What | Where | Keys |
|---|---|---|
| Angle mode | any | [[SHIFT]] [[MENU]] SET UP → Angle: Deg / Rad |
| Inverse trig | RUN-MAT | [[SHIFT]] [[sin]] (and cos, tan) |
| $\pi$ | any | [[SHIFT]] [[EXP]] |
| Degree / radian symbols | RUN-MAT | [[OPTN]] → [[F6]] → ANGL {{unverified}} |
| Intersection | GRAPH | [[F5]] G-SOLV → [[F5]] ISCT |
| Solve an equation (all solutions as a list) | RUN-MAT | [[OPTN]] → [[F4]] CALC → [[F5]] SolveN: `SolveN(expression, X, min, max)` solves expression $= 0$ {{unverified}} |

## Step by step

### A. Check the angle mode

1. [[SHIFT]] [[MENU]] (SET UP). Scroll to **Angle**.
2. [[F1]] Deg or [[F2]] Rad {{unverified}}. [[EXIT]].
3. The current mode is shown at the top of the screen on newer models.

### B. Sine / cosine rule

**Example:** $c^2 = 7^2 + 9^2 - 2(7)(9)\cos 50^\circ$ (Deg mode).

1. RUN-MAT: `√(7²+9²−2×7×9×cos 50)` [[EXE]]: $7.00$.
2. **Ambiguous case:** `sin⁻¹(10 sin 35 ÷ 8)` gives $45.8^\circ$; the other answer is $180 - 45.8 = 134.2^\circ$ — the calculator only gives the first one.

### C. Trig equation on an interval

**Example:** $3\sin 2x = 1$ for $0 \leq x \leq \pi$ (Rad mode).

1. GRAPH: Y1: `3sin(2X)`, Y2: `1`.
2. V-Window: Xmin $= 0$, Xmax $= \pi$ (type [[SHIFT]] [[EXP]]), Ymin $= -4$, Ymax $= 4$.
3. ISCT: $x \approx 0.170$, then [[▶]]: $x \approx 1.40$.

Setting Xmin and Xmax to the given interval means the GDC shows **only** the solutions you need.

### D. Model: maximum and minimum

**Example:** $h(t) = 2.5\cos\left(\dfrac{\pi t}{6}\right) + 4$, $0 \leq t \leq 24$ (Rad mode).

1. Y1: `2.5cos(πX÷6)+4`. V-Window: Xmin $0$, Xmax $24$, Ymin $0$, Ymax $8$.
2. MAX: $(0,\ 6.5)$ or $(12,\ 6.5)$; MIN: $(6,\ 1.5)$.

### E. Features of a trig graph

**Example:** $y = 3\sin(2x) + 1$, $0 \leq x \leq 2\pi$ (Rad mode).

1. Y1: `3sin(2X)+1`. V-Window: Xmin $0$, Xmax $2\pi$, Ymin $-4$, Ymax $5$.
2. [[F5]] G-SOLV → [[F2]] MAX: $(0.785,\ 4)$; [[▶]] for the next maximum: $(3.93,\ 4)$. **Period** $= 3.93 - 0.785 \approx \pi$.
3. [[F5]] G-SOLV → [[F3]] MIN: $(2.36,\ -2)$.
4. **Amplitude** $= \dfrac{4 - (-2)}{2} = 3$; **principal axis** $y = \dfrac{4 + (-2)}{2} = 1$.

In **Deg** mode use a window in degrees, e.g. Xmin $0$, Xmax $360$, Xscale $90$. The standard window shows almost nothing.

### F. Application: when is it above a value?

**Example:** a Ferris wheel seat is at height $h(t) = 20 - 18\cos\left(\dfrac{\pi t}{15}\right)$ m, $0 \leq t \leq 30$ s (Rad mode). For how long is it above $30$ m?

1. Y1: `20−18cos(πX÷15)`, Y2: `30`. V-Window: Xmin $0$, Xmax $30$, Ymin $0$, Ymax $40$.
2. ISCT: $t \approx 10.31$, then [[▶]]: $t \approx 19.69$.
3. Time above $30$ m: $19.69 - 10.31 \approx 9.38$ s. Subtract the unrounded values.

Write the equation $h(t) = 30$, both values from the GDC and the subtraction: that is the working the markscheme expects.

## Practice drill — do it until it is automatic

| # | Task | Mode | Answer |
|---|---|---|---|
| 1 | $50\tan 32^\circ$ | Deg | $31.2$ |
| 2 | $\dfrac{12\sin 65^\circ}{\sin 40^\circ}$ | Deg | $16.9$ |
| 3 | Both values of $B$ if $\sin B = \dfrac{10\sin 35^\circ}{8}$ | Deg | $45.8^\circ$, $134.2^\circ$ |
| 4 | Solve $3\sin 2x = 1$, $0 \leq x \leq \pi$ | Rad | $0.170$, $1.40$ |
| 5 | Convert $2.4$ rad to degrees | — | $137.5^\circ$ |
| 6 | Volume of a cone, $r = 4$, $h = 9$ | — | $151$ |

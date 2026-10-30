:::unverified Partly checked
Key sequences are for the **fx-9860GII / fx-9860GIII**. The numerical derivative (OPTN → CALC → d/dx) and the SET UP *Derivative* option have been checked against copies of the Casio manual and the Casio Europe IB guide; items marked {{unverified}} have not.
:::

## Paper 1 or Paper 2?

| Type of question | Paper |
|---|---|
| Differentiate a function, tangent / normal with exact values | **Paper 1** |
| Stationary points of a polynomial, sketch $f'$ or $f''$ | **Paper 1** |
| Gradient at a point of a complicated function | **Paper 2** — $\dfrac{\mathrm{d}}{\mathrm{d}x}$ in RUN-MAT |
| Maximum / minimum of a complicated function | **Paper 2** — G-Solv MAX / MIN |
| Where is the gradient a given value? / point of inflexion | **Paper 2** — graph $f'$ and use ROOT / MAX / MIN |

## What you need to be able to do

- [ ] Find $f'(a)$ with the numerical derivative.
- [ ] Graph $y = f'(x)$ from $f$.
- [ ] Find stationary points with G-Solv MAX / MIN.
- [ ] Find a point of inflexion as the max / min of $f'$.

## Keys and menus you will use

| What | Where | Keys |
|---|---|---|
| Numerical derivative | RUN-MAT | [[OPTN]] → [[F4]] CALC → [[F2]] d/dx |
| Show $\dfrac{\mathrm{d}y}{\mathrm{d}x}$ while tracing | GRAPH | [[SHIFT]] [[MENU]] SET UP → Derivative: On |
| Max / min | graph screen | [[F5]] G-SOLV → [[F2]] MAX / [[F3]] MIN |
| Trace | graph screen | [[F1]] TRACE |

## Step by step

### A. Gradient at a point

**Example:** gradient of $y = x^3 - 2x + 1$ at $x = 2$.

1. [[MENU]] → **RUN-MAT** → [[OPTN]] → [[F4]] **CALC** → [[F2]] **d/dx**.
2. In Math input mode a template $\dfrac{\mathrm{d}}{\mathrm{d}x}(\square)\big|_{x=\square}$ appears. Type `X^3−2X+1`, move to the box after $x =$ and type `2`. (In Linear mode: `d/dx(X^3−2X+1,2)`.)
3. [[EXE]]: $10$.

### B. Graph of $f'$

1. [[MENU]] → GRAPH. Y1: $f(x)$.
2. Y2: [[OPTN]] → CALC → d/dx and type `Y1` (from [[VARS]] → GRPH → Y) — the GDC uses $X$ as the point. The position of CALC in the OPTN menu of GRAPH may differ from RUN-MAT {{unverified}}.
3. Draw. The roots of Y2 are the $x$-coordinates of the stationary points of Y1; the max / min of Y2 are the points of inflexion of Y1.

### C. Stationary points and inflexion

**Example:** $f(x) = x^4 - 4x^3$.

1. Y1: `X^4−4X^3`. V-Window: Xmin $-2$, Xmax $5$, Ymin $-35$, Ymax $10$.
2. G-SOLV → MIN: $(3,\ -27)$.
3. The flat point at the origin is **not** a max or min: it is an inflexion with zero gradient. Graph $f'$ (B) and use MIN on Y2: its minimum is at $x = 2$, so there is an inflexion at $(2,\ -16)$.

### D. See $\dfrac{\mathrm{d}y}{\mathrm{d}x}$ on the graph (Derivative: On)

**Example:** $y = x^3 - 3x$.

1. In **GRAPH** press [[SHIFT]] [[MENU]] (SET UP). Scroll down to **Derivative** and press [[F1]] **On**. [[EXIT]].
2. Put $x^3 - 3x$ in Y1 and draw with [[F6]].
3. Press [[F1]] **TRACE**. Under X and Y the screen now also shows **dY/dX**, the gradient at the cursor.
4. Move with [[◀]] [[▶]]: dY/dX is negative where the curve goes down, positive where it goes up, and $0$ at the stationary points $x = \pm 1$.

The setting stays on until you switch it off in SET UP.

## Practice drill — do it until it is automatic

| # | Task | Tool | Answer |
|---|---|---|---|
| 1 | Gradient of $y = x^3 - 2x + 1$ at $x = 2$ | d/dx | $10$ |
| 2 | Gradient of $y = e^x - 3\ln x$ at $x = 1.5$ | d/dx | $2.48$ |
| 3 | Stationary points of $f(x) = x^3 - 3x^2 - 9x + 2$ | MAX / MIN | $(-1,\ 7)$ max, $(3,\ -25)$ min |
| 4 | Points of inflexion of $f(x) = x^4 - 4x^3$ | graph of $f'$ | $(0,\ 0)$ and $(2,\ -16)$ |
| 5 | Minimum of $y = e^x - 2x$ | MIN | $(0.693,\ 0.614)$ |

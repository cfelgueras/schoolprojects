:::unverified Not yet checked against the official Casio manual
These key sequences are written for the **fx-9860GII / fx-9860GIII** but have **not yet been checked** against the official Casio *Software User's Guide*. Items marked {{unverified}} are the ones we are least sure about. If something on your calculator looks different, tell your teacher.
:::

## Paper 1 or Paper 2?

| Type of question | Paper |
|---|---|
| Finding the vertex by hand, writing the three forms | **Paper 1** — by hand (use the GDC on Paper 2 only to *check*) |
| Exact roots with surds, e.g. $\dfrac{1 \pm \sqrt{7}}{3}$ | **Paper 1** — quadratic formula by hand |
| Discriminant questions with a parameter $k$ | **Paper 1** mostly — algebra; the GDC cannot find $k$ for you directly |
| Roots of a quadratic with "ugly" coefficients | **Paper 2** — EQUA or G-Solv ROOT |
| Vertex (maximum / minimum) of a parabola | **Paper 2** — G-Solv MAX / MIN |
| Intersection of a parabola and a line / two curves | **Paper 2** — G-Solv ISCT |
| Quadratic inequalities with decimal critical values | **Paper 2** — roots from the GDC + reading the graph |
| Contextual problems (projectiles, area, profit) | **Paper 2** |

:::tip Always write the equation down
On Paper 2, write the equation or function you are solving **before** you write the answer, e.g. "$-4.9t^2 + 14t + 1.5 = 0 \Rightarrow t = 2.96$". Calculator key presses are not accepted as working.
:::

## What you need to be able to do

- [ ] Solve $ax^2 + bx + c = 0$ in **EQUA → POLY**.
- [ ] Enter a quadratic in **GRAPH**, choose a good **V-Window** and draw it.
- [ ] Use **G-Solv** to find roots, the vertex (MAX / MIN), the $y$-intercept and intersections.
- [ ] Use **G-Solv → Y-CAL** to evaluate the function at a given $x$.
- [ ] Use **TABLE** to check a vertex form or factorised form you found by hand.

## Keys and menus you will use

| What | Where | Keys |
|---|---|---|
| Polynomial equations | EQUA | [[MENU]] → EQUA → [[F2]] POLY → [[F1]] (degree 2) |
| Graph a function | GRAPH | [[MENU]] → GRAPH → type in Y1 → [[F6]] DRAW |
| Variable $x$ | — | [[X,θ,T]] |
| Square | — | [[x²]] |
| View window | GRAPH | [[SHIFT]] [[F3]] V-WIN |
| Zoom | GRAPH (graph screen) | [[F2]] ZOOM |
| Graph solve | GRAPH (graph screen) | [[F5]] G-SOLV |
| Table of values | TABLE | [[MENU]] → TABLE → [[F5]] SET → [[F6]] TABL |
| Solve an equation (all solutions as a list) | RUN-MAT | [[OPTN]] → [[F4]] CALC → [[F5]] SolveN: `SolveN(expression, X, min, max)` solves expression $= 0$ {{unverified}} |

## Step by step

### A. Solve a quadratic equation with EQUA

**Example:** solve $2x^2 - 7x + 1 = 0$.

1. Press [[MENU]], highlight **EQUA** with the arrow keys and press [[EXE]].
2. Press [[F2]] **POLY**.
3. Choose the degree: [[F1]] **2** (for $ax^2 + bx + c$).
4. Type the coefficients, pressing [[EXE]] after each one: `2` [[EXE]] `(-)7` [[EXE]] `1` [[EXE]].
   Use the **[[(-)]] key** for negative numbers, not the subtraction key.
5. Press [[F1]] **SOLV**.
6. Read the answers: $x_1 \approx 3.35$ and $x_2 \approx 0.149$ (3 s.f.).
7. Press [[EXIT]] to go back and change the coefficients.

:::note If there are no real roots
If $\Delta < 0$ the calculator either shows a message such as "No Real Roots" or shows complex roots, depending on the **Complex Mode** setting in [[SHIFT]] [[MENU]] SET UP {{unverified}}. In AA SL, complex roots mean: **no real roots**.
:::

### B. Graph a parabola and find its roots

**Example:** $f(x) = x^2 - 2x - 4$.

1. [[MENU]] → **GRAPH** → [[EXE]].
2. On the **Y1** line type: [[X,θ,T]] [[x²]] `−` `2` [[X,θ,T]] `−` `4`, then [[EXE]].
3. Press [[F6]] **DRAW**.
4. If you can't see the vertex and both roots, set the window: [[SHIFT]] [[F3]] **V-WIN**, e.g. Xmin $= -5$, Xmax $= 7$, Ymin $= -8$, Ymax $= 6$, then [[EXIT]] and [[F6]] DRAW.
5. Press [[F5]] **G-SOLV** → [[F1]] **ROOT**.
6. The first root appears: $x \approx -1.24$. Press the **right arrow** [[▶]] to jump to the next root: $x \approx 3.24$.

### C. Find the vertex (maximum or minimum)

1. With the graph drawn, press [[F5]] **G-SOLV**.
2. Press [[F3]] **MIN** if the parabola opens upwards ($a > 0$), or [[F2]] **MAX** if it opens downwards ($a < 0$).
3. Read the vertex. For $x^2 - 2x - 4$: $(1,\ -5)$.

### D. $y$-intercept and evaluating $f(x)$

- $y$-intercept: [[F5]] G-SOLV → [[F4]] **Y-ICPT**.
- Value of $f$ at a given $x$: [[F5]] G-SOLV → [[F6]] (more) → [[F1]] **Y-CAL** → type the $x$-value → [[EXE]].

### E. Intersection of a parabola and a line

**Example:** where does $y = x + 1$ meet $y = x^2 - 2x - 4$?

1. In GRAPH, put the parabola in **Y1** and the line in **Y2**. Draw with [[F6]].
2. [[F5]] G-SOLV → [[F5]] **ISCT**.
3. If asked, choose the two graphs with the arrow keys and [[EXE]].
4. First intersection: $(-1.19,\ -0.193)$. Press [[▶]] for the next: $(4.19,\ 5.19)$.

### F. Solve a quadratic inequality

**Example:** solve $x^2 - 2x - 4 > 0$.

1. Find the roots as in **B**: $x \approx -1.24$ and $x \approx 3.24$.
2. Look at the graph: where is it **above** the $x$-axis? Outside the roots.
3. Answer: $x < -1.24$ or $x > 3.24$.

Optional: you can change the type of Y1 to an inequality so the calculator shades the region: in the Y= list, highlight Y1, press [[F3]] **TYPE** → [[F6]] → choose **Y>** {{unverified}}. Reading the roots from the graph is usually faster.

### G. Check a form you found by hand (TABLE)

You found $2x^2 - 12x + 10 = 2(x - 3)^2 - 8$. Check it:

1. [[MENU]] → **TABLE**. Put $2x^2 - 12x + 10$ in Y1 and $2(x - 3)^2 - 8$ in Y2.
2. [[F5]] **SET**: Start $= 0$, End $= 6$, Step $= 1$ → [[EXIT]].
3. [[F6]] **TABL**. If the Y1 and Y2 columns are identical, your algebra is right.

## Differences between fx-9860GII and fx-9860GIII

- The menus used here (EQUA, GRAPH, TABLE, G-Solv) and their F-key positions are expected to be the **same** on both models {{unverified}}.
- On the **fx-9860GIII** some menu icons have new names and a different look (for example *Run-Matrix* instead of RUN•MAT). Select them with the arrow keys and the result is the same {{unverified}}.
- In EQUA → POLY, the **fx-9860GIII** may offer degrees above 3; in AA SL you only need degree 2 (and occasionally 3) {{unverified}}.

## Practice drill — do it until it is automatic

Do each one without looking at the steps above. Check your answer, then repeat the ones you got wrong tomorrow.

| # | Task | Tool | Answer |
|---|---|---|---|
| 1 | Solve $3x^2 + 5x - 4 = 0$ | EQUA | $x \approx 0.591$, $x \approx -2.26$ |
| 2 | Roots of $f(x) = 0.5x^2 - 3x + 2$ | G-Solv ROOT | $x \approx 0.764$, $x \approx 5.24$ |
| 3 | Vertex of $f(x) = -2x^2 + 5x + 3$ | G-Solv MAX | $(1.25,\ 6.125)$ |
| 4 | Intersections of $y = x^2 - 4$ and $y = 2x - 1$ | G-Solv ISCT | $(-1,\ -3)$ and $(3,\ 5)$ |
| 5 | Solve $x^2 - 6x + 4 \leq 0$ | ROOT + graph | $0.764 \leq x \leq 5.24$ |
| 6 | Check: $x^2 + 6x + 2 = (x + 3)^2 - 7$ | TABLE | Columns equal ✓ |
| 7 | A ball has height $h(t) = -4.9t^2 + 12t + 2$. Find the maximum height. | G-Solv MAX | $9.35$ m at $t \approx 1.22$ s |

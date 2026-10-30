:::unverified Partly checked
Key sequences are for the **fx-9860GII / fx-9860GIII**. The STAT → CALC → SET / 1VAR / REG screens have been checked against copies of the Casio manual and the Casio Europe IB guide; items marked {{unverified}} have not.
:::

## Paper 1 or Paper 2?

| Type of question | Paper |
|---|---|
| Outlier fences from given quartiles, mean point of two regression lines | **Paper 1** |
| Effect of adding / multiplying data | **Paper 1** |
| Mean, standard deviation, quartiles of a data set | **Paper 2** — STAT 1VAR |
| Mean, median, mode, $\sigma$ from a **frequency table** | **Paper 2** — List 1 values, List 2 frequencies |
| Estimate of the mean of grouped data | **Paper 2** — STAT 1VAR with frequencies |
| Pearson's $r$ and the regression line | **Paper 2** — STAT REG |

## What you need to be able to do

- [ ] Enter data in lists and get **1-variable statistics**.
- [ ] Use a **frequency table**: values in List 1, frequencies in List 2 (1Var Freq = List2).
- [ ] Do the same with **grouped data** using mid-interval values.
- [ ] Find the **regression line** of $y$ on $x$ and of $x$ on $y$, and **$r$**.
- [ ] Use the regression equation to make a prediction.

## Keys and menus you will use

| What | Where | Keys |
|---|---|---|
| Lists | STAT | [[MENU]] → STAT |
| Calculation settings (XList, **Freq**) | STAT | [[F2]] CALC → [[F6]] SET |
| 1-variable statistics | STAT | [[F2]] CALC → [[F1]] 1VAR |
| Linear regression | STAT | [[F2]] CALC → [[F3]] REG → [[F1]] X → [[F1]] ax+b |
| Clear a list | STAT | [[F6]] ▷ → [[F4]] DEL-A {{unverified}} |

## Step by step

### A. 1-variable statistics

**Example:** $12,\ 15,\ 15,\ 18,\ 21,\ 24,\ 30$.

1. [[MENU]] → **STAT**. Type the values in **List 1**, pressing [[EXE]] after each.
2. [[F2]] **CALC** → [[F6]] **SET**: 1Var XList: `List1`, 1Var Freq: `1`. [[EXIT]].
3. [[F1]] **1VAR**. Read: $\bar{x} = 19.3$, $\sigma x = 5.75$, $n = 7$. Scroll down for minX, $Q_1 = 15$, Med $= 18$, $Q_3 = 24$, maxX.

Use **$\sigma x$** (not $sx$) for the standard deviation.

### B. Frequency table: data in List 1, frequencies in List 2

Use this whenever the data come in a **frequency table** (each value with how many times it appears). Do **not** type every value one by one.

**Example:**

| Number of books read, $x$ | $1$ | $2$ | $3$ | $4$ | $5$ |
|---|---|---|---|---|---|
| Frequency, $f$ | $3$ | $7$ | $6$ | $3$ | $1$ |

1. [[MENU]] → **STAT**. In **List 1** type the **values**: `1` [[EXE]] `2` [[EXE]] `3` [[EXE]] `4` [[EXE]] `5` [[EXE]].
2. Move to **List 2** with [[▶]] and type the **frequencies** in the same order: `3` [[EXE]] `7` [[EXE]] `6` [[EXE]] `3` [[EXE]] `1` [[EXE]].
3. [[F2]] **CALC** → [[F6]] **SET**:
   - 1Var XList: `List1`
   - **1Var Freq: `List2`** (highlight the line and choose LIST, then type `2`) {{unverified}}

   [[EXIT]].
4. [[F1]] **1VAR**. Read:
   - $\bar{x} = 2.6$ (mean)
   - $\sigma x \approx 1.07$ (standard deviation — use $\sigma x$, not $sx$)
   - $n = 20$ (check: it must equal the total frequency)
5. Scroll down with [[▼]]: minX $= 1$, $Q_1 = 2$, **Med $= 2.5$**, $Q_3 = 3$, maxX $= 5$, **Mod $= 2$**.

:::tip Check $n$ first
If $n$ is not the total of the frequencies (here $3 + 7 + 6 + 3 + 1 = 20$), the Freq setting is wrong — the GDC is treating each value as appearing once.
:::

:::note Set Freq back to 1 afterwards
The Freq setting stays in the calculator. For an ordinary list of data (one value per entry), set **1Var Freq: `1`** again, or the results will be wrong.
:::

### C. Grouped data (mid-interval values)

Same method as B, but List 1 holds the **mid-interval values** of the classes.

**Example:** the grouped times in Worked example 3 of the theory.

1. List 1: mid-interval values `5, 15, 25, 35, 45`. List 2: frequencies `5, 12, 18, 10, 5`.
2. CALC → SET: 1Var XList `List1`, **1Var Freq `List2`**.
3. 1VAR: $\bar{x} = 24.6$, $\sigma x \approx 11.1$, $n = 50$. These are **estimates** (grouped data).

### D. Regression line and $r$

**Example:** $x$: $1, 2, 3, 4, 5$; $y$: $2.1, 3.9, 6.2, 7.8, 10.1$.

1. List 1: $x$-values. List 2: $y$-values.
2. CALC → SET: 2Var XList `List1`, 2Var YList `List2`.
3. [[F3]] **REG** → [[F1]] **X** → [[F1]] **ax+b**.
4. Read $a = 1.99$, $b = 0.05$, $r = 0.999$. Write: $y = 1.99x + 0.05$, $r = 0.999$.

**Regression line of $x$ on $y$:** in SET swap the lists (XList `List2`, YList `List1`) and run REG again. The result $y = ax + b$ on the screen then means $x = a\,y + b$.

### E. Prediction

Substitute into the equation in RUN-MAT, e.g. $x = 3.5$: $1.99 \times 3.5 + 0.05 = 7.02$. Only predict inside the data range (interpolation).

## Practice drill — do it until it is automatic

| # | Task | Tool | Answer |
|---|---|---|---|
| 1 | Mean and $\sigma$ of $12, 15, 15, 18, 21, 24, 30$ | 1VAR | $19.3$, $5.75$ |
| 2 | Quartiles of the same data | 1VAR | $Q_1 = 15$, $Q_3 = 24$ |
| 3 | Mean, median, mode and $\sigma$ of the frequency table in B | 1VAR + Freq | $2.6$, $2.5$, $2$, $1.07$ |
| 4 | Estimated mean and $\sigma$ of the grouped data in C | 1VAR + Freq | $24.6$, $11.1$ |
| 5 | Regression line and $r$ for the data in D | REG | $y = 1.99x + 0.05$, $r = 0.999$ |
| 6 | Predict $y$ when $x = 3.5$ | RUN-MAT | $7.02$ |

# Statistics: basic statistics and correlation

:::note What this topic covers
- Population and sample; discrete and continuous data; reliability and bias; sampling techniques.
- Presenting data: frequency tables, histograms, stem-and-leaf diagrams, box plots, cumulative frequency graphs.
- Measures of central tendency and dispersion; grouped data; outliers; effect of constant changes.
- Bivariate data: scatter diagrams, correlation, Pearson's $r$, regression lines of $y$ on $x$ and $x$ on $y$.
:::

## Key terms

| Term | Meaning |
|---|---|
| **Population** | The whole group you want to know about. |
| **Sample** | The part of the population you actually collect data from. |
| **Random sample** | Every member of the population has an equal chance of being chosen. |
| **Discrete data** | Can only take separate values (counts): number of siblings. |
| **Continuous data** | Can take any value in a range (measurements): height, time. |
| **Bias** | A systematic error that makes the sample unrepresentative. |
| **Outlier** | A value far from the rest of the data. |
| **Bivariate data** | Pairs of values $(x,\ y)$ for each individual. |

## 1. Sampling

| Technique | How it works | Comment |
|---|---|---|
| **Simple random** | Every possible sample is equally likely (e.g. random number generator). | Unbiased, but needs a full list of the population. |
| **Convenience** | Choose whoever is easy to reach. | Quick, but likely to be biased. |
| **Systematic** | Every $k$-th member of an ordered list, from a random start. | Simple; biased if the list has a pattern. |
| **Quota** | Fill a fixed number from each group, not randomly. | Not random → can be biased. |
| **Stratified** | Split into groups (strata) and sample each **in proportion** to its size. | Represents every group fairly. |

:::example Worked example 1 — stratified sample
**Question.** A school has $240$ students in Year 11 and $360$ in Year 12. A stratified sample of $50$ students is chosen. How many from each year?

+++

Total $600$. Year 11: $\dfrac{240}{600} \times 50 = 20$. Year 12: $\dfrac{360}{600} \times 50 = 30$.
:::

## 2. Measures of central tendency and dispersion

:::formula booklet Mean of a set of data
$$\bar{x} = \dfrac{\displaystyle\sum_{i=1}^{k} f_i x_i}{n}, \quad \text{where } n = \sum_{i=1}^{k} f_i$$
:::

:::formula booklet Interquartile range
$$\text{IQR} = Q_3 - Q_1$$
:::

:::formula memorize Other measures
- **Median:** the middle value of the ordered data (position $\dfrac{n + 1}{2}$).
- **Mode:** the most frequent value. **Range:** largest $-$ smallest.
- **Quartiles:** $Q_1$ = median of the lower half, $Q_3$ = median of the upper half. **Percentiles:** the $p$-th percentile has $p\%$ of the data below it.
- **Standard deviation** $\sigma$ (spread around the mean) and **variance** $\sigma^2$: found with the **GDC**.
:::

:::formula memorize Outliers
A value is an **outlier** if it is more than $1.5 \times \text{IQR}$ from the nearest quartile:
$$x < Q_1 - 1.5 \times \text{IQR} \quad \text{or} \quad x > Q_3 + 1.5 \times \text{IQR}$$
:::

:::example Worked example 2 — summary statistics
**Question.** For the data $3,\ 5,\ 7,\ 7,\ 8,\ 10,\ 12,\ 15,\ 20$, find the mean, median, quartiles and IQR, and decide if there are outliers.

+++

Mean $= \dfrac{87}{9} \approx 9.67$. Median (5th value) $= 8$.

Lower half $3,\ 5,\ 7,\ 7 \Rightarrow Q_1 = 6$. Upper half $10,\ 12,\ 15,\ 20 \Rightarrow Q_3 = 13.5$. $\ \text{IQR} = 7.5$.

Fences: $6 - 11.25 = -5.25$ and $13.5 + 11.25 = 24.75$. All values lie between them: **no outliers**.
:::

## 3. Grouped data

- Use the **mid-interval value** of each class as $x$.
- **Interval width** = upper boundary $-$ lower boundary. **Modal class** = class with the highest frequency.
- Results from grouped data are **estimates**.

:::example Worked example 3 — grouped data
**Question.** Times (minutes) for $50$ students:

| Time $t$ | $0 \leq t < 10$ | $10 \leq t < 20$ | $20 \leq t < 30$ | $30 \leq t < 40$ | $40 \leq t < 50$ |
|---|---|---|---|---|---|
| Frequency | $5$ | $12$ | $18$ | $10$ | $5$ |

Estimate the mean and write down the modal class.

+++

Mid-interval values $5,\ 15,\ 25,\ 35,\ 45$:
$$\bar{x} \approx \dfrac{5(5) + 12(15) + 18(25) + 10(35) + 5(45)}{50} = \dfrac{1230}{50} = 24.6 \text{ minutes}$$
Modal class: $20 \leq t < 30$.
:::

## 4. Presenting data

- **Histogram** (equal class widths): bars touch; height = frequency.
- **Stem-and-leaf diagram:** keeps every value; always include a key (e.g. $3 \mid 7$ means $37$).
- **Box-and-whisker plot:** shows minimum, $Q_1$, median, $Q_3$, maximum. Outliers are drawn as separate crosses; the whisker stops at the last value that is not an outlier.
- **Cumulative frequency graph:** plot cumulative frequency against the **upper boundary** of each class and join with a smooth curve. Read the median at $\dfrac{n}{2}$, $Q_1$ at $\dfrac{n}{4}$, $Q_3$ at $\dfrac{3n}{4}$, the $p$-th percentile at $\dfrac{p}{100} \times n$.

## 5. Effect of constant changes

:::formula memorize Changing every data value
| Change to every value | Mean, median, quartiles | Standard deviation, IQR, range | Variance |
|---|---|---|---|
| Add $k$ | $+\,k$ | no change | no change |
| Multiply by $k$ | $\times\, k$ | $\times\, \lvert k\rvert$ | $\times\, k^2$ |
:::

:::example Worked example 4 — scaling marks
**Question.** Test marks have mean $62$ and standard deviation $8$. Each mark is multiplied by $1.5$ and then $5$ is added. Find the new mean and standard deviation.

+++

Mean: $62 \times 1.5 + 5 = 98$. Standard deviation: $8 \times 1.5 = 12$ (adding $5$ does not change the spread).
:::

## 6. Correlation

- **Scatter diagram:** plot the pairs $(x,\ y)$. Look for the direction (positive / negative), strength (strong / weak) and form (linear / not linear).
- **Pearson's product–moment correlation coefficient** $r$ (GDC): $-1 \leq r \leq 1$. It measures **linear** correlation only.

| $r$ close to | Interpretation |
|---|---|
| $1$ | strong positive linear correlation |
| $0$ | no (or very weak) linear correlation |
| $-1$ | strong negative linear correlation |

**Correlation does not imply causation.**

## 7. Regression lines

- The **regression line of $y$ on $x$** (GDC) is used to **predict $y$ from $x$**.
- The **regression line of $x$ on $y$** is used to **predict $x$ from $y$**.
- **Both lines pass through the mean point $(\bar{x},\ \bar{y})$** — so the two lines meet there.
- **Interpolation** (inside the data range) is reliable if $r$ is strong. **Extrapolation** (outside the range) is not reliable.

:::example Worked example 5 — using regression lines
**Question.** For a set of data, the regression line of $y$ on $x$ is $y = 2x + 4$ and the regression line of $x$ on $y$ is $x = 0.4y + 1$. (a) Estimate $y$ when $x = 6$. (b) Find $\bar{x}$ and $\bar{y}$.

+++

(a) Predicting $y$ → use $y$ on $x$: $y = 2(6) + 4 = 16$.

(b) Both lines pass through $(\bar{x},\ \bar{y})$. Substitute: $\bar{x} = 0.4(2\bar{x} + 4) + 1 = 0.8\bar{x} + 2.6 \Rightarrow 0.2\bar{x} = 2.6 \Rightarrow \bar{x} = 13$, and $\bar{y} = 2(13) + 4 = 30$.
:::

## Common mistakes

:::mistake Common mistakes
- **Using the wrong regression line.** To predict $x$ from $y$, use the line of $x$ on $y$ (not a rearranged $y$ on $x$ line).
- **Forgetting frequencies** on the GDC (1Var Freq must point to the frequency list).
- **Reading $sx$ instead of $\sigma x$.** IB uses $\sigma x$ for the standard deviation of the data.
- **Interpreting $r$ without context.** Say "strong positive linear correlation between height and mass", not just "strong".
- **Plotting cumulative frequency at mid-points.** Use the upper class boundaries.
- **Saying an outlier is "wrong".** It is just unusual; check it against $1.5 \times \text{IQR}$.
:::

## Exam tips

:::tip Exam tips
- Most of this topic is **Paper 2** with the GDC — write down the values you get (e.g. "$r = 0.913$").
- **Paper 1** questions use given summary values: outlier fences, the mean point of two regression lines, the effect of constant changes.
- Give the regression equation with coefficients to 3 s.f.: $y = 1.99x + 0.0500$.
- Comment on **reliability**: is the value inside the data range? Is $r$ strong?
:::

"""Builds the Y9 statistics lessons for the GDC trainer (use-of-gdc/y9-statistics/lessons/<section>.json).
Run from the repository folder: python3 use-of-gdc/tools/gen-y9-statistics.py
Running it overwrites the JSON files: edit the lessons here, not in the JSON.
The step format is described at the top of ib-aa-sl-review/site/assets/js/gdc.js."""
import json, os

OUT = os.path.join(os.path.dirname(__file__), "..", "y9-statistics", "lessons")

# ---------- keys ----------
SIMPLE = {".": "DOT", "EXE": "EXE", ">": "RIGHT", "<": "LEFT", "v": "DOWN", "^": "UP", "EXIT": "EXIT", "MENU": "MENU"}


def tk(s):
    """'12 EXE 15 EXE F2' -> (keys, add). 'F2=List 2' makes the key type that text; digit runs become single keys."""
    keys, add = [], []
    for t in s.split():
        txt = None
        if "=" in t:
            t, txt = t.split("=", 1)
            txt = txt.replace("_", " ")
        if t in SIMPLE:
            keys.append(SIMPLE[t]); add.append(txt)
        elif t.startswith("F") and t[1:].isdigit():
            keys.append(t); add.append(txt if txt is not None else "")
        elif t.replace(".", "").isdigit():
            for ch in t:
                keys.append("DOT" if ch == "." else ch); add.append(None)
        else:
            raise ValueError(t)
    return keys, add


def keys(do, s, screen, entry=None, hint=None):
    k, add = tk(s)
    st = {"do": do, "keys": k}
    if hint: st["hint"] = hint
    if entry is not None:
        e = dict(entry)
        if any(a is not None for a in add): e["add"] = add
        st["entry"] = e
    st["screen"] = screen
    return st


def ask(q, options, why, answer=0):
    """Multiple choice; the correct option is listed first (the page shuffles them)."""
    return {"ask": q, "options": options, "answer": answer, "why": why}


def select(name, screen, hint=None):
    st = {"do": "Highlight **%s** with the arrow keys and press [[EXE]]." % name, "select": name}
    if hint: st["hint"] = hint
    st["screen"] = screen
    return st


def scroll(do, to, screen, hint=None):
    st = {"do": do, "scroll": to}
    if hint: st["hint"] = hint
    st["screen"] = screen
    return st


def lesson(id, title, tool, task, start, steps, result, unverified=False):
    L = {"id": id, "title": title, "tool": tool, "task": task}
    if unverified: L["unverified"] = True
    L.update({"start": start, "steps": steps, "result": result})
    return L


def save(section, eyebrow, heading, lessons):
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, section + ".json"), "w", encoding="utf-8") as f:
        json.dump({"topic": section, "eyebrow": eyebrow, "heading": heading, "calculator": "Casio fx-9860GII / GIII", "lessons": lessons},
                  f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(section, len(lessons), "lessons", sum(len(l["steps"]) for l in lessons), "steps")


# ---------- screens ----------
STAT_F = ["GRPH", "CALC", "TEST", "INTR", "DIST", "▷"]
CALC_F = ["1VAR", "2VAR", "REG", "", "", "SET"]
BLANK = {"type": "text", "lines": []}
MENU_STEP = {"do": "Press [[MENU]] to open the main menu.", "keys": ["MENU"], "screen": {"type": "menu", "sel": "RUN•MAT"}}


def lists(l1, l2=(), cur=(0, 0), fkeys=STAT_F):
    """STAT list editor; cur = (list index, row index) of the highlighted cell."""
    cols = [[g(v) for v in l1]] + ([[g(v) for v in l2]] if l2 else [])
    return {"type": "list", "cols": cols, "cur": list(cur), "fkeys": fkeys}


SET1 = ["1Var XList :List1", "1Var Freq  :1", "2Var XList :List1", "2Var YList :List2", "2Var Freq  :1"]
SETF = ["1Var XList :List1", "1Var Freq  :List2", "2Var XList :List1", "2Var YList :List2", "2Var Freq  :1"]


# ---------- what the calculator works out (1-Variable), from the data ----------
def g(x):
    """A number the way the fx-9860GII shows it: up to 10 significant figures, no trailing zeros."""
    if abs(x - round(x)) < 1e-9:
        return str(int(round(x)))
    s = "%.10g" % x
    return s.rstrip("0").rstrip(".") if "." in s and "e" not in s else s


def median(v):
    n = len(v)
    return v[n // 2] if n % 2 else (v[n // 2 - 1] + v[n // 2]) / 2


def one_var(values, freqs=None):
    """Mean, Σx, Σx², σx, sx, n, minX, Q1, Med, Q3, maxX, Mod, Mod:n, Mod:F as the calculator gives them.
    Quartiles: median of each half, leaving out the middle value when n is odd (the fx-9860GII method)."""
    freqs = freqs or [1] * len(values)
    data = sorted(x for x, f in zip(values, freqs) for _ in range(f))
    n = len(data)
    sx, sx2 = sum(data), sum(x * x for x in data)
    mean = sx / n
    var = sx2 / n - mean * mean
    lo, hi = data[: n // 2], data[(n + 1) // 2:]
    counts = {}
    for x in data: counts[x] = counts.get(x, 0) + 1
    top = max(counts.values())
    modes = [x for x, c in counts.items() if c == top]
    mode = min(modes)
    return {"mean": mean, "sx": sx, "sx2": sx2, "sigma": var ** 0.5, "s": (var * n / (n - 1)) ** 0.5, "n": n,
            "min": data[0], "q1": median(lo), "med": median(data), "q3": median(hi), "max": data[-1], "mod": mode,
            "modn": len(modes), "modf": top}


def screen1(r):
    return {"type": "text", "lines": ["1-Variable", "x̄   =" + g(r["mean"]), "Σx  =" + g(r["sx"]), "Σx² =" + g(r["sx2"]),
                                      "σx  =" + g(r["sigma"]), "sx  =" + g(r["s"]), "n   =" + g(r["n"])]}


def screen2(r):
    return {"type": "text", "lines": ["1-Variable", "minX=" + g(r["min"]), "Q1  =" + g(r["q1"]), "Med =" + g(r["med"]),
                                      "Q3  =" + g(r["q3"]), "maxX=" + g(r["max"]), "Mod =" + g(r["mod"])]}


def screen3(r):
    """The end of the 1-Variable results: how many modes there are (Mod:n) and how often the mode appears (Mod:F)."""
    return {"type": "text", "lines": ["1-Variable", "Q3  =" + g(r["q3"]), "maxX=" + g(r["max"]), "Mod =" + g(r["mod"]),
                                      "Mod:n=" + g(r["modn"]), "Mod:F=" + g(r["modf"])]}


def mode_info(r, what="value", grouped=None):
    """Scroll to Mod:n and Mod:F and ask what they mean. grouped = the modal class, for grouped data."""
    one = r["modn"] == 1
    steps = [keys("Press [[▼]] again to reach the end of the list: **Mod:n** and **Mod:F**.", "v", screen3(r),
                  hint="Keep pressing ▼ until you see Mod:n and Mod:F at the bottom.")]
    if grouped:
        steps.append(ask("Mod $= %s$, Mod:n $= %s$, Mod:F $= %s$. What do they tell you?" % (g(r["mod"]), g(r["modn"]), g(r["modf"])),
                         ["The class with midpoint $%s$ is the modal class (%s) and it has frequency $%s$" % (g(r["mod"]), grouped, g(r["modf"])),
                          "The mode is exactly $%s$" % g(r["mod"]), "There are $%s$ modes" % g(r["modf"])],
                         "With grouped data, Mod is the **midpoint** of the modal class. Mod:n $= 1$: there is one modal class. Mod:F $= %s$: its frequency." % g(r["modf"])))
    else:
        steps.append(ask("Mod:n $= %s$ and Mod:F $= %s$. What do they tell you?" % (g(r["modn"]), g(r["modf"])),
                         ["There is %s mode, and it appears $%s$ times" % ("one" if one else g(r["modn"]), g(r["modf"])),
                          "There are $%s$ modes" % g(r["modf"]), "The mode is $%s$" % g(r["modf"])],
                         "**Mod:n** is the **number of modes**: $%s$ here. **Mod:F** is the **frequency of the mode**: how many times the %s %s appears. "
                         "If Mod:n were $2$, there would be two modes and you would write both." % (g(r["modn"]), what, g(r["mod"]))))
    return steps


def typing(values, start=0):
    """Key string and the instruction text for typing values into a list, each followed by EXE."""
    return " ".join("%s EXE" % g(v) for v in values), " ".join("`%s` [[EXE]]" % g(v) for v in values)




LIST2_F = ["TOOL", "EDIT", "DEL", "DEL-A", "INS", "▷"]
SET_F = ["1", "LIST"]


def type_in(values, col=0, other=(), label="List 1", hint=None):
    """Steps that type values into List 1 (col 0) or List 2 (col 1), five at a time; the list fills up live."""
    steps, done = [], []
    for i in range(0, len(values), 5):
        chunk = values[i:i + 5]
        done = done + chunk
        k, t = typing(chunk)
        scr = lists(done, cur=(0, len(done))) if col == 0 else lists(other, done, cur=(1, len(done)))
        text = ("Type them into **%s**, pressing [[EXE]] after each one: " % label if i == 0 else "Keep going: ") + t + "."
        steps.append(keys(text, k, scr, hint=hint if i == 0 else None))
    return steps


def to_list2(V):
    """From the end of List 1 to the top of List 2."""
    n = len(V)
    return [
        keys("Move across to **List 2** with [[▶]].", ">", lists(V, cur=(1, n))),
        keys("Go up to the top of List 2: press [[▲]] %d times." % n, " ".join(["^"] * n), lists(V, cur=(1, 0)),
             hint="The frequency of the first value must go in row 1, next to it."),
    ]


def set_freq_list2(V, Fq, why_first=True):
    """CALC → SET → 1Var Freq: List2 → EXIT."""
    last = lists(V, Fq, cur=(1, len(Fq)), fkeys=CALC_F)
    steps = [
        keys("Press [[F2]] **CALC**.", "F2", last),
        keys("Press [[F6]] **SET** to see the settings.", "F6", {"type": "text", "lines": SET1, "hl": 0}),
    ]
    if why_first:
        steps.append(ask("**1Var Freq** says $1$. If we leave it like that, what will the calculator do?",
                         ["Count each value in List 1 only once, and ignore the frequencies", "Use the frequencies in List 2 anyway", "Give an error"],
                         "With Freq $= 1$ the calculator ignores List 2: it would think each value appears once. We have to tell it that the frequencies are in **List 2**."))
    steps += [
        scroll("Press [[▼]] to highlight **1Var Freq**.", 1, {"type": "text", "lines": SET1, "hl": 1, "fkeys": SET_F}),
        keys("Press [[F2]] **LIST**, type `2` and press [[EXE]].", "F2=List 2 EXE", {"type": "text", "lines": SETF, "hl": 1, "fkeys": SET_F},
             {"line": 1, "prefix": "1Var Freq  :"}, hint="LIST is on [[F2]] at the bottom of the screen. Then the number of the list: 2."),
        keys("Now it reads **1Var Freq: List2**. Press [[EXIT]] to go back.", "EXIT", last),
    ]
    return steps


def check_set_list2(V, Fq):
    """The setting is still List2 from last time: look and confirm."""
    last = lists(V, Fq, cur=(1, len(Fq)), fkeys=CALC_F)
    return [
        keys("Press [[F2]] **CALC**.", "F2", last),
        keys("Press [[F6]] **SET**.", "F6", {"type": "text", "lines": SETF, "hl": 0}),
        ask("The calculator remembers the last setting. Is it right for this table?", ["Yes: XList is List1 (the values) and Freq is List2 (the frequencies)", "No: Freq must be $1$", "No: XList must be List2"],
            "The values are in List 1 and the frequencies in List 2, so it is right. Always check it: the calculator keeps whatever was set last."),
        keys("Press [[EXIT]].", "EXIT", last),
    ]


def results(V, Fq=None):
    R = one_var(V, Fq)
    return R, keys("Press [[F1]] **1VAR**.", "F1", screen1(R)), keys("Press [[▼]] to scroll down.", "v", screen2(R),
                                                                    hint="On your calculator, keep pressing ▼ until you see minX, Med, maxX and Mod.")


def mstr(x):
    return "$" + g(x) + "$"


# =====================================================================
# 1. A list of numbers
# =====================================================================
OLD1, OLD2 = [3, 7, 1, 9], [2, 2, 5, 1]
clear = lesson("clear", "Before you start: clear old data", "STAT → ▷ → DEL-A",
               "The lists still have numbers from last time. Delete them before you type new data.",
               BLANK, [
                   dict(MENU_STEP),
                   select("STAT", lists(OLD1, OLD2), "STAT is the second icon of the first row."),
                   ask("Someone used the calculator before you: List 1 and List 2 have numbers in them. Why delete them?",
                       ["The old numbers would be counted with the new ones", "The calculator works faster", "It doesn't matter"],
                       "The calculator uses **every** number in the list. Old numbers mixed with yours give wrong answers."),
                   keys("Press [[F6]] **▷** to see more options.", "F6", lists(OLD1, OLD2, fkeys=LIST2_F),
                        hint="▷ on [[F6]] means \"more\": it shows a second row of options."),
                   keys("Press [[F4]] **DEL-A** (delete all).", "F4", {"type": "text", "lines": ["", "", "Delete All Data?"], "fkeys": ["Yes", "", "", "", "", "No"]}),
                   keys("Press [[F1]] **Yes**.", "F1", lists([], OLD2, fkeys=LIST2_F)),
                   ask("List 1 is empty now. What about List 2?", ["It still has old numbers: delete it too", "It was deleted too", "Leave it, we only use List 1"],
                       "DEL-A only deletes the list the cursor is on. Later we will use List 2 for frequencies, so clear it as well."),
                   keys("Move to **List 2** with [[▶]].", ">", lists([], OLD2, cur=(1, 0), fkeys=LIST2_F)),
                   keys("Press [[F4]] **DEL-A**.", "F4", {"type": "text", "lines": ["", "", "Delete All Data?"], "fkeys": ["Yes", "", "", "", "", "No"]}),
                   keys("Press [[F1]] **Yes**.", "F1", lists([], [], cur=(1, 0), fkeys=LIST2_F)),
                   keys("Press [[◀]] to go back to List 1.", "<", lists([], [], fkeys=LIST2_F)),
                   keys("Press [[F6]] **▷** to see the first options again.", "F6", lists([], [])),
               ], "Both lists are empty. Do this every time you start a new question.")

D1 = [8, 4, 2, 10, 2, 5, 9, 12, 2, 6]
R1, one1, two1 = results(D1)
ex1 = lesson("ex1", "Question 1: mean, mode, median, range", "STAT → CALC → 1VAR",
             "For the set $\\{8, 4, 2, 10, 2, 5, 9, 12, 2, 6\\}$ find (a) the **mean**, (b) the **mode**, (c) the **median**, (d) the **range**. The lists are empty.",
             lists([]), [
                 ask("How many numbers are in the set?", ["$10$", "$8$, because $2$ is repeated", "$12$, the biggest number"],
                     "Count every number, even the repeated ones: $10$. Remember it: you will check it on the calculator."),
                 ask("$2$ appears three times. How many times do you type it?", ["$3$ times", "Once: the calculator knows it repeats", "It doesn't matter"],
                     "Every number goes in the list. If you type $2$ only once, the mean, the mode and the median all change."),
             ] + type_in(D1, hint="Each number appears at the bottom of the screen while you type it, and goes into the list when you press [[EXE]]. The order doesn't matter.") + [
                 keys("Press [[F2]] **CALC** to calculate.", "F2", lists(D1, cur=(0, 10), fkeys=CALC_F)),
                 keys("Press [[F6]] **SET** to check the settings.", "F6", {"type": "text", "lines": SET1, "hl": 0}),
                 ask("**1Var XList: List1** and **1Var Freq: 1**. What do they mean?", ["The numbers are in List 1 and each one counts once", "There is only $1$ number", "The answers are rounded to $1$ decimal place"],
                     "XList tells the calculator where the numbers are (List 1). Freq $= 1$: each number counts once. That is right for a list of numbers."),
                 keys("The settings are right. Press [[EXIT]].", "EXIT", lists(D1, cur=(0, 10), fkeys=CALC_F)),
                 one1,
                 ask("Check **n** first. What should it be?", ["$10$", "$60$", "$6$"],
                     "$n$ is how many numbers the calculator used. It must be the $10$ you counted. If not, a number is missing or typed twice: go back and fix the list."),
                 ask("(a) Which line is the **mean**?", ["$\\bar{x} = " + g(R1["mean"]) + "$", "$\\Sigma x = " + g(R1["sx"]) + "$", "$n = " + g(R1["n"]) + "$"],
                     "$\\bar{x}$ (\"x bar\") is the mean. $\\Sigma x$ is the total: mean $= \\dfrac{\\text{total}}{n} = \\dfrac{" + g(R1["sx"]) + "}{" + g(R1["n"]) + "} = " + g(R1["mean"]) + "$. You don't need $\\Sigma x^2$, $\\sigma x$ or $sx$ this year."),
                 two1,
                 ask("(b) What is the **mode**?", ["$2$", "$3$, because it appears $3$ times", "$12$, the biggest"],
                     "Mod is the mode: the number that appears most often. $2$ appears $3$ times. The mode is the **number** ($2$), not how many times it appears."),
                 ask("(c) Which line is the **median**?", ["Med $= " + g(R1["med"]) + "$", "Q1 $= " + g(R1["q1"]) + "$", "Q3 $= " + g(R1["q3"]) + "$"],
                     "Med is the median, the middle number when they are in order: $2, 2, 2, 4, \\mathbf{5}, \\mathbf{6}, 8, 9, 10, 12$. With $10$ numbers there are two in the middle, so it is halfway between $5$ and $6$: $5.5$."),
                 ask("(d) The calculator doesn't show the range. How do you find it?", ["maxX $-$ minX $= " + g(R1["max"]) + " - " + g(R1["min"]) + " = " + g(R1["max"] - R1["min"]) + "$", "Q3 $-$ Q1", "It is $n$"],
                     "Range $=$ largest $-$ smallest. maxX is the largest and minX the smallest."),
             ] + mode_info(R1, "number") + [
             ], "(a) mean $= 6$, (b) mode $= 2$, (c) median $= 5.5$, (d) range $= 12 - 2 = 10$.")

D5 = [7, 4, 5, 4, 8, 10, 14, 4]
R5, one5, two5 = results(D5)
ex5 = lesson("ex5", "Question 5: find T, then check", "by hand, then STAT",
             "Temperatures in °C for eight days: $7, 4, 5, 4, 8, T, 14, 4$. The mean is $7$ °C. (a) Find $T$. (b) Write down the mode. (c) Find the median. Then **check with the GDC**. The lists are empty.",
             lists([]), [
                 ask("The mean of the $8$ temperatures is $7$. What is their **total**?", ["$8 \\times 7 = 56$", "$7 + 8 = 15$", "$7$"],
                     "Mean $= \\dfrac{\\text{total}}{8}$, so total $=$ mean $\\times 8 = 56$."),
                 ask("The seven numbers we know add up to $7 + 4 + 5 + 4 + 8 + 14 + 4 = 46$. So $T$ is…", ["$56 - 46 = 10$", "$46 \\div 7$", "$56 + 46$"],
                     "The total must be $56$: $T = 56 - 46 = 10$."),
                 ask("Now check it: which numbers do you type into List 1?", ["$7, 4, 5, 4, 8, 10, 14, 4$", "$7, 4, 5, 4, 8, 14, 4$", "$7, 4, 5, 4, 8, T, 14, 4$"],
                     "Type all eight, with $T = 10$ in its place. The calculator can't use a letter."),
             ] + type_in(D5) + [
                 keys("Press [[F2]] **CALC**. (Freq should still be $1$: check with [[F6]] SET if you are not sure.)", "F2", lists(D5, cur=(0, 8), fkeys=CALC_F)),
                 keys("Press [[F1]] **1VAR**.", "F1", screen1(R5)),
                 ask("Is $T = 10$ right?", ["Yes: $\\bar{x} = 7$ and $n = 8$", "No: $\\Sigma x$ should be $7$", "We can't tell"],
                     "The calculator gives a mean of $7$ with $8$ values, as the question says. If the mean were not $7$, $T$ would be wrong."),
                 two5,
                 ask("(b) and (c): the mode and the median?", ["Mode $4$, median $6$", "Mode $3$, median $6$", "Mode $4$, median $5$"],
                     "Mod $= 4$ ($4$ appears $3$ times). In order: $4, 4, 4, \\mathbf{5}, \\mathbf{7}, 8, 10, 14$: the median is halfway between $5$ and $7$, so $6$."),
             ] + mode_info(R5, "temperature") + [
             ], "(a) $T = 10$, (b) mode $= 4$, (c) median $= 6$.")

D7 = [63, 76, 99, 65, 63, 51, 52, 95, 63, 71, 65, 83]
R7, one7, two7 = results(D7)
ex7 = lesson("ex7", "Question 7: weights (practice)", "STAT → CALC → 1VAR",
             "Weights in kg of 12 students: $63, 76, 99, 65, 63, 51, 52, 95, 63, 71, 65, 83$. (a) State the mode. (b) Calculate the mean. Extended: one student leaves and the mean of the other 11 becomes $70$ kg. (c) Find the weight of that student. (d) Find the range. The lists are empty.",
             lists([]), type_in(D7) + [
                 keys("Press [[F2]] **CALC**.", "F2", lists(D7, cur=(0, 12), fkeys=CALC_F)),
                 keys("Press [[F1]] **1VAR**.", "F1", screen1(R7)),
                 ask("$n = 12$ and the mean?", ["$\\bar{x} = 70.5$ kg", "$\\bar{x} = 846$ kg", "$\\bar{x} = 12$ kg"], "$\\bar{x} = 70.5$. $\\Sigma x = 846$ is the total weight."),
                 two7,
                 ask("(a) The mode?", ["$63$ kg", "$3$", "$65$ kg"], "$63$ appears $3$ times, more than any other weight."),
                 ask("(c) After one student leaves, the total of the 11 is $11 \\times 70 = 770$. The student who left weighs…", ["$846 - 770 = 76$ kg", "$70.5 - 70 = 0.5$ kg", "$770 \\div 11 = 70$ kg"],
                     "Total before $-$ total after $=$ the weight of the student who left: $846 - 770 = 76$ kg. $\\Sigma x$ on the calculator gives you the $846$."),
                 ask("(d) The range?", ["$99 - 51 = 48$ kg", "$83 - 63 = 20$ kg", "$12$"], "maxX $-$ minX $= 99 - 51 = 48$ kg."),
             ] + mode_info(R7, "weight") + [
             ], "(a) $63$ kg, (b) $70.5$ kg, (c) $76$ kg, (d) $48$ kg.")

save("list", "Y9 Statistics · Section 1", "A list of numbers", [clear, ex1, ex5, ex7])


# =====================================================================
# 2. Frequency tables
# =====================================================================
V8, F8 = [1, 2, 3, 4, 5, 6, 7], [1, 4, 2, 3, 4, 5, 1]
R8, one8, two8 = results(V8, F8)
ex8 = lesson("ex8", "Question 8: grades", "STAT, 1Var Freq: List2",
             "Grades of 20 IB students. Completed table — grade: $1, 2, 3, 4, 5, 6, 7$; frequency: $1, 4, 2, 3, 4, 5, 1$. (b) Write down the modal grade. (c) Find the median grade and check it with the GDC. The lists are empty.",
             lists([]), [
                 ask("In this table, what does **frequency** mean?", ["How many students got each grade", "The grade of each student", "The total of the grades"],
                     "Frequency $=$ how many times something happens. Here: how many students got each grade."),
                 ask("Grade $6$ has frequency $5$. What does that tell you?", ["$5$ students got a $6$", "$6$ students got a $5$", "The 5th student got a 6"],
                     "The grade is the **value** we measured ($6$); the frequency is how many students got it ($5$)."),
                 ask("Which row is the **variable** (the thing we measured) and which is the **frequency**?", ["Variable: the grades $1$ to $7$. Frequency: $1, 4, 2, 3, 4, 5, 1$", "Variable: $1, 4, 2, 3, 4, 5, 1$. Frequency: the grades", "Both are frequencies"],
                     "The variable is what each student has (a grade). The frequency counts the students."),
                 ask("How many students are there in total?", ["$20$: add the frequencies", "$7$: there are 7 grades", "$28$: add the grades"],
                     "$1 + 4 + 2 + 3 + 4 + 5 + 1 = 20$. The calculator's $n$ must say $20$."),
                 ask("So what goes in each list?", ["List 1: the grades. List 2: the frequencies", "List 1: the frequencies. List 2: the grades", "All $20$ grades in List 1, one by one"],
                     "Values in List 1, frequencies in List 2, each frequency next to its value. (Typing all $20$ grades one by one also works, but it is slow and easy to get wrong.)"),
                 dict(MENU_STEP),
                 select("STAT", lists([])),
             ] + type_in(V8, label="List 1 (the grades)") + to_list2(V8) + type_in(F8, col=1, other=V8, label="List 2 (the frequencies)",
                                                                                    hint="Same order as the grades: the frequency of grade 1 goes next to 1.") + [
                 ask("Check the lists. Which pair is in the same row?", ["Grade $6$ and frequency $5$", "Grade $6$ and frequency $1$", "Grade $5$ and frequency $5$"],
                     "Each frequency must sit next to its grade. If they are shifted by a row, every answer will be wrong."),
             ] + set_freq_list2(V8, F8) + [
                 one8,
                 ask("Check **n** first. What should it be?", ["$20$, the number of students", "$7$, the number of grades", "$84$"],
                     "$n = 20$: the calculator used the frequencies. If it says $7$, Freq is still $1$."),
                 ask("The mean grade?", ["$\\bar{x} = " + g(R8["mean"]) + "$", "$\\Sigma x = " + g(R8["sx"]) + "$", "$4$"],
                     "Mean $= \\dfrac{\\Sigma x}{n} = \\dfrac{" + g(R8["sx"]) + "}{20} = " + g(R8["mean"]) + "$."),
                 two8,
                 ask("(b) The **modal** grade?", ["$6$", "$5$, the biggest frequency", "$7$, the best grade"],
                     "The mode is the **grade** with the biggest frequency: grade $6$ ($5$ students). Not the frequency $5$ itself!"),
                 ask("(c) The median grade?", ["Med $= " + g(R8["med"]) + "$", "Q1 $= " + g(R8["q1"]) + "$", "$4$"],
                     "With $20$ students the median is halfway between the 10th and 11th grades in order: $4$ and $5$, so $4.5$."),
                 ask("And the range?", ["maxX $-$ minX $= 7 - 1 = 6$", "$5 - 1 = 4$ (frequencies)", "$20$"],
                     "Use the grades, not the frequencies: largest grade $-$ smallest grade."),
             ] + mode_info(R8, "grade") + [
             ], "Modal grade $6$, median $4.5$, mean $4.2$, range $6$. Leave **1Var Freq: List2** while you use frequency tables; set it back to $1$ for a plain list of numbers.")

V9, F9 = [0, 1, 2, 3, 4, 5], [4, 3, 8, 5, 4, 1]
R9, one9, two9 = results(V9, F9)
ex9 = lesson("ex9", "Question 9: dental fillings", "STAT, 1Var Freq: List2",
             "Number of fillings $0, 1, 2, 3, 4, 5$ with frequency $4, 3, 8, q, 4, 1$, for $25$ children. (a) Find $q$. (b) Find (i) the mean and (ii) the median number of fillings. The lists are empty.",
             lists([]), [
                 ask("Which is the variable and which is the frequency?", ["Variable: number of fillings. Frequency: number of children", "Variable: number of children. Frequency: number of fillings", "Both are the variable"],
                     "We measured the number of fillings of each child; the frequency counts the children."),
                 ask("(a) There are $25$ children. What is $q$?", ["$25 - (4 + 3 + 8 + 4 + 1) = 5$", "$25 \\div 6$", "$3$"],
                     "The frequencies add up to the number of children: $20 + q = 25$, so $q = 5$."),
             ] + type_in(V9, label="List 1 (fillings)") + to_list2(V9) + type_in(F9, col=1, other=V9, label="List 2 (frequencies, with q = 5)") + check_set_list2(V9, F9) + [
                 one9,
                 ask("$n$ and the mean?", ["$n = 25$, mean $= 2.2$", "$n = 6$, mean $= 2.5$", "$n = 25$, mean $= 55$"], "$n$ matches the $25$ children, and $\\bar{x} = \\dfrac{55}{25} = 2.2$."),
                 two9,
                 ask("(ii) The median?", ["$2$", "$8$", "$2.5$"], "With $25$ children the median is the 13th: $4 + 3 = 7$ children have $0$ or $1$ filling, so the 8th to the 15th have $2$. The median is $2$."),
             ] + mode_info(R9, "number of fillings") + [
             ], "(a) $q = 5$, (b) (i) mean $2.2$, (ii) median $2$.")

V10, F10 = [0, 1, 2, 3, 4, 5], [16, 22, 19, 17, 1, 5]
R10, one10, two10 = results(V10, F10)
ex10 = lesson("ex10", "Question 10: goals (practice)", "STAT, 1Var Freq: List2",
              "Number of goals $0, 1, 2, 3, 4, 5$ in $16, 22, 19, 17, 1, 5$ matches ($80$ matches). Find (a) the mean and (b) the median number of goals, and the mode. The lists are empty.",
              lists([]), type_in(V10, label="List 1 (goals)") + to_list2(V10) + type_in(F10, col=1, other=V10, label="List 2 (matches)") + check_set_list2(V10, F10) + [
                  one10,
                  ask("Check $n$ and read the mean.", ["$n = 80$, mean $= 1.75$", "$n = 6$, mean $= 2.5$", "$n = 80$, mean $= 140$"], "$n = 80$ matches. $\\Sigma x = 140$ goals in total, so the mean is $\\dfrac{140}{80} = 1.75$."),
                  two10,
                  ask("(b) Median and mode?", ["Median $2$, mode $1$", "Median $2$, mode $22$", "Median $19$, mode $1$"],
                      "Med $= 2$. The mode is the number of **goals** with the most matches: $1$ goal ($22$ matches). $22$ is a frequency, not a mode."),
              ] + mode_info(R10, "number of goals") + [
              ], "(a) mean $1.75$, (b) median $2$, mode $1$.")

save("frequency", "Y9 Statistics · Section 2", "Frequency tables", [ex8, ex9, ex10])


# =====================================================================
# 3. Grouped data
# =====================================================================
M16, F16 = [4.5, 14.5, 24.5, 34.5, 44.5, 54.5], [6, 9, 7, 5, 2, 1]
R16, one16, two16 = results(M16, F16)
ex16 = lesson("ex16", "Question 16: emails", "midpoints → STAT",
              "Emails sent last week by 30 students, grouped: $0$–$9$: $6$, $10$–$19$: $9$, $20$–$29$: $7$, $30$–$39$: $5$, $40$–$49$: $2$, $50$–$59$: $1$. (c) Find the modal class. (f) Estimate the mean number of emails. The lists are empty and **1Var Freq** is $1$.",
              lists([]), [
                  ask("We know that $6$ students sent between $0$ and $9$ emails, but not exactly how many each. Which **one number** best represents the class $0$–$9$?",
                      ["$4.5$, the middle of the class", "$0$–$9$: type the whole interval", "$9$, the biggest", "$6$, the frequency"],
                      "We use the **midpoint**: the number in the middle of the class. Some students sent fewer, some more, so the middle is the best guess for all of them."),
                  ask("Can you type \"$10$–$19$\" into one cell of a list?", ["No: each cell holds one number", "Yes, with the minus key", "Yes, with a comma"],
                      "A cell holds one number. \"$10 - 19$\" would be read as the subtraction $-9$! That is another reason to use midpoints."),
                  ask("How do you find the midpoint of $20$–$29$?", ["$\\dfrac{20 + 29}{2} = 24.5$", "$29 - 20 = 9$", "$\\dfrac{20 + 30}{2} = 25$"],
                      "Add the two ends of the class and divide by $2$."),
                  ask("So what goes in **List 1**?", ["The midpoints $4.5, 14.5, 24.5, 34.5, 44.5, 54.5$", "The lower ends $0, 10, 20, 30, 40, 50$", "The frequencies $6, 9, 7, 5, 2, 1$"],
                      "List 1: midpoints. List 2: frequencies, as in a frequency table."),
              ] + type_in(M16, label="List 1 (the midpoints)", hint="Use [[.]] for the decimal point: `4` [[.]] `5`.") + to_list2(M16) + type_in(F16, col=1, other=M16, label="List 2 (the frequencies)") + set_freq_list2(M16, F16, why_first=False) + [
                  one16,
                  ask("Check $n$. Then: what is the estimated mean?", ["$n = 30$, mean $\\approx " + g(R16["mean"]) + "$ emails", "$n = 6$, mean $= 29.5$", "$n = 30$, mean $= 645$"],
                      "$n = 30$ students. $\\bar{x} = \\dfrac{" + g(R16["sx"]) + "}{30} = " + g(R16["mean"]) + "$ emails."),
                  ask("Why does the question say **estimate** the mean?", ["We used the midpoints, not the real numbers of emails", "The calculator rounds the answer", "Because $n$ is small"],
                      "The real numbers of emails could be anywhere in each class. The midpoints give a good estimate, not the exact mean."),
                  two16,
              ] + mode_info(R16, grouped="$10$–$19$") + [
                  ask("(c) So the **modal class** is…", ["$10$–$19$", "$9$", "$14.5$"],
                      "With grouped data we give the **class** with the biggest frequency, not a single number."),
              ], "(c) modal class $10$–$19$, (f) estimated mean $= \\dfrac{645}{30} = 21.5$ emails. Working: $\\dfrac{4.5 \\times 6 + 14.5 \\times 9 + 24.5 \\times 7 + 34.5 \\times 5 + 44.5 \\times 2 + 54.5 \\times 1}{30}$.")

MT, FT = [5, 15, 25, 35, 45], [4, 11, 8, 5, 2]
RT, oneT, twoT = results(MT, FT)
extime = lesson("time", "Times to school (continuous)", "midpoints → STAT",
                "Time $t$ in minutes to get to school for 30 students: $0 \\le t < 10$: $4$, $10 \\le t < 20$: $11$, $20 \\le t < 30$: $8$, $30 \\le t < 40$: $5$, $40 \\le t < 50$: $2$. Estimate the mean time and find the modal class. The lists are empty and Freq is still List2.",
                lists([]), [
                    ask("What is the midpoint of $0 \\le t < 10$?", ["$5$", "$4.5$", "$10$"],
                        "Time is **continuous**: it can be $9.8$ minutes. So the class goes all the way from $0$ to $10$ and its middle is $\\dfrac{0 + 10}{2} = 5$. (In Question 16 the classes $0$–$9$ were whole numbers, so the middle was $4.5$.)"),
                    ask("Then List 1 holds…", ["$5, 15, 25, 35, 45$", "$0, 10, 20, 30, 40$", "$4, 11, 8, 5, 2$"], "The midpoints of the five classes."),
                ] + type_in(MT, label="List 1 (midpoints)") + to_list2(MT) + type_in(FT, col=1, other=MT, label="List 2 (frequencies)") + check_set_list2(MT, FT) + [
                    oneT,
                    ask("The estimated mean?", ["$\\approx 21.7$ minutes ($" + g(RT["mean"]) + "$)", "$25$ minutes", "$650$ minutes"],
                        "$\\bar{x} = \\dfrac{650}{30} \\approx 21.7$ minutes (3 s.f.)."),
                    twoT,
                ] + mode_info(RT, grouped="$10 \\le t < 20$") + [
                    ask("The modal class?", ["$10 \\le t < 20$", "$11$", "$15$"], "The class with the biggest frequency ($11$ students)."),
                ], "Estimated mean $\\approx 21.7$ minutes; modal class $10 \\le t < 20$.")

save("grouped", "Y9 Statistics · Section 3", "Grouped data", [ex16, extime])

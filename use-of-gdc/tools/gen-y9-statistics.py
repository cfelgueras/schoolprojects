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
    """Mean, Σx, Σx², σx, sx, n, minX, Q1, Med, Q3, maxX, Mod as the calculator gives them.
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
    mode = min(x for x, c in counts.items() if c == top)
    return {"mean": mean, "sx": sx, "sx2": sx2, "sigma": var ** 0.5, "s": (var * n / (n - 1)) ** 0.5, "n": n,
            "min": data[0], "q1": median(lo), "med": median(data), "q3": median(hi), "max": data[-1], "mod": mode}


def screen1(r):
    return {"type": "text", "lines": ["1-Variable", "x̄   =" + g(r["mean"]), "Σx  =" + g(r["sx"]), "Σx² =" + g(r["sx2"]),
                                      "σx  =" + g(r["sigma"]), "sx  =" + g(r["s"]), "n   =" + g(r["n"])]}


def screen2(r):
    return {"type": "text", "lines": ["1-Variable", "minX=" + g(r["min"]), "Q1  =" + g(r["q1"]), "Med =" + g(r["med"]),
                                      "Q3  =" + g(r["q3"]), "maxX=" + g(r["max"]), "Mod =" + g(r["mod"])]}


def typing(values, start=0):
    """Key string and the instruction text for typing values into a list, each followed by EXE."""
    return " ".join("%s EXE" % g(v) for v in values), " ".join("`%s` [[EXE]]" % g(v) for v in values)


# =====================================================================
# 1. List of numbers
# =====================================================================
D = [4, 8, 6, 5, 8, 3, 9, 8, 2, 7]
R = one_var(D)
k1, t1 = typing(D[:5])
k2, t2 = typing(D[5:])
save("list", "Y9 Statistics · Section 1", "A list of numbers", [
    lesson("enter", "Mean, median, mode and range", "STAT → CALC → 1VAR",
           "These are the marks of 10 students in a quiz: $4,\\ 8,\\ 6,\\ 5,\\ 8,\\ 3,\\ 9,\\ 8,\\ 2,\\ 7$. Find the **mean**, **median**, **mode** and **range** with the calculator.",
           BLANK, [
               ask("How many values are there?", ["$10$", "$9$, because $8$ is repeated", "$7$"],
                   "Count every value, even the repeated ones: there are $10$ marks. You will check this number on the calculator later."),
               dict(MENU_STEP),
               select("STAT", lists([]), "STAT is the second icon of the first row."),
               ask("The mark $8$ appears three times. How many times do you type it?", ["$3$ times, once for each student", "Once: the calculator knows it repeats", "It doesn't matter"],
                   "Every value goes in the list, so the calculator can count it. If you type $8$ only once, the mean and the mode come out wrong."),
               keys("Type the first five marks into List 1, pressing [[EXE]] after each one: " + t1 + ".", k1, lists(D[:5], cur=(0, 5)),
                    hint="Each number appears at the bottom of the screen while you type it, and goes into the list when you press [[EXE]]."),
               keys("Now the other five: " + t2 + ".", k2, lists(D, cur=(0, 10))),
               keys("Press [[F2]] **CALC** to calculate.", "F2", lists(D, cur=(0, 10), fkeys=CALC_F)),
               keys("Press [[F6]] **SET** to check the settings.", "F6", {"type": "text", "lines": SET1, "hl": 0}),
               ask("Look at **1Var Freq**. It says $1$. What does that mean?", ["Each value in the list counts once", "There is only $1$ value", "The answer will be rounded to $1$ decimal place"],
                   "Freq $= 1$ means every number in List 1 counts once. That is right for a list of numbers. (In frequency tables we will change it.)"),
               keys("The settings are right. Press [[EXIT]] to go back.", "EXIT", lists(D, cur=(0, 10), fkeys=CALC_F)),
               keys("Press [[F1]] **1VAR** (one-variable statistics).", "F1", screen1(R)),
               ask("First check **n**. What should it be?", ["$10$, the number of marks", "$58$", "$8$"],
                   "$n$ is how many values the calculator used. It must match your count: $10$. If not, a value is missing or typed twice."),
               ask("Which line is the **mean**?", ["$\\bar{x} = " + g(R["mean"]) + "$", "$\\Sigma x = " + g(R["sx"]) + "$", "$\\sigma x = " + g(round(R["sigma"], 4)) + "\\ldots$"],
                   "$\\bar{x}$ (x-bar) is the mean. $\\Sigma x$ is the total of all the marks: mean $= \\dfrac{\\Sigma x}{n} = \\dfrac{" + g(R["sx"]) + "}{" + g(R["n"]) + "} = " + g(R["mean"]) + "$. You don't need $\\sigma x$ or $sx$ in Year 9."),
               keys("Press [[▼]] to scroll down to the rest of the results.", "v", screen2(R),
                    hint="On your calculator, keep pressing ▼ until you see minX, Med, maxX and Mod."),
               ask("Which line is the **median**?", ["Med $= " + g(R["med"]) + "$", "Q1 $= " + g(R["q1"]) + "$", "Mod $= " + g(R["mod"]) + "$"],
                   "Med is the median, the middle value when the marks are in order: $2, 3, 4, 5, \\mathbf{6}, \\mathbf{7}, 8, 8, 8, 9$. With $10$ values it is halfway between $6$ and $7$: $6.5$."),
               ask("What is the **mode**?", ["$" + g(R["mod"]) + "$", "$3$, because it appears $3$ times", "$9$, the biggest"],
                   "Mod is the mode: the value that appears most often. $8$ appears $3$ times. (The mode is the value, $8$, not how many times it appears.)"),
               ask("The calculator doesn't show the range. How do you find it?", ["maxX $-$ minX $= " + g(R["max"]) + " - " + g(R["min"]) + " = " + g(R["max"] - R["min"]) + "$", "It is Q3 $-$ Q1", "It is $n = 10$"],
                   "Range $=$ largest $-$ smallest. The calculator gives both: maxX and minX."),
           ], "Mean $= " + g(R["mean"]) + "$, median $= " + g(R["med"]) + "$, mode $= " + g(R["mod"]) + "$, range $= " + g(R["max"] - R["min"]) + "$. Always check $n$ first."),
])

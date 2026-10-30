"""Builds site/content/gdc/<topic>.json (calculator trainer) for every topic except quadratics, which is edited by hand.
Run from the project folder: python3 tools/gen-gdc-lessons.py site/content/gdc
Running it overwrites those JSON files: edit the lessons here, not in the JSON."""
import json, sys, os

OUT = sys.argv[1]

# ---------- key tokens ----------
SIMPLE = {".": "DOT", "+": "ADD", "-": "SUB", "(-)": "NEG", "(": "LP", ")": "RP", "*": "MUL", "/": "DIV",
          "^": "POW", "x": "XT", "sq": "SQR", ",": "COMMA", "ln": "LN", "log": "LOG", "sin": "SIN", "cos": "COS",
          "tan": "TAN", "EXE": "EXE", ">": "RIGHT", "<": "LEFT", "v": "DOWN", "EXIT": "EXIT", "SHIFT": "SHIFT",
          "OPTN": "OPTN", "VARS": "VARS", "MENU": "MENU", "FD": "FD"}
SHIFTED = {"sqrt": ("SQR", "√("), "e^": ("LN", "e^("), "pi": ("EXP", "π"), "asin": ("SIN", "sin⁻¹"),
           "Ans": ("NEG", "Ans"), "[": ("ADD", "["), "]": ("SUB", "]")}


def tk(s):
    """'x sq - 4 x + 1 EXE' -> (keys, add). 'KEY=text' types text; digit runs become single keys."""
    keys, add = [], []
    for t in s.split():
        txt = None
        if "=" in t and not t.startswith("="):
            t, txt = t.split("=", 1)
        if t in SHIFTED:
            k, shown = SHIFTED[t]
            keys += ["SHIFT", k]; add += ["", shown]
        elif t in SIMPLE:
            keys.append(SIMPLE[t]); add.append(txt)
        elif t.isdigit() and txt is not None:
            assert len(t) == 1, t
            keys.append(t); add.append(txt)
        elif t.isdigit():
            keys += list(t); add += [None] * len(t)
        elif t.startswith("F") and t[1:].isdigit():
            keys.append(t); add.append(txt if txt is not None else "")
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


# ---------- screens ----------
GL_F = ["SEL", "DEL", "TYPE", "STYL", "MEM", "DRAW"]
TL_F = ["SEL", "DEL", "TYPE", "STYL", "SET", "TABL"]
TAB_F = ["FORM", "DEL", "ROW", "EDIT", "G-CON", "G-PLT"]
GSOLV = ["ROOT", "MAX", "MIN", "Y-ICPT", "ISCT", "▷"]
GSOLV2 = ["Y-CAL", "X-CAL", "∫dx", "", "", "▷"]
STAT_F = ["GRPH", "CALC", "TEST", "INTR", "DIST", "▷"]
CALC_F = ["1VAR", "2VAR", "REG", "", "", "SET"]
BLANK = {"type": "text", "lines": []}


def flist(ys, hl, table=False):
    title = "Table Func  :Y=" if table else "Graph Func  :Y="
    ys = ys + [""] * (5 - len(ys))
    return {"type": "text", "lines": [title] + ["Y%d%s%s" % (i + 1, "=" if y else ":", y) for i, y in enumerate(ys)],
            "hl": hl, "fkeys": TL_F if table else GL_F}


def vwin(xmin, xmax, ymin, ymax, xscale=1, yscale=1):
    return {"type": "text", "lines": ["View Window", "Xmin :%s" % xmin, " max :%s" % xmax, " scale:%s" % xscale,
                                      "Ymin :%s" % ymin, " max :%s" % ymax, " scale:%s" % yscale],
            "hl": 1, "fkeys": ["INIT", "TRIG", "STD", "STO", "RCL"]}


def graph(win, fns, **kw):
    g = {"type": "graph", "win": win, "fns": fns}
    g.update(kw)
    return g


def run(*lines, right=(1,), fkeys=None):
    s = {"type": "text", "lines": list(lines), "right": list(right)}
    if fkeys: s["fkeys"] = fkeys
    return s


def pt(win, fns, x, y, label, read):
    return graph(win, fns, pt=[x, y], label=label, read=read)


MENU_STEP = {"do": "Press [[MENU]] to open the main menu.", "keys": ["MENU"], "screen": {"type": "menu", "sel": "RUN•MAT"}}
RUN_STEP = {"do": "**RUN•MAT** is already highlighted. Press [[EXE]].", "select": "RUN•MAT", "screen": BLANK}


def menu_to(name, screen, hint=None):
    return [dict(MENU_STEP), select(name, screen, hint)]


def gsolve(win, fns, again=False):
    return {"do": "Press [[F5]] **G-SOLV**%s." % (" again" if again else ""), "keys": ["F5"],
            "hint": "G-SOLV is on [[F5]] in the menu at the bottom of the graph screen. No SHIFT needed.",
            "screen": graph(win, fns, fkeys=GSOLV)}


def set_window(win_lines, win_text, back):
    """SHIFT F3 from the Y= list, values filled in, EXIT back to the list."""
    return [
        keys("Open the View Window: [[SHIFT]] then [[F3]] **V-WIN**.", "SHIFT F3", win_lines,
             hint="On the Y= list, V-WIN is written above [[F3]]: press SHIFT first."),
        keys("Set %s. Here the values are filled in for you; on your calculator type each one and press [[EXE]]. Then press [[EXIT]]." % win_text,
             "EXIT", back),
    ]


def lesson(id, title, tool, task, start, steps, result, unverified=False):
    L = {"id": id, "title": title, "tool": tool, "task": task}
    if unverified: L["unverified"] = True
    L.update({"start": start, "steps": steps, "result": result})
    return L


def save(topic, lessons):
    with open(os.path.join(OUT, topic + ".json"), "w", encoding="utf-8") as f:
        json.dump({"topic": topic, "calculator": "Casio fx-9860GII / GIII", "lessons": lessons}, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(topic, len(lessons), "lessons", sum(len(l["steps"]) for l in lessons), "steps")


# =====================================================================
# 1. Straight lines
# =====================================================================
W = [-6.3, 6.3, -3.1, 3.1]
L1 = ["0.4*x+1.2", "-1.5*x+6"]
save("straight-lines", [
    lesson("distance", "Distance between two points", "RUN•MAT √",
           "Find the distance between $(1,\\ 1)$ and $(8,\\ 2)$.", BLANK, [
               ask("Which calculation gives the distance?",
                   ["$\\sqrt{(8-1)^2 + (2-1)^2}$", "$(8-1)^2 + (2-1)^2$", "$\\sqrt{(8-1) + (2-1)}$"],
                   "The distance formula (in the formula booklet) is $d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$."),
               dict(MENU_STEP), RUN_STEP,
               keys("Start the square root: [[SHIFT]] [[x²]] (√ is written above x²).", "sqrt",
                    run("√("), {"line": 0}, hint="√ is the yellow label above [[x²]]: press SHIFT first."),
               keys("Type $(8-1)^2$: [[(]] `8` [[−]] `1` [[)]] [[x²]].", "( 8 - 1 ) sq",
                    run("√((8-1)²"), {"line": 0, "prefix": "√("}),
               keys("Type $+(2-1)^2$ and close the root: [[+]] [[(]] `2` [[−]] `1` [[)]] [[x²]] [[)]], then [[EXE]].",
                    "+ ( 2 - 1 ) sq ) EXE", run("√((8-1)²+(2-1)²)", "5√2"), {"line": 0, "prefix": "√((8-1)²"}),
               keys("In Math mode the answer is exact: $5\\sqrt{2}$. Press [[F↔D]] to see the decimal.", "FD",
                    run("√((8-1)²+(2-1)²)", "7.071067812"),
                    hint="[[F↔D]] switches between the exact form and the decimal."),
               ask("What do you write?", ["$\\sqrt{50} = 5\\sqrt{2} \\approx 7.07$", "$7.071067812$", "$7.1$"],
                   "Exact if the question says so, otherwise 3 significant figures."),
           ], "$d = \\sqrt{50} = 5\\sqrt{2} \\approx 7.07$. On Paper 1 you do the same by hand: $\\sqrt{49 + 1}$."),
    lesson("gradient", "Gradient from two points", "RUN•MAT",
           "Find the gradient of the line through $(2,\\ -1)$ and $(6,\\ 7)$.", BLANK, [
               ask("Which calculation gives the gradient?", ["$\\dfrac{7-(-1)}{6-2}$", "$\\dfrac{6-2}{7-(-1)}$", "$\\dfrac{7-1}{6-2}$"],
                   "$m = \\dfrac{y_2 - y_1}{x_2 - x_1}$: change in $y$ over change in $x$."),
               keys("In RUN•MAT type the top in brackets: [[(]] `7` [[−]] [[(-)]] `1` [[)]].", "( 7 - (-) 1 )",
                    run("(7--1)"), {"line": 0},
                    hint="Subtract with [[−]], then make the 1 negative with [[(-)]]. Two different keys."),
               keys("Divide by the bottom: [[÷]] [[(]] `6` [[−]] `2` [[)]], then [[EXE]].", "/ ( 6 - 2 ) EXE",
                    run("(7--1)÷(6-2)", "2"), {"line": 0, "prefix": "(7--1)"},
                    hint="Brackets around the bottom: without them the calculator works out $8 \\div 6 - 2$."),
               ask("A line is perpendicular to this one. What is its gradient?", ["$-\\dfrac{1}{2}$", "$-2$", "$\\dfrac{1}{2}$"],
                   "Perpendicular gradients multiply to $-1$: $2 \\times \\left(-\\dfrac{1}{2}\\right) = -1$."),
           ], "$m = \\dfrac{8}{4} = 2$; a perpendicular line has gradient $-\\dfrac{1}{2}$. Brackets around the top and the bottom are what make this work."),
    lesson("simultaneous", "Intersection with EQUA", "EQUA → SIML",
           "Find where $3x + 2y = 7$ and $5x - 4y = 2$ meet.", BLANK, [
               ask("Both equations are already in the form EQUA needs. Which form is that?",
                   ["$ax + by = c$", "$y = mx + c$", "$ax + by + c = 0$"],
                   "EQUA SIML solves $a_n x + b_n y = c_n$. Rearrange first if the equation looks different."),
           ] + menu_to("EQUA", {"type": "text", "lines": ["F1:Simultaneous", "F2:Polynomial", "F3:Solver"], "fkeys": ["SIML", "POLY", "SOLV"]},
                       "EQUA is in the third row of icons.") + [
               keys("Press [[F1]] **SIML** (simultaneous equations).", "F1",
                    {"type": "text", "lines": ["Simultaneous", "", "Number of Unknowns?"], "fkeys": ["2", "3", "4", "5", "6"]}),
               keys("Two unknowns, $x$ and $y$: press [[F1]] **2**.", "F1",
                    {"type": "text", "lines": ["anX+bnY=cn", "     a     b     c", "1    0     0     0", "2    0     0     0"], "fkeys": ["SOLV", "DEL", "CLR", "EDIT"]}),
               keys("Row 1, $3x + 2y = 7$: `3` [[EXE]] `2` [[EXE]] `7` [[EXE]].", "3 EXE 2 EXE 7 EXE",
                    {"type": "text", "lines": ["anX+bnY=cn", "     a     b     c", "1    3     2     7", "2    0     0     0"], "fkeys": ["SOLV", "DEL", "CLR", "EDIT"]}),
               keys("Row 2, $5x - 4y = 2$: `5` [[EXE]] [[(-)]] `4` [[EXE]] `2` [[EXE]].", "5 EXE (-) 4 EXE 2 EXE",
                    {"type": "text", "lines": ["anX+bnY=cn", "     a     b     c", "1    3     2     7", "2    5    -4     2"], "fkeys": ["SOLV", "DEL", "CLR", "EDIT"]},
                    hint="$-4$ needs the [[(-)]] key, next to EXE."),
               keys("Press [[F1]] **SOLV**.", "F1",
                    {"type": "text", "lines": ["anX+bnY=cn", "", "X   1.454545455", "Y   1.318181818"], "fkeys": ["REPT"]}),
               ask("Write the point of intersection.", ["$(1.45,\\ 1.32)$", "$(1.32,\\ 1.45)$", "$(1.4,\\ 1.3)$"],
                   "X is the first coordinate. Exact values: $x = \\dfrac{16}{11}$, $y = \\dfrac{29}{22}$."),
           ], "The lines meet at $(1.45,\\ 1.32)$. Check: $3(1.4545) + 2(1.3182) = 7$ ✓."),
    lesson("graph-isct", "Intersection with GRAPH", "GRAPH → G-Solv ISCT",
           "Find where $y = 0.4x + 1.2$ and $y = -1.5x + 6$ meet.", BLANK,
           menu_to("GRAPH", flist([], 1), "GRAPH is the first icon of the second row.") + [
               keys("Y1: `0.4` [[X,θ,T]] [[+]] `1.2`, then [[EXE]].", "0 . 4 x + 1 . 2 EXE",
                    flist(["0.4X+1.2"], 2), {"line": 1, "prefix": "Y1:"}),
               keys("Y2: [[(-)]] `1.5` [[X,θ,T]] [[+]] `6`, then [[EXE]].", "(-) 1 . 5 x + 6 EXE",
                    flist(["0.4X+1.2", "-1.5X+6"], 3), {"line": 2, "prefix": "Y2:"},
                    hint="The gradient is negative: start with [[(-)]]."),
               keys("Press [[F6]] **DRAW**.", "F6", graph(W, L1)),
               gsolve(W, L1),
               keys("Press [[F5]] **ISCT**.", "F5", pt(W, L1, 2.526315789, 2.210526316, "ISCT", "X=2.526315789  Y=2.210526316")),
               ask("Write the point to 3 significant figures.", ["$(2.53,\\ 2.21)$", "$(2.52,\\ 2.21)$", "$(2.5,\\ 2.2)$"],
                   "2.5263… rounds to 2.53 because the next digit is 6."),
           ], "$(2.53,\\ 2.21)$. With GRAPH the lines must be in the form $y = \\ldots$; with EQUA, in the form $ax + by = c$."),
])

# =====================================================================
# 3. Functions and transformations
# =====================================================================
FA = ["(x>=0&&x<=5)?x*x-4*x+1:NaN"]
WA = [-1, 6, -4, 7]
FB = ["Math.pow(2,x)", "x+5"]
WB = [-6, 5, -2, 10]
FC = ["x*x-4*x+1"]
WC = [-2, 6, -4, 8]
FE = ["x*Math.exp(-x)"]
WE = [-1, 5, -1, 1]
save("functions-transformations", [
    lesson("domain-range", "Restricted domain and range", "GRAPH, MIN, Y-CAL",
           "Draw $f(x) = x^2 - 4x + 1$ for $0 \\le x \\le 5$ and find its range.", flist([], 1), [
               keys("Y1: type the function, then the domain `,` `[0,5]`. The square brackets are [[SHIFT]] [[+]] and [[SHIFT]] [[−]]. Then [[EXE]].",
                    "x sq - 4 x + 1 , [ 0 , 5 ] EXE", flist(["X²-4X+1,[0,5]"], 2), {"line": 1, "prefix": "Y1:"},
                    hint="[ is above [[+]] and ] is above [[−]]: press SHIFT first each time."),
           ] + set_window(vwin(-1, 6, -4, 7), "$-1 \\le x \\le 6$, $-4 \\le y \\le 7$", flist(["X²-4X+1,[0,5]"], 1)) + [
               keys("Press [[F6]] **DRAW**. Only the part from $x = 0$ to $x = 5$ appears.", "F6", graph(WA, FA)),
               gsolve(WA, FA),
               keys("The lowest point is a minimum: press [[F3]] **MIN**.", "F3", pt(WA, FA, 2, -3, "MIN", "X=2  Y=-3")),
               gsolve(WA, FA, True),
               keys("Press [[F6]] (▷) for more options.", "F6", graph(WA, FA, fkeys=GSOLV2)),
               keys("Press [[F1]] **Y-CAL**.", "F1", graph(WA, FA, label="Y-CAL", read="X:")),
               keys("The end point is at $x = 5$: type `5` and press [[EXE]].", "5 EXE",
                    pt(WA, FA, 5, 6, "Y-CAL", "X=5  Y=6"), {"prefix": "X:"}),
               ask("What is the range of $f$?", ["$-3 \\le f(x) \\le 6$", "$1 \\le f(x) \\le 6$", "$0 \\le f(x) \\le 5$"],
                   "The range runs from the minimum ($-3$) to the highest point, here the end point at $x = 5$. $f(0) = 1$ is not the lowest value."),
           ], "Range: $-3 \\le f(x) \\le 6$. Always check the end points of the domain as well as the turning point.", unverified=True),
    lesson("solve-isct", "Solve an unfamiliar equation", "GRAPH → G-Solv ISCT",
           "Solve $2^x = x + 5$.", flist([], 1), [
               ask("You can't solve this by algebra. What do you graph?", ["$y = 2^x$ and $y = x + 5$, then find where they meet", "$y = 2^x$ only", "$y = x + 5$ only"],
                   "Each side of the equation becomes one graph. The $x$-coordinates of the intersections are the solutions."),
               keys("Y1: `2` [[^]] [[X,θ,T]], then [[EXE]].", "2 ^ x EXE", flist(["2^X"], 2), {"line": 1, "prefix": "Y1:"}),
               keys("Y2: [[X,θ,T]] [[+]] `5`, then [[EXE]].", "x + 5 EXE", flist(["2^X", "X+5"], 3), {"line": 2, "prefix": "Y2:"}),
           ] + set_window(vwin(-6, 5, -2, 10), "$-6 \\le x \\le 5$, $-2 \\le y \\le 10$", flist(["2^X", "X+5"], 1)) + [
               keys("Press [[F6]] **DRAW**.", "F6", graph(WB, FB)),
               gsolve(WB, FB),
               keys("Press [[F5]] **ISCT**.", "F5", pt(WB, FB, -4.968050221, 0.03194977938, "ISCT", "X=-4.968050221  Y=0.0319497793")),
               keys("Press [[▶]] for the next intersection.", ">", pt(WB, FB, 3, 8, "ISCT", "X=3  Y=8")),
               ask("What are the solutions?", ["$x \\approx -4.97$ or $x = 3$", "$(-4.97,\\ 0.0319)$ and $(3,\\ 8)$", "$x = 3$ only"],
                   "The question asks for $x$, so give only the $x$-coordinates. The left one is easy to miss with the standard window."),
           ], "$x \\approx -4.97$ or $x = 3$. Choose a window that shows every intersection: a solution outside the screen is not found."),
    lesson("x-cal", "Find x for a given y", "G-Solv X-CAL",
           "For $f(x) = x^2 - 4x + 1$, solve $f(x) = 4$. The graph is already drawn.", graph(WC, FC), [
               gsolve(WC, FC),
               keys("Press [[F6]] (▷) for more options.", "F6", graph(WC, FC, fkeys=GSOLV2)),
               keys("Press [[F2]] **X-CAL**.", "F2", graph(WC, FC, label="X-CAL", read="Y:")),
               keys("Type `4` and press [[EXE]].", "4 EXE",
                    pt(WC, FC, -0.6457513111, 4, "X-CAL", "X=-0.6457513111  Y=4"), {"prefix": "Y:"}),
               keys("Press [[▶]] for the other $x$-value.", ">", pt(WC, FC, 4.645751311, 4, "X-CAL", "X=4.645751311  Y=4")),
               ask("What are the solutions of $f(x) = 4$?", ["$x \\approx -0.646$ or $x \\approx 4.65$", "$x \\approx 4.65$ only", "$x = 4$"],
                   "A horizontal line $y = 4$ cuts the parabola twice. Exact: $x = 2 \\pm \\sqrt{7}$."),
           ], "$x \\approx -0.646$ or $x \\approx 4.65$. X-CAL is the reverse of Y-CAL: it gives $x$ for a $y$-value.", unverified=True),
    lesson("asymptotes", "Asymptotes with TABLE", "TABLE",
           "Investigate the asymptotes of $f(x) = \\dfrac{2x + 1}{x - 3}$.", BLANK,
           menu_to("TABLE", flist([], 1, table=True), "TABLE is in the second row, third icon.") + [
               keys("Y1: `(2X+1)÷(X−3)`, with brackets around the top and the bottom. Then [[EXE]].",
                    "( 2 x + 1 ) / ( x - 3 ) EXE", flist(["(2X+1)÷(X-3)"], 2, table=True), {"line": 1, "prefix": "Y1:"},
                    hint="Without brackets the calculator works out $2x + \\dfrac{1}{x} - 3$."),
               keys("Press [[F5]] **SET**.", "F5", {"type": "text", "lines": ["Table Setting", "X", "Start:2.9", "End  :3.1", "Step :0.05"], "hl": 2}),
               keys("Start $= 2.9$, End $= 3.1$, Step $= 0.05$ are filled in: values close to $x = 3$. Press [[EXIT]].", "EXIT",
                    flist(["(2X+1)÷(X-3)"], 1, table=True)),
               keys("Press [[F6]] **TABL**.", "F6",
                    {"type": "text", "lines": ["      X        Y1", "    2.9       -68", "   2.95      -138", "      3     ERROR", "   3.05       142", "    3.1        72"], "hl": 1, "fkeys": TAB_F}),
               ask("What happens at $x = 3$?", ["A vertical asymptote $x = 3$: the values blow up and $f(3)$ is undefined", "A root at $x = 3$", "A horizontal asymptote $y = 3$"],
                   "Dividing by $x - 3 = 0$ gives ERROR, and $y$ jumps from $-138$ to $142$ either side."),
               keys("Now look at large $x$. Press [[EXIT]] to go back.", "EXIT", flist(["(2X+1)÷(X-3)"], 1, table=True)),
               keys("Press [[F5]] **SET**. Start $= 100$, End $= 1000$, Step $= 100$ are filled in. Press [[EXIT]].", "F5 EXIT",
                    flist(["(2X+1)÷(X-3)"], 1, table=True)),
               keys("Press [[F6]] **TABL**.", "F6",
                    {"type": "text", "lines": ["      X        Y1", "    100   2.072164948", "    200   2.035532995", "    300   2.023569024", "    400   2.017632242", "    500   2.014084507"], "hl": 1, "fkeys": TAB_F}),
               ask("What happens as $x$ gets large?", ["$y$ approaches $2$: horizontal asymptote $y = 2$", "$y$ grows without limit", "$y$ approaches $0$"],
                   "For large $x$, $\\dfrac{2x + 1}{x - 3} \\approx \\dfrac{2x}{x} = 2$."),
           ], "Vertical asymptote $x = 3$, horizontal asymptote $y = 2$. TABLE is a quick check of what you find by algebra."),
    lesson("max", "Maximum of a function", "G-Solv MAX",
           "Find the maximum point of $f(x) = x\\,e^{-x}$.", flist([], 1), [
               keys("Y1: [[X,θ,T]] then $e^{-x}$: [[SHIFT]] [[ln]] (eˣ), [[(-)]] [[X,θ,T]], then [[▶]] to leave the exponent. Then [[EXE]].",
                    "x e^ (-) x >=) EXE", flist(["Xe^(-X)"], 2), {"line": 1, "prefix": "Y1:"},
                    hint="eˣ is the yellow label above [[ln]]."),
           ] + set_window(vwin(-1, 5, -1, 1, 1, 0.5), "$-1 \\le x \\le 5$, $-1 \\le y \\le 1$", flist(["Xe^(-X)"], 1)) + [
               keys("Press [[F6]] **DRAW**.", "F6", graph(WE, FE)),
               gsolve(WE, FE),
               keys("Press [[F2]] **MAX**.", "F2", pt(WE, FE, 1, 0.3678794412, "MAX", "X=1  Y=0.3678794412")),
               ask("Write the maximum point.", ["$(1,\\ 0.368)$", "$(0.368,\\ 1)$", "$(1,\\ 0.37)$"],
                   "$y = e^{-1} \\approx 0.368$ (3 significant figures)."),
           ], "Maximum at $(1,\\ e^{-1}) \\approx (1,\\ 0.368)$. With the standard window this graph is almost flat: always choose a window that shows the feature you need."),
])

# =====================================================================
# 4. Exponents and logarithms
# =====================================================================
W2 = [-6.3, 6.3, -3.1, 3.1]
FX = ["Math.pow(2,x)", "3-x"]
WG = [0, 40, 0, 1500]
FG = ["500*Math.exp(0.03*x)", "1000"]
MATH_F = ["MAT", "logab", "Abs", "FRAC", "d/dx", "▷"]
save("exponents-logarithms", [
    lesson("log-base", "Logarithm with any base", "RUN•MAT → MATH logab",
           "Evaluate $\\log_5 12$.", BLANK, [
               dict(MENU_STEP), RUN_STEP,
               keys("Press [[F4]] **MATH**.", "F4", run("", fkeys=MATH_F), hint="In Math input mode, MATH is on [[F4]]."),
               keys("Press [[F2]] **logab**, type the base `5`, press [[▶]] to move to the second box, type `12`, then [[EXE]].",
                    "F2=log 5=₅ >=( 12 EXE", run("log₅(12)", "1.543959311"), {"line": 0},
                    hint="[[▶]] moves the cursor from the base box to the number box."),
               ask("Check with change of base. Which is equal to $\\log_5 12$?", ["$\\dfrac{\\ln 12}{\\ln 5}$", "$\\dfrac{\\ln 5}{\\ln 12}$", "$\\ln 12 - \\ln 5$"],
                   "Change of base (formula booklet): $\\log_a b = \\dfrac{\\ln b}{\\ln a}$."),
               keys("Type [[ln]] `12` [[÷]] [[ln]] `5` and press [[EXE]].", "ln 12 / ln 5 EXE",
                    run("log₅(12)", "1.543959311", "ln 12÷ln 5", "1.543959311", right=(1, 3)), {"line": 2}),
           ], "$\\log_5 12 \\approx 1.54$. Both methods give the same value."),
    lesson("solve-log", "Exponential equation with ln", "RUN•MAT ln",
           "Solve $3^x = 20$.", BLANK, [
               ask("Take $\\ln$ of both sides. What is $x$?", ["$x = \\dfrac{\\ln 20}{\\ln 3}$", "$x = \\ln 20 - \\ln 3$", "$x = \\dfrac{20}{3}$"],
                   "$\\ln 3^x = x \\ln 3$, so $x \\ln 3 = \\ln 20$ and $x = \\dfrac{\\ln 20}{\\ln 3}$."),
               dict(MENU_STEP), RUN_STEP,
               keys("Type [[ln]] `20` [[÷]] [[ln]] `3`, then [[EXE]].", "ln 20 / ln 3 EXE",
                    run("ln 20÷ln 3", "2.726833028"), {"line": 0}),
               ask("Write the answer.", ["$x \\approx 2.73$", "$x = 2.726833028$", "$x \\approx 2.72$"],
                   "Three significant figures: 2.7268… rounds up to 2.73."),
           ], "$x = \\dfrac{\\ln 20}{\\ln 3} \\approx 2.73$. On Paper 1 leave it as $\\dfrac{\\ln 20}{\\ln 3}$ or $\\log_3 20$."),
    lesson("e-power", "Powers of e", "RUN•MAT eˣ",
           "A population is $P(t) = 500e^{0.03t}$. Find $P(10)$.", BLANK, [
               dict(MENU_STEP), RUN_STEP,
               keys("Type `500`, then [[SHIFT]] [[ln]] for eˣ.", "500 e^", run("500e^("), {"line": 0},
                    hint="eˣ is the yellow label above [[ln]]."),
               keys("Type the exponent `0.03` [[×]] `10`, press [[▶]] to leave the exponent, then [[EXE]].",
                    "0 . 03 * 10 >=) EXE", run("500e^(0.03×10)", "674.9294038"), {"line": 0, "prefix": "500e^("}),
               ask("What do you write?", ["$P(10) \\approx 675$", "$P(10) = 674.9294038$", "$P(10) \\approx 674$"],
                   "674.929… to 3 significant figures is 675. For a number of animals you could also say 674 or 675 in context."),
           ], "$P(10) = 500e^{0.3} \\approx 675$. Use the eˣ key, not $2.718^x$: a rounded $e$ gives a wrong answer."),
    lesson("graph-isct", "Solve with GRAPH", "GRAPH → G-Solv ISCT",
           "Solve $2^x = 3 - x$.", flist([], 1), [
               keys("Y1: `2` [[^]] [[X,θ,T]], then [[EXE]].", "2 ^ x EXE", flist(["2^X"], 2), {"line": 1, "prefix": "Y1:"}),
               keys("Y2: `3` [[−]] [[X,θ,T]], then [[EXE]].", "3 - x EXE", flist(["2^X", "3-X"], 3), {"line": 2, "prefix": "Y2:"}),
               keys("Press [[F6]] **DRAW**.", "F6", graph(W2, FX)),
               gsolve(W2, FX),
               keys("Press [[F5]] **ISCT**.", "F5", pt(W2, FX, 1, 2, "ISCT", "X=1  Y=2")),
               ask("What is the solution?", ["$x = 1$", "$x = 2$", "$(1,\\ 2)$"],
                   "The equation asks for $x$. Check: $2^1 = 2$ and $3 - 1 = 2$ ✓."),
           ], "$x = 1$. An exponential and a straight line can meet at most twice; here only once."),
    lesson("growth", "Growth model: when?", "GRAPH → ISCT",
           "$P(t) = 500e^{0.03t}$. When does $P$ reach $1000$?", flist([], 1), [
               keys("Y1: `500` [[SHIFT]] [[ln]] `0.03` [[X,θ,T]] [[▶]], then [[EXE]].", "500 e^ 0 . 03 x >=) EXE",
                    flist(["500e^(0.03X)"], 2), {"line": 1, "prefix": "Y1:"}, hint="The calculator uses $X$ for $t$."),
               keys("Y2: `1000`, then [[EXE]].", "1000 EXE", flist(["500e^(0.03X)", "1000"], 3), {"line": 2, "prefix": "Y2:"}),
           ] + set_window(vwin(0, 40, 0, 1500, 5, 100), "$0 \\le x \\le 40$ and $0 \\le y \\le 1500$, because time and population are positive",
                          flist(["500e^(0.03X)", "1000"], 1)) + [
               keys("Press [[F6]] **DRAW**.", "F6", graph(WG, FG)),
               gsolve(WG, FG),
               keys("Press [[F5]] **ISCT**.", "F5", pt(WG, FG, 23.10490602, 1000, "ISCT", "X=23.10490602  Y=1000")),
               ask("When does the population reach 1000?", ["$t \\approx 23.1$", "$t \\approx 1000$", "$t = 23$"],
                   "The answer is the $x$-coordinate, the time. Exact: $t = \\dfrac{\\ln 2}{0.03}$."),
           ], "$t \\approx 23.1$ (years, or whatever the unit of $t$ is). With the standard window you would see nothing: set the window from the context."),
])

# =====================================================================
# 6. Differentiation
# =====================================================================
OPTN_F = ["LIST", "MAT", "CPLX", "CALC", "STAT", "▷"]
CALCF = ["Solve", "d/dx", "d²/dx²", "∫dx", "SolvN", "▷"]
FS = ["x*x*x-3*x*x-9*x+2"]
WS = [-4, 6, -35, 15]
FI = ["x*x*x*x-4*x*x*x", "4*x*x*x-12*x*x"]
WI = [-2, 5, -35, 10]
FO = ["x*(20-2*x)*(20-2*x)"]
WO = [0, 10, 0, 700]
save("differentiation", [
    lesson("gradient", "Gradient at a point", "RUN•MAT → d/dx",
           "Find the gradient of $y = x^3 - 2x + 1$ at $x = 2$.", BLANK, [
               keys("In RUN•MAT press [[OPTN]].", "OPTN", run("", fkeys=OPTN_F)),
               keys("Press [[F4]] **CALC**.", "F4", run("", fkeys=CALCF)),
               keys("Press [[F2]] **d/dx**, then type $x^3$: [[X,θ,T]] [[^]] `3`, and [[▶]] to leave the exponent.",
                    "F2=d/dx( x ^ 3 >=", run("d/dx(X^3"), {"line": 0},
                    hint="Without [[▶]] everything you type next goes into the exponent."),
               keys("Type [[−]] `2` [[X,θ,T]] [[+]] `1`.", "- 2 x + 1", run("d/dx(X^3-2X+1"), {"line": 0, "prefix": "d/dx(X^3"}),
               keys("Press [[▶]] to move to the box after $x =$, type `2`, then [[EXE]].", ">=)|x= 2 EXE",
                    run("d/dx(X^3-2X+1)|x=2", "10"), {"line": 0, "prefix": "d/dx(X^3-2X+1"}),
               ask("What does the 10 mean?", ["The gradient of the tangent to the curve at $x = 2$", "The $y$-coordinate at $x = 2$", "The area under the curve"],
                   "$\\dfrac{dy}{dx}$ at $x = 2$ is the gradient of the curve there. Check: $3(2)^2 - 2 = 10$."),
           ], "$\\left.\\dfrac{dy}{dx}\\right|_{x=2} = 10$. On Paper 2 you can write: \"from GDC, gradient $= 10$\"."),
    lesson("gradient-e-ln", "Gradient with e and ln", "RUN•MAT → d/dx",
           "Find the gradient of $y = e^x - 3\\ln x$ at $x = 1.5$.", BLANK, [
               keys("Open d/dx: [[OPTN]] [[F4]] **CALC** [[F2]] **d/dx**.", "OPTN F4 F2=d/dx(", run("d/dx("), {"line": 0}),
               keys("Type $e^x$: [[SHIFT]] [[ln]] [[X,θ,T]] [[▶]].", "e^ x >=)", run("d/dx(e^(X)"), {"line": 0, "prefix": "d/dx("},
                    hint="eˣ is above [[ln]]. [[▶]] leaves the exponent."),
               keys("Type $-3\\ln x$: [[−]] `3` [[ln]] [[X,θ,T]].", "- 3 ln x", run("d/dx(e^(X)-3ln X"), {"line": 0, "prefix": "d/dx(e^(X)"}),
               keys("Press [[▶]], type `1.5`, then [[EXE]].", ">=)|x= 1 . 5 EXE", run("d/dx(e^(X)-3ln X)|x=1.5", "2.48168907"),
                    {"line": 0, "prefix": "d/dx(e^(X)-3ln X"}),
               ask("Write the answer.", ["$2.48$", "$2.49$", "$2.5$"], "2.4816… to 3 significant figures is 2.48."),
           ], "Gradient $\\approx 2.48$. By hand: $e^{1.5} - \\dfrac{3}{1.5} = 4.48 - 2 = 2.48$ ✓."),
    lesson("stationary", "Stationary points", "G-Solv MAX / MIN",
           "Find the stationary points of $f(x) = x^3 - 3x^2 - 9x + 2$.", flist([], 1), [
               keys("Y1: [[X,θ,T]] [[^]] `3` [[▶]] [[−]] `3` [[X,θ,T]] [[x²]] [[−]] `9` [[X,θ,T]] [[+]] `2`, then [[EXE]].",
                    "x ^ 3 > - 3 x sq - 9 x + 2 EXE", flist(["X^3-3X²-9X+2"], 2), {"line": 1, "prefix": "Y1:"},
                    hint="Press [[▶]] after the 3 to leave the exponent."),
           ] + set_window(vwin(-4, 6, -35, 15, 1, 5), "$-4 \\le x \\le 6$, $-35 \\le y \\le 15$", flist(["X^3-3X²-9X+2"], 1)) + [
               keys("Press [[F6]] **DRAW**.", "F6", graph(WS, FS)),
               gsolve(WS, FS),
               keys("Press [[F2]] **MAX**.", "F2", pt(WS, FS, -1, 7, "MAX", "X=-1  Y=7")),
               gsolve(WS, FS, True),
               keys("Press [[F3]] **MIN**.", "F3", pt(WS, FS, 3, -25, "MIN", "X=3  Y=-25")),
               ask("Which statement is correct?", ["Local maximum $(-1,\\ 7)$, local minimum $(3,\\ -25)$", "Maximum $(7,\\ -1)$, minimum $(-25,\\ 3)$", "Both are minimum points"],
                   "At a stationary point $f'(x) = 0$. Check: $f'(x) = 3x^2 - 6x - 9 = 3(x + 1)(x - 3)$."),
           ], "Local maximum $(-1,\\ 7)$ and local minimum $(3,\\ -25)$. The GDC finds them; the question may still ask you to justify with $f'(x) = 0$."),
    lesson("inflexion", "Point of inflexion", "Graph of f′ + MIN",
           "$f(x) = x^4 - 4x^3$. Find the minimum and the non-stationary point of inflexion.", flist([], 1), [
               ask("First differentiate by hand. What is $f'(x)$?", ["$4x^3 - 12x^2$", "$4x^3 - 4x^2$", "$x^3 - 12x^2$"],
                   "Multiply by the power and subtract one: $4x^3 - 4(3x^2) = 4x^3 - 12x^2$."),
               keys("Y1: $f(x)$, then [[EXE]].", "x ^ 4 > - 4 x ^ 3 EXE", flist(["X^4-4X^3"], 2), {"line": 1, "prefix": "Y1:"},
                    hint="Press [[▶]] after the 4 to leave the exponent."),
               keys("Y2: $f'(x)$, then [[EXE]].", "4 x ^ 3 > - 12 x sq EXE", flist(["X^4-4X^3", "4X^3-12X²"], 3), {"line": 2, "prefix": "Y2:"}),
           ] + set_window(vwin(-2, 5, -35, 10, 1, 5), "$-2 \\le x \\le 5$, $-35 \\le y \\le 10$", flist(["X^4-4X^3", "4X^3-12X²"], 1)) + [
               keys("Press [[F6]] **DRAW**.", "F6", graph(WI, FI)),
               gsolve(WI, FI),
               keys("Press [[F3]] **MIN**. Two graphs are drawn, so the calculator asks which one: Y1 is selected. Press [[EXE]].", "F3 EXE",
                    pt(WI, FI, 3, -27, "MIN", "X=3  Y=-27"),
                    hint="With more than one graph, G-SOLV first asks which graph to use: [[▲]] [[▼]] to choose, [[EXE]] to confirm."),
               gsolve(WI, FI, True),
               keys("Press [[F3]] **MIN**, then [[▼]] to choose Y2 ($f'$), then [[EXE]].", "F3 v EXE",
                    pt(WI, FI, 2, -16, "MIN", "X=2  Y=-16")),
               ask("The minimum of $f'$ is at $x = 2$. What is there on $f$?", ["A point of inflexion at $(2,\\ -16)$", "A minimum of $f$ at $(2,\\ -16)$", "A root of $f$"],
                   "Where $f'$ has a turning point, $f''= 0$ and the concavity of $f$ changes. $f(2) = 16 - 32 = -16$."),
           ], "Minimum $(3,\\ -27)$; inflexion points $(0,\\ 0)$ (stationary) and $(2,\\ -16)$ (non-stationary). The $y$-value of the inflexion comes from $f$, not from $f'$.", unverified=True),
    lesson("optimisation", "Optimisation", "GRAPH → G-Solv MAX",
           "An open box is made from a $20$ cm square by cutting squares of side $x$ from the corners. Its volume is $V = x(20 - 2x)^2$. Find the maximum volume.", flist([], 1), [
               ask("Which values of $x$ make sense?", ["$0 < x < 10$", "$x > 0$", "$0 < x < 20$"],
                   "You cut $x$ from both sides of a 20 cm edge, so $20 - 2x > 0$, which means $x < 10$."),
               keys("Y1: [[X,θ,T]] [[(]] `20` [[−]] `2` [[X,θ,T]] [[)]] [[x²]], then [[EXE]].", "x ( 20 - 2 x ) sq EXE",
                    flist(["X(20-2X)²"], 2), {"line": 1, "prefix": "Y1:"}),
           ] + set_window(vwin(0, 10, 0, 700, 1, 100), "$0 \\le x \\le 10$ (the domain) and $0 \\le y \\le 700$", flist(["X(20-2X)²"], 1)) + [
               keys("Press [[F6]] **DRAW**.", "F6", graph(WO, FO)),
               gsolve(WO, FO),
               keys("Press [[F2]] **MAX**.", "F2", pt(WO, FO, 3.333333333, 592.5925926, "MAX", "X=3.333333333  Y=592.5925926")),
               ask("What is the maximum volume?", ["$593\\ \\text{cm}^3$, when $x \\approx 3.33$ cm", "$3.33\\ \\text{cm}^3$", "$593$ cm, when $x \\approx 3.33$"],
                   "The volume is the $y$-value; give units. Exact: $x = \\dfrac{10}{3}$."),
           ], "Maximum volume $\\approx 593\\ \\text{cm}^3$ when $x \\approx 3.33$ cm. On Paper 2 you may use the GDC instead of $V'(x) = 0$, unless the question says \"use calculus\"."),
])

# =====================================================================
# 7. Geometry and trigonometry
# =====================================================================
SETUP = ["Input Mode :Math", "Frac Result:d/c", "Func Type  :Y=", "Draw Type  :Connect", "Derivative :Off", "Angle      :Rad", "Complex Mode:Real"]
SETUP_DEG = SETUP[:5] + ["Angle      :Deg"] + SETUP[6:]
PI = 3.141592654
WT = [0, PI, -4, 4]
FT = ["3*Math.sin(2*x)", "1"]
WM = [0, 24, 0, 8]
FM = ["2.5*Math.cos(Math.PI*x/6)+4"]
save("geometry-trigonometry", [
    lesson("angle-mode", "Check the angle mode", "SET UP",
           "Set the calculator to degrees before a triangle question.", BLANK, [
               keys("Open SET UP: [[SHIFT]] [[MENU]].", "SHIFT MENU", {"type": "text", "lines": SETUP, "hl": 0},
                    hint="SET UP is the yellow label above [[MENU]]."),
               scroll("Press [[▼]] until **Angle** is highlighted.", 5, {"type": "text", "lines": SETUP, "hl": 5, "fkeys": ["Deg", "Rad", "Gra"]}),
               keys("Press [[F1]] **Deg**.", "F1", {"type": "text", "lines": SETUP_DEG, "hl": 5, "fkeys": ["Deg", "Rad", "Gra"]}),
               keys("Press [[EXIT]].", "EXIT", BLANK),
               ask("When do you need radians?", ["When the question uses $\\pi$, radians or a graph of $\\sin x$ with $x$ in radians", "Always in Paper 2", "Only for triangles"],
                   "Triangles and bearings: degrees. Arcs, sectors, $0 \\le x \\le 2\\pi$, trig graphs and calculus: radians."),
           ], "Angle: Deg. Check the angle mode at the start of every trig question; it is the most common calculator mistake.", unverified=True),
    lesson("cosine-rule", "Cosine rule", "RUN•MAT (Deg)",
           "In a triangle $a = 7$, $b = 9$ and $C = 50^\\circ$. Find $c$.", BLANK, [
               ask("Which formula do you use?", ["$c^2 = a^2 + b^2 - 2ab\\cos C$", "$\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B}$", "$c^2 = a^2 + b^2$"],
                   "Two sides and the angle between them: cosine rule (formula booklet)."),
               keys("Start the root: [[SHIFT]] [[x²]].", "sqrt", run("√("), {"line": 0}),
               keys("Type `7` [[x²]] [[+]] `9` [[x²]] [[−]] `2` [[×]] `7` [[×]] `9` [[×]] [[cos]] `50`.", "7 sq + 9 sq - 2 * 7 * 9 * cos 50",
                    run("√(7²+9²-2×7×9×cos 50"), {"line": 0, "prefix": "√("}),
               keys("Close the bracket [[)]] and press [[EXE]].", ") EXE", run("√(7²+9²-2×7×9×cos 50)", "7.000625771"),
                    {"line": 0, "prefix": "√(7²+9²-2×7×9×cos 50"}),
               ask("The answer looks like exactly 7. What do you write?", ["$c \\approx 7.00$", "$c = 7$", "$c \\approx 7.0006$"],
                   "$7.0006…$ to 3 significant figures is $7.00$. Writing 7 suggests it is exact, and it is not."),
           ], "$c \\approx 7.00$. If you get $c \\approx 10.6$ instead, the calculator was in radians."),
    lesson("sine-rule", "Sine rule: the ambiguous case", "RUN•MAT sin⁻¹, Ans",
           "$\\sin B = \\dfrac{10\\sin 35^\\circ}{8}$. Find both possible values of $B$.", BLANK, [
               keys("Type sin⁻¹: [[SHIFT]] [[sin]], then [[(]].", "asin (", run("sin⁻¹("), {"line": 0},
                    hint="sin⁻¹ is the yellow label above [[sin]]."),
               keys("Type `10` [[sin]] `35` [[÷]] `8` [[)]] and press [[EXE]].", "10 sin 35 / 8 ) EXE",
                    run("sin⁻¹(10sin 35÷8)", "45.80492614"), {"line": 0, "prefix": "sin⁻¹("}),
               ask("The calculator gives only one angle. What is the other one?", ["$180^\\circ - 45.8^\\circ$", "$90^\\circ - 45.8^\\circ$", "$360^\\circ - 45.8^\\circ$"],
                   "$\\sin(180^\\circ - B) = \\sin B$, so the obtuse angle works too, if it fits in the triangle."),
               keys("Type `180` [[−]] **Ans** ([[SHIFT]] [[(-)]]) and press [[EXE]].", "180 - Ans EXE",
                    run("sin⁻¹(10sin 35÷8)", "45.80492614", "180-Ans", "134.1950739", right=(1, 3)), {"line": 2},
                    hint="Ans is above [[(-)]]. It keeps the full value, so you don't round too early."),
               ask("Write both answers.", ["$B \\approx 45.8^\\circ$ or $B \\approx 134^\\circ$", "$B \\approx 45.8^\\circ$ only", "$B \\approx 45.8^\\circ$ or $B \\approx 314^\\circ$"],
                   "Both are possible if $134.2^\\circ + 35^\\circ < 180^\\circ$, which is true here."),
           ], "$B \\approx 45.8^\\circ$ or $B \\approx 134^\\circ$. Use Ans instead of retyping a rounded value."),
    lesson("trig-equation", "Trig equation on an interval", "GRAPH (Rad) → ISCT",
           "Solve $3\\sin 2x = 1$ for $0 \\le x \\le \\pi$.", flist([], 1), [
               ask("Which angle mode?", ["Radians: the interval uses $\\pi$", "Degrees", "It doesn't matter"],
                   "An interval written with $\\pi$ means radians."),
               keys("Y1: `3` [[sin]] [[(]] `2` [[X,θ,T]] [[)]], then [[EXE]].", "3 sin ( 2 x ) EXE", flist(["3sin (2X)"], 2), {"line": 1, "prefix": "Y1:"}),
               keys("Y2: `1`, then [[EXE]].", "1 EXE", flist(["3sin (2X)", "1"], 3), {"line": 2, "prefix": "Y2:"}),
           ] + set_window(vwin(0, PI, -4, 4), "Xmin $= 0$ and Xmax $= \\pi$ (type [[SHIFT]] [[EXP]]), $-4 \\le y \\le 4$. The window is the interval, so you only see the solutions you need",
                          flist(["3sin (2X)", "1"], 1)) + [
               keys("Press [[F6]] **DRAW**.", "F6", graph(WT, FT)),
               gsolve(WT, FT),
               keys("Press [[F5]] **ISCT**.", "F5", pt(WT, FT, 0.1699184547, 1, "ISCT", "X=0.1699184547  Y=1")),
               keys("Press [[▶]] for the next one.", ">", pt(WT, FT, 1.400877872, 1, "ISCT", "X=1.400877872  Y=1")),
               ask("Write the solutions.", ["$x \\approx 0.170$ or $x \\approx 1.40$", "$x \\approx 0.17$ or $x \\approx 1.4$", "$x \\approx 9.74^\\circ$ or $x \\approx 80.3^\\circ$"],
                   "3 significant figures: $0.170$ keeps its last zero."),
           ], "$x \\approx 0.170$ or $x \\approx 1.40$. Setting Xmin and Xmax to the interval stops you from giving extra solutions."),
    lesson("trig-model", "Trig model: minimum", "GRAPH (Rad) → MIN",
           "The depth of water is $h(t) = 2.5\\cos\\left(\\dfrac{\\pi t}{6}\\right) + 4$ metres, $0 \\le t \\le 24$ hours. When is it lowest? The calculator is in radians.", flist([], 1), [
               keys("Y1: `2.5` [[cos]] [[(]] π [[X,θ,T]] [[÷]] `6` [[)]] [[+]] `4`, then [[EXE]]. π is [[SHIFT]] [[EXP]].",
                    "2 . 5 cos ( pi x / 6 ) + 4 EXE", flist(["2.5cos (πX÷6)+4"], 2), {"line": 1, "prefix": "Y1:"},
                    hint="π is the yellow label above [[EXP]]."),
           ] + set_window(vwin(0, 24, 0, 8, 2, 1), "$0 \\le x \\le 24$ (the hours) and $0 \\le y \\le 8$", flist(["2.5cos (πX÷6)+4"], 1)) + [
               keys("Press [[F6]] **DRAW**.", "F6", graph(WM, FM)),
               gsolve(WM, FM),
               keys("Press [[F3]] **MIN**.", "F3", pt(WM, FM, 6, 1.5, "MIN", "X=6  Y=1.5")),
               keys("Press [[▶]] for the next minimum.", ">", pt(WM, FM, 18, 1.5, "MIN", "X=18  Y=1.5")),
               ask("What is the maximum depth? Use the equation, not the calculator.", ["$4 + 2.5 = 6.5$ m", "$4$ m", "$2.5$ m"],
                   "The principal axis is $y = 4$ and the amplitude is $2.5$: maximum $4 + 2.5$, minimum $4 - 2.5 = 1.5$ ✓."),
           ], "Lowest depth $1.5$ m at $t = 6$ and $t = 18$ hours. Maximum $6.5$ m. Amplitude and principal axis let you check the GDC."),
    lesson("pi-exact", "π, radians and exact answers", "RUN•MAT π, F↔D",
           "Find the volume of a cone with $r = 4$ and $h = 9$, then convert $2.4$ radians to degrees.", BLANK, [
               ask("Which formula gives the volume of a cone?", ["$V = \\dfrac{1}{3}\\pi r^2 h$", "$V = \\pi r^2 h$", "$V = \\dfrac{4}{3}\\pi r^3$"],
                   "Formula booklet: $V = \\dfrac{1}{3}\\pi r^2 h$."),
               keys("Type `1` [[÷]] `3` [[×]] π [[×]] `4` [[x²]] [[×]] `9` and press [[EXE]]. π is [[SHIFT]] [[EXP]].",
                    "1 / 3 * pi * 4 sq * 9 EXE", run("1÷3×π×4²×9", "48π"), {"line": 0}),
               keys("Math mode keeps $\\pi$: $48\\pi$. Press [[F↔D]] for the decimal.", "FD", run("1÷3×π×4²×9", "150.7964474")),
               keys("Now $2.4$ rad in degrees: type `2.4` [[×]] `180` [[÷]] π and press [[EXE]].", "2 . 4 * 180 / pi EXE",
                    run("1÷3×π×4²×9", "150.7964474", "2.4×180÷π", "137.5098708", right=(1, 3)), {"line": 2}),
               ask("Write both answers.", ["$V = 48\\pi \\approx 151$ and $2.4$ rad $\\approx 138^\\circ$", "$V = 150.8$ and $2.4$ rad $= 137.5^\\circ$", "$V = 48$ and $2.4$ rad $\\approx 0.0419^\\circ$"],
                   "3 significant figures. Degrees $=$ radians $\\times \\dfrac{180}{\\pi}$."),
           ], "$V = 48\\pi \\approx 151$ and $2.4$ rad $\\approx 138^\\circ$. If a question says \"exact\", give $48\\pi$."),
])

# =====================================================================
# 5. Statistics
# =====================================================================
def lists(l1, l2=(), hl=None, top=1):
    rows = ["       List 1  List 2", "SUB"]
    n = max(len(l1), len(l2), 1)
    for i in range(top - 1, min(n, top + 3)):
        a = str(l1[i]) if i < len(l1) else ""
        b = str(l2[i]) if i < len(l2) else ""
        rows.append("%2d   %7s %7s" % (i + 1, a, b))
    s = {"type": "text", "lines": rows, "fkeys": STAT_F}
    if hl is not None: s["hl"] = hl
    return s


SET1 = ["1Var XList :List1", "1Var Freq  :1", "2Var XList :List1", "2Var YList :List2", "2Var Freq  :1"]
SETF = ["1Var XList :List1", "1Var Freq  :List2", "2Var XList :List1", "2Var YList :List2", "2Var Freq  :1"]


def onevar(mean, sx, sx2, sigma, s, n):
    return {"type": "text", "lines": ["1-Variable", "x̄   =" + mean, "Σx  =" + sx, "Σx² =" + sx2, "σx  =" + sigma, "sx  =" + s, "n   =" + n]}


def onevar2(mn, q1, med, q3, mx, mod):
    return {"type": "text", "lines": ["1-Variable", "minX=" + mn, "Q1  =" + q1, "Med =" + med, "Q3  =" + q3, "maxX=" + mx, "Mod =" + mod]}


D = [12, 15, 15, 18, 21, 24, 30]
V, F = [1, 2, 3, 4, 5], [3, 7, 6, 3, 1]
M, G = [5, 15, 25, 35, 45], [5, 12, 18, 10, 5]
X, Y = [1, 2, 3, 4, 5], [2.1, 3.9, 6.2, 7.8, 10.1]
save("statistics", [
    lesson("one-var", "1-variable statistics", "STAT → CALC 1VAR",
           "Find the mean, standard deviation and quartiles of $12,\\ 15,\\ 15,\\ 18,\\ 21,\\ 24,\\ 30$.", BLANK,
           menu_to("STAT", lists([]), "STAT is the second icon of the first row.") + [
               keys("Type the first values in List 1, with [[EXE]] after each: `12` [[EXE]] `15` [[EXE]] `15` [[EXE]] `18` [[EXE]].",
                    "12 EXE 15 EXE 15 EXE 18 EXE", lists(D[:4], top=1)),
               keys("And the rest: `21` [[EXE]] `24` [[EXE]] `30` [[EXE]].", "21 EXE 24 EXE 30 EXE", lists(D, top=4)),
               keys("Press [[F2]] **CALC**.", "F2", dict(lists(D, top=4), fkeys=CALC_F)),
               keys("Press [[F6]] **SET** to check which list is used.", "F6", {"type": "text", "lines": SET1, "hl": 0}),
               ask("Each value appears once in the list. What must 1Var Freq be?", ["$1$", "List2", "$7$"],
                   "Freq $= 1$ means every entry counts once. Use a frequency list only for frequency tables."),
               keys("1Var XList is List1 and 1Var Freq is 1. Press [[EXIT]].", "EXIT", dict(lists(D, top=4), fkeys=CALC_F)),
               keys("Press [[F1]] **1VAR**.", "F1", onevar("19.28571429", "135", "2835", "5.749889085", "6.210590034", "7")),
               ask("Which value is the standard deviation in IB?", ["$\\sigma x \\approx 5.75$", "$sx \\approx 6.21$", "$\\Sigma x = 135$"],
                   "IB uses the population standard deviation $\\sigma x$, not $sx$."),
               keys("Press [[▼]] to scroll down to the quartiles.", "v", onevar2("12", "15", "18", "24", "30", "15"),
                    hint="On your calculator, keep pressing ▼ until you see Q1, Med and Q3."),
               ask("What is the interquartile range?", ["$24 - 15 = 9$", "$30 - 12 = 18$", "$18$"],
                   "IQR $= Q_3 - Q_1$."),
           ], "$\\bar{x} \\approx 19.3$, $\\sigma \\approx 5.75$, $Q_1 = 15$, median $18$, $Q_3 = 24$, IQR $= 9$."),
    lesson("frequency", "Frequency table", "STAT, Freq = List2",
           "Find the mean, median and standard deviation of: value $1, 2, 3, 4, 5$ with frequency $3, 7, 6, 3, 1$. List 1 already holds the values.",
           lists(V, top=1), [
               keys("Move to List 2 with [[▶]].", ">", dict(lists(V, top=1), hl=2)),
               keys("Type the frequencies: `3` [[EXE]] `7` [[EXE]] `6` [[EXE]] `3` [[EXE]] `1` [[EXE]].", "3 EXE 7 EXE 6 EXE 3 EXE 1 EXE", lists(V, F, top=1)),
               keys("Press [[F2]] **CALC** then [[F6]] **SET**.", "F2 F6", {"type": "text", "lines": SET1, "hl": 0}),
               scroll("Press [[▼]] to highlight **1Var Freq**.", 1, {"type": "text", "lines": SET1, "hl": 1, "fkeys": ["1", "LIST"]}),
               keys("Press [[F2]] **LIST**, type `2` and press [[EXE]].", "F2=List 2 EXE", {"type": "text", "lines": SETF, "hl": 1, "fkeys": ["1", "LIST"]},
                    {"line": 1, "prefix": "1Var Freq  :"}),
               keys("Press [[EXIT]], then [[F1]] **1VAR**.", "EXIT F1", onevar("2.6", "52", "158", "1.067707825", "1.095445115", "20")),
               ask("Check $n$ first. What should it be?", ["$20$, the total frequency", "$5$, the number of values", "$15$"],
                   "$3 + 7 + 6 + 3 + 1 = 20$. If $n = 5$, Freq is still set to 1."),
               keys("Press [[▼]] to scroll down.", "v", onevar2("1", "2", "2.5", "3", "5", "2")),
               ask("Mean, median and standard deviation?", ["$2.6$, $2.5$ and $1.07$", "$2.6$, $3$ and $1.10$", "$3$, $2.5$ and $1.07$"],
                   "Mean $\\bar{x}$, median Med, standard deviation $\\sigma x$."),
           ], "Mean $2.6$, median $2.5$, $\\sigma \\approx 1.07$. Set Freq back to $1$ afterwards, or the next list will be wrong.", unverified=True),
    lesson("grouped", "Grouped data", "STAT → 1VAR",
           "Estimate the mean and standard deviation. Classes $0$–$10$, $10$–$20$, …, $40$–$50$ with frequencies $5, 12, 18, 10, 5$. The lists are filled in and Freq is List2.",
           lists(M, G, top=1), [
               ask("What did we type in List 1?", ["The mid-interval values $5, 15, 25, 35, 45$", "The lower bounds $0, 10, 20, 30, 40$", "The upper bounds $10, 20, 30, 40, 50$"],
                   "Each class is represented by its mid-interval value."),
               keys("Press [[F2]] **CALC** then [[F1]] **1VAR**.", "F2 F1", onevar("24.6", "1230", "36450", "11.12834219", "11.24132318", "50")),
               ask("Why does the question say *estimate*?", ["We used mid-interval values instead of the real data", "The calculator rounds", "$n$ is too small"],
                   "We don't know the exact values inside each class."),
           ], "Estimated mean $24.6$, $\\sigma \\approx 11.1$, $n = 50$."),
    lesson("regression", "Regression line and r", "STAT → REG X",
           "Find the regression line of $y$ on $x$ and $r$. List 1 holds $x$: $1, 2, 3, 4, 5$; List 2 holds $y$: $2.1, 3.9, 6.2, 7.8, 10.1$.",
           lists(X, Y, top=1), [
               keys("Press [[F2]] **CALC**.", "F2", dict(lists(X, Y, top=1), fkeys=CALC_F)),
               keys("Press [[F3]] **REG**.", "F3", dict(lists(X, Y, top=1), fkeys=["X", "Med", "X^2", "X^3", "X^4", "▷"])),
               keys("Press [[F1]] **X** (linear).", "F1", dict(lists(X, Y, top=1), fkeys=["ax+b", "a+bx"])),
               keys("Press [[F1]] **ax+b**.", "F1", {"type": "text", "lines": ["LinearReg(ax+b)", "a   =1.99", "b   =0.05", "r   =0.9986517556", "r²  =0.9973053289"]}),
               ask("Write the regression line.", ["$y = 1.99x + 0.05$", "$y = 0.05x + 1.99$", "$x = 1.99y + 0.05$"],
                   "With ax+b, $a$ is the gradient and $b$ the $y$-intercept."),
               ask("What does $r = 0.999$ tell you?", ["Very strong positive linear correlation", "Weak positive correlation", "$y$ is caused by $x$"],
                   "$r$ close to $1$: strong positive. Correlation does not prove causation."),
           ], "$y = 1.99x + 0.05$, $r \\approx 0.999$. For $x$ on $y$, swap the lists in SET (XList List2, YList List1)."),
    lesson("prediction", "Use the regression line", "RUN•MAT",
           "Use $y = 1.99x + 0.05$ to predict $y$ when $x = 3.5$. The data go from $x = 1$ to $x = 5$.", BLANK, [
               dict(MENU_STEP), RUN_STEP,
               keys("Type `1.99` [[×]] `3.5` [[+]] `0.05` and press [[EXE]].", "1 . 99 * 3 . 5 + 0 . 05 EXE",
                    run("1.99×3.5+0.05", "7.015"), {"line": 0}),
               ask("Is the prediction reliable?", ["Yes: $3.5$ is inside the data ($1$ to $5$) and $r$ is close to $1$", "No: you can never predict", "Only if $x$ is larger than 5"],
                   "Interpolation (inside the data) with strong correlation is reliable. Extrapolation, for example $x = 20$, is not."),
           ], "$y \\approx 7.02$ (3 s.f.). Use the regression of $y$ on $x$ to predict $y$; to predict $x$ from $y$, use the line of $x$ on $y$."),
])

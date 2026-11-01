# Volume & Surface Area (IGCSE 0580)

Interactive 3D lessons. Static site: HTML, CSS and ES modules, no build step. GitHub Pages serves it as it is.

## Files
| File | What it does |
|---|---|
| `index.html` | Menu of the 8 modules |
| `nets.html` | Module 1 · Nets & Surface Area |
| `tests.html` | Opens in the browser and checks every formula ("All … tests passed") |
| `js/formulas.js` | **Every** area and volume formula, rounding to 3 s.f. and answer checking. Change formulas only here. |
| `js/tests.js` | The tests for `formulas.js` |
| `js/viewer.js` | Shared 3D viewer (Three.js): camera, lights, rotate/zoom with mouse and touch, labels, Reset view |
| `js/shell.js` | Shared page parts: Teacher/Student mode, full screen, keyboard shortcuts, steps, questions, KaTeX |
| `js/foldable.js` | A net that folds into a solid (used by Module 1) |
| `js/modules/*.js` | One file per module |
| `css/app.css` | Styles (same colours as the rest of the site) |

Three.js 0.160, KaTeX 0.16.9 and es-module-shims (import maps for older Safari) load from cdn.jsdelivr.net. All paths are relative, so the folder works anywhere in the site.

## Keyboard (Teacher mode)
← → steps · space fold/unfold (animate/pause) · R reset view · P hide/show panel · F full screen

## Try it on your computer
From the repository folder: `python3 -m http.server 8000`, then open http://localhost:8000/Geometry/volume-surface-area/
(opening the HTML file with a double click does not work: browsers block modules from `file://`).

## Publishing
Nothing extra: commit and push, and GitHub Pages updates the site in a minute or two.

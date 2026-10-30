# Sitio de repaso IB Mathematics AA SL

## Ver el sitio en tu Mac
Doble clic en **`preview.command`**. Se abre `http://localhost:8000` en el navegador.
(Si macOS pide confirmación la primera vez: clic derecho → Abrir.)
Abrir `index.html` con doble clic **no funciona**: el navegador bloquea la carga de los archivos de contenido.

## Qué se publica y qué no
Solo se publica la carpeta **`site/`**. El resto queda en tu computadora:

| Carpeta | Qué hay | ¿Se publica? |
|---|---|---|
| `site/` | El sitio web | Sí |
| `source-papers/` | PDFs de past papers y markschemes | **No** |
| `reference/` | Guía del IB, formula booklet, manuales | **No** |
| `review/` | Archivos de revisión para vos | **No** |
| `tools/` | Scripts de verificación | **No** |

## Cómo agregar o editar un tema
1. Cada tema tiene su carpeta en `site/content/topics/<id>/` con `theory.md`, `gdc-casio.md` y `gdc-texas.md`. Si un archivo no existe, el sitio muestra "coming soon".
2. La lista de temas (orden, título, resumen, palabras clave) está en `site/content/syllabus.json`. El campo `mock` es el número del tema. Con `"status": "draft"` el tema queda oculto.

Ids de los temas: `straight-lines`, `quadratics`, `functions-transformations`, `exponents-logarithms`, `statistics`, `differentiation`, `geometry-trigonometry`.

## Past papers
Cada examen es un archivo en `site/content/papers/` (por ejemplo `2022-may-p1-tz1.json`) y tiene que figurar en `site/content/papers/index.json`. Cada pregunta tiene `primaryTopic` y `secondaryTopic` (ids de arriba): aparece en las dos páginas. Las figuras van en `site/content/papers/img/` y se insertan con `![descripción](content/papers/img/archivo.png)`.

## Sintaxis especial en los archivos `.md`
| Escribís | Se ve |
|---|---|
| `$x^2$` | fórmula en línea |
| `$$\dfrac{a}{b}$$` | fórmula centrada |
| `[[SHIFT]]` | tecla de calculadora |
| `{{unverified}}` | etiqueta "unverified" |
| `:::formula booklet Título` … `:::` | fórmula con etiqueta 📘 "In formula booklet" |
| `:::formula memorize Título` … `:::` | fórmula con etiqueta 🧠 "Memorize" |
| `:::example Título` pregunta `+++` solución `:::` | ejemplo resuelto, solución oculta |
| `:::tip`, `:::mistake`, `:::note`, `:::unverified` | recuadros de color |
| bloque ` ```graph ` con JSON | gráfico interactivo (ver ejemplos en `theory.md`) |

**Fracciones:** siempre `\dfrac{a}{b}`, nunca `a/b`. Para revisar todo el contenido:
```
ruby tools/check-fractions.rb
```

## Calculadora interactiva (Casio fx-9860GII)
La página `gdc.html#<id-del-tema>` muestra una calculadora para practicar las teclas paso a paso, con tres modos: Guided, Practice y Exam. Los ejercicios de cada tema están en `site/content/gdc/<id>.json`. Si ese archivo existe, la pestaña **Calculator** del tema muestra el botón para abrirla.

- **Cuadráticas** (`quadratics.json`) se edita a mano.
- **Los otros temas** se generan con `python3 tools/gen-gdc-lessons.py site/content/gdc`. Editá los ejercicios en ese script, no en el JSON, porque el script lo sobrescribe.
- Cada paso puede ser de cuatro tipos: teclas (`keys`), elegir un ícono del menú (`select`), bajar con ▼ (`scroll`) o una pregunta (`ask`). La respuesta correcta va primero en `options`: el sitio mezcla el orden. Los formatos están explicados al principio de `site/assets/js/gdc.js`.
- En la pantalla del gráfico, G-SOLV, ZOOM, V-WIN, etc. van directo con la tecla F, sin SHIFT. En la lista Y=, V-WIN sí es [[SHIFT]] [[F3]].
- `"unverified": true` en un ejercicio muestra la etiqueta "unverified". Sacala cuando lo compruebes en la calculadora.

## Formato de una pregunta
```json
{
  "id": "2022-may-p1-tz1-q1",
  "question": "1",
  "section": "A",
  "marks": 5,
  "primaryTopic": "straight-lines",
  "secondaryTopic": null,
  "status": "ok",
  "stem": "Enunciado textual, con $LaTeX$.",
  "parts": [
    { "label": "a", "marks": 3, "text": "Inciso.", "markscheme": "Resolución ***(M1)*** ***A1***" },
    { "label": "b", "marks": 2, "intro": "Texto entre incisos.", "text": "Inciso.", "markscheme": "…" }
  ]
}
```
`status`: `"ok"` o `"no-markscheme"` (se muestra un aviso y no se inventa la resolución).

## Herramientas
- `ruby tools/check-fractions.rb` — avisa si hay fracciones "a/b".
- `python3 tools/draw-trig-diagrams.py` — vuelve a dibujar los dos círculos unitarios de la teoría de trigonometría (`site/content/topics/geometry-trigonometry/img/`). Para cambiarlos, editá el script.
- `osascript -l JavaScript tools/render-page.js <pdf> <página> <salida.png>` — pasa una página de PDF a imagen para recortar figuras.
- `ruby tools/screenshot.rb <carpeta> <páginas…>` — capturas en celular, tablet y computadora (requiere Safari con "Permitir automatización remota").
- `ruby tools/check-new-papers.rb` — lista los PDFs nuevos de ~/Desktop/Claude que todavía no se procesaron (registro en `review/processed.json`).
- `osascript -l JavaScript tools/pdf-text.js <pdf>` — extrae el texto de un PDF.

## Exam Preparation (`prep.html`)
| Qué | Archivo para editar |
|---|---|
| Fecha del mock para todos los alumnos | `site/content/exam.json` → `"mockDate": "2026-11-20"` (formato AAAA-MM-DD). Cada alumno puede cambiarla en su dispositivo. |
| Flashcards | `site/content/flashcards.json` (un mazo por tema; 📘 = está en el booklet) |
| Hojas resumen | `site/content/topics/<id>/summary.md` |
| Técnica de examen | `site/content/exam-technique.md` |
| Simulacro | Usa automáticamente todas las preguntas de `site/content/papers/`. Solo puntúa las que tienen markscheme. |

Los resultados de los simulacros, el progreso del plan y las flashcards se guardan solo en el dispositivo de cada alumno.

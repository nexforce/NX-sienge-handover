---
name: nexforce-brand
version: 2.1.0
maintainer: willian@nexforce.ai
description: >
  Apply Nexforce's exact brand identity to any visual deliverable generated in Claude:
  HTML artifacts, PDFs, Word docs, PowerPoint decks, dashboards, reports, proposals,
  tables, and formatted emails. Triggers whenever a request will produce a finished,
  external, visually structured output. Covers logo placement, color palette, Lato
  typography, table and chart rules, accessibility, and tone.
---

# Nexforce Brand

Apply Nexforce's visual identity consistently across every external deliverable. Read this file end to end on first use; on subsequent uses, jump to the section that matches your task. Detailed reference material lives under `references/` — load it only when needed (see § "Reference files").

## TL;DR — seven rules that cover most failures

1. **Lato always.** Body, tables, charts, slides. Fallback: Calibri only — never Arial or Times New Roman. → § Typography
2. **Logo on every external deliverable.** Wordmark top-left of headers and covers; icon-mark bottom-left of footers in HTML/PDF/PPT (Word footers stay text-only). → § Logo & Backgrounds
3. **Predominantly black, white, gray.** Color punctuates meaning, never decorates. Green/yellow/red are reserved for numbers and status; never on titles, callouts, pull quotes, or decoration. → § Color Palette, § Emphasis
4. **Color the value, not the cell.** Semantic colors style text only. Cells with colored backgrounds are limited to header rows and totals (both Primary Black `#0C0E0E`). → § Tables
5. **`#9C9B9B` and `#D8B523` are not text on light.** Light Gray (2.8:1) is for borders/dividers/inactive states only; Yellow (2.0:1) only works as text on Primary Black `#0C0E0E`. → `references/accessibility.md`
6. **"Nexforce" — one word, capital N.** Never NexForce, Nex Force, Nex-Force, or lowercase in prose. The only place "NEXFORCE" appears is inside the wordmark logo itself. → § Brand name
7. **GitHub mirror URLs use `/raw/<commit>/`, never `/blob/<commit>/`.** `/blob/` returns the rendered repo page (HTML), so `<img>` tags pointing at it silently fail. → § Logo & Backgrounds

---

## Color Palette

### Core palette (always available — structure, hierarchy, emphasis)

| Role | HEX | Primary use |
|---|---|---|
| Primary Black | `#0C0E0E` | Main brand color. Headers, titles, dominant text, dark backgrounds |
| White | `#FFFFFF` | Backgrounds, text on dark, clean space |
| Dark Gray | `#515151` | Body text, paragraphs |
| Mid Gray | `#777777` | Captions, footnotes, secondary labels — never body text |
| Light Gray | `#9C9B9B` | Borders, inactive states, dividers — never as text on light |
| Near White | `#F5F5F5` | Alternating table rows, KPI card backgrounds |
| Navy | `#303F63` | Section titles, dividers, strategic callout borders |
| Blue | `#215A9F` | Informational callouts, links |

`#0C0E0E` (Primary Black), `#FFFFFF` (White), and `#9C9B9B` (Light Gray) come directly from the Nexforce logo — use them for dominant brand elements. Full WCAG contrast data and per-color hard rules: `references/accessibility.md`.

### Semantic colors — restricted use only

Green, yellow, and red are **semaphore colors**. Use them **exclusively** for:
- Numerical variation indicators (▲ +18%, ▼ −3%)
- Status values in tables (achieved / attention / critical)
- KPI deltas showing performance vs target

**Never use** green, yellow, or red for editorial highlights, pull quotes, section titles, decorative emphasis, callout titles or borders (use navy `#303F63` or `#215A9F` instead), or result metrics that are merely informational.

| Color | HEX | Allowed only when |
|---|---|---|
| Green | `#2D6E44` | Number/status is explicitly positive vs a target or baseline |
| Yellow | `#D8B523` | Number/status requires attention vs a target or baseline |
| Red | `#BA1925` | Number/status is explicitly negative, critical, or an alert |
| Orange | `#D56316` | In-progress status with caution signal |
| Purple | `#662A7F` | Innovation/product tags — sparingly |
| Pink | `#B1338A` | Marketing/campaign context only |

---

## Logo & Backgrounds

**Every external deliverable carries the Nexforce logo.** Two wordmark logos for headers/covers, two icon-marks for footers — all transparent.

### Logo files

The four logo assets are bundled at `assets/` inside this skill:

| File | Description | Use when |
|---|---|---|
| `assets/logo-black.png` | Dark wordmark, transparent bg | Light backgrounds (`#FFFFFF`, `#F5F5F5`) — white headers, body sections, light slides |
| `assets/logo-white.png` | White wordmark, transparent bg | Dark backgrounds (`#0C0E0E`) — dark headers, dark covers, dark slides |
| `assets/icon-black.png` | Dark badge with white X (no wordmark) | Footers on light backgrounds — small bottom-left mark |
| `assets/icon-white.png` | Light badge with dark X (no wordmark) | Footers on dark backgrounds — small bottom-left mark |

A public GitHub mirror exists for HTML artifacts that render in a browser. Each asset is pinned to a commit and never changes:

| File | Public URL |
|---|---|
| `logo-black.png` | `https://github.com/wteodosionx/nx-logo/raw/0ba05bc3bccba383d907e22aadd647514d03114d/NF%20-%20PRETO-01.png` |
| `logo-white.png` | `https://github.com/wteodosionx/nx-logo/raw/0ba05bc3bccba383d907e22aadd647514d03114d/NF%20-%20BRNCO-02.png` |
| `icon-black.png` | `https://github.com/wteodosionx/nx-logo/raw/ea215a8901d977e88355d82a440e69992dcdaf94/icon-black.png` |
| `icon-white.png` | `https://github.com/wteodosionx/nx-logo/raw/ea215a8901d977e88355d82a440e69992dcdaf94/icon-white.png` |

> Always use `/raw/<commit>/`, never `/blob/<commit>/`. `/blob/` URLs return the rendered repo page (HTML), so `<img>` tags pointing at them silently fail in artifacts.

> Because logos are transparent, never wrap them inside a colored `<div>` to fake a background. Place the logo on top of a page/section that is already the correct color — wrappers cause clipping and visible boxes around the glyphs.

### Which source to use by output type

| Output type | Source | Reason |
|---|---|---|
| HTML artifact rendered in user's browser | Public GitHub URL | Browser fetches the URL normally |
| PDF (WeasyPrint) / Word / PowerPoint | Local file via `nexforce_assets()` — **never an external URL** | Generation environment has no unrestricted internet access |

### Resolving the local asset path at runtime

When generating PDF/docx/pptx, call `nexforce_assets()` to get the absolute path to the `assets/` folder:

```python
import glob
from pathlib import Path

def nexforce_assets() -> Path:
    """Locate the nexforce-brand/assets folder across environments."""
    candidates = [
        Path("/mnt/skills/user/nexforce-brand/assets"),
        *[Path(p) for p in glob.glob("/sessions/*/mnt/Work/Skills/nexforce-brand/assets")],
        *[Path(p) for p in glob.glob("/sessions/*/mnt/.claude/skills/nexforce-brand/assets")],
        Path.home() / "Desktop" / "Work" / "Skills" / "nexforce-brand" / "assets",
    ]
    for p in candidates:
        if p.exists():
            return p
    raise FileNotFoundError("nexforce-brand/assets not found — check skill installation")

ASSETS = nexforce_assets()
LOGO_BLACK = str(ASSETS / "logo-black.png")
LOGO_WHITE = str(ASSETS / "logo-white.png")
ICON_BLACK = str(ASSETS / "icon-black.png")  # footer mark on light bg
ICON_WHITE = str(ASSETS / "icon-white.png")  # footer mark on dark bg
```

> If `nexforce_assets()` raises `FileNotFoundError`, embed logos as base64 directly in the HTML — never fall back to external URLs from inside a PDF/docx/pptx pipeline.
> ```python
> import base64
> data = base64.b64encode(open(local_path, "rb").read()).decode()
> src = f"data:image/png;base64,{data}"
> ```

This same `nexforce_assets()` is already importable from the bundled helpers (see § "Programmatic generation").

### Sizing

- HTML/PDF header (wordmark): `height: 28-32px; width: auto`
- Cover / title slide (wordmark): `height: 48-60px; width: auto`
- Word doc header (wordmark): ~2 cm height
- PowerPoint title slide (wordmark): ~3 cm height, top-left or bottom-left
- Footer icon-mark (HTML/PDF/PPT only): 14-18 px in HTML/PDF, 0.6 cm on slides — square, bottom-left

### Placement rules

- Headers on light pages: top-left, `logo-black.png` directly on the page background.
- Headers on dark pages: top-left, `logo-white.png` directly on the page/section background.
- Footers in HTML/PDF and PPT slides: icon-mark only, bottom-left (`icon-black.png` on light, `icon-white.png` on dark). Never write the word "Nexforce" next to the icon. Right-aligned metadata (page, date, confidentiality) in `#9C9B9B`, 8-9 px (HTML/PDF) or 9 pt (slides). **Word footers stay text-only — no icon-mark.**
- Cover/title pages: wordmark prominently placed, generous whitespace. Footer icon-mark may also be present at the bottom-left, sized down.
- Never stretch, rotate, or recolor either logo or icon-mark.
- Minimum clear space: half the logo/icon height on all sides.

### Header pattern (HTML / PDF)

```html
<!-- HTML artifact — light page: logo-black -->
<img src="https://github.com/wteodosionx/nx-logo/raw/0ba05bc3bccba383d907e22aadd647514d03114d/NF%20-%20PRETO-01.png"
     height="30" style="width:auto; display:block" alt="Nexforce"/>

<!-- HTML artifact — dark page: logo-white -->
<img src="https://github.com/wteodosionx/nx-logo/raw/0ba05bc3bccba383d907e22aadd647514d03114d/NF%20-%20BRNCO-02.png"
     height="30" style="width:auto; display:block" alt="Nexforce"/>

<!-- PDF via WeasyPrint — substitute {LOGO_BLACK}/{LOGO_WHITE} with nexforce_assets() paths -->
<img src="file://{LOGO_BLACK}" height="30" style="width:auto; display:block" alt="Nexforce"/>
```

### Footer pattern (HTML / PDF)

```html
<!-- HTML artifact -->
<div class="footer">
  <img class="footer-mark"
       src="https://github.com/wteodosionx/nx-logo/raw/ea215a8901d977e88355d82a440e69992dcdaf94/icon-black.png"
       alt="Nexforce" height="14"/>
  <div class="footer-info">Document Name &nbsp;·&nbsp; Period &nbsp;·&nbsp; Confidential &nbsp;·&nbsp; Internal use</div>
</div>

<!-- PDF via WeasyPrint — substitute {ICON_BLACK}/{ICON_WHITE} with nexforce_assets() paths -->
<div class="footer">
  <img class="footer-mark" src="file://{ICON_BLACK}" alt="Nexforce" height="14"/>
  <div class="footer-info">Document Name &nbsp;·&nbsp; Period &nbsp;·&nbsp; Confidential &nbsp;·&nbsp; Internal use</div>
</div>
```

```css
.footer {
  background: transparent;
  padding: 8px 0 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e8e8e8;
  position: absolute;   /* not fixed — avoids bleed across pages in WeasyPrint */
  bottom: 18px; left: 36px; right: 36px;
  height: 22px;
}
.footer-mark { height: 14px; width: 14px; display: block; opacity: 0.85; }
.footer-info { font-size: 8.5px; color: #9C9B9B; }
```

### Cover page pattern (SVG — bulletproof dark background)

Some PDF engines ignore `@page` backgrounds and CSS flex layouts do not always fill the page reliably. For dark cover pages, inline a full-page SVG with a solid dark rect and the white logo as an `<image>` child:

```html
<svg xmlns="http://www.w3.org/2000/svg"
     width="794" height="1123" viewBox="0 0 794 1123"
     preserveAspectRatio="none">
  <rect width="794" height="1123" fill="#0C0E0E"/>
  <!-- HTML artifact: href = public URL; WeasyPrint PDF: href = file://{LOGO_WHITE} -->
  <image href="<URL or file:// path to logo-white.png>" x="80" y="80" height="60"/>
  <!-- title, subtitle, meta as <text> elements with fill="#FFFFFF" or "#9C9B9B" -->
</svg>
```

---

## Typography

**Font family: Lato** — always, no exceptions.

| Weight | Use case |
|---|---|
| Lato Heavy / Bold | Titles, section headers, KPI numbers, key emphasis |
| Lato Regular | Body text, paragraphs, table content |
| Lato Light | Captions, footnotes, secondary labels, watermarks |

In HTML/CSS:
```css
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap');
font-family: 'Lato', sans-serif;
```

In Word and PowerPoint, set Lato as the theme font. Fallback: Calibri only — never Arial or Times New Roman.

---

## Document Structure & Hierarchy

| Level | Style |
|---|---|
| H1 / Title | Lato Heavy, large, `#0C0E0E` (or white on dark) |
| H2 / Section | Lato Bold, `#303F63` (navy) or `#0C0E0E` |
| H3 / Subsection | Lato Bold, `#515151` |
| Body | Lato Regular, `#515151` or `#0C0E0E` |
| Caption / footnote | Lato Light, `#777777` |

Generous whitespace, never cramped. Clear visual separation between sections. Consistent left alignment for text blocks.

---

## Tables

### Default style
- **Header row**: bg `#0C0E0E`, text `#FFFFFF`, Lato Bold
- **Alternating rows**: `#FFFFFF` and `#F5F5F5`
- **Borders**: `#9C9B9B`, 1 px, subtle
- **Text**: Lato Regular, `#515151`
- **Numbers** right-aligned; **text** left-aligned

### Semantic emphasis in tables

**Never fill cells with color.** Color goes on the number/text itself — bold + colored text on a white cell.

| Situation | How to apply |
|---|---|
| Positive value / achieved | Font color `#2D6E44`, bold |
| Needs attention | Font color `#D8B523`, bold *(legible only on dark — see accessibility)* |
| Alert / negative / critical | Font color `#BA1925`, bold |
| Informational highlight | Font color `#215A9F`, bold |
| Total / summary row | Background `#0C0E0E`, text `#FFFFFF` — for footer/total rows only |

The table reads predominantly black, white, and gray. Color punctuates meaning, never decorates.

---

## Bullet Points & Lists

- Bullet markers: `#0C0E0E` or `#515151` — never colored
- Ordered lists with priority: bold numbers in `#0C0E0E`
- Status lists: prefix the text with semantic emoji (🟢 done, 🟡 in progress, 🔴 blocked) — bullet color stays neutral
- Maximum 2 levels of nesting
- Bullet text: Lato Regular, `#515151`

---

## Emphasis Rules

The palette is predominantly black, white, and gray. Green, yellow, and red are reserved for numerical/status judgment.

| Situation | How to emphasize |
|---|---|
| Key metric or KPI number | Lato Bold/Heavy, larger size, `#0C0E0E` |
| Positive number vs target | Bold + `#2D6E44` |
| Negative / alert number | Bold + `#BA1925` |
| Number needing attention | Bold + `#D8B523` *(dark backgrounds only — see accessibility)* |
| Editorial highlight / pull quote | Bold, `#0C0E0E` or `#303F63` — never green/red/yellow |
| Strategic callout | Left-border navy `#303F63` + bg `#ECEEF4` |
| Informational callout | Left-border blue `#215A9F` + bg `#EEF3FB` |
| Definition or term | Lato Bold, inline, `#0C0E0E` |

**Hard rules:** never underline for emphasis; semantic colors only on numbers or explicit status; never fill table cells with semantic color (color the number only); when in doubt, use bold `#0C0E0E`.

---

## Callout Boxes

Used for key insights, recommendations, warnings, summaries. 4 px colored left border + tinted background + Lato Bold title + Lato Regular body.

| Type | Border | Background |
|---|---|---|
| Info | `#215A9F` | `#EEF3FB` |
| Success | `#2D6E44` | `#EEF7F1` |
| Warning | `#D8B523` | `#FDF8E1` |
| Alert | `#BA1925` | `#FDECEA` |
| Strategic | `#303F63` | `#ECEEF4` |

### HTML / PDF pattern — print-safe

Callouts in WeasyPrint break in two specific ways: text overflows the right margin when `box-sizing` is missing or a long word can't wrap, and the box splits awkwardly across pages. The pattern below prevents both. **Use it as-is — do not strip rules to make it shorter.**

```html
<div class="callout callout-strategic">
  <strong class="callout-title">Strategic Insight</strong>
  <p class="callout-body">Retail Stores and Returns channels present the highest fulfillment risk this quarter…</p>
</div>
```

```css
.callout {
  /* Layout — prevents right-margin overflow */
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  padding: 12px 16px;
  margin: 12px 0;

  /* Text wrapping — prevents cut-off on long words/URLs */
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;

  /* Pagination — keeps the callout on one page in WeasyPrint */
  page-break-inside: avoid;        /* legacy */
  break-inside: avoid;             /* modern */

  /* Default visual — overridden per kind below */
  border-left: 4px solid #303F63;
  background: #ECEEF4;
  font-family: 'Lato', sans-serif;
}
.callout-title {
  display: block;
  margin: 0 0 6px 0;
  color: #0C0E0E;
  font-weight: 700;
  font-size: 11pt;
  line-height: 1.3;
}
.callout-body {
  margin: 0;
  color: #515151;     /* explicit — never inherit, never gray lighter than #515151 */
  font-weight: 400;
  font-size: 10pt;
  line-height: 1.5;
}

/* Variants — change border + background, nothing else */
.callout-info      { border-left-color: #215A9F; background: #EEF3FB; }
.callout-success   { border-left-color: #2D6E44; background: #EEF7F1; }
.callout-warning   { border-left-color: #D8B523; background: #FDF8E1; }
.callout-alert     { border-left-color: #BA1925; background: #FDECEA; }
.callout-strategic { border-left-color: #303F63; background: #ECEEF4; }
```

**Common pitfalls** — a recently observed PDF showed the body text cut off as "…processing ca". Three fixes from the pattern above prevent it:

1. **Right-margin overflow.** Without `box-sizing: border-box` the padding pushes content past the container width and WeasyPrint clips it. Always set `box-sizing: border-box` and `max-width: 100%`.
2. **Body color inherited from a faded ancestor.** Set `color: #515151` explicitly on `.callout-body` — never inherit. The footer uses `#9C9B9B`, and a callout nested near it can pick that up. `#9C9B9B` and `#777777` are never body colors (see `references/accessibility.md`).
3. **Long unbreakable strings.** URLs, hashes, or compound words in non-English text can shoot past the right edge. `overflow-wrap: break-word` + `hyphens: auto` lets the renderer break gracefully.

For the page-break behavior, also check § "Pagination" — it applies to all block-level branded components, not just callouts.

---

## Pagination & Layout Safety

Branded blocks must render correctly in HTML, PDF (WeasyPrint), Word, and PowerPoint. **PDF via WeasyPrint is the strictest** — it's the format where mistakes show up first. Six hard rules apply to every block-level branded component (callouts, KPI cards, tables, chart containers, headers, footers):

1. **Atomic blocks never split across pages** — `break-inside: avoid` (and legacy `page-break-inside: avoid`) on every container.
2. **Headings stay with their next sibling** — `break-after: avoid` on `h1, h2, h3`.
3. **Tables repeat their header row when they span pages** — `<thead>` + `display: table-header-group`. Body rows individually `break-inside: avoid`.
4. **Nothing escapes the right margin** — every branded block gets `box-sizing: border-box`, `max-width: 100%`, and `overflow-wrap: break-word`. This kills the most common PDF bug: text clipped because padding pushed it past the container.
5. **Footers use `position: absolute`, not `fixed`** — see § "Logo & Backgrounds".
6. **Test long content before delivery** — at least one 4+ line paragraph, one 30+ character unbreakable string, and one table that crosses a page boundary.

For the print-safe base CSS, the per-rule rationale, the Word/PowerPoint mapping, and the smoke-test checklist, read `references/print-safety.md`. The python-docx helpers already call `_set_row_cant_split()` and `_set_paragraph_keep_with_next()` on every branded block — use the helpers when generating docx and the rules above propagate automatically.

---

The Nexforce voice is adaptive — same vocabulary and brand-name rules (see `references/voice.md`), different register per document type.

| Document type | Tone | Color emphasis |
|---|---|---|
| Executive report / board deck | Formal, direct, data-first | Navy `#303F63`, black, minimal color |
| Sales / commercial proposal | Dynamic, value-focused | Blue `#215A9F`, green for wins |
| Operations / internal report | Technical, structured | Navy, semantic colors for status |
| Marketing / campaign | Energetic, bold | Pink `#B1338A`, purple `#662A7F` |
| Alert / incident report | Urgent, clear | Red `#BA1925` dominant |

---

## Brand name

**Nexforce** — one word, capital N, lowercase rest. Never NexForce, Nex Force, Nex-Force, or lowercase in prose. The only place "NEXFORCE" appears is inside the wordmark logo itself. Full vocabulary, tone-by-language guidance, number formatting, and the email template live in `references/voice.md`.

---

## Charts (summary)

Charts follow the same logic as the rest of a document: predominantly black/white/gray, color used sparingly. **Default mode (Highlight-one):** featured series in Navy `#303F63`, context in Mid Gray `#777777`, ambient in Light Gray `#9C9B9B`. **Up to 3 series.** For more series, use small multiples or a table. **Semantic colors are never data-series colors.** Full rules, escape-hatch palette for compare-many, hygiene checklist, and Recharts/matplotlib snippets: `references/charts.md`.

---

## Icons (summary)

Lucide is the canonical icon set. 75 SVGs are bundled at `assets/icons/`. **Outline only, stroke 1.5 px at 24 px size, no backgrounds, never decorative.** Default color inherits surrounding text; navy `#303F63` for icons paired with H1/H2; semantic colors only when the icon carries that meaning. Full sizing scale, color rules, when-to-use guidance, and integration code (Lucide React + python-pptx + cairosvg): `references/icons.md`.

---

## Accessibility (summary)

Every text/background combination must meet WCAG AA at minimum. Three rules cover most failures:

- `#9C9B9B` Light Gray as text on light backgrounds — **never** (2.8:1, fails everything). Borders/dividers only.
- `#D8B523` Yellow as text on light backgrounds — **never** (2.0:1). Yellow only works as text on `#0C0E0E` (9.7:1).
- `#777777` Mid Gray for body — **never**. Captions and footnotes only, ≥14 pt bold or ≥18 pt.

Full per-color contrast table for `#FFFFFF`, `#F5F5F5`, and `#0C0E0E` backgrounds: `references/accessibility.md`.

---

## Programmatic generation (Python)

For automated docx and pptx generation, this skill ships two helper modules under `references/`:

- `references/python_docx_helpers.py` — Word documents
- `references/python_pptx_helpers.py` — PowerPoint decks

Both expose the same `NEXFORCE_COLORS` palette, the `nexforce_assets()` resolver, and high-level builders that enforce Lato, palette-only colors, and the table/callout/KPI rules above. Import by adding the skill's `references/` folder to `sys.path`.

**Deck checklist (pptx).** `apply_nexforce_theme(prs)` first (16:9 canvas) → `cover_slide(prs, title, subtitle, meta)` → `content_slide(prs, title)` → `section_divider_slide(prs, title)` → `closing_slide(prs, message, contact)`. KPIs via `add_kpi_block`, tables via `add_brand_table`, footers via `add_brand_footer(slide, prs, meta=..., on_dark=...)`. Logo width is computed from the PNG aspect ratio at runtime — never hardcode it.

**Document checklist (docx).** `apply_nexforce_theme(doc)` first → `insert_brand_cover(doc, title, subtitle, author)` for documents over 5 pages → `insert_brand_header(doc, title, period)` and `insert_brand_footer(doc)` → tables via `create_brand_table` → callouts via `add_callout(doc, kind, ...)` with kind in `{info, success, warning, alert, strategic}` → semantic emphasis on a cell value via `apply_semantic_text(cell, value, kind)` (never fills the cell background).

---

## When NOT to apply this skill

Brand framing has a cost. The question is "will an external person see this finished?" If yes, brand it. If no, save the effort.

**Skip the brand for** code-only deliverables, conversational replies, third-party templates (use theirs), internal scratchwork (notes, drafts), customer materials in the customer's brand, single-table answers in a chat thread.

**Apply the brand when** the output is finished, external, and visual: presentations, proposals, formal reports, customer-facing PDFs, marketing assets, dashboards shared outside the team.

---

## Per-format quick checklist

**PowerPoint deck.** 16:9 widescreen · Cover on Primary Black with white wordmark top-left · Section dividers between major sections · Content slides on white with black header wordmark · All text in Lato; navy for titles, dark gray or black for body · Tables via `add_brand_table`; KPIs via `add_kpi_block` · Closing slide with centered wordmark.

**Word document.** Letterhead with wordmark and confidentiality footer · H1 navy, H2 dark gray, body Lato 11 pt dark gray · Tables: black header row, alternating white / `#F5F5F5` body · Page numbers in footer (text only — no icon-mark) · Cover page for documents over 5 pages.

**HTML / dashboard.** Lato via Google Fonts · Background white or `#F5F5F5` · Charts follow chart rules (`references/charts.md`) · WCAG AA minimum on all text.

**Email.** Plain text, no HTML branding · Under 150 words · Subject leads with the topic · Sign-off: `— [Name] / Nexforce`.

---

## Reference files

Load only when the task touches the topic:

| File | When to read |
|---|---|
| `references/accessibility.md` | Picking a text color and unsure if it passes contrast on the chosen background |
| `references/print-safety.md` | Generating a PDF or print-targeted HTML — pagination, page-break behavior, smoke-test checklist |
| `references/charts.md` | Building any chart (Recharts, matplotlib, slide chart) |
| `references/voice.md` | Writing copy, vocabulary choices, multi-language deliverables, email templates |
| `references/icons.md` | Adding icons to a deliverable (sizing, color, integration code) |
| `references/python_docx_helpers.py` | Generating a `.docx` programmatically |
| `references/python_pptx_helpers.py` | Generating a `.pptx` programmatically |
| `CHANGELOG.md` | Editing this skill — add a new row when bumping the version |

Editing this skill: make the change → bump `version:` in the frontmatter above → add a row to `CHANGELOG.md` (date in ISO, change in one line) → run the smoke tests (`nexforce-brand-smoke.docx` and `.pptx`) before sharing.

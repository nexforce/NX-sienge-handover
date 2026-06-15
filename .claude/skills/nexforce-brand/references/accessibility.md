# Backgrounds & Accessibility

Read this file when you need exact contrast ratios or are deciding which color is safe on a given background. The hard rules are also summarized in `SKILL.md` § "Color Palette" and § "Logo & Backgrounds".

## Text colors by background

**On light backgrounds (`#FFFFFF` / `#F5F5F5`)**
- Titles / H1: `#0C0E0E` or `#303F63` (both AAA)
- Body: `#515151` (AAA) or `#0C0E0E` (AAA)
- Captions only (≥14pt bold or ≥18pt): `#777777` — never for body text
- Decorative only: `#9C9B9B` — borders, dividers, inactive states; never as text
- Structural accents: Navy `#303F63`, Blue `#215A9F`, Purple `#662A7F` (all AA+)
- Semantic accents (numbers/status only): Green `#2D6E44`, Red `#BA1925` pass AA as text; Orange `#D56316` needs ≥14pt bold; Yellow `#D8B523` never works as text on light

**On dark backgrounds (`#0C0E0E`)**
- All body text: `#FFFFFF` (AAA)
- Secondary text: `#9C9B9B` (AA) — preferred over `#777777` on dark
- Semantic accents legible on dark: Yellow `#D8B523` (AAA — the only context where yellow text works), Orange `#D56316` (AA)
- Large-text/bold only on dark: Mid Gray `#777777`, Green `#2D6E44`, Red `#BA1925`, Pink `#B1338A`
- **Never use on dark as text**: Navy `#303F63`, Blue `#215A9F`, Dark Gray `#515151`, Purple `#662A7F` — all fail contrast. If a block needs these colors, invert it to a light background instead.

## WCAG contrast reference

All values measured per WCAG 2.1. AA requires ≥4.5:1 for normal text and ≥3:1 for large text (≥18pt or ≥14pt bold). AAA is ≥7:1 / ≥4.5:1.

| Foreground | on `#FFFFFF` | on `#F5F5F5` | on `#0C0E0E` |
|---|---|---|---|
| `#0C0E0E` Primary Black | 19.4:1 AAA | 17.8:1 AAA | — |
| `#FFFFFF` White | — | — | 19.4:1 AAA |
| `#515151` Dark Gray | 7.9:1 AAA | 7.3:1 AAA | 2.4:1 FAIL |
| `#777777` Mid Gray | 4.5:1 AA Large | 4.1:1 AA Large | 4.3:1 AA Large |
| `#9C9B9B` Light Gray | 2.8:1 FAIL | 2.5:1 FAIL | 7.0:1 AA |
| `#303F63` Navy | 10.4:1 AAA | 9.6:1 AAA | 1.9:1 FAIL |
| `#215A9F` Blue | 6.9:1 AA | 6.4:1 AA | 2.8:1 FAIL |
| `#2D6E44` Green | 6.1:1 AA | 5.6:1 AA | 3.2:1 AA Large |
| `#D8B523` Yellow | 2.0:1 FAIL | 1.8:1 FAIL | 9.7:1 AAA |
| `#BA1925` Red | 6.5:1 AA | 5.9:1 AA | 3.0:1 AA Large |
| `#D56316` Orange | 3.7:1 AA Large | 3.4:1 AA Large | 5.2:1 AA |
| `#662A7F` Purple | 9.5:1 AAA | 8.8:1 AAA | 2.0:1 FAIL |
| `#B1338A` Pink | 5.7:1 AA | 5.2:1 AA | 3.4:1 AA Large |

## Hard accessibility rules

- **Never use `#9C9B9B` (Light Gray) as body text on light backgrounds** — 2.8:1 fails everything. Reserve for borders, dividers, and inactive states.
- **Never use `#D8B523` (Yellow) as text on light backgrounds** — 2.0:1 fails everything. Yellow is legible only on `#0C0E0E` (9.7:1) — use there for attention/warning values in status contexts.
- **`#777777` (Mid Gray) is captions and footnotes only** — requires ≥14pt bold or ≥18pt to scrape AA Large. Never for body text.
- **`#D56316` (Orange) requires bold or ≥14pt on light backgrounds** (3.7:1 = AA Large only).
- **Dark backgrounds are hostile to Navy, Blue, Purple and Dark Gray** — all fail AA. If a dark section needs those hues, invert to a light block instead of fighting contrast.
- Logo on dark surfaces: `logo-white.png`. Logo on light surfaces: `logo-black.png`.

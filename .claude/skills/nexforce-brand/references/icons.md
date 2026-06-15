# Icons (Lucide)

Read this file when adding icons to any deliverable. Icons are decoration with a job — they speed scanning and disambiguate categories. Used poorly they add visual noise and weaken hierarchy. Treat icons like punctuation: remove them by default, add them only when they carry meaning.

## Library

**Lucide** is the canonical icon set for Nexforce.

- Open source (ISC license), exhaustive (~1,500+ icons), consistent geometry
- Already available in HTML artifacts via `lucide-react@0.383.0`
- A curated subset of 75 SVGs is bundled inside the skill at `assets/icons/` for offline use in PowerPoint, Word, and PDF (via WeasyPrint)
- For icons not in the bundle, pull from [lucide.dev](https://lucide.dev) — they ship as the same `stroke="currentColor"` SVGs, so behavior is consistent

Do not mix icon libraries within a single document. If Lucide doesn't have what you need, redraw from scratch in the same outline style — never drop in a Material/FontAwesome/Heroicons icon to fill the gap.

## Bundled icons (75)

Sourced from `lucide-static@0.460.0` (ISC). All files are unmodified — `stroke="currentColor"` and `stroke-width="2"` (Lucide default; override to 1.5 in CSS or via SVG attribute for the Nexforce brand stroke — see Style rules below).

| Category | Icons |
|---|---|
| Status / signals | `check`, `circle-check`, `x`, `circle-x`, `triangle-alert`, `circle-alert`, `info`, `circle-help`, `shield-check`, `shield-alert`, `ban`, `lock` |
| Navigation | `arrow-left/right/up/down`, `arrow-up-right`, `chevron-left/right/up/down`, `menu`, `ellipsis`, `external-link` |
| Files / data | `file`, `file-text`, `folder`, `folder-open`, `download`, `upload`, `paperclip`, `copy` |
| Finances | `dollar-sign`, `banknote`, `coins`, `wallet`, `credit-card`, `trending-up`, `trending-down`, `percent`, `calculator`, `receipt` |
| Marketplace | `shopping-cart`, `shopping-bag`, `package`, `store`, `tag`, `gift`, `truck` |
| Dashboards / charts | `layout-dashboard`, `layout-grid`, `activity`, `target`, `gauge`, `chart-bar`, `chart-column`, `chart-area`, `chart-line`, `chart-pie` |
| People / contacts | `user`, `users`, `user-plus`, `user-check`, `building`, `building-2`, `contact`, `briefcase` |
| Time / scheduling | `calendar`, `calendar-clock`, `clock`, `history` |
| Communication | `mail`, `message-square`, `phone`, `send` |

## Style rules

- **Outline only** — no filled icons. The Nexforce visual system is line-based.
- **Stroke weight 1.5px** at 24px size. Scale proportionally: 1px at 16px, 2px at 32px+.
- **Square corners** — Lucide's default `linejoin: round` is acceptable; never bevelled.
- **No backgrounds** behind the icon. No circles, no rounded squares wrapping the icon.

## Sizing scale

| Context | Size | Stroke |
|---|---|---|
| Inline with body text | 16px | 1px |
| Section headings, list bullets | 20px | 1.5px |
| Cards, KPI tiles | 24px | 1.5px |
| Featured / hero | 32–48px | 2px |

In Word and PowerPoint, use the equivalent in points: 12pt / 14pt / 18pt / 24pt+. Never stretch — keep aspect 1:1.

## Color rules

- **Default**: inherit the surrounding text color. On white backgrounds, that's `#0C0E0E` (with body) or `#515151` (with captions). On dark covers, `#FFFFFF`.
- **Navy `#303F63`** for icons paired with H1/H2 titles.
- **Semantic colors** allowed only when the icon carries that meaning: ✓ check in Green for success, ⚠ in Yellow for warning, ✗ in Red for alert. Never decorative.
- **Never** use Yellow on white at any weight (fails contrast). Yellow icons go on dark backgrounds only.

## When to use icons

- Status indicators in dashboards (success/warning/alert)
- List markers when each item belongs to a clear category (file types, channels, integrations)
- Section headings in long documents to aid scanning
- KPI tiles to anchor the metric type (revenue, users, latency)
- Empty states and loading states

## When NOT to use icons

- Inside body paragraphs as decoration
- Next to every bullet in a generic list (use plain Lato bullets)
- Inside tables — they fight with the data
- On covers and section dividers — let typography carry the weight
- Replacing words ("📈 grew 18%") — write the word

## HTML artifact (Lucide React)

```jsx
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

<TrendingUp size={20} strokeWidth={1.5} color="#2D6E44" />
<AlertTriangle size={20} strokeWidth={1.5} color="#D8B523" />
<CheckCircle size={16} strokeWidth={1} color="#2D6E44" />
```

## PowerPoint / Word

1. Pick the SVG from `assets/icons/` (bundled). For something not in the bundle, fetch from [lucide.dev](https://lucide.dev) — same format
2. Edit the SVG in place to set stroke color (e.g., `stroke="#0C0E0E"` or `stroke="#303F63"`) and stroke width (`stroke-width="1.5"` for the brand). Then either:
   - Embed the SVG directly via python-pptx (preserves vector crispness), or
   - Export to PNG at 4× target size (e.g., 96 px PNG for a 24 pt slide icon) and insert via `slide.shapes.add_picture(...)` / `doc.add_picture(...)`
3. Always include alt text describing what the icon represents — required for accessibility

```python
from python_pptx_helpers import nexforce_assets

icon_path = str(nexforce_assets() / "icons" / "trending-up.svg")
# Convert SVG to PNG with the brand stroke baked in:
import cairosvg
svg = open(icon_path).read().replace('stroke="currentColor"', 'stroke="#2D6E44"')\
                            .replace('stroke-width="2"', 'stroke-width="1.5"')
cairosvg.svg2png(bytestring=svg.encode(), write_to="/tmp/trending-up.png",
                 output_width=96, output_height=96)
```

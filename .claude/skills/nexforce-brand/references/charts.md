# Charts & Data Visualization

Read this file when building any chart (Recharts, matplotlib, Plotly, slide chart, dashboard tile). The summary lives in `SKILL.md` § "Charts" — full rules and code below.

Charts follow the same logic as the rest of a Nexforce document: predominantly black, white and gray, with color used sparingly and meaningfully. Semantic colors (green/yellow/red/orange) are **never** used as data-series colors — they remain strictly reserved for status and KPI deltas, so a chart must not steal their meaning.

## Standard mode: Highlight-one (default)

One series carries the narrative; the others sit in grayscale as context. Works up to 3 series without exception. Default for every chart unless there is a specific reason to use the escape-hatch mode.

| Slot | Color | Use for |
|---|---|---|
| 1 — featured series | `#303F63` Navy (or `#0C0E0E` Primary Black) | The one series the reader should focus on |
| 2 — context | `#777777` Mid Gray | Secondary series providing context |
| 3 — ambient | `#9C9B9B` Light Gray | Further background series, benchmarks |
| Reference line | `#515151` dashed | Target, baseline, average, historical reference |

If the chart would need more than 3 series and there is no single narrative to highlight, redesign instead of expanding the palette:
- Split into **small multiples** (one sub-chart per series, shared axes, same scale).
- Keep the top 3 series by relevance and collapse the rest into a single "Other" line in Light Gray.
- Switch to a table when comparison detail matters more than visual pattern.

## Escape-hatch mode: Compare-many

Only when multiple series have genuinely equivalent weight and small multiples don't fit. Use the ordered sequence below — always starting at slot 1, never skipping, never reordering:

| Slot | Color |
|---|---|
| 1 | `#303F63` Navy |
| 2 | `#215A9F` Blue |
| 3 | `#777777` Mid Gray |
| 4 | `#662A7F` Purple |
| 5 | `#B1338A` Pink |

Hard cap at 5. Above 5 series, Compare-many is no longer acceptable — use small multiples or a table.

## Chart hygiene (applies to both modes)

- **Axes**: `#515151`, 1px solid; hide top and right spines
- **Gridlines**: `#F5F5F5`, horizontal only (drop vertical grids unless the x-axis is categorical and values must be read across columns)
- **Axis titles**: Lato Regular 11pt, `#777777`
- **Tick labels**: Lato Regular 11pt, `#515151`
- **Legend**: Lato Regular 11pt, `#515151`, top-right, no frame
- **Data labels**: only when they add information; Lato Bold, `#0C0E0E`
- **Reference lines**: dashed `#515151` with inline annotation in Lato Bold `#0C0E0E`
- **Chart background**: pure `#FFFFFF` on light pages, pure `#0C0E0E` on dark covers — never Near White under a chart
- **Bars**: solid fill, no border, no gradient, no 3D
- **Lines**: stroke 2-3px, no markers unless data points are sparse (<10)
- **Stacked areas**: opacity 0.75 to keep layers readable
- **Pies and donuts**: avoid — prefer a horizontal bar chart sorted by value. If a donut is unavoidable, use the Compare-many sequence, never exceed 4 slices, and always show values (not only percentages)

## Semantic overlays on charts (allowed, but restricted)

The semaphore colors may appear **on top of** a chart — never as the series themselves. Legitimate uses:

- Arrow annotations next to a number: ▲ `+18%` in `#2D6E44`, ▼ `-3%` in `#BA1925`
- Threshold markers — a single horizontal line in red if values above/below represent an alert
- Zone shading behind a line (e.g., "below target" band) — only when explicitly approved for the specific chart

## Code snippets

**Recharts (HTML artifact)** — Highlight-one, 3 series:

```jsx
const COLORS = { featured: "#303F63", context: "#777777", ambient: "#9C9B9B" };

<LineChart data={data}>
  <CartesianGrid stroke="#F5F5F5" vertical={false} />
  <XAxis stroke="#515151" tick={{ fill: "#515151", fontSize: 11 }} />
  <YAxis stroke="#515151" tick={{ fill: "#515151", fontSize: 11 }} />
  <Line type="monotone" dataKey="featured" stroke={COLORS.featured} strokeWidth={2.5} dot={false} />
  <Line type="monotone" dataKey="context"  stroke={COLORS.context}  strokeWidth={2}   dot={false} />
  <Line type="monotone" dataKey="ambient"  stroke={COLORS.ambient}  strokeWidth={2}   dot={false} />
  <ReferenceLine y={TARGET} stroke="#515151" strokeDasharray="4 4" label="Target" />
</LineChart>
```

**matplotlib (PDF / embedded image)** — Highlight-one, 3 series:

```python
import matplotlib.pyplot as plt

plt.rcParams.update({
    "font.family": "Lato",
    "axes.edgecolor": "#515151",
    "axes.labelcolor": "#515151",
    "xtick.color": "#515151",
    "ytick.color": "#515151",
    "grid.color": "#F5F5F5",
    "axes.spines.top": False,
    "axes.spines.right": False,
})

fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(x, featured, color="#303F63", linewidth=2.5, label="Featured")
ax.plot(x, context,  color="#777777", linewidth=2,   label="Context")
ax.plot(x, ambient,  color="#9C9B9B", linewidth=2,   label="Ambient")
ax.axhline(TARGET, color="#515151", linestyle="--", linewidth=1)
ax.legend(frameon=False, loc="upper right")
```

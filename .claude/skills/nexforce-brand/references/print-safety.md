# Print Safety — PDF (WeasyPrint) & paginated outputs

Read this when generating any PDF or print-targeted HTML. The summary lives in `SKILL.md` § "Pagination & Layout Safety" — full CSS, behavior notes, and Word/PowerPoint mapping below.

WeasyPrint is the strictest renderer Nexforce uses — it's the format where pagination mistakes show up first. The rules here apply to every block-level branded component: callouts, KPI cards, tables, chart containers, summary boxes, headers, footers.

## Hard rules

1. **No mid-page splits on atomic blocks.** A callout, KPI card, or summary box must never break across two pages. Use `break-inside: avoid` (and the legacy `page-break-inside: avoid`) on every branded block container.
2. **Headings stay with their next sibling.** Use `break-after: avoid` on headings so an H2 is never the last line of a page.
3. **Tables keep their header row across pages.** When a table legitimately spans multiple pages, repeat the header row using `<thead>` + `display: table-header-group` (WeasyPrint honors this). Body rows get `break-inside: avoid` individually.
4. **No content beyond the right margin.** Every block-level branded element gets `box-sizing: border-box`, `max-width: 100%`, and `overflow-wrap: break-word`. This kills the most common PDF bug — text clipped at the right edge because padding pushed it past the container.
5. **Footers are positioned, not flow content.** Use `position: absolute` (not `fixed`) so the footer renders once per page without bleeding. The pattern in `SKILL.md` § "Logo & Backgrounds" already does this.
6. **Test long content.** Generate the PDF with at least one paragraph that exceeds 3 lines and one URL or unbreakable string of 30+ characters. If anything escapes the page or splits weirdly, the CSS is missing a rule from this list.

## Print-safe base CSS

Paste at the top of every WeasyPrint template:

```css
@page {
  size: A4;
  margin: 24mm 18mm 22mm 18mm;
}

/* Apply to every branded block container */
.callout, .kpi-card, .summary-box, .chart-container, .data-table {
  box-sizing: border-box;
  max-width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Headings hold onto the next block */
h1, h2, h3 {
  break-after: avoid;
  page-break-after: avoid;
}

/* Tables that span pages keep their header */
table { width: 100%; border-collapse: collapse; }
thead { display: table-header-group; }   /* repeats on each page */
tfoot { display: table-row-group; }
tr    { break-inside: avoid; page-break-inside: avoid; }

/* Force-break helper for explicit page boundaries */
.page-break { break-before: page; page-break-before: always; }
```

## Why each rule matters

- **`box-sizing: border-box`** — without it, padding adds to the element's width. A `.callout` with `padding: 12px 16px` and 100% width becomes 100% + 32px wide, and WeasyPrint clips the overflow at the page margin. Symptom: text reads "…processing ca" instead of "…processing capacity".
- **`overflow-wrap: break-word` + `hyphens: auto`** — long URLs, hashes, or compound non-English words refuse to break by default. The renderer pushes them past the container instead. These two rules let it break gracefully.
- **`break-inside: avoid`** — Atomic blocks must read as a unit. A callout with the title on page 1 and the body on page 2 is functionally broken. The legacy `page-break-inside: avoid` is needed alongside the modern `break-inside: avoid` because WeasyPrint honors both depending on version.
- **`break-after: avoid` on headings** — Prevents a "stranded heading" — H2 alone at the bottom of a page with its content on the next page.
- **`thead { display: table-header-group; }`** — WeasyPrint repeats the `<thead>` rows on each page the table spans. Without it, page 2 of a long table has no column labels.
- **`position: absolute` on footers** — `position: fixed` causes the footer to render once at the top of the document and bleed across page boundaries in some WeasyPrint versions. `absolute` with `bottom: ...` from `@page`'s margin box renders cleanly per-page.

## Word (.docx) mapping

The python-docx helper in `references/python_docx_helpers.py` mirrors these rules:

- `_set_row_cant_split(row)` adds `<w:cantSplit/>` to a row's properties — equivalent to `break-inside: avoid` on `<tr>`.
- `_set_paragraph_keep_with_next(paragraph)` adds `<w:keepNext/>` and `<w:keepLines/>` — equivalent to `break-after: avoid` plus paragraph-internal anti-splitting.
- `create_brand_table()` already calls `_set_row_cant_split` on every row (header, body, total).
- `add_callout()` already calls both — the row is single-piece, the title sticks to the body.

If you're authoring a docx outside the helper (raw python-docx), call these utilities on every branded block you create.

## PowerPoint (.pptx) mapping

Slides are atomic in PowerPoint — there is no page-split concept. The equivalent rule is "do not let content overflow the slide bounds." `add_kpi_block()` and `add_brand_table()` in `references/python_pptx_helpers.py` auto-size text to fit the available area; if you author shapes manually, set `text_frame.auto_size = MSO_AUTO_SIZE.TEXT_TO_SHAPE_FIT` and verify the slide thumbnail before delivery.

## Smoke test

Before considering any PDF deliverable done, render a test page that contains:

1. A callout whose body is at least 4 lines long
2. A callout placed near a page boundary (force one with `<div class="page-break"></div>` somewhere above)
3. A long URL inside body copy (e.g., `https://example.com/very/long/path/that/cannot/break/normally?param=value`)
4. A table that spans at least two pages
5. A heading positioned 2-3 lines from the bottom of a page

If any of those clip, split, or strand, the CSS is missing a rule from § "Print-safe base CSS".

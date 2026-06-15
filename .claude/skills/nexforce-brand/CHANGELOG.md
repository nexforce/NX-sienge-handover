# Changelog — nexforce-brand

Bump the `version:` field in `SKILL.md` frontmatter on every meaningful change. Use semver-ish: **MAJOR** = breaking change to a public API or palette key; **MINOR** = new section, helper, or rule; **PATCH** = fix or wording.

| Version | Date | Change |
|---|---|---|
| 2.1.0 | 2026-04-27 | New § "Pagination & Layout Safety" in SKILL.md and `references/print-safety.md` covering WeasyPrint break behavior; `add_callout` and `create_brand_table` in `python_docx_helpers.py` now apply `cantSplit` and `keepNext`/`keepLines` automatically; callout HTML/CSS example rewritten with `box-sizing`, `overflow-wrap`, and explicit body color to prevent right-margin clipping observed in production PDFs |
| 2.0.0 | 2026-04-27 | Skill restructured per official progressive-disclosure pattern: SKILL.md cut from 824 to <500 lines; sections 10 (WCAG), 11 (charts), 13 (voice), and 16 (icons) moved to `references/`; § 17 (changelog) extracted to this file; description tightened; assets and helpers verified present on disk |
| 1.2.2 | 2026-04-27 | "Header pattern" e "Footer pattern" consolidados em um único bloco cada (variantes HTML e PDF juntas); frase introdutória redundante do footer removida |
| 1.2.1 | 2026-04-27 | `nexforce_assets()` updated: claude.ai computer-use path (`/mnt/skills/user/…`) added as first candidate; helper restructured to iterate a list instead of nested loops; "How to consume" table collapsed to 2 rows (HTML vs all local outputs); base64 fallback added when no local path resolves |
| 1.2.0 | 2026-04-26 | TL;DR block added at top of skill (7 critical rules with section refs); Section 16 closing snippet and Section 17 changelog restored after a copy-paste truncation in the v1.1.1 manual rollout |
| 1.1.1 | 2026-04-26 | Public mirror URLs added for `icon-black.png` and `icon-white.png` (commit `ea215a89…`); HTML artifact vs WeasyPrint footer patterns split into separate subsections; explicit warning against `/blob/` URLs in the mirror table |
| 1.1.0 | 2026-04-26 | Icon-mark added (`assets/icon-black.png`, `icon-white.png`); footer pattern updated to icon-mark + meta (PPT and HTML/PDF only, not Word); `add_brand_footer()` helper; 75-icon Lucide bundle in `assets/icons/` |
| 1.0.0 | 2026-04-24 | Sections 11–17 added; logo helpers made aspect-aware; WCAG table; chart palette; Lucide icons; language & voice |
| 0.x | — | Initial draft sections 1–10 |

When editing this skill:

1. Make the change
2. Bump `version:` in the frontmatter of `SKILL.md`
3. Add a row to this table — date in ISO, change in one line
4. Run the smoke tests (`nexforce-brand-smoke.docx` and `.pptx`) before sharing the new version

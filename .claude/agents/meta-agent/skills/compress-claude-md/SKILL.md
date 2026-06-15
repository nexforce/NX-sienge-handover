---
name: compress-claude-md
version: 1.1
description: Audits an existing CLAUDE.md for redundancy, contradictions, dead sections, and excessive length. Proposes a consolidated version via diff. Does not execute, only proposes. Use when CLAUDE.md exceeds 400 lines, when sections feel repetitive, or after a long series of feedback-driven edits. Triggers: "compress CLAUDE.md", "comprime o CLAUDE.md", "consolida o CLAUDE.md", "review CLAUDE.md length", "audita o CLAUDE.md", "limpa o CLAUDE.md".
allowed-tools: [Read, AskUserQuestion, Write]
---

<!--
Changelog:
- 1.1 (2026-05-28): Mandatory "Deferred to next run" section in report when proposals exceed cap. Closes gap flagged in V1.6 eval review.
- 1.0: initial.
-->


# compress-claude-md

## What it does

Reads CLAUDE.md, detects redundancy and excess, proposes a consolidated version. Output is a diff and a side-by-side rationale, not an applied edit. The user reviews and approves before any change.

The goal is to keep CLAUDE.md operational. A file that exceeds 500 lines starts to lose effectiveness, the model loads it but stops referencing it precisely.

## When to invoke

- CLAUDE.md > 400 lines
- After 5+ edits in a short window (post-feedback-analyzer run)
- User asks: "compress CLAUDE.md", "consolida CLAUDE.md", "limpa o CLAUDE.md"
- Quality-reviewer flags CLAUDE.md length or redundancy

## When NOT to invoke

- CLAUDE.md < 200 lines (no benefit)
- CLAUDE.md was edited in the last 24h by the user manually (give it time to settle)
- Project is mid-development and CLAUDE.md is intentionally exploratory

---

## Workflow

### Step 1, Inventory the current state

Read CLAUDE.md. Capture:

- Total line count
- Section count and titles
- Bullet/rule count per section
- Detected duplicates (same rule worded differently)
- Detected contradictions (rules that conflict)
- Dead references (file paths or sections that no longer exist)

Output a one-page report:

```
## CLAUDE.md Audit, [project-name]

**Lines:** N
**Sections:** N
**Total rules:** N
**Duplicates detected:** N
**Contradictions detected:** N
**Dead references:** N
**Sections >50 lines:** [list]

**Recommendation:** compress | refactor | leave as is
```

### Step 2, Classify each section

For every section in CLAUDE.md:

| Classification | Action |
|---|---|
| **Core** | Identity, Mission, Session Protocol, Behavior. Always keep, audit for redundancy only. |
| **Operational** | Output rules, Interaction protocol, Tools. Audit for stale references. |
| **Reference** | Lists of models, URLs, tools. Move to references/ if >30 lines. |
| **Historical** | Changelogs, version notes. Move to MEMORY.md. |
| **Dead** | Sections never invoked, outdated decisions. Propose deletion. |

### Step 3, Propose consolidation

For each problem detected, produce a proposal:

```markdown
### Proposal N: <one-line summary>

**Type:** Duplicate | Contradiction | Dead reference | Move-to-references | Move-to-memory | Trim

**Current state:**
```
<paste current text, lines X-Y>
```

**Proposed change:**

```diff
<exact diff>
```

**Rationale:** <1-2 sentences>

**Expected line delta:** -N lines
```

### Step 4, Generate the report

Save to `outputs/YYYY-MM-DD_claude-md-compression/report.md`. Structure:

```markdown
# CLAUDE.md Compression Report, [project-name]
**Date:** YYYY-MM-DD
**Current length:** N lines
**Proposed length after all changes:** N lines (delta -N)

## Summary

<3-5 lines: what kind of reduction, where the savings come from, what stays>

## Audit findings

<section count + duplicates + contradictions + dead refs>

## Proposals

<numbered list, format from Step 3>

## Items NOT proposed for change

<list of sections deliberately left as is, with reason>

## Deferred to next run (if cap exceeded)

<if proposals exceed the cap of 10, list the deferred items with: detected issue, line range, why deferred, expected priority on next run>

---
```

**Cap rule:** if more than 10 issues are detected, report only the top 10 by impact (largest line delta or highest severity). All remaining detected issues MUST appear in the "Deferred to next run" section with full detail. Never silently drop a detected issue.

### Step 5, Present and confirm

Show summary to the user. Use `AskUserQuestion`:

**Q1, How to proceed?**
- Apply all proposals
- Review proposals one by one
- Apply only specific ones (user lists)
- Save report and decide later

### Step 6, Apply if confirmed

Only if the user explicitly approves, apply the edits to CLAUDE.md. After applying:

1. Append a MEMORY.md entry documenting the compression: lines before, lines after, what changed.
2. Bump CLAUDE.md "Version" field if it has one (project-specific convention).
3. Report final line count.

---

## Detection rules

| Pattern | Detection method | Action |
|---|---|---|
| Same rule in 2 sections | Grep for key noun phrases | Merge into one section |
| Contradiction | Cross-reference Always vs Never lists | Flag, do not auto-resolve |
| Dead path | Bash test -e on each path mentioned | Propose deletion or update |
| Section >50 lines with only lists | Line count + structure scan | Move to references/<name>.md |
| Changelog inline | Look for "Version X.Y", date headers | Move to MEMORY.md |

---

## Restrictions

- Never auto-apply. Always show diff and require explicit confirmation.
- Never delete user-defined rules without flagging them.
- Never compress Identity or Mission. Those are core.
- Maximum 10 proposals per run. If more, deliver in two phases.
- No em-dash in the report. Apply the vague-jargon test on every sentence.
- All output in English.

## Output

After execution:

1. Report saved to `outputs/YYYY-MM-DD_claude-md-compression/report.md`
2. If user approved: edited CLAUDE.md + MEMORY.md entry
3. Final summary: "CLAUDE.md compressed from N to M lines, -K rules merged or moved"

## Example

**Input:** CLAUDE.md with 480 lines. Detected: 3 duplicated rules between Behavior and Interaction protocol, 1 dead path reference, 60-line model list inline.

**Report excerpt:**

```
## Proposal 1: Merge "Direct to the point" rule

**Type:** Duplicate

**Current state:**
Behavior > Always > line 145: "Get straight to the point. No preamble."
Interaction protocol > line 220: "Skip preamble. Get straight to the point."

**Proposed change:**

```diff
- Behavior > Always > "Get straight to the point. No preamble."
- Interaction protocol > "Skip preamble. Get straight to the point."
+ Behavior > Always > "Get straight to the point. No preamble. (applies to all interactions, including the protocol phase)"
```

**Rationale:** Same rule, two locations. Consolidate under Behavior, reference from protocol if needed.
**Expected line delta:** -1
```

```
## Proposal 4: Move model list to references/

**Type:** Move-to-references

**Current state:** Lines 280-340, 60-line table of Opus/Sonnet/Haiku pricing and context windows.

**Proposed change:** Cut from CLAUDE.md, create references/models-pricing.md (already exists in meta-agent), replace in CLAUDE.md with: "See references/models-pricing.md for current model details."

**Rationale:** Reference data, changes externally. Belongs in references/, not in the active instruction file.
**Expected line delta:** -58
```

---

## References

- Related skill: `feedback-analyzer` (proposes ADDITIONS to CLAUDE.md; this skill proposes REMOVALS or consolidation)
- Related skill: `optimize-project` (broader audit, calls compress-claude-md as one of its checks)
- Related subagent: `quality-reviewer` (audits CLAUDE.md for hygiene, flags length)

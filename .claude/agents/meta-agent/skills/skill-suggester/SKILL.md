---
name: skill-suggester
version: 1.1
description: Analyzes FEEDBACK.md, MEMORY.md, and the current skill/subagent inventory to propose new skills, new subagents, CLAUDE.md edits, and skills candidates for retirement. Use on demand or via weekly scheduled action. Triggers: "sugere skills", "audita skills", "que skills faltam", "what skills do I need", "suggest skills", "skill audit", "weekly skill review", or auto-triggered by schedule action.
allowed-tools: [Read, Glob, Grep, AskUserQuestion, Write, Agent]
---

<!--
Changelog:
- 1.1 (2026-05-28): Added explicit protection rule for the 4 mandatory skills (never propose for retirement). Closes gap flagged in V1.6 eval review.
- 1.0: initial.
-->


# skill-suggester

## What it does

Reads all signals from a project (FEEDBACK.md, MEMORY.md, existing skills and subagents, recent outputs in outputs/) and proposes a prioritized list of changes:

1. **New skills** to create (recurring task patterns not yet captured)
2. **New subagents** to design (complex reasoning workflows that justify isolation)
3. **CLAUDE.md edits** (rules surfaced by repeated feedback)
4. **Skill retirement candidates** (skills present but with no evidence of use)
5. **Reference docs missing** (knowledge gaps surfaced by MEMORY.md)

Output is a numbered report with concrete next actions. Does not execute, proposes.

## When to invoke

- User requests: "audit skills", "sugere skills", "what skills am I missing", "skill review"
- Weekly via scheduled action `weekly-skill-audit`
- After 10+ entries accumulated in FEEDBACK.md
- After major project milestone (release, quarter close, deliverable shipped)
- Before applying `optimize-project` (skill-suggester runs first as diagnostic)

## When NOT to invoke

- Project has no FEEDBACK.md and no MEMORY.md (no signal to analyze)
- Project is younger than 2 weeks (not enough data)
- User already has a clear request for a specific skill (just use `create-skill`)

## Prerequisites

- Project path resolved
- FEEDBACK.md exists (or MEMORY.md has 3+ entries)
- Read access to `skills/`, `subagents/`, `outputs/`, `references/`

---

## Workflow

### Step 1, Inventory current state

Read all of the following (do not fail if some are absent):

```
[PROJECT]/CLAUDE.md
[PROJECT]/MEMORY.md
[PROJECT]/FEEDBACK.md
[PROJECT]/skills/*/SKILL.md          (all skills, frontmatter + first 30 lines)
[PROJECT]/subagents/*.md             (all subagents, frontmatter + first 30 lines)
[PROJECT]/references/*.md            (filenames only)
[PROJECT]/outputs/                   (folder names only, last 30 days)
```

Build a current-state snapshot:

| Asset | Count | Items |
|---|---|---|
| Skills | N | [list] |
| Subagents | N | [list] |
| MEMORY entries | N (last 90 days) | dates |
| FEEDBACK entries | N (last 90 days) | dates |
| Output folders | N (last 30 days) | topics |

### Step 2, Pattern detection

Scan FEEDBACK.md and MEMORY.md for recurring patterns. Use Grep aggressively. Detect:

**2.1 Recurring corrections (FEEDBACK.md):**

Group entries by type (Correction, Preference, Rule, Vocabulary, Process). For each group:
- Count occurrences in the last 30 days
- Identify entries with similar trigger context
- A rule that appears 2+ times is a candidate for promotion to CLAUDE.md

**2.2 Recurring task types (MEMORY.md + outputs/):**

For each entry in MEMORY.md and each folder in outputs/, classify the task type:
- Drafting (email, post, proposal)
- Analysis (research, comparison, deep-dive)
- Decision (architecture, model choice, vendor)
- Operational (data pull, report, digest)
- Other

A task type that appears 3+ times without a dedicated skill is a candidate for a new skill.

**2.3 Unused skills:**

For each skill in skills/, search MEMORY.md and FEEDBACK.md for evidence of invocation. A skill with zero mentions in 60+ days and no scheduled action attached is a retirement candidate.

**2.4 Knowledge gaps (MEMORY.md):**

Scan "Open" or "Next" or "Blockers" lines in MEMORY.md for repeated mentions of the same domain or tool. If a domain comes up 3+ times in "Open" or "Blockers" without a corresponding reference doc, propose a new reference.

### Step 3, Optional research enrichment

If the user wants depth, launch a `docs-researcher` subagent for each pattern category to enrich the proposal. Use this only when:
- The user explicitly asks for "deep audit"
- A pattern is novel (no prior reference for how others solve it)
- A skill recommendation involves a new domain not yet in references/

Otherwise, stay on the local signal. Faster, cheaper, often enough.

### Step 4, Generate the proposal

Fixed format:

```markdown
# Skill Suggester Report, [project-name]
**Date:** YYYY-MM-DD
**Window analyzed:** last N days
**Signals:** N FEEDBACK entries, N MEMORY entries, N skills, N subagents

---

## 1. Proposed new skills

### 1.1 `<skill-name>` (Priority: P0 | P1 | P2)
**Pattern detected:** <which entries surfaced this, with dates>
**Frequency:** <N occurrences in last X days>
**Why it fits:** <1-2 sentences>
**Proposed triggers:** <3-5 trigger phrases>
**Expected output:** <what it produces>

### 1.2 ...

## 2. Proposed new subagents

### 2.1 `<subagent-name>` (Priority: P0 | P1 | P2)
**Pattern detected:** <evidence>
**Why a subagent and not a skill:** <reasoning, isolation of context, complex chain, domain depth>
**Model recommendation:** Opus | Sonnet | Haiku, with 1-line justification
**Expected invocations:** <typical examples>

## 3. CLAUDE.md edits proposed

### 3.1 Rule: <one-line rule>
**Source:** FEEDBACK.md entries on <dates>
**Recurrence:** N times in <window>
**Proposed section in CLAUDE.md:** Behavior | Interaction protocol | Output rules
**Exact wording proposed:** <ready-to-paste>

### 3.2 ...

## 4. Skills proposed for retirement

### 4.1 `<skill-name>`
**Reason:** No invocation detected in last N days. No scheduled action attached.
**Recommendation:** Archive to skills/_archive/ or delete. Move SKILL.md to references/ if knowledge is still useful.

## 5. Reference docs missing

### 5.1 `<reference-topic>.md`
**Evidence:** MEMORY.md mentions <topic> N times under Open/Blockers without resolution
**Proposed content:** <outline>

## 6. Summary and ranked next actions

| Action | Priority | Effort | Impact |
|---|---|---|---|
| Create skill X | P0 | 2h | High |
| Add CLAUDE.md rule Y | P0 | 10min | High |
| Retire skill Z | P2 | 5min | Low |
| ... | | | |

**Recommended sequence:** 1, 2, 3 (P0 first), then 4, 5 (P1 next session).

---
```

### Step 5, Present and confirm

Show the report to the user via the chat. Use `AskUserQuestion`:

**Q1, Which actions to execute?**
- Execute all P0 now
- Execute selected items only
- Schedule for later (save report to outputs/)
- Cancel

If "selected", ask for the list. If "all P0", invoke `create-skill`, `create-subagent`, or `Edit` on CLAUDE.md for each item.

### Step 6, Save the report

Always save the report to:

```
[PROJECT]/outputs/YYYY-MM-DD_skill-suggester-report/report.md
```

This builds a history of suggestions over time. Future skill-suggester runs can compare against past reports to detect items that were proposed but never acted on.

---

## Detection rules and thresholds

| Pattern | Threshold | Action |
|---|---|---|
| FEEDBACK entry repeated | 2+ similar | Propose CLAUDE.md edit |
| Task type without skill | 3+ in outputs/ | Propose new skill |
| Skill with zero invocations | 60+ days | Propose retirement |
| Domain in Open/Blockers | 3+ in MEMORY.md | Propose new reference doc |
| Complex reasoning chain | 2+ multi-step decisions on same topic | Propose subagent |

These are defaults. Adjust if the user provides domain-specific criteria.

---

## Output

After execution:

1. Report saved to `outputs/YYYY-MM-DD_skill-suggester-report/report.md`
2. Markdown report rendered in chat
3. If user confirmed any P0 actions, those are executed in sequence
4. Updated MEMORY.md entry summarizing the run

## Restrictions

- Never auto-execute proposals without user confirmation
- Never delete skills directly. Move to `skills/_archive/` if user confirms retirement, following the protocol in `references/skill-archive-protocol.md` (write ARCHIVED.md with metadata, update CLAUDE.md, log to MEMORY.md)
- **Never propose the 4 mandatory skills (token-budget, compress-session, capture-feedback, skill-suggester) for retirement, regardless of invocation count.** They are pre-installed by project-setup and required by every V1.4+ project. Even if MEMORY.md and FEEDBACK.md show no explicit invocation in 60+ days, exclude them from retirement candidates.
- Never edit CLAUDE.md silently. Always show the diff
- Do not propose more than 3 new skills in a single run. Quality over quantity.
- If FEEDBACK.md has fewer than 3 entries, return a "low signal" report and recommend waiting

## Examples

### Example 1, recurring vocabulary correction

**Detected pattern:** 3 entries in FEEDBACK.md over 2 weeks: user banned "alavancar", "robusto", "navegar".

**Report excerpt:**

```
## 3. CLAUDE.md edits proposed

### 3.1 Rule: Banned vocabulary expansion
**Source:** FEEDBACK.md 2026-05-12, 2026-05-18, 2026-05-26
**Recurrence:** 3 times in 14 days
**Proposed section:** Behavior > Never
**Exact wording proposed:**
"Never use 'alavancar', 'robusto', 'navegar' (as metaphor). Substitute by concrete verbs."
```

### Example 2, missing skill detected

**Detected pattern:** outputs/ has 4 folders in 30 days named `*-prospecting-email-*`. No `draft-prospecting-email` skill exists.

**Report excerpt:**

```
## 1. Proposed new skills

### 1.1 `draft-prospecting-email` (Priority: P0)
**Pattern detected:** 4 prospecting email drafts in outputs/ on 2026-05-08, 2026-05-15, 2026-05-22, 2026-05-26
**Frequency:** ~1 per week
**Why it fits:** Recurring task, same structure each time (hook, value, CTA). Skill would lock in the proven structure and cut drafting time.
**Proposed triggers:** "draft prospecting email", "outreach to X", "email para ISV"
**Expected output:** 80-120 word email with personalized hook, value statement, single CTA
```

### Example 3, retirement candidate

**Detected pattern:** Skill `qualify-isv-fit` created 2026-04-10, never invoked in 50 days.

**Report excerpt:**

```
## 4. Skills proposed for retirement

### 4.1 `qualify-isv-fit`
**Reason:** Created 2026-04-10, zero invocations detected in MEMORY.md or FEEDBACK.md in 50 days. No scheduled action attached.
**Recommendation:** Move to skills/_archive/qualify-isv-fit/ to preserve the SKILL.md while removing it from the active skill set. If still needed in 60+ more days, delete.
```

---

## References

- Related skill: `capture-feedback` (feeds FEEDBACK.md, the primary input)
- Related skill: `compress-session` (writes MEMORY.md, the secondary input)
- Related skill: `optimize-project` (broader audit, calls skill-suggester as part of the flow)
- Related subagent: `feedback-analyzer` (deeper analysis of feedback patterns, used for Step 3 enrichment)
- Related skill: `create-skill`, `create-subagent` (executes the proposals)

# Eval, Self-Improvement Loop Skills

**Version:** 1.0
**Date:** 2026-05-28
**Scope:** validates that the 4 skills/subagents of the self-improvement loop behave as specified.

## Components under test

1. `skills/capture-feedback/SKILL.md`
2. `skills/skill-suggester/SKILL.md`
3. `skills/compress-claude-md/SKILL.md`
4. `subagents/feedback-analyzer.md`

---

## Test set 1, capture-feedback

### Test 1.1, Vocabulary correction (Correction type)

**Input:**
- Session context: agent just wrote "Vamos alavancar a expansão"
- User: "Nunca use 'alavancar', está no meu banido."

**Expected behavior:**
- Detect trigger ("nunca use")
- Glob for FEEDBACK.md, create if missing
- Generate entry with Type=Vocabulary, Scope=Global (proposed)
- Show entry to user, ask confirmation
- Append to FEEDBACK.md after confirmation

**Pass criteria:**
- FEEDBACK.md exists after run
- Entry contains all required fields (Type, Scope, Trigger context, What the agent did, Correction, How to apply, Promotion candidate)
- Entry placed at top (most recent first)
- No em-dash in the entry
- Type correctly identified as Vocabulary

**Fail modes to watch:**
- Wrong type (e.g., classified as Process instead of Vocabulary)
- Missing one of the required fields
- Writes to FEEDBACK.md without confirming
- Captures a one-off factual correction (Test 1.4)

### Test 1.2, Process preference (Process type)

**Input:**
- Session context: agent just ran mkdir before confirming path
- User: "Sempre confirma o path antes de criar arquivo."

**Expected behavior:**
- Type=Process, Scope=Project (default unless user signals Global)
- Trigger context references mkdir-before-confirmation
- How-to-apply specifies confirmation step

**Pass criteria:**
- Type correctly classified as Process
- Entry actionable: a future agent reading only this entry can apply the rule

### Test 1.3, Recurring pattern detection (promotion trigger)

**Setup:** FEEDBACK.md already has 1 entry banning "alavancar" from 5 days ago.

**Input:**
- New session, agent uses "alavancar" again
- User: "Já te falei, nunca use 'alavancar'."

**Expected behavior:**
- Capture new entry
- Detect this is the 2nd occurrence (cluster of 2+)
- Propose promotion to CLAUDE.md via AskUserQuestion

**Pass criteria:**
- Promotion proposal surfaced to user
- Proposal includes which CLAUDE.md section (Behavior > Never)
- Proposal includes ready-to-paste wording

### Test 1.4, One-off correction (do NOT capture)

**Input:**
- Session context: agent wrote "27 de maio"
- User: "A data é 28, não 27."

**Expected behavior:**
- Acknowledge correction in chat
- Do NOT invoke capture-feedback
- Do NOT write to FEEDBACK.md

**Pass criteria:**
- FEEDBACK.md unchanged
- Output to user shows the correction applied

**Why this matters:** factual one-off corrections without behavioral implication should not pollute FEEDBACK.md.

---

## Test set 2, skill-suggester

### Test 2.1, Empty signal (no FEEDBACK or MEMORY)

**Input:**
- Project with empty FEEDBACK.md (header only)
- MEMORY.md with 1 entry (project creation)
- 4 mandatory skills present
- 0 days of usage

**Expected output:**
- Report saved to outputs/skill-audits/YYYY-MM-DD/report.md
- All counts at 0
- Summary line: "INSUFFICIENT SIGNAL, run again after 2+ weeks of usage"

**Pass criteria:**
- No false positives (no proposals)
- Report file created at the canonical path

### Test 2.2, Recurring vocabulary pattern

**Input:**
- FEEDBACK.md with 3 entries over 14 days, all Type=Vocabulary, banning "alavancar", "robusto", "navegar"
- All entries non-PROMOTED

**Expected output:**
- Report contains section "3. CLAUDE.md edits proposed"
- 1 proposal grouping the 3 banned terms
- Target section: Behavior > Never
- Recurrence: 3 times in 14 days

**Pass criteria:**
- Cluster correctly groups 3 vocabulary entries
- Proposal has ready-to-paste wording

### Test 2.3, Recurring task type without skill

**Input:**
- outputs/ contains 4 folders matching `*-prospecting-email-*` in last 30 days
- No skill named `draft-prospecting-email` exists

**Expected output:**
- Report contains section "1. Proposed new skills"
- 1 proposal: `draft-prospecting-email` with P0 priority
- Frequency: ~1/week
- Triggers: 3 trigger phrases proposed

**Pass criteria:**
- Skill name in kebab-case
- Triggers specific enough to disambiguate from generic email skills
- Pattern evidence cites the 4 folder dates

### Test 2.4, Retirement candidate

**Input:**
- Skill `qualify-isv-fit` exists, created 60+ days ago
- Zero invocations detected in MEMORY.md
- Zero invocations detected in FEEDBACK.md
- No scheduled action references it

**Expected output:**
- Report contains section "4. Skills proposed for retirement"
- `qualify-isv-fit` listed
- Reason cites days inactive + zero invocations + no scheduled action
- Recommendation: move to `skills/_archive/qualify-isv-fit/` per skill-archive-protocol.md

**Pass criteria:**
- Recommendation references the archive protocol (not generic delete)
- Reactivation criteria proposed

### Test 2.5, Mandatory skill protection

**Input:**
- Skill `compress-session` exists, but MEMORY.md is empty (might falsely look unused)

**Expected output:**
- `compress-session` is NOT proposed for retirement
- The 4 mandatory skills (token-budget, compress-session, capture-feedback, skill-suggester) are always excluded from retirement proposals

**Pass criteria:**
- Mandatory skills protected even with apparent inactivity

---

## Test set 3, compress-claude-md

### Test 3.1, Detection of duplicate rule

**Input:**
- CLAUDE.md with 450 lines
- "Get straight to the point. No preamble." appears in 2 sections: Behavior and Interaction protocol

**Expected output:**
- Report contains Proposal of type Duplicate
- Cites both line numbers
- Proposes consolidation under Behavior

**Pass criteria:**
- Both locations identified
- Diff is exact and applicable
- Expected line delta computed (-1 or similar)

### Test 3.2, Dead reference detection

**Input:**
- CLAUDE.md references `references/old-doc.md` which no longer exists

**Expected output:**
- Proposal of type Dead reference
- Suggests removal or update

**Pass criteria:**
- Bash test -e correctly identified missing file
- No false positive on existing files

### Test 3.3, Move-to-references

**Input:**
- CLAUDE.md has 60-line inline table of model pricing
- `references/models-pricing.md` exists

**Expected output:**
- Proposal of type Move-to-references
- Suggests replacing inline table with reference link
- Expected line delta: -58 (or close)

**Pass criteria:**
- Recognizes existing reference doc
- Does not duplicate content

### Test 3.4, Core sections protected

**Input:**
- CLAUDE.md with redundant Identity statements

**Expected behavior:**
- Identity section NOT proposed for compression
- Mission section NOT proposed for compression

**Pass criteria:**
- Core sections (Identity, Mission, Session Protocol, Behavior > top rules) are protected per the skill rules

### Test 3.5, Cap at 10 proposals

**Input:**
- CLAUDE.md with 20+ detectable issues

**Expected output:**
- Report has at most 10 proposals
- Remaining issues mentioned in "Items NOT proposed for change" or "Deferred to next run"

**Pass criteria:**
- Cap enforced
- Deferred items listed

---

## Test set 4, feedback-analyzer

### Test 4.1, Insufficient signal exit

**Input:**
- FEEDBACK.md with 2 entries

**Expected behavior:**
- Return: "INSUFFICIENT SIGNAL. Need 3+ FEEDBACK.md entries to detect patterns. Exiting without proposals."
- No report file written

**Pass criteria:**
- Clean exit, no false proposals

### Test 4.2, Cluster detection

**Input:**
- FEEDBACK.md with 5 entries: 3 Vocabulary, 1 Process, 1 Correction
- All non-PROMOTED

**Expected output:**
- Cluster count: 3 (one per type that has 2+, but here only Vocabulary has 2+)
- Wait, only Vocabulary has 3, others have 1 each
- Therefore: 1 cluster (Vocabulary), 2 single-entry items held

**Pass criteria:**
- Single-entry items listed under "Single-entry items held for next run"
- Vocabulary cluster has 1 proposal

### Test 4.3, Conflict detection

**Input:**
- FEEDBACK.md has entry: "Always use tables for comparison"
- CLAUDE.md already has rule: "Use bullet lists for comparison"

**Expected output:**
- Conflict flagged at top of report
- Both rules shown
- No silent override

**Pass criteria:**
- Conflict section populated
- Proposal not auto-applied

### Test 4.4, Max 7 proposals cap

**Input:**
- FEEDBACK.md with 15 active entries forming 10 clusters

**Expected output:**
- Maximum 7 proposals in the report
- Remaining 3 listed as deferred

**Pass criteria:**
- Cap respected
- Deferred items have explicit reason ("max 7 per report")

### Test 4.5, No auto-apply

**Input:**
- User runs feedback-analyzer
- 5 valid proposals produced

**Expected behavior:**
- Report saved to outputs/claude-md-reviews/YYYY-MM-DD/report.md
- CLAUDE.md NOT modified
- Subagent returns to main agent: report path + executive summary

**Pass criteria:**
- CLAUDE.md unchanged after run
- Main agent receives summary and can present to user for approval

---

## Scoring protocol

Run each test scenario in a fresh session. Score 1 (pass) or 0 (fail) per pass criterion.

| Test set | Total criteria | Minimum to pass |
|---|---|---|
| 1. capture-feedback | 12 | 10 (83%) |
| 2. skill-suggester | 12 | 10 (83%) |
| 3. compress-claude-md | 11 | 9 (82%) |
| 4. feedback-analyzer | 11 | 9 (82%) |

Overall: 46 criteria. Loop is production-ready at 38+ (83%).

Below 70%: skill needs rework before relying on the loop.

---

## How to run

1. Create a sandbox project at `/Users/vitti/Documents/Claude/Projects/AI/eval-sandbox/` via `project-setup` (this gives a clean V1.4 baseline).
2. Seed inputs per test case (e.g., for Test 2.2, manually write 3 entries into FEEDBACK.md).
3. Invoke the skill or subagent under test using the trigger phrase.
4. Inspect outputs against pass criteria.
5. Record results in `outputs/evals/self-improvement-loop/results-YYYY-MM-DD.md`.

Re-run after every version bump on any of the 4 components.

---

## References

- `skills/build-eval/SKILL.md` (eval design methodology)
- `references/self-improvement-loop.md` (system being tested)
- `references/skill-archive-protocol.md` (referenced by test 2.4)

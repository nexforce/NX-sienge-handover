# Drift Report, About Me/ vs meta-agent V1.4

**Date:** 2026-05-28
**Scope:** identify rules established in meta-agent V1.4 that apply across all Nexforce projects and could be promoted to About Me/ for global enforcement.
**Action:** PROPOSALS ONLY. No edits applied. User decides what to promote.

---

## Methodology

Read all 3 files in About Me/ (about-me.md, anti-ai-writing-style.md, my-company.md). Cross-reference with meta-agent V1.4 artifacts (CLAUDE.md, FEEDBACK.md, the 4 mandatory skills, references/, templates/). Flag rules that:

1. Are operationally enforced in meta-agent
2. Apply to every Nexforce project (Cowork and Claude Code), not just meta-agent
3. Are absent or weakly stated in About Me/

---

## Current state, About Me/

| File | Lines | Coverage |
|---|---|---|
| `about-me.md` | 100 | Persona, voice, format-by-channel, 15 Claude instructions, voice examples, output QA |
| `anti-ai-writing-style.md` | ~150 | Em-dash ban, banned vocabulary EN+PT, filler phrases, sentence structures |
| `my-company.md` | 47 | Nexforce goals, focus, active programs, saying no, contrarian bets |

**Strengths:**
- Voice and style well defined (about-me.md is operational)
- Writing rules enforceable (anti-ai-writing-style.md is the canonical ban list)
- Company context grounded (my-company.md provides strategy frame)

**Gaps identified for V1.4 alignment:** 6 items below.

---

## Drift items

### Drift 1, Session Protocol not documented globally

**Where in meta-agent:** `CLAUDE.md ## Session Protocol`, applied to every new project via `project-setup` Step 5.5.

**The rule:**
- Start: read last 3-5 entries of MEMORY.md + last 5-10 of FEEDBACK.md
- During: invoke capture-feedback when corrected, token-budget when context heavy
- End: invoke compress-session
- Periodic: invoke skill-suggester weekly

**Why this is global:** every project the user works on benefits from this protocol. Without it, agents re-learn the same context each session, relapse on the same corrections.

**Status in About Me/:** absent. about-me.md mentions Claude Code + Cowork but does not mention MEMORY.md, FEEDBACK.md, or the session protocol.

**Proposed addition (about-me.md new section):**

```markdown
## Session Protocol (global)

Every Claude project (Cowork or Claude Code) follows this protocol:

1. Read MEMORY.md (last 3-5 entries) and FEEDBACK.md (last 5-10 entries) at session start.
2. During session: invoke capture-feedback when corrected, invoke token-budget on long sessions.
3. End: invoke compress-session to write to MEMORY.md.
4. Weekly: invoke skill-suggester to audit feedback patterns.

See `meta-agent/references/self-improvement-loop.md` for the full cycle.
```

**Effort to apply:** 5 lines added to about-me.md.

---

### Drift 2, FEEDBACK.md as cross-project standard

**Where in meta-agent:** mandatory file in every project via `project-setup` V1.1.

**The rule:** every project has FEEDBACK.md (append-only log of corrections/preferences). capture-feedback skill appends entries. Read at session start.

**Why this is global:** the cardinal pain that V1.4 solves (relapsing on the same correction) exists in every project. FEEDBACK.md is the universal solution.

**Status in About Me/:** absent.

**Proposed addition:**

```markdown
## File contract for every project

Every Nexforce project must contain:

- CLAUDE.md (agent identity)
- MEMORY.md (append-only session log, decisions and context)
- FEEDBACK.md (append-only user corrections, preferences, behavioral rules)
- README.md (navigation)

Plus 4 mandatory pre-installed skills:

- skills/token-budget/SKILL.md
- skills/compress-session/SKILL.md
- skills/capture-feedback/SKILL.md
- skills/skill-suggester/SKILL.md

These are created automatically by the `project-setup` skill in meta-agent.
```

**Effort:** 15 lines added to about-me.md.

---

### Drift 3, Lowercase canonical folder names

**Where in meta-agent:** HARD CONSTRAINT in `project-setup` SKILL.md.

**The rule:** all canonical folders are lowercase: `outputs/`, `inputs/`, `references/`, `templates/`, `skills/`, `subagents/`. Never capitalized.

**Why this is global:** the user (and his organizational instructions) currently use "Outputs/" capitalized. This created the conflict resolved in V1.4 session. Without explicit global rule, the conflict will recur.

**Status in About Me/:** the organization-level CLAUDE.md (instructions in user_preferences) says "Save all outputs inside the current project's `Outputs/` folder" capitalized. Direct conflict with meta-agent canonical.

**Proposed action:**

Choose one resolution and document explicitly:

**Option A (recommended):** lowercase canonical in all artifacts. Update organization-level CLAUDE.md to use lowercase.

**Option B:** capitalized in About Me/ artifacts, lowercase in meta-agent artifacts. Tolerate divergence.

**Recommendation:** Option A. Lowercase aligns with Unix convention, is what meta-agent enforces, and is what all 16 skills already use. Update the organizational instruction line to: "Save all outputs inside the current project's `outputs/` folder."

**Effort:** 1 line edit in About Me/ (location TBD) or in organization-level admin settings.

---

### Drift 4, Versionamento de SKILL.md e subagents

**Where in meta-agent:** mandatory `version:` field in frontmatter of every SKILL.md and subagents/*.md (V1.4 rule).

**The rule:** every skill and subagent declares `version: 1.0` minimum. Bump on behavior change. Log in MEMORY.md.

**Why this is global:** without versioning, behavior drift is invisible. Any project using skills inherits this gap if About Me/ does not enforce.

**Status in About Me/:** absent. about-me.md does not mention skill versioning.

**Proposed addition:**

```markdown
## Skill and subagent versioning

Every SKILL.md and subagents/*.md must declare a `version:` field in the frontmatter, starting at 1.0. Bump on any behavior change:

- 1.x: backward-compatible improvements
- 2.0: breaking change

Log every bump in the project's MEMORY.md with date and rationale. quality-reviewer flags missing version field as Important.
```

**Effort:** 8 lines added to about-me.md.

---

### Drift 5, meta-agent as the canonical meta-agent

**Where in meta-agent:** `CLAUDE.md ## Identity` describes itself as "the specialist agent for building and operating Claude agents at Nexforce".

**The rule:** meta-agent is THE meta-agent. Every other project is built using its skills (project-setup, create-claude-md, etc.). It is not just another project, it is the source.

**Why this is global:** the user (and any teammate using these projects) must know this. Otherwise people may build agents from scratch and bypass the canonical patterns, accumulating drift.

**Status in About Me/:** mentioned obliquely in about-me.md ("AI stack: Claude") and my-company.md ("AI operations: deploying Claude") but never named as the meta-agent.

**Proposed addition to about-me.md:**

```markdown
## Claude meta-agent

`meta-agent` (under `/Users/vitti/Documents/Claude/Projects/AI/meta-agent/`) is the source of truth for all Claude agents at Nexforce. New projects are created via the `project-setup` skill. New skills, subagents, CLAUDE.md files, and evals are built using its skill library. Do not build agents from scratch without checking meta-agent first.
```

**Effort:** 4 lines added to about-me.md.

---

### Drift 6, Default scheduled actions per project

**Where in meta-agent:** Step 5.5 of `project-setup` proposes 2 default scheduled actions: weekly-skill-audit (Mon 9am), monthly-claude-md-review (1st day 10am).

**The rule:** every Nexforce project benefits from these 2 audits running automatically. Without them, the self-improvement loop is manual-only.

**Why this is global:** an automated loop is much more reliable than a manual one. If the user has to remember to run skill-suggester every week, it will not happen.

**Status in About Me/:** absent.

**Proposed addition:**

```markdown
## Scheduled actions per project (recommended)

Every Nexforce project should have 2 default scheduled actions:

1. `<project>-weekly-skill-audit`: every Monday 9am. Runs skill-suggester on the project.
2. `<project>-monthly-claude-md-review`: 1st of each month, 10am. Runs feedback-analyzer subagent.

Created automatically by project-setup Step 5.5. Already active on `meta-agent` itself as dogfooding.
```

**Effort:** 7 lines added to about-me.md.

---

## Summary

| # | Drift | Recommendation | Effort |
|---|---|---|---|
| 1 | Session Protocol absent | Add 5-line section to about-me.md | Low |
| 2 | FEEDBACK.md not in file contract | Add 15-line section listing mandatory files + 4 skills | Low |
| 3 | Outputs/ vs outputs/ conflict | Resolve in favor of lowercase, update org instruction | Low |
| 4 | Skill versioning absent | Add 8-line section about-me.md | Low |
| 5 | meta-agent as meta-agent not stated | Add 4-line pointer in about-me.md | Low |
| 6 | Default scheduled actions absent | Add 7-line recommendation in about-me.md | Low |

**Total proposed addition to about-me.md:** ~40 lines (~40% growth from current 100 lines).
**Total edits to anti-ai-writing-style.md:** 0 (no drift, it is canonical for writing rules).
**Total edits to my-company.md:** 0 (no drift, it is strategic context).
**Total edits to organization-level CLAUDE.md:** 1 line (Outputs/ → outputs/).

---

## Recommendation

**Promote items 1, 2, 4, 5, 6 to about-me.md.** They are operationally enforced in meta-agent, cross-project applicable, and currently absent in About Me/. Together they add ~40 lines but lock in the V1.4 protocol globally.

**Defer item 3 (Outputs/ vs outputs/) to a separate decision.** It is a small line edit but affects org-level instructions that the user controls separately from About Me/.

**Do not touch anti-ai-writing-style.md or my-company.md.** No drift detected.

---

## How to apply

If the user approves promotion, the recommended sequence is:

1. Open `/Users/vitti/Documents/Claude/About Me/about-me.md`.
2. Insert 5 new sections after `## How I work` and before `## Quality standard`:
   - Session Protocol (global)
   - File contract for every project
   - Claude meta-agent
   - Skill and subagent versioning
   - Scheduled actions per project (recommended)
3. Save.
4. Open organization-level CLAUDE.md, update "Outputs/" to "outputs/" (item 3).
5. Append entry to `meta-agent/MEMORY.md` documenting the global promotion.
6. Mark items 1-6 as [PROMOTED] in meta-agent's FEEDBACK.md (entry 2026-05-28 already documents the V1.4 rollout).

No edits applied by this report. Awaiting approval.

# Self-Improvement Loop, meta-agent V2.3

## Scope

Documents the integrated cycle that makes every Nexforce project a self-improving agent. The loop combines persistent memory, captured feedback, real-time auto-correction, periodic audits, and consolidation into CLAUDE.md.

Read this when:
- You need to understand how memory, feedback, auto-correction, and skill suggestions connect
- You are debugging why a rule is being relapsed across sessions
- You are designing a new skill that interacts with FEEDBACK.md or MEMORY.md
- You are explaining the V2.3 loop to a teammate

For the real-time enforcement layer (auto-correct) in detail, see also `references/self-correction-protocol.md`.

---

## The 5 components

```
                  +---------------------+
                  |   USER INTERACTION  |
                  |   (every session)   |
                  +----------+----------+
                             |
                ----------------------------
                |                          |
                v                          v
        Substantive decisions      User corrections,
        and context produced       preferences, rules
                |                          |
                v                          v
        ---------------          ----------------
        |compress-    |          |capture-      |
        |session      |          |feedback      |
        |(end of      |          |(during       |
        | session)    |          | session)     |
        ---------------          ----------------
                |                          |
                v                          v
        +---------------+          +---------------+
        |  MEMORY.md    |          |  FEEDBACK.md  |
        |  append-only  |          |  append-only  |
        +---------------+          +---------------+
                |                          |
                |   read at session start  |
                |   (last 3-5 + last 5-10) |
                |                          |
                +-------------+------------+
                              |
                              | weekly
                              v
                  +-----------------------+
                  |   skill-suggester     |
                  |   (proposes new       |
                  |   skills, subagents,  |
                  |   CLAUDE.md edits,    |
                  |   retirements)        |
                  +-----------+-----------+
                              |
                              | monthly
                              v
                  +-----------------------+
                  |   feedback-analyzer   |
                  |   (proposes exact     |
                  |   CLAUDE.md edits     |
                  |   from FEEDBACK       |
                  |   patterns)           |
                  +-----------+-----------+
                              |
                              v
                  +-----------------------+
                  |   compress-claude-md  |
                  |   (consolidates       |
                  |   CLAUDE.md after     |
                  |   edits accumulate)   |
                  +-----------------------+
```

---

## What each component does

### MEMORY.md

**Type:** Persistent log file (append-only, most recent on top).
**Captures:** decisions made, context discovered, blockers resolved, next steps.
**Written by:** `compress-session` skill at the end of substantive sessions.
**Read by:** the agent at the start of every substantive session (last 3-5 entries).
**Lifecycle:** entries never deleted. When file exceeds 30 entries, oldest entries archive to `memory-archive/YYYY.md` (manual or via policy).

### FEEDBACK.md

**Type:** Persistent log file (append-only, most recent on top).
**Captures:** user corrections, preferences, behavioral rules, vocabulary bans.
**Written by:** `capture-feedback` skill whenever the user corrects output or states a preference.
**Read by:** the agent at the start of every substantive session (last 5-10 entries) AND by `skill-suggester` weekly AND by `feedback-analyzer` monthly.
**Lifecycle:** entries marked [PROMOTED] when their rule is consolidated into CLAUDE.md. Never deleted.

### capture-feedback (skill)

**Trigger:** user correction during the session.
**Output:** structured entry appended to FEEDBACK.md with type, scope, rule, and how-to-apply.
**Frequency:** as needed, multiple times per session if the user corrects multiple things.
**Chain:** automatically invokes `auto-correct` retroactive mode after appending.

### auto-correct (skill, V2.3+)

**Trigger:** session start (pattern-detection mode), before substantial deliverable (pre-output mode), after capture-feedback (retroactive mode).
**Reads:** FEEDBACK.md (all active non-PROMOTED entries) + the draft being delivered + outputs already produced in this session (retroactive).
**Output:** real-time enforcement of FEEDBACK rules. Auto-fixes em-dash and Critical violations. Asks user on Important ambiguous cases. Logs every fix.
**Closes the gap:** between FEEDBACK capture (real-time) and CLAUDE.md consolidation (monthly). Rules enforced from the moment they reach 2 FEEDBACK occurrences.

### skill-suggester (skill)

**Trigger:** weekly via scheduled action OR on demand ("audit skills").
**Reads:** FEEDBACK.md + MEMORY.md + skills/*/SKILL.md + subagents/*.md + outputs/.
**Output:** report saved to `outputs/skill-audits/YYYY-MM-DD/report.md` proposing new skills, new subagents, CLAUDE.md edits, retirements, missing references.
**Decision rule:** detects patterns at 2+ (corrections), 3+ (task types), 0 invocations in 60+ days (retirement).

### feedback-analyzer (subagent)

**Trigger:** monthly via scheduled action OR after skill-suggester flags recurring patterns.
**Reads:** FEEDBACK.md + CLAUDE.md (most recent skill-audit report optional).
**Output:** report saved to `outputs/claude-md-reviews/YYYY-MM-DD/report.md` with exact CLAUDE.md diffs ready for review.
**Model:** Sonnet, read-only.
**Difference from skill-suggester:** suggester proposes new artifacts. analyzer proposes edits to existing CLAUDE.md.

### compress-claude-md (skill)

**Trigger:** CLAUDE.md exceeds 400 lines OR after 5+ feedback-driven edits OR on demand.
**Reads:** CLAUDE.md.
**Output:** report saved to `outputs/YYYY-MM-DD_claude-md-compression/report.md` proposing duplicates merge, dead reference removal, move-to-references for long lists, move-to-MEMORY for historical content.
**Decision:** does not apply edits. User reviews and approves.

---

## The cycle in time

| Cadence | Event | Component |
|---|---|---|
| **Real-time** | User corrects something | capture-feedback fires |
| **Session start** | Agent reads context | MEMORY.md + FEEDBACK.md last entries |
| **Session end** | Substantive work captured | compress-session writes MEMORY.md |
| **Weekly (Monday 9am)** | Audit skills and patterns | skill-suggester writes report |
| **Monthly (1st day 10am)** | Consolidate FEEDBACK into CLAUDE.md | feedback-analyzer writes report |
| **On demand (CLAUDE.md > 400 lines)** | Compact CLAUDE.md | compress-claude-md writes report |

The 2 scheduled actions run automatically. The user reviews reports and approves changes.

---

## Why this design

**MEMORY.md vs FEEDBACK.md:** separation of concerns. MEMORY captures what happened (history). FEEDBACK captures what should change (rules). Mixing them dilutes both.

**skill-suggester vs feedback-analyzer:** different scope. skill-suggester proposes ADDITIONS (new skills, subagents, references). feedback-analyzer proposes CONSOLIDATIONS (edits to existing CLAUDE.md). One creates artifacts, the other tightens behavior.

**Automated reports, manual approval:** scheduled actions surface patterns without making decisions. User stays in control of every behavior change. Avoids silent drift.

**Append-only logs:** prevents loss of context. Even rules that were superseded can be traced. Critical for debugging "why is the agent doing X now."

**Promotion ladder:** Project-specific rules in FEEDBACK.md → recurring patterns promoted to CLAUDE.md → cross-project patterns promoted to About Me/. Each promotion is explicit, never silent.

---

## Anti-patterns

| Anti-pattern | Why it breaks the loop |
|---|---|
| Editing past MEMORY.md or FEEDBACK.md entries | Breaks audit trail. Append-only is the contract. |
| Adding a rule directly to CLAUDE.md without going through FEEDBACK.md first | The rule loses its "why" (trigger context). Re-derivation later is expensive. |
| Running skill-suggester on a project with no FEEDBACK.md | No signal to analyze. Returns INSUFFICIENT SIGNAL. |
| Skipping compress-session at the end of substantive work | Next session starts blind. Re-discovers context already known. |
| Disabling the scheduled actions | Loop becomes manual-only. Quality drift becomes invisible. |
| Letting CLAUDE.md exceed 500 lines without running compress-claude-md | Model loads it but stops referencing it precisely. |

---

## Integration with project-setup

When a new project is created via `project-setup` skill (V1.1+), the project ships with:

1. FEEDBACK.md (empty, with header only)
2. MEMORY.md (with initial creation entry)
3. The 4 pre-installed skills (token-budget, compress-session, capture-feedback, skill-suggester)
4. CLAUDE.md with expanded Session Protocol referencing both files and all 4 skills
5. The 2 default scheduled actions proposed (user confirms creation)

If any of these is missing in an existing project, `quality-reviewer` flags it as Critical (V1.1+).

---

## Reference files

- `skills/capture-feedback/SKILL.md`
- `skills/skill-suggester/SKILL.md`
- `skills/compress-session/SKILL.md`
- `skills/compress-claude-md/SKILL.md`
- `subagents/feedback-analyzer.md`
- `templates/feedback-md-template.md`
- `skills/project-setup/SKILL.md` (Step 5.5)

## Version

V1.4, 2026-05-28. First version documenting the integrated loop.

# FEEDBACK.md Template

<!--
Version: 1.0 (2026-05-28)
FEEDBACK.md is created in every Nexforce project (Cowork and Claude Code) by `project-setup`.
This template is the canonical starting state. Replace [project-name] with the actual name.

How it works:
- The `capture-feedback` skill appends an entry every time the user corrects output or states a preference.
- The `feedback-analyzer` subagent reads this file monthly (or on demand) and proposes CLAUDE.md edits from recurring patterns.
- The `skill-suggester` skill reads this file weekly (or on demand) and proposes new skills, subagents, or rules.

File rules:
- Append-only. Never delete or edit past entries.
- Most recent entries on top.
- Entries promoted to CLAUDE.md are marked [PROMOTED] in the original entry but never removed.

Read by the agent:
- Last 5-10 entries at the start of every substantive session.
- Apply every active (non-PROMOTED) rule still in force.
-->

---

```markdown
# FEEDBACK, [project-name]

Append-only log of user corrections, preferences, and behavioral rules.
Most recent entries on top. Never delete, never edit past entries. Only add.

The `capture-feedback` skill appends entries automatically when the user corrects output or states a preference.
The `skill-suggester` skill reads this file weekly to propose CLAUDE.md edits and new skills.

Read the last 5-10 entries at the start of every substantive session.
Rules promoted to CLAUDE.md are marked [PROMOTED] in the original entry.

---
```

## Entry format (used by capture-feedback)

Each entry follows this structure:

```markdown
## YYYY-MM-DD HH:MM | <short title 5-8 words>

**Type:** Correction | Preference | Rule | Vocabulary | Process
**Scope:** Project | Global (proposed)
**Trigger context:** <1 sentence on what the agent was doing when corrected>

**What the agent did:**
<concrete description of the output or behavior that was corrected>

**Correction or preference:**
<exact rule, in user's own words when possible>

**How to apply going forward:**
<specific behavior change, written as an instruction the agent can follow next time>

**Promotion candidate:**
<if recurring or globally useful, mark as candidate for CLAUDE.md or About Me/ promotion>

---
```

## Type field reference

| Type | What it captures |
|---|---|
| **Correction** | The agent did something wrong (factual or behavioral) |
| **Preference** | The user prefers a style, format, or approach |
| **Rule** | A recurring constraint the agent must respect |
| **Vocabulary** | Banned or required terms |
| **Process** | A workflow step the user expects |

## Scope field reference

| Scope | Meaning |
|---|---|
| **Project** | Applies only to this project |
| **Global (proposed)** | Could apply across all projects, candidate for promotion to `/Users/vitti/Documents/Claude/About Me/` |
| **Global** | Confirmed cross-project rule, already in About Me/ |

---
name: capture-feedback
version: 1.2
description: Captures user corrections, preferences, and behavioral rules during a session and appends them to FEEDBACK.md (append-only). Use when the user corrects the agent's output, expresses a preference, states a recurring rule, or signals dissatisfaction. Triggers: "não é assim", "errado", "da próxima vez", "sempre faça", "nunca faça", "prefiro que", "evite", "fix this", "wrong", "don't do", "always do", "I prefer", "remember to". Auto-trigger when the agent detects the user is correcting prior output or stating a behavioral preference. User confirmation is ALWAYS required before writing to FEEDBACK.md, even in auto-trigger cases. After append, invokes auto-correct in retroactive mode to scan current session for prior violations.
allowed-tools: [Read, Write, Edit, AskUserQuestion, Glob]
---

<!--
Changelog:
- 1.2 (2026-05-28): After appending to FEEDBACK.md, invokes auto-correct in retroactive mode. Scans current-session outputs for the same violation pattern and proposes retroactive correction. Closes the gap between correction capture and consistent enforcement.
- 1.1 (2026-05-28): Tightened description to make user confirmation explicit for all invocation paths including auto-trigger. Closes ambiguity flagged in V1.6 eval review.
- 1.0: initial.
-->


# capture-feedback

## What it does

Detects user feedback (corrections, preferences, rules) during a session, classifies it by scope (one-off vs recurring), and appends a structured entry to the project's `FEEDBACK.md`. The goal is to stop relapsing on the same correction across sessions.

FEEDBACK.md is the persistent layer for user preferences and corrections. MEMORY.md stores decisions and context. They are complementary, not overlapping.

## When to invoke

- User corrects the output: "não é assim", "errado", "wrong", "fix this"
- User states a preference: "prefiro que", "I prefer", "always do X", "never do Y"
- User defines a recurring rule: "da próxima vez", "from now on", "going forward"
- User pushes back on tone, format, vocabulary, or process
- Auto-trigger: agent detects it has just been corrected and the correction is reusable (not a one-off typo fix)

## When NOT to invoke

- One-time factual correction with no behavioral implication ("the date was 2026, not 2025")
- User explicitly says "this is one-off, don't save"
- Session is exploratory and no concrete feedback was given
- The correction is about a third-party fact, not about how the agent should behave

## Workflow

### 1. Detect FEEDBACK.md

Glob for `FEEDBACK.md` in the project root. If it does not exist, ask via `AskUserQuestion`:

**Q1, Create FEEDBACK.md?**
- Yes, create now in this project (recommended)
- No, just acknowledge the correction without persisting
- Cancel

If yes, create with the header below (see "FEEDBACK.md template").

### 2. Classify the feedback

Identify type and scope:

| Type | What it is | Example |
|---|---|---|
| **Correction** | The agent did something wrong | "Você usou em-dash, nunca use" |
| **Preference** | The user prefers a style or format | "Prefiro tabelas em vez de bullets" |
| **Rule** | A recurring constraint | "Sempre confirmar antes de mexer em FEEDBACK.md" |
| **Vocabulary** | Banned or required terms | "Não use 'jornada', use 'processo'" |
| **Process** | A workflow step the user expects | "Sempre ler MEMORY.md antes de começar" |

Scope:
- **Project-specific:** applies only to this project
- **Global:** applies across all projects (proposal, user confirms before promoting to global)

### 3. Generate the entry

Fixed format, append to the top of FEEDBACK.md (most recent first):

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

### 4. Confirm before writing

Show the entry to the user via `AskUserQuestion`:

**Q1, Confirm this entry?**
- Yes, write to FEEDBACK.md
- Adjust the wording first
- Discard (one-off, not worth saving)

### 5. Append and acknowledge

Write to FEEDBACK.md. Acknowledge in 1 line: "Recorded in FEEDBACK.md. Next session will read this before substantive work."

### 5.5. Retroactive correction (mandatory after append)

Invoke `skills/auto-correct/SKILL.md` in **retroactive mode** with the just-captured correction as input. The skill scans outputs already produced in the current session for the same violation pattern.

If matches are found, auto-correct asks the user:

> "The correction '<rule>' matches N prior outputs in this session. Apply retroactive correction? (yes / selected / no)"

User decides. If approved, the affected outputs are re-generated or edited.

If no matches, auto-correct exits silently. The rule remains active for future outputs in this and subsequent sessions.

### 6. Promotion to CLAUDE.md

If the same rule appears 2+ times in FEEDBACK.md (detected by re-reading prior entries), propose promotion to CLAUDE.md `## Behavior` section. Do not promote silently. Always ask:

> "This rule appeared N times in FEEDBACK.md. Promote to CLAUDE.md so the agent applies it automatically, not just when re-reading FEEDBACK.md? (yes/no)"

If the rule applies across all projects, propose promotion to `/Users/vitti/Documents/Claude/About Me/`.

---

## FEEDBACK.md template

When creating FEEDBACK.md for the first time, use this header:

```markdown
# FEEDBACK, [project-name]

Append-only log of corrections, preferences, and behavioral rules.
Most recent entries on top. Never delete, never edit past entries.

The `capture-feedback` skill appends entries automatically when the user corrects output or states a preference.

Read the last 5-10 entries at the start of every substantive session.
Rules promoted to CLAUDE.md are marked [PROMOTED] in the original entry.

---
```

---

## Rules

- No em-dash. Apply the vague-jargon test (replace impressive-sounding words that carry no specific information).
- Operational language ("usuário corrigiu", "regra recorrente"), not narrative.
- Entry must be self-contained: a future agent reading only this entry must understand what changed and why.
- Never modify past entries. If a rule is reversed, append a new entry that supersedes it (link to the prior entry by date).
- Do not capture personal information (PII) unless the user explicitly asks to remember it.

## Failure handling

| Failure | Response |
|---|---|
| FEEDBACK.md does not exist and user declines to create | Acknowledge correction verbally only. Do not persist. |
| User correction is ambiguous | Ask 1 question to disambiguate before writing. |
| Conflict with existing entry | Show both, ask user which holds. Append a new entry referencing the prior one. |
| Correction conflicts with CLAUDE.md rule | Flag the conflict to the user. Do not silently override. |

## Output

After execution:

1. FEEDBACK.md exists in the project root
2. New entry appended at the top
3. If promotion criterion met (2+ similar entries), proposal shown to user
4. 1-line acknowledgment to user

## Examples

### Example 1, vocabulary correction

**Context:** Agent used "alavancar" in an output. User: "Nunca use 'alavancar', está na minha lista de banidos."

**Captured entry:**

```markdown
## 2026-05-28 14:30 | Banimento de "alavancar"

**Type:** Vocabulary
**Scope:** Global (proposed)
**Trigger context:** Agent drafted a LinkedIn post using "alavancar nossa expansão"

**What the agent did:**
Used "alavancar" as a vague verb in operational prose. The word adds no specific information in this context; the sentence becomes "AI-feel" filler.

**Correction or preference:**
Never use "alavancar". Substitute by "usar", "aproveitar", "ampliar", or rewrite the sentence.

**How to apply going forward:**
Scan all output for "alavancar" before delivering. If present, rewrite the sentence. Same rule for the EN equivalent "leverage" when vague.

**Promotion candidate:**
Already in About Me/anti-ai-writing-style.md. Verify and reinforce.

---
```

### Example 2, process preference

**Context:** Agent started writing files before confirming the destination path. User: "Sempre me mostra o path completo antes de criar arquivo, eu já te falei isso."

**Captured entry:**

```markdown
## 2026-05-28 15:10 | Path confirmation before mkdir

**Type:** Process
**Scope:** Project
**Trigger context:** project-setup skill tried to create folders without showing the resolved absolute path

**What the agent did:**
Jumped straight to mkdir after collecting name and area, without printing the resolved absolute path for the user.

**Correction or preference:**
Always print the resolved absolute path and wait for explicit confirmation before any mkdir.

**How to apply going forward:**
In project-setup, before mkdir: print "Path: /Users/vitti/Documents/Claude/Projects/[area]/[name]" and wait for "ok" from user.

**Promotion candidate:**
Already in project-setup as Step 7. If it appears 2+ times in FEEDBACK.md, the rule is not being applied. Reinforce in CLAUDE.md.

---
```

### Example 3, one-off (not captured)

**Context:** User: "A data correta é 28 de maio, não 27."

**Action:** Acknowledge and correct the output. Do not invoke capture-feedback. This is a factual correction without behavioral implication.

---

## Restrictions

- Never write to FEEDBACK.md without explicit user confirmation in Step 4
- Never modify or delete past entries
- Never persist PII without explicit consent
- Never auto-promote rules to CLAUDE.md or About Me/ without user confirmation
- Always include date and time (use Bash `date` if needed for precision)

## References

- Related skill: `skill-suggester` (analyzes FEEDBACK.md to propose new skills)
- Related subagent: `feedback-analyzer` (proposes CLAUDE.md edits from FEEDBACK.md patterns)
- Related skill: `compress-session` (writes to MEMORY.md, not FEEDBACK.md)

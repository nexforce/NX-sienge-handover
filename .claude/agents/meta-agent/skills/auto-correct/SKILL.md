---
name: auto-correct
version: 1.0
description: Real-time enforcement of FEEDBACK.md rules. Runs in 3 modes. Pattern-detection at session start identifies recurring rules and activates them as enforced for the session. Pre-output before any substantial delivery self-checks the output against active rules and fixes violations before sending. Retroactive after the user corrects something revisits prior outputs in the current session to find and fix the same violation in earlier deliverables. Triggers: "auto-correct", "self-check", "enforce feedback", "review my output", "audita minha resposta", "verifica antes de enviar", or auto-invoked by Session Protocol and capture-feedback.
allowed-tools: [Read, Glob, Grep, AskUserQuestion]
---

<!--
Changelog:
- 1.0 (2026-05-28): Initial. 3 modes: pattern-detection (session start), pre-output (before write), retroactive (after correction). Closes the gap between FEEDBACK.md capture and CLAUDE.md promotion (monthly). Rules get enforced in real-time from the moment they have 2+ FEEDBACK entries.
-->

# auto-correct

## What it does

Closes the enforcement gap in the self-improvement loop. Today:

- `capture-feedback` records corrections (real-time)
- `feedback-analyzer` proposes CLAUDE.md edits (monthly)
- `skill-suggester` proposes new skills (weekly)

Between capture and promotion, rules can be applied inconsistently. `auto-correct` enforces FEEDBACK.md rules in real-time inside the session, without waiting for monthly consolidation.

3 modes:

1. **pattern-detection** at session start: scans FEEDBACK.md, identifies rules with 2+ occurrences, marks them as "active enforcement" for this session.
2. **pre-output** before any substantial deliverable (file write, long response, artifact, decision document): self-checks the draft against active rules, fixes violations before sending.
3. **retroactive** after `capture-feedback` records a new correction: scans outputs already produced in the current session for the same violation pattern, proposes correction batch.

## When to invoke

- **pattern-detection mode:** Session Protocol Start, after reading MEMORY.md and FEEDBACK.md. Mandatory in substantive sessions.
- **pre-output mode:** before any output >100 lines, any file write, any decision deliverable. Mandatory.
- **retroactive mode:** auto-invoked by `capture-feedback` after a correction is recorded. Optional but recommended.
- **On-demand:** user says "auto-correct", "self-check", "verifica antes de enviar".

## When NOT to invoke

- Conversational reply <5 lines, no file write, no critical decision
- Single quick lookup that does not produce a deliverable
- FEEDBACK.md is empty or has fewer than 2 entries
- Session is exploratory and outputs are explicitly drafts ("rascunho", "first pass")

---

## Mode 1, pattern-detection (session start)

### Input
- `<project>/FEEDBACK.md` (full file)

### Steps

1. Parse all active (non-[PROMOTED]) entries.
2. Cluster by similarity (same Type, same domain, similar rule statement).
3. Identify clusters with 2+ entries. These are **active enforcement rules** for this session.
4. Build a session-scoped checklist of rules:
   - Vocabulary bans (specific words/phrases to avoid)
   - Process requirements (steps that must always happen)
   - Format preferences (structures the user expects)
   - Behavioral patterns (push back, take position, etc.)
5. Hold this list in working memory for the session.

### Output

A 5-10 line summary to the user:

```
Active enforcement for this session (from FEEDBACK.md):
- N vocabulary rules (banned: X, Y, Z)
- N process rules (e.g., "confirm path before mkdir")
- N format rules (e.g., "table over bullets for comparisons")
- N behavioral rules (e.g., "no preamble on technical answers")

Loop active. Pre-output checks will enforce these on every deliverable.
```

Posted once at session start. Quiet for the rest of the session unless violation detected.

---

## Mode 2, pre-output (before substantial deliverable)

### Input
- The draft about to be sent or written
- Active enforcement rules from Mode 1 (session-scoped)
- CLAUDE.md baseline rules (from Behavior section)

### Steps

1. Receive the draft (or read the file about to be written).
2. Run checks in order of severity:
   - **Hard rules** (em-dash, banned vocab from FEEDBACK, EN-only canonical): grep-style detect.
   - **Format rules** (tables vs bullets, header style, length caps): structural scan.
   - **Process rules** (confirm path, take position, ask one question): contextual check.
   - **Behavioral rules** (no preamble, no fake conclusions): structural scan.
3. For each violation found:
   - Severity Critical (em-dash, banned vocab): fix automatically before sending. Log fix in chat.
   - Severity Important (format/behavioral): fix automatically OR ask user if uncertain.
   - Severity Minor (style preferences): mention in summary, do not block.
4. If no violation, send unchanged.
5. If violations were fixed, post 1-line summary: "Pre-output check: N violations auto-corrected (em-dash, vague jargon)."

### Decision tree

```
Draft is substantial deliverable?
├── No → skip auto-correct, send as-is.
└── Yes → Continue.

Are active enforcement rules loaded for this session?
├── No → invoke Mode 1 first.
└── Yes → Continue.

Scan draft for violations.
├── No violations → send draft unchanged.
├── Critical violations → auto-fix + log + send.
├── Important violations → auto-fix or ask user if ambiguous.
└── Minor violations → flag in summary, do not block.
```

---

## Mode 3, retroactive (after new correction captured)

### Input
- Just-captured FEEDBACK.md entry (from capture-feedback)
- All outputs produced in the current session

### Steps

1. Receive the new correction context from capture-feedback.
2. Identify the violation pattern (vocabulary, format, behavior).
3. Scan all outputs produced in the current session (chat responses, files written, drafts shown).
4. For each prior output that contains the same violation pattern, list it.
5. Ask user via `AskUserQuestion`:

```
The correction "<rule>" applies to N prior outputs in this session:
1. [link/summary of output 1]
2. [link/summary of output 2]

Apply correction retroactively to all? (yes/selected/no)
```

6. If yes: re-generate or edit the affected outputs.
7. If selected: ask which specific ones.
8. If no: acknowledge, the rule is now active for future outputs only.

### When skip
- The correction is one-off (capture-feedback already filtered)
- No prior outputs in the session match the pattern
- Session has only conversational turns, no substantial outputs

---

## Active rule examples

Examples of rules `auto-correct` enforces in real-time:

| Rule type | Example | Detection |
|---|---|---|
| Vocabulary | "Never use 'alavancar' as vague verb" | grep + context check |
| Em-dash | "Never use em-dash" | grep for `—` |
| Format | "Use tables for comparisons, not bullets" | structural scan |
| Process | "Always confirm path before mkdir" | check skill workflow |
| Behavioral | "Take a position, do not list options without recommendation" | semantic check |
| Output style | "No preamble on technical answers" | first-line check |
| Length | "Keep email under 120 words" | line count |

Rules are loaded fresh at each session start from FEEDBACK.md.

---

## Output

After execution:

**Mode 1 (pattern-detection):**
- Active rules list posted to chat (5-10 lines)
- Session-scoped enforcement state held in working memory

**Mode 2 (pre-output):**
- If clean: silent, output sent
- If fixes applied: 1-line summary

**Mode 3 (retroactive):**
- List of affected prior outputs
- User decision recorded
- Re-generated outputs delivered if approved

Never silent on a fix. Always log what changed.

---

## Restrictions

- **Never apply Critical fix without logging it** (transparency over speed)
- **Never apply Important fix on ambiguous case without asking** (false-positive risk)
- **Never invoke retroactive mode automatically on conversational corrections** (would be intrusive)
- Pre-output mode is mandatory for: file writes, decision documents, deliverables >100 lines
- Pattern-detection mode is mandatory at session start in substantive sessions, optional for quick lookups
- Rules with single occurrence in FEEDBACK.md are NOT enforced (avoid over-triggering on one-offs)
- Rules marked [PROMOTED] are already in CLAUDE.md, do not double-enforce here

---

## Example

### Mode 1 invocation

**Session start, FEEDBACK.md has 12 entries.**

auto-correct (pattern-detection) clusters:
- 3 entries about "never use 'alavancar' as vague verb"
- 2 entries about "tables over bullets in comparisons"
- 1 entry about "always close with recommendation"
- Other entries are singletons (not yet enforced)

Output to chat:

```
Active enforcement for this session (from FEEDBACK.md, 5 active rules from 12 entries):
- Vocabulary: never use "alavancar" as vague verb (3 occurrences)
- Format: tables over bullets in comparisons (2 occurrences)
- Singleton rules held for next FEEDBACK entry (1+ each)
Pre-output checks active.
```

### Mode 2 invocation

**Agent about to write a strategic recommendation document.**

auto-correct (pre-output) scans draft. Detects:
- 1 em-dash on line 42
- "alavancar" used on line 78

Auto-fixes both. Logs:

```
Pre-output check: 2 violations auto-corrected (em-dash line 42, "alavancar" line 78). Sending revised draft.
```

Output sent with fixes applied.

### Mode 3 invocation

**Agent produced 3 prior outputs in session. User then says "nunca use 'ecossistema' como metáfora".**

capture-feedback records the new rule. auto-correct (retroactive) scans the 3 prior outputs:
- Output 1: contains "ecossistema HubSpot" (metaphor)
- Output 2: contains "ecosystem of partners" (different word, no match)
- Output 3: contains "ecossistema de software" (metaphor)

auto-correct asks:

```
The new rule "nunca use 'ecossistema' como metáfora" matches 2 prior outputs in this session:
1. Output 1: "alavancando o ecossistema HubSpot..."
2. Output 3: "no ecossistema de software..."

Apply retroactive correction? (yes / selected / no)
```

User: "yes".

Both outputs re-generated with "ecossistema" replaced by concrete alternative.

---

## Integration points

| Caller | Mode | When |
|---|---|---|
| Session Protocol Start | pattern-detection | After read MEMORY + FEEDBACK |
| Pre-write any substantial file | pre-output | Before invoking Write tool |
| Pre-deliver any decision document | pre-output | Before posting to chat |
| `capture-feedback` v1.2+ | retroactive | After appending to FEEDBACK.md |
| User on demand | any mode | Triggered by direct request |

---

## How this fits the self-improvement loop

| Skill | When | What |
|---|---|---|
| `capture-feedback` | Real-time, on user correction | Record in FEEDBACK.md |
| `auto-correct` | Real-time, multiple per session | **Enforce active rules immediately** |
| `compress-session` | End of session | Record decisions in MEMORY.md |
| `skill-suggester` | Weekly (scheduled) | Propose new skills, retirements |
| `feedback-analyzer` | Monthly (scheduled) | Propose CLAUDE.md edits from FEEDBACK |
| `compress-claude-md` | On demand or after consolidation | Trim CLAUDE.md |

`auto-correct` fills the real-time gap. Without it, rules captured today are only enforced after monthly review.

---

## References

- `skills/capture-feedback/SKILL.md` v1.2+ (invokes auto-correct retroactive after capture)
- `skills/compress-session/SKILL.md`
- `skills/skill-suggester/SKILL.md`
- `subagents/feedback-analyzer.md`
- `references/self-improvement-loop.md` (full cycle, now includes auto-correct)
- `references/self-correction-protocol.md` (this protocol in detail)

---
name: token-budget
version: 1.1
description: Monitors context consumption in the current session and recommends when to open a new session (or compress) before cost explodes. Use at the start of a substantive session, when the user signals "long session", when about to load multiple long files (>50k tokens combined), or when Claude detects context approaching 60-70% of the model limit. Triggers: "should I open a new session", "token budget", "context check", "cost check", "is this session too long".
allowed-tools: [Read, AskUserQuestion]
---

<!--
Changelog:
- 1.1 (2026-05-28): Added missing canonical sections per skill-creation-checklist: ## Output and ## Restrictions. Content of both was previously embedded across other sections; now explicit and easier for quality-reviewer to validate.
- 1.0: initial.
-->


# token-budget

## What it does

Estimates current context consumption (tokens already loaded + projected for the task), compares against the model limit, and recommends one of three actions: (1) continue in the current session, (2) compress with `compress-session` and continue, (3) open a new session with a compact opening prompt.

The goal is to avoid two failure modes: silent cost explosion (long session with Opus 4.6 burning $50+ in repeated context replay) and quality degradation (context near saturation reduces reasoning quality before it errors out).

## When to invoke

- **Start of any substantive session** (more than a quick lookup). Estimate upfront.
- **Before loading 3+ long files** (>15k tokens each) in the same turn.
- **When the session crosses ~5 substantive turns** with file reads or long tool outputs.
- **When the user asks**: "is this too long", "should I start over", "token budget", "cost check".
- **Auto-trigger**: when Claude estimates context is at 60-70% of the model limit.

## When NOT to invoke

- Quick lookups (1-2 turns, no file reads).
- Pure conversation without tool use.
- Session that just started with <10k tokens loaded.

## Workflow

### 1. Estimate current context

Sum the approximate tokens loaded so far:
- System prompt + CLAUDE.md + MEMORY.md header: ~5-15k
- Each file read via `Read`: tokens ≈ characters / 4
- Each long tool output (bash logs, grep dumps): tokens ≈ characters / 4
- Each prior turn (user + assistant): ~1-3k average

If exact count is impossible (most sessions), classify into 5 buckets:

| Bucket | Approx tokens | % of 200k window | % of 1M window |
|---|---|---|---|
| Light | <20k | <10% | <2% |
| Moderate | 20-60k | 10-30% | 2-6% |
| Heavy | 60-120k | 30-60% | 6-12% |
| High | 120-180k | 60-90% | 12-18% |
| Saturated | >180k | >90% (Haiku at risk) | >18% |

### 2. Project the task ahead

Ask: how many more turns + how many more reads + how much output?

- Each additional turn: +2-5k input replay (Claude re-reads context each turn)
- Each file load: +size
- Each long output (code generation, doc writing): +N tokens generated

### 3. Apply the decision rule

| Current bucket | Model | Recommendation |
|---|---|---|
| Light or Moderate | any | **Continue.** No action. |
| Heavy | Sonnet 4.6 / Opus 4.6 (1M context) | **Continue** but suggest `compress-session` at the end. |
| Heavy | Haiku 4.5 (200k context) | **Compress now** via `compress-session`, then continue. |
| High | any | **Compress + new session.** Save with `compress-session`, open new session with prompt referencing `MEMORY.md`. |
| Saturated | any | **Stop, hard cutover.** Force `compress-session`, do not continue in this session. |

### 4. Recommend the next action explicitly

Present the recommendation as:

```
## Token budget check

Current context: ~X tokens (bucket: Y, ~Z% of model window).
Projected for task: +N tokens.
Cost estimate so far this session: ~$X (input replay + output).

Recommendation: [CONTINUE | COMPRESS THEN CONTINUE | NEW SESSION]

Reason: [1 line]

Next step: [concrete action]
```

If the recommendation is NEW SESSION, generate the opening prompt for the next session:

```
Suggested opening for the next session:
"Read MEMORY.md and the last 3 entries before starting. The current task is: [1-line summary]. The artifacts produced so far are at [paths]."
```

### 5. Cost-aware nudges

If user is on Opus 4.6 and crosses Heavy bucket: explicitly mention cost. Opus at $15/Mtok input × repeated replay grows non-linearly. Heavy session with Opus easily hits $20-50.

If user is on Haiku 4.5: cost is rarely the issue, but the 200k context window is. Push compress earlier.

If user is on Sonnet 4.6: balanced. Cost moderate, context room large (1M). Push compress only at High bucket.

## Heuristic thresholds (memorize)

| Trigger | Action |
|---|---|
| 5+ Read calls on files >5k tokens each | Estimate aloud, suggest compress at end |
| Same file Read 3+ times | Stop. Either it is large enough to summarize once, or context is being wasted |
| User pastes >20k chars | Estimate aloud, suggest splitting the task |
| 10+ turns in a single session with substantive tool use | Auto-suggest token-budget check |
| Claude generating 5k+ tokens of output | Confirm with user before continuing (output also counts) |

## Cost reference (May 2026, validate before quoting)

| Model | Input $/Mtok | Output $/Mtok | Cached read $/Mtok |
|---|---|---|---|
| Opus 4.6 | $15 | $75 | $1.50 |
| Sonnet 4.6 | $3 | $15 | $0.30 |
| Haiku 4.5 | $1 | $5 | $0.10 |

Cost grows with input replay: each turn replays the cumulative context as input. A 100k-token session at turn 10 has paid for ~1M cumulative input tokens (10 × 100k). On Opus that is $15.

## Output

After invocation, the skill returns:

1. **Current context bucket** (Light, Moderate, Heavy, High, Saturated) with token estimate and percentage of model window
2. **Projected cost for the next N turns** based on the user-stated task ahead
3. **One of three recommendations:**
   - `CONTINUE`: stay in current session, low risk
   - `COMPRESS THEN CONTINUE`: invoke `compress-session` to write to MEMORY.md, reset context, continue with lean state
   - `NEW SESSION`: hard switch, open a fresh conversation with a compact opening prompt referencing recent MEMORY.md entries
4. **Reasoning** in 1-2 lines tying the recommendation to the bucket and projected task

Output is conversational text in the chat, never written to file.

---

## Restrictions

- Never auto-compress or auto-switch sessions. Always present the recommendation and let the user decide.
- Never invent precise token counts when exact measurement is unavailable. Use the 5-bucket classification.
- Never recommend NEW SESSION for sessions below 60k tokens (overhead exceeds savings).
- Never skip the recommendation when context is in High or Saturated bucket.
- If model is Haiku 4.5 (200k window) and context exceeds 180k, recommend NEW SESSION immediately (Saturated = quality degradation risk).
- Cost estimates use the pricing in `references/models-pricing.md`. Update that reference monthly, do not hardcode prices here.

---

## Anti-patterns

1. **Do not silently let a session grow past 150k tokens.** The user pays without seeing the meter.
2. **Do not recommend new session for a 5k context session.** Overhead of switching exceeds the savings.
3. **Do not invent token counts.** If you cannot estimate, say "approximately X bucket" and ask the user.
4. **Do not skip the recommendation when in High or Saturated.** Always state the action.
5. **Do not compress and continue silently.** `compress-session` writes to MEMORY.md, user must approve.

## Example invocation

**User input**: "Session is feeling long, can we keep going?"

**Expected output**:

## Token budget check

Current context: ~85k tokens (Heavy bucket, ~43% of 200k window, ~8.5% of 1M).
Projected for task (you mentioned reviewing 3 more files + drafting a doc): +40k.
Cost so far this session: ~$8 (Sonnet 4.6, 10 turns with cumulative replay).

**Recommendation: COMPRESS THEN CONTINUE**

Reason: Current trajectory hits High bucket (~125k) after the 3 file reads. Compressing now resets context and keeps cost flat.

Next step: I will invoke `compress-session` to write the current decisions to MEMORY.md, then we continue with a lean context.

## References

- `compress-session` skill (counterpart, writes summary to MEMORY.md)
- `choose-model` skill (when cost is the issue, downgrade to Haiku for next turn if task allows)
- `references/models-pricing.md` for current pricing

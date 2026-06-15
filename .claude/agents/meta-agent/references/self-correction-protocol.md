# Self-Correction Protocol

## Scope

Documents the full auto-correction cycle that enforces FEEDBACK.md rules in real-time, closing the gap between user correction and monthly CLAUDE.md consolidation.

Read this when:
- Designing or modifying skills that interact with FEEDBACK.md
- Understanding why the agent corrects itself in real-time, not waiting for monthly review
- Debugging a missed correction (rule was in FEEDBACK.md but not enforced)
- Onboarding a new project that should follow the protocol

---

## The problem this protocol solves

**Before V2.3:**

```
User correction (real-time)
   ↓ capture-feedback
FEEDBACK.md entry (real-time)
   ↓
[GAP, no enforcement]
   ↓
Next session: agent reads FEEDBACK.md, may or may not apply consistently
   ↓
[GAP, up to 30 days]
   ↓
Monthly feedback-analyzer proposes CLAUDE.md edit
   ↓
User approves
   ↓
CLAUDE.md updated, rule now enforced via baseline
```

The 2 gaps mean the same correction can be relapsed multiple times before becoming permanent. Wastes user attention and agent quality.

**After V2.3:**

```
User correction (real-time)
   ↓ capture-feedback (records in FEEDBACK.md)
   ↓ auto-correct retroactive (scans prior session outputs, proposes fix)
FEEDBACK.md entry + session outputs corrected (real-time)
   ↓
Next session start:
   ↓ auto-correct pattern-detection (clusters FEEDBACK entries, activates rules with 2+ occurrences)
   ↓
[Rule enforced in real-time from this point]
   ↓
Pre-output checks on every deliverable
   ↓
Monthly feedback-analyzer still proposes CLAUDE.md promotion (consolidation, not enforcement)
   ↓
User approves
   ↓
CLAUDE.md updated, rule now part of baseline
```

The 2 gaps are closed. Enforcement starts the moment a rule reaches 2 occurrences in FEEDBACK.md.

---

## The 4 enforcement points

### Point 1, Real-time capture

**When:** user corrects output, expresses preference, defines a recurring rule.

**What:** `capture-feedback` skill records the correction in FEEDBACK.md.

**Output:** new FEEDBACK.md entry with Type, Scope, rule, and how-to-apply.

### Point 2, Retroactive correction (same session)

**When:** immediately after Point 1, if the correction applies to outputs already produced in this session.

**What:** `auto-correct` in **retroactive** mode scans current session outputs for the same violation pattern. Lists matches. Asks user. Applies if approved.

**Output:** prior outputs in the session corrected, or acknowledged decision to leave them.

### Point 3, Session-start activation

**When:** start of every substantive session.

**What:** `auto-correct` in **pattern-detection** mode reads FEEDBACK.md. Clusters entries. Rules with 2+ occurrences become **active enforcement** for the session. Posts summary to chat.

**Output:** session-scoped enforcement state held in working memory. Rules ready to apply.

### Point 4, Pre-output enforcement

**When:** before any substantial deliverable (file write, long response, decision document, artifact).

**What:** `auto-correct` in **pre-output** mode scans the draft against active rules. Auto-fixes Critical violations. Asks on ambiguous Important ones. Mentions Minor in summary.

**Output:** delivered output is already compliant with active FEEDBACK.md rules.

---

## When the protocol does NOT apply

- Conversational replies under 5 lines, no file write
- Quick lookups (factual question, no deliverable)
- FEEDBACK.md is empty or under 2 entries
- Session is explicitly exploratory ("rascunho", "first draft")
- Rule has only 1 occurrence in FEEDBACK.md (held for next entry)
- Rule is marked [PROMOTED] (already in CLAUDE.md baseline, enforced there)

---

## Promotion thresholds

| Stage | Trigger | Where enforced |
|---|---|---|
| Single FEEDBACK entry | 1 occurrence | Captured but NOT enforced automatically (might be one-off) |
| Active enforcement | 2+ occurrences | auto-correct enforces in real-time during session |
| CLAUDE.md promotion | feedback-analyzer monthly review approves | CLAUDE.md baseline, applies everywhere |
| About Me/ promotion | Global-scoped rule with cross-project applicability | About Me/about-me.md or anti-ai-writing-style.md |
| Org-level promotion | Technical/protocol rule needed across all projects | Organization-level instructions (Admin Settings) |

A rule moves up the ladder as evidence accumulates. Each stage has a specific enforcement mechanism.

---

## Integration with other skills and subagents

```
                    ┌─────────────────┐
                    │ User correction │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ capture-feedback│ (records FEEDBACK.md)
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ auto-correct    │
                    │ (retroactive)   │ (scans session, fixes if approved)
                    └─────────────────┘

                    [End of correction handling, session continues]

                    ┌─────────────────┐
                    │ Session start   │
                    │ (next session)  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Read MEMORY.md  │
                    │ Read FEEDBACK.md│
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ auto-correct    │
                    │ pattern-detect  │ (activates 2+ rules for session)
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Before any      │
                    │ substantial     │
                    │ output:         │
                    │ auto-correct    │
                    │ pre-output      │ (self-check, fix, send)
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ End of session  │
                    │ compress-session│
                    └─────────────────┘

                    [Weekly] skill-suggester audits patterns
                    [Monthly] feedback-analyzer proposes CLAUDE.md edits
```

---

## Anti-patterns

| Anti-pattern | Why it breaks the protocol |
|---|---|
| Skip auto-correct pattern-detection at session start | Rules in FEEDBACK.md not enforced until reading next session, gap recurs |
| Skip auto-correct pre-output on a file write | Violation goes out, user has to catch and correct, rule repeats |
| Auto-apply retroactive corrections without asking | Intrusive, user loses control over what was delivered |
| Enforce single-occurrence rules as active | Over-trigger on one-offs that may not be real preferences |
| Enforce [PROMOTED] rules via auto-correct | Double-work, the rule is already in CLAUDE.md baseline |
| Silent fix in pre-output mode | User does not learn that the rule was enforced, less calibration over time |
| Manual mention of rules without using auto-correct | Inconsistent application, defeats the protocol purpose |

---

## Severity ladder for violations

| Severity | Examples | Action |
|---|---|---|
| **Critical** | Em-dash, banned vocabulary list, PT in canonical artifact, missing version field on edited skill | Auto-fix, log to chat |
| **Important** | Format preference (table vs bullet), behavioral pattern (take position) | Auto-fix or ask on ambiguous |
| **Minor** | Style suggestion, vocabulary preference, length cap | Mention in summary, do not block |

Severity is determined by:
1. Type of rule (vocabulary/em-dash = Critical, format = Important, style = Minor)
2. Number of FEEDBACK occurrences (higher count = higher severity)
3. User's framing in FEEDBACK entry ("never", "always" = Critical; "prefer" = Important)

---

## Performance considerations

`auto-correct` adds friction to every output. Cost-benefit analysis:

| Cost | Benefit |
|---|---|
| 5-10% extra tokens per deliverable (scanning draft) | Eliminates repeated corrections, builds trust |
| 1 extra invocation per output | Rules captured today are enforced today, not next month |
| Possible false positives on Important rules | Asks user, no silent over-correction |

Net: positive. Trust + consistency > token cost.

If token-budget skill detects HIGH or SATURATED, defer pre-output mode to Critical-only (skip Important and Minor checks until session refresh).

---

## Reference

- `skills/auto-correct/SKILL.md` (the skill itself, this protocol implemented)
- `skills/capture-feedback/SKILL.md` v1.2+ (captures and invokes retroactive)
- `subagents/feedback-analyzer.md` (monthly consolidation, complements real-time)
- `references/self-improvement-loop.md` (broader cycle, now includes auto-correct)
- `templates/feedback-md-template.md` (FEEDBACK.md format used by capture-feedback)

## Version

V1.0, 2026-05-28.

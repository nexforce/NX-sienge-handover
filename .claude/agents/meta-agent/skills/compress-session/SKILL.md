---
name: compress-session
version: 1.0
description: Compresses the current session into a 10-15 line summary and appends it to a dated MEMORY.md for continuity between sessions. Use at the end of a substantive work session, when the user asks "save memory", "store context", "compress session", "close with summary", "record in MEMORY", or when you (Claude) detect that the session produced decisions/context important for future sessions.
allowed-tools: [Read, Write, Edit, AskUserQuestion]
---

# compress-session

## What it does

Reads the current session history, identifies decisions, context, and next steps, generates a concise summary (10-15 lines), and appends it dated to the project's `MEMORY.md`. Maintains continuity between sessions without inflating tokens.

## When to invoke

- End of a substantive work session (more than 5 turns or >30min)
- "Compress this session"
- "Save what we decided"
- "Store in MEMORY"
- "Close with summary"
- Auto-trigger: when Claude detects it has made architectural decisions, created important artifacts, or discovered information of historical value

## When NOT to invoke

- Short and trivial session (1-2 turns, no decision)
- Pure consultation session ("what's the price of Sonnet?")
- MEMORY.md does not exist in the project and the user did not ask to create it (ask first)

## Workflow

### 1. Detect MEMORY.md

Glob for `MEMORY.md` in the project folder. If it does not exist, ask via `AskUserQuestion`:

**Q1, Create MEMORY.md?**
- Yes, create now in this project
- No, just respond with the summary (do not persist)
- Cancel

### 2. Collect session context

Identify from history:
- **Decisions made** (architecture, scope, trade-offs)
- **Artifacts created/edited** (files, paths)
- **Blockers encountered** and how they were resolved
- **Open questions** (pending questions)
- **Next steps** (what to do in the next session)

### 3. Generate summary

Fixed format, 10-15 lines:

```markdown
## YYYY-MM-DD HH:MM | <session title in 5-8 words>

**Context:** <1 sentence on the general theme>

**Decisions:**
- <decision 1 and reason in 1 line>
- <decision 2>
- <decision 3>

**Artifacts:**
- `<path>` <what was done>
- `<path>` <what was done>

**Blockers resolved:**
- <problem → solution>

**Open:**
- <question or pending item>

**Next:**
- <concrete action for the next session>

---
```

Rules:
- No em-dash. Apply the vague-jargon test on every sentence.
- Operational language, not narrative ("decided", "created", not "we decided to navigate the journey")
- Each decision has a 1-line reason, not just "we did X"
- Absolute paths when referencing files
- Dates in ISO 8601

### 4. Show and confirm

Present the summary to the user:

```
## Session summary

[generated summary]

---

Append to MEMORY.md at <path>? (y/n)
```

Do not append without confirmation.

### 5. Append to MEMORY.md

Use `Edit` with append (read the file, add at the end). NEVER rewrite or delete previous entries.

If the file is empty or new, add the standard header before the first summary:

```markdown
# MEMORY, <project-name>

Append-only log of sessions. Most recent entries on top.
Never delete, never edit past entries. Only add.

---

[entries]
```

**Order decision:** most recent entries at the TOP (under the header). Whoever opens the file sees the newest first. Older history goes down.

### 6. Confirm and suggest next

```
✓ Session recorded in MEMORY.md

Total entries: <N>
Last previous entry: <date>

For the next session, I suggest starting with:
"Read the last 3 entries of MEMORY.md before starting"
```

## Expected output

1. 10-15 line summary in chat
2. `MEMORY.md` updated with the new entry on top
3. Suggested opening command for the next session

## Example

**Trigger:**
> Compress this session and save it in MEMORY

**History (hypothetical):**
8-turn session about designing the architecture of an SDR Marketplace agent.

**Expected output:**

```markdown
## 2026-05-15 21:30 | SDR Marketplace agent architecture V1

**Context:** Initial design of the SDR agent to prospect ISV partners via LinkedIn and email.

**Decisions:**
- Multi-agent: Opus 4.6 orchestrator + 3 subagents (prospector Sonnet, copywriter Sonnet, dispatcher Haiku). Rationale: distinct domains, reduces total cost via model mix.
- MCPs: Apollo (search/enrich), HubSpot (CRM), LinkedIn (via Apollo), Gmail. No custom MCP in V1.
- V1 target volume: 50 prospects/day. Estimated cost $X/month to confirm with docs-researcher.

**Artifacts:**
- `/Users/vitti/Documents/Claude/Projects/AI/sdr-marketplace-isv/CLAUDE.md` created via project-setup
- `outputs/agents/sdr/architecture-v1.md` created via agent-architect subagent

**Blockers resolved:**
- High initial latency with Opus across all agents, resolved with model mix.

**Open:**
- Confirm updated Sonnet 4.6 price with docs-researcher before closing the estimate.
- Decide whether LinkedIn DM goes through Apollo or a custom scraper.

**Next:**
- Implement Phase 1 MVP: orchestrator + prospector + 5 test leads.

---
```

Appends to `MEMORY.md` of the `sdr-marketplace-isv` project.

## Restrictions

- **Append-only.** Never delete or edit previous entries. Only add.
- **Mandatory confirmation** before writing. Show the summary, wait for OK.
- **Size limit:** 10-15 lines. If the session was very dense, prioritize decisions + next step. Detail goes into the generated artifact, not into MEMORY.
- **Dated in ISO 8601** with local timezone when possible.
- **No em-dash. Apply the vague-jargon test.**
- **Do not compress trivial sessions.** If there was no decision or useful context, tell the user and do not write.
- **Do not leak PII.** If the summary would include a customer name, contract value, or sensitive data, abstract it ("enterprise customer X", "big deal") or ask if it can be included.

## References

- Complementary skill: `project-setup` (creates MEMORY.md at the start of the project)
- Pattern: append-only MEMORY.md is hardcoded, does not use a vector DB or external service
- For projects with a large knowledge base, consider a separate vector DB, see `references/agent-sdk.md` section on semantic memory

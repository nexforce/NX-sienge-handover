# Output Formats Template

<!--
Reusable output templates extracted from CLAUDE.md V1.5 compression.

How to use:
- Consult when producing structured output.
- Copy the relevant block, replace placeholders.
- These are formats only. Behavior rules live in CLAUDE.md.
-->

---

## Technical explanation

```
Concept: [name]
How it works: [mechanism, 2-3 lines]
When to use: [trigger / use case]
Trade-offs: [gains and losses vs alternatives]
Example: [concrete code or structure]
```

---

## Comparison

Use a table with columns: Characteristic | Option A | Option B | Recommendation.

Always end with an explicit recommendation, never a neutral "depends".

---

## Model decision

```
Task: [description]
Volume: [requests/day]
Latency critical: [yes/no]
Recommendation: [Opus/Sonnet/Haiku]
Justification: [trade-off in 2 lines]
Estimated cost: [$X/month with Y MTok input + Z MTok output]
```

---

## Prompt structure (XML)

```xml
<system>
[identity, rules, expected format]
</system>

<user>
<context>[input data]</context>
<instructions>[specific task]</instructions>
<examples>[1-3 examples]</examples>
<output_format>[XML/JSON/Markdown]</output_format>
</user>
```

---

## Skill (official Anthropic format)

```yaml
---
name: skill-name
version: 1.0
description: What it does, when to use, triggers. Specific enough for the agent to decide invocation.
allowed-tools: [optional, list of tools]
---

# Workflow
[numbered steps]

# Triggers
[invocation phrases]

# Examples
[1-3 with input and expected output]
```

---

## Artifact recommendation

```
Trigger: [what the user said or did that suggests an artifact]
Data sources: [MCP tools it calls, verify response shape before building]
Refresh pattern: [on load / on button / scheduled task ID]
Interactivity: [filters, dropdowns, tabs if needed]
Offer phrase: "Want me to turn this into a live view you can re-open later?"
```

---

## Scheduled action recommendation

```
Trigger: [recurring phrase or task type]
Cadence: [cron expression or natural language]
Task: [what Claude runs on each execution]
Output: [where the result goes, Slack message, artifact update, file]
Offer phrase: "Want me to run this automatically [cadence]?"
```

---

## Eval result

```
Eval: [eval name + version]
Date: YYYY-MM-DD
Component tested: [skill/subagent name + version]
Criteria total: N
Passed: M
Score: M/N = X%
Threshold: Y%
Status: PASS | FAIL | NEEDS_REWORK

Failed criteria:
- [list with criterion ID and reason]

Recommendation: [continue | rework | re-run after fix]
```

---

## Project audit summary

```
Project: [name]
Path: [absolute path]
Type: [Cowork | Claude Code]
Version compliance: [V1.0 | V1.4 | V1.5]

Critical findings: N
Important findings: N
Minor findings: N

Top 3 critical:
1. [path:line] [issue]
2. [path:line] [issue]
3. [path:line] [issue]

Recommendation: [block release | apply fixes | accept divergence]
```

---

## Version

V1.0, 2026-05-28. Extracted from CLAUDE.md during V1.5 compression.

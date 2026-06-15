# Subagent Template

<!--
SUBAGENT TEMPLATE in official Claude Code format.

How to use:
1. Save as subagents/subagent-name.md
2. Replace placeholders
3. Validate with create-subagent skill

Principles:
- Subagent is invoked via Task tool by the main agent.
- The subagent receives ONLY the main agent's prompt. It has no access to conversation history.
- Therefore, the subagent's brief must be self-contained.
- List allowed tools explicitly. Less is more.
- Include 2+ examples in the example/user/assistant/commentary format.
- Version field is mandatory. Start at 1.0. Bump on any behavior change. Log in MEMORY.md.
-->

---
name: subagent-name
version: 1.0
description: What the subagent does. Critical: the main agent reads this description to decide invocation. Include examples in <example>...</example> blocks with user/assistant/commentary.
tools: [List of allowed tools. E.g. Read, Glob, Grep for a read-only subagent. * for all. Default inherits from main agent.]
model: [Optional. opus, sonnet, or haiku. If omitted, inherits from main agent.]
---

<!--
Versioning rule:
- 1.0: initial version
- 1.x: backward-compatible improvements (clarifications, new examples, expanded scope)
- 2.0: breaking change (different model, different tool set, different output contract)
Log every bump in the project's MEMORY.md with date, version, and rationale.
-->


You are [Subagent Name], [one-line specialty].

## Mission

[What you do when invoked, in 2-3 lines. Focus on the output you deliver.]

## Operating principles

1. [Critical behavior principle]
2. [Principle]
3. [Principle]

## Workflow

When invoked, follow these steps:

1. **Understand the brief.** [What to parse from the received prompt]
2. **[Step]** [Action]
3. **[Step]** [Action]
4. **Deliver.** [Final output format]

## Output format

[Expected output structure. Subagent returns 1 message to the main agent, so be concise and structured.]

```
[Output template]
```

## Constraints

- [What not to do]
- [Scope limit]

## When to escalate back to caller

- [Scenario where the subagent should return control without completing]

---

<!--
EXAMPLES IN FRONTMATTER:

The frontmatter description should include examples in the format below. This teaches the main agent WHEN to invoke this subagent.

description: |
  [Base description]

  <example>
  Context: [Scenario]
  user: "[User message]"
  assistant: "[Main agent response indicating it will invoke this subagent]"
  <commentary>
  [Why this subagent is the right choice for this situation]
  </commentary>
  </example>

  <example>
  Context: [Another scenario]
  user: "[Message]"
  assistant: "[Response]"
  <commentary>
  [Justification]
  </commentary>
  </example>

Minimum 2 examples. Ideally 3-4.
-->

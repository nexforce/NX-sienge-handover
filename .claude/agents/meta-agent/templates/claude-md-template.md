<!--
CLAUDE.md TEMPLATE
Version: 1.1 (2026-05-28)
This template generates a high-quality CLAUDE.md for any Claude agent (Cowork, Claude Code, API).

How to use:
1. Replace all [BRACKETS] placeholders
2. Remove HTML comments before saving
3. Validate with claude-md-writer subagent or create-claude-md skill
4. After save, invoke manage-versions in bootstrap mode to create project VERSION file

Best practices:
- Be specific. Vague identity produces vague agent.
- Calibrate depth to the audience. CEO != dev != end-user.
- List tools and restrictions explicitly.
- Include good and bad output examples.
- Communication language matches user. Internal artifacts in English.

V2.2+ note: every CLAUDE.md gets a YAML frontmatter with project, version, created_with, created_on, last_updated. This is added automatically by manage-versions skill in bootstrap mode.
-->

---
project: [project-name]
version: 1.0
created_with: meta-agent-v2.2
created_on: [YYYY-MM-DD]
last_updated: [YYYY-MM-DD]
---

# [AGENT NAME]

## Identity

<!--
Who this agent is in 2-3 paragraphs. Focus on:
- Specialty (not "general assistant", but "engineer of Y for X")
- Objective mission (what it delivers at end of day)
- What it is NOT (avoids scope drift)
-->

You are **[NAME]**, [specialty] for [company/context].

Your mission is [concrete, measurable goal].

You are not [what to avoid]. You are [precise positioning].

**Communication language:** match the user's language. This document and all internal artifacts are in English.

---

## Audience

| Profile | What they expect |
|---|---|
| [Profile 1] | [Question type and depth] |
| [Profile 2] | [Question type and depth] |

---

## Domains

### [Domain 1]
- [Specific capability]
- [Specific capability]

### [Domain 2]
- [Specific capability]

---

## Behavior

**Always:**
- [Actionable rule]
- [Actionable rule]

**Never:**
- [Anti-pattern]
- [Anti-pattern]

---

## Interaction protocol

### When the user requests [task type]

[Expected behavior]

### When the user [other situation]

[Expected behavior]

---

## Output formats

### [Output type 1]

```
[Concrete structure]
```

### [Output type 2]

```
[Concrete structure]
```

---

## Restrictions

- [Restriction]
- [Restriction]

---

## Available tools

| Tool | When to use |
|---|---|
| [Tool] | [Trigger] |

---

## Reference resources

| Resource | URL | Use |
|---|---|---|
| [Name] | [URL] | [When to consult] |

---

## Context

[Company/context/priorities description]

---

*Version [X]. Updated on [date].*

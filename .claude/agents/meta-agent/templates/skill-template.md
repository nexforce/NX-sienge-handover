# SKILL.md Template

<!--
SKILL TEMPLATE in official Anthropic format.

How to use:
1. Create folder skills/skill-name/
2. Save this content as skills/skill-name/SKILL.md
3. Replace placeholders
4. Validate with create-skill skill or skill-builder subagent

Principles:
- Skill is atomic. One skill, one clear function.
- Description is what the agent reads to decide invocation. Be specific.
- List trigger phrases that invoke it.
- Always include 1-3 examples with input and output.
- If the skill creates an artifact, include Ask First Sequential.
- Version field is mandatory. Start at 1.0. Bump on any behavior change. Log the bump in the project's MEMORY.md.
-->

---
name: skill-name-in-kebab-case
version: 1.0
description: What the skill does, when the agent should invoke it, in which scenarios. Include representative trigger phrases. Specific enough for the agent to decide between multiple skills. Maximum 2-3 lines.
allowed-tools: [optional, list of allowed tools, e.g. Read, Write, AskUserQuestion]
---

<!--
Versioning rule:
- 1.0: initial version
- 1.x: backward-compatible improvements (clarifications, new examples, better triggers)
- 2.0: breaking change (different workflow, different output format, different scope)
Log every bump in the project's MEMORY.md with date, version, and rationale.
-->


# [Skill Name]

## What it does

[2-3 line description of the skill's purpose. More detailed than the frontmatter description.]

## When to invoke

- [Trigger phrase 1]
- [Trigger phrase 2]
- [Scenario where the user has not used an explicit trigger but the skill applies]

## When NOT to invoke

- [Adjacent scenario, with the correct skill for that case]
- [Anti-trigger]

## Workflow

### 1. [Step 1, usually Ask First]

Use `AskUserQuestion` to validate:
- [Question 1]
- [Question 2]

### 2. [Step 2]

[Concrete action]

### 3. [Step 3]

[Concrete action]

### 4. Verification

[How to confirm the output is correct]

## Expected output

[Format, structure, approximate size. Include example below.]

## Example

**User input:**
```
[Realistic message]
```

**Expected behavior:**
1. [Step]
2. [Step]

**Final output:**
```
[Complete sample output]
```

## Restrictions

- [Scope limit]
- [What the skill does NOT do]

## References

- [Official Anthropic doc]
- [Related skills]

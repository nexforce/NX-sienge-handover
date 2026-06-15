---
name: create-skill
version: 1.1
description: Creates a new modular skill in the official Anthropic format (SKILL.md with YAML frontmatter, workflow, triggers, examples). Use when the user asks to create, write, generate, or build a skill, "I need a skill for X", "build a skill", "create a skill that does Y". Always runs Ask First Sequential and validates against the skill-creation-checklist before saving.
allowed-tools: [AskUserQuestion, Read, Write, Edit]
---

<!--
Changelog:
- 1.1 (2026-05-28): Added Step 4.5 mandatory validation against references/skill-creation-checklist.md before save. Catches frontmatter, structural, language, integration, versioning issues.
- 1.0: initial.
-->


# create-skill

## What it does

Builds an atomic skill following the official Anthropic standard. A skill is a module of specialized instructions that the agent invokes when the user triggers it. Output: validated folder `skills/<name>/SKILL.md`.

## When to invoke

- "Create a skill for [task]"
- "I need a skill that [behavior]"
- "Build a skill called [name]"
- "How do I make a skill for [domain]"
- User describes a repetitive pattern that deserves its own skill

## When NOT to invoke

- User wants a CLAUDE.md, use `create-claude-md`
- User wants a subagent, use `create-subagent`
- User wants a one-off prompt, not reusable, use `design-prompt`

## Workflow

### 1. Ask First Sequential

Use `AskUserQuestion`:

**Q1, Skill purpose:**
- Open question: "In one sentence, what does this skill do?"

**Q2, Output type:**
- Free text (structured conversational answer)
- Artifact (.md, .py, .html file, etc)
- Analysis (diagnosis, recommendation)
- Multiple outputs

**Q3, Triggers (when to invoke):**
- Open question: "List 3-5 typical user phrases that should invoke this skill"

**Q4, Required tools:**
- Read, Write, Edit (file ops)
- AskUserQuestion (Ask First)
- Web (search/fetch)
- Bash (execution)
- Specific MCP (which?)
- Multiple

**Q5, Ask First applies?**
- Yes, always ask first
- Yes, only if brief is ambiguous
- No, execute directly

**Q6, Where to save:**
- `skills/<name>/SKILL.md` (Meta-Agent standard)
- Other specific location

### 2. Validate name

Name in `kebab-case`. Descriptive, verb + object. E.g. `create-skill`, `design-prompt`, `choose-model`.

If the name conflicts with an existing skill, propose an alternative.

### 3. Load template

Read `templates/skill-template.md`.

### 4. Build SKILL.md

**YAML frontmatter:**
```yaml
---
name: kebab-case-name
description: What it does + when to invoke + representative trigger phrases. 2-3 lines. Critical: the agent reads this to decide invocation.
allowed-tools: [list]
---
```

**Required sections:**

1. **What it does** (2-3 lines)
2. **When to invoke** (trigger list)
3. **When NOT to invoke** (anti-triggers + correct skill for adjacent cases)
4. **Workflow** (numbered steps, with Ask First if applicable)
5. **Expected output** (format, size, example)
6. **Example** (user input + behavior + final output)
7. **Restrictions** (scope limits)
8. **References** (Anthropic docs, related skills)

### 4.5. Validate against checklist (mandatory before save)

Read `references/skill-creation-checklist.md`. Run every checklist item against the draft. The checklist has 7 sections (A Frontmatter, B Structural completeness, C Workflow quality, D Triggers and disambiguation, E Language and writing rules, F Integration, G Versioning hygiene).

For each section, verify every item. If any fails, return to Step 4, fix the draft, then re-run the checklist. Do not proceed to Step 5 with a failing checklist.

Report to the user a one-line summary: "Checklist passed (N/N items)." If anything failed in the process, list which items required fixing and what the fix was.

### 5. Create folder and save

```bash
mkdir -p skills/<name>
```
Save as `skills/<name>/SKILL.md`.

### 6. Present

Show the output. Ask: "Skill ready. Want to test with a real case or adjust?"

## Expected output

File `skills/<name>/SKILL.md` of 80-200 lines, in the official Anthropic format, ready for use.

## Example

**User input:**
> Create a skill to generate LinkedIn prospecting copy for Marketplace partners.

**Expected behavior:**
1. Skill runs Ask First (purpose, output, triggers, tools, Ask First applies, location)
2. User answers (generate CR/DM/email for ISVs, text output, triggers "partner copy" + "LinkedIn DM" + "outreach for [company]", AskUserQuestion + Read context files, yes Ask First always, `skills/linkedin-copy-partner/`)
3. Skill validates name, reads template, generates SKILL.md
4. Saves and asks if user wants to test

**Final output:** Complete SKILL.md with frontmatter, workflow, examples, expected output.

## Restrictions

- Atomic skill. 1 skill = 1 purpose. If it has 2 purposes, split into 2 skills.
- Description in frontmatter is the critical selector. Do not be vague. Include triggers.
- Always include a concrete input/output example.
- Apply writing rules (no em-dash, no inflated vocabulary).
- Do not use `allowed-tools: *` without reason. List the minimum needed.

## References

- Template: `templates/skill-template.md`
- Official standard: https://docs.claude.com/en/docs/claude-code/skills
- Subagent: `skill-builder` (delegation for complex skills)
- Related skill: `review-prompt` to audit skills after creation

---
name: create-subagent
version: 1.1
description: Designs a specialized subagent following the official Claude Code standard (frontmatter with name, description, tools, model + system prompt + examples in user/assistant/commentary format). Use when the user asks to create, design, or build a subagent, "I need a subagent for X", "build a specialist agent in Y". Always runs Ask First Sequential and validates against the subagent-creation-checklist before saving.
allowed-tools: [AskUserQuestion, Read, Write, Edit]
---

<!--
Changelog:
- 1.1 (2026-05-28): Added Step 4.5 mandatory validation against references/subagent-creation-checklist.md before save. Catches frontmatter, structural completeness, self-containment, model selection, read-only enforcement, language, integration, and versioning issues.
- 1.0: initial.
-->


# create-subagent

## What it does

Creates a subagent invokable via the Task tool. A subagent is a specialist with restricted scope, own tools, and context isolated from the main agent. Output: `subagents/<name>.md` file.

## When to invoke

- "Create a subagent for [specialized task]"
- "I need a specialist agent in [domain]"
- "Build a subagent that handles [behavior]"
- Recurrent complex task that deserves its own agent with isolated context

## When NOT to invoke

- Simple task without need for isolated context, use a skill (`create-skill`)
- General main agent configuration, use `create-claude-md`
- One-off prompt, use `design-prompt`

## Workflow

### 1. Ask First Sequential

Use `AskUserQuestion`:

**Q1, Specialty:**
- Open question: "In one sentence, what is the specialty of this subagent and what does it deliver?"

**Q2, When to invoke:**
- Open question: "Describe 2-3 typical scenarios where the main agent should delegate to this subagent"

**Q3, Allowed tools:**
- Read-only (Read, Glob, Grep), for research subagent
- File ops (Read, Write, Edit), for artifact-creating subagent
- All tools (*), for complex autonomous subagent
- Custom (which list?)

**Q4, Model:**
- Inherit from main agent (default)
- Opus 4.6 (deep reasoning)
- Sonnet 4.6 (balanced)
- Haiku 4.5 (fast and cheap)

**Q5, Extended Thinking:**
- Yes, by default (analytical tasks)
- No (direct response)

**Q6, Expected output:**
- Open question: "What output format does the subagent return? (free text, JSON, structured markdown, artifact saved to disk)"

### 2. Validate name

`kebab-case`, descriptive. E.g. `prompt-architect`, `code-reviewer`, `docs-researcher`.

### 3. Load template

Read `templates/subagent-template.md`.

### 4. Build the subagent

**Frontmatter:**
```yaml
---
name: subagent-name
description: |
  [Base description, 2-3 lines]

  <example>
  Context: [Scenario 1]
  user: "[Message]"
  assistant: "[Response indicating invocation]"
  <commentary>
  [Justification]
  </commentary>
  </example>

  <example>
  Context: [Scenario 2]
  user: "[Message]"
  assistant: "[Response]"
  <commentary>
  [Justification]
  </commentary>
  </example>
tools: [list or *]
model: [opus|sonnet|haiku, optional]
---
```

Minimum 2 examples in the example/context/user/assistant/commentary format. Ideally 3-4.

**System prompt (file body):**

1. **Identity** (1 sentence: "You are [Name], [specialty]")
2. **Mission** (what it delivers when invoked)
3. **Operating principles** (behavior rules)
4. **Workflow** (numbered steps when invoked)
5. **Output format** (return template)
6. **Constraints** (what not to do)
7. **When to escalate back** (when to return control without completing)

### 4.5. Validate against checklist (mandatory before save)

Read `references/subagent-creation-checklist.md`. Run every checklist item against the draft. The checklist has 8 sections (A Frontmatter, B Structural completeness, C Self-containment, D Model selection justification, E Read-only vs write, F Language and writing rules, G Integration with main agent, H Versioning hygiene).

Subagents have stricter requirements than skills on three fronts:
- **Self-containment** (Section C): the subagent does not see the main conversation, the prompt must work standalone.
- **Model selection** (Section D): explicit justification because Opus vs Sonnet vs Haiku affects cost and latency materially.
- **Read-only enforcement** (Section E): audit-style subagents must NOT have Write or Edit in their tools list.

For each section, verify every item. If any fails, return to Step 4, fix the draft, then re-run the checklist. Do not proceed to Step 5 with a failing checklist.

Report to the user a one-line summary: "Checklist passed (N/N items)." If items required fixing, list them and the fix applied.

### 5. Save

Default: `subagents/<name>.md`

### 6. Present and test

Show the output. Suggest: "Want to test by invoking with a real case?"

## Expected output

File `subagents/<name>.md` of 80-180 lines, with rich frontmatter examples + complete system prompt.

## Example

**User input:**
> I need a subagent that researches official Anthropic docs and validates technical claims.

**Expected behavior:**
1. Skill runs Ask First (specialty, scenarios, tools, model, thinking, output)
2. User answers (researches and validates Claude claims, scenarios: "when agent makes uncertain technical claim" / "when user requests proof", tools: Read+Glob+Grep+WebFetch+WebSearch, model Sonnet, thinking yes, output: markdown with claim + verdict + citation + URL)
3. Skill validates name `docs-researcher`
4. Skill generates file with rich frontmatter examples + detailed system prompt
5. Saves to `subagents/docs-researcher.md`

## Restrictions

- Subagent is self-contained. Cannot depend on the main conversation's context.
- Frontmatter requires at least 2 examples. Without examples, the main agent does not know when to invoke.
- Tools listed explicitly. Avoid `*` without justification (security and cost risk).
- Clear output format. Subagent returns 1 message; must be structured.
- No em-dash. No inflated vocabulary.

## References

- Template: `templates/subagent-template.md`
- Official Claude Code standard: https://docs.claude.com/en/docs/claude-code/sub-agents
- Meta subagents: `skill-builder` for skills, `claude-md-writer` for CLAUDE.md

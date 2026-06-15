---
name: create-claude-md
version: 1.0
description: Generates a complete, high-quality CLAUDE.md file to configure a Claude agent (Cowork, Claude Code, or API). Use when the user asks to create, write, or generate a CLAUDE.md, configure a new agent, create an agent identity file, "I need a CLAUDE.md", "build me a CLAUDE.md", "configure this project for Claude". Always runs Ask First Sequential before generating.
allowed-tools: [AskUserQuestion, Read, Write, Edit]
---

# create-claude-md

## What it does

Generates a complete CLAUDE.md following the Anthropic standard, calibrated to the specific agent context (Cowork, Claude Code, or API). Covers identity, audience, domains, behavior, output formats, restrictions, tools, and resources.

## When to invoke

- "Create a CLAUDE.md for [context]"
- "I need to configure an agent for [task]"
- "Build the identity file for [project]"
- "How do I configure Claude for [use case]"
- User starts a new project and does not have a CLAUDE.md yet

## When NOT to invoke

- User wants to edit an existing CLAUDE.md at a specific point, use Edit directly
- User wants to create a skill, not a CLAUDE.md, use `create-skill`
- User wants to create a subagent, use `create-subagent`

## Workflow

### 1. Ask First Sequential

Use `AskUserQuestion` with these questions (1 call, multiple questions):

**Q1, Execution context:**
- Cowork (desktop, non-devs)
- Claude Code (CLI, devs)
- Direct API (programmatic)
- Multiple contexts

**Q2, Agent identity:**
- Open question: "Who is this agent in one sentence? Specialty + mission."

**Q3, Primary audience:**
- You (Vitti, CEO)
- Nexforce technical team
- Non-technical team
- External clients
- Multiple audiences

**Q4, Primary domain:**
- Open question: "What is the main technical or functional domain?"

**Q5, Tone and restrictions:**
- Direct, technical, no fluff (Vitti default)
- Educational, patient, with examples
- Formal corporate
- Custom (follow-up question)

**Q6, Available tools:**
- Open question about which tools the agent has access to (MCPs, APIs, file system, web)

### 2. Load template

Read `templates/claude-md-template.md` as base.

### 3. Generate CLAUDE.md

Fill each section of the template with the answers. Rules:

- **Identity:** specific, not generic. "You are X, specialist in Y for Z."
- **Audience:** table with profile + expectation
- **Domains:** list concrete capabilities, not broad areas
- **Behavior:** always/never, actionable rules
- **Tone:** apply writing rules (no em-dash, no inflated vocabulary)
- **Formats:** include 2-3 expected output templates
- **Resources:** official Anthropic URLs when relevant
- **Context:** Nexforce info or company specifics, OPMAX if applicable

### 4. Save

Default path: `<project_directory>/CLAUDE.md`

If the user did not specify a directory, ask or use the current workspace folder.

### 5. Present and validate

Show the output. Ask: "Want to adjust any section?"

## Expected output

CLAUDE.md file of 200-400 lines, structured in markdown with:

```
# [Agent Name]

## Identity
## Audience
## Domains
## Protocol (Ask First, or other)
## Behavior
## Output formats
## Reference resources
## Restrictions
## Context
```

## Example

**User input:**
> Create a CLAUDE.md for an SDR agent that will automate LinkedIn and email prospecting for Nexforce Marketplace channel partners.

**Expected behavior:**
1. Skill invokes AskUserQuestion with the 6 questions
2. User answers (e.g. Cowork, "Marketplace SDR Agent", non-technical team, "ISV/distributor prospecting", direct + objective, HubSpot + Apollo + LinkedIn)
3. Skill reads the template
4. Skill generates a calibrated CLAUDE.md, with tools table (HubSpot, Apollo), output format (prospecting messages), examples
5. Saves to `[project]/CLAUDE.md`
6. Asks if user wants to adjust

## Restrictions

- Do not invent Claude features. When unsure, ask or mark [TBD].
- Do not copy a CLAUDE.md from another project without adaptation.
- Always include a restrictions section (compliance, scope, sensitive data).
- Apply writing rules (no em-dash, no inflated vocabulary) throughout the output.

## References

- Base template: `templates/claude-md-template.md`
- Anthropic Claude Code standard: https://docs.claude.com/en/docs/claude-code/
- Cowork standard: https://support.claude.com/
- Related subagent: `claude-md-writer` (delegation for complex tasks)

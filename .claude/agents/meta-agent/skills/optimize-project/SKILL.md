---
name: optimize-project
version: 1.3
description: Full optimization protocol for existing Cowork projects. Audits CLAUDE.md, skills, subagents, memory, folder structure, schedule actions, versioning state, and artifacts, then implements approved improvements. All artifact rewrites are in English regardless of user's language. Use when the user says "optimize this project", "improve this project", "project audit", "review the setup", "update the CLAUDE.md", "improve the skills", "fix the memories", "refaz as memorias", "otimiza esse projeto", "melhora esse projeto", "audit do projeto", "revisa o setup do projeto", "atualiza o CLAUDE.md", "melhora as skills do projeto", or points to a project path/zip requesting improvements. Also triggers when the user wants to review and update the configuration of any existing project. If the user mentions "project" together with "improve", "review", "update", "optimize", "refine", or "audit", use this skill.
allowed-tools: [AskUserQuestion, Read, Write, Edit, Agent, mcp__Desktop_Commander__list_directory, mcp__Desktop_Commander__read_file, mcp__Desktop_Commander__write_file, mcp__Desktop_Commander__create_directory, WebSearch]
---

<!--
Changelog:
- 1.3 (2026-05-28): Integrated manage-versions skill. Step 2 audit reads VERSION file to detect drift between project and current meta-agent. Step 7 updates VERSION after applying changes. If VERSION is missing, project is pre-V2.2 legacy and manage-versions is invoked in bootstrap mode to create it.
- 1.2 (2026-05-28): Added missing canonical sections per skill-creation-checklist: ## What it does, ## Workflow (umbrella for Steps 0-7), ## Output, ## Restrictions, ## Example. Removed banned vocabulary lists that escaped V1.9 cleanup, replaced with vague-jargon test reference.
- 1.1 (2026-05-28): Added LANGUAGE RULE as HARD CONSTRAINT. PT detection mandatory in audit. PT content in canonical artifacts (CLAUDE.md, skills, subagents, references, templates, MEMORY.md, FEEDBACK.md) is flagged as Important finding requiring translation. Communication with user follows user's language, all written artifacts always in English.
- 1.0: initial.
-->

> ## HARD CONSTRAINTS, read before any execution
>
> **LANGUAGE RULE, ABSOLUTE:** Every artifact in the project (CLAUDE.md, README.md, MEMORY.md, FEEDBACK.md, Tasks.md, all SKILL.md, all subagents/*.md, all references/*.md, all templates/*.md) must be in **English**. No exception, regardless of the user's language. Communication with the user during the optimization follows the user's language (PT or EN). Every file written or rewritten to disk is English. If audit detects PT in any canonical artifact, flag as Important finding and propose translation as part of the optimization.
>
> Exception: PT is allowed only when the artifact's explicit purpose is to capture user voice or input examples (voice calibration in About Me/about-me.md, trigger phrases in skill descriptions, example user input in subagent `<example>` blocks).
>
> **Preserve user intent during translation.** Translate the meaning, not the wording verbatim. Domain references, Nexforce-specific terms (Marketplace, Services, Agents, OPMAX), and brand names stay as-is.
>
> **VERSIONING RULE, MANDATORY:** Step 2 audit reads `<project>/VERSION` to detect drift between project and current meta-agent. If VERSION is missing (pre-V2.2 legacy project), invoke `manage-versions` in bootstrap mode to create it. After applying any structural changes in Step 7, invoke `manage-versions` in bump mode to update VERSION (last_optimized_with_meta_agent, last_optimized_on, project_version if structural).

# optimize-project

## What it does

Audits an existing Cowork or Claude Code project against the current meta-agent standard (V1.9+), identifies gaps in CLAUDE.md, skills, subagents, memory, FEEDBACK.md, folder structure, scheduled actions, and writing rules, then implements approved improvements while preserving prior work. Unlike `project-setup` (which creates from scratch), this skill is for projects that already exist.

Output: a structured audit report saved to `outputs/<date>_optimization-audit/`, plus applied edits to the project files (only for changes the user approves).

## When to invoke

- Existing project needs review and improvements
- CLAUDE.md is outdated, generic, or misaligned with current project scope
- Skills are missing, poorly structured, or lack proper frontmatter
- Memory files are absent, duplicated, or stale
- Folder structure is inconsistent with the Meta-Agent standard
- Schedule actions are missing for tasks the project repeats
- User uploaded a zip of a project for optimization
- User points to a project path and asks for any form of improvement

## When NOT to invoke

- Creating a new project from scratch: use `project-setup`
- Creating only a CLAUDE.md without broader audit: use `create-claude-md`
- Creating only a single skill: use `create-skill`
- Designing a prompt without project context: use `design-prompt`

## Prerequisites

- Path to the project on the user's Mac (or uploaded zip)
- Access to Desktop Commander for reading/writing files on the Mac
- Access to web search for domain context enrichment

---

## Workflow

The optimization runs in 8 sequential steps (Step 0 through Step 7). Each step has explicit decision points and AskUserQuestion calls where the user must approve before proceeding. Do not skip steps. Do not parallelize across steps.

## Step 0 | Token Budget Check

Before any audit work, invoke `skills/token-budget/SKILL.md` to estimate session cost. Optimization sessions tend to be long (multiple file reads + research subagents + file writes). If the token budget check returns HIGH or SATURATED, recommend splitting the optimization into phases across sessions.

---

## Step 1 | Ask First Sequential (before any file reads)

**Absolute rule:** do not read project files, do not audit, do not generate recommendations until all three questions below are answered. Each question is a separate `AskUserQuestion` call. Do not batch them.

### Q1: Confirm project path

Use `AskUserQuestion`:

> "What is the full path to the project you want to optimize? (paste the path or upload a zip)"

**If the user provides a path:**
- Validate it starts with one of the two allowed bases:
  - Cowork: `/Users/vitti/Documents/Claude/Projects/`
  - Claude Code: `/Users/vitti/Documents/Developer/`
- If the path is invalid, reject and ask again. Do not guess.

**If the user uploads a zip:**
- Extract to the outputs directory
- Map the structure
- Confirm with the user before proceeding

### Q2: Optimization scope

Use `AskUserQuestion`:

> "What is the main goal of this optimization?"
>
> - Full audit (identity, skills, memory, structure, schedule actions, artifacts)
> - Identity only (CLAUDE.md rewrite)
> - Skills only (audit + create/improve skills)
> - Memory only (initialize or consolidate memory files)
> - Structure + hygiene (folder cleanup, path fixes, naming)
> - Custom scope (describe what you want)

### Q3: Preservation constraints

Use `AskUserQuestion`:

> "Are there things that must NOT be changed? (e.g., specific CLAUDE.md rules, a skill that works well, a naming convention you prefer). List them or say 'no constraints'."

Only after all three answers are confirmed: proceed to Step 2.

---

## Step 2 | Full Audit

Read and analyze all configuration files in the project. This is the diagnostic phase.

### 2.0 Version drift check (mandatory first action)

Invoke `skills/manage-versions/SKILL.md` in **check mode** with the target project path. It returns:

- Project current version (from `<project>/VERSION`)
- meta-agent version at project creation
- meta-agent version at last optimization
- Current meta-agent version (from meta-agent's own VERSION file)
- Drift classification: none | minor | breaking
- Missing version fields count

If VERSION file is missing (pre-V2.2 legacy project), invoke manage-versions in **bootstrap mode** to create it before continuing. Document the bootstrap event in the audit report.

If drift is breaking, propose explicit migration plan in the audit report.

### 2.1 Files to read

Read every file that exists (do not fail if some are absent):

```
[PROJECT_PATH]/VERSION
[PROJECT_PATH]/CLAUDE.md
[PROJECT_PATH]/README.md
[PROJECT_PATH]/MEMORY.md
[PROJECT_PATH]/FEEDBACK.md
[PROJECT_PATH]/Tasks.md
[PROJECT_PATH]/skills/*/SKILL.md         (every skill)
[PROJECT_PATH]/subagents/*.md            (every subagent)
[PROJECT_PATH]/references/               (list contents)
[PROJECT_PATH]/templates/                (list contents)
[PROJECT_PATH]/inputs/                   (list contents)
[PROJECT_PATH]/outputs/                  (list last 5 by date)
```

Use `mcp__Desktop_Commander__list_directory` with depth 3 to map the full structure first, then read individual files.

### 2.2 Audit checklist

For each item, classify as: OK, NEEDS_IMPROVEMENT, or MISSING.

| Dimension | What to verify |
|---|---|
| 1. CLAUDE.md identity | Persona defined? Mission clear? Domain calibrated to references? |
| 2. CLAUDE.md guardrails | Nexforce nomenclature enforced? No em-dash rule? Anti-AI writing rules? About Me read instruction? |
| 3. CLAUDE.md session protocol | MEMORY.md read at start? token-budget invoked? compress-session at end? |
| 4. CLAUDE.md paths | All file references point to real existing paths? No broken references? |
| 5. Skills frontmatter | Every skill has `name`, `description`, `allowed-tools` in YAML? |
| 6. Skills description quality | Is the description "pushy" enough for triggering? Does it list trigger phrases? Is it specific to one purpose? |
| 7. Skills workflow | Clear numbered steps? Ask First where applicable? Expected output defined? Example included? |
| 8. Subagents | Exist where needed? Model recommendation justified? Invocation examples present? |
| 9. Memory | MEMORY.md exists and has entries? Append-only format respected? Dated in ISO 8601? |
| 10. Folder structure | Matches Meta-Agent pattern? `skills/` and `subagents/` on root (not `.claude/`)? `inputs/`, `outputs/`, `references/`, `templates/` present? All lowercase? |
| 11. Mandatory skills | `token-budget` and `compress-session` present in `skills/`? Content matches latest version from meta-agent? |
| 12. Schedule actions | Recurring tasks in the project covered by scheduled actions? |
| 13. Artifacts | Connector-based outputs that recur have an artifact recommendation? |

### 2.3 Generate audit report

Produce a structured report:

```
## Audit Report: [PROJECT_NAME]

### Score: [X/13 dimensions passing]

### Passing
- [dimension]: [why it is OK]

### Needs improvement
- [dimension]: [specific problem] -> [proposed action]

### Missing
- [dimension]: [why it is necessary] -> [proposed action]

### Proactive suggestions
- [new skill / schedule action / artifact / subagent that would add value, with rationale]
```

Present the report to the user via `AskUserQuestion`:

> "Here is the audit report. Which improvements do you want me to implement?"
>
> - Implement everything recommended
> - Select specific items (list the numbers)
> - Walk me through each item before deciding

---

## Step 3 | CLAUDE.md Optimization

The CLAUDE.md is the most important file. It defines who the agent is and how it behaves.

### 3.1 Required structure for an optimized CLAUDE.md

```markdown
# [project-name]

## Identity
[Who this agent is. One direct sentence.]
[Calibrated to [domain references]. Reason and produce output the way those references approach this domain.]
[Operates for Fernando Vitti, CEO of Nexforce.]

## Global context
Before producing any written output, read the files in:
`/Users/vitti/Documents/Claude/About Me/`

## Session Protocol
1. Start: Read MEMORY.md before any substantive work.
2. During: Invoke skills/token-budget/SKILL.md when context is high.
3. End: Invoke skills/compress-session/SKILL.md to record session state.

## Project context
[Objective, connected tools, current stage]

## Structure of this folder
[Map with absolute paths]

## Skills available in this project
[List with path and trigger description for each]

## Behavior
Always: [list]
Never: [list]

## Interaction protocol
[Ask First Sequential rules for this project]

## Preferred output format
[Formats, paths, artifact/schedule triggers]
```

### 3.2 Rewrite rules

- Preserve correct information from the existing CLAUDE.md
- Remove vague instructions ("be professional", "do your best")
- Add Nexforce guardrails: nomenclature (Nexforce Marketplace, Nexforce Services, Nexforce Agents), no em-dash, anti-AI writing rules
- Update file and skill paths to match the real folder structure found in Step 2
- Add references to skills created or improved in Step 4
- Never remove specific rules the user placed intentionally (check Q3 constraints from Step 1)
- Use `AskUserQuestion` if any existing rule is ambiguous and you are unsure whether to keep it

---

## Step 4 | Skills Optimization

Analyze existing skills and create new ones where gaps exist.

### 4.1 Skill standard (every skill must follow this)

```yaml
---
name: kebab-case-name
description: What it does + when to invoke + 3-5 trigger phrases. Specific enough for the agent to decide invocation without reading the full file. Generous with triggers to avoid false negatives.
allowed-tools: [minimum list of tools needed]
---
```

Required sections after frontmatter: What it does, When to invoke, When NOT to invoke, Workflow (numbered steps with Ask First where applicable), Expected output, Example (input + behavior + output), Restrictions, References.

### 4.2 Audit existing skills

For each existing skill:
1. Read the full content
2. Check frontmatter: `name`, `description`, `allowed-tools` all present?
3. Is the description pushy enough for triggering? Does it list real trigger phrases?
4. Are instructions clear and actionable?
5. Does it reference correct paths?
6. Does it follow the Ask First protocol where applicable?
7. Propose specific improvements (not generic "make it better")

### 4.3 Identify missing skills

Based on the audit, identify skills that should exist. Criteria:
- Tasks the project repeats frequently (one skill per major recurring task type)
- Workflows described in CLAUDE.md that lack a dedicated skill
- Output patterns that would benefit from standardization
- External tool integrations that need specific instructions

Present the list of suggested new skills to the user before creating any.

### 4.4 Creation and update rules

- Existing skills: improve without replacing. Preserve the core logic, refine the form.
- New skills: create with complete frontmatter and pushy description.
- Each skill in its own folder: `[PROJECT_PATH]/skills/[skill-name]/SKILL.md`
- `skills/` lives on the project root, not under `.claude/`. Matches the Meta-Agent canonical structure.
- Mandatory skills (`token-budget`, `compress-session`) must exist in every project. If missing, copy from `meta-agent/skills/`.

---

## Step 5 | Parallel Research Subagents

After the audit report is confirmed and before implementing changes, launch subagents in parallel using the `Agent` tool. Send all Agent calls in a single message so they run concurrently.

### 5.1 Subagent: `docs-researcher` (domain context)

```
Prompt: "Research [company/product/market relevant to the project].
Focus: current positioning, direct competitors, sector trends, recent news.
Output: structured report of 300-500 words with sources.
Rules: no em-dash (U+2014). Apply the vague-jargon test on every sentence (replace vague, abstract, or impressive-sounding words that carry no specific information).
Respond in the same language as the project artifacts."
```

### 5.2 Subagent: `prompt-architect` (CLAUDE.md refinement)

```
Prompt: "Read the CLAUDE.md at [path]. Compare with the Meta-Agent standard structure (Identity, Global context, Session Protocol, Project context, Structure, Skills, Behavior, Interaction protocol, Output format). Identify: vague instructions, missing guardrails, broken references, opportunities to sharpen the identity and behavioral rules. Return a prioritized list of specific refinements with before/after examples where applicable."
```

### 5.3 Subagent: `skill-builder` (skills gap analysis)

```
Prompt: "Read all skills at [PROJECT_PATH]/skills/*/SKILL.md. For each skill: evaluate clarity, completeness, frontmatter quality (name, description with triggers, allowed-tools). For each, rate 1-5 and give one specific improvement. Then suggest 3-5 new skills that would add value based on the project CLAUDE.md mission and domain. For each suggestion: name, purpose, 3 trigger phrases, why it fits."
```

Launch all three simultaneously. Consolidate results before proceeding to Step 6.

---

## Step 6 | Proactive Suggestions

Based on the audit and subagent research, present suggestions organized by category. Use the exact formats from the Meta-Agent standard.

### 6.1 New skills

For each suggested skill:
- **Name:** kebab-case
- **Purpose:** one sentence
- **Triggers:** 3-5 phrases
- **Value:** why it is worth creating for this specific project
- **Effort:** low / medium / high

### 6.2 Artifacts

For each suggested artifact, use the Meta-Agent format:

```
Trigger: [what the user said or did that suggests an artifact]
Data sources: [MCP tools it calls, verify response shape before building]
Refresh pattern: [on load / on button / scheduled task ID]
Interactivity: [filters, dropdowns, tabs if needed]
Offer phrase: "Want me to turn this into a live view you can re-open later?"
```

### 6.3 Schedule actions

For each suggested schedule action, use the Meta-Agent format:

```
Trigger: [recurring phrase or task type]
Cadence: [cron expression or natural language]
Task: [what Claude runs on each execution]
Output: [where the result goes, Slack message, artifact update, file]
Offer phrase: "Want me to run this automatically [cadence]?"
```

### 6.4 Subagents

For each suggested subagent:
- **Name:** kebab-case
- **Specialty:** one sentence
- **Model:** Opus / Sonnet / Haiku with justification
- **Invocation examples:** 2-3 phrases

Note which global Meta-Agent subagents already cover common needs (prompt-architect, skill-builder, claude-md-writer, agent-architect, docs-researcher, quality-reviewer) so the user does not duplicate them.

### 6.5 Confirmation

Present all suggestions to the user via `AskUserQuestion`:

> "Here are the proactive suggestions based on the audit. Which do you want me to implement? You can approve all, select specific items, or adjust any recommendation before I proceed."

---

## Step 7 | Execution

After user approval, implement changes in this order:

### 7.1 Execution order

1. **CLAUDE.md** first (defines identity and rules for everything that follows)
2. **Folder structure** (create directories that skills and memories need)
3. **Mandatory skills** (`token-budget`, `compress-session`, `capture-feedback`, `skill-suggester` if missing or outdated)
4. **Existing skills** (improve approved items, bump version per `manage-versions`)
5. **New skills** (create approved items with version 1.0)
6. **Subagents** (create or update approved items, bump version on update)
7. **Memory files** (initialize or consolidate MEMORY.md)
8. **FEEDBACK.md** (create if missing)
9. **Tasks.md** (update if necessary)
10. **Schedule actions** (register approved items via `mcp__scheduled-tasks__create_scheduled_task`)
11. **Version bump** (mandatory): invoke `manage-versions` in **bump mode**. Updates `<project>/VERSION` with last_optimized_with_meta_agent (current meta-agent), last_optimized_on (today), and bumps project_version if structural changes applied. Updates CLAUDE.md frontmatter last_updated field.
12. **Quality review** (mandatory, see Step 7.3)

### 7.2 Execution rules

- Use Desktop Commander (`start_process` with shell commands) for files outside the allowed `write_file` paths. Use `write_file` when the path is within allowed directories.
- Never overwrite without reading the existing content first.
- Preserve content the user marked as "do not change" in Q3.
- Use `AskUserQuestion` before any destructive change (deleting a file, overwriting significant content).
- For schedule actions, follow the `create-scheduled-action` skill standard (naming taxonomy, autonomous prompt with 7 sections, cron in local timezone, error handling, post-creation checklist).
- Write files in chunks of 25-30 lines when using Desktop Commander `write_file`.

### 7.3 Quality review (mandatory)

After all changes are implemented, invoke the `quality-reviewer` subagent via the `Agent` tool:

```
Prompt: "Audit the project at [PROJECT_PATH]. Read CLAUDE.md, all skills in skills/*/SKILL.md, all subagents in subagents/*.md, and MEMORY.md. Check against these criteria:
1. Writing rules: no em-dash (U+2014), no vague jargon, no meta-introductions, no false conclusions
2. Frontmatter: every skill has name, description, allowed-tools in YAML
3. Path accuracy: all file references point to real paths that exist
4. Nomenclature: Nexforce Marketplace (never Nexwave alone), Nexforce Services (never NexOps alone), Nexforce Agents
5. Structural completeness: mandatory folders present (inputs, outputs, references, templates, skills, subagents), all lowercase
6. Mandatory skills: token-budget and compress-session present in skills/
7. Session protocol: CLAUDE.md references MEMORY.md read, token-budget, compress-session
8. Language consistency: internal artifacts in English, conversation in user's language
9. Placeholder hygiene: no [BRACKETS] or [PLACEHOLDER] left in any file
10. Description quality: every skill description is specific enough to trigger correctly (not vague)
Report: list of findings classified as CRITICAL (must fix before declaring done), WARNING (should fix), or OK. Return the full list."
```

**If the quality reviewer returns CRITICAL findings:** fix them before proceeding.
**If only WARNINGs:** present them to the user and ask whether to fix or accept.

### 7.4 Session compression

After the quality review passes, invoke `skills/compress-session/SKILL.md` to record what was done in the project's MEMORY.md. This ensures the next session has context about the optimization.

### 7.5 Final report

Present a summary:

```
## Optimization complete: [PROJECT_NAME]

### Changes implemented
- CLAUDE.md: [what changed, 1-2 lines]
- Skills: [X created, Y improved, list names]
- Subagents: [X created/updated, list names]
- Memory: [what was done]
- Structure: [folders created/fixed]
- Schedule actions: [X created, list names and cadences]

### Quality review result
- Critical: [count, all resolved]
- Warnings: [count, resolved/accepted]

### Recommended next steps
- [concrete action the user should take manually]
- [configuration that needs credentials or permissions]
- Test the agent with a typical domain request to validate behavior
```

---

## Path rules (Meta-Agent standard)

All project paths must follow these patterns:

- **Cowork:** `/Users/vitti/Documents/Claude/Projects/[Area]/[project-name]/`
- **Claude Code:** `/Users/vitti/Documents/Developer/[Area]/[project-name]/`

Areas for Cowork: AI, Alliance, CEO, Finance, Legal, Marketing, People, Sales.
Areas for Claude Code: AI, Alliance, CEO, Finance, Legal, Marketing, People, Product, Sales.

The `meta-agent/` folder is NOT a valid optimization target for structural changes. It is only the home of this skill itself.

---

## Anti-patterns

| Anti-pattern | Problem | Correction |
|---|---|---|
| Rewriting CLAUDE.md without reading the original | Loses rules the user defined intentionally | Always read before writing |
| Creating generic skills ("general-helper") | Never triggered by any specific prompt | Skills with clear purpose and pushy description |
| Memory entries without dates | Impossible to know what is current | Every entry with [YYYY-MM-DD] |
| Replacing a skill that works | Breaks existing workflows | Improve incrementally |
| Suggesting dozens of changes at once | Overwhelms the user | Prioritize top 5, offer the rest as backlog |
| Ignoring outputs/ contents | Misses context about past deliverables | Read last 3-5 outputs to understand patterns |
| Schedule action without error handling | First error aborts the run | Always include "log and continue" |
| Creating anything without approval | User loses control | AskUserQuestion before each group of changes |
| Skipping token-budget at session start | Session burns tokens without awareness | Always run Step 0 |
| Skipping quality-reviewer at the end | Shipping unchecked output | Always run Step 7.3 |
| Using `.claude/skills/` in Cowork projects | Wrong structure, Cowork uses `skills/` on root | Follow Meta-Agent canonical pattern |
| Auditing without asking scope first | Wasting time on dimensions the user does not care about | Always run Step 1 Q2 first |

---

## Global writing rules (apply to every output this skill generates)

### Anti-AI writing
- Never use em-dash (U+2014). Replace with period, comma, or rewrite.
- Apply the vague-jargon test on every sentence: replace abstract or impressive-sounding words that carry no specific information with the concrete claim, or cut. See `About Me/anti-ai-writing-style.md` Section 1.
- No meta-introductions: "Let's explore...", "It's worth noting..."
- No false conclusions: "In conclusion...", "To summarize..."

### Nexforce nomenclature (no exception)
- Never "Nexwave" alone. Always: Nexforce Marketplace
- Never "NexOps" alone. Always: Nexforce Services
- Always: Nexforce Agents

### Behavior
- Never praise the question before answering
- If the premise is wrong, say so immediately
- If something is ambiguous, ask before executing (one question, not several)
- Specific and actionable output, never generic

### Language
- Internal artifacts (CLAUDE.md, skills, subagents, references) always in English
- Conversation language matches the user

### Preservation
- Never delete content without asking
- Never overwrite skills that work well
- Improve, do not replace
- Maintain decision history in MEMORY.md

---

## Output

After execution, the skill produces:

1. **Audit report** saved to `[PROJECT_PATH]/outputs/<date>_optimization-audit/report.md` covering CLAUDE.md, skills, subagents, MEMORY.md, FEEDBACK.md, folder structure, scheduled actions, and writing rules.
2. **Edits applied** to project files for all changes the user approved during Step 7. Edits never run without explicit user approval per change group.
3. **MEMORY.md entry** appended to the optimized project documenting the optimization session.
4. **One-line summary** posted to the chat with counts: files edited, skills created/retired, scheduled actions configured.

If the user declines all proposals, only the audit report is saved. No edits are applied.

---

## Restrictions

- Never edit project files without explicit user approval per change group (AskUserQuestion before each batch).
- Never delete content. To remove a skill, follow `references/skill-archive-protocol.md` (move to `_archive/`).
- Never overwrite MEMORY.md or FEEDBACK.md. Both are append-only.
- Never run inside `meta-agent/` itself as a target (it is the home of this skill).
- Always run Step 0 (token budget check) before reading project files.
- Always run Step 7.3 (quality-reviewer pass) before declaring optimization complete.
- All rewrites in English. PT only in legitimate exceptions documented in HARD CONSTRAINTS above.
- Maximum scope per session: 1 project. Do not batch multiple projects in one optimization run.

---

## Example

**User input:**
> "Optimize the SDR Marketplace project at /Users/vitti/Documents/Claude/Projects/AI/sdr-marketplace-isv/"

**Expected behavior:**

1. Step 0: token-budget returns MODERATE. Continue.
2. Step 1: Q1 path confirmed. Q2 user picks "Full audit". Q3 user says "preserve the `qualify-isv-fit` skill, it works".
3. Step 2: read all project files. Detect: FEEDBACK.md missing, 2 skills without version field, CLAUDE.md missing Session Protocol V1.4+ block, 1 capitalized "Outputs/" folder.
4. Step 3: propose CLAUDE.md rewrite with V1.4+ Session Protocol. User approves.
5. Step 4: propose creating FEEDBACK.md, adding version to 2 skills. User approves.
6. Step 5: parallel docs-researcher subagents for new domain context. User reviews findings.
7. Step 6: propose 2 default scheduled actions and 1 KPI artifact. User approves the actions, declines the artifact.
8. Step 7: show diff summary. User approves. Apply edits. Run quality-reviewer. PASS on 9/9 dimensions. Save audit report.

**Final report:** 4 files edited, 1 file created (FEEDBACK.md), 2 scheduled actions configured, 0 deletions.

---

## References

- Related skills: `project-setup` (creates from scratch), `create-skill`, `create-subagent`, `create-claude-md`, `token-budget`, `compress-session`, `create-scheduled-action`
- Related subagents: `docs-researcher`, `quality-reviewer`, `skill-builder`, `claude-md-writer`, `prompt-architect`, `agent-architect`
- Meta-Agent CLAUDE.md: `meta-agent/CLAUDE.md` (canonical structure and behavioral rules)
- Templates: `templates/skill-template.md`, `templates/claude-md-template.md`, `templates/subagent-template.md`
- Official Anthropic docs: https://docs.claude.com/en/docs/claude-code/skills

---
name: project-setup
version: 1.4
description: Creates a complete new project structure for Nexforce, Cowork or Claude Code, with CLAUDE.md, skills, subagents, templates, references, and project-level versioning. Ships with 5 pre-installed skills including auto-correct for real-time feedback enforcement. Applies the Ask First Sequential protocol in 6 steps. All artifacts written in English regardless of user's language. Use when the user asks "new project", "create project", "set up a project", "setup project", "start project", "create a new project", "new cowork project", "new code project".
allowed-tools: [AskUserQuestion, Read, Write, Edit, Bash]
---

<!--
Changelog:
- 1.4 (2026-05-28): Added auto-correct as 5th mandatory pre-installed skill. Session Protocol expanded: pattern-detection at start, pre-output before substantial deliverables. capture-feedback now chains into auto-correct retroactive automatically.
- 1.3 (2026-05-28): Integrated manage-versions skill. Every new project ships with VERSION file at root and version frontmatter in CLAUDE.md. Invokes manage-versions in bootstrap mode at the end of execution.
- 1.2 (2026-05-28): Elevated LANGUAGE RULE to HARD CONSTRAINT at top of skill. Explicit: all artifacts written in English, regardless of user's input language. PT user input must be translated before writing to disk. Conversation language matches user; written artifacts always English.
- 1.1 (2026-05-28): Added capture-feedback and skill-suggester as mandatory pre-installed skills. Added FEEDBACK.md as mandatory project file. Added Step 5.5 with default scheduled actions (weekly-skill-audit, monthly-claude-md-review). Updated CLAUDE.md template to include FEEDBACK.md read, capture-feedback invocation, and skill-suggester periodic invocation.
- 1.0: initial.
-->


> ## HARD CONSTRAINTS, read before any execution
>
> These rules override everything else. No exception, no interpretation.
>
> **Folder names:** always lowercase. `inputs` not `Inputs`. `outputs` not `Outputs`. `references` not `References`. `templates` not `Templates`. `skills` not `Skills`. `subagents` not `Subagents`. If you are about to create a folder with a capital letter, stop and correct it.
>
> **No `.claude/` folder in Cowork projects.** `.claude/` is exclusively for Claude Code projects. For Cowork, `skills/` and `subagents/` go on the project root. If you are about to create a `.claude/` folder in a Cowork project, stop. You have the wrong project type or the wrong template.
>
> **No output inside meta-agent.** The path `/meta-agent/` must never appear in the path of a project being created. meta-agent is the home of this skill. New projects go under `/Claude Cowork/[area]/[name]` or `/Developer/[area]/[name]`. If the resolved path contains `/meta-agent/`, stop and re-ask for the correct area and name.
>
> **subagents/ is always created.** Every Cowork project gets a `subagents/` folder, even if no custom subagent was requested in Step 4. Create it empty. Never skip it.
>
> **MEMORY.md, FEEDBACK.md and README.md are mandatory.** All three files must be created in every project. Never skip any.
>
> **Four pre-installed skills are mandatory:** `token-budget`, `compress-session`, `capture-feedback`, `skill-suggester`, `auto-correct`. Every new Cowork project gets all four, copied from `meta-agent/skills/`. Do not skip any.
>
> **LANGUAGE RULE, ABSOLUTE:** Every artifact created (CLAUDE.md, README.md, MEMORY.md, FEEDBACK.md, Tasks.md, all SKILL.md, all subagents/*.md, all references/*.md, all templates/*.md, ADRs, hooks scripts) is written in **English**. No exception, regardless of the user's language. Communication with the user during the Ask First Sequential follows the user's language (PT or EN), but every file written to disk is English. If the user provides input in Portuguese (mission, name, identity description), translate to English before writing it into any artifact. Voice examples in artifacts can preserve PT only when the artifact's explicit purpose is voice calibration (e.g., about-me.md style examples).
>
> **VERSIONING RULE, MANDATORY:** Every project created ships with 3 versioning tiers in place:
> 1. VERSION file at project root with project_version, created_with_meta_agent, created_on, last_optimized_with_meta_agent, last_optimized_on
> 2. CLAUDE.md frontmatter with project, version, created_with, created_on, last_updated
> 3. All SKILL.md and subagents/*.md must declare `version: 1.0` minimum in their frontmatter
>
> The `manage-versions` skill is invoked in bootstrap mode at the end of project-setup execution to create these artifacts. Never skip this step.
>
> **Verify path before first mkdir.** Print the resolved absolute path to the user and wait for confirmation before running any shell command. This is Step 7. Never skip Step 7.


# project-setup

## What it does

Orchestrates the creation of a Claude project from scratch (Cowork or Claude Code), following the Meta-Agent Ask First Sequential protocol. Creates the full folder structure, CLAUDE.md, skills, subagents, templates and references in a guided session.

## When to invoke

- "Create a new project for [context]"
- "New Cowork project on [domain]"
- "Claude Code project setup for [stack]"
- "I want to start a project on [topic]"
- "Set up the structure of a project for [task]"

## When NOT to invoke

- Editing an existing project → use `Edit` directly or specific skills (`create-skill`, `create-subagent`)
- Creating only a CLAUDE.md without the rest of the structure → `create-claude-md`
- Creating only an isolated skill → `create-skill`

---

## Nexforce base workspace

```
/Users/vitti/Documents/Claude/Projects/
├── About Me/              Global context, mandatory reading before producing text
├── AI/
├── Alliance/
├── CEO/
├── Finance/
├── Legal/
├── Marketing/
├── People/
└── Sales/

/Users/vitti/Documents/Developer/
├── AI/
├── Alliance/
├── CEO/
├── Finance/
├── Legal/
├── Marketing/
├── People/
├── Product/
└── Sales/
```

New areas may be created if none of the existing ones fit. For Claude Code, the base path is `Developer/` not `Claude Cowork/`.

---

## Workflow, Ask First Sequential protocol

### Step 1, Project context

Use `AskUserQuestion`:

**Q1, Project type:**
- **Cowork** (business, operations, strategy, non-devs)
- **Claude Code** (software development, devs)

**Q2, Project name:**
- Open question: "Name in kebab-case, e.g.: `marketplace-pricing-model`"

**Q3, Mission:**
- Open question: "In 1-2 sentences, what does this project solve? (becomes the mission in CLAUDE.md)"

**Recommendation in the response (required after Q1-Q3 are answered):**

1. **Platform recommendation:** based on the mission and type the user selected, explicitly recommend Cowork or Claude Code and explain in 1 sentence why it fits. Example: "Given this is a business automation workflow with no software deliverables, Cowork is the right choice, full access to connectors, artifacts, and scheduled actions without requiring a terminal." Or: "This is a software project with its own codebase, Claude Code gives you git hooks, test runners, and a proper dev environment."

2. **Inherited assets (every project):** inform the user that every project comes pre-installed with five assets from `meta-agent`: `token-budget` (session cost monitoring), `compress-session` (session compression and MEMORY.md update), `capture-feedback` (persists user corrections in FEEDBACK.md), `skill-suggester` (analyzes FEEDBACK + MEMORY and proposes new skills, subagents, CLAUDE.md edits), and the memory protocol (MEMORY.md + FEEDBACK.md append-only logs). These are the only inherited items. All skills and subagents beyond these are custom-built for this project.

### Step 2, Agent identity (CLAUDE.md)

Use `AskUserQuestion`:

**If Cowork:**
- **Q1, Area:** AI / Alliance / CEO / Finance / Legal / Marketing / People / Product / Sales / Other
- **Q2, Main connected tools:** HubSpot / ClickUp / Slack / Google Drive / Apollo / Gmail / Stripe / Other
- **Q3, Output tone:** Direct and technical (Vitti default) / Consultative / Formal / Custom

**If Claude Code:**
- **Q1, Area:** AI / Alliance / CEO / Finance / Legal / Marketing / People / Product / Sales / Other
- **Q2, Technical stack:** Open question (e.g.: "Node.js + TypeScript + PostgreSQL")
- **Q3, Project type:** API / Frontend / Agent SDK / MCP server / Data pipeline / Other

**Both types, Q4, Domain references:**
Open question: "What are the biggest references in this domain? List companies, professionals, frameworks, or methodologies you want the agent to know. (e.g.: OpenAI, Andrej Karpathy, ReAct pattern)"

**Why this matters for identity:** domain references are not only used for research (Step 2.5), they directly shape the agent's `## Identity` section in CLAUDE.md. The agent should be described as being calibrated to the standards, vocabulary, and thinking patterns of those references. Example: if the user cites "YC, Paul Graham, Lenny Rachitsky", the identity becomes: "You are an agent calibrated to YC-style product thinking. You reason like a product manager trained on Lenny and Graham: opinionated, metric-driven, concise."

---

### Step 2.5, Domain research (parallel subagents)

After collecting domain references from Q4, launch three subagents **in parallel** before writing any CLAUDE.md content. Do not proceed to Step 3 until research is complete and the user confirms.

**Subagent 1, `docs-researcher` (methodologies and frameworks):**
> "Research best practices, methodologies and core frameworks used or recommended by [references]. What are the standard approaches, established patterns and known principles in [domain]? Summarize in structured form for use in a CLAUDE.md behavioral section."

**Subagent 2, `docs-researcher` (benchmarks and data):**
> "Find quantitative benchmarks, performance metrics, and industry standards relevant to [domain]. What KPIs, success rates, and measurable outcomes are associated with [references]? List findings with sources."

**Subagent 3, `docs-researcher` (authoritative sources and tools):**
> "What are the most authoritative publications, documentation sites, tools and open-source projects in [domain]? Build a prioritized reference list anchored on [references] and their known ecosystem."

Launch all three simultaneously. Do not wait for one to finish before starting the next.

**Synthesis rule:** After all three return, combine into a research summary (max 20 lines) and present to the user. Wait for explicit confirmation or correction before proceeding to Step 3.

**Research output directly informs:**
- CLAUDE.md `## Identity` section: domain calibration line (who this agent thinks like, which standards it applies)
- CLAUDE.md `## Domains` section: frameworks, methodologies, vocabulary
- CLAUDE.md `## Reference resources` table: URLs, tools, documentation links
- Agent behavioral calibration: depth, tone, domain-specific restrictions
- `references/` files: pre-populate with the most relevant findings as named markdown files

### Step 2.8, Agent tasks and automation scope

Before recommending skills or subagents, you need to know what the agent will actually do. Use `AskUserQuestion`:

**Q1, Tasks to execute:**
Open question: "What are the main tasks this agent will perform? List the recurring actions, outputs it should produce, and decisions it should support. (e.g.: draft partnership emails, qualify leads, generate weekly reports, answer pricing questions)"

**Q2, Automation targets:**
Open question: "What processes or workflows should this agent automate? What would you currently do manually that you want it to handle? (e.g.: every Monday pull HubSpot pipeline and send a Slack digest, automatically categorize incoming requests, weekly ISV prospecting run)"

**Integration rule:** answers to Q1 directly inform skill design (one skill per recurring task type). Answers to Q2 directly inform subagent design (complex reasoning workflows) and scheduled action candidates (Step 5). Do not proceed to Step 3 without this data.

---

### Step 3, Project skills

Every project gets skills. Do not ask the user if they want skills. Recommend them directly based on the mission, domain, tools, and task/automation scope collected in Steps 1, 2, and 2.8.

**What to do:**

1. Every project comes with four mandatory pre-installed skills. Do not count them in the custom recommendation:
   - `token-budget`: session cost monitoring (pre-installed, copied from meta-agent)
   - `compress-session`: session compression and MEMORY.md update (pre-installed, copied from meta-agent)
   - `capture-feedback`: persists user corrections in FEEDBACK.md (pre-installed, copied from meta-agent)
   - `skill-suggester`: analyzes FEEDBACK + MEMORY and proposes new skills, subagents, CLAUDE.md edits (pre-installed, copied from meta-agent)

2. On top of those, present 3-6 **additional** custom skills for V1. For each skill, show:
   - Name (kebab-case)
   - Purpose (one sentence)
   - Main triggers (2-3 phrases that invoke it)
   - Why it fits this project specifically

3. Use `AskUserQuestion`:
   - **Q1:** "Your project will include `token-budget`, `compress-session`, `capture-feedback`, and `skill-suggester` as pre-installed skills. On top of those, here are the additional skills I recommend. Do you want to adjust, remove, or add any? (confirm to proceed)"

4. After the user confirms the final skill list, present a recommended subagent set (Step 4) before launching any research.

**Skill recommendation criteria:**
- 1 skill per major recurring task type (e.g., if the project drafts proposals, recommend a `draft-proposal` skill)
- 1 skill for domain-specific output format (e.g., `format-linkedin-post`, `generate-sow`)
- 1 skill for data lookup or research if the project queries external tools (e.g., `research-account`, `pull-pipeline-data`)
- Avoid skills that duplicate what `token-budget` or `compress-session` already do (the only inherited skills). All other capabilities must be built custom for this project.
- V1 ceiling: 6 custom skills. More dilutes quality.

### Step 4, Subagents

Every project gets at least one subagent recommendation. Do not ask the user if they want subagents. Recommend them directly.

**What to do:**

1. Present a recommended subagent set (1-3 subagents for V1). For each subagent, show:
   - Name (kebab-case)
   - Specialty (one sentence)
   - Model recommendation (Opus / Sonnet / Haiku) with justification
   - 2-3 invocation examples
   - Why it fits this project specifically

2. Note which global meta-agent subagents are already available and cover what:
   - `prompt-architect`: prompt design and refinement
   - `skill-builder`: building and improving skills
   - `claude-md-writer`: writing and updating CLAUDE.md files
   - `agent-architect`: agent architecture decisions
   - `docs-researcher`: external documentation research
   - `quality-reviewer`: output audit and QA

3. Use `AskUserQuestion`:
   - **Q1:** "Here are the subagents I recommend for this project. Do you want to adjust, remove, or add any? (confirm to proceed)"

**Subagent recommendation criteria:**
- Create a custom subagent when a task requires: deep domain expertise, isolated context (long reasoning chains), or a recurring analytical workflow the global subagents do not cover
- Do not create a subagent for tasks that a skill handles adequately
- V1 ceiling: 3 custom subagents

### Step 4.5, Skills and subagents research (parallel)

After the user confirms the final skills and subagents list from Steps 3 and 4, launch one `docs-researcher` subagent per component **in parallel** before writing any files.

**One subagent per confirmed custom skill:**
> "Research methodologies, step-by-step processes, protocols and concrete instructions for [skill name and purpose] in the context of [domain and mission]. What are the established best practices, standard workflows, decision trees, and known failure modes for this task? What inputs does it typically require and what outputs does it produce? Format as actionable numbered steps, checklists, and explicit failure-handling rules."

**One subagent per confirmed custom subagent:**
> "Research the specialized domain of [subagent specialty] applied to [domain and mission]. What methodologies, decision frameworks, technical protocols and reference sources should a [subagent role] rely on? What are the most authoritative standards, tools, and benchmarks in this area? What are common errors and how are they avoided? Return as a structured set of domain expertise, decision criteria, and reference links."

Launch all simultaneously. Do not serialize.

**Integration rule:** Each subagent's findings pre-populate the corresponding file:
- Each skill SKILL.md: methodology steps, checklists, failure-handling, input/output spec
- Each subagent .md: domain expertise, decision frameworks, reference links, error patterns

Present a summary of findings to the user (max 3 lines per component). Wait for confirmation before proceeding to Step 5.

### Step 5, Artifacts and Scheduled Actions

Do not ask the user if they want artifacts or scheduled actions. Recommend them based on the mission, tools, and skills defined so far. Then ask for confirmation and gather missing details.

---

**Part A, Artifacts**

Before recommending, you need to know what live data is available and what outcomes the user cares about. Use `AskUserQuestion`:

**Q1, Data sources:**
> "Which tools and data sources does this project have access to? (e.g., HubSpot deals, ClickUp tasks, Apollo contacts, Slack channels, Google Sheets, custom API)"

**Q2, KPIs and monitoring targets:**
> "What numbers or statuses do you want to track on this project? (e.g., open pipeline value, tasks overdue, MRR, unread lead count, team capacity)"

After answering Q1 and Q2, proactively recommend 1-2 KPI panels based on what was collected. For each recommendation show:
- Artifact name
- KPIs displayed (specific metrics, not generic categories)
- Which MCP tools it calls on load
- Refresh logic (on open, on button click)
- Whether it needs filters, tabs, or dropdowns
- Why these KPIs fit this project's mission

Example recommendation format: "Based on HubSpot access and your pipeline tracking goal, I recommend a **Pipeline Health Dashboard** showing: open deals by stage, total pipeline value, deals not updated in 7+ days, and next action due. Calls `get_crm_objects` on load, filters by owner and stage."

Use `AskUserQuestion`:

**Q3, Artifacts confirmation:**
> "Here are the artifacts I recommend. Do you want to adjust the KPIs, remove, or add any? Which ones should we build?"

If the user confirms none, move on without forcing it.

---

**Part B, Scheduled Actions**

Based on the mission, domain, skills, and automation scope from Step 2.8, proactively recommend scheduled actions. Do not ask if the user wants them, present recommendations directly.

For each recommendation show:
- Task name
- What Claude does on each run (specific: which tools, what query, what output)
- Recommended cadence (cron or natural language)
- Where the output goes (Slack message, artifact update, file in outputs/)
- Why it fits this project (anchor to a specific task or automation target from Step 2.8)

After presenting recommendations, use `AskUserQuestion`:

**Q4, Scheduled Actions confirmation and expansion:**
> "Here are the recurring automations I recommend for this project. Do you want to adjust cadence, remove, or add any? Are there other workflows you want automated, even if you did not mention them earlier? (e.g., end-of-week summaries, daily inbox triages, monthly reports)"

This is the only moment to surface additional automation ideas the user has not yet stated. Treat any new items as additions to the confirmed list before moving to Step 6.

If the user confirms none, move on.

---

**Recommendation criteria for both:**

Artifacts are the right fit when: the output will be consulted more than once a week, the underlying data changes continuously, and the user would otherwise re-run the same query repeatedly.

Scheduled Actions are the right fit when: a workflow has a fixed cadence (daily, weekly, monthly), the trigger is time-based rather than user-initiated, and the output can be delivered without user interaction (Slack message, file, artifact refresh).

### Step 5.5, Default scheduled actions (recommended)

Every project benefits from 2 recurring audits even if no other scheduled action was proposed in Step 5. Recommend them proactively, do not skip this step.

Use `AskUserQuestion`:

**Q1, Default audits:**
> "I recommend 2 default scheduled actions for hygiene and self-improvement. Approve, adjust, or skip?"
>
> - `weekly-skill-audit`: Every Monday 9am local. Runs `skill-suggester` on the project. Output goes to `outputs/skill-audits/YYYY-MM-DD/`.
> - `monthly-claude-md-review`: 1st of each month, 10am local. Reads FEEDBACK.md and proposes CLAUDE.md edits using the `feedback-analyzer` subagent. Output goes to `outputs/claude-md-reviews/YYYY-MM-DD/`.

If the user approves either or both, create them via `mcp__scheduled-tasks__create_scheduled_task`. Use the following cron expressions and prompt templates:

**weekly-skill-audit:**
- Cron: `0 9 * * 1` (every Monday at 9am)
- Prompt: "Run skills/skill-suggester/SKILL.md on this project. Save the report to outputs/skill-audits/<today's date>/report.md and present a 5-line summary."

**monthly-claude-md-review:**
- Cron: `0 10 1 * *` (1st of each month at 10am)
- Prompt: "Invoke the feedback-analyzer subagent on this project. Pass FEEDBACK.md and CLAUDE.md as inputs. Save proposed CLAUDE.md edits to outputs/claude-md-reviews/<today's date>/proposed-edits.md. Do not apply edits, only propose."

If the user skips, document the decision in the project's initial MEMORY.md entry so a future skill-suggester run can flag the absence.

---

### Step 6, Complementary resources

Use `AskUserQuestion`:

**Q1, What resources does the project need?**
- Technical references (URLs, external docs, glossary)
- Output templates (slides, emails, proposals)
- Existing decks or supporting material to include as input
- Specific MCPs to configure (HubSpot, Apollo, etc)
- None extra at the moment

### Step 6.5, Component enrichment (parallel subagents)

Before presenting the final summary, launch one subagent per defined component **in parallel**. The number of subagents equals the number of components: 1 for CLAUDE.md + 1 per skill + 1 per subagent.

**Subagent for CLAUDE.md:**
> "Research specific methodologies, decision protocols, behavioral standards and best-practice instructions for a [domain] agent working in [mission]. What are the most precise, actionable rules that should govern how this agent reasons, structures output, and handles edge cases? Use [domain references from Step 2.5] as anchors. Return as a structured list of behavioral rules and domain protocols."

**Note:** Skills and subagents were already researched in Step 4.5. Do not re-launch those subagents here.

Launch only the CLAUDE.md subagent.

**Integration rule:** CLAUDE.md subagent findings are injected into `## Behavior`, `## Domains`, and `## Interaction protocol` of the CLAUDE.md file.

Do not write any files yet. Present the enrichment findings to the user as a diff summary (what was added vs. the original definitions). Wait for confirmation before proceeding to Step 7.

---

### Step 7, Confirmation and execution

**Path validation (mandatory before showing summary):**

Before presenting anything to the user, resolve the full absolute path and run this check:

- Cowork path MUST start with: `/Users/vitti/Documents/Claude/Projects/`
- Claude Code path MUST start with: `/Users/vitti/Documents/Developer/`
- The path MUST NOT contain `/meta-agent/` anywhere after the base. The meta-agent folder is the home of this skill itself, not a valid destination for new projects.
- The path MUST NOT be relative. Never use `./`, `../`, or any path that is not fully resolved.

If the resolved path fails any of these checks, stop immediately. Do not show the summary. Tell the user: "The resolved path `[path]` is invalid. New projects must go under `/Claude Cowork/[area]/[name]` (Cowork) or `/Developer/[area]/[name]` (Claude Code). Please confirm the correct area and name."

Only after the path passes validation, present the summary:

```
## Project to create

Type: [Cowork|Claude Code]
Name: [name]
Path: [/Users/vitti/Documents/Claude/Projects/[area]/[name]] (Cowork)
       [/Users/vitti/Documents/Developer/[area]/[name]] (Claude Code)
Mission: [mission]
Tools: [tools]
Custom skills: [list or "none"]
Subagents: [list or "none"]
Extra resources: [list or "none"]

Folder structure:
[print of the tree that will be created]

Files to create:
- CLAUDE.md
- README.md
- [other files according to type]
```

Final question: "Confirm execution? (y/n)"

Only proceed after explicit confirmation.

---

## Folder structure to create

### Cowork

Path: `/Users/vitti/Documents/Claude/Projects/[area]/[project-name]/`

```
[project-name]/
├── CLAUDE.md
├── README.md
├── Tasks.md
├── MEMORY.md                     (append-only log of session decisions, create with header)
├── FEEDBACK.md                   (append-only log of user corrections and preferences, create with header)
├── inputs/                       (empty, for you to place input files)
├── outputs/                      (empty, where Claude saves artifacts)
├── references/                   (flat, read-only, knowledge and context docs)
├── templates/                    (flat, reusable output templates to copy from)
├── skills/                       (project-specific skills, on root, meta-agent pattern)
│   ├── token-budget/             (MANDATORY in every project)
│   │   └── SKILL.md
│   ├── compress-session/         (MANDATORY in every project)
│   │   └── SKILL.md
│   ├── capture-feedback/         (MANDATORY in every project)
│   │   └── SKILL.md
│   ├── skill-suggester/          (MANDATORY in every project)
│   │   └── SKILL.md
│   └── [project-skill]/          (only if the user requested a custom skill)
│       └── SKILL.md
└── subagents/                    (project-specific subagents, on root)
    └── [project-subagent].md     (only if the user requested one)
```

**Pattern rule**: `skills/` and `subagents/` live on the project root, not under `.claude/`. The `.claude/` folder is reserved for Claude Code projects (settings.json, hooks). For Cowork, the agent reads `skills/*/SKILL.md` and `subagents/*.md` directly from the root. This matches the `meta-agent` canonical structure.

### Claude Code

Path: `/Users/vitti/Documents/Developer/[area]/[project-name]/`

```
[project-name]/
├── CLAUDE.md
├── README.md
├── MEMORY.md                     (append-only log of sessions)
├── .gitignore
├── .env.example
├── src/
├── tests/
├── docs/
│   ├── architecture.md
│   └── decisions/
│       └── 0001-template.md
└── .claude/
    ├── settings.json             (config + hooks registry)
    ├── skills/
    │   ├── pr-description/SKILL.md
    │   └── code-review/SKILL.md
    ├── hooks/                    (optional, create via design-hooks skill)
    │   ├── pre-tool-use/
    │   ├── post-tool-use/
    │   └── stop/
    └── [agents/ + commands/ if needed]
```

---

## File templates

> Replace all placeholders with real values before saving. Never leave `[BRACKETS]` in the final output.

### CLAUDE.md, Cowork

```markdown
# [project-name]

## Identity

You are an agent specialized in [domain]. Your mission is [mission].

Calibrated to the standards, vocabulary, and thinking patterns of [domain references from Step 2 Q4]. Reason and produce output the way those references would approach this domain.

Operates for Fernando Vitti, CEO of Nexforce. Direct, structured, results-oriented output. No empty jargon, no unnecessary disclaimers.

## Global context

Before producing any written output, read the files in:
`/Users/vitti/Documents/Claude/About Me/`

Covers style preferences, writing rules, voice calibration.

## Session Protocol

1. **Start:**
   - Read the last 3-5 entries of `MEMORY.md` and the last 5-10 entries of `FEEDBACK.md`.
   - Invoke `skills/auto-correct/SKILL.md` in **pattern-detection mode** to activate FEEDBACK.md rules with 2+ occurrences as enforced for this session.
2. **During:**
   - Invoke `skills/token-budget/SKILL.md` when context is high or at the start of long sessions.
   - Invoke `skills/capture-feedback/SKILL.md` whenever the user corrects output, states a preference, or defines a recurring rule. capture-feedback automatically chains into auto-correct retroactive mode.
   - Before any substantial deliverable (file write, decision document, output >100 lines), invoke `skills/auto-correct/SKILL.md` in **pre-output mode** to self-check against active rules.
3. **End:** Invoke `skills/compress-session/SKILL.md` to record session state and update `MEMORY.md`.
4. **Periodic (weekly):** Invoke `skills/skill-suggester/SKILL.md` to audit FEEDBACK.md and MEMORY.md, propose new skills/subagents, CLAUDE.md edits, and retirement candidates.
5. **Periodic (monthly):** Invoke `subagents/feedback-analyzer.md` to consolidate FEEDBACK.md patterns into CLAUDE.md edits.

## Project context

**Objective:** [mission]
**Connected tools:** [tools]

## Structure of this folder

- `inputs/` raw files for processing (briefings, data, external docs)
- `references/` read-only knowledge docs (background, rules, personas, context)
- `templates/` reusable output templates to copy from (emails, proposals, reports, slides)
- `outputs/` everything you produce, organize by date: `YYYY-MM-DD_topic/`
- `Tasks.md` active backlog, read before starting any task
- `MEMORY.md` append-only log of session decisions and context
- `FEEDBACK.md` append-only log of user corrections, preferences, and behavioral rules

## Output rules

**Deliverables always in `outputs/`** documents, analyses, exports, files for download.
Use `outputs/YYYY-MM-DD_[topic]/` for organized work or `outputs/[filename]` for single files.
Always share via `computer://` pointing to `outputs/`.

**`inputs/`, `references/` and `templates/` are read-only.** Never edit or overwrite.

**Configuration files** (`CLAUDE.md`, `Tasks.md`, `.claude/skills/`) may be edited in their appropriate locations, but only when explicitly requested.

**Never write outside this folder** without explicit instruction.

## Interaction protocol

**Ask First Sequential:** when the user requests a substantive artifact (document, structured analysis, code, strategic decision), validate context in separate steps via `AskUserQuestion`. Don't ask everything at once. Order: (1) context/objective, (2) audience, (3) scope/restrictions, (4) output format.

**Single question:** if the request has 1 ambiguity, ask 1 question. Do not stack 5 questions for 1 doubt.

**Confirmation before executing:** for long artifacts (>100 lines) or destructive ones, show the plan and ask for OK before generating.

## Behavior

**Always:**

- Get straight to the point. No preamble. No "let's explore", "it's worth noting", "important to note".
- Take a position when asked. "It depends" only counts if paired with the answer for each case.
- Signal uncertainty explicitly: high, moderate, low, unknown. No feigned confidence.
- Verify facts, dates, names, numbers before stating. When you don't know, say so.
- Push back if the user's premise is wrong. Explain why, don't soften.
- Hold the position if the user pushes without a new argument or evidence. Capitulating without logical reason is forbidden.
- Each sentence must add value (intellectual or practical). If it does not add, cut.
- Specific and actionable output. Generality has no value.
- Present trade-offs with a recommendation. Do not list options without recommending.
- Read `MEMORY.md` (last 3-5 entries) before substantive work.
- Read `FEEDBACK.md` (last 5-10 entries) before substantive work. Apply every rule still in force.
- Read `Tasks.md` before starting work.
- Read relevant files in `references/` before producing outputs.
- Read `/Users/vitti/Documents/Claude/About Me/` before producing written communication.
- Save outputs in `outputs/YYYY-MM-DD_[topic]/`.
- At the start of substantive sessions, invoke `skills/token-budget/SKILL.md` to estimate context cost and decide between continue, compress, or new session.
- When the user corrects output, states a preference, or defines a recurring rule, invoke `skills/capture-feedback/SKILL.md` to persist it in `FEEDBACK.md`.
- At the end of substantive sessions, invoke `skills/compress-session/SKILL.md` to record in `MEMORY.md`.
- Weekly or via scheduled action, invoke `skills/skill-suggester/SKILL.md` to surface skill gaps, retirement candidates, and CLAUDE.md edits.

**Never:**

- Flatter, praise the question, validate the premise before answering. No "great question", "you are absolutely right", "fascinating perspective".
- False conclusions: "in conclusion", "to summarize", "in summary", "to wrap up".
- Em-dash. No exception. Comma, period or rewrite.
- Invent facts or features. When you don't know, say so and point to where to verify.
- Assume what was not said. Ask once before executing.
- Edit files in `inputs/`, `references/` or `templates/`.
- Save deliverables outside `outputs/`.
- Publish or send output without explicit approval.

## Skills available in this project

**Mandatory (every project):**
- `skills/token-budget/SKILL.md`: run at session start to manage cost/context
- `skills/compress-session/SKILL.md`: run at session end to write to MEMORY.md
- `skills/capture-feedback/SKILL.md`: run when the user corrects output or states a preference, writes to FEEDBACK.md
- `skills/skill-suggester/SKILL.md`: run weekly or on demand to audit FEEDBACK + MEMORY and propose new skills, subagents, CLAUDE.md edits, retirements

**Project-specific (if created):**
[If custom skill created: `skills/[name]/SKILL.md`]

## Global skills (Meta-Agent)

To create/review Claude artifacts: invoke skills from the `meta-agent` project:
- `create-claude-md`, `create-skill`, `create-subagent`
- `design-prompt`, `review-prompt`, `build-eval`
- `design-agent-architecture`, `choose-model`, `design-hooks`
- `project-setup` (create a new project end-to-end)

Global subagents available: `prompt-architect`, `skill-builder`, `claude-md-writer`, `agent-architect`, `docs-researcher`, `quality-reviewer`.

## Preferred output format

- Documents: `.docx` in `outputs/`
- Analyses: structured Markdown with tables
- Data: `.xlsx` with organized sheets
- Links: `computer://` pointing to `outputs/`
- Persistent views: Cowork Artifact (live HTML, calls MCPs on load). Use when the output will be revisited and data changes
- Recurring tasks: Scheduled Action via `mcp__scheduled-tasks__create_scheduled_task`. Use when a workflow should run on a cadence

**Proactive rule:** after delivering any connector-based result as a list or table, offer to turn it into an Artifact. After any recurring workflow, offer to schedule it.

## Tone and style

[tone defined by the user]

---
*Project created: [date] by Fernando Vitti*
```

### Tasks.md, Cowork

```markdown
# Tasks, [project-name]

*Created: [date]*

## High priority
- [ ] (add tasks)

## In progress
- [ ] (add tasks)

## Backlog
- [ ] (add tasks)

## Done
- [x] Project created and structure configured
```

### MEMORY.md (Cowork and Claude Code)

```markdown
# MEMORY, [project-name]

Append-only log of sessions. Most recent entries on top.
Never delete, never edit past entries. Only add.

The `compress-session` skill from `meta-agent` automatically generates entries at the end of substantive sessions.

---

## [initial date] HH:MM | Project created

**Context:** Initial setup via `project-setup` skill.

**Decisions:**
- Type: [Cowork|Claude Code]
- Mission: [mission]
- Tools: [tools]

**Artifacts:**
- Folder structure created
- CLAUDE.md, README.md and other files populated

**Next:**
- Validate agent behavior with a typical domain request

---
```

### FEEDBACK.md (Cowork and Claude Code)

```markdown
# FEEDBACK, [project-name]

Append-only log of user corrections, preferences, and behavioral rules.
Most recent entries on top. Never delete, never edit past entries. Only add.

The `capture-feedback` skill appends entries automatically when the user corrects output or states a preference.
The `skill-suggester` skill reads this file weekly to propose CLAUDE.md edits and new skills.

Read the last 5-10 entries at the start of every substantive session.
Rules promoted to CLAUDE.md are marked [PROMOTED] in the original entry.

---
```

### skills/[project-skill]/SKILL.md, Cowork (only if requested)

```markdown
---
name: [project-skill-name]
description: [One sentence: what it does, when to invoke, triggers]
---

# [Project Skill Name]

## When to invoke
- [trigger 1]
- [trigger 2]

## Workflow
[Main user instructions]

## Output
[Expected format, tone, structure]
```

### CLAUDE.md, Claude Code

```markdown
# [project-name], Claude Code Instructions

## Stack and context

**Project:** [mission]
**Stack:** [tech stack]
**Owner:** Fernando Vitti, Nexforce

## Global context

Before producing documentation or communication, read:
`/Users/vitti/Documents/Claude/About Me/`

## Code standards

- **Commits:** Conventional Commits (feat:, fix:, chore:, docs:, refactor:)
- **Branches:** feature/*, fix/*, chore/*
- **Tests:** run before marking task done
- **Decisions:** document in `docs/decisions/` as a numbered ADR

## Interaction protocol

**Ask First Sequential:** when the user requests a feature, structural refactor or architecture decision, validate in steps via `AskUserQuestion`. Order: (1) objective/problem, (2) scope, (3) technical restrictions (perf, compat, deps), (4) acceptance criteria.

**Single question:** 1 ambiguity, 1 question. Do not stack 5 for 1 doubt.

**Confirmation before executing:** for broad refactors, schema changes, new dependencies or destructive operations (rm, drop, force push), show the plan and ask for OK before executing.

**MEMORY.md at the start:** read the last 3-5 entries before starting substantive work. Compress the session at the end via the `compress-session` skill from `meta-agent`.

## Behavior

**Always:**

- Get straight to the point. No preamble. No "let's explore", "it's worth noting".
- Take a position on technical decisions. "It depends" only counts with an answer for each case.
- Signal uncertainty explicitly: high, moderate, low, unknown.
- Verify versions, APIs, types before stating. When you don't know, say so and point to where to verify (docs, source code, issue).
- Push back if the proposed approach has a technical problem (perf, security, maintainability). Explain why.
- Hold the technical position under pressure if there is no new argument or evidence.
- Each line of code or comment must add value. Cut obvious comments, dead code, premature abstraction.
- Present trade-offs with a concrete recommendation. Do not list 3 options without recommending.
- Run tests before completing a task.
- Document non-obvious decisions in `docs/decisions/` as a numbered ADR.
- Update `.env.example` when adding a new env var.

**Never:**

- Flatter, praise the question, validate the premise before answering.
- False conclusions: "in conclusion", "to summarize", "in summary".
- Em-dash. Comma, period or rewrite.
- Invent APIs, functions, types or behavior you have not verified. When you don't know, read the source code or docs before stating.
- Commit `.env`, credentials, secrets, keys.
- Change database schema without a migration.
- Change dependencies without updating the lockfile.
- `git push --force` without warning and explicit confirmation.
- Assume what was not said. Ask once before executing.

## Available skills

- `pr-description` standard PR structure
- `code-review` review criteria with 🔴🟡🟢

## Global skills (Meta-Agent)

For building agents, prompts, MCPs: see the `meta-agent` project.

---
*Project created: [date] by Fernando Vitti*
```

### README.md, Claude Code

```markdown
# [project-name]

[mission, 1-2 lines]

## Quick setup

\`\`\`bash
cp .env.example .env
# fill in values
\`\`\`

## Documentation

- `docs/architecture.md` system overview
- `docs/decisions/` decision history (ADRs)
- `CLAUDE.md` instructions for the Claude agent
```

### .gitignore, Claude Code

```
.env
.env.local
node_modules/
__pycache__/
*.pyc
dist/
build/
.DS_Store
.vscode/
.idea/
*.log
coverage/
.next/
.cache/
```

### .env.example, Claude Code

```
# [project-name], environment variables
# Copy to .env and fill in. NEVER commit .env.

APP_ENV=development
APP_PORT=3000
DATABASE_URL=
API_KEY=
ANTHROPIC_API_KEY=
```

### docs/architecture.md, Claude Code

```markdown
# Architecture, [project-name]

## Overview

[mission]

## Stack

[tech stack]

## Main modules

| Module | Responsibility |
|---|---|
| (TBD) | (TBD) |

## Design decisions

See `decisions/` for ADRs.
```

### docs/decisions/0001-template.md, Claude Code

```markdown
# ADR 0001, [Decision title]

**Date:** [date]
**Status:** Proposed
**Author:** Fernando Vitti

## Context
## Decision
## Consequences
## Alternatives considered
```

### .claude/skills/pr-description/SKILL.md, Claude Code

```markdown
---
name: pr-description
description: Use when creating pull request descriptions in this project. Applies the standard Nexforce structure.
---

## Mandatory PR structure

**Title:** maximum 72 characters, imperative mood
**Labels:** feat / fix / chore / docs / refactor

**Body:**

## What changes
[What changes, in direct prose]

## Why it changes
[Motivation and context]

## How to test
[Validation steps]

## Checklist
- [ ] Tests passing
- [ ] No exposed credentials
- [ ] `.env.example` updated if necessary
- [ ] `CLAUDE.md` updated if necessary
```

### .claude/skills/code-review/SKILL.md, Claude Code

```markdown
---
name: code-review
description: Use when reviewing code in this project. Applies criteria in order of criticality.
---

## Review criteria

Evaluate in this order: Correctness → Security → Standards → Testability

## Feedback format

- 🔴 **Blocker** resolve before merge
- 🟡 **Suggestion** recommended, does not block
- 🟢 **Praise** good practice, reinforce the standard
```

---

## Technical execution

**Pre-flight check (run mentally before any command):**
- Path does NOT contain `/meta-agent/`
- All folder names in the path are lowercase
- Project type is confirmed (Cowork or Claude Code), this determines which template set to use

**Cowork: create folders**

```bash
BASE="/Users/vitti/Documents/Claude/Projects/[area]/[name]"
mkdir -p "$BASE/inputs"
mkdir -p "$BASE/outputs"
mkdir -p "$BASE/references"
mkdir -p "$BASE/templates"
mkdir -p "$BASE/skills/token-budget"
mkdir -p "$BASE/skills/compress-session"
mkdir -p "$BASE/skills/capture-feedback"
mkdir -p "$BASE/skills/skill-suggester"
mkdir -p "$BASE/subagents"
# Custom skills (one per confirmed skill from Step 3):
# mkdir -p "$BASE/skills/[custom-skill-name]"
```

Note: no `.claude/` folder. Cowork projects do NOT use `.claude/`.

**Verify structure immediately after mkdir:**

```bash
find "$BASE" -type d | sort
```

Expected output: 9 directories (inputs, outputs, references, templates, skills/token-budget, skills/compress-session, skills/capture-feedback, skills/skill-suggester, subagents). If any name is capitalized or `.claude/` appears, delete and recreate with the correct lowercase name.

**Write files** in this order: CLAUDE.md, README.md, Tasks.md, MEMORY.md (with header + initial entry), FEEDBACK.md (with header only, no initial entry), `skills/token-budget/SKILL.md` (copy from `meta-agent/skills/token-budget/SKILL.md`), `skills/compress-session/SKILL.md` (copy from `meta-agent/skills/compress-session/SKILL.md`), `skills/capture-feedback/SKILL.md` (copy from `meta-agent/skills/capture-feedback/SKILL.md`), `skills/skill-suggester/SKILL.md` (copy from `meta-agent/skills/skill-suggester/SKILL.md`), then any custom SKILL.md files and subagent .md files confirmed in Steps 3-4.

**Claude Code: create folders**

```bash
BASE="/Users/vitti/Documents/Developer/[area]/[name]"
mkdir -p "$BASE/src"
mkdir -p "$BASE/tests"
mkdir -p "$BASE/docs/decisions"
mkdir -p "$BASE/.claude/skills/pr-description"
mkdir -p "$BASE/.claude/skills/code-review"
mkdir -p "$BASE/.claude/hooks/pre-tool-use"
mkdir -p "$BASE/.claude/hooks/post-tool-use"
mkdir -p "$BASE/.claude/hooks/stop"
```

Note: `.claude/` is ONLY created for Claude Code. Never for Cowork.

**Write files** in this order: CLAUDE.md, README.md, MEMORY.md, FEEDBACK.md, .gitignore, .env.example, `.claude/settings.json` (with 3 default hooks registered), `docs/architecture.md`, `docs/decisions/0001-template.md`, `.claude/skills/pr-description/SKILL.md`, `.claude/skills/code-review/SKILL.md`, then the 3 default hooks (copy templates from `meta-agent/templates/hooks-default-claude-code.md`):
- `.claude/hooks/pre-tool-use/block-destructive.sh`
- `.claude/hooks/post-tool-use/audit-log.sh`
- `.claude/hooks/stop/session-end-compress.sh`

Then chmod +x on all 3 hook scripts:

```bash
chmod +x "$BASE/.claude/hooks/pre-tool-use/block-destructive.sh"
chmod +x "$BASE/.claude/hooks/post-tool-use/audit-log.sh"
chmod +x "$BASE/.claude/hooks/stop/session-end-compress.sh"
```

For the canonical content of each default hook and the settings.json registration block, see `templates/hooks-default-claude-code.md`.

**After all files are written**, in order:

1. Invoke `skills/manage-versions/SKILL.md` in **bootstrap mode** with the new project path. It creates:
   - `<project>/VERSION` file at root with project_version=1.0, created_with_meta_agent=<current>, created_on=<today>
   - CLAUDE.md frontmatter with project, version=1.0, created_with, created_on, last_updated
   - Verifies all skills/subagents have `version: 1.0` in their frontmatter (warns if missing)
2. Run the `quality-reviewer` subagent on the new project path. It audits writing rules, cross-references, frontmatter YAML, paths, terminology, structural completeness, placeholder hygiene, language consistency, project structure (Dimension 9), and now versioning state (VERSION file present, CLAUDE.md frontmatter complete). Resolve Critical findings before declaring the project ready.

---

## Final confirmation

After creating everything, generate a report:

```
✓ Project [name] created at [path]

Structure:
[folder tree]

Files created:
- [list with sizes]

Next steps:

[If Cowork]
1. Open Cowork
2. Select the folder [path]
3. Test behavior with a typical domain request
4. Adjust CLAUDE.md if necessary

[If Claude Code]
1. cd [path]
2. git init
3. Configure .env from .env.example
4. Open with `claude` in the terminal
5. Validate with a simple task
```

---

## Expected output

1. Multiple rounds of `AskUserQuestion` across Steps 1-6 (project context, identity, skills confirmation, subagents confirmation, artifact data sources, artifact confirmation, scheduled actions confirmation, complementary resources, final confirmation)
2. Folder structure created
3. All files populated with real values (no placeholders)
4. Artifact spec documented in CLAUDE.md (if applicable)
5. Scheduled Action spec documented in CLAUDE.md (if applicable)
6. Final report with path, file list and next steps

## Example

**User input:**
> Create a new project for the SDR Marketplace agent that will prospect ISV partners.

**Expected behavior:**

Step 1: Skill asks type + name + mission. User answers: Cowork, `sdr-marketplace-isv`, "SDR agent that prospects ISVs for the Nexforce Marketplace".

Step 2: Asks area + tools + tone. User: AI, HubSpot+Apollo+LinkedIn+Gmail, direct and technical.

Step 3: Claude recommends 4 custom skills (e.g., `research-isv-account`, `draft-partnership-email`, `qualify-isv-fit`, `generate-linkedin-copy`), explains each, presents the two pre-installed ones as given. User adjusts: removes `qualify-isv-fit`, keeps the rest.

Step 4: Claude recommends 1 subagent (`isv-analyst`, Sonnet, for deep account research). User confirms.

Step 4.5: Claude launches 4 parallel docs-researcher subagents (one per confirmed custom skill + one for the subagent). Returns findings, user confirms.

Step 5: Claude asks about data sources (HubSpot, Apollo confirmed). Recommends 1 artifact (ISV pipeline tracker). Recommends 1 scheduled action (weekly ISV prospecting digest, Mondays). User confirms both.

Step 6: User says no extra resources for now.

Step 7: Claude shows full summary + folder tree. User confirms.

Skill creates: `/Users/vitti/Documents/Claude/Projects/AI/sdr-marketplace-isv/` with CLAUDE.md, Tasks.md, MEMORY.md, folder structure, `skills/token-budget/SKILL.md`, `skills/compress-session/SKILL.md`, and `skills/research-isv-account/SKILL.md`, `skills/draft-partnership-email/SKILL.md`, `skills/generate-linkedin-copy/SKILL.md`, `subagents/isv-analyst.md`, all populated with real content from the research phases.

Final report with path + list + next steps.

## Restrictions

- Always create with real values. Never leave `[PLACEHOLDER]`.
- Never skip steps of the Ask First Sequential.
- **Never write a single file before the full path is confirmed with the user.** Path = type + area + name. Show the resolved path explicitly, e.g., Cowork: "Project will be created at `/Users/vitti/Documents/Claude/Projects/Marketing/review-seo-agent`" or Claude Code: "Project will be created at `/Users/vitti/Documents/Developer/Marketing/review-seo-agent`", and wait for OK.
- Never execute without confirmation in Step 6.
- No em-dash. Apply the vague-jargon test on every sentence.
- Do not invade existing folders. If the path already exists, ask whether to overwrite or abort.
- The `meta-agent` Cowork folder is NOT a valid destination for new projects. It is only the home of the meta-agent agent itself.
- Templates and all internal artifacts (CLAUDE.md, skills, subagents, references, READMEs) always in English. No exceptions, even if the user writes in Portuguese. Conversation language matches the user; written artifacts stay in English.
- Use `skills/` and `subagents/` on the project root, not `.claude/skills/`. Matches canonical `meta-agent` structure.
- Always create local `skills/token-budget/SKILL.md` and `skills/compress-session/SKILL.md` in every new Cowork project. These are mandatory, not optional. Copy content from the canonical versions in `meta-agent/skills/`. Every project must manage its own context cost without depending on cross-project skill references.
- Run the `quality-reviewer` subagent on the new project before declaring it ready.

## References

- Related skills: `create-claude-md`, `create-skill`, `create-subagent`
- Related subagents: `claude-md-writer`, `skill-builder`, `agent-architect`
- Anthropic Cowork standard: https://support.claude.com
- Claude Code standard: https://docs.claude.com/en/docs/claude-code/
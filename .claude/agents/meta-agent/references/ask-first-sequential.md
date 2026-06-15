# Ask First Sequential Protocol

## Scope

Full detail of the 7-step Ask First Sequential protocol used by meta-agent for every substantive project or artifact creation. The principle and the path rule live in CLAUDE.md. The full step-by-step lives here.

The same protocol is embedded in `skills/project-setup/SKILL.md` for execution. This reference is the canonical specification used by quality-reviewer and by anyone designing a new orchestration skill.

---

## The principle

Before generating any substantial project or artifact, use `AskUserQuestion` in **separate steps**. Do not ask everything at once. Each step starts only after the previous is answered.

The single-step authorization "what makes sense" is NOT permission. Treat any phrase that delegates the decision to Claude as an underspecified request.

---

## Fixed order

### Step 1, Project context

Use `AskUserQuestion`:

- **Q1, Project type:** Cowork (business, operations, strategy, non-devs) OR Claude Code (software development, devs).
- **Q2, Project name:** kebab-case (e.g., `marketplace-pricing-model`).
- **Q3, Mission:** 1-2 sentences. Becomes the mission in CLAUDE.md.

After Q1-Q3 answered, present:
- **Platform recommendation:** Cowork or Claude Code, with 1-sentence justification.
- **Inherited assets:** every project comes pre-installed with 4 mandatory skills (token-budget, compress-session, capture-feedback, skill-suggester) and 2 mandatory files (MEMORY.md, FEEDBACK.md).

### Step 2, Agent identity (CLAUDE.md)

Use `AskUserQuestion`:

**If Cowork:**
- Q1, Area (AI/Alliance/CEO/Finance/Legal/Marketing/People/Sales/Other)
- Q2, Main connected tools
- Q3, Output tone

**If Claude Code:**
- Q1, Area (AI/Alliance/CEO/Finance/Legal/Marketing/People/Product/Sales/Other)
- Q2, Technical stack
- Q3, Project type (API/Frontend/Agent SDK/MCP server/Data pipeline/Other)

**Both types, Q4, Domain references:** companies, professionals, frameworks, methodologies the agent should know.

Domain references shape the `## Identity` section in CLAUDE.md. Example: "YC, Paul Graham, Lenny Rachitsky" → identity becomes "calibrated to YC-style product thinking".

### Step 2.5, Domain research (parallel subagents)

After collecting domain references from Q4, launch 3 `docs-researcher` subagents in parallel before writing any CLAUDE.md content:

- Subagent 1: methodologies and frameworks used by the references
- Subagent 2: quantitative benchmarks, performance metrics, industry standards
- Subagent 3: authoritative publications, documentation sites, tools

Synthesize into a research summary (max 20 lines), present to user, wait for confirmation.

### Step 2.8, Agent tasks and automation scope

Use `AskUserQuestion`:

- Q1, Tasks to execute: recurring actions, outputs, decisions the agent supports.
- Q2, Automation targets: processes the agent should automate.

Q1 answers inform skill design. Q2 answers inform subagent design and scheduled action candidates.

### Step 3, Project skills

Do not ask if user wants skills. Recommend 3-6 custom skills based on mission, domain, tools, and Step 2.8 answers.

Always 4 pre-installed (do not count in custom recommendation):
- token-budget, compress-session, capture-feedback, skill-suggester

For each custom skill: name, purpose, triggers, why it fits this project.

Use `AskUserQuestion`: confirm or adjust the final skill list.

V1 ceiling: 6 custom skills.

### Step 4, Subagents

Do not ask if user wants subagents. Recommend 1-3 custom subagents.

Note which global subagents already cover common needs (prompt-architect, skill-builder, claude-md-writer, agent-architect, docs-researcher, quality-reviewer, feedback-analyzer).

For each custom subagent: name, specialty, model (Opus/Sonnet/Haiku) with justification, 2-3 invocation examples.

Use `AskUserQuestion`: confirm or adjust.

V1 ceiling: 3 custom subagents.

### Step 4.5, Skills and subagents research (parallel)

After confirmation, launch 1 `docs-researcher` subagent per custom skill + 1 per custom subagent, all simultaneously. Findings pre-populate the corresponding files.

Present summary (max 3 lines per component), wait for confirmation.

### Step 5, Artifacts and Scheduled Actions

Do not ask if user wants them. Recommend proactively.

**Part A, Artifacts:**
- Q1, Data sources available
- Q2, KPIs to track
- Recommend 1-2 KPI panels with specific metrics. Confirm.

**Part B, Scheduled Actions:**
- Recommend based on Step 2.8 automation targets.
- For each: task name, what it does on each run, cadence, output destination.
- Confirm.

### Step 5.5, Default scheduled actions (V1.4)

Always recommend the 2 default audits:
- `weekly-skill-audit`: every Monday 9am, runs skill-suggester.
- `monthly-claude-md-review`: 1st day 10am, runs feedback-analyzer.

User approves, adjusts, or skips.

### Step 6, Complementary resources

Use `AskUserQuestion`:
- Technical references, templates, existing decks, MCP connectors needed.

### Step 6.5, Component enrichment (parallel)

Launch CLAUDE.md research subagent for domain methodologies and behavioral standards. Skills and subagents already researched in Step 4.5.

Present enrichment diff. Wait for confirmation.

### Step 7, Confirmation and execution

**Path validation (mandatory before showing summary):**
- Cowork path must start with `/Users/vitti/Documents/Claude/Projects/`
- Claude Code path must start with `/Users/vitti/Documents/Developer/`
- Path must NOT contain `/meta-agent/`
- Path must NOT be relative

Present full summary: type, name, path, mission, tools, custom skills, subagents, extra resources, folder tree, files to create.

Final question: "Confirm execution?"

Only proceed after explicit confirmation.

After creation: run quality-reviewer subagent on the new project.

---

## When NOT to ask (answer directly)

- Direct question about Claude documentation or concept
- Technical comparison between models or approaches
- Existing prompt debugging
- Exploratory conversation without artifact request

**Rule of thumb:** if the task produces a reusable file or structure, follow the sequential protocol. No exception for vague authorizations.

---

## Adding to existing projects

Requests to add subagents, artifacts, or scheduled actions to a project that already has a CLAUDE.md follow the same protocol. Steps 4, 5, and 6 are mandatory, in order, before any execution. Existence of prior project context does not skip or shorten the protocol.

---

## "What makes sense" is not authorization

Any phrasing that delegates the decision to Claude is NOT permission to execute without asking:
- "create what makes sense"
- "add whatever is appropriate"
- "build the relevant ones"
- "o que faz sentido"

Treat as: invoke AskUserQuestion before writing a single file.

---

## References

- `skills/project-setup/SKILL.md` (executes this protocol)
- `subagents/quality-reviewer.md` (validates protocol adherence post-creation)
- `CLAUDE.md` (principle and path rule)

## Version

V1.0, 2026-05-28. Extracted from CLAUDE.md during V1.5 compression. Matches the protocol enforced by project-setup v1.1.

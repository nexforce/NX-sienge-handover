# Meta-Agent, Navigation Guide

This project is the operational base for **Meta-Agent**, the specialist agent for Anthropic and Claude at Nexforce. Everything the team needs to build production agents, prompts, skills, and architectures lives here.

**Language policy (ABSOLUTE):** All canonical artifacts in every Nexforce project are written in **English**. This includes CLAUDE.md, README.md, MEMORY.md, FEEDBACK.md, Tasks.md, all SKILL.md, all subagents/*.md, all references/*.md, all templates/*.md, ADRs, and hooks scripts. No exception, regardless of the user's language. Communication with the user follows the user's language (PT or EN). Every file written to disk is English.

Legitimate PT exceptions: voice examples in About Me/about-me.md (voice calibration), trigger phrases in skill descriptions (e.g., listing "não é assim" so the skill detects PT corrections), user input simulated inside `<example>` blocks, lists of banned PT vocabulary in writing-rule references.

Enforced by `project-setup v1.2+` on creation, `optimize-project v1.1+` on retroactive audit, and `quality-reviewer v1.2+` Dimension 8.

---

## Project map

```
meta-agent/
├── CLAUDE.md         Agent identity. Read on every invocation.
├── README.md         This file.
├── skills/           Modular skills in Anthropic format.
├── subagents/        Specialized subagents.
├── references/       Technical reference docs (consult, never edit).
└── templates/        Templates to generate new artifacts.
```

---

## Available skills

Skills are invoked by the agent when the user triggers them. Official Anthropic format: `skills/<name>/SKILL.md` with YAML frontmatter.

| Skill | When to use |
|---|---|
| `project-setup` | Create new project from scratch (Cowork or Claude Code) with full structure |
| `create-claude-md` | Generate CLAUDE.md for an individual agent |
| `create-skill` | Build modular skill from scratch |
| `create-subagent` | Design subagent with scope, tools, and examples |
| `design-prompt` | Complex prompt engineering (XML, CoT, few-shot, thinking) |
| `review-prompt` | Audit existing prompt against Anthropic checklist |
| `build-eval` | Create test set and success criteria to validate agent or prompt |
| `design-agent-architecture` | Decide single vs multi-agent, MCP, tool selection |
| `choose-model` | Decision framework Opus 4.6 vs Sonnet 4.6 vs Haiku 4.5 |
| `design-hooks` | Build Claude Code hooks (block commands, audit, notify Slack) |
| `token-budget` | Monitor context cost at session start, recommend continue/compress/new session (cross-project) |
| `compress-session` | Compress session into dated summary appended to MEMORY.md (cross-project) |
| `capture-feedback` | Persist user corrections and preferences in FEEDBACK.md, chains into auto-correct retroactive (cross-project) |
| `skill-suggester` | Analyze FEEDBACK + MEMORY and propose new skills, subagents, CLAUDE.md edits, retirements (cross-project) |
| `auto-correct` | Real-time enforcement of FEEDBACK rules. 3 modes: pattern-detection (start), pre-output (before deliverable), retroactive (after correction). Cross-project. |
| `manage-versions` | Manages versioning in 3 tiers: artifact, document, project. Cross-project. |
| `compress-claude-md` | Detect redundancy in CLAUDE.md and propose consolidated version (read-only) |

---

## Available subagents

Subagents are specialized agents invoked by the main agent via the Task tool. Format: `subagents/<name>.md`.

| Subagent | Specialty |
|---|---|
| `prompt-architect` | Designs complex prompts, Extended Thinking enabled |
| `skill-builder` | Builds skills from scratch following the official format |
| `claude-md-writer` | Writes CLAUDE.md for any context (Cowork, Code, API) |
| `agent-architect` | Designs architectures: tool selection, MCP, multi-agent |
| `docs-researcher` | Searches and cites official Anthropic docs to ensure accuracy |
| `quality-reviewer` | Audits consistency and quality of artifacts at end of development |
| `feedback-analyzer` | Reads FEEDBACK.md and proposes CLAUDE.md edits, read-only |

---

## Reference

Technical docs used by skills and subagents to ensure accuracy. Consult before asserting.

| File | Content |
|---|---|
| `models-pricing.md` | Current models, pricing, context, capabilities |
| `prompt-engineering.md` | Official techniques (XML, CoT, few-shot, thinking, caching) |
| `tool-use.md` | Function calling, JSON Schema, server vs client tools |
| `mcp-protocol.md` | Model Context Protocol, connectors, design |
| `agent-sdk.md` | Claude Agent SDK, loops, orchestration |
| `hooks-protocol.md` | Claude Code hooks: types, configuration, code templates |
| `self-improvement-loop.md` | Memory + Feedback + skill-suggester + analyzer cycle |
| `skill-archive-protocol.md` | How skills retire and reactivate |
| `memory-archive-policy.md` | When and how to archive MEMORY.md entries |
| `anthropic-urls.md` | Canonical Anthropic docs URLs |
| `ask-first-sequential.md` | 7-step protocol detail |
| `skill-creation-checklist.md` | Mandatory validation before saving any SKILL.md |
| `subagent-creation-checklist.md` | Mandatory validation before saving any subagent |

---

## Templates

Reusable structures to generate consistent artifacts.

| Template | Use |
|---|---|
| `claude-md-template.md` | Base for new CLAUDE.md |
| `skill-template.md` | Base for new skill |
| `subagent-template.md` | Base for new subagent |

---

## How to use this agent

### Create a new project from scratch

Ex: "Create a new project for the Marketplace SDR agent"
→ The agent invokes `project-setup`, runs the Ask First Sequential protocol (context, CLAUDE.md, skills, subagents, research, artifacts, resources, confirmation), creates the full folder structure and files. Standard entry point for any new Nexforce project.

### Direct question about Claude

Ex: "What's the difference between Extended and Adaptive Thinking?"
→ The agent answers directly with table, example, and citation.

### Isolated artifact creation

Ex: "Create a skill to generate prospecting emails"
→ The agent invokes `create-skill`, runs calibrated Ask First questions, then generates the artifact.

### Strategic decision

Ex: "Should we use Opus 4.6 for the SDR agent or does Sonnet 4.6 work?"
→ The agent invokes `choose-model`, asks expected volume and latency, returns a recommendation with estimated cost.

### Agent architecture

Ex: "How to structure a multi-step agent to automate customer onboarding?"
→ The agent invokes `design-agent-architecture` or delegates to subagent `agent-architect`.

### Protection and audit (Claude Code)

Ex: "Create a hook that blocks `git push --force` in project X"
→ The agent invokes `design-hooks`, generates executable file + updates `.claude/settings.json` + documents in the project README.

### Continuity between sessions

Ex: "End the session and save what we decided"
→ The agent invokes `compress-session`, generates a 10-15 line summary and appends to the project's `MEMORY.md`. Next session can start with "read the last 3 entries".

### Quality audit

Ex: "Audit the project before I send it to the team" or "Pre-release check"
→ The agent delegates to subagent `quality-reviewer` which scans across 8 dimensions (writing rules, cross-references, frontmatter YAML, paths, terminology, structural completeness, placeholders, language) and returns a report with findings categorized as critical, important, minor. Read-only, modifies nothing.

---

## What new projects inherit

Every project created via `project-setup` is born with the standard Nexforce package embedded in the generated `CLAUDE.md`:

**Interaction protocol:**
- Ask First Sequential in 4 steps (context → audience → scope → format)
- Single question per ambiguity (no stacking 5 questions for 1 doubt)
- Mandatory confirmation before long artifact or destructive operation

**Memory and feedback structure:**
- `MEMORY.md` append-only created with header and initial entry (decisions and context)
- `FEEDBACK.md` append-only created with header (user corrections and preferences)
- Instruction to read the last 3-5 entries of MEMORY.md and last 5-10 of FEEDBACK.md before substantive work
- Skill `compress-session` invoked at the end of substantive sessions
- Skill `capture-feedback` invoked whenever the user corrects output or states a preference
- Skill `skill-suggester` invoked weekly (or via scheduled action) to audit and propose improvements

**Default behavior:**
- Direct to the point, no preamble
- Take a position when asked, signal uncertainty (high/moderate/low)
- Honest push back if the premise is wrong
- Hold position under pressure without new argument
- No flattery ("great question", "you are absolutely right")
- No false conclusions ("in conclusion", "to summarize")
- No em-dash, no inflated vocabulary
- Emoji only when they add real meaning (status, sentiment), not as decoration
- Trade-offs always accompanied by a recommendation

Claude Code projects receive a calibrated version (technical rules: verify APIs before asserting, confirmation before `git push --force`, no committing secrets, etc).

---

## Maintenance rules

1. **Models updated:** review `references/models-pricing.md` monthly. Anthropic releases new models frequently.
2. **Skills immutable in production:** version changes. Modifying an active skill can break behavior.
3. **Subagents independent:** each subagent must work without context from the main conversation. Brief must be self-contained.
4. **Ask First Sequential:** all creation skills must ask before generating. No exceptions.
5. **Behavior patch in new projects:** update `project-setup` templates whenever the standard Nexforce package evolves.
6. **Hooks for critical projects:** every Claude Code project in production must have at least destructive-block hooks (`block-destructive`) and audit log.
7. **MEMORY.md in long projects:** invoke `compress-session` at the end of each substantive session. Without it, we lose context between interactions.
8. **No em-dash:** absolute writing rule across every artifact.
9. **English-only for canonical artifacts:** see Language policy above. Communication is user's language, files are English.

---

## Version

V1, May 2026.

**V1.5 capabilities:**
- 16 skills (Claude artifact creation, hook design, persistent memory, feedback loop, self-improvement, CLAUDE.md compression)
- 7 subagents (Opus for reasoning, Sonnet for structured creation, audit, and feedback analysis)
- 11 reference docs (models, prompts, tools, MCP, Agent SDK, hooks, self-improvement-loop, skill-archive, memory-archive, anthropic-urls, ask-first-sequential)
- 6 templates (CLAUDE.md, skill, subagent, feedback-md, hooks-default-claude-code, output-formats)
- Embedded Ask First Sequential protocol (canonical detail in references/)
- Standard Nexforce behavior package embedded in new projects
- Append-only MEMORY.md + FEEDBACK.md + compression skills
- 4 pre-installed skills in every new project (token-budget, compress-session, capture-feedback, skill-suggester)
- 2 default scheduled actions recommended in every new project (weekly-skill-audit, monthly-claude-md-review)
- 3 default hooks in every Claude Code project (block-destructive, audit-log, session-end-compress)
- Mandatory versioning on all SKILL.md and subagents/*.md
- Automatic quality audit across 9 dimensions via `quality-reviewer` v1.1 (V1.4 checks included)
- Global rules promoted to /Users/vitti/Documents/Claude/About Me/about-me.md

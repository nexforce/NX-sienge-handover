---
name: design-agent-architecture
version: 1.0
description: Designs full Claude agent architecture (single vs multi-agent, tool selection, MCP, agentic loops, memory, planning). Use when the user asks to design, draft, or structure an agent, "how to build an agent for X", "what architecture to automate Y", "I need an agent that does Z". Always runs Ask First Sequential.
allowed-tools: [AskUserQuestion, Read, Write]
---

# design-agent-architecture

## What it does

Designs the end-to-end technical architecture of a Claude agent: model choice, pattern (ReAct, Reflection, multi-agent), tools, MCP servers, memory management, agentic loops, main prompt, and subagents. Output: architecture document + implementation plan.

## When to invoke

- "How to build an agent for [complex task]"
- "What is the ideal architecture to automate [process]"
- "I need to design an agent that [behavior]"
- "Single or multi-agent for [case]"
- Technical decision before starting implementation
- **"Create subagents for this project"** (amendment mode)
- **"Add artifacts to this project"** (amendment mode)
- **"Add scheduled actions to this project"** (amendment mode)
- **"Create what makes sense for this project"** (any variation of delegated-decision phrasing, amendment mode). Ask First applies in full.

## When NOT to invoke

- Configure a specific CLAUDE.md, use `create-claude-md`
- Create a single prompt, use `design-prompt`
- Choose a model in isolation, use `choose-model`

## Workflow

### 1. Ask First Sequential

Use `AskUserQuestion`:

**Q1, Agent mission:**
- Open question: "In 2-3 lines, what does the agent do from start to finish?"

**Q2, Inputs and outputs:**
- Open question: "What goes in (format, volume) and what comes out (format, volume)?"

**Q3, External systems to integrate:**
- HubSpot
- Slack
- Google Drive / Docs / Sheets
- ClickUp / Asana / Linear
- Email (Gmail/Outlook)
- LinkedIn / Apollo / ZoomInfo
- Stripe / QuickBooks
- Custom API
- Web (search/fetch)
- None

**Q4, Task complexity:**
- Linear (1 input, N fixed steps, 1 output)
- Decision (needs to branch based on input)
- Loop (runs until stop criterion)
- Multi-step with handoff between specialties
- Multi-agent (orchestrator + N specialists)

**Q5, Latency and volume:**
- Real-time (response in <5s)
- Async acceptable (response in minutes)
- Batch (nightly job)
- Estimated volume: __ requests/day

**Q6, Where it runs:**
- Cowork (desktop, interactive user)
- Claude Code (terminal, dev)
- Standalone API (own server, Agent SDK)
- Workflow tool (n8n, Zapier, etc)

### 2. Decide architectural pattern

| Case | Recommended pattern |
|---|---|
| 1 input, N fixed steps | Linear pipeline (single prompt or skill with workflow) |
| Decision + N possible tools | ReAct (tool use loop) |
| Output needs self-correction | Reflection (generate, critique, revise) |
| 3+ specialized domains | Multi-agent (orchestrator + subagents) |
| Very long task | Prompt chaining (intermediate outputs) |
| Solution exploration | Tree of Thoughts |

### 3. Select model

Apply `choose-model` logic:

| Task | Model |
|---|---|
| Orchestrator / multi-step reasoning | Opus 4.6 |
| Production default | Sonnet 4.6 |
| Simple subagent / high volume | Haiku 4.5 |

Recommended mix in multi-agent: orchestrator = Opus, specialists = Sonnet/Haiku per task.

### 4. Map tools

For each workflow step, define:

| Step | Tool | Provider | Approximate cost |
|---|---|---|---|
| Search lead | `hubspot_search_contact` | MCP HubSpot | Free |
| Enrich | `apollo_people_match` | MCP Apollo | $0.30/lead |
| Generate copy | LLM call | Claude API | $0.01/output |
| Send email | `gmail_send` | MCP Gmail | Free |

Decide: client tool (executes in our code) vs server tool (`web_search`, `code_execution`).

### 5. Define agentic loop

For tool-use patterns:

```
1. Main prompt receives input
2. Claude decides: call tool or respond
3. If tool: execute, result returns as tool_result
4. Loop until max_turns or Claude responds without tool
```

Define:
- `max_turns` (typically 10-20)
- Stop criterion (final output or specific step)
- Error handling (retry, fallback, escalation)

### 6. Memory and state

| Need | Implementation |
|---|---|
| Conversation context | API messages history |
| Long memory (cross-session) | External storage (DB, file) + prompt injection |
| Intermediate state | Variables in orchestrating code |
| Knowledge base | RAG (vector DB + retrieval) or MCP with knowledge tool |

### 7. Design main prompt and subagents

For single agent: 1 detailed system prompt + tool definitions.

For multi-agent:
- 1 orchestrator prompt (decides which subagent to invoke)
- N subagent prompts (restricted scope, own tools)

Each follows the pattern of `create-claude-md` or `create-subagent`.

### 8. Estimate cost

```
cost/request = (input_tokens × $input_rate) + (output_tokens × $output_rate) + (tool_calls × tool_cost)
```

Input/output prices per MTok: consult `references/models-pricing.md` or https://platform.claude.com/docs/en/about-claude/pricing before fixing an estimate. If you need a confirmed value, delegate to subagent `docs-researcher`.

Calculate monthly cost: requests/day × 30 × cost/request.

Apply optimizations when applicable:
- Prompt caching, ~90% reduction on cached tokens
- Batch API, 50% discount if workload is async
- Model mix in multi-agent: Opus only in orchestrator, Sonnet/Haiku in specialists

### 9. Decide on Artifacts and Scheduled Actions

Before closing the architecture, evaluate two additional layers for Cowork-based agents:

**Artifacts (persistent live views):**
Ask: does this agent produce outputs the user will consult repeatedly, where the underlying data changes over time?

If yes, design an Artifact:
- Created via `mcp__cowork__create_artifact`
- Calls connector MCPs on load to pull live data
- Can use Chart.js, Grid.js, or Mermaid from CDN
- `window.cowork.callMcpTool(name, args)` to fetch connector data
- `window.cowork.askClaude(prompt, data[])` for inline AI summaries

Typical artifact candidates in agent architectures:
- Pipeline tracker (reads HubSpot deals on load)
- Sprint board (reads ClickUp tasks on load)
- Weekly digest (reads Slack channels + summarizes)
- Metrics dashboard (reads analytics tool on load)

**Scheduled Actions (recurring automation):**
Ask: does this agent run a workflow that should repeat on a cadence without manual invocation?

If yes, design a Scheduled Action:
- Created via `mcp__scheduled-tasks__create_scheduled_task`
- Accepts cron expressions (e.g., `"0 8 * * 1"` for Monday 8am) or `fireAt` for one-time
- The task prompt tells Claude what to do on each run
- Output goes where the task directs (Slack message, email draft, artifact update)

Typical schedule candidates:
- Daily morning briefing (pipeline + calendar + open tasks)
- Weekly performance report (metrics + variance)
- Prospect enrichment batch (run nightly)
- Follow-up reminder sweep (run weekdays at 9am)

**Combination:** if the agent produces a persistent view AND should update it on a cadence, design both. The scheduled task refreshes the data; the artifact shows it.

Document the decision in the architecture with:

```
## 13. Artifacts
[Artifact name | What it shows | MCP tools it calls | Refresh pattern]

## 14. Scheduled Actions
[Task name | Cadence (cron) | What Claude does | Output destination]
```

If neither applies: state explicitly "No artifacts or scheduled actions required" with justification.

### 9b. Amendment mode (adding to existing projects)

When the user asks to add subagents, artifacts, or scheduled actions to a project that already has a CLAUDE.md and skills, run this protocol before executing anything:

**Step A: Read the project first.**
Read the target project's CLAUDE.md, existing skills, and subagents folder. Understand what already exists.

**Step B: Ask First for each component type requested.**

For **subagents**, ask via AskUserQuestion:
- Which tasks in this project require isolated context or deep reasoning that a skill cannot handle?
- For each candidate subagent: specialty, preferred model (Opus/Sonnet/Haiku), tools it needs, 2-4 examples of invocation.
- Confirm: only create a subagent when a skill cannot solve it.

For **artifacts**, ask via AskUserQuestion:
- What specific output should the artifact show?
- Which connector data does it display (list the MCP tools)?
- How often will it be opened: on demand, daily, or weekly?
- Probe each MCP tool the artifact will call before writing any HTML (call it once in chat, inspect the response shape, then build the parser).

For **scheduled actions**, ask via AskUserQuestion:
- What exact task should run automatically?
- What cadence? (daily, weekly, hourly. Get the specific time.)
- Where does the output go? (Slack message, email draft, artifact update, file)

**Step C: Only after all answers are collected.** execute. Never infer from "what makes sense" without the user answering steps A-B first.

### 10. Deliver architecture document

Structure:

```
# Architecture, Agent [Name]

## 1. Mission
## 2. Inputs & Outputs
## 3. Architectural pattern (with justification)
## 4. Models (mix if applicable)
## 5. Tools and integrations
## 6. Flow (ASCII or mermaid diagram)
## 7. Memory and state
## 8. Prompts (main + subagent drafts)
## 9. Cost estimate
## 10. Implementation plan (phases)
## 11. Risks and mitigation
## 12. Success metrics (recommended eval)
## 13. Artifacts (or "none, with justification")
## 14. Scheduled Actions (or "none, with justification")
```

Save to `outputs/agents/<name>/architecture-v1.md` in the target project (not `meta-agent`).

### 11. Suggest next steps

1. Validate architecture with stakeholder
2. Implement Phase 1 (MVP)
3. Run eval with `build-eval`
4. Iterate until threshold is hit
5. Promote to production with monitoring
6. Build Artifacts and configure Scheduled Actions as the final production layer

## Expected output

Markdown document of 400-1000 lines, depending on complexity.

## Example

**User input:**
> I want an agent that handles ISV partner prospecting from scratch: discovers ICP in Apollo, enriches, generates personalized copy, sends LinkedIn DM + email, updates HubSpot, schedules follow-up.

**Expected behavior:**
1. Skill runs Ask First
2. User answers (mission, inputs/outputs, systems: Apollo+HubSpot+LinkedIn+Gmail, complexity: decision+handoff, async, 50 prospects/day, standalone API)
3. Skill proposes: Multi-agent (orchestrator Opus + subagents: prospector Sonnet, copywriter Sonnet, dispatcher Haiku)
4. Maps tools: Apollo MCP (search, enrich), HubSpot MCP (contacts, deals), LinkedIn (via Apollo or scraper), Gmail MCP
5. Defines loop: orchestrator, prospector searches lead, copywriter generates 3 variants, dispatcher sends + updates HubSpot, loops to next lead until quota
6. Estimated cost: ~$X/day
7. Delivers document + 3-phase plan

## Restrictions

- Do not recommend multi-agent for a task a single agent solves. Extra cost and complexity must be justified.
- Always consider latency (Extended Thinking can add 30-90s).
- Flag risks: rate limits, unforeseen costs, dependency on third-party MCP.
- No em-dash. No inflated vocabulary.

## References

- Reference: `references/agent-sdk.md`, `references/mcp-protocol.md`, `references/tool-use.md`, `references/models-pricing.md`
- Subagent: `agent-architect` (delegation for critical architectures)
- Docs: https://platform.claude.com/docs/en/build-with-claude/agents
- MCP: https://modelcontextprotocol.io

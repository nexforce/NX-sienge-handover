# CLAUDE.md Compression Report, meta-agent

**Date:** 2026-05-28
**Current length:** 382 lines
**Proposed length after all changes:** ~210 lines (delta -172)
**Skill executed:** `skills/compress-claude-md/SKILL.md` v1.0

---

## Summary

CLAUDE.md is operational but trending toward reference-doc territory. ~45% of lines are content that belongs in `references/` or `templates/` (Output formats, Reference URLs, domain detail blocks). Moving those out keeps CLAUDE.md focused on identity, protocol, behavior, and the live skill registry, the things the agent must load every session.

One critical writing-rule violation found inline (em-dash in line 295). The compression also removes 1 duplicate definition between CLAUDE.md and README.md (skills table).

---

## Audit findings

| Metric | Count |
|---|---|
| Total lines | 382 |
| Sections | 11 |
| Sections >50 lines | 4 (Domains, Ask First Sequential, Output formats, Project structure) |
| Duplicates detected | 1 (skills table also in README.md, lists subagents in 2 places) |
| Contradictions detected | 0 |
| Dead references | 0 |
| Em-dash violations | 1 (line 295, inside artifact recommendation template) |
| Move-to-references candidates | 3 (Output formats, Reference URLs, domain sub-blocks) |

---

## Conflicts (resolve first)

None.

---

## Proposals

### Proposal 1: Fix em-dash violation in artifact recommendation template

**Type:** Vocabulary violation

**Current state (line 295):**
```
Data sources: [MCP tools it calls — verify response shape before building]
```

**Proposed change:**
```diff
- Data sources: [MCP tools it calls — verify response shape before building]
+ Data sources: [MCP tools it calls, verify response shape before building]
```

**Rationale:** CLAUDE.md `## Behavior > Never` bans em-dash with no exception. The artifact rule must follow the same writing rule. Critical, not optional.

**Expected line delta:** 0 (in-line fix)

---

### Proposal 2: Move "Output formats" section to templates/

**Type:** Move-to-templates

**Current state:** Lines 230-309 (80 lines). Contains 5 reusable formatted blocks: Technical explanation, Comparison, Model decision, Prompt structure, Skill (official format), Artifact recommendation, Scheduled action recommendation.

**Proposed change:** Cut from CLAUDE.md, create `templates/output-formats.md` with the same content. Replace in CLAUDE.md with:

```diff
- ## Output formats
- 
- ### Technical explanation
- [80 lines of formatted blocks]
+ ## Output formats
+ 
+ Reusable output templates live in `templates/output-formats.md`. Consult when producing:
+ - Technical explanations (concept, mechanism, when to use, trade-offs)
+ - Comparisons (characteristic table)
+ - Model decisions (task, volume, latency, recommendation, cost)
+ - Prompt structures (XML system/user/instructions/examples/output)
+ - Skill frontmatter (official Anthropic format)
+ - Artifact recommendations (trigger, data sources, refresh, offer phrase)
+ - Scheduled action recommendations (trigger, cadence, task, output, offer phrase)
```

**Rationale:** These are templates, not behavior rules. They belong in `templates/` next to `claude-md-template.md`, `skill-template.md`, `subagent-template.md`, `feedback-md-template.md`. Loading them on every session inflates CLAUDE.md without informing behavior.

**Expected line delta:** -72

---

### Proposal 3: Move "Reference resources" table to references/anthropic-urls.md

**Type:** Move-to-references

**Current state:** Lines 313-326 (14 lines). Table of 10 Anthropic URLs (docs, platform, support, MCP, tutorial, console).

**Proposed change:** Cut from CLAUDE.md, create `references/anthropic-urls.md`. Replace in CLAUDE.md with:

```diff
- ## Reference resources
- 
- | Resource | URL | When to use |
- |---|---|---|
- [10 URL rows]
+ ## Reference resources
+ 
+ See `references/anthropic-urls.md` for the canonical list of Anthropic documentation, platform, and tutorial URLs.
```

**Rationale:** URL list is reference material, not behavior. references/ already exists for exactly this. Reduces CLAUDE.md and removes maintenance burden if URLs change.

**Expected line delta:** -12

---

### Proposal 4: Collapse "Domains" sub-sections into a pointer

**Type:** Move-to-references

**Current state:** Lines 36-123 (88 lines). Six sub-sections (Claude models, Prompt Engineering, API and integration, Agents and protocols, Behavior configuration, When to recommend Artifacts vs Scheduled Actions vs One-off output, Anthropic interfaces). All are reference content already covered in `references/models-pricing.md`, `references/prompt-engineering.md`, `references/tool-use.md`, `references/agent-sdk.md`, `references/mcp-protocol.md`, `references/hooks-protocol.md`.

**Proposed change:** Replace the 88-line block with a 12-line pointer:

```diff
- ## Domains
- 
- ### Claude models (May 2026)
- [40-line table]
- 
- ### Prompt Engineering
- [12 bullets]
- 
- ### API and integration
- [10 bullets]
- 
- ### Agents and protocols
- [5 bullets]
- 
- ### Behavior configuration
- [9 bullets]
- 
- ### When to recommend Artifacts vs Scheduled Actions vs One-off output
- [table + 2 bullet blocks]
- 
- ### Anthropic interfaces
- [6 bullets]
+ ## Domains
+ 
+ Full command of the Anthropic ecosystem. Detailed references live in `references/`:
+ 
+ | Domain | Reference file |
+ |---|---|
+ | Models, pricing, context windows | `references/models-pricing.md` |
+ | Prompt engineering techniques | `references/prompt-engineering.md` |
+ | Tool use, function calling | `references/tool-use.md` |
+ | Claude Agent SDK | `references/agent-sdk.md` |
+ | MCP (Model Context Protocol) | `references/mcp-protocol.md` |
+ | Claude Code hooks | `references/hooks-protocol.md` |
+ | Self-improvement loop (V1.4) | `references/self-improvement-loop.md` |
+ | Skill archive protocol | `references/skill-archive-protocol.md` |
+ | MEMORY.md archive policy | `references/memory-archive-policy.md` |
+ 
+ Behavior configuration artifacts (Skills, Subagents, CLAUDE.md, Hooks, MEMORY.md, FEEDBACK.md, Artifacts, Scheduled Actions): see `references/self-improvement-loop.md` for how they integrate.
+ 
+ When to recommend Artifact vs Scheduled Action vs one-off output: see `templates/output-formats.md`.
```

**Rationale:** Domain content lives in references/. Inlining 88 lines here is duplication. The pointer keeps discoverability without the maintenance burden. Bonus: surfaces the 3 new V1.4 references that did not exist before.

**Expected line delta:** -76

---

### Proposal 5: Remove duplicate skills table (kept in README.md only)

**Type:** Duplicate

**Current state:** Lines 346-364 (19 lines). Tabela de 16 skills. Same table exists in README.md.

**Proposed change:**

```diff
- Available skills:
- 
- | Skill | Function |
- |---|---|
- [16 rows]
+ Active skills (16 total): see `README.md` for the full table with descriptions. The agent must invoke the 4 mandatory skills per the Session Protocol section above.
```

**Rationale:** Same table maintained in 2 places. Adding a skill requires editing both files. README.md is the canonical surface for navigation. CLAUDE.md only needs to reference the 4 mandatory skills (already covered in Session Protocol).

**Expected line delta:** -15

---

### Proposal 6: Collapse "Ask First Sequential Protocol" detail

**Type:** Move-to-references (partial)

**Current state:** Lines 126-206 (81 lines). Full protocol with 7 steps detailed inline.

**Proposed change:** Keep the absolute rule + path rule + "What makes sense" rule + "When NOT to ask" inline (these are behavioral). Move the 7-step detail to `references/ask-first-sequential.md`:

```diff
- ## Ask First Sequential Protocol
- 
- **Absolute rule:** [paragraph]
- 
- **Shortcut for new projects:** [paragraph]
- 
- **MANDATORY RULE — PATH BEFORE FILES:** [block]
- 
- Fixed order:
- 
- ### Step 1, Project context
- [details]
- 
- ### Step 2, CLAUDE.md
- [details]
- 
- [Steps 3 through 7 in detail, ~50 lines]
- 
- **"What makes sense" is not authorization.** [paragraph]
- 
- **Adding to existing projects.** [paragraph]
- 
- **When NOT to ask (answer directly):**
- [bullets]
- 
- **Rule of thumb:** [paragraph]
+ ## Ask First Sequential Protocol
+ 
+ **Absolute rule:** before generating any substantial project or artifact, you **must** use `AskUserQuestion` in **separate steps**. Do not ask everything at once. Each step starts only after the previous is answered.
+ 
+ **Shortcut for new projects:** invoke the `project-setup` skill directly. It implements the full protocol.
+ 
+ **MANDATORY RULE, PATH BEFORE FILES:** Never create project files before the destination path is confirmed. Cowork: `/Users/vitti/Documents/Claude/Projects/[Area]/[project-name]/`. Claude Code: `/Users/vitti/Documents/Developer/[Area]/[project-name]/`. Do not write a single file until the type + area + name are confirmed.
+ 
+ Areas (Cowork): AI, Alliance, CEO, Finance, Legal, Marketing, People, Sales.
+ Areas (Claude Code): AI, Alliance, CEO, Finance, Legal, Marketing, People, Product, Sales.
+ 
+ **Full 7-step detail:** see `references/ask-first-sequential.md` (also embedded in `skills/project-setup/SKILL.md` for new projects).
+ 
+ **"What makes sense" is not authorization.** Any phrasing that delegates the decision to Claude ("create what makes sense", "o que faz sentido") is NOT permission to execute without asking.
+ 
+ **Adding to existing projects.** Same protocol applies. Existence of prior CLAUDE.md does not skip or shorten the protocol.
+ 
+ **When NOT to ask (answer directly):** direct question about Claude documentation or concept, technical comparison, prompt debugging, exploratory conversation.
+ 
+ **Rule of thumb:** if the task produces a reusable file or structure, follow the sequential protocol. No exception.
```

**Rationale:** The 7 detailed steps are duplicated inside `skills/project-setup/SKILL.md` (which is the actual execution surface). CLAUDE.md only needs the principle, the path rule, and the "when not to ask" exception. Detail belongs in references/ for cross-reference.

**Expected line delta:** -50

---

### Proposal 7: Remove dated "Last updated" footer (move to MEMORY.md)

**Type:** Move-to-memory

**Current state:** Line 382: `*Last updated: May 2026. Version V1.*`

**Proposed change:** Remove. The version and update history live in MEMORY.md entries. CLAUDE.md should not carry version footers (they go stale and create noise).

**Expected line delta:** -2

---

## Items NOT proposed for change

- `## Identity` (lines 3-9): core, mandatory, no redundancy.
- `## Session Protocol` (lines 13-20): operational, V1.4 fresh, no compression possible.
- `## Audience` (lines 22-32): operational, identifies user profiles.
- `## Behavior` (lines 210-227): core operational rules, no duplication.
- `## Nexforce context` (lines 370-378): identity context, short and load-bearing.

---

## Summary and ranked next actions

| # | Proposal | Priority | Line delta |
|---|---|---|---|
| 1 | Fix em-dash in line 295 | Critical | 0 |
| 2 | Move Output formats to templates/ | P0 | -72 |
| 4 | Collapse Domains into pointer | P0 | -76 |
| 6 | Collapse Ask First Sequential detail | P1 | -50 |
| 5 | Remove duplicate skills table | P1 | -15 |
| 3 | Move Reference URLs to references/ | P2 | -12 |
| 7 | Remove version footer | P2 | -2 |

**Total expected reduction:** -227 lines on paper, ~-172 after adding back the pointers and short summaries. Final CLAUDE.md target: ~210 lines.

**Recommended sequence:**
1. Fix critical first (Proposal 1).
2. Apply P0 (Proposals 2 and 4) for the biggest win.
3. Then P1 and P2 as cleanup.

Approval required for each proposal before any file is edited.

---

## Restrictions respected

- Read-only audit. No CLAUDE.md edits applied.
- All proposals shown as diffs.
- Maximum 10 proposals per report (7 here, within budget).
- No em-dash in this report.
- Cap maintained: Identity, Mission, Session Protocol, Behavior core kept untouched.

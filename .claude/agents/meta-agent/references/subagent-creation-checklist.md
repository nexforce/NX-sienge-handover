# Subagent Creation Checklist

## Scope

Mandatory validation checklist before saving any new `subagents/<name>.md` or bumping the version of an existing one. Used by:

- `create-subagent` skill (final Step before Write)
- `agent-architect` subagent (if delegating subagent creation)
- `optimize-project` skill (when refactoring existing subagents)
- `quality-reviewer` subagent (Dimension 6 structural completeness, audit pass)

If any item below is NOT marked, do not save. Fix and re-run the checklist.

---

## Section A, Frontmatter (mandatory fields)

- [ ] **A1.** `---` delimiters present at top
- [ ] **A2.** `name:` field, kebab-case, matches filename (e.g., file `subagents/feedback-analyzer.md` has `name: feedback-analyzer`)
- [ ] **A3.** `version:` field present, starts at `1.0`. Bump on edit (1.x backward-compatible, 2.0 breaking)
- [ ] **A4.** `description:` is a multi-line YAML block (`|`) containing:
  - 1-3 sentences explaining the specialty and when to delegate
  - At least 2 `<example>` blocks with `Context`, `user`, `assistant`, `<commentary>` format
  - Each example explains why this subagent vs inline execution
- [ ] **A5.** `tools:` is a YAML list (not a string), explicit. Read-only subagents must NOT include Write, Edit, Bash with write capabilities
- [ ] **A6.** `model:` field is one of `opus`, `sonnet`, `haiku` (or omitted to inherit), with the choice justified in the body

## Section B, Structural completeness

- [ ] **B1.** Body starts with `You are [Subagent Name], [one-line specialty]` line
- [ ] **B2.** `## Mission` section, 2-3 lines, what the subagent delivers when invoked
- [ ] **B3.** `## When the main agent should invoke this subagent` section with concrete delegation triggers
- [ ] **B4.** `## When NOT to invoke` section listing at least 2 cases where this subagent should not run
- [ ] **B5.** `## Operating principles` or equivalent section listing 5-8 numbered principles
- [ ] **B6.** `## Workflow` or `## Methodology` section, numbered steps
- [ ] **B7.** `## Output` or `## Output format` section, exact format the subagent returns
- [ ] **B8.** `## Restrictions` or `## Constraints` section listing what the subagent must NOT do
- [ ] **B9.** `## References` section listing related artifacts (skills, references, templates)
- [ ] **B10.** If model is Opus or has Extended Thinking, this is explicit in the body with rationale

## Section C, Self-containment (critical for subagents)

- [ ] **C1.** The subagent's prompt is self-contained. A reader with no prior context understands what to do
- [ ] **C2.** No reference to "the main agent" without explaining what the main agent passes as input
- [ ] **C3.** All file paths used by the subagent are explicit or templated (no implicit cwd assumption)
- [ ] **C4.** Required inputs and expected outputs are listed in Mission or Workflow
- [ ] **C5.** Failure modes are addressed (input missing, file not found, ambiguous brief)

## Section D, Model selection justification

- [ ] **D1.** If `opus`: justified by long reasoning chains, multi-step decisions, or complex trade-offs
- [ ] **D2.** If `sonnet`: default for most subagents; explicit if balance of quality and cost matters
- [ ] **D3.** If `haiku`: justified by simple, well-defined, latency-critical or high-volume task
- [ ] **D4.** Tools list aligned with model capabilities and task scope (do not assign 10 tools to a haiku subagent)

## Section E, Read-only vs write subagents

- [ ] **E1.** If subagent is read-only (audit, analysis, research), `tools:` excludes Write, Edit, and write-capable Bash
- [ ] **E2.** Read-only subagents return their output as text in the response, not by writing files
- [ ] **E3.** If subagent writes files, it writes only to specified output paths, never to canonical artifacts (CLAUDE.md, skills/, subagents/) without explicit user-confirmed approval relayed by the main agent

## Section F, Language and writing rules

- [ ] **F1.** Body in **English**. No exception based on user's language
- [ ] **F2.** Legitimate PT only in: simulated user input inside `<example>` blocks (representing real PT user interaction), trigger phrases that need to detect PT
- [ ] **F3.** No em-dash (—) in the body, except when explicitly citing the banned character
- [ ] **F4.** No sycophancy patterns, no false conclusions, no meta-introductions
- [ ] **F5.** Operating principles and workflow steps are imperative ("Read", "Validate", "Return"), not declarative prose

## Section G, Integration with main agent

- [ ] **G1.** The brief the main agent will send is anticipated. If specific input fields are required, list them in Mission
- [ ] **G2.** Output format aligns with what the main agent will consume (text summary, file path, structured report)
- [ ] **G3.** If subagent should NOT auto-apply changes, this is in Restrictions with explicit "return as draft, main agent decides"
- [ ] **G4.** If subagent uses Extended Thinking, this is noted (no need to instruct it, Opus uses it by default)

## Section H, Versioning hygiene

- [ ] **H1.** If edit, version is bumped (1.x or 2.0)
- [ ] **H2.** `<!-- Changelog -->` block exists below frontmatter listing what changed
- [ ] **H3.** Bump rationale logged in project's MEMORY.md after save

---

## How to use this checklist

**By `create-subagent` skill:**

After drafting subagent content but before calling `Write`, the skill must:

1. Read this checklist (`references/subagent-creation-checklist.md`).
2. Verify each item against the draft.
3. If any item fails, fix and re-verify.
4. Only then call `Write`.

**By `quality-reviewer` (audit on existing subagent):**

Run every item against the subagent on disk. Report missing items, severity:
- Section A, B, C, E violations: **Critical** (broken contract or unsafe behavior)
- Section D, F, G violations: **Important**
- Section H violations: **Minor or Important** depending on whether the change is silent or documented elsewhere

---

## Anti-patterns this checklist catches

| Anti-pattern | Caught by |
|---|---|
| Subagent without version field | A3 |
| Description missing `<example>` blocks | A4 |
| Subagent that depends on main-agent conversation context | C1, C2 |
| Read-only subagent with Write/Edit in tools | E1 |
| Opus model assigned to a trivial task | D1 |
| Subagent that overwrites canonical artifacts without approval | E3 |
| Subagent in PT because the user wrote in PT | F1 |
| Em-dash in the system prompt | F3 |
| Edit without version bump | H1 |
| No "When NOT to invoke" leading to over-delegation | B4 |

---

## Difference from skill checklist

Subagents have stricter requirements than skills on three fronts:

1. **Self-containment** (Section C): subagents do not see the main conversation. The prompt must work standalone.
2. **Model selection** (Section D): explicit justification because model choice affects cost and latency materially.
3. **Read-only enforcement** (Section E): many subagents are audit-style; the tools list must prevent accidental writes.

Skills are inline workflows. Subagents are isolated agents. The contract is different and the checklist enforces that.

---

## Version

V1.0, 2026-05-28.

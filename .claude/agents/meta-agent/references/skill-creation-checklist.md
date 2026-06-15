# Skill Creation Checklist

## Scope

Mandatory validation checklist before saving any new SKILL.md or bumping the version of an existing one. Used by:

- `create-skill` skill (final Step before Write)
- `skill-builder` subagent (validation phase before returning to caller)
- `optimize-project` skill (when refactoring existing skills)
- `quality-reviewer` subagent (Dimension 6 structural completeness, audit pass)

If any item below is NOT marked, do not save. Fix and re-run the checklist.

---

## Section A, Frontmatter (mandatory fields)

- [ ] **A1.** `---` delimiters present at top
- [ ] **A2.** `name:` field, kebab-case, matches folder name (e.g., folder `skills/draft-email/` has `name: draft-email`)
- [ ] **A3.** `version:` field present, starts at `1.0`. On edits to existing skills, bump appropriately (1.x backward-compatible, 2.0 breaking)
- [ ] **A4.** `description:` field is 2-4 sentences, includes:
  - What the skill does (1 sentence)
  - When to invoke (specific scenarios, not generic)
  - Trigger phrases (3-6 representative phrases the user would say)
- [ ] **A5.** `allowed-tools:` is a YAML list (not a string), explicit (do not write `*`)

## Section B, Structural completeness

- [ ] **B1.** `# Skill Name` header (title case, matches kebab-case name)
- [ ] **B2.** `## What it does` section, 2-3 lines, more detailed than the description
- [ ] **B3.** `## When to invoke` section, with concrete trigger examples beyond what is in the description
- [ ] **B4.** `## When NOT to invoke` section, with at least 2 explicit non-cases (this is what disambiguates from neighboring skills)
- [ ] **B5.** `## Prerequisites` section if any external state or input is required
- [ ] **B6.** `## Workflow` section, numbered steps, every step is a verb-led instruction
- [ ] **B7.** `## Output` section, describes what the skill produces (file path, format, structure)
- [ ] **B8.** `## Restrictions` section, lists what the skill must NOT do
- [ ] **B9.** `## Examples` section with at least 1 worked example (input + behavior + output)
- [ ] **B10.** `## References` section listing related skills, subagents, references

## Section C, Workflow quality

- [ ] **C1.** Every workflow step has a verb at the start ("Read", "Validate", "Ask", "Write", "Run"), not nouns or passive voice
- [ ] **C2.** If the skill creates a substantial artifact, an `AskUserQuestion` call is the first step or among the first steps
- [ ] **C3.** Decision points are explicit (when to branch, when to halt, when to ask user)
- [ ] **C4.** Failure modes are addressed (what to do if a precondition fails, file missing, user declines)
- [ ] **C5.** The final output destination is explicit (path, file format)

## Section D, Triggers and disambiguation

- [ ] **D1.** Description lists 3-6 trigger phrases the user is likely to say
- [ ] **D2.** Triggers include both PT and EN variants if the skill should detect both languages
- [ ] **D3.** Triggers are specific enough to disambiguate from other skills (a user saying "create a doc" should not match 3 different skills)
- [ ] **D4.** "When NOT to invoke" section explicitly lists 2+ adjacent skills and why this skill is wrong for them

## Section E, Language and writing rules

- [ ] **E1.** Body of the SKILL.md is in **English**. No exception based on user's language
- [ ] **E2.** Legitimate PT only in: trigger phrases meant to detect PT corrections, user input simulated in `<example>` blocks, voice references
- [ ] **E3.** No em-dash (—) in the body, except when explicitly citing the banned character
- [ ] **E4.** No sycophancy patterns
- [ ] **E5.** No false conclusions ("in conclusion", "to summarize", "em conclusão")
- [ ] **E6.** No meta-introductions ("let's explore", "vamos explorar", "it's important to note")
- [ ] **E7.** Each sentence in the workflow adds operational value, no padding

## Section F, Integration

- [ ] **F1.** If the skill writes to MEMORY.md, FEEDBACK.md, or outputs/, the path is absolute or anchored to the project root, not relative
- [ ] **F2.** If the skill invokes another skill or subagent, the reference path is correct (`skills/<name>/SKILL.md` or `subagents/<name>.md`)
- [ ] **F3.** If the skill should be triggered by a scheduled action, the cron pattern is specified somewhere (description or Workflow Step)
- [ ] **F4.** Cross-references in the References section actually exist (grep the target file paths)

## Section G, Versioning hygiene

- [ ] **G1.** If this is an edit to an existing skill, the version is bumped
- [ ] **G2.** A `<!-- Changelog -->` comment block exists below the frontmatter listing what changed at each version
- [ ] **G3.** Bump rationale is documented in the project's MEMORY.md after save

---

## How to use this checklist

**By `create-skill` skill:**

After drafting the SKILL.md content but before calling `Write`, the skill must:

1. Read this checklist file (`references/skill-creation-checklist.md`).
2. Verify each item against the draft.
3. If any item fails, fix and re-verify.
4. Only then call `Write`.

**By `skill-builder` subagent:**

Before returning to the calling agent, the subagent must complete this checklist on the draft. If any item fails, fix in the same invocation.

**By `quality-reviewer` subagent (audit on existing skill):**

Run through every checklist item against the skill currently on disk. Report missing items as findings, with severity:
- Section A, B violations: **Critical** (frontmatter broken or required section missing)
- Section C, D, E violations: **Important** (skill exists but quality compromised)
- Section F, G violations: **Minor or Important** depending on impact

---

## Anti-patterns this checklist catches

| Anti-pattern | Caught by |
|---|---|
| SKILL.md without version field | A3 |
| Description without trigger phrases | A4 |
| Skill that overlaps with another without disambiguation | D3, D4 |
| Workflow written in passive prose, no actionable steps | C1, C3 |
| Skill that creates files in `Outputs/` capitalized (V1.5 lowercase canonical) | F1 |
| Skill in PT because the user wrote in PT | E1 |
| Em-dash in workflow steps | E3 |
| No "When NOT to invoke" leading to over-triggering | B4, D4 |
| Edit to existing skill without version bump | G1, G2 |

---

## Version

V1.0, 2026-05-28.

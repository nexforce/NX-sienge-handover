---
name: manage-versions
version: 1.0
description: Manages versioning across all Nexforce projects, both internal artifacts (skills, subagents, CLAUDE.md) and project-level (VERSION file at root). Use when creating a new project (auto-invoked by project-setup), when optimizing an existing project (auto-invoked by optimize-project), when editing any canonical artifact and the version should bump, or on demand to audit version state. Triggers: "bump version", "version check", "version audit", "version this", "manage versions", "atualiza versao", "audita versao", "bump artifact".
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion]
---

<!--
Changelog:
- 1.0 (2026-05-28): Initial. Manages 3 versioning tiers (artifact, document, project). Integrated with project-setup v1.3+ and optimize-project v1.3+. Detects missing versions, proposes bumps, logs to MEMORY.md.
-->

# manage-versions

## What it does

Manages versioning automatically across 3 tiers in every Nexforce project:

1. **Artifact tier:** every SKILL.md and subagents/*.md has `version:` field. Bumps on edit.
2. **Document tier:** CLAUDE.md frontmatter declares project version + meta-agent version used at creation.
3. **Project tier:** VERSION file at project root tracks overall project version + meta-agent compatibility.

Auto-invoked by `project-setup` (bootstrap mode) and `optimize-project` (check + migration mode). Can also be invoked manually for audit or explicit bump.

## When to invoke

- **Bootstrap mode:** new project created via project-setup, creates VERSION file and CLAUDE.md frontmatter
- **Check mode:** during optimize-project audit, detects version drift between project and current meta-agent
- **Bump mode:** when an edit to a SKILL.md, subagent, or CLAUDE.md warrants a version increment
- **Audit mode:** user asks "version audit" or "version check" on a project
- Triggers: "bump version", "version check", "manage versions", "atualiza versao", "audita versao"

## When NOT to invoke

- File changes that do not affect behavior (typo fixes, formatting): no bump needed
- New project before project-setup has finished structural creation
- Project that does not follow meta-agent canonical structure (out of scope)

---

## The 3 versioning tiers

### Tier 1, Artifact-level versions

**Where:** frontmatter of every `skills/*/SKILL.md` and every `subagents/*.md`.

**Format:**
```yaml
---
name: skill-name
version: 1.2
description: ...
---
```

**Bump rule:**
- 1.x: backward-compatible improvement (clarification, new example, expanded scope, new section)
- 2.0: breaking change (different workflow, different output contract, removed core behavior)

**Changelog block** mandatory below frontmatter (HTML comment):

```markdown
<!--
Changelog:
- 1.2 (YYYY-MM-DD): what changed
- 1.1 (YYYY-MM-DD): what changed
- 1.0: initial.
-->
```

### Tier 2, Document-level versions

**Where:** CLAUDE.md frontmatter of every project.

**Format:**
```yaml
---
project: <project-name>
version: 1.0
created_with: meta-agent-v2.2
created_on: YYYY-MM-DD
last_updated: YYYY-MM-DD
---
```

**Bump rule:**
- 1.x: minor edit (rule added, section refined, scope tightened)
- 2.0: rewrite (mission changes, audience changes, restructure)

When CLAUDE.md is edited materially, bump version and update `last_updated`.

### Tier 3, Project-level VERSION file

**Where:** `<project>/VERSION` at root.

**Format:**
```
project_version: 1.0
project_name: <name>
created_with_meta_agent: 2.2
last_optimized_with_meta_agent: 2.2
created_on: YYYY-MM-DD
last_optimized_on: YYYY-MM-DD
```

**Read on every optimize-project run** to detect drift between project and current meta-agent state.

---

## Workflow

### Bootstrap mode (called by project-setup)

1. Receive project path + meta-agent current version (from `/Users/vitti/Documents/Claude/Projects/AI/meta-agent/VERSION`).
2. Create `<project>/VERSION` with initial state (project_version: 1.0).
3. Add frontmatter to CLAUDE.md with project + meta-agent version.
4. Verify all skills/subagents created have `version: 1.0` field (warn if missing).
5. Return summary: "Project versioned. project_version=1.0, meta-agent=X.Y."

### Check mode (called by optimize-project)

1. Read `<project>/VERSION`.
2. Read `/Users/vitti/Documents/Claude/Projects/AI/meta-agent/VERSION`.
3. Compare `last_optimized_with_meta_agent` vs current meta-agent version.
4. If drift detected, classify:
   - Same major: minor drift, suggest non-breaking migration
   - Different major: breaking drift, propose explicit migration plan
5. Audit each SKILL.md and subagent for missing version field.
6. Return drift report:
   ```
   Project: <name>
   Project version: 1.X
   Created with meta-agent: A.B
   Last optimized with: C.D
   Current meta-agent: E.F
   Drift: minor | breaking | none
   Missing version fields: N artifacts
   Recommendation: <continue | non-breaking update | breaking migration>
   ```

### Bump mode (called when editing canonical artifact)

1. Identify the artifact being edited (SKILL.md or subagent).
2. Read current version from frontmatter.
3. Ask user (or infer from change scope): is this 1.x (compatible) or 2.0 (breaking)?
4. Apply bump.
5. Update changelog block with new entry: `- <new_version> (<date>): <what changed>`.
6. Append to MEMORY.md a 1-line entry: `bumped <artifact> from <old> to <new>, reason: <reason>`.

### Audit mode (called by user or quality-reviewer)

1. Run full audit on the project:
   - Tier 1: every SKILL.md and subagent has version field?
   - Tier 2: CLAUDE.md has frontmatter version + created_with?
   - Tier 3: VERSION file exists at root?
2. List all artifacts with their versions in a table.
3. Flag any missing version (severity: Important).
4. Flag drift from meta-agent (severity: Minor if minor drift, Important if breaking).
5. Save report to `outputs/<date>_version-audit/report.md`.

---

## VERSION file template

When creating a VERSION file for the first time:

```
project_version: 1.0
project_name: <project-name>
created_with_meta_agent: <current meta-agent version>
last_optimized_with_meta_agent: <current meta-agent version>
created_on: YYYY-MM-DD
last_optimized_on: YYYY-MM-DD
```

When updating after optimize-project run:

```
project_version: 1.X (bump if structural changes were applied)
project_name: <unchanged>
created_with_meta_agent: <unchanged, historical>
last_optimized_with_meta_agent: <new meta-agent version>
created_on: <unchanged, historical>
last_optimized_on: <new date>
```

---

## CLAUDE.md frontmatter template

When project-setup creates a CLAUDE.md, add this frontmatter at the top:

```yaml
---
project: <project-name>
version: 1.0
created_with: meta-agent-v<X.Y>
created_on: YYYY-MM-DD
last_updated: YYYY-MM-DD
---

# <project-name>

## Identity
...
```

---

## Bump decision tree

When something edits a canonical artifact, apply this tree:

```
Is the edit a typo fix or pure formatting?
├── Yes → No bump. Update last_updated only.
└── No → Continue.

Is the edit a breaking change (different output contract, removed core behavior)?
├── Yes → 2.0 bump (major).
└── No → 1.x bump (minor).

Did the edit modify CLAUDE.md sections beyond minor wording?
├── Yes → bump CLAUDE.md document version.
└── No → only artifact version, not document.

Are multiple artifacts affected in one cohesive change?
├── Yes → all bump together, single MEMORY.md entry covering all.
└── No → individual bumps.

Was the edit triggered by an optimize-project run?
├── Yes → also bump project_version in VERSION file. Update last_optimized fields.
└── No → only artifact + document bumps if applicable.
```

---

## Output

After execution:

1. **Bootstrap mode:** VERSION file created, CLAUDE.md frontmatter added, summary returned
2. **Check mode:** drift report returned as text
3. **Bump mode:** version field updated in target file, changelog block extended, MEMORY.md entry appended, 1-line confirmation
4. **Audit mode:** full report saved to `outputs/<date>_version-audit/report.md`, summary returned

Never silent. Every version change is logged to MEMORY.md.

---

## Restrictions

- Never bump versions silently without logging to MEMORY.md
- Never edit `created_with` or `created_on` fields after initial creation (historical record)
- Never apply a 2.0 bump without user confirmation if invoked outside of explicit user request
- If user is editing manually and bumps inconsistently, propose realignment but do not auto-fix without approval
- Audit mode is read-only, never modifies artifacts
- Do not invoke during a session that has not yet produced material changes (no reason to bump)

---

## Example

**Scenario:** User edits `skills/draft-prospecting-email/SKILL.md`, adds a new trigger phrase.

**Invocation:** manage-versions, mode=bump.

**Steps:**

1. Read current version: `version: 1.0`.
2. Classify change: new trigger phrase = backward-compatible improvement = 1.x.
3. Propose bump: `version: 1.0` → `version: 1.1`.
4. Update changelog block:
   ```
   <!--
   Changelog:
   - 1.1 (2026-05-28): Added trigger phrase "follow up on partner cold email".
   - 1.0: initial.
   -->
   ```
5. Append to MEMORY.md:
   ```
   ## 2026-05-28 HH:MM | Bump draft-prospecting-email 1.0 → 1.1
   **Change:** added trigger phrase
   ```
6. Return: "Bumped to v1.1. Logged in MEMORY.md."

---

## Integration points

| Caller | Mode | When |
|---|---|---|
| `project-setup` v1.3+ | bootstrap | After folder structure created, before declaring project ready |
| `optimize-project` v1.3+ | check | First action in Step 2 audit phase. Reads VERSION, compares to meta-agent. |
| `optimize-project` v1.3+ | bump | After applying any structural change, before declaring optimization complete |
| Any skill editing canonical artifact | bump | Optionally invoked after Write |
| User (direct request) | audit | On demand |
| `quality-reviewer` v1.5+ | check (passive, no writes) | Reads VERSION to validate project state during audit |

---

## References

- `skills/project-setup/SKILL.md` v1.3+
- `skills/optimize-project/SKILL.md` v1.3+
- `subagents/quality-reviewer.md` v1.5+
- `references/skill-creation-checklist.md` (Section A3, version field mandatory)
- `references/subagent-creation-checklist.md` (Section A3, version field mandatory)
- `templates/claude-md-template.md` (version frontmatter template)

# Skill Archive Protocol

## Scope

Defines how skills are retired, archived, and (if needed) reactivated. Used by `skill-suggester` when it proposes retirement candidates and by the user when manually deprecating a skill.

Read this when:
- `skill-suggester` proposed a skill for retirement
- A skill is no longer being invoked but the user wants to preserve its content
- A previously archived skill needs to be reactivated

---

## Why archive (instead of delete)

Skills contain methodology, decision trees, and accumulated knowledge. Deleting them loses that. Archiving preserves the content while removing it from the active skill set the agent considers when deciding what to invoke.

Reactivation is rare but possible. Archive keeps the door open.

---

## Archive directory layout

```
[project]/
├── skills/
│   ├── active-skill-1/
│   │   └── SKILL.md
│   ├── active-skill-2/
│   │   └── SKILL.md
│   └── _archive/                           [archived skills live here]
│       ├── retired-skill-a/
│       │   ├── SKILL.md                    [original SKILL.md preserved]
│       │   └── ARCHIVED.md                 [archive metadata, see template below]
│       └── retired-skill-b/
│           ├── SKILL.md
│           └── ARCHIVED.md
```

Rules:
- The `_archive/` folder lives inside `skills/` to keep all skill content in one tree.
- Underscore prefix (`_archive`) signals to the agent that this folder is not part of the active skill registry.
- The original SKILL.md is preserved as-is. Nothing inside the SKILL.md changes.
- A new ARCHIVED.md is added next to it with metadata about the archival event.

---

## ARCHIVED.md template

```markdown
# Archive Metadata, <skill-name>

**Archived on:** YYYY-MM-DD
**Archived by:** <user OR skill-suggester report YYYY-MM-DD>
**Original SKILL.md version:** <version at time of archive>
**Reason for archive:**
<1-3 sentences explaining why this skill was retired. Examples:
- "Zero invocations in 60+ days. Captured workflow no longer relevant after pivot away from X."
- "Replaced by skill <new-skill-name> which covers the same use case with better triggers."
- "Domain shift: project no longer handles this task type.">

**Last invocation detected:** YYYY-MM-DD (or "never")
**Reactivation criteria:**
<conditions under which this skill should be reactivated. Examples:
- "If the project starts handling [task-type] again."
- "If user requests <trigger-phrase> 2+ times in a month.">

**Related artifacts:**
- Replaced by: <skill-name OR none>
- Influenced by: <skill-name OR none>
- Knowledge preserved here useful for: <future skill name OR domain>

---
```

---

## Archive workflow

### When triggered by skill-suggester

1. `skill-suggester` produces a report flagging `<skill-name>` as retirement candidate.
2. User reviews the report and approves.
3. The orchestrating agent (meta-agent main, NOT skill-suggester directly) executes:

```bash
SKILL="<skill-name>"
mkdir -p "[project]/skills/_archive/$SKILL"
mv "[project]/skills/$SKILL/SKILL.md" "[project]/skills/_archive/$SKILL/SKILL.md"
rmdir "[project]/skills/$SKILL"
```

4. Write `ARCHIVED.md` next to the moved SKILL.md using the template above.
5. Update CLAUDE.md: remove the skill from `## Skills available in this project` section.
6. Append entry to MEMORY.md documenting the archive (date, reason, skill-suggester report link).

### When triggered manually

User says: "archive skill X", "retire X", "move X to archive".

Same workflow as above, but the "Archived by" field is set to the user instead of a skill-suggester report.

---

## Reactivation workflow

Trigger: user request OR `skill-suggester` detects that the archived skill's trigger phrases are appearing again.

1. Read `ARCHIVED.md` to check reactivation criteria.
2. If criteria met, propose reactivation to user.
3. On approval, execute:

```bash
SKILL="<skill-name>"
mv "[project]/skills/_archive/$SKILL/SKILL.md" "[project]/skills/$SKILL/SKILL.md"
# Optionally preserve ARCHIVED.md inside the active folder for history
mv "[project]/skills/_archive/$SKILL/ARCHIVED.md" "[project]/skills/$SKILL/ARCHIVED_<date>.md"
rmdir "[project]/skills/_archive/$SKILL"
```

4. Bump the SKILL.md `version:` field (e.g. 1.0 → 1.1) and add a changelog entry: "Reactivated after archive on YYYY-MM-DD."
5. Add the skill back to CLAUDE.md `## Skills available in this project`.
6. Append entry to MEMORY.md.

---

## quality-reviewer interaction

When the audit scope includes a project, quality-reviewer should:

- NOT count skills under `skills/_archive/` toward the active skill registry.
- NOT flag skills in `_archive/` as missing from CLAUDE.md.
- Flag an active skill that exists in `skills/<name>/` but is also present in `skills/_archive/<name>/` (cleanup needed after reactivation).
- Validate that every `_archive/<name>/` folder has both SKILL.md and ARCHIVED.md.

---

## Anti-patterns

| Anti-pattern | Why it breaks the protocol |
|---|---|
| Deleting SKILL.md without archiving | Loses methodology and accumulated knowledge. |
| Archiving without writing ARCHIVED.md | Future reader does not know why or when. Cannot evaluate reactivation. |
| Keeping archived skill listed in CLAUDE.md `## Skills available` | Agent might try to invoke a skill that is not in the active path. |
| Archiving the 4 mandatory skills (token-budget, compress-session, capture-feedback, skill-suggester) | These are pre-installed and required by V1.4. Never archive. |
| Reactivating without bumping version | Loss of audit trail. The reactivated skill is materially "version 2" because the deprecation period changed context. |

---

## Reference

- `skills/skill-suggester/SKILL.md` (produces retirement proposals)
- `subagents/quality-reviewer.md` (validates archive folder structure)
- `references/self-improvement-loop.md` (the cycle this protocol supports)

## Version

V1.0, 2026-05-28.

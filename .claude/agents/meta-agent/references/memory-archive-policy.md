# MEMORY.md Archive Policy

## Scope

Defines when and how to archive entries from MEMORY.md to keep the active log usable while preserving full history.

Read this when:
- MEMORY.md exceeds 30 entries
- Session start reads of MEMORY.md are loading >20k tokens
- Quality-reviewer flags MEMORY.md as too long

---

## The problem

MEMORY.md is append-only by design. Over months, it grows linearly. The agent reads "last 3-5 entries" at session start, so recent entries are always loaded. But the file size still impacts:

- Glob and grep operations across all project files
- Token budget if the file is loaded fully by a skill or subagent
- Visual scanning by humans

At 30+ entries, the cost-benefit tilts: older entries are rarely re-read but still cost on every full-file operation.

---

## The policy

**Trigger:** MEMORY.md exceeds 30 dated entries.

**Action:** archive entries older than 90 days to year-based archive files.

**Archive layout:**

```
[project]/
├── MEMORY.md                           [active, last 90 days, append-only]
└── memory-archive/                     [archived entries]
    ├── 2025.md
    ├── 2026.md
    └── README.md
```

Each archive file is itself append-only and organized by year. When an entry is archived, it moves from MEMORY.md to `memory-archive/YYYY.md` based on the entry's date.

The active MEMORY.md keeps only entries from the last 90 days at all times (after each archive operation).

---

## What is archived vs. what stays

**Always archived:**
- Routine session summaries older than 90 days
- Resolved blockers older than 90 days
- Completed "Next steps" older than 90 days

**Never archived (kept in active MEMORY.md regardless of age):**
- The project creation entry (always entry zero, never moves)
- Entries explicitly marked `[PIN]` in their title (manual operator decision)
- Entries that document still-active architectural decisions (load-bearing context)

A "load-bearing" entry is one where another active artifact still depends on it. Examples: the migration entry that documents why all paths were renamed, the V1.4 entry that documents the current skill set. These get a `[PIN]` marker.

---

## Workflow

### Step 1, Detection

Run periodically (suggested: monthly or during `optimize-project`):

```bash
ENTRIES=$(grep -c "^## [0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}" "[project]/MEMORY.md")
if [ "$ENTRIES" -gt 30 ]; then
  echo "MEMORY.md has $ENTRIES entries. Archive policy triggers at 30+."
fi
```

### Step 2, Classify entries

Read MEMORY.md. For each entry:
- Get the date from the `## YYYY-MM-DD` header.
- Check if the title contains `[PIN]`.
- Compute days since today.

Mark as:
- **Active** if days < 90 OR title contains `[PIN]` OR it is the project creation entry.
- **Archive candidate** otherwise.

### Step 3, Confirm with user

Before moving any entries, show:

```
MEMORY.md archive proposal:

Total entries: N
Active entries (kept in MEMORY.md): X
Archive candidates: Y

Candidates breakdown by year:
- 2025: A entries
- 2026: B entries

Action: move Y entries to memory-archive/YYYY.md files.
```

User approves or adjusts the cutoff.

### Step 4, Execute archive

For each archive candidate:

1. Determine target file based on entry year: `memory-archive/YYYY.md`.
2. If the target file does not exist, create it with the archive header (see template below).
3. Append the entry to the target file.
4. Remove the entry from MEMORY.md.

### Step 5, Verify and log

After archive:

1. Confirm MEMORY.md still parses correctly (header + active entries + separators).
2. Append a new entry to MEMORY.md documenting the archive operation:

```markdown
## YYYY-MM-DD | [PIN] Memory archive operation

**Context:** MEMORY.md exceeded 30 entries. Applied archive policy.

**Decisions:**
- Archived N entries older than 90 days to memory-archive/

**Artifacts:**
- memory-archive/YYYY.md updated with N entries
- MEMORY.md now has M active entries

**Next:**
- Re-evaluate in 90 days

---
```

---

## memory-archive/YYYY.md template

When creating the first archive file for a year, use this header:

```markdown
# MEMORY ARCHIVE, [project-name], [year]

Append-only archive of entries from MEMORY.md older than 90 days.
Most recent entries on top. Never delete, never edit past entries.

These entries are not loaded at session start. To consult, read manually when needed.

For active project memory, see ../MEMORY.md.

---
```

---

## memory-archive/README.md template

```markdown
# memory-archive/

Archived entries from MEMORY.md, organized by year.

Active project memory lives in ../MEMORY.md (last 90 days).

| File | Coverage | Entry count |
|---|---|---|
| 2025.md | YYYY-MM-DD to YYYY-MM-DD | N |
| 2026.md | YYYY-MM-DD to YYYY-MM-DD | N |

Updated by memory-archive policy (see references/memory-archive-policy.md).
```

---

## quality-reviewer interaction

When MEMORY.md exceeds 30 entries and no archive has run in 90+ days, quality-reviewer should flag:

- **Important:** "MEMORY.md has N entries (>30). Consider running archive policy. See references/memory-archive-policy.md."

When `memory-archive/` exists but is missing its README.md, flag as Minor.

---

## Anti-patterns

| Anti-pattern | Why it breaks |
|---|---|
| Manually editing entries in MEMORY.md or memory-archive/ | Append-only is the contract for traceability. |
| Archiving entries marked [PIN] | These are load-bearing for active behavior. |
| Deleting memory-archive/YYYY.md files | Loss of history. Archive is preservation, not garbage. |
| Letting MEMORY.md exceed 50 entries without archiving | Token cost on every full read. Operational drag. |

---

## Reference

- Related skill: `compress-session` (writes MEMORY.md, source of entries)
- Related skill: `optimize-project` (can trigger archive policy as part of broader audit)
- Related reference: `self-improvement-loop.md` (explains MEMORY.md role)

## Version

V1.0, 2026-05-28.

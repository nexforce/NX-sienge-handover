# Default Claude Code Hooks Template

<!--
DEFAULT HOOKS TEMPLATE for every Claude Code project at Nexforce.

How to use:
1. project-setup (Claude Code variant) creates `.claude/hooks/` with these 3 hooks pre-installed.
2. Each hook is a standalone executable script registered in `.claude/settings.json`.
3. Users can customize or disable any hook per project, but all 3 should exist by default.

Principles:
- block-destructive: PreToolUse safety net for destructive shell commands
- audit-log: PostToolUse log of every tool invocation
- session-end-compress: Stop hook that prompts the agent to run compress-session
-->

---

## settings.json registration

Every Claude Code project's `.claude/settings.json` includes this hooks block by default:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/pre-tool-use/block-destructive.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/post-tool-use/audit-log.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/stop/session-end-compress.sh"
          }
        ]
      }
    ]
  }
}
```

---

## Hook 1, block-destructive

**Path:** `.claude/hooks/pre-tool-use/block-destructive.sh`
**Trigger:** PreToolUse, matcher Bash
**Behavior:** reads tool input from stdin, blocks destructive shell patterns.

```bash
#!/bin/bash
# block-destructive.sh
# Blocks dangerous shell patterns from Claude Code Bash tool.
# Reads PreToolUse JSON from stdin. Exits 0 to allow, 1 to block.

set -e

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('tool_input', {}).get('command', ''))")

# Patterns to block
BLOCKED_PATTERNS=(
  "rm -rf /"
  "rm -rf ~"
  "rm -rf \\*"
  "git push --force"
  "git push -f"
  "git reset --hard"
  "DROP DATABASE"
  "DROP TABLE"
  "TRUNCATE TABLE"
  ":(){ :|:& };:"
  "mkfs"
  "dd if=.* of=/dev/"
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    cat <<EOF
{
  "decision": "block",
  "reason": "Destructive command blocked by .claude/hooks/pre-tool-use/block-destructive.sh: matched pattern '$pattern'. If this is intentional, disable the hook in settings.json or run from a different shell."
}
EOF
    exit 0
  fi
done

# Allow (no output = allow)
exit 0
```

**Tuning:** patterns can be edited per project. Defaults reflect Nexforce standard for any production Claude Code project.

---

## Hook 2, audit-log

**Path:** `.claude/hooks/post-tool-use/audit-log.sh`
**Trigger:** PostToolUse, all tools
**Behavior:** appends one line per tool invocation to `.claude/audit.log`.

```bash
#!/bin/bash
# audit-log.sh
# Logs every tool invocation to .claude/audit.log
# Reads PostToolUse JSON from stdin. Always exits 0 (non-blocking).

INPUT=$(cat)
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
LOG_FILE="$PROJECT_ROOT/.claude/audit.log"

mkdir -p "$(dirname "$LOG_FILE")"

# Extract tool name and brief input snippet
TOOL=$(echo "$INPUT" | python3 -c "import sys, json; d = json.load(sys.stdin); print(d.get('tool_name', 'unknown'))")
INPUT_SNIPPET=$(echo "$INPUT" | python3 -c "import sys, json; d = json.load(sys.stdin); ti = d.get('tool_input', {}); print(str(ti)[:120].replace(chr(10), ' '))")
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
SESSION_ID=$(echo "$INPUT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('session_id', '-'))")

echo "$TIMESTAMP | $SESSION_ID | $TOOL | $INPUT_SNIPPET" >> "$LOG_FILE"

exit 0
```

**Purpose:**
- Skill invocation telemetry (feeds skill-suggester retirement detection in V1.5+)
- Forensics after incidents
- Pattern detection over time

**Log file rotation:** none built-in. The audit.log grows append-only. Recommend manual archive every 90 days or via cron.

---

## Hook 3, session-end-compress

**Path:** `.claude/hooks/stop/session-end-compress.sh`
**Trigger:** Stop (end of agent turn that ends the session)
**Behavior:** detects substantive session, reminds the agent to invoke compress-session.

```bash
#!/bin/bash
# session-end-compress.sh
# At session end, reminds the agent to run compress-session if substantive work was done.
# Reads Stop JSON from stdin. Exits 0 (allow stop), or returns "block" with a reminder.

INPUT=$(cat)
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
AUDIT_LOG="$PROJECT_ROOT/.claude/audit.log"

# If audit.log does not exist or session too short, allow stop
if [ ! -f "$AUDIT_LOG" ]; then
  exit 0
fi

# Count tool invocations in the last session (heuristic: last 50 lines)
SESSION_ID=$(echo "$INPUT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('session_id', ''))")
if [ -z "$SESSION_ID" ]; then
  exit 0
fi

TOOL_COUNT=$(tail -200 "$AUDIT_LOG" | grep -c "$SESSION_ID" || echo "0")

# Substantive threshold: 10+ tool invocations
if [ "$TOOL_COUNT" -lt 10 ]; then
  exit 0
fi

# Check if compress-session was already invoked this session
COMPRESS_INVOKED=$(tail -200 "$AUDIT_LOG" | grep "$SESSION_ID" | grep -c "compress-session" || echo "0")

if [ "$COMPRESS_INVOKED" -gt 0 ]; then
  exit 0
fi

# Remind the agent
cat <<EOF
{
  "decision": "block",
  "reason": "Session had $TOOL_COUNT tool invocations but compress-session was not invoked. Run skills/compress-session/SKILL.md to record session decisions in MEMORY.md before ending. If this session does not warrant a memory entry, manually allow the stop and add a note in chat."
}
EOF

exit 0
```

**Note:** the reminder is non-fatal. The user can override by manually allowing the stop. The goal is to make compress-session the default, not a hard block.

**Threshold tuning:** the `10` tool-invocation threshold is conservative. Adjust per project if a different cutoff makes sense.

---

## File permissions

After creating the 3 hooks, make them executable:

```bash
chmod +x .claude/hooks/pre-tool-use/block-destructive.sh
chmod +x .claude/hooks/post-tool-use/audit-log.sh
chmod +x .claude/hooks/stop/session-end-compress.sh
```

---

## Integration with project-setup (Claude Code variant)

The `project-setup` skill creates these 3 hooks by default for every Claude Code project. Specifically:

1. After mkdir of `.claude/hooks/{pre-tool-use,post-tool-use,stop}/`, write the 3 scripts above (using the templates here).
2. Chmod +x on all 3.
3. Write `.claude/settings.json` with the hooks block registered (see top of this template).
4. Document in the project's CLAUDE.md `## Hooks` section that 3 default hooks are active.

**Opt-out path:** user can disable any hook by:
- Removing the entry from `.claude/settings.json`, OR
- Renaming the script file (e.g., `block-destructive.sh.disabled`)

quality-reviewer flags absence of these 3 default hooks as **Important** (not Critical), since some projects may legitimately disable them.

---

## quality-reviewer interaction (V1.5 addition)

When auditing a Claude Code project, quality-reviewer should check:

```bash
[ -f "<project>/.claude/hooks/pre-tool-use/block-destructive.sh" ]    || echo "MISSING default hook: block-destructive"
[ -f "<project>/.claude/hooks/post-tool-use/audit-log.sh" ]           || echo "MISSING default hook: audit-log"
[ -f "<project>/.claude/hooks/stop/session-end-compress.sh" ]         || echo "MISSING default hook: session-end-compress"

# Verify settings.json registers them
grep -q "block-destructive" "<project>/.claude/settings.json"  || echo "Hook block-destructive not registered in settings.json"
grep -q "audit-log" "<project>/.claude/settings.json"          || echo "Hook audit-log not registered"
grep -q "session-end-compress" "<project>/.claude/settings.json" || echo "Hook session-end-compress not registered"
```

Classify as **Important** if any are missing.

---

## Restrictions

- These hooks apply only to Claude Code projects (`.claude/` only exists in Code, never Cowork).
- The 3 hooks are defaults, not mandatory. Projects can opt out per the procedure above.
- audit.log is project-local. Do not commit to git unless explicitly desired (add `.claude/audit.log` to .gitignore by default).

---

## References

- `skills/design-hooks/SKILL.md` (skill for designing custom hooks)
- `references/hooks-protocol.md` (full Claude Code hooks documentation)
- `skills/project-setup/SKILL.md` (creates hooks on project init)
- `subagents/quality-reviewer.md` (audits hooks presence)

## Version

V1.0, 2026-05-28.

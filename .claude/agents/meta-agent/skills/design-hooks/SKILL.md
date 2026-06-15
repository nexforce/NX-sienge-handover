---
name: design-hooks
version: 1.0
description: Designs Claude Code hooks (PreToolUse, PostToolUse, Stop, etc) with executable code and settings.json configuration. Use when the user asks to create a hook, "add a hook", "block command X", "audit tool calls", "notify Slack when agent finishes", "validate PII before saving". Applies Ask First Sequential.
allowed-tools: [AskUserQuestion, Read, Write, Edit, Bash]
---

# design-hooks

## What it does

Builds a complete Claude Code hook: executable file + `.claude/settings.json` entry + documentation in the project README. Applies security patterns (input validation, timeouts, correct exit codes).

## When to invoke

- "Create a hook to block `rm -rf`"
- "I need to audit everything Claude executes"
- "Add a hook that notifies Slack at end of session"
- "How do I block a commit without tests"
- "Hook to validate PII before Write"
- "I want to run a lint after every Edit"

## When NOT to invoke

- Logic that should live in the agent's prompt, update CLAUDE.md
- Validation that must run outside Claude, use cron/CI
- One-off non-recurring task, execute directly

## Workflow

### 1. Ask First Sequential

Use `AskUserQuestion`:

**Q1, Hook type:**
- `PreToolUse` (block before tool executes)
- `PostToolUse` (audit/act after execution)
- `Stop` (run at end of session)
- `Notification` (alert when Claude needs input)
- `UserPromptSubmit` (intercept user message)

**Q2, Target tool (matcher):**
- Open question: "Which tool triggers the hook? (`Bash`, `Write`, `Edit`, `Read`, `*` for all, or regex)"

**Q3, Desired behavior:**
- Open question: "In 1-2 sentences, what should the hook do? (block, audit, notify, etc)"

**Q4, External side effects:**
- Local only (file system, logs)
- Network call (Slack, webhook, external API)
- Shell command (git, npm, scripts)
- Multiple

**Q5, Blocks operation?**
- Yes, hook prevents execution if rule fails
- No, only observes and logs

**Q6, Where to save:**
- Open question: "Path of the Claude Code project receiving the hook (e.g. `/Users/vitti/Documents/Developer/Product/<project>/`)"

### 2. Validate context

Read the existing `.claude/settings.json` of the target project (if any). If not present, create from scratch.

### 3. Select base template

Map Q3 (behavior) against the template library:

| Behavior | Template |
|---|---|
| Block destructive command | `block-destructive.js` |
| Validate PII | `check-pii.js` |
| Audit log | `audit.js` |
| Slack notify | `notify-slack.js` |
| Git auto-stage | `auto-stage.js` |
| Cost tracking | `track-cost.js` |
| Compress session | `compress-session.js` |
| Custom | base template + new logic |

Full templates in `references/hooks-protocol.md`.

### 4. Build the hook

Standard Node.js structure:

```javascript
#!/usr/bin/env node
let input = "";
process.stdin.on("data", chunk => input += chunk);
process.stdin.on("end", () => {
  const data = JSON.parse(input);
  
  // 1. Filter by matcher (defensive)
  // 2. Apply logic
  // 3. Appropriate exit code
  //    - 0: allow to continue
  //    - 1: block (only PreToolUse and UserPromptSubmit)
  
  process.exit(0);
});
```

**Mandatory code rules:**

1. Read input from stdin (not argv)
2. JSON.parse with try/catch (input may be malformed)
3. Explicit exit code (`process.exit(N)`)
4. Stderr message when blocking (`console.error("BLOCKED: reason")`)
5. Implicit timeout (operations <2s)
6. No `eval()`, no shell injection
7. No em-dash, no inflated vocabulary in comments

### 5. Update settings.json

Add entry in `.claude/settings.json`:

```json
{
  "hooks": {
    "<HookType>": [
      {
        "matcher": "<tool_pattern>",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/<type>/<name>.js"
          }
        ]
      }
    ]
  }
}
```

Preserve existing entries. Do not overwrite other hooks.

### 6. Document in README

Add a section (or create a hooks README):

```markdown
## Hooks

### <name>
- **Type:** <PreToolUse|...>
- **Matcher:** <tool>
- **What it does:** <description>
- **Blocks:** <yes|no>
- **Required env vars:** <list or "none">
- **Trigger:** <when it fires>
```

### 7. Suggest tests

Test command:

```bash
echo '{"tool_name":"Bash","tool_input":{"command":"rm -rf /tmp/test"}}' | node .claude/hooks/pre-tool-use/<name>.js
echo "Exit code: $?"
```

Suggest minimum 3 test cases: happy path, edge case, must-block.

### 8. Deliver summary

```
Hook created: .claude/hooks/<type>/<name>.js
Configured in: .claude/settings.json
Documented in: README.md

Test:
[test commands]

Next steps:
1. Run the 3 tests above
2. Validate behavior in a real Claude Code session
3. Commit if all OK
```

## Expected output

3 files produced:
1. Executable hook (`.claude/hooks/<type>/<name>.js`)
2. Updated `.claude/settings.json`
3. README snippet with hook documentation

Plus: suggested test commands.

## Example

**User input:**
> Create a hook that blocks `git push --force` in the api-nexforce project.

**Expected behavior:**

Step 1: Ask First, 6 questions. Answer:
- Type: PreToolUse
- Matcher: Bash
- Behavior: block git push --force (any variant)
- Side effects: local only
- Blocks: yes
- Path: /Users/vitti/Documents/Developer/Product/api-nexforce/

Steps 2-3: skill selects `block-destructive.js` template, adapts regex for git push --force.

Step 4: generates file:

```javascript
#!/usr/bin/env node
let input = "";
process.stdin.on("data", chunk => input += chunk);
process.stdin.on("end", () => {
  try {
    const { tool_name, tool_input } = JSON.parse(input);
    if (tool_name !== "Bash") process.exit(0);
    
    const cmd = (tool_input?.command || "").trim();
    if (/\bgit\s+push\s+(-f\b|--force\b|--force-with-lease\b)/.test(cmd)) {
      console.error("BLOCKED: git push --force detected.");
      console.error(`Command: ${cmd}`);
      console.error("Use a regular push or rebase locally and coordinate with the team.");
      process.exit(1);
    }
    process.exit(0);
  } catch (e) {
    console.error("Hook error:", e.message);
    process.exit(0); // do not block on hook's own error
  }
});
```

Step 5: adds to settings.json:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{"type": "command", "command": "node .claude/hooks/pre-tool-use/block-git-force-push.js"}]
      }
    ]
  }
}
```

Step 6: documents in README.

Step 7: suggests test:

```bash
echo '{"tool_name":"Bash","tool_input":{"command":"git push --force origin main"}}' | node .claude/hooks/pre-tool-use/block-git-force-push.js
# Expected: exit 1, message "BLOCKED"

echo '{"tool_name":"Bash","tool_input":{"command":"git push origin main"}}' | node .claude/hooks/pre-tool-use/block-git-force-push.js
# Expected: exit 0, no output
```

## Restrictions

- Atomic hooks: 1 hook = 1 responsibility.
- Always include try/catch for JSON.parse and filesystem operations.
- Always validate `tool_name` upfront (defensive).
- Never `eval()`, never `child_process.exec(cmd)` with raw input from Claude.
- Hook exit code on its own error: 0 (do not block on a hook bug).
- No em-dash, no inflated vocabulary.

## References

- Reference: `references/hooks-protocol.md` (full templates + patterns)
- Official docs: https://docs.claude.com/en/docs/claude-code/hooks
- Complementary skill: `design-prompt` (if hook needs LLM logic)
- Subagent: `agent-architect` (when hook is part of a larger architecture)

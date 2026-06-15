# Reference, Hooks Protocol

**Official source:** https://docs.claude.com/en/docs/claude-code/hooks

> Hooks are code that runs automatically at points in the agent's lifecycle. They work as middleware between Claude and tool execution. Available in Claude Code, partially in Cowork via `.claude/settings.json`.

---

## Hook types

| Hook | When it fires | Can block? | Typical case |
|---|---|---|---|
| `PreToolUse` | Before Claude calls a tool | Yes (exit 1) | Block destructive commands |
| `PostToolUse` | After the tool executes | No | Audit, linter, push |
| `Notification` | When Claude needs input from the user | No | Sound, push, Slack |
| `Stop` | When the agent ends the session | Yes | Generate summary, commit |
| `SubagentStop` | When a subagent ends | Yes | Validate subagent output |
| `UserPromptSubmit` | When you send a message | Yes | Validate format, inject context |

---

## Configuration

In `.claude/settings.json` in the project:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/pre-tool-use/block-destructive.js"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/post-tool-use/auto-format.js"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/stop/notify-slack.js"
          }
        ]
      }
    ]
  }
}
```

**Matcher:** regex that filters which tool triggers the hook. `Bash`, `Write|Edit`, `*` (all).

**Type:** always `command`. `command` is a shell command to execute.

---

## Hook structure

The hook receives a JSON via stdin with context and returns via stdout. Exit code controls:

- `0` allows continuing
- `1` (or any non-zero) blocks the operation

**Input (stdin):**

```json
{
  "tool_name": "Bash",
  "tool_input": {
    "command": "rm -rf /tmp/cache"
  },
  "session_id": "abc123",
  "cwd": "/Users/vitti/Documents/Developer/..."
}
```

**Output (stdout):** optional, can inject data back into the context.

---

## Practical examples

### 1. Block destructive commands

`.claude/hooks/pre-tool-use/block-destructive.js`

```javascript
#!/usr/bin/env node
let input = "";
process.stdin.on("data", chunk => input += chunk);
process.stdin.on("end", () => {
  const { tool_name, tool_input } = JSON.parse(input);
  
  if (tool_name !== "Bash") {
    process.exit(0);
  }
  
  const cmd = tool_input.command || "";
  const dangerous = [
    /\brm\s+-rf\s+\/(?!\w)/,           // rm -rf /
    /\bgit\s+push\s+--force\b/,        // git push --force (no branch)
    /\bdrop\s+(table|database)\b/i,    // SQL DROP
    /\bdd\s+if=.*of=\/dev\/[sh]d/,     // dd on disk
    /:\(\)\s*\{\s*:\|:&\s*\};:/,       // fork bomb
  ];
  
  for (const pattern of dangerous) {
    if (pattern.test(cmd)) {
      console.error(`BLOCKED: destructive command detected: ${cmd}`);
      process.exit(1);
    }
  }
  
  process.exit(0);
});
```

### 2. Audit log of tool calls

`.claude/hooks/post-tool-use/audit.js`

```javascript
#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

let input = "";
process.stdin.on("data", chunk => input += chunk);
process.stdin.on("end", () => {
  const data = JSON.parse(input);
  const logPath = path.join(process.cwd(), ".claude/audit.log");
  const entry = `${new Date().toISOString()} | ${data.tool_name} | ${JSON.stringify(data.tool_input).slice(0, 200)}\n`;
  fs.appendFileSync(logPath, entry);
  process.exit(0);
});
```

### 3. Notify Slack when session ends

`.claude/hooks/stop/notify-slack.js`

```javascript
#!/usr/bin/env node
const https = require("https");

const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;
if (!SLACK_WEBHOOK) process.exit(0);

let input = "";
process.stdin.on("data", chunk => input += chunk);
process.stdin.on("end", () => {
  const { session_id, cwd } = JSON.parse(input);
  const payload = JSON.stringify({
    text: `Claude Code session ended: ${cwd} (id: ${session_id})`
  });
  
  const req = https.request(SLACK_WEBHOOK, { method: "POST", headers: { "Content-Type": "application/json" }});
  req.write(payload);
  req.end();
  process.exit(0);
});
```

### 4. Validate PII before saving

`.claude/hooks/pre-tool-use/check-pii.js`

```javascript
#!/usr/bin/env node
let input = "";
process.stdin.on("data", chunk => input += chunk);
process.stdin.on("end", () => {
  const { tool_name, tool_input } = JSON.parse(input);
  
  if (!["Write", "Edit"].includes(tool_name)) {
    process.exit(0);
  }
  
  const content = tool_input.content || tool_input.new_string || "";
  
  const patterns = [
    { name: "CPF", regex: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/ },
    { name: "Credit card", regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/ },
    { name: "Personal email", regex: /\b[A-Za-z0-9._%+-]+@(gmail|hotmail|yahoo)\.com\b/ },
  ];
  
  for (const { name, regex } of patterns) {
    if (regex.test(content)) {
      console.error(`BLOCKED: ${name} detected in output. Review before saving.`);
      process.exit(1);
    }
  }
  
  process.exit(0);
});
```

### 5. Auto-commit after Write/Edit

`.claude/hooks/post-tool-use/auto-stage.js`

```javascript
#!/usr/bin/env node
const { execSync } = require("child_process");

let input = "";
process.stdin.on("data", chunk => input += chunk);
process.stdin.on("end", () => {
  const { tool_name, tool_input } = JSON.parse(input);
  if (!["Write", "Edit"].includes(tool_name)) process.exit(0);
  
  const file = tool_input.file_path;
  if (!file) process.exit(0);
  
  try {
    execSync(`git add "${file}"`, { stdio: "ignore" });
  } catch (e) {
    // not a git repo or file outside the repo, OK
  }
  process.exit(0);
});
```

### 6. Cumulative cost tracking

`.claude/hooks/post-tool-use/track-cost.js`

```javascript
#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

let input = "";
process.stdin.on("data", chunk => input += chunk);
process.stdin.on("end", () => {
  const data = JSON.parse(input);
  const usage = data.tool_response?.usage;
  if (!usage) process.exit(0);
  
  // Sonnet 4.6 prices, adjust according to model
  const inputCost = (usage.input_tokens / 1_000_000) * 3;     // $3/MTok
  const outputCost = (usage.output_tokens / 1_000_000) * 15;  // $15/MTok
  const total = inputCost + outputCost;
  
  const file = path.join(process.cwd(), ".claude/cost.json");
  const current = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : { total: 0, sessions: 0 };
  current.total += total;
  current.sessions += 1;
  fs.writeFileSync(file, JSON.stringify(current, null, 2));
  
  process.exit(0);
});
```

---

## Design patterns

### 1. Small, atomic hooks

1 hook = 1 responsibility. Do not create `do-everything.js`. Multiple small hooks compose better.

### 2. Fail fast with a clear message

A hook that blocks must print a useful message on stderr:

```
BLOCKED: <concrete reason> 
Suggested fix: <action>
```

Claude reads the message and adapts.

### 3. Idempotency

A hook can run twice (retry). Ensure that running it twice does not corrupt state.

### 4. Timeout

Hooks must return in <2s. Long operations (network call) use explicit timeout.

### 5. Logged side effects

Every destructive action (send to Slack, commit, deploy) must be logged for debug.

---

## Hook patterns for Nexforce

### For any Code project

```
.claude/hooks/
├── pre-tool-use/
│   ├── block-destructive.js     # rm -rf, drop table, push --force
│   ├── check-pii.js             # CPF, card, personal email
│   └── require-tests.js         # block commit without passing tests
├── post-tool-use/
│   ├── audit.js                 # tool call log
│   ├── auto-stage.js            # git add after Write/Edit
│   └── track-cost.js            # cumulative cost tracker
└── stop/
    ├── notify-slack.js          # end-of-session notification
    └── compress-session.js      # generate summary in MEMORY.md
```

### For a Cowork project

Hooks are less common (Cowork does not have a direct terminal), but it is possible to use:

```
.claude/hooks/
├── pre-tool-use/
│   └── check-pii.js             # validate PII before Write
└── stop/
    └── compress-session.js      # session summary in MEMORY.md
```

---

## Limitations and pitfalls

### 1. Hooks in Cowork are more restricted

Cowork does not run hooks with the same flexibility as Claude Code. Validate support before adopting in Cowork production.

### 2. Performance

Each hook adds latency. PreToolUse on Bash + Write + Edit = 3 hooks per operation. Keep it light.

### 3. Debugging

A hook that fails silently is a nightmare. Always log exit code and stderr.

### 4. Security

The hook receives input from Claude. Validate before executing shell. Never pass input directly to `eval()` or shell without sanitizing.

### 5. Versioning

`.claude/settings.json` in git (commit). `.claude/settings.local.json` in .gitignore (personal override).

### 6. Hooks that depend on env vars

`SLACK_WEBHOOK_URL`, API keys, etc. Document in the project's README.md.

---

## When NOT to use hooks

- Task can be done by a prompt in the system message → use prompt
- Task needs to run outside the Claude cycle → use cron/CI
- Hook frequently blocks legitimate operations → revise the rule, do not add exceptions case by case

---

## Resources

| Resource | URL |
|---|---|
| Hooks docs | https://docs.claude.com/en/docs/claude-code/hooks |
| Settings reference | https://docs.claude.com/en/docs/claude-code/settings |
| Claude Code overview | https://docs.claude.com/en/docs/claude-code/ |
| Complementary skill | `design-hooks` (creates a hook from scratch via Ask First) |

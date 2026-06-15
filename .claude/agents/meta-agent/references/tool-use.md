# Reference, Tool Use (Function Calling)

**Official source:** https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview

> How to give Claude the ability to call external functions (APIs, database, file system, MCPs) and use the result to respond. Foundation of any Claude agent that does more than chat.

---

## Basic concept

Tool use is the function calling pattern in which Claude:

1. Receives `tools` defined in the request (JSON Schema)
2. Decides whether it needs to call a tool based on the input
3. Returns a `tool_use` block with name and arguments
4. Our code executes the tool and returns `tool_result`
5. Claude uses the result to generate a final answer or call the next tool

---

## Anatomy of a tool definition

```json
{
  "name": "get_weather",
  "description": "Get current weather for a city. Returns temperature in Celsius, humidity, and conditions.",
  "input_schema": {
    "type": "object",
    "properties": {
      "city": {
        "type": "string",
        "description": "City name, e.g. 'São Paulo'"
      },
      "country_code": {
        "type": "string",
        "description": "ISO 3166-1 alpha-2 country code, e.g. 'BR'"
      }
    },
    "required": ["city"]
  }
}
```

**Critical keys:**
- `name`: snake_case, unique, descriptive (don't use `tool1`)
- `description`: what it does + when to use + what it returns. **This is what Claude reads to decide whether to invoke.** This is the most important part.
- `input_schema`: standard JSON Schema. Specifying `required` avoids missing arguments.

---

## Best practices in tool definition

### 1. Description is everything

Claude decides to invoke based on the description. Investing here is high leverage.

**Bad:**
```
"description": "Gets data"
```

**Good:**
```
"description": "Retrieves the customer's last 12 months of invoice history from QuickBooks. Use when the user asks about billing, payment status, outstanding amounts, or invoice details. Returns array of invoices with id, date, amount, status, and line items."
```

### 2. Specify types and formats in the schema

```json
"date": {
  "type": "string",
  "format": "date",
  "description": "ISO 8601 date, e.g. '2026-05-15'"
}
```

### 3. Use enums for closed values

```json
"status": {
  "type": "string",
  "enum": ["pending", "paid", "overdue", "cancelled"]
}
```

### 4. Don't expose redundant tools

If 2 tools do almost the same thing, Claude may pick the wrong one. Consolidate.

### 5. Consistent naming

Standard: `<verb>_<noun>` (`get_invoice`, `search_contacts`, `create_deal`). Avoids ambiguity.

---

## Tool use loop (ReAct)

```
1. Initial request with tools defined
2. Claude responds with:
   - stop_reason: "tool_use"
   - content: [tool_use block with name + input]
3. Code executes the tool
4. Next request includes:
   - tool_use block (from Claude)
   - tool_result block (with execution output)
5. Claude decides:
   - Call next tool → loop
   - Respond final → stop_reason: "end_turn"
```

**Implementation in Python:**

```python
import anthropic

client = anthropic.Anthropic()
messages = [{"role": "user", "content": "What's the weather in São Paulo?"}]

while True:
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        tools=tools,
        messages=messages
    )
    
    if response.stop_reason == "end_turn":
        print(response.content[0].text)
        break
    
    if response.stop_reason == "tool_use":
        tool_use = next(b for b in response.content if b.type == "tool_use")
        tool_result = execute_tool(tool_use.name, tool_use.input)
        
        messages.append({"role": "assistant", "content": response.content})
        messages.append({
            "role": "user",
            "content": [{
                "type": "tool_result",
                "tool_use_id": tool_use.id,
                "content": tool_result
            }]
        })
```

---

## Parallel tool use

Claude can call multiple tools in parallel in the same response.

**When it occurs:** when the tools are independent (no required order between them).

**Example:**
```
User: "Compare weather in São Paulo and New York"
Claude responds with 2 tool_use blocks (one for each city)
```

**Code handling:** execute all of them, return multiple tool_result blocks in the next message.

---

## Strict mode

**Function:** forces Claude to respect the JSON Schema exactly, no extra fields, no values outside the enum.

**How to enable:** parameter in the tool definition (check the current doc for exact syntax).

**When to use:**
- Output goes directly to a downstream system (database, API)
- Cannot accept variance

**Trade-off:** slightly slower, but ensures consistency.

**Doc:** https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview

---

## Client tools vs Server tools

### Client tools

**Definition:** tools that YOU execute in your code.

**Examples:** call a database, read a file, send email via your own SMTP.

**Implementation:** define in the request, execute in the loop, return result.

**Cost:** only the Claude call cost + execution cost (independent).

### Server tools

**Definition:** tools that ANTHROPIC executes on their server.

**Available today:**
- `web_search`: native web search
- `web_fetch`: URL fetch
- `code_execution`: executes Python code in a sandbox

**How to use:** declare in the request, Anthropic executes, returns the result in the response itself.

**Advantage:** no execution code, simpler.

**Cost:** may have an additional cost beyond tokens (check pricing).

**Doc:** https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview

---

## Tool choice (force behavior)

The `tool_choice` parameter controls when Claude calls tools:

| `tool_choice` | Behavior |
|---|---|
| `{"type": "auto"}` (default) | Claude decides whether to call or respond directly |
| `{"type": "any"}` | Forces Claude to call SOME tool |
| `{"type": "tool", "name": "X"}` | Forces Claude to call tool X |
| `{"type": "none"}` | Forbids tool calls, forces text response |

**When to use:**
- `any`: ensure the agent always uses at least one tool before responding
- `tool: X`: deterministic workflow, first always call X
- `none`: pure conversational mode

---

## Common errors

### 1. Vague description → Claude doesn't call the right tool

**Symptom:** Claude responds from memory instead of fetching real data.

**Fix:** rewrite the description with clear triggers.

### 2. Schema without `required`

**Symptom:** Claude calls the tool with missing arguments, execution fails.

**Fix:** mark required fields.

### 3. Tool returns huge text

**Symptom:** context window fills up quickly in long loops.

**Fix:** return structured and compact JSON. Truncate non-essential fields.

### 4. Infinite loop

**Symptom:** Claude keeps calling tools without finishing.

**Fix:** define `max_turns` in the loop (10-20 typical). Add instruction in system prompt: "After 5 tool calls, return the best answer you have."

### 5. Unhandled tool errors

**Symptom:** when the tool fails, the agent stops or hallucinates.

**Fix:** return `tool_result` with `is_error: true` and error message. Claude handles this and tries another approach.

```json
{
  "type": "tool_result",
  "tool_use_id": "...",
  "content": "API returned 500: rate limit exceeded",
  "is_error": true
}
```

---

## Advanced patterns

### Structured workflow with tool chain

```
User: "Send personalized email to 10 hottest leads"

Claude:
1. tool: get_leads(filter: "score > 80")
2. tool: get_company_data(ids: [...])
3. tool: generate_personalized_email(lead_data)
4. tool: send_email(recipient, content) × 10
5. Response: "Sent 10 emails. 2 failed (bounce). Details below."
```

### Reflection with tool

```
1. tool: generate_draft(content)
2. tool: critique_draft(draft) → returns issues
3. tool: revise_draft(draft, issues)
4. Return final
```

### Recursive agent

Tool that invokes another Claude agent (subagent). Careful with cost and depth.

---

## Performance

| Model | Tool use quality | Tool use latency |
|---|---|---|
| Opus 4.6 | Best (picks the right tool in ambiguous cases) | Slower |
| Sonnet 4.6 | Excellent for most cases | Medium |
| Haiku 4.5 | Good for workflows with forced tool choice | Faster |

---

## Resources

| Resource | URL |
|---|---|
| Tool use overview | https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview |
| Tool use guide | https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-to-implement-tool-use |
| Computer use | https://platform.claude.com/docs/en/agents-and-tools/computer-use |
| Server tools (web search) | https://platform.claude.com/docs/en/agents-and-tools/web-search |
| JSON Schema spec | https://json-schema.org |

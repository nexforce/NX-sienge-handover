# Reference, Claude Agent SDK

**Official source:** https://platform.claude.com/docs/en/build-with-claude/agents
**Anthropic blog "Building Effective Agents":** https://www.anthropic.com/research/building-effective-agents

> How to build programmatic Claude agents (not Cowork, not Claude Code) that run on your own server, execute complex workflows, and integrate with systems via tools and MCPs.

---

## What an "agent" is

Operational Anthropic definition:

> An agent is an LLM using tools in a loop to accomplish a task.

Minimum components:
1. **Model** (Opus, Sonnet or Haiku)
2. **System prompt** defining identity and rules
3. **Tools** that the agent can call
4. **Loop** that orchestrates: think → call tool → receive result → think → ... → respond
5. **Stopping criterion** (max turns, stop condition, end_turn)

---

## Agent design patterns

Anthropic recommends 5 basic patterns, from simplest to most complex. Use the simplest one that solves it.

### 1. Augmented LLM

LLM with tools + memory + retrieval. No loop.

```
User → LLM → Tools (retrieval, search) → LLM → Response
```

**When to use:** Q&A with knowledge base, simple copilot.

### 2. Prompt chaining

Outputs of one prompt feed the next. Deterministic, no loop.

```
User → Prompt 1 → Output 1 → Prompt 2 → Output 2 → ... → Response
```

**When to use:** workflow with known phases (outline → draft → review → final).

### 3. Routing

LLM classifies input and routes to a specific handler.

```
User → Classifier LLM → Route to: Specialist A | Specialist B | Specialist C
```

**When to use:** multiple categories of input with specialized handlers (support tickets, intent classification).

### 4. Parallelization

Multiple LLMs work in parallel, then aggregate.

**Section voting:** same task, multiple attempts, vote on the best.

**Section splitting:** subdivides the task into independent pieces processed in parallel.

**When to use:** when consensus or parallelism increases quality.

### 5. Orchestrator-workers (multi-agent)

Orchestrator LLM delegates to specialized worker LLMs.

```
User → Orchestrator LLM
        ├── Worker A → Subtask A → Result A
        ├── Worker B → Subtask B → Result B
        └── Worker C → Subtask C → Result C
       Orchestrator aggregates → Response
```

**When to use:** complex task with heterogeneous sub-tasks that benefit from specialization.

### 6. Evaluator-optimizer (Reflection)

LLM generates, another LLM critiques, the first revises.

```
LLM1 generate → LLM2 evaluate → LLM1 revise → LLM2 evaluate → ... → Approved
```

**When to use:** critical quality (legal, contracts, production code).

### 7. Autonomous agent (Tool use loop, ReAct)

Loop with tools and stopping criterion.

```
LLM decides → Tool call → Tool result → LLM decides → ... → end_turn
```

**When to use:** open-ended task in which the agent needs to explore and adapt (research, debugging, planning).

---

## Basic loop in code

```python
import anthropic

client = anthropic.Anthropic()

def run_agent(user_input, tools, max_turns=10):
    messages = [{"role": "user", "content": user_input}]
    
    for turn in range(max_turns):
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            system="You are a helpful agent...",
            tools=tools,
            messages=messages
        )
        
        if response.stop_reason == "end_turn":
            return response.content[0].text
        
        if response.stop_reason == "tool_use":
            tool_uses = [b for b in response.content if b.type == "tool_use"]
            tool_results = [
                {
                    "type": "tool_result",
                    "tool_use_id": tu.id,
                    "content": execute_tool(tu.name, tu.input)
                }
                for tu in tool_uses
            ]
            
            messages.append({"role": "assistant", "content": response.content})
            messages.append({"role": "user", "content": tool_results})
    
    raise Exception("Max turns reached")
```

---

## Memory

### Short term, conversation

History of `messages` in the API. Grows until the context limit. No cross-session persistence.

### Long term, cross-session

Not native. Implement via:

1. **External storage:** database, file, vector DB
2. **Prompt injection:** at the start of each session, retrieve relevant memories and paste them into the system prompt
3. **MCP `memory` server:** ready-made alternative

```python
def load_memory(user_id):
    # query DB
    return retrieved_facts

system_prompt = f"""
You are an agent for {user_id}.

Relevant memory from past sessions:
{load_memory(user_id)}
"""
```

### Semantic memory (RAG)

Vector DB (Pinecone, Weaviate, pgvector) + embedding + retrieval. For a large knowledge base.

```
Query → embed → search vector DB → top-K chunks → inject into prompt → LLM responds
```

---

## Error handling

### 1. Tool errors

Return tool_result with `is_error: true`:

```python
{
    "type": "tool_result",
    "tool_use_id": "...",
    "content": "API returned 429: rate limit. Retry in 60s.",
    "is_error": True
}
```

LLM adapts (waits, tries another approach, escalates to a human).

### 2. Model errors

API may return:
- `rate_limit_error` (429)
- `overloaded_error` (529)
- `api_error` (500)

Implement retry with exponential backoff. The Python SDK has configurable automatic retry.

### 3. Impossible task

Define a "conscious giving-up" criterion. System prompt:

> If after 5 tool calls you cannot complete the task, return a clear explanation of what was missing and what you tried.

Better than an infinite loop.

### 4. Max turns reached

Capture exception, return partial + log for human review.

---

## Streaming

API supports streaming via SSE. Useful for:
- Real-time UX (show response token-by-token)
- Detect tool_use early and trigger execution

**Trade-off:** more complex to implement. Do not use for async/batch pipelines.

```python
with client.messages.stream(
    model="claude-sonnet-4-6",
    max_tokens=4096,
    messages=[...]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

---

## Batch API

For high async volume, 50% discount.

```python
batch = client.messages.batches.create(
    requests=[
        {"custom_id": f"req-{i}", "params": {...}}
        for i in range(1000)
    ]
)

# Poll for completion
while batch.processing_status != "ended":
    time.sleep(60)
    batch = client.messages.batches.retrieve(batch.id)

# Retrieve results
results = client.messages.batches.results(batch.id)
```

**Typical latency:** a few minutes to hours, depending on volume.

**Doc:** https://platform.claude.com/docs/en/build-with-claude/batch-processing

---

## Monitoring and observability

Log for each call:

- Request ID (generate UUID)
- User ID (if applicable)
- Model used
- Input tokens, output tokens
- Latency
- Stop reason
- Tool calls (name, input, success/error)
- Final output (truncated)
- Cost (calculated)

Critical metrics:

| Metric | Typical threshold |
|---|---|
| P95 latency | <10s for single agent, <60s for multi-agent |
| Error rate | <1% |
| Tool call success rate | >95% |
| Cost/request | within budget |
| Max turns hit rate | <5% |
| Eval pass rate | >85% (higher for critical) |

---

## Design principles (Anthropic summary)

1. **Use the simplest approach that works.** Each layer of complexity has a cost.
2. **Show your reasoning to the user.** Transparency > opacity.
3. **Limit autonomy until validated.** A full-auto agent in production requires heavy eval first.
4. **Think about failure modes from day 1.** What happens if the tool fails? If Claude doesn't finish?
5. **Cost is a feature.** Optimize tokens, models, caching, batch.
6. **Continuous eval.** Change the prompt, run eval, compare metrics.

---

## Typical stack for a Nexforce agent in production

| Layer | Technology |
|---|---|
| Model | Sonnet 4.6 (default), Opus 4.6 (orchestrator) |
| SDK | anthropic-python or anthropic-typescript |
| Tools | Custom + MCP servers (HubSpot, Slack, Apollo, Gmail) |
| Memory | Postgres or Redis for state, pgvector for semantics |
| Orchestration | Own (Python/Node) or n8n for visual workflows |
| Monitoring | Structured logs + Sentry + custom dashboard |
| Storage | S3 for artifacts, Postgres for state |
| Auth | API keys in secrets manager |

---

## When NOT to build an agent

Anthropic recommends avoiding agents when:

- The task is deterministic (does not need reasoning)
- A traditional SQL/script function solves it
- ROI does not justify maintenance complexity
- Eval and monitoring are not ready

For simple cases: single prompt + tool. For very simple: no LLM, direct code.

---

## Resources

| Resource | URL |
|---|---|
| Agent SDK docs | https://platform.claude.com/docs/en/build-with-claude/agents |
| Building Effective Agents (blog) | https://www.anthropic.com/research/building-effective-agents |
| Tool use docs | https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview |
| MCP | https://modelcontextprotocol.io |
| Cookbook (examples) | https://github.com/anthropics/anthropic-cookbook |
| Streaming | https://platform.claude.com/docs/en/build-with-claude/streaming |
| Batch API | https://platform.claude.com/docs/en/build-with-claude/batch-processing |
| Rate limits | https://platform.claude.com/docs/en/api/rate-limits |

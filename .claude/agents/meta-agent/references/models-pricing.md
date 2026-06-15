# Reference, Models & Pricing

**Last checked:** 2026-05-15
**Official source:** https://platform.claude.com/docs/en/about-claude/models/overview and https://platform.claude.com/docs/en/about-claude/pricing

> Anthropic updates models and prices frequently. Validate against the official source before closing a cost estimate for production. Use the `docs-researcher` subagent to confirm critical numbers.

---

## Current models (May 2026)

| Characteristic | Claude Opus 4.6 | Claude Sonnet 4.6 | Claude Haiku 4.5 |
|---|---|---|---|
| **API ID** | `claude-opus-4-6` | `claude-sonnet-4-6` | `claude-haiku-4-5-20251001` |
| **Context (input)** | 1M tokens | 1M tokens | 200k tokens |
| **Max output** | 128k tokens | 64k tokens | 64k tokens |
| **Modalities** | text + image | text + image | text + image |
| **Extended Thinking** | Yes | Yes | Yes |
| **Adaptive Thinking** | Yes | Yes | Not confirmed |
| **Tool use** | Yes | Yes | Yes |
| **Prompt caching** | Yes | Yes | Yes |
| **Batch API** | Yes | Yes | Yes |
| **Streaming** | Yes | Yes | Yes |
| **Vision** | Yes | Yes | Yes |
| **Multilingual** | Yes | Yes | Yes |

---

## When to use each model

### Opus 4.6

**Use when:**
- Deep multi-step reasoning (complex planning, strategic analysis)
- Long code or multi-file refactoring
- Orchestrator in a multi-agent architecture
- Tasks where errors are costly (compliance, contracts, critical financial analysis)
- Long output (needs 128k max output)

**Avoid when:**
- High volume without need for maximum intelligence (cost explodes)
- Critical latency (slower response than Sonnet/Haiku)
- Simple task (classification, structured extraction)

### Sonnet 4.6

**Production default.** Use when:
- Not high volume nor latency <2s
- Task requires good but not maximum intelligence
- Single production agent
- Specialist subagent in multi-agent (handoff from Opus orchestrator)
- Structured generation (JSON, markdown, code)

**Avoid when:**
- Task requires Opus-level intelligence (open-ended problems, reasoning over large code)
- Very high volume (10k+/day) and the task is simple (use Haiku)

### Haiku 4.5

**Use when:**
- High volume (10k+ requests/day)
- Critical latency (<2s)
- Simple task: classification, extraction, parsing, formatting
- Nightly batch pipeline
- Linear subagent in multi-agent (dispatcher, validator)

**Avoid when:**
- Reasoning over long and ambiguous context
- High-quality creative generation
- Task where getting it wrong is costly

---

## Pricing (validate before stating)

> The numbers below are placeholders. **Always consult https://platform.claude.com/docs/en/about-claude/pricing before stating cost.** Use the `docs-researcher` subagent when the number is critical.

### Anthropic pricing structure

Charged per million tokens (MTok), separated for input and output. Modifiers:

| Modifier | Effect |
|---|---|
| **Prompt caching write** | Extra cost on the 1st call (~25% above input) |
| **Prompt caching read** | Cached tokens are ~90% cheaper on subsequent calls |
| **Batch API** | ~50% discount on input and output |
| **Extended Thinking** | Reasoning tokens count as output |

### Cost calculation

```
cost_per_request = (input_tokens × input_rate / 1M) + (output_tokens × output_rate / 1M)
monthly_cost = cost_per_request × requests_per_day × 30
```

With prompt caching active:
```
cost_per_request (cached) = (system_cached × cache_read_rate / 1M) + (user_input × input_rate / 1M) + (output × output_rate / 1M)
```

### Token heuristics by task type

| Task | Average input | Average output |
|---|---|---|
| Classification (5 categories) | 500 | 100 |
| Structured extraction | 1,000 | 300 |
| Short copy generation | 1,500 | 500 |
| Analysis + recommendation | 3,000 | 1,500 |
| Average code generation | 5,000 | 3,000 |
| Long document analysis | 50,000 | 5,000 |
| Multi-turn conversation (10 turns) | 4,000 cumulative | 1,000/turn |

---

## Cost optimizations

### 1. Prompt caching

**When to apply:** repetitive prompt (same system prompt + few-shot examples) with high frequency (>10 calls in 5 min).

**How to enable:** mark `cache_control: {"type": "ephemeral"}` on the blocks to cache.

**Savings:** up to 90% on cached tokens.

**Trade-off:** the first call costs 25% more (write).

**Doc:** https://platform.claude.com/docs/en/build-with-claude/prompt-caching

### 2. Batch API

**When to apply:** async workload, no need for immediate response (e.g.: classify 10k emails overnight).

**How to use:** submit batch via Messages Batches API, poll for result.

**Savings:** 50% off the normal input and output price.

**Trade-off:** no streaming, no real-time response.

**Doc:** https://platform.claude.com/docs/en/build-with-claude/batch-processing

### 3. Model mix in multi-agent

**When to apply:** multi-agent architecture.

**How:** Opus 4.6 for the orchestrator + Sonnet 4.6 for medium specialists + Haiku 4.5 for simple tasks.

**Savings:** 5-10x less than running everything on Opus.

### 4. Short output

**When to apply:** structured tasks (JSON).

**How:** specify a precise format in the system prompt + prefill `{"` to force immediate JSON.

**Savings:** 30-50% in output tokens.

### 5. Smart context truncation

**When to apply:** long conversations in production.

**How:** keep only the last N relevant messages + summary of previous ones.

**Savings:** avoids using 1M of context when 50k is enough.

---

## Capabilities by model, detail

### Extended Thinking

Mode in which the model generates a reasoning block before the final response. Enable via the `thinking` parameter in the API.

**When to use:**
- Task requires multi-step analysis
- Output needs robust justification
- Tolerates +30-90s latency

**When to avoid:**
- Critical latency
- Simple task
- High volume (extra output cost)

**Doc:** https://platform.claude.com/docs/en/build-with-claude/extended-thinking

### Adaptive Thinking (Opus and Sonnet)

The model decides automatically how much to think based on task complexity. Enable via the `thinking` parameter with adaptive configuration.

**Trade-off:** less predictable in latency, but automatically optimizes cost.

### Vision

Accepts images (PNG, JPG, WebP, non-animated GIF) and PDFs.

**Limits:** check official doc, they change per model.

**Doc:** https://platform.claude.com/docs/en/build-with-claude/vision

### Multilingual

All 3 models support Portuguese, Spanish, English, French, German, Japanese, etc. Similar performance across Latin languages.

---

## Legacy models (reference)

Older models still accessible via API but not recommended for new projects:

- Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
- Claude 3.7 Sonnet, Claude 4 (family prior to 4.5/4.6)

Check end-of-life at https://platform.claude.com/docs/en/about-claude/models/overview.

---

## Quick decision

```
Task requires deep reasoning OR long code OR orchestration?
├── Yes → Opus 4.6
└── No → Volume > 10k/day OR latency < 2s?
    ├── Yes → Haiku 4.5
    └── No → Sonnet 4.6 (default)
```

---

## Official resources

| Resource | URL |
|---|---|
| Models overview | https://platform.claude.com/docs/en/about-claude/models/overview |
| Pricing | https://platform.claude.com/docs/en/about-claude/pricing |
| Prompt caching | https://platform.claude.com/docs/en/build-with-claude/prompt-caching |
| Batch API | https://platform.claude.com/docs/en/build-with-claude/batch-processing |
| Extended Thinking | https://platform.claude.com/docs/en/build-with-claude/extended-thinking |
| Vision | https://platform.claude.com/docs/en/build-with-claude/vision |
| Rate limits | https://platform.claude.com/docs/en/api/rate-limits |
| Status | https://status.anthropic.com |

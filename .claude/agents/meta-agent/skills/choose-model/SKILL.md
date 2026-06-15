---
name: choose-model
version: 1.0
description: Decision framework to choose between Claude Opus 4.6, Sonnet 4.6, and Haiku 4.5 based on task, volume, latency, and budget. Use when the user asks which model to use, "Opus or Sonnet", "is Haiku enough for this", "which model do you recommend", "what is best for [task]". Returns recommendation + estimated cost + justification.
allowed-tools: [AskUserQuestion, Read]
---

# choose-model

## What it does

Applies an objective framework to choose between the 3 current Claude models. Returns single recommendation, 2-line justification, estimated monthly cost, and alternatives with trade-offs.

## When to invoke

- "Which model for [task]"
- "Opus or Sonnet"
- "Can Haiku do [behavior]"
- "How much would it cost to run [agent]"
- Whenever another skill needs to choose a model

## When NOT to invoke

- User already chose the model and wants a prompt, use `design-prompt`
- Full architecture decision, use `design-agent-architecture` (which calls this skill internally)

## Workflow

### 1. Ask First (short)

Use `AskUserQuestion`:

**Q1, Primary task:**
- Deep reasoning / complex analysis / long code
- Structured generation / classification / extraction
- Natural conversation / Q&A
- Simple task / formatting / parsing
- Multiple tasks (which is most frequent?)

**Q2, Estimated volume:**
- Low (<100 requests/day)
- Medium (100-10k/day)
- High (10k-1M/day)
- Very high (1M+/day)

**Q3, Latency critical:**
- Yes, real-time (response <3s)
- 3-10s acceptable
- Async (no urgency)

**Q4, Cost sensitivity:**
- Cost first (optimize aggressively)
- Cost matters but quality first
- No relevant constraint

### 2. Apply decision matrix

| Scenario | Recommended model | Why |
|---|---|---|
| Deep reasoning + low/medium volume + no latency constraint | **Opus 4.6** | Best intelligence. High cost worth the quality. |
| Production default + medium volume + acceptable latency | **Sonnet 4.6** | Ideal balance. 80% of Nexforce cases. |
| Simple task + high volume + latency critical | **Haiku 4.5** | Lowest cost, minimal latency. Enough for classification/parsing. |
| Multi-agent orchestrator | **Opus 4.6** | Complex decisions justify the cost. |
| Linear specialist subagent | **Sonnet 4.6** or **Haiku 4.5** | Depends on the task. |
| Long code (>500 lines) | **Opus 4.6** | Larger context output (128k) and better consistency. |
| Nightly high-volume batch pipeline | **Haiku 4.5 + Batch API** | 50% off Batch + low base cost. |

### 3. Calculate estimated cost

Pull current pricing from `references/models-pricing.md` (validate it is up to date).

**Simple formula:**

```
Cost/day = volume × (avg_input_tokens × $input_rate + avg_output_tokens × $output_rate)
Cost/month ≈ Cost/day × 30
```

**Heuristic of average tokens by task type:**

| Task | Avg input | Avg output |
|---|---|---|
| Classification | 500 tokens | 100 tokens |
| Structured generation | 1,500 | 800 |
| Analysis + recommendation | 3,000 | 1,500 |
| Code | 5,000 | 3,000 |
| Multi-turn conversation | 4,000 | 1,000 |

If prompt caching applies (repetitive prompt + high frequency), apply ~90% reduction on cached tokens.

### 4. Deliver recommendation

Fixed format:

```
## Recommendation: Claude [Model] ([API ID])

**Why:** [2 lines, primary trade-off]

**Estimated cost:** ~$X/month ([Y] requests × [Z] avg tokens)

**Alternative A:** [Other model] if [condition changes]
**Alternative B:** [Other model] if [condition changes]

**Applicable optimizations:**
- [ ] Prompt caching (if prompt is repetitive)
- [ ] Batch API (if async + high volume)
- [ ] Extended Thinking (if quality > latency)
```

### 5. Signal uncertainty

If Ask First answers are ambiguous, state confidence level:

- **High:** clear pattern (e.g. high volume + classification, obvious Haiku)
- **Moderate:** real trade-off (e.g. Sonnet vs Opus on medium reasoning)
- **Low:** needs empirical test, recommend A/B with `build-eval`

## Expected output

Short, direct response, 15-30 lines. No padding.

## Example

**User input:**
> I'll run an agent that classifies 5k lead emails per day into 5 categories. Which model?

**Expected behavior:**
1. Skill runs Ask First (task: classification, volume: 5k/day = medium, latency: async acceptable, budget: matters)
2. Applies matrix: classification + medium volume + async, **Haiku 4.5**
3. Calculates: 5k × 30 × (500 input + 100 output) tokens, with current pricing
4. Delivers:

```
## Recommendation: Claude Haiku 4.5 (claude-haiku-4-5-20251001)

**Why:** Binary/multi-class classification is a simple task. Haiku delivers Sonnet-equivalent quality at ~5x lower cost. Latency <2s.

**Estimated cost:** ~$30/month (5k req/day × 600 avg tokens)

**Alternative A:** Sonnet 4.6 if classification requires reasoning over long context (e.g. email with 10 prior messages)
**Alternative B:** Opus 4.6 never for this case. Overkill.

**Applicable optimizations:**
- [x] Prompt caching: classifier system prompt is repetitive, cache it, ~90% savings on system
- [x] Batch API: if classification can be async batched, additional 50% discount
- [ ] Extended Thinking: no, latency matters more
```

## Restrictions

- Do not recommend Opus if the task does not require deep reasoning. Cost waste.
- Do not recommend Haiku for complex tasks just because it is cheap. Rework cost kills the savings.
- Always cite exact API ID (claude-opus-4-6, claude-sonnet-4-6, claude-haiku-4-5-20251001) to avoid confusion.
- Validate prices in `references/models-pricing.md` before calculating cost. Anthropic updates periodically.

## References

- Reference: `references/models-pricing.md`
- Complementary skill: `build-eval` (empirically validate that the recommended model delivers)
- Docs: https://platform.claude.com/docs/en/about-claude/models/overview
- Pricing: https://platform.claude.com/docs/en/about-claude/pricing

# Reference, Prompt Engineering

**Official source:** https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
**Anthropic tutorial:** https://github.com/anthropics/prompt-eng-interactive-tutorial

> Complete stack of official Anthropic techniques for Claude. Use as reference when designing prompts (skill `design-prompt` or subagent `prompt-architect`).

---

## Impact hierarchy

Approximate order of impact on output quality (high → low):

1. **Task clarity and specificity**
2. **XML structure**
3. **Few-shot examples**
4. **Chain-of-thought / Extended Thinking**
5. **Role prompting**
6. **Explicit output format**
7. **Prefill**
8. **Prompt chaining**

Optimization (not quality):
- Prompt caching
- Right model
- Lean tokens

---

## 1. Clarity and specificity

**Principle:** describe the task as you would describe it to a new colleague. Don't assume context. Use concrete verbs.

**Bad:**
```
Answer about sales.
```

**Good:**
```
You are a senior B2B SDR in LatAm SaaS. Answer prospects' technical questions about pricing, integration and ROI. Use quantitative data when available. Limit response to 4 paragraphs.
```

**Heuristic:** if you can give 3 different interpretations to the prompt, it's vague.

---

## 2. XML structural tags

**Principle:** Claude was trained on data that includes XML. Structural tags separate context from instructions from examples, reducing confusion.

**Canonical tags:**

```xml
<context>[input data]</context>
<instructions>[what to do]</instructions>
<examples>[1-3 examples]</examples>
<thinking>[reasoning request]</thinking>
<output_format>[expected format]</output_format>
<constraints>[restrictions]</constraints>
```

**Why it works:** Claude uses tags to identify boundaries. Less hallucination, more consistency.

**When to apply:** whenever the prompt has 2+ types of information (input + instructions + examples).

**Doc:** https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/use-xml-tags

---

## 3. Few-shot examples

**Principle:** 1-3 examples of input + ideal output calibrate behavior better than abstract description.

**Structure:**

```xml
<examples>
<example>
<input>Email: "Hi, I saw your product on LinkedIn. How does the pricing work?"</input>
<output>
{
  "category": "warm",
  "confidence": 0.85,
  "reasoning": "Inbound lead with a specific question about pricing, a sign of concrete commercial interest"
}
</output>
</example>
<example>
<input>Email: "I received your cold outreach. Not interested at the moment, thanks."</input>
<output>
{
  "category": "cold",
  "confidence": 0.95,
  "reasoning": "Explicit rejection with no opening for follow-up"
}
</output>
</example>
</examples>
```

**Quantity:**
- Simple task → 1-2 examples
- Complex task → 3-5 examples
- More than 5 → consider fine-tuning (not available in Claude API, use prompt chaining)

**Include negative examples:** "this is a bad output because [reason]". Calibrates even further.

**Doc:** https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/multishot-prompting

---

## 4. Chain-of-thought (CoT)

**Principle:** asking for explicit reasoning before the final answer improves quality on analytical tasks.

**Explicit form (XML):**

```xml
<thinking>
Before answering, work through:
1. What is the user asking?
2. What information do I have to answer?
3. What are 2-3 possible approaches?
4. Which approach is best and why?
</thinking>

Then provide your answer.
```

**Trade-off:** +30-70% more output tokens. Higher latency. Higher cost. Better quality.

**Doc:** https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/chain-of-thought

---

## 5. Extended Thinking (API parameter)

**Difference vs CoT:** Extended Thinking is an API mode. The model generates an internal `thinking` block before the response. Deeper than CoT via XML.

**How to enable:**

```python
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=4096,
    thinking={
        "type": "enabled",
        "budget_tokens": 10000
    },
    messages=[...]
)
```

**When to use:**
- Complex multi-step analysis
- Mathematical/logical reasoning
- Code debugging
- Decisions with trade-offs

**When to avoid:**
- Simple task
- Critical latency (+30-90s common)
- High volume (thinking tokens count as output)

**Adaptive Thinking:** variant that automatically decides how much to think. Available on Opus and Sonnet.

**Doc:** https://platform.claude.com/docs/en/build-with-claude/extended-thinking

---

## 6. Role prompting

**Principle:** defining a persona calibrates the depth, tone and focus of the output.

**Structure:**

```
You are [role] with [experience/expertise]. Your audience is [audience]. Your communication style is [style].
```

**Example:**
```
You are a senior tax structuring lawyer specialized in cross-border SaaS deals in LatAm. Your audience is non-legal C-level executives. Communicate in plain language, flag risks explicitly, recommend concrete actions.
```

**Impact:** greater on open-ended tasks (consulting, analysis, writing) than on structured tasks (classification).

**Doc:** https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/system-prompts

---

## 7. Explicit output format

**Principle:** ambiguity in format generates variance. Define exactly.

**Structured JSON:**

```
Return ONLY valid JSON in this exact schema:
{
  "classification": "<category_a | category_b | category_c>",
  "confidence": <number between 0 and 1>,
  "reasoning": "<string, 1-3 sentences>"
}

Do not include any text outside the JSON.
```

**Structured Markdown:**

```
Return your answer in this format:

## Diagnosis
[1 paragraph]

## Recommendation
[bulleted list, 3-5 items]

## Next step
[1 sentence]
```

**Doc:** https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/long-context-tips

---

## 8. Prefill (assistant message)

**Principle:** starting the assistant's response forces the format.

**How to use:**

```python
messages = [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "{\""}  # prefill
]
```

Claude continues from the prefill, ensuring the output begins with `{"`.

**When to apply:**
- Force immediate JSON (no decorative markdown before)
- Force XML format
- Restrict response to a specific category
- Continue interrupted text

**Doc:** https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prefill-claudes-response

---

## 9. Prompt chaining

**Principle:** complex task = multiple chained prompts, output of one becomes input of the next.

**When to apply:**
- Task has clear phases (plan → execute → review)
- Intermediate output is useful in itself
- Failure in one step should not compromise the others

**Structure:**

```
Prompt 1: generate outline → output_1
Prompt 2: expand outline_1 into draft → output_2
Prompt 3: review draft_2 → final_output
```

**Trade-off vs single prompt:** more predictable, more robust, more expensive in tokens.

**Doc:** https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/chain-prompts

---

## 10. Prompt caching

**Principle:** repetitive prompts can be cached, reducing cost and latency by 90% on cached tokens.

**How to enable:**

```python
messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": "[LONG SYSTEM PROMPT OR CONTEXT]",
                "cache_control": {"type": "ephemeral"}
            },
            {
                "type": "text",
                "text": "[VARIABLE USER QUESTION]"
            }
        ]
    }
]
```

**Trade-off:** the first call costs 25% more (write). The next 4 calls within 5 min use the cache.

**When to apply:**
- Same system prompt > 1024 tokens repeated at high frequency
- Long reused few-shot examples
- Knowledge base injected repeatedly

**Doc:** https://platform.claude.com/docs/en/build-with-claude/prompt-caching

---

## 11. System vs User vs Assistant

| Role | Function | When to use |
|---|---|---|
| `system` | Identity, general rules, behavior | Always defines the "who" of Claude |
| `user` | Specific task input | Variable context + instructions |
| `assistant` | Output (generated by Claude) | Prefill or conversation history |

**Best practices:**
- `system` short, stable, candidate for caching
- `user` carries variable context
- Few-shot examples inside `user`, not `system`
- Never alternate role in the middle of a message

---

## Anti-patterns

### "Be concise but thorough"

Vague. Define: "Maximum 300 words, 3 paragraphs."

### "Use your best judgment"

Does not calibrate. Define objective criteria.

### Excessive negative instructions

"Don't do X. Don't do Y. Don't do Z." → Claude focuses on what not to do and loses focus on what to do. Invert to positive when possible.

### Mixing context and instruction

```
Here is the contract. Analyze it and tell me if it's safe. The customer is important. Clause 5 worries me.
```

→ XML structure separates.

### Asking for output without schema

"Return it in a useful format" → each call comes different. Specify schema.

---

## Prompt quality checklist

Use before promoting to production:

- [ ] Clear identity (role + experience + audience)
- [ ] Task in concrete verbs
- [ ] Explicit output format (JSON schema, markdown structure)
- [ ] XML tags separating context/instructions/examples
- [ ] 1-3 few-shot examples when applicable
- [ ] Chain-of-thought or Extended Thinking for analytical tasks
- [ ] Edge cases covered
- [ ] Restrictions listed (what NOT to do)
- [ ] Prefill if output requires rigid format
- [ ] No em-dash, no banned vocabulary
- [ ] Token efficiency (no redundancy)
- [ ] Right model for the task
- [ ] Prompt caching if high volume

---

## Resources

| Resource | URL |
|---|---|
| Prompting overview | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview |
| XML tags | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/use-xml-tags |
| Few-shot | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/multishot-prompting |
| Chain-of-thought | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/chain-of-thought |
| Extended Thinking | https://platform.claude.com/docs/en/build-with-claude/extended-thinking |
| Prompt caching | https://platform.claude.com/docs/en/build-with-claude/prompt-caching |
| Console (test) | https://platform.claude.com |
| Full tutorial | https://github.com/anthropics/prompt-eng-interactive-tutorial |

---
name: review-prompt
version: 1.0
description: Audits an existing prompt against the Anthropic quality checklist. Diagnoses issues, prioritizes improvements, and returns a rewritten prompt. Use when the user asks to review, audit, improve, optimize, or debug a prompt, "review this prompt", "why isn't my prompt working", "how do I improve this".
allowed-tools: [Read, Write, AskUserQuestion]
---

# review-prompt

## What it does

Performs a structured audit of an existing prompt against the Anthropic best-practices checklist. Delivers diagnosis + prioritized suggestions + rewritten version.

## When to invoke

- "Review this prompt"
- "Why is my prompt producing X instead of Y"
- "How do I optimize this prompt"
- "Audit this prompt"
- "My agent is hallucinating, check the prompt"

## When NOT to invoke

- Create a new prompt from scratch, use `design-prompt`
- Validate with a test set, use `build-eval`
- Choose a model, use `choose-model`

## Workflow

### 1. Collect context

If the user has not pasted the prompt yet, ask via `AskUserQuestion`:

**Q1, Current prompt:**
- Open question: "Paste the complete prompt (system + user, or just system)"

**Q2, Expected vs observed behavior:**
- Open question: "What did you expect? What is going wrong?"

**Q3, Failure examples:**
- Open question: "Do you have 1-3 real inputs that produced bad output? Paste here."

**Q4, Model used:**
- Opus 4.6 / Sonnet 4.6 / Haiku 4.5 / Other

### 2. Apply audit checklist

Evaluate across these 12 axes:

| # | Criterion | Question |
|---|---|---|
| 1 | Identity clarity | Defines who Claude is? |
| 2 | Task specificity | Task described with concrete action? |
| 3 | Output format | Expected format explicit? |
| 4 | XML structure | Uses XML tags to separate context/instructions/examples? |
| 5 | Few-shot | Has 1-3 examples when relevant? |
| 6 | Chain-of-thought | Requests explicit reasoning in complex tasks? |
| 7 | Edge cases | Covers boundary cases? |
| 8 | Restrictions | Lists what NOT to do? |
| 9 | Role calibration | Calibrates depth to audience? |
| 10 | Prefill | Uses prefill if output requires rigid format? |
| 11 | Token efficiency | No redundancy or fluff? |
| 12 | Writing rules | No em-dash, no inflated vocabulary? |

For each axis, classify: **OK** / **Improvement** / **Critical**.

### 3. Prioritized diagnosis

Deliver:

```
## Diagnosis

### Critical (fix before anything else)
1. [Axis X]: [problem], [impact]
2. ...

### Improvements (high leverage)
1. [Axis Y]: [problem], [proposal]
2. ...

### OK
- [Axes with no issues]
```

### 4. Rewrite

Return the rewritten prompt applying the critical findings + most impactful improvements. Preserve the original intent. Flag trade-offs (e.g. "added XML structure, became 30% longer but reduces hallucination by ~40% per Anthropic benchmarks").

### 5. Suggest validation

"Before promoting, test with your 3 failure examples + 5 new cases. Use the `build-eval` skill if you want a formal test set."

## Expected output

1. Diagnosis in 3 categories (critical, improvements, OK)
2. Complete rewritten prompt
3. Trade-off list
4. Next step (test, eval, deploy)

## Example

**User input:**
```
> Review this prompt: "You are an assistant. Answer about sales. Be helpful."
> Claude is giving overly generic answers.
```

**Expected behavior:**
1. Skill applies checklist
2. Diagnosis:
   - Critical: vague identity, vague task, no output format, no XML, no examples
   - Improvements: add role calibration, chain-of-thought, restrictions
   - OK: none
3. Rewrite: complete prompt with specific role ("Senior B2B SDR with 10 years in LatAm SaaS"), concrete task ("respond to prospect technical questions about pricing, integration, and ROI"), output format (structure: direct answer + data/example + CTA), 2 few-shot examples, restrictions (does not commit to a price without confirmation, escalates legal questions).
4. Trade-offs: +400 tokens in system, but reduces hallucination and generic answers.

## Restrictions

- Do not invent problems. If the prompt is OK, say it is OK.
- Always justify changes with reference to the checklist or Anthropic doc.
- Do not change the prompt's intent. If the intent looks wrong, flag it but do not replace without confirmation.

## References

- Reference: `references/prompt-engineering.md`
- Official checklist: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- Complementary skill: `build-eval`
- Subagent: `prompt-architect` (delegation for deep audits of critical prompts)

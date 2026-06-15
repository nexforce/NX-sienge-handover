---
name: design-prompt
version: 1.0
description: Engineering of complex Claude prompts using official Anthropic techniques (XML tags, chain-of-thought, few-shot, prefill, extended thinking, role prompting). Use when the user asks to create, build, design, or write a complex prompt, "I need a prompt for X", "build an advanced prompt", "how to ask Y to Claude". Always runs Ask First Sequential.
allowed-tools: [AskUserQuestion, Read, Write]
---

# design-prompt

## What it does

Designs structured Claude prompts using the full set of official Anthropic techniques. Output: prompt ready to paste into Claude Console, API, or chat, with structured XML format and justification for each choice.

## When to invoke

- "Create a prompt for [complex task]"
- "I need an advanced prompt for [context]"
- "How do I ask Claude to [specific behavior]"
- "Build a chain-of-thought prompt for [task]"
- Task that requires structured output, deep reasoning, or few-shot

## When NOT to invoke

- Simple conversational prompt, no skill needed, write directly
- Prompt that should become a reusable skill, use `create-skill`
- Audit existing prompt, use `review-prompt`

## Workflow

### 1. Ask First Sequential

Use `AskUserQuestion`:

**Q1, Prompt task:**
- Open question: "In 2-3 lines, what does Claude need to do with this prompt?"

**Q2, Target model:**
- Opus 4.6 (deep reasoning, long code)
- Sonnet 4.6 (default, balanced)
- Haiku 4.5 (fast, high frequency)
- Not sure (skill recommends via `choose-model`)

**Q3, Output type:**
- Structured free text
- JSON with specific schema
- Code (which language?)
- Analysis with classification
- Long document/artifact

**Q4, Techniques to apply (multiple):**
- Role prompting (define persona)
- Structural XML tags
- Few-shot examples (1-3 examples)
- Explicit chain-of-thought (`<thinking>`)
- Extended/Adaptive Thinking enabled via API
- Prefill (force initial format)
- Prompt chaining (multi-step)

**Q5, Volume and cost:**
- One-off (cost does not matter)
- High volume (needs token optimization, consider prompt caching)
- Latency critical (avoid Extended Thinking)

**Q6, Available examples:**
- Open question: "Do you have 1-3 input + ideal output examples? (paste here if yes)"

### 2. Select techniques

Based on answers, choose the stack:

| Scenario | Techniques |
|---|---|
| Fast classification | Role + few-shot + JSON output |
| Deep analysis | Role + XML + Extended Thinking + chain-of-thought |
| Structured generation | Role + XML + prefill + few-shot |
| Complex multi-step | Prompt chaining + intermediate outputs |
| High volume | Prompt caching + Haiku/Sonnet + minimal JSON |

### 3. Build the prompt

Standard structure:

```xml
<system>
You are [role/persona].

Your task is [specific mission].

Rules:
- [rule]
- [rule]

Output format:
[precise format specification]
</system>

<user>
<context>
[input data]
</context>

<instructions>
[specific task in numbered steps if needed]
</instructions>

<examples>
<example>
<input>[example input]</input>
<output>[ideal example output]</output>
</example>
</examples>

<thinking>
Before answering, think step by step about:
1. [aspect]
2. [aspect]
</thinking>

<output_format>
[format reinforcement]
</output_format>
</user>
```

Adapt: remove unused sections, add task-specific ones.

### 4. Add prefill (if applicable)

If output must start with a specific format (JSON, XML, code), add a pre-filled assistant message:

```
"role": "assistant",
"content": "{\""
```

### 5. Deliver with justification

Output in 2 blocks:

**Block 1, Production prompt** (in code block, ready to paste).

**Block 2, Design decisions:**
- Why XML instead of markdown
- Why Extended Thinking yes/no
- Why these few-shot examples
- Estimated cost per call
- Recommended model

### 6. Suggest testing

Suggest: "Paste into Claude Console (https://platform.claude.com) to test with different inputs before going to production."

## Expected output

1. Complete prompt in XML, ready for use, 50-300 lines.
2. Justification block (5-10 points).
3. Test and optimization recommendations.

## Example

**User input:**
> I need a prompt to classify lead emails into 5 categories (cold, warm, hot, MQL, SQL) with structured justification.

**Expected behavior:**
1. Skill runs Ask First (task, model, output, techniques, volume, examples)
2. User answers (classification, Sonnet, JSON, role+few-shot+JSON, high volume, 3 examples pasted)
3. Skill selects stack: Role prompting + few-shot + JSON output + prompt caching (high volume)
4. Skill builds prompt with system defining classifier + 3 examples + JSON schema with `{category, confidence, reasoning}`
5. Skill delivers prompt + justifies choices + estimates cost
6. Suggests test with 20 real emails before production

## Restrictions

- No em-dash. No inflated vocabulary.
- If the user requests a prompt for a sensitive task (PII, compliance), flag risks.
- Do not invent techniques. When in doubt, consult `references/prompt-engineering.md` or subagent `docs-researcher`.
- Always estimate cost if volume is relevant.

## References

- Reference: `references/prompt-engineering.md`
- Subagent: `prompt-architect` (delegation for very complex prompts)
- Official docs: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- Tutorial: https://github.com/anthropics/prompt-eng-interactive-tutorial
- Console: https://platform.claude.com

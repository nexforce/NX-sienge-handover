---
name: build-eval
version: 1.0
description: Creates a structured evaluation (test set + success criteria + metrics + scoring protocol) to validate prompts, skills, or agents before production. Use when the user asks to create an eval, test set, validation, benchmark, "how do I test this prompt", "I need to validate before promoting", "build me an eval".
allowed-tools: [AskUserQuestion, Read, Write]
---

# build-eval

## What it does

Builds a complete eval to validate behavior of a prompt, skill, or agent. Delivers test set (10-50 cases), success criteria, scoring rubric (manual or LLM-as-judge), and execution plan.

## When to invoke

- "Create an eval for [prompt/agent]"
- "How do I test if this prompt is good"
- "I need to validate before production"
- "Build a test set for [task]"
- "How do I measure quality of agent X"

## When NOT to invoke

- Visual audit of a prompt, use `review-prompt`
- Decide model, use `choose-model`
- Create a prompt, use `design-prompt`

## Workflow

### 1. Ask First Sequential

Use `AskUserQuestion`:

**Q1, Artifact to validate:**
- Specific prompt
- Skill (which?)
- Complete agent
- Multiple components

**Q2, Output type to evaluate:**
- Classification (categories)
- Structured generation (JSON/XML)
- Free generation (text)
- Single correct answer
- Answer with multiple valid options

**Q3, Quality criteria:**
- Open question: "What makes an output GOOD? List 3-5 criteria."

**Q4, Volume of cases:**
- 10 cases (fast eval, manual)
- 25 cases (medium, manual or LLM-judge)
- 50+ cases (formal, LLM-judge or automated)

**Q5, Scoring mode:**
- Manual (you review each output)
- LLM-as-judge (another prompt evaluates)
- Programmatic (regex, JSON schema, exact metrics)
- Hybrid

**Q6, Real data available:**
- Open question: "Do you have real inputs and expected outputs? Paste 2-3 if yes."

### 2. Define success criteria

For each criterion from Q3, define:

| Criterion | Operational definition | How to measure |
|---|---|---|
| [Criterion] | [What it means concretely] | [Score 0-3 / pass-fail / metric] |

Example:
| Classification accuracy | Correct category among the 5 defined | Pass/Fail per case |
| Justification relevance | Cites 2+ signals from the input | Score 0-3 (LLM-judge) |
| No hallucination | Does not invent facts not in the input | Pass/Fail |

### 3. Generate test set

Structure per case:

```json
{
  "id": "001",
  "input": "[complete input]",
  "expected_output": "[ideal output, if applicable]",
  "expected_behavior": "[prose description when no single output]",
  "category": "[edge case / happy path / adversarial]",
  "criteria_focus": ["criterion_1", "criterion_2"]
}
```

**Recommended distribution (in 25 cases):**

- 60% happy path (15 typical cases)
- 25% edge cases (6 cases: ambiguous input, missing data, unusual format)
- 15% adversarial (4 cases: jailbreak, prompt injection, conflicting instructions)

### 4. Scoring rubric

**Manual mode:**

```
Criterion 1: [Definition]
[ ] Pass  [ ] Fail
Notes: _____

Criterion 2: ...
```

**LLM-as-judge mode:**

Generate judge prompt with:
- Criteria in XML
- Scoring instruction (0-3 or pass/fail)
- Structured JSON output

```xml
<system>
You are an evaluator. Score the assistant's output on these criteria.
</system>

<user>
<input>{input}</input>
<output>{assistant_output}</output>
<criteria>
1. [Criterion]: [Definition]
2. ...
</criteria>

Return JSON:
{"criterion_1": {"score": 0-3, "reasoning": "..."}, ...}
</user>
```

**Programmatic mode:**

List of executable checks (regex, JSON schema validation, token count, string presence).

### 5. Execution plan

```
1. Run test set with prompt v1
2. Collect outputs
3. Apply scoring (manual/LLM/prog)
4. Calculate: % pass, average score per criterion
5. Approval threshold: [e.g. 85%+ overall, no criterion below 70%]
6. If failed: identify failures, iterate prompt, re-run
7. If approved: deploy + monitoring in production
```

### 6. Deliver

Output in 4 blocks:
1. **Success criteria** (table)
2. **Test set** (JSON or table)
3. **Scoring rubric** (judge prompt or checklist)
4. **Execution plan** (numbered steps)

Suggest saving to the target project's `outputs/evals/<artifact-name>/` folder (not `meta-agent`). Keeps eval and results versioned next to the artifact.

## Expected output

Complete markdown document with executable test set, 200-600 lines depending on case volume.

## Example

**User input:**
> Create an eval to validate the `linkedin-copy-partner` skill before rolling it out to the team.

**Expected behavior:**
1. Skill runs Ask First
2. User answers (skill linkedin-copy, free generation, criteria: "specific to profile" / "no em-dash" / "clear CTA" / "max 300 char", 25 cases, hybrid manual+programmatic, 3 examples of good DMs pasted)
3. Skill defines rubric:
   - Specific to profile: LLM-judge 0-3
   - No em-dash: programmatic (regex)
   - Clear CTA: LLM-judge pass/fail
   - Max 300 char: programmatic
4. Skill generates test set with 15 happy path (varying ICP, vertical, event) + 6 edge cases (sparse info, vague context) + 4 adversarial (input requesting aggressive tone, requesting false claim)
5. Skill delivers judge prompt + manual checklist + execution plan
6. Suggests saving to `outputs/evals/linkedin-copy-partner/v1.md` (in the project that uses the skill)

## Restrictions

- Always include adversarial cases. Skipping them is a production risk.
- Approval threshold cannot be arbitrary. Justify based on impact (e.g. 95%+ if client-facing, 80% if internal).
- Do not promote a prompt to production without a run eval.
- No em-dash. No inflated vocabulary.

## References

- Reference: `references/prompt-engineering.md` (evaluation techniques)
- Anthropic Evals: https://platform.claude.com/docs/en/build-with-claude/evals-overview
- Complementary skill: `review-prompt` (visual audit, eval validates empirically)
- Subagent: `prompt-architect` (for evals requiring sophisticated scoring rubric via LLM-judge)

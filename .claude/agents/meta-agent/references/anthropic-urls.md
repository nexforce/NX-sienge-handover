# Anthropic Documentation URLs

## Scope

Canonical list of Anthropic URLs used across meta-agent skills, subagents, and references. Consult when:
- Citing official Anthropic documentation in a skill or subagent
- Validating that a URL has not been deprecated
- Onboarding a new project that needs to reference Anthropic standards

---

## Primary URLs

| Resource | URL | When to use |
|---|---|---|
| Official documentation | https://docs.claude.com | General entry point |
| Models and pricing | https://platform.claude.com/docs/en/about-claude/models/overview | Price, context, capabilities |
| Prompt Engineering | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices | Prompt techniques |
| Tool Use | https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview | Function calling, JSON Schema |
| Agent SDK | https://platform.claude.com/docs/en/build-with-claude/agents | Agent design |
| Hooks | https://docs.claude.com/en/docs/claude-code/hooks | Claude Code middleware |
| MCP | https://modelcontextprotocol.io | Connector protocol |
| Prompt Engineering tutorial | https://github.com/anthropics/prompt-eng-interactive-tutorial | Team onboarding |
| Claude Console | https://platform.claude.com | Test prompts |
| Support | https://support.claude.com | Account, billing, limits |

---

## Domain rules

- Trust only these domains for technical claims: `docs.claude.com`, `platform.claude.com`, `support.claude.com`, `modelcontextprotocol.io`, `github.com/anthropics/...`, `github.com/modelcontextprotocol/...`.
- URLs from other domains may be deprecated, third-party, or unofficial. Flag in quality-reviewer audits.

---

## Maintenance

Review monthly. Anthropic releases new docs and deprecates old paths frequently. If a URL returns 404 or redirects to a different topic, update this file and log to MEMORY.md.

## Version

V1.0, 2026-05-28. Extracted from CLAUDE.md during V1.5 compression.

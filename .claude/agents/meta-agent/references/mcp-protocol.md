# Reference, Model Context Protocol (MCP)

**Official source:** https://modelcontextprotocol.io
**Specification:** https://spec.modelcontextprotocol.io
**Official servers:** https://github.com/modelcontextprotocol/servers

> MCP is the standard protocol to connect Claude (and other LLMs) to external systems: files, database, APIs, SaaS tools. Open standard maintained by Anthropic.

---

## Concept

MCP defines a client-server protocol over stdio, HTTP or SSE in which:

- **MCP Server** exposes **resources, tools, prompts** to a client
- **MCP Client** (Claude Code, Cowork, custom Agent SDK) consumes those resources
- Communication via JSON-RPC

**Analogy:** MCP is to LLM integration with tools what REST is to web integration.

---

## MCP server components

### Tools

Executable functions that the LLM can call.

```typescript
{
  name: "search_contacts",
  description: "Search HubSpot contacts by criteria",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string" }
    },
    required: ["query"]
  }
}
```

Equivalent to Tool Use function calling, but exposed via the standardized MCP protocol.

### Resources

Data accessible by URI (read-only).

```
file:///workspace/docs/contract.pdf
hubspot://contacts/12345
postgres://db/users?id=42
```

LLM reads resources as additional context.

### Prompts

Predefined prompt templates that the server exposes.

```typescript
{
  name: "analyze_contract",
  description: "Standard contract analysis prompt",
  arguments: [{name: "contract_text", required: true}]
}
```

Useful when the server knows how to frame a task better than the client.

---

## Transports

| Transport | When to use |
|---|---|
| **stdio** | Local server, child process of the client. Default for Claude Desktop, Cowork, Claude Code. |
| **HTTP** | Remote server, request-response. Good for cross-host integrations. |
| **SSE (Server-Sent Events)** | Remote server with streaming. Good for long results. |

---

## Official Anthropic MCP servers

Repository: https://github.com/modelcontextprotocol/servers

Relevant examples for Nexforce:

| Server | What it does |
|---|---|
| `filesystem` | Read/write in local folders |
| `git` | Git operations on local repos |
| `github` | Issues, PRs, GitHub code |
| `postgres` | Query in Postgres |
| `slack` | Messages, search, channels |
| `google-drive` | Read Drive files |
| `puppeteer` | Browser automation |
| `brave-search` | Web search |
| `memory` | Persistent cross-session memory |

Check the updated list in the repository.

---

## Server catalog

In addition to the official ones, the community has published hundreds. Relevant categories for Nexforce:

- **CRM:** HubSpot, Salesforce, Apollo, ZoomInfo
- **Productivity:** Linear, Asana, ClickUp, Notion, Monday
- **Comms:** Slack, Discord, Teams, Gmail
- **Finance:** QuickBooks, Stripe, Xero
- **Marketing:** Klaviyo, Mailchimp, Canva
- **Dev:** Sentry, Datadog, Vercel, AWS, Cloudflare
- **Data:** Snowflake, BigQuery, Databricks

Search via `search_mcp_registry` when available, or at https://github.com/modelcontextprotocol/servers and MCP marketplaces.

---

## Configuration in Claude Desktop / Cowork

File `claude_desktop_config.json` (varies by OS):

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/vitti/Documents"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."
      }
    }
  }
}
```

After saving, restart the app.

---

## Build your own MCP server

When to build vs use the official one:

| Case | Decision |
|---|---|
| Internal Nexforce system (own API) | Build your own |
| Popular SaaS with official server | Use official |
| SaaS without server and simple API | Build your own with SDK |
| Very specific use case | Build your own |

### Typical stack

**Python:**
```bash
pip install mcp
```

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("my-server")

@mcp.tool()
def get_invoice(invoice_id: str) -> dict:
    """Get invoice by ID from our billing system."""
    return billing_api.fetch(invoice_id)

@mcp.resource("invoices://{id}")
def read_invoice(id: str) -> str:
    """Resource accessor for invoices."""
    return json.dumps(billing_api.fetch(id))

if __name__ == "__main__":
    mcp.run()
```

**TypeScript:**
```bash
npm install @modelcontextprotocol/sdk
```

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({...});
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [...]
}));
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  // execute tool
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## Best practices in MCP design

### 1. Tools with clear scope

Each tool resolves a specific need. Do not create `do_everything()`.

### 2. Signal-dense descriptions

Remember that the LLM reads the description to choose the tool. Invest here.

### 3. Stable resources by URI

Same URI → same result. Idempotent.

### 4. Structured errors

Return error with code + message + next-step suggestion, not traceback.

### 5. Do not return infinite data

Paginate. Summarize. The LLM does not need the entire dataset.

### 6. Authentication

stdio: local env vars.
HTTP: OAuth or API keys via headers.
Never put credentials in shared code.

### 7. Rate limiting

The MCP server must respect the rate limits of the downstream system and expose this as a structured error for the LLM to adapt.

---

## Usage patterns in agent architecture

### Single agent + 1 MCP

Cowork or Claude Code agent with filesystem MCP. Most common case.

### Single agent + multiple MCPs

Cowork agent connected to HubSpot + Slack + Gmail. Typical SDR/CS workflow.

### Multi-agent + shared MCPs

Orchestrator + N subagents. MCPs available on the orchestrator, subagents receive structured data via brief.

### Custom Agent SDK + MCP

Production agent (own server) consuming MCPs via a custom client. For high-volume automation.

---

## Limitations and pitfalls

### 1. Call latency

Each MCP call adds latency (stdio: 10-100ms, HTTP: 100-500ms). Optimize by reducing the number of calls via batching.

### 2. Context bloat

Large resources inflated in the context consume many tokens. Truncate, summarize, or use a search tool instead of a raw resource.

### 3. Versioning

MCP server can change its API. Pin the version in production.

### 4. Security

The MCP server has the same access to the downstream system as the credentials you passed. Use the principle of least privilege.

### 5. Debug

MCP server logs (stderr) appear in the client logs. Use for troubleshooting.

---

## Resources

| Resource | URL |
|---|---|
| MCP overview | https://modelcontextprotocol.io |
| Specification | https://spec.modelcontextprotocol.io |
| Official servers | https://github.com/modelcontextprotocol/servers |
| Python SDK | https://github.com/modelcontextprotocol/python-sdk |
| TypeScript SDK | https://github.com/modelcontextprotocol/typescript-sdk |
| Quickstart | https://modelcontextprotocol.io/quickstart |
| Anthropic MCP page | https://www.anthropic.com/news/model-context-protocol |

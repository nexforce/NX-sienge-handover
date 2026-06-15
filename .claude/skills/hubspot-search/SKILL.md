---
name: hubspot-search
description: Use before searching HubSpot for any process documentation. Guides targeted, token-efficient MCP queries — only what's needed to fill process-document sections. Covers search order, tools, output files, and stopping criteria.
---

# HubSpot Search Protocol

## Princípio central

Buscar apenas o necessário para preencher as seções do `process-document`. Cada consulta tem um objetivo declarado. Nunca varrer tudo — o contexto infla e os tokens aumentam sem retorno.

**Acesso:** Usar exclusivamente o MCP local `mcp__hubspot__*` (`@hubspot/mcp-server`). O MCP cloud não acessa objetos customizados nem workflows.

**Permissão:** Apenas leitura. Nunca criar, editar, deletar ou disparar nada no HubSpot.

---

## Pré-requisito obrigatório

Antes de qualquer consulta ao HubSpot:

1. Ler o `MEMORY.md` do processo — pode conter consultas já feitas e arquivos já salvos em `hubspot/`. Não repetir o que já está documentado.
2. Ler as tarefas do ClickUp do processo (`clickup/[ID] - [Nome].md`) — extrair nomes de objetos, workflows, propriedades e integrações mencionados. Essas palavras-chave guiam todas as buscas.

---

## Sequência de busca

Executar na ordem. Parar em cada passo quando o critério de suficiência for atingido — não avançar por completismo.

### Passo 1 — Confirmar objetos HubSpot do processo

**Quando:** Sempre. É o ponto de partida.

**Ferramenta:** `mcp__hubspot__hubspot-get-schemas`

**O que extrair:**
- `objectTypeId` e nome interno de cada objeto customizado citado no ClickUp
- Confirmar se o processo usa objetos nativos (Company `0-2`, Contact `0-1`, Deal `0-3`, Ticket `0-5`) ou customizados

**Salvar em:** `hubspot/objeto-[nome].md` (um arquivo por objeto customizado relevante)

**Suficiente quando:** O `objectTypeId` de cada objeto envolvido no processo está confirmado.

---

### Passo 2 — Listar workflows do processo

**Quando:** Sempre que o processo tiver automação (a maioria tem).

**Ferramenta:** `mcp__hubspot__hubspot-list-workflows` — paginar usando `offset` até encontrar os relevantes

**Como filtrar:**
- Buscar pelo número do processo (ex: "8.1", "02.03") ou pelo nome de objeto/integração (ex: "Oracle", "Minuta", "Aprovação")
- NÃO percorrer todos os 300+ workflows — parar ao encontrar os candidatos do processo
- Se em dúvida se um workflow pertence ao processo, checar o `objectTypeId` associado e o nome

**O que registrar:** Nome exato, ID, objeto HubSpot, status (ativo/inativo)

**Salvar em:** `hubspot/workflows-[processo].md` (lista de candidatos encontrados)

**Suficiente quando:** Todos os workflows diretamente relacionados ao processo estão identificados.

---

### Passo 3 — Detalhar cada workflow relevante

**Quando:** Após o Passo 2, para cada workflow diretamente relacionado ao processo.

**Ferramenta:** `mcp__hubspot__hubspot-get-workflow` com o ID do workflow

**O que extrair:**
- Evento de disparo (`enrollmentTriggers`)
- Regra de supressão (`suppressionListIds` ou condição de filtro)
- Ações principais: tipo, objetivo, código relevante (custom codes)
- Secrets utilizados
- Dependências entre ações (branches, condições)

**Workflows DEV ou stub:** registrar nome e ID, não detalhar — são configurações de desenvolvimento, não o fluxo real.

**Atenção — payload grande:** Se o resultado ultrapassar ~50KB, o MCP salva em arquivo em vez de retornar inline. Nesse caso, ler o arquivo salvo em:
`.claude/projects/[session-id]/tool-results/[tool-call-id].json`

**Salvar em:** `hubspot/workflows-[processo].md` (detalhe de cada workflow)

**Suficiente quando:** Disparo, supressão, ações principais e dependências de cada workflow estão documentados.

---

### Passo 4 — Mapear propriedades críticas

**Quando:** Quando o processo menciona campos específicos (campos de integração, campos calculados, campos de disparo, campos de regra de negócio).

**Ferramenta:** `mcp__hubspot__hubspot-list-properties` com o `objectTypeId` do objeto relevante

**Como filtrar:**
- Não registrar todas as propriedades do objeto — filtrar pelo grupo relevante (ex: `integração_oracle`, `contratos_saas`)
- Priorizar: campos citados no ClickUp, campos de integração, campos calculados, campos que disparam workflows

**Salvar em:** `hubspot/objeto-[nome].md` (adicionar seção de propriedades ao arquivo do Passo 1)

**Suficiente quando:** As propriedades que alimentam "Propriedades críticas" e "Regras de negócio" do process-document estão mapeadas.

---

### Passo 5 — Catálogo de produtos (condicional)

**Quando:** Apenas se o processo cria ou lê itens de linha, ou usa preços/SKUs do catálogo como referência.

**Ferramenta:** MCP cloud `mcp__claude_ai_HubSpot__search_crm_objects` com objeto `PRODUCT` — o MCP local nem sempre retorna produtos

**O que extrair:** Nomes, SKUs e tipos dos produtos usados pelo processo

**Salvar em:** `hubspot/catalogo-produtos.md`

**Suficiente quando:** Os produtos referenciados nas regras de negócio do processo estão identificados.

---

### Passo 6 — Pipelines (condicional)

**Quando:** Apenas se o processo move objetos entre etapas (negócios, contratos, tickets, GC com status).

**Ferramenta:** `mcp__hubspot__hubspot-list-objects` com filtro de pipeline, ou verificar via propriedade `hs_pipeline_stage`

**O que extrair:** Nomes e IDs das etapas, critérios de transição relevantes para o fluxo

**Suficiente quando:** As etapas do pipeline que aparecem no fluxo operacional do processo estão mapeadas.

---

## O que NÃO buscar

- Todos os workflows do portal de uma vez — paginar só até encontrar os do processo
- Todas as propriedades de todos os objetos — apenas o grupo relevante
- Detalhes completos de workflows de outros processos que apenas "cruzam" com o atual
- Registros individuais de objetos CRM — o processo documenta configuração, não dados reais de clientes

---

## Onde salvar os resultados

| Conteúdo | Arquivo |
|----------|---------|
| Objetos customizados e objectTypeIds | `hubspot/objeto-[nome].md` |
| Propriedades críticas | Adicionar seção em `hubspot/objeto-[nome].md` |
| Workflows (lista + detalhes) | `hubspot/workflows-[processo].md` |
| Catálogo de produtos | `hubspot/catalogo-produtos.md` |
| Endpoints de integração externa | `hubspot/[nome-integracao]-api.md` |

Após cada consulta, adicionar uma linha no `MEMORY.md` do processo:
- Ferramenta usada
- Resultado em uma linha
- Ponteiro para o arquivo em `hubspot/` onde os detalhes estão

---

## Como saber que é suficiente

Para cada seção do `process-document`, o critério mínimo:

| Seção | Confirmado no HubSpot quando... |
|-------|--------------------------------|
| Objetos envolvidos | `objectTypeId` e nome de cada objeto estão em `hubspot/objeto-*.md` |
| Propriedades críticas | Nome, tipo e grupo de cada propriedade relevante estão mapeados |
| Workflows envolvidos | Nome, ID, disparo e ações principais de cada workflow estão em `hubspot/workflows-*.md` |
| Integrações envolvidas | Endpoints e objetos impactados encontrados no código dos workflows |
| Cards/customizações | UI Extensions ou custom codes identificados nas ações dos workflows |
| Regras de negócio | Condições, branches e lógica relevante dos workflows documentados |

Se uma seção não puder ser preenchida com dados do HubSpot, registrar como **Ponto a validar** no documento — nunca inventar.

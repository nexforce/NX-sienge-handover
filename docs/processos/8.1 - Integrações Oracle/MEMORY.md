# MEMORY — 8.1 Integrações Oracle

Guia de sessão: o que já foi feito, o que não buscar de novo, o que falta confirmar.
Dados técnicos brutos estão em `hubspot/`.

---

## O que já foi consultado (não repetir)

| Data | Consulta | Ver |
|------|---------|-----|
| 2026-06-15 | `hubspot-get-schemas` | objeto `grupos` = objectTypeId `2-54707985` confirmado |
| 2026-06-15 | `hubspot-list-properties 2-54707985` | ~150 props, todos `prog_qtd_*` mapeados → `hubspot/objeto-grupo-de-contrato.md` |
| 2026-06-15 | `hubspot-list-workflows` (páginas 1-3) | 300+ workflows; 4 workflows Oracle identificados |
| 2026-06-15 | `hubspot-get-workflow 1785580697` | Split v03 completo (73 revisões) → `hubspot/workflows-oracle.md` |
| 2026-06-15 | `hubspot-get-workflow 1758086000` | DEV workflow (auth + fetch Oracle) → `hubspot/workflows-oracle.md` |
| 2026-06-15 | `hubspot-get-workflow 1744643667` | Workflow de criação/associação de GC → `hubspot/workflows-oracle.md` |
| 2026-06-15 | `hubspot-get-workflow 1744534395` | DEV Oracle em Company — stub, sem relevância para 8.1 |
| 2026-06-15 | `search_crm_objects PRODUCT` (MCP cloud) | 144 produtos, módulos Sienge, SKUs, Connectors → `hubspot/catalogo-produtos.md` |
| 2026-06-15 | `get_organization_details` | Portal 50102745, BRL, America/São_Paulo, STANDARD |

---

## Descobertas principais

- **Objeto central:** Grupo de Contrato (`objectTypeId: 2-54707985`, nome interno: `grupos`)
- **MCP:** Cloud MCP não acessa objetos customizados nem workflows. Usar MCP local `@hubspot/mcp-server@latest` via `.mcp.json`
- **Split:** Usa `hs_price_brl` do catálogo HubSpot como peso — **não** tabela externa. Confirmado no código do workflow
- **Anti-concorrência:** random delay (1-19s) + A/B test 3 branches (direto / +1 min / +2 min)
- **Delete-all + recreate:** todos os itens de linha do GC são arquivados e recriados a cada execução — confirmado no código
- **Workflow DEV** (id 1758086000): enrollment em UM único GC (`45054877487`) — stub, não é o sync real de produção

---

## Pontos confirmados

- 17 propriedades `prog_qtd_*` mapeadas para `lin_servico` Oracle (ver `hubspot/objeto-grupo-de-contrato.md`)
- Supressão para GCs com `status = "Cancelado"` — confirmado no `enrollmentCriteria` do workflow 1785580697
- Grupo ID extraído via regex `^[^._]+` sobre `nr_contrato` Oracle
- Itens de linha do Deal nunca devem ser alterados por este fluxo
- Quando `sistema` vazio: cria item único genérico "SaaS" (sku 44918051665) ou "Manutenção" (sku 39980447525)
- Quando SaaS + Manutenção ambos presentes: split de sistemas usa SaaS, MM criado separado

---

## Pontos ainda não confirmados

- **PV-01:** Como ocorre o sync em massa dos `prog_qtd_*` nos GCs de produção? (DEV workflow é stub; pode haver middleware externo)
- **PV-02:** Os valores do campo `sistema` (multiple checkbox) correspondem exatamente aos nomes dos produtos no catálogo HubSpot?
- **PV-03:** Todos os módulos Sienge têm `hs_price_brl` preenchido no catálogo? (se zero, item gerado com R$0,00)
- **PV-04:** Resolução e impacto do ticket 86ba8pa3r (Valor Final Serviços — in progress)
- **PV-05:** Existe alerta automático de falha na sync Oracle, ou depende de monitoramento manual de `sync_status_hs`?

---

## Tickets de estabilização

| ID | Título | Status |
|----|--------|--------|
| 86ba1rdmu | Oracle CTe não puxado para o GC | done |
| 86ba1ch4k | GC com valor divergente na barra lateral | done |
| 86ba1exe3 | Segmentar valores por serviços em Deal, Contrato e GC | done |
| 86ba8pa3r | Propriedade Valor Final Serviços não preenchida no Negócio | in progress |

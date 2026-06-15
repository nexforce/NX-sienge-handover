# Workflows Oracle — dump HubSpot

**Fonte:** `hubspot-list-workflows` (páginas 1-3) + `hubspot-get-workflow` por ID em 2026-06-15

---

## Workflow 1: [DEV] Integração Oracle — Grupo de Contrato

| Campo | Valor |
|-------|-------|
| ID | `1758086000` |
| Objeto | Grupo de Contrato (`2-54707985`) |
| Disparo | Agendado diariamente às 03:30h (schedule) |
| Enrollment | Um único GC: `hs_object_id = 45054877487` (stub de dev/teste) |
| Supressão | Nenhuma |
| Status | Ativo (DEV) |

**Ações:**
1. Python: POST Oracle auth → retorna `oracle_token`
2. Branch SUCCESS
3. Python: GET contratos Oracle para data atual (DDMMYYYY) → retorna `oracle_data` JSON
4. Branch SUCCESS
5. Python: Processa `oracle_data`, extrai `grupo_de_contrato_id` via regex `^[^._]+` sobre `nr_contrato`, acumula total de `prog_qtd` por grupo

**Observação:** Enrollment em único GC — stub de dev. O mecanismo real de sync em massa (atualização de `prog_qtd_*` nos demais GCs em produção) não está mapeado via HubSpot MCP. Pode haver middleware externo.

---

## Workflow 2: [01. Integração Oracle - Grupo de Contrato] Split de serviços em itens de linha (v03)

| Campo | Valor |
|-------|-------|
| ID | `1785580697` |
| Objeto | Grupo de Contrato (`2-54707985`) |
| Revisões | 73 (última: 2026-05-22) |
| Disparo | Qualquer `prog_qtd_*` IS_KNOWN ou `sistema` IS_KNOWN — re-enrollment ativo em cada mudança |
| Supressão | `status` = "Cancelado" |
| Secret | `HUBSPOT_INTEGRATIONS` |

**Fluxo de ações:**
1. Action 14 (JS): Random delay 1–19 seg — anti-concorrência inicial
2. Action 12: A/B Test 3 branches: direto → Action 1 / wait 1 min → Action 13 → 1 / wait 2 min → Action 15 → 13 → 1
3. Action 1 (Python): Busca itens de linha do GC → `batch_archive_line_items` (delete-all)
4. Branch SUCCESS do archive
5. Action (JS): Random delay 1–19 seg
6. Action 9: Branch "Com Split" se `prog_qtd_saas` OR `prog_qtd_manutencao` OR `prog_qtd_connectors` IS_KNOWN → Action 4
7. Else → Action 7 "Sem Split"

**Action 4 — Com Split (Python):**
- Recebe: `prog_qtd_saas`, `prog_qtd_manutencao`, `sistema`, `prog_qtd_connectors`
- Funções: `search_products_by_name`, `filter_no_split_data`, `filter_systems_data`, `filter_connectors_data`, `get_custom_price_from_grouped_items`, `batch_create_line_items`
- Separa produtos em: sistema (non_inventory, não conector), conector (nome começa com "Conector" ou "Connectors"), serviços fixos
- **Split de sistemas:** distribui valor `prog_qtd_saas` (ou `prog_qtd_manutencao`) proporcionalmente pelo `hs_price_brl` de cada módulo
- **Split de conectores:** distribui `prog_qtd_connectors` proporcionalmente pelo `hs_price_brl`
- **Serviços fixos:** preço = `prog_qtd_*` via `product_to_property_map`
- **Misto SaaS+MM:** itens de sistema usam valor SaaS + item "Manutenção Mensal" separado com `prog_qtd_manutencao`
- **Sem sistemas (campo `sistema` vazio):** item único "SaaS" (hs_sku: 44918051665) ou "Manutenção" (hs_sku: 39980447525)

**Mapeamento produto → prog_qtd (serviços fixos):**

| Produto HubSpot | prop_qtd usada |
|----------------|---------------|
| API Ultimate / Enterprise / Essencial / Special / Start / Start-CV | `prog_qtd_apis` |
| NFe / NFE - até 9 usuários / NFE - acima de 10 usuários | `prog_qtd_nota_fiscal_eletronica` |
| NFs | `prog_qtd_nota_fiscal_de_servico` |
| Recepção de CTe | `prog_qtd_emissao_de_conhecimento_de_transporte_eletronico_cte` |
| Base Teste Com Anexo / Sem Anexo / Custo fixo | `prog_qtd_base_de_testes` |
| E-Custos / Ecustos Plano 1/2/5/10/10+ | `prog_qtd_ecustos_integracao` |
| Data Center LU / Datacenter Exclusivo | `prog_qtd_locacao_de_data_center` |

**Action 7 — Sem Split (Python):**
- Cria um item por `prog_qtd_*` não nulo
- Nome do item: `lin_servico_desc_*` correspondente
- Preço: valor de `prog_qtd_*`
- SKU_MAP estático:

| Serviço | hs_sku |
|---------|--------|
| saas | 44918051665 |
| ecustos | 36626111882 |
| manutencao | 39980447525 |
| nfe eletronica projeto | 39488713589 |
| nfs | 36976593325 |
| cte | 36890053173 |
| nfe | 36971481191 |

---

## Workflow 3: [02.03. Contratos] Novo contrato criado → Cria ou Associa à um Grupo de Contrato + Replica Itens de Linha

| Campo | Valor |
|-------|-------|
| ID | `1744643667` |
| Objeto | Contrato (`2-54707915`) |
| Revisões | 123 |
| Disparo | Criação de Contrato com `tipo_de_orcamento` = "Primeira Venda", "Aditivo de Retração" ou "Aditivo de Expansão" |
| Re-enrollment | Ativo |
| Secret | `nx_interno` |

**Casos:**
- **Primeira Venda / Expansão Nova Base / Migração LU→SaaS:** Cria novo GC com ~30 propriedades copiadas do Contrato (inclui `prog_qtd_*`)
- **Aditivo de Expansão — Base Teste:** Cria GC marcado como Base de Teste
- **Retração / Expansão com GC existente:** Associa Contrato ao GC existente

**Python (replica itens de linha):**
- Copia itens do Contrato para o GC (create ou update por nome)
- Expansão: soma valor ao item existente
- Retração: subtrai valor absoluto do item existente
- **Exclui:** "Aditivo de usuário (SaaS)", "Retração de usuário (SaaS)", "Data Center por Usuário", implantação em grupo/individual Gestor Obras, "Serviço de Implantação - Sienge", "Licenca de Uso (LU)"

---

## Workflow 4: Recálculo de campos financeiros consolidados

| ID | Nome | Campo calculado |
|----|------|----------------|
| `1789582978` | [04.04.01] Valor Serviço | `valor_servico__oficial` |
| `1789452035` | [04.04.02] Valor SaaS | `valor_saas_oficial` |
| `1789589316` | [04.04.03] MM LU | `valor_manutencao_mensal_lu` |
| `1789539100` | [04.04.04] Data Center LU | `valor_data_center_lu` |

- **Objeto:** Grupo de Contrato (`2-54707985`)
- **Disparo:** `prog_qtd_*` atualizado — re-enrollment ativo
- **Ação:** Recalcula campo financeiro consolidado com base nos `prog_qtd_*` relevantes
- **Execução:** Em cascata após atualização dos `prog_qtd_*`

---

## Workflow auxiliar (não integração Oracle)

- **[DEV] Integração Oracle em Company** (id: 1744534395) — stub de dev no objeto Company, sem relação direta com o fluxo Oracle de GC

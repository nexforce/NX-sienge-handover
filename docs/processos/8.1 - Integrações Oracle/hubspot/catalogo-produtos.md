# Catálogo de Produtos HubSpot — dump

**Fonte:** `search_crm_objects PRODUCT` (MCP cloud) em 2026-06-15
**Total de produtos no portal:** 144

---

## Produtos usados diretamente pela integração Oracle

| Produto | Tipo | Frequência | hs_sku | Observação |
|---------|------|-----------|--------|-----------|
| SaaS | service | monthly | 44918051665 | Genérico — usado quando `sistema` está vazio no GC |
| Manutenção Mensal | non_inventory | monthly | 39980447525 | Clientes LU (licença única) |
| E-Custos | e_custos | monthly | 36626111882 | — |
| NFe | service | monthly | 36971481191 | — |
| NFs | service | monthly | 36976593325 | — |
| Recepção de CTe | service | monthly | 36890053173 | — |
| Recepção de Nota Fiscal Eletrônica | non_inventory | monthly | 39488713589 | Também "nfe eletronica projeto" |
| API Start | service | monthly | — | — |
| API Essencial | service | monthly | — | — |
| API Special | service | monthly | — | — |
| API Ultimate | service | monthly | — | — |
| API Enterprise | service | monthly | — | — |
| API - Start - CV | service | monthly | — | Variante CV |
| NFE - até 9 usuários | service | monthly | — | — |
| NFE - acima de 10 usuários | service | monthly | — | — |
| Base Teste Sem Anexo | service | monthly | — | — |
| Base Teste Com Anexo | service | monthly | — | — |
| Base Teste - Custo fixo (Cliente c/ API) | service | monthly | — | — |
| Data Center LU | — | monthly | — | — |
| Datacenter Exclusivo | — | monthly | — | — |
| Licença de Uso (LU) | inventory | — | — | NÃO criado pela integração Oracle |
| Aditivo de usuário (SaaS) | usuario | monthly | — | NÃO criado pela integração Oracle |
| Retração de usuário (SaaS) | usuario | monthly | — | NÃO criado pela integração Oracle |

---

## Produtos Connectors identificados

Identificados no código do workflow de split (nome começa com "Conector" ou "Connectors"):

- Connectors - Revit
- Connectors - SuaHouse
- Connectors - Facilita
- Connectors - Alcis
- Conector Automação Bancária
- Conector Assinatura Eletrônica
- Conector Recepção de NFs
- Conector Skyline
- Conector Anapro

O valor `prog_qtd_connectors` é distribuído proporcionalmente entre esses produtos pelo preço (`hs_price_brl`).

---

## Módulos/sistemas Sienge — usados no split SaaS/LU

**Tipo:** non_inventory | **Frequência:** monthly

O preço `hs_price_brl` de cada módulo no catálogo HubSpot é o peso do split proporcional (confirmado no código do workflow).

Lista completa de módulos identificados:

Contas a Pagar, Contas a Receber, Contabilidade, Compras, Caixa e Bancos, Contratos e Medições, Controle de Mão de Obra, Controle de Aquisições, Custo Orçado e Incorrido, Custos Unitários, Orçamento, Orçamento Empresarial, Planejamento, Viabilidade Econômica, Acompanhamento de Viabilidade, Gerencial Financeiro, Gerencial de Obras, Gerencial de Suprimentos, Estoque, Frotas e Equipamentos, Patrimônio, Vendas, Pró-Vendas, Locações de Equipamentos, Locações de Imóveis Próprios, Exportações e Importações, Integração Fiscal, Integração Contábil, Integração Folha de Pagamento, Integração BIM, Administração de Pessoal, Administração Integrada, Obrigações Fiscais, EFD - Reinf, Auditoria Interna, Certidões, Diário de Obra, E-Social, Medicina do Trabalho, Segurança do Trabalho, Portal do Colaborador, Cargos e Salários, Workflow, Recrutamento e Seleção, Treinamento, Benefícios, Ponto Eletrônico, Controle de Competências, Responsabilidade Social, Assistência Técnica, Melhoria Contínua, Normas e Procedimentos, Acompanhamento de Correção, Acompanhamento, Acompanhamento de Saúde, Segurança e Saúde no Trabalho, Portal do Gestor, Portal do Corretor, Portal do Cliente, Portal do Fornecedor (com Pré-cadastro), Portal do Fornecedor (sem Pré-cadastro), GO Live, GO PRO, GO Live via Superlógica, GO PRO via Superlógica, Gestão de Condomínios

**Atenção:** O campo `sistema` do Grupo de Contrato é um multiple checkbox. Os valores marcados devem corresponder **exatamente** aos nomes dos produtos acima para o split funcionar corretamente (PV-02 — não confirmado).

---

## Nota sobre preços no catálogo

Via MCP cloud (`search_crm_objects PRODUCT`), os preços `hs_price_brl` não foram retornados diretamente.
O código do workflow confirma que o split usa `hs_price_brl` de cada produto como peso.
Se um produto tiver `hs_price_brl = 0` ou não preenchido, receberá item com preço R$0,00 no GC (PV-03 — não confirmado).

# Objeto: Grupo de Contrato — dump HubSpot

**Fonte:** consulta `hubspot-get-schemas` + `hubspot-list-properties 2-54707985` em 2026-06-15

---

## Identificação

| Campo | Valor |
|-------|-------|
| Nome interno | `grupos` |
| objectTypeId | `2-54707985` |
| Portal | 50102745 |

## Pipeline

Nome: **"Pipeline de Grupos de Contrato"**

| Etapa | Comportamento no processo Oracle |
|-------|----------------------------------|
| Ativo | Processado normalmente pela integração Oracle |
| Cancelado | Suprimido do workflow de split (não gera itens de linha) |

## Grupos de propriedades

| Grupo | Finalidade |
|-------|-----------|
| `integração_oracle` | Todas as props `prog_qtd_*`, `lin_servico_*`, `lin_servico_desc_*`, `sistema`, `nr_contrato_hs`, `last_sync_at_hs`, `sync_status_hs` |
| `grupos_de_contrato_information` | Props gerais de gestão, valores financeiros consolidados, datas, responsáveis |
| `contratos_saas` | `qtd_de_usuarios_totais_saas_oficial`, `valor_por_usuario` |
| `contratos_licença_única_(lu)` | `valor_data_center_lu`, `valor_manutencao_mensal_lu`, `quantidade_de_usuarios_*` |
| `equipes` | Props de atribuição de equipes |
| `concessões` | Props de fluxo de concessão |
| `solicitação_de_troca_de_canal` | Props de troca de canal |

---

## Propriedades prog_qtd_* (grupo: integração_oracle)

Chave de integração: `nr_contrato_hs` (prefixo do contrato Oracle, regex `^[^._]+`)

| Propriedade HubSpot | lin_servico Oracle | lin_servico_desc Oracle |
|---------------------|--------------------|------------------------|
| `prog_qtd_saas` | `lin_servico_saas` | SAAS |
| `prog_qtd_manutencao` | `lin_servico_manutencao` | MANUTENCAO |
| `prog_qtd_apis` | `lin_servico_apis` | APIs |
| `prog_qtd_connectors` | `lin_servico_connectors` | CONNECTORS |
| `prog_qtd_consultoria` | `lin_servico_consultoria` | CONSULTORIA |
| `prog_qtd_locacao_de_data_center` | `lin_servico_locacao_de_data_center` | LOCACAO DE DATA CENTER |
| `prog_qtd_base_de_testes` | `lin_servico_base_de_testes` | BASE DE TESTES |
| `prog_qtd_ecustos_integracao` | `lin_servico_ecustos_integracao` | ECUSTOS INTEGRAÇÃO |
| `prog_qtd_locacao` | `lin_servico_locacao` | LOCACAO |
| `prog_qtd_nota_fiscal_eletronica` | `lin_servico_nota_fiscal_eletronica` | NOTA FISCAL ELETRONICA |
| `prog_qtd_nota_fiscal_de_servico` | `lin_servico_nota_fiscal_de_servico` | NOTA FISCAL DE SERVICO |
| `prog_qtd_emissao_de_conhecimento_de_transporte_eletronico_cte` | `lin_servico_emissao_...cte` | EMISSAO DE CONHECIMENTO DE TRANSPORTE ELETRONICO (CTE) |
| `prog_qtd_nota_fiscal_eletronica_projeto_recepcao_nota_fiscal` | `lin_servico_nota_fiscal_eletronica_projeto_recepcao_nota_fiscal` | NOTA FISCAL ELETRONICA - PROJETO RECEPCAO NOTA FISCAL |
| `prog_qtd_intermediacao` | `lin_servico_intermediacao` | INTERMEDIACAO |
| `prog_qtd_desenvolvimento_fabrica_de_desenvolvimento` | `lin_servico_desenvolvimento_fabrica_de_desenvolvimento` | DESENVOLVIMENTO (FABRICA DE DESENVOLVIMENTO) |
| `prog_qtd_licenca_de_uso_base_client_share` | `lin_servico_licenca_de_uso_base_client_share` | LICENCA DE USO BASE (CLIENT SHARE) |

---

## Propriedades de controle de sync

| Propriedade | Tipo | Finalidade |
|-------------|------|-----------|
| `nr_contrato_hs` | string | Chave de busca do GC no Oracle |
| `last_sync_at_hs` | datetime | Timestamp da última sync |
| `last_sync_run_id_hs` | string | ID da run de sync |
| `sync_status_hs` | string | Log de erro da sync |
| `vigencia_de_hs` | date | Data de início de vigência (Oracle) |
| `vigencia_ate_hs` | date | Data de fim de vigência (Oracle) |
| `mrr_saas_total_oracle_hs` | number | Somatório dos itens SaaS do Oracle |
| `cnpjs_relacionados_hs` | string | CNPJs relacionados ao GC |
| `codigo_cliente` | string | Código do cliente no Oracle |
| `contratos_origem` | string | Contratos de origem no Oracle |

## Propriedade de trigger de itens de linha

| Propriedade | Tipo | Finalidade |
|-------------|------|-----------|
| `gatilho_de_atualizacao_de_itens_de_linha` | bool | Dispara reconstrução de itens de linha do GC após associação de novo Contrato |
| `status` | enumeration | Ativo ou Cancelado — GCs Cancelados são suprimidos da integração Oracle |

---

## Propriedades financeiras consolidadas (grupo: grupos_de_contrato_information)

Calculadas por workflows secundários após atualização dos `prog_qtd_*`:

| Propriedade | Finalidade |
|-------------|-----------|
| `mrr_oficial` | MRR calculado do GC |
| `valor_saas_oficial` | Valor SaaS total |
| `valor_servico__oficial` | Valor Serviço total |
| `valor_data_center_lu` | Valor Data Center LU |
| `valor_manutencao_mensal_lu` | Valor Manutenção Mensal LU |

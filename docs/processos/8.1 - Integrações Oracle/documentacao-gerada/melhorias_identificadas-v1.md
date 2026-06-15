# Melhorias identificadas — 8.1 Integrações Oracle (V1)

**Documento:** `8.1 - Integrações Oracle.docx`
**Data da análise:** 15 de junho de 2026
**Analisado por:** Claude (Nexforce Services)

---

## Cobertura estrutural

Todos os 14 campos obrigatórios da skill `process-document` estão presentes. A divisão Visão Funcional / Visão Técnica está correta. O documento está acima do mínimo estrutural.

| Campo obrigatório | Status |
|---|---|
| Nome do processo | ✅ |
| Objetivo | ✅ |
| Contexto de negócio | ✅ |
| Fluxo operacional | ✅ |
| Objetos envolvidos | ✅ |
| Propriedades críticas | ✅ |
| Workflows envolvidos | ✅ |
| Integrações envolvidas | ✅ |
| Cards / customizações | ✅ (vazio por design — sem cards customizados) |
| Regra de negócio | ✅ |
| Critério de validação | ✅ |
| Riscos e dependências | ✅ |
| Materiais de apoio | ✅ |
| Pontos a validar | ✅ |

---

## Pontos fracos identificados

### 1. Mecanismo real de sync em produção (CRÍTICO)

**O que está no doc:** O workflow `[DEV] Integração Oracle` (id 1758086000) está com enrollment em apenas 1 GC específico (id 45054877487). O documento registra isso como PV-01 mas não resolve.

**Por que está fraco:** Isso não é uma dúvida periférica — é a peça central do processo. Se esse workflow só roda em 1 GC de teste, o que atualiza os `prog_qtd_*` de todos os demais GCs em produção? Existem 3 possibilidades não investigadas:
- Existe um middleware externo (fora do HubSpot, portanto invisível ao MCP) que faz a sync em massa
- Existe outro workflow HubSpot não encontrado durante as consultas
- O workflow DEV é chamado de fora por um sistema externo que injeta os dados GC por GC

**Impacto:** Sem isso esclarecido, o leitor não consegue entender como o processo funciona de ponta a ponta em produção. O documento descreve um mecanismo que claramente não é o real.

**Como investigar:** Perguntar diretamente a Vinicius Vanoni. Alternativa: revisar os tickets ClickUp do processo (46 tarefas) em busca de menção a serviço externo, AWS Lambda, Zapier ou qualquer middleware.

---

### 2. Anuentes — conceito ausente do documento

**O que está no doc:** Nenhuma menção ao conceito de anuentes (co-titulares de contratos).

**Por que está fraco:** As 46 tarefas do ClickUp do processo 8.1 incluem o tema "Distribuição de anuentes". Se esse tema aparece nas tarefas do processo, há algo da integração Oracle que toca anuentes — mas o documento não menciona o conceito em nenhum momento.

**Como investigar:** Abrir os tickets ClickUp sobre anuentes para entender se há propriedades de anuentes sendo sincronizadas do Oracle para o HubSpot. Se não há relação com Oracle, registrar explicitamente que está fora do escopo deste processo.

---

### 3. Portfólio — workflow de atualização não documentado

**O que está no doc (seção 4.1):** "Portfólio — Recebe atualização de itens de linha via workflow separado após alterações no GC."

**O que está ausente:** Esse workflow não é identificado em nenhum lugar. Não tem ID, não tem seção na 4.3.

**Por que está fraco:** Se existe um workflow que atualiza o Portfólio como consequência da sync Oracle, ele faz parte do processo 8.1 e deveria estar documentado. Se não existe ainda (backlog), deveria estar em Pontos a Validar com essa informação.

**Como investigar:** Buscar no HubSpot workflows com objeto Portfólio (`2-54708014`) que disparam por alterações em `prog_qtd_*` ou `gatilho_*`. Ou perguntar a Vinicius.

---

### 4. Contradição não endereçada: sync incremental vs. delete-all

**O que está no doc:** Seção 4.3 e Regra 2 descrevem a estratégia delete-all + recreate. Correto — isso é o que o HubSpot faz.

**O que está no drive:** O documento `[Nexforce & Sienge] Orientações integração Oracle → HubSpot.md` (seção 4) menciona "Sincronização incremental (não delete-all global)".

**Por que é um ponto fraco:** Há uma contradição entre dois documentos de referência. O V1 está correto (segue o HubSpot real), mas não endereça que o documento de orientação original dizia o contrário. Isso pode gerar confusão se alguém ler os dois documentos.

**Sugestão:** Adicionar uma nota em Pontos a Validar ou Riscos explicando que o documento de orientação original previa sync incremental, mas a implementação real usa delete-all + recreate, confirmado no HubSpot.

---

### 5. Integração Oracle sem estrutura Entrada / Saída / Objeto / Risco em bloco único

**O que está no doc:** Seção 4.4 tem tabela de endpoints e tabela de mapeamento `lin_servico → prop HubSpot`. Conteúdo técnico adequado.

**O que a skill exige (critério de qualidade):** "Toda integração citada deve explicar: Entrada; Saída; Objeto impactado; Risco principal."

**Por que está fraco:** As 4 dimensões não estão estruturadas explicitamente. O conteúdo existe no documento, mas espalhado — endpoints na 4.4, objetos na 4.1, riscos na seção 5. Um leitor que quer entender a integração de forma rápida não encontra as 4 dimensões juntas em um único lugar.

**Sugestão:** Adicionar um bloco resumo da integração com as 4 dimensões antes das tabelas técnicas na seção 4.4.

---

### 6. Workflows sem campo "Objetivo" explícito

**O que está no doc:** Os workflows são documentados com: ID, Status, Objeto, Disparo, Ações principais, Dependências.

**O que a skill exige:** Para cada workflow: Nome, **Objetivo**, Objeto, Evento de disparo, Principais ações, Dependências.

**Por que está fraco:** O campo "Objetivo" está ausente como linha da tabela em todos os 4 workflows documentados. O objetivo pode ser inferido das ações, mas a skill exige que seja explícito — uma pessoa que nunca viu o processo precisa entender em 1 linha para que serve cada workflow antes de ler suas ações.

---

### 7. Propriedades `lin_servico_desc_*` não confirmadas no HubSpot

**O que está no doc (Regra 11):** "Sem Split: cria itens usando `lin_servico_desc_*` como nome do item e `prog_qtd_*` como preço."

**Problema:** As propriedades `lin_servico_desc_*` não aparecem na tabela de Propriedades Críticas (seção 4.2). O schema do Grupo de Contrato lista `prog_qtd_*` e `lin_servico_*` no grupo `integração_oracle`, mas não fica claro se `lin_servico_desc_*` existe e está sendo populado em produção.

**Por que está fraco:** Se essas propriedades não existem ou não são populadas pelo Oracle sync, o caminho "Sem Split" não funciona. Deveria estar em Pontos a Validar.

---

### 8. Regra 6 fora de ordem

**O que está no doc:** A sequência das regras é: 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 6.

**Impacto:** Cosmético. Regra 6 aparece depois da Regra 11, o que pode confundir o leitor que espera sequência lógica.

---

## Resumo de prioridade

| # | Ponto | Impacto | Origem do gap |
|---|---|---|---|
| 1 | Mecanismo real de sync em produção | Crítico | MCP não enxerga middleware externo; workflow DEV é de teste |
| 2 | Anuentes ausentes do documento | Alto | 46 tarefas ClickUp não foram todas analisadas |
| 3 | Portfólio — workflow não documentado | Alto | Workflow não encontrado no HubSpot ou ainda não existe |
| 4 | Contradição incremental vs. delete-all | Médio | Documento de orientação desatualizado vs. implementação real |
| 5 | Integração sem Entrada/Saída/Objeto/Risco em bloco único | Médio | Gap de formato — conteúdo existe, mas está espalhado |
| 6 | Workflows sem campo Objetivo | Baixo | Gap formal de estrutura da skill |
| 7 | `lin_servico_desc_*` não confirmado | Baixo | Propriedades não validadas no HubSpot |
| 8 | Regra 6 fora de ordem | Cosmético | — |

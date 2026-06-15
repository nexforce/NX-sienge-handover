# CLAUDE.md — Projeto Sienge RaaS (Nexforce Services)

## Objetivo do projeto

Criar a documentação V1 dos 15 processos do HubSpot RaaS implementado para o cliente Sienge.
Cada processo deve ter seu próprio arquivo `.docx` seguindo a estrutura definida abaixo.

---

## Contexto do projeto

- **Cliente:** Sienge
- **Produto:** HubSpot RaaS (Revenue as a Service)
- **Empresa:** Nexforce Services
- **Fase atual:** Estabilização pós Go Live
- **Status:** Regras de negócio ainda mudando via tickets de estabilização
- **Fonte de verdade para configuração atual:** HubSpot (estado real dos workflows e objetos)
- **Fonte de verdade para regras de negócio e histórico:** ClickUp (épicos dos grupos + tickets de estabilização)

---

## Pontos focais por processo

| ID  | Processo                    | Responsável          |
| --- | --------------------------- | -------------------- |
| 1.0 | Pré Vendas                  | Elias Moreira        |
| 2.0 | Vendas e Contratação        | Vinicius Vieira Braz |
| 2.1 | Vendas — Contrato/Portfólio | Vinicius Vanoni      |
| 2.2 | Vendas [Dev]                | Jorge Souza          |
| 3.0 | Aprovações                  | João Passaro         |
| 4.0 | Precificação                | Vinicius Vanoni      |
| 4.1 | Precificação [Dev]          | Jorge Souza          |
| 5.0 | Minutas                     | Moisés Araújo        |
| 5.1 | Minutas [Dev]               | Jorge Souza          |
| 6.0 | CS e Atendimento            | Moisés Araújo        |
| 7.0 | KPIs e Indicadores          | Moisés Araújo        |
| 8.0 | Governança e Permissões     | Pedro Soave Neto     |
| 8.1 | Integrações Oracle          | Vinicius Vanoni      |
| 8.2 | Integrações RD Station      | Elias Moreira        |
| 8.3 | Integrações Freshdesk       | Moisés Araújo        |

---

## OBJETIVO: Arquivos esperados como entrega

Um arquivo de documentação em formato .docx para cada processo acima.

### Convenção de nomenclatura dos arquivos

Utilizar o padrão:

[ID Processo] - [Nome do Processo].docx

Exemplos:
1.0 - Pré Vendas.docx
2.0 - Vendas e Contratação.docx
8.1 - Integrações Oracle.docx

### Estrutura de diretórios da entrega

Todos os documentos devem ser gerados dentro da pasta do processo correspondente.
Padrão:
/docs/processos/[ID] - [Nome]/documentacao-gerada/
Exemplo:
/docs/processos/5.0 - Minutas/documentacao-gerada/

### Estrutura completa de cada pasta de processo

```
/docs/processos/[ID] - [Nome]/
├── clickup/
│   └── [ID] - [Nome].md          — tarefas do processo extraídas do ClickUp
├── drive/
│   └── *.md                       — documentos de apoio (escopos, orientações, planilhas exportadas)
├── hubspot/
│   └── *.md                       — dumps de consultas ao HubSpot (gerados durante a documentação)
├── documentacao-gerada/
│   └── [ID] - [Nome].docx         — entrega final
└── MEMORY.md                      — descobertas acumuladas durante a documentação deste processo
```

---

## MEMORY.md por processo — regras de uso

Cada processo tem seu próprio `MEMORY.md` em `/docs/processos/[ID] - [Nome]/MEMORY.md`.

**Ao iniciar um processo:**
1. Ler o `MEMORY.md` antes de qualquer consulta — pode haver descobertas de sessões anteriores.
2. Usar as informações ali para não repetir consultas já feitas.

**Durante a documentação:**
- Registrar no `MEMORY.md` toda descoberta relevante feita no HubSpot (propriedades confirmadas, workflows encontrados, nomes exatos de objetos).
- Registrar tickets do ClickUp que tiveram impacto relevante na regra de negócio.
- Registrar pontos ainda não confirmados na seção "Pontos ainda não confirmados".

**Ao finalizar uma sessão:**
- Atualizar a seção "Histórico de consultas ao HubSpot" com data e resultado.
- O `MEMORY.md` é fonte de verdade acumulada — não apagar informações, apenas complementar ou corrigir.

---

## Fontes de dados por processo

| Fonte                                                              | O que buscar                                                       |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `/docs/processos/[ID] - [Nome]/clickup/[ID] - [Nome].md`          | **Tarefas do processo específico já separadas (recomendado)**       |
| `docs/_shared/sienge_tarefas_clickup_completo.md`                  | Inventário completo de todas as 739 tarefas (não recomendado)      |
| HubSpot (via MCP)                                                  | Estado atual: workflows, propriedades, pipelines, objetos          |
| ClickUp `clickup_get_task`                                         | Detalhes de tickets específicos quando necessário                  |

---

## Arquivos de tarefas separados por processo

Os 739 tickets do ClickUp foram separados em **10 arquivos** (um por processo) para otimizar carregamento de contexto:

```
/docs/processos/
├── 5.0 - Minutas/clickup/5.0 - Minutas.md (61 tarefas) ⭐ URGENTE
├── 2.0 - Vendas e Contratação/clickup/2.0 - Vendas e Contratação.md (51 tarefas)
├── 8.0 - Governança e Permissões/clickup/8.0 - Governança e Permissões.md (44 tarefas)
├── 8.1 - Integrações Oracle/clickup/8.1 - Integrações Oracle.md (39 tarefas)
├── 6.0 - CS e Atendimento/clickup/6.0 - CS e Atendimento.md (17 tarefas)
├── 7.0 - KPIs e Indicadores/clickup/7.0 - KPIs e Indicadores.md (8 tarefas)
├── 8.2 - Integrações RD Station/clickup/8.2 - Integrações RD Station.md (6 tarefas)
├── 3.0 - Aprovações/clickup/3.0 - Aprovações.md (3 tarefas)
├── 2.1 - Vendas — Contrato-Portfólio/clickup/2.1 - Vendas - Contrato-Portfólio.md (2 tarefas)
└── 8.3 - Integrações Freshdesk/clickup/8.3 - Integrações Freshdesk.md (1 tarefa)

/docs/_shared/
└── 0.0 - Não Classificadas.md (45 tarefas — não vinculadas a um processo)
```

**Use esses arquivos** ao documentar um processo — carrega só as tarefas relevantes, não as 739 todas.

---

## HubSpot — regra de uso

**Apenas leitura.** Nunca criar, editar, deletar ou disparar nenhum objeto, propriedade, workflow ou registro no HubSpot.
O HubSpot é consultado para confirmar o estado atual da configuração (workflows ativos, propriedades existentes, objetos) e deve ser usado de forma cirúrgica: buscar apenas o que é necessário para o processo em documentação, não varrer tudo.

---

## Skills a utilizar

Ao gerar ou revisar qualquer documento de processo, invocar obrigatoriamente a skill `process-document` antes de começar.
Ela define a estrutura obrigatória, os campos esperados, a divisão Visão Funcional / Visão Técnica e os critérios de qualidade da entrega.

Ao buscar dados no HubSpot para qualquer processo, invocar obrigatoriamente a skill `hubspot-search` antes de iniciar as consultas.
Ela define a sequência de buscas, quais ferramentas MCP usar, onde salvar os resultados e quando parar — evitando varreduras desnecessárias que inflam contexto e consomem tokens.

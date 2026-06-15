---
name: pipeline-review
description: Revisa o pipeline de candidatos ativos no processo seletivo. Identifica candidatos parados, em risco de perda para concorrente, ou sem follow-up ha mais de X dias. Use quando o usuario disser "como esta o pipeline de candidatos", "quem precisa de follow-up", "status das vagas abertas", "review de selecao" ou variacoes. Tambem executada automaticamente toda sexta.
---

# Skill: Pipeline Review

## Quando usar
- Revisao semanal do funil de selecao (executada via scheduled task toda sexta)
- Qualquer momento que o usuario queira status das vagas abertas
- Antes de uma reuniao de People para priorizar acoes

---

## Informacoes obrigatorias antes de iniciar

Se o arquivo de pipeline nao existir em inputs/, usar `AskUserQuestion`:

1. Ha um arquivo de pipeline de candidatos em inputs/pipeline.md (ou .csv)?
   Se nao: pedir que o usuario forneca a lista de candidatos ativos com: nome, cargo, etapa atual, data da ultima interacao, Score Guardiao (se ja entrevistado)

---

## Estrutura esperada do arquivo de pipeline

O arquivo `inputs/pipeline.md` deve conter para cada candidato:
- Nome completo
- Cargo pretendido
- Etapa atual: [Triagem / Entrevista-1 / Entrevista-2 / Bgcheck / Referencia / Oferta / Encerrado]
- Data da ultima interacao (YYYY-MM-DD)
- Score Guardiao (se ja entrevistado, senao: pendente)
- Notas: processos paralelos ativos, expectativa salarial, urgencia

---

## Processo de analise

### Passo 1 — Calcular tempo parado por etapa

Thresholds de alerta por etapa:

| Etapa | Alerta amarelo | Alerta vermelho |
|---|---|---|
| Triagem | 5+ dias sem contato | 10+ dias |
| Entrevista-1 agendada | 3+ dias sem confirmar | 7+ dias |
| Entre entrevista-1 e entrevista-2 | 7+ dias | 14+ dias |
| Bgcheck / Referencia | 7+ dias | 14+ dias |
| Oferta enviada | 3+ dias sem resposta | 7+ dias |

### Passo 2 — Identificar riscos de perda

Candidatos em risco de ser perdidos para concorrente:
- Score 4 ou 5 parado ha mais de 7 dias em qualquer etapa apos entrevista-1
- Candidato que mencionou processo paralelo ativo e esta ha mais de 5 dias sem contato
- Oferta enviada ha mais de 5 dias sem resposta

### Passo 3 — Classificar acoes necessarias

Para cada candidato ativo, classificar:
- URGENTE: risco de perda, requer acao hoje
- FOLLOW-UP: prazo normal, agendar para esta semana
- AGUARDANDO: depende de acao do candidato ou terceiro, monitorar
- ENCERRAR: candidato sem resposta por mais de 21 dias, propor encerramento

### Passo 4 — Resumo de vagas abertas

Agregar por cargo: quantos candidatos por etapa, qual o mais avancado, qual a previsao de fechamento.

---

## Formato de output

```
# Pipeline Review - [YYYY-MM-DD]
[N] candidatos ativos | [N] vagas abertas | [N] acoes urgentes

---

## Acoes urgentes (fazer hoje)

| Candidato | Cargo | Etapa | Parado ha | Acao |
|---|---|---|---|---|
| [Nome] | [cargo] | [etapa] | [X dias] | [acao especifica] |

---

## Follow-ups desta semana

| Candidato | Cargo | Etapa | Ultima interacao | Acao sugerida |
|---|---|---|---|---|
| [Nome] | [cargo] | [etapa] | [data] | [acao] |

---

## Status por vaga

### [Cargo 1]
- Candidatos ativos: [N]
- Mais avancado: [nome] em [etapa] (Score [N] se disponivel)
- Previsao de fechamento: [semana / mes / sem previsao]
- Risco: [SIM - descrever / NAO]

### [Cargo 2]
[mesmo formato]

---

## Para encerrar (sem resposta por 21+ dias)

| Candidato | Cargo | Ultima interacao | Acao sugerida |
|---|---|---|---|
| [Nome] | [cargo] | [data] | Enviar mensagem de encerramento |

---

## Metricas do funil (se dados suficientes)

- Candidatos em triagem: [N]
- Candidatos pos-entrevista-1: [N]
- Candidatos em fase final (bgcheck/referencia/oferta): [N]
- Taxa de aprovacao Entrevista-1 -> Entrevista-2: [X]% (se calculavel)
- Tempo medio por etapa: [se dados suficientes]
```

---

## Formato de arquivo

Salvar em `outputs/YYYY-MM-DD_pipeline-review/pipeline.md`.
Criar a pasta com a data de hoje se nao existir.

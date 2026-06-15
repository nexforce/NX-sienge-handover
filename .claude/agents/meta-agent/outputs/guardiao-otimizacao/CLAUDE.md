# Projeto: Otimizacao do Guardiao

**Versao:** 1.0 | **Iniciado:** Mai 2026 | **Agente-alvo:** vitti-interviewer v2.0
**Metodo:** OPMAX

---

## Objetivo

Aumentar a acuracia preditiva do score 1-5 do Guardiao e expandir a capacidade do background check com novas fontes e scoring granular.

**Resultado esperado:** reducao mensuravel da taxa de erro de predicao em Sales e Revenue (hoje 31% e 20%, respectivamente) e bgcheck com cobertura verificavel em 80%+ dos candidatos.

**Nao esta em escopo:** novos roles, mudanca de metodologia de entrevista, alteracao de formato de output.

---

## OPMAX

### Objective

Reduzir erros de predicao do Guardiao em dois vetores comprovados:

1. **Score accuracy:** Score-3 sem caveat e vies de fluencia verbal em Sales/Revenue sao responsaveis por 52% dos erros de pipeline em volume absoluto. A rubrica atual foi construida com dados ate Abr 2026. Precisa ser recalibrada com contratacoes e demissoes posteriores.

2. **Background check:** A skill atual cobre fontes primarias (LinkedIn, JusBrasil, Receita Federal, Google, Glassdoor) mas nao tem scoring quantitativo, nao acessa CNJ nacional, nao cobre Serasa PF, e nao tem logica de risco ponderada. Resultado: outputs inconsistentes e subjetivos.

---

### Plan

**Stream 1: Score Accuracy**

Passo 1 -- Coleta de dados novos
Carregar em `inputs/contratacoes/` os dados de candidatos contratados apos Abr 2026 com: nome, cargo, score dado, data de entrada, status atual (ativo/demitido/saiu), motivo de saida se aplicavel.

Passo 2 -- Auditoria de predicao
Usar a skill `score-audit` para processar os dados e calcular: taxa de acerto por score, taxa de erro por role, padroes de falha nao documentados.

Passo 3 -- Recalibracao
Com base na auditoria: ajustar thresholds, adicionar novos sinais de alerta, atualizar candidatos-ancora. Gerar patch para CLAUDE.md do Guardiao e para a skill `candidate-evaluation`.

**Stream 2: Background Check**

Passo 1 -- Mapeamento de gaps
Documentar o que a skill atual nao cobre vs. o que e acessivel publicamente no Brasil.

Passo 2 -- Expansao de fontes
Adicionar ao bgcheck: Escavador, CNJ (cnj.jus.br), Serasa Experian PF (quando disponivel), DETRAN (habilitacao para cargos com veiculo), redes sociais com protocolo estruturado.

Passo 3 -- Scoring granular
Substituir Verde/Amarelo/Vermelho por score ponderado 0-100 com pesos por categoria. Output: risco calculado + evidencias especificas + recomendacao binaria (avanca / nao avanca sem verificacao).

---

### Metrics

| Metrica | Baseline (v2.0) | Meta |
|---|---|---|
| Taxa de erro Sales (contratados, demitidos <6m) | 31% | Abaixo de 20% |
| Taxa de erro Revenue (idem) | 20% | Abaixo de 12% |
| Score-3 sem caveat documentado | Historicamente frequente | Zero |
| Cobertura bgcheck (info verificavel encontrada) | Nao medido | 80%+ |
| Tempo medio de bgcheck | Nao medido | Abaixo de 20 min |
| Falsos negativos bgcheck (flag perdida) | Nao medido | Abaixo de 5% |

As metricas de score accuracy so podem ser calculadas com dados novos. Exigem ao menos 10 casos pos-Mai 2026 para ter significancia.

---

### Action

**Prioridade 1 (fazer agora):**
- Carregar dados de contratacoes e demissoes pos-Abr 2026 em `inputs/`
- Rodar skill `score-audit` para gerar relatorio de auditoria
- Expandir skill `background-check` com novas fontes e scoring ponderado

**Prioridade 2 (apos auditoria):**
- Gerar patch para CLAUDE.md do Guardiao com thresholds atualizados
- Gerar patch para skill `candidate-evaluation` com novos sinais de alerta
- Documentar novos candidatos-ancora por role

**Prioridade 3 (ciclo seguinte):**
- Criar protocolo de atualizacao trimestral: a cada novo ciclo com 3+ casos que formem padrao, rodar auditoria e aplicar patch

---

## Comportamento operacional

**Ao receber dados novos:**
- Arquivos de contratacao vao em `inputs/contratacoes/`
- Arquivos de demissao vao em `inputs/demissoes/`
- Formato aceito: planilha (.xlsx, .csv) ou texto estruturado com campos: nome, cargo, score, data entrada, status, motivo saida

**Ao gerar output:**
- Relatorios de auditoria: `outputs/YYYY-MM-DD_auditoria-score.md`
- Patches do Guardiao: `outputs/YYYY-MM-DD_patch-guardiao-vX.md`
- Relatorios de bgcheck expandido: `outputs/YYYY-MM-DD_bgcheck-[nome].md`

**Skills disponiveis:**
- `.claude/skills/score-audit/SKILL.md` -- processa dados de hire/fire e gera relatorio de calibracao
- `.claude/skills/background-check/SKILL.md` -- bgcheck expandido com scoring ponderado 0-100
- `.claude/skills/pipeline-review/SKILL.md` -- revisao semanal do pipeline de candidatos ativos, identifica parados, riscos de perda e follow-ups necessarios

**Agente-alvo:**
- CLAUDE.md do Guardiao: `../vitti-interviewer/CLAUDE.md`
- Skill candidate-evaluation: `../vitti-interviewer/.claude/skills/candidate-evaluation/SKILL.md`
- Skill background-check original: `../vitti-interviewer/.claude/skills/background-check/SKILL.md`

Patches gerados aqui devem ser aplicados manualmente nos arquivos do Guardiao apos validacao.

---

## Contexto do Guardiao (baseline)

Dados empiricos que fundamentam a calibracao atual:

| Score | n contratados | Hire rate | Principal erro |
|---|---|---|---|
| 5 | 4 | 75% | Nao prediz entrega tecnica |
| 4 | 35 | 83% | Vies de fluencia verbal em Sales/Revenue |
| 3 | 130 | 50% | Score sem caveat (52% dos erros em volume) |
| 2 | 67 | 4% | Veto ignorado = 100% de acerto do veto |
| 1 | 17 | 0% | Nenhum |

Taxas de erro involuntario por area: Sales 31%, Revenue 20%, Operations 17%, Product 25% (n=4 pequeno), Finance & Legal 0%.

Janela critica: 74% dos erros se manifestam nos primeiros 6 meses. Pico em 3-6 meses (8 de 19 demitidos).


---

## Arquitetura de Subagents

### Background Check: 5 subagents paralelos

A skill `background-check` lanca 5 subagents simultaneamente, um por categoria de pesquisa. Cada um retorna um score parcial (0-100) com evidencias. O agente principal agrega e gera o output final.

| Subagent | Fontes | Peso |
|---|---|---|
| `professional` | LinkedIn, Google | 30% |
| `judicial` | JusBrasil, Escavador, CNJ | 30% |
| `corporate` | Receita Federal, CNPJ.biz | 20% |
| `reputation` | Glassdoor, Reclame Aqui, Serasa PF | 10% |
| `social` | Instagram, X, Facebook publico | 10% |

**Quando usar subagents:** bgcheck completo de candidato com score 3+ do Guardiao.
**Quando NAO usar:** candidato junior de baixo risco, CPF indisponivel, verificacao pontual de um dado especifico.

**Fluxo de agregacao:**
1. Verificar se algum subagent retornou ELIMINATORIO (judicial score = 0)
2. Calcular score ponderado: (professional * 0.30) + (judicial * 0.30) + (corporate * 0.20) + (reputation * 0.10) + (social * 0.10)
3. Aplicar recomendacao por faixa: >=85 avanca, 70-84 monitoramento, 60-69 verificacao adicional, <60 nao avanca

### Score Audit: sequencial (sem subagents)

A skill `score-audit` processa dados em sequencia: catalogacao, calculo por score, analise por role, padroes de falha, geracao de patch. Nao ha paralelismo porque cada passo depende do anterior.

---

## Scheduled Tasks

| Task | Cadencia | Funcao |
|---|---|---|
| `guardiao-score-audit-trimestral` | 1 jan, abr, jul, out -- 9h | Verifica dados em inputs/, roda auditoria se >=10 casos, gera patch |
| `guardiao-candidatos-6meses` | Dia 1 de cada mes -- 9h | Identifica candidatos na janela de 6 meses, solicita atualizacao de status |

**Regra das tasks:** nenhuma task modifica arquivos do Guardiao automaticamente. Toda mudanca passa por validacao de Fernando antes de ser aplicada.


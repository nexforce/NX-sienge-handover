---
name: score-audit
description: Processa dados de contratacoes e demissoes para calcular a acuracia preditiva do score 1-5 do Guardiao, identificar padroes de erro e gerar patches de calibracao. Use quando o usuario disser "roda a auditoria de score", "analisa os dados de contratacao", "recalibra o Guardiao", "quais scores estao errando mais" ou variações.
---

# Skill: Auditoria de Score e Calibracao

## Quando usar
- Novos dados de contratacao ou demissao foram carregados em `inputs/`
- Usuario quer saber se a rubrica atual ainda e valida
- Usuario quer gerar um patch de calibracao para o Guardiao

---

## Formato de dados esperado

Aceita qualquer um dos formatos abaixo:

**Planilha (.xlsx ou .csv) com colunas:**
- Nome do candidato
- Cargo
- Score dado pelo Guardiao (1-5)
- Data de entrada
- Status atual (ativo / demitido / saiu voluntariamente)
- Motivo de saida (se aplicavel: tecnico / conduta / voluntario / layoff / outro)
- Data de saida (se aplicavel)

**Texto estruturado:** mesmo campos em formato livre, um candidato por bloco.

Se o formato estiver incompleto, usar `AskUserQuestion` para obter os campos faltantes antes de processar.

---

## Processo de analise -- sequencia obrigatoria

### Passo 1 -- Catalogacao

Para cada candidato nos dados:
- Registrar: nome, cargo, score, data entrada, status, motivo saida, tempo na empresa (em meses)
- Classificar saida como: **erro de predicao** (demitido involuntariamente <12 meses) / **acerto** (ativo ou saiu apos 12+ meses voluntariamente) / **inconclusivo** (voluntario <12 meses sem dado de motivo)

### Passo 2 -- Calculo de acuracia por score

Para cada score (1 a 5), calcular:
- n total de casos no dataset
- n de erros de predicao (demitidos involuntariamente)
- n de acertos
- n de inconclusivos
- Taxa de erro = erros / (erros + acertos)
- Comparar com baseline: Score 5 (25% erro), Score 4 (17%), Score 3 (50%), Score 2 (4%), Score 1 (0%)

### Passo 3 -- Analise por role e janela temporal

- Calcular taxa de erro por area (Sales, Revenue, Operations, Product, Finance, CS, Tech)
- Calcular distribuicao temporal dos erros: quantos em 0-3 meses, 3-6 meses, 6-12 meses
- Identificar se ha role com taxa de erro acima de 30% (limiar de alerta)

### Passo 4 -- Analise de padroes de falha

Para cada erro de predicao, examinar o registro do candidato e identificar:
- O sinal que o Guardiao deveria ter capturado mas nao capturou
- Se ha padrao comum entre os erros (ex: todos eram prolixos, todos tinham passagem < 8m, todos eram de segmento muito diferente)
- Se o erro e sistemico (mesmo padrao em 3+ casos) ou isolado

### Passo 5 -- Geracao de patch

Com base nos passos anteriores, gerar:
1. Thresholds atualizados (se hire rate de algum score mudou significativamente)
2. Novos sinais de alerta especificos para roles com taxa de erro alta
3. Novos candidatos-ancora (se houver casos no dataset que ilustram um padrao novo)
4. Mudancas recomendadas para `candidate-evaluation/SKILL.md` (sinais adicionais por role)

---

## Formato de output obrigatorio

```markdown
# Auditoria de Score -- Guardiao
Periodo: [data inicio] a [data fim dos dados]
Dataset: [N] candidatos, [N] contratados, [N] demitidos involuntariamente, [N] inconclusivos

---

## Acuracia por score (dados novos vs. baseline)

| Score | n | Erros | Taxa erro atual | Taxa erro baseline | Variacao |
|---|---|---|---|---|---|
| 5 | | | | 25% | |
| 4 | | | | 17% | |
| 3 | | | | 50% | |
| 2 | | | | 4% | |
| 1 | | | | 0% | |

---

## Acuracia por area

| Area | n | Erros | Taxa erro atual | Baseline | Status |
|---|---|---|---|---|---|
| Sales | | | | 31% | |
| Revenue | | | | 20% | |
| Operations | | | | 17% | |

---

## Distribuicao temporal dos erros

[Quantos erros em 0-3 meses / 3-6 meses / 6-12 meses]

---

## Padroes de falha identificados

### Padrão [N]: [Nome do padrao]
- Casos: [N candidatos com esse padrao]
- Sinal comum: [o que tinham em comum]
- Sinal que o Guardiao nao capturou: [o que deveria ter flagado]
- Recomendacao: [ajuste especifico]

---

## Candidatos-ancora novos sugeridos

[Se houver caso que ilustra um padrao novo de forma clara]
- Score [N] -- [Nome] ([Role]): "[citacao direta do que caracteriza o caso]"

---

## Patch recomendado

### 1. Mudancas na rubrica de score (CLAUDE.md)
[Exatamente o que mudar, em qual secao, com o texto novo]

### 2. Mudancas em candidate-evaluation/SKILL.md
[Exatamente o que mudar, com texto novo]

### 3. Novos sinais de alerta por role
[Role] -- adicionar: "[sinal especifico]"

---

## Status de calibracao

[CALIBRACAO VALIDA -- rubrica atual ainda sustentada pelos dados]
[CALIBRACAO PARCIAL -- ajustes menores recomendados, ver patch]
[CALIBRACAO NECESSARIA -- taxa de erro variou >10pp em um score, patch urgente]

Justificativa: [2-3 linhas diretas sobre o que o dataset novo revelou]
```

---

## Regras

- Nao gerar patch se n < 10 por score. Com n pequeno: declarar "amostra insuficiente, coletar mais dados antes de recalibrar."
- Todo padrao de falha precisa de 3+ casos para ser declarado sistemico. Com 1-2 casos: declarar como observacao, nao como padrao.
- Patches sao recomendacoes, nao aplicados automaticamente. O usuario valida e aplica manualmente no Guardiao.
- Erros por layoff ou encerramento de empresa nao contam como erro de predicao.

---

## Formato de arquivo

Salvar em `outputs/YYYY-MM-DD_auditoria-score.md`.
Compartilhar via link `computer://`.

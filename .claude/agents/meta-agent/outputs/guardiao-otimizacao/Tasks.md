# Guardiao Otimizacao -- Tasks

## Em andamento

<!-- mover tasks aqui quando iniciar -->

## Backlog priorizado

### Stream 1: Score Accuracy

- [ ] **[P1]** Carregar dados de contratacoes pos-Abr 2026 em `inputs/contratacoes/`
  - Formato: planilha com nome, cargo, score, data entrada, status, motivo saida
  - Minimo: 10 casos para ter significancia estatistica por score

- [ ] **[P1]** Carregar dados de demissoes pos-Abr 2026 em `inputs/demissoes/`
  - Incluir: motivo (tecnico / conduta / voluntario / layoff), data saida, tempo na empresa

- [ ] **[P1]** Rodar skill `score-audit` com os dados carregados
  - Output: `outputs/YYYY-MM-DD_auditoria-score.md`

- [ ] **[P2]** Validar patch gerado pela auditoria
  - Revisar thresholds, novos sinais de alerta, candidatos-ancora sugeridos

- [ ] **[P2]** Aplicar patch validado no Guardiao
  - Atualizar: `../vitti-interviewer/CLAUDE.md` (secao de rubrica e blind spots)
  - Atualizar: `../vitti-interviewer/.claude/skills/candidate-evaluation/SKILL.md`
  - Versionar: CLAUDE.md do Guardiao passa de v2.0 para v2.1

### Stream 2: Background Check

- [ ] **[P1]** Testar background-check v2 em 3 candidatos recentes (com dados ja conhecidos)
  - Verificar se o scoring ponderado gera resultado consistente com o que foi observado
  - Verificar cobertura real das fontes novas (Escavador, CNJ, Serasa PF)

- [ ] **[P2]** Ajustar pesos se necessario com base nos testes
  - Criterio de ajuste: se uma categoria tem cobertura <50% dos candidatos, reduzir peso e redistribuir

- [ ] **[P2]** Aplicar bgcheck v2 no Guardiao
  - Substituir: `../vitti-interviewer/.claude/skills/background-check/SKILL.md`

### Stream 3: Ciclo de manutencao (P3)

- [ ] Definir cadencia de atualizacao: trimestral ou a cada 3+ casos que formem padrao
- [ ] Criar template de coleta de dados para People usar apos cada desligamento
- [ ] Documentar protocolo de versionamento do Guardiao (v2.x para patches, v3.0 para mudancas estruturais)

## Concluidas

- [x] Projeto criado com OPMAX (Mai 2026)
- [x] Skill score-audit criada
- [x] Skill background-check v2 criada (scoring 0-100, 7 fontes, recomendacao binaria)

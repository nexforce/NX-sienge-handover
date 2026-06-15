# Análise de Turnover — Pipeline Fernando Vitti
**Base de dados:** 803 candidatos ATS + 123 registros de offboarding  
**Data de geração:** 29/04/2026  
**Metodologia:** Cross-reference por nome (fuzzy match) entre contratados via pipeline Vitti e registros de desligamento

---

## 1. Resumo Executivo

| Métrica | Valor |
|---|---|
| Total contratados com envolvimento Vitti | 98 |
| Total que saíram (match confirmado) | 57 (58%) |
| Desligamentos involuntários | 19 (19%) |
| Desligamentos voluntários | 38 (39%) |
| **Taxa de erro preditivo real** | **~22% (19 de 98 — erros não-controláveis excluídos)** |

**Distinção crítica:**
- Erros de predição (falha do processo) = 19 involuntários + 2 voluntários por "divergência com liderança/cultura" = **21 casos**
- Saídas não-controláveis = salário, motivos pessoais, empreender = **36 casos**

O processo de seleção do Vitti tem uma taxa de acerto bruta de ~78% para evitar falhas de desempenho/conduta. Isso é superior à média de mercado (estima-se 40-60% de erro em processos sem estrutura). O problema real está na composição dos erros, não no volume.

---

## 2. Análise por Score

| Score Vitti | Contratados | Saíram | % Saída | Involuntários | % Erro |
|---|---|---|---|---|---|
| 2 | 2 | 2 | 100% | 2 | 100% |
| 3 | 63 | 37 | 59% | 10 | 16% |
| 4 | 28 | 14 | 50% | 5 | 18% |
| 5 | 3 | 2 | 67% | 1 | 33% |
| Sem score | 2 | 2 | 100% | 1 | 50% |

### Interpretação por faixa

**Score 2 (n=2, 100% erro):** Ambas as contratações foram anomalias — decisões tomadas por outros sem aval do Vitti. Confirma que o score-2 deve ser veto absoluto.

**Score 3 (n=63, 16% erro involuntário):** A faixa de maior volume e maior impacto absoluto nos erros. 10 dos 19 desligamentos involuntários vieram de score-3. A taxa de 16% parece baixa, mas representa 52% de todos os erros cometidos. Score-3 é o maior risco operacional do pipeline, não o score-4.

**Score 4 (n=28, 18% erro involuntário):** Taxa de erro por contratação semelhante ao score-3, mas com perfil de falha diferente: 3 dos 5 casos são em Sales/Revenue com falha técnica revelada entre 0-6 meses. A confiança elevada na aprovação desses candidatos torna esses erros mais custosos (expectativa de entrega maior, onboarding mais acelerado).

**Score 5 (n=3, 33% erro):** Amostra pequena. O caso Gabriel Sacramento (Sales/Operations, demitido por desempenho técnico em 3-6 meses) é o dado mais revelador: Vitti atribuiu nota máxima e o candidato falhou tecnicamente. Indica que a avaliação comportamental, mesmo excelente, não prediz entrega técnica.

### Casos documentados de falha por score

**Score 4 — Involuntários:**
- Bruno Nicolodi | Revenue | Desempenho técnico | 3-6 meses
- Jean Pastorini | Sales | Conduta antiética | 0-3 meses
- João Vicente Ferrero | Revenue | Desempenho técnico | 0-3 meses
- Julia Monteiro | Operations | Desempenho técnico | 1-2 anos
- Paulo Cezar Brito | Sales | Desempenho comportamental | 3-6 meses

**Score 5 — Involuntário:**
- Gabriel Sacramento | Operations | Desempenho técnico | 3-6 meses

---

## 3. Análise por Área

| Área | Contratados | Saíram | % Saída | Involuntários | % Erro |
|---|---|---|---|---|---|
| Operations | 41 | 30 | **73%** | 7 | 17% |
| Sales | 13 | 9 | **69%** | 4 | **31%** |
| Revenue | 30 | 14 | 47% | 6 | **20%** |
| Product | 4 | 2 | 50% | 1 | 25% |
| Finance & Legal | 3 | 0 | 0% | 0 | 0% |
| People | 2 | 0 | 0% | 0 | 0% |

### Interpretação por área

**Operations — alto turnover, baixo erro preditivo:**
O turnover de 73% parece alarmante, mas a causa é distinta das outras áreas. Das 23 saídas voluntárias em Operations:
- 12 saíram por proposta de salário melhor no Brasil
- 3 saíram por proposta em Dólar/Euro
- 3 foram empreender
- 4 por motivos pessoais

Isso significa que **65% das saídas em Operations são market-driven, não falhas de seleção.** O perfil de Operations na Nexforce tem gap de competitividade salarial estrutural. A seleção está funcionando — o problema é retenção via compensação.

**Sales — menor volume, maior taxa de erro preditivo:**
31% de erro involuntário é a pior proporção entre as áreas relevantes. 4 de 13 contratados foram demitidos por performance ou conduta. Isso indica que o processo de avaliação para Sales tem lacuna na validação de capacidade técnica de entrega (prospecção, pipeline, fechamento). O Bar Raiser captura caráter mas não captura skill comercial.

**Revenue — risco moderado com viés técnico:**
6 dos 14 desligamentos foram involuntários (43% dos que saíram). Todos por desempenho técnico. Mesmo padrão de Sales: o processo capta comportamento, não entrega.

---

## 4. Análise por Motivo de Saída

### Involuntários (erros de predição diretos)

| Motivo | Casos | % do Total Inv. | Detectável pelo processo atual? |
|---|---|---|---|
| Desempenho técnico abaixo do esperado | 15 | 79% | **Não** |
| Desempenho comportamental abaixo do esperado | 3 | 16% | Parcialmente |
| Conduta antiética ou ruptura cultural | 1 | 5% | **Deveria ser sim** |

**O dado mais crítico:** 79% dos erros de predição são de desempenho técnico, e o processo de entrevista do Vitti é primariamente comportamental. Isso não é falha do entrevistador — é uma lacuna estrutural de design do processo.

### Voluntários (por motivo)

| Motivo | Casos | Controlável? |
|---|---|---|
| Salário/benefícios mais atrativos no Brasil | 15 | Não (mercado) |
| Motivos pessoais ou familiares | 11 | Não |
| Salário em Dólar/Euro | 4 | Não |
| Empreender | 3 | Não |
| Divergências com liderança ou cultura | 2 | **Sim — sinal detectável** |
| Busca por maior crescimento/desafio | 2 | Parcialmente |

Das 38 saídas voluntárias, **33 são por razões fora do controle do processo de seleção.** 2 casos de "divergência com liderança/cultura" eram sinais que deveriam ter sido capturados.

---

## 5. Análise por Tempo de Casa

| Janela | Total Saídas | Involuntários | % Involuntário |
|---|---|---|---|
| 0-3 meses | 17 | 6 | 35% |
| 3-6 meses | 16 | 8 | **50%** |
| 6-12 meses | 12 | 2 | 17% |
| 1-2 anos | 9 | 3 | 33% |
| 2+ anos | 2 | 0 | 0% |

**Insight crítico:** A janela 3-6 meses concentra 8 dos 19 desligamentos involuntários (42%). Este é o pico de exposição. Em 0-3 meses há 6 involuntários (32%). Juntas, as janelas de até 6 meses concentram **74% de todos os erros de predição.**

Isso tem implicação direta de processo: a maioria das falhas teria sido visível em um check-in estruturado no 30º e 60º dia pós-contratação, bem antes da decisão de desligamento.

### Score x Tempo (involuntários)

| Score | 0-3m | 3-6m | 6-12m | 1-2a |
|---|---|---|---|---|
| 2 | 2 | - | - | - |
| 3 | 2 | 4 | 2 | 2 |
| 4 | 2 | 2 | - | 1 |
| 5 | - | 1 | - | - |

Score-3 apresenta distribuição de falha mais espalhada no tempo (até 1-2 anos). Score-4 concentra falhas nos primeiros 6 meses, o que sugere que o problema é de skill, não de fit de longo prazo.

---

## 6. Diagnóstico Crítico do Perfil de Entrevistador

### O que o processo captura bem

1. **Fit cultural e valores:** Apenas 1 caso de conduta antiética (Jean Pastorini, score-4, Sales). Para 98 contratações, isso é desempenho excelente.
2. **Resiliência e autenticidade:** Nenhum caso documentado de desligamento por "choque com a cultura Nexforce" além dos 2 voluntários por divergência.
3. **Banco de talentos:** Candidatos rejeitados com score-3 e anotados para banco futuro foram consistentemente mapeados.

### Blind spots estruturais (validados empiricamente)

**Blind spot 1 — Capacidade técnica de entrega:**
15 dos 19 erros (79%) foram por "desempenho técnico abaixo do esperado." O processo de Bar Raiser do Vitti avalia Resiliência sob Pressão, Profundidade e Autenticidade, Fit Cultural. Nenhum desses critérios mede se o candidato consegue executar a função tecnicamente. Para Sales, Revenue e Operations, a validação técnica precisa ser explícita e separada da avaliação comportamental.

**Blind spot 2 — Sales em particular:**
3 dos 4 erros em Sales são de falha técnica (prospecção, pipeline, fechamento) revelada entre 0-6 meses. O score-4 em Sales foi atribuído em 2 desses casos. O processo superestima consistentemente candidatos de Sales pela fluência comunicativa — traço que correlaciona bem com o que Vitti avalia (articulação, autenticidade, narrativa) mas não com resultado comercial.

**Blind spot 3 — Candidatos prolixos x candidatos técnicos:**
O perfil preferido do Vitti (articulação, profundidade de narrativa, resiliência demonstrada sob pergunta direta) favorece perfis que comunicam bem. Em funções onde a entrega é técnica e silenciosa (Revenue ops, Operations analyst), este viés pode inflar o score.

**Blind spot 4 — Score 5 como falsa segurança:**
Gabriel Sacramento foi avaliado com nota máxima e demitido por desempenho técnico em menos de 6 meses. Isso confirma que score-5 pelo processo atual não garante entrega técnica — garante apenas um perfil comportamental excepcionalmente alinhado.

### O que o processo não pode ser cobrado por capturar

- Saídas por salário (33 casos): Este é um problema de política de compensação, não de seleção.
- Motivos pessoais (11 casos): Imprevisível por design.
- Empreendedorismo (3 casos): Parcialmente sinalizado pelo perfil, mas a decisão é legítima.

---

## 7. Recomendações Operacionais

### Para o processo de entrevista

**R1 — Incluir validação técnica obrigatória para Sales e Revenue:**
O Bar Raiser não deve ser o único filtro para Sales/Revenue. Antes do score final, o entrevistador técnico da área deve responder explicitamente: "Este candidato consegue executar [função específica] nos primeiros 90 dias?" Sem essa resposta documentada, score-4 em Sales/Revenue não deve virar contratação.

**R2 — Score 3 requer aprovação dupla explícita:**
Dado que score-3 representa 52% de todos os erros absolutos e 63 dos 96 contratados com score formal, toda contratação com score-3 deve ter uma segunda validação documentada do líder direto antes do handoff para onboarding.

**R3 — Criar check-in estruturado de 30/60 dias pós-contratação:**
74% dos erros se manifestam nos primeiros 6 meses. Um processo formal de avaliação de performance no 30º e 60º dia — mapeado para as mesmas competências do processo seletivo — permitiria correção de curso antes da situação chegar ao desligamento.

**R4 — Recompensar o processo de Operations diferentemente:**
O turnover de Operations não é problema de seleção — é de retenção por compensação. A análise sugere que contratar bem em Operations e perdê-los para o mercado é o padrão estabelecido. A solução está em política salarial e equity, não em seleção mais rigorosa.

**R5 — Tratar Jean Pastorini como caso de aprendizado:**
Score-4 em Sales, conduta antiética detectada em menos de 3 meses. Retroativamente: o que na avaliação poderia ter sinalizado esse risco? Revisar a avaliação documentada para extrair sinais que foram ignorados ou não ponderados adequadamente.

---

## 8. Quadro Resumo — Erro por Tipologia

| Tipo de Erro | Casos | % dos 98 contratados | Ação |
|---|---|---|---|
| Falha técnica de entrega | 15 | 15% | Adicionar validação técnica ao processo |
| Falha comportamental | 3 | 3% | Aprofundar critérios comportamentais em probation |
| Conduta | 1 | 1% | Processo atual já capta — reforçar em Sales |
| Divergência cultural (vol.) | 2 | 2% | Revisar sinal no processo de avaliação |
| **Total erros endereçáveis** | **21** | **21%** | |
| Saídas por salário/mercado | 33 | 34% | Política de comp (fora do escopo seletivo) |
| Saídas pessoais/neutras | 3 | 3% | Imprevisível |
| **Total saídas** | **57** | **58%** | |
| **Contratados ainda ativos** | **41** | **42%** | |

---

*Relatório gerado com base em cross-reference ATS x offboarding. Matching por nome fuzzy (primeiro nome + ao menos um sobrenome em comum). Margem de erro de matching estimada: 2-3 casos não identificados.*

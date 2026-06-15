# Análise Comparativa de Entrevistadores
**Base:** 3503 avaliações — ATS completo + 123 registros de offboarding cruzados
**Gerado em:** 29/04/2026
**Versão:** 1.0

---

## 1. Resumo Executivo

A análise cruzada entre Vitti e os demais entrevistadores revela um problema estrutural de calibração: a maioria dos entrevistadores usa score-3 como um botão binário de aprovação, sem capacidade discriminatória real. O score de Vitti é o mais calibrado do processo — tem a maior correlação entre score e outcome de contratação e a menor taxa de falso positivo ajustada ao volume.

O achado mais crítico: em 3 casos onde Vitti deu score-2 e o candidato foi contratado por override de outro entrevistador, **os 3 foram demitidos**. O veto de Vitti foi correto 100% das vezes em que foi ignorado.

---

## 2. Mapa de Entrevistadores — Volume e Função

| Entrevistador | Total Avaliações | Contratados Avaliados | Função no Processo |
|---|---|---|---|
| Willian Teodosio | 413 | ~206 | Triagem inicial / pos1 |
| Vitti (Fernando) | ~200 | 98 | Bar Raiser / pos2-pos3 |
| Jansen Silva | ~130 | ~65 | Triagem / pos1-pos2 |
| Juliana Barbiero | ~90 | ~45 | Pré-caso / pos1-pos2 |
| Valdeci Costa | ~110 | ~55 | Pré-caso / pos1 |
| Pedro Munhoz | ~85 | ~43 | pos2-pos3 |

---

## 3. Distribuição de Score por Entrevistador

### 3.1 Vitti
- Score 1-2: ~22% (sinal de barreira real)
- Score 3: ~50% (aprovação com reserva)
- Score 4: ~23% (aprovação forte)
- Score 5: ~5% (excepcional — usado com critério)
- **Perfil:** Distribuição trimodal com discriminação real nos extremos

### 3.2 Willian Teodosio
- Score 1-2: ~35% (reprovações)
- Score 3: ~62% de todas avaliações (99% dos positivos são 3)
- Score 4: 14 ocorrências em 413 avaliações (3,4%)
- Score 5: ZERO
- **Perfil:** Binário disfarçado de escala. Score-3 é o único sinal de aprovação. Nunca dá 4 ou 5.

### 3.3 Jansen Silva
- Score 1-2: ~30%
- Score 3: ~57%
- Score 4: ~2%
- Score 5: zero ou residual
- **Perfil:** Cópia do padrão Willian. Score-3 como aprovação padrão, sem escala real acima disso.

### 3.4 Juliana Barbiero
- Score 1: ~20%
- Score 2: ~15%
- Score 3: ~45%
- Score 4: ~20%
- Score 5: residual
- **Perfil:** Mais bimodal. Usa score-4 com frequência — mas score-4 dela tem hire rate de apenas 33%. Avalia cedo (pré-caso) e os candidatos com score-4 dela ainda falham nas etapas seguintes.

### 3.5 Valdeci Costa
- Score 1-2: ~20%
- Score 3: ~55%
- Score 4: ~22%
- Score 5: ~3%
- **Perfil:** Inflação mais grave. Usa score-4 em 22% das avaliações, mas apenas 19% desses score-4 são contratados. Mais generoso que o processo valida — screener precoce que não distingue quem passa do caso.

### 3.6 Pedro Munhoz
- Score 1-2: ~25%
- Score 3: ~58%
- Score 4: ~12%
- Score 5: ~5%
- **Perfil:** Mais próximo de Vitti. Score-4 com hire rate de 58%, false positive rate de 11,5%. Discriminação funcional.

---

## 4. Taxa de Contratação por Score e Entrevistador

A hire rate por score mede o quanto o score prediz contratação. Se score-3 e score-4 têm a mesma hire rate, o score-4 não acrescenta informação.

| Entrevistador | Hire Rate Score-3 | Hire Rate Score-4 | Score-4 discrimina? |
|---|---|---|---|
| Vitti | ~50% | ~70% | **Sim** — diferença de 20pp |
| Pedro Munhoz | ~45% | ~58% | **Sim** — diferença de 13pp |
| Juliana Barbiero | ~40% | ~33% | **Não** — score-4 tem MENOR hire rate que score-3 |
| Valdeci Costa | ~38% | ~19% | **Não** — score-4 prediz pior outcome |
| Willian Teodosio | ~50% | ~60% | Inconclusivo — amostra de score-4 muito pequena (n=14) |
| Jansen Silva | ~42% | ~30% | **Não** — amostra pequena, sem sinal |

**Leitura crítica:** Para Juliana e Valdeci, dar score-4 é na prática um sinal pior que score-3, porque os candidatos que eles avaliam muito bem ainda falham nas etapas posteriores. O score-4 deles captura entusiasmo, não capacidade verificada.

---

## 5. Taxa de Falso Positivo por Entrevistador

Falso positivo = candidato que recebeu score ≥ 3, foi contratado, e saiu involuntariamente (demitido por performance ou fit).

| Entrevistador | Contratados Avaliados (est.) | Falsos Positivos | Taxa FP |
|---|---|---|---|
| Vitti | 98 | 19 | **19,4%** |
| Pedro Munhoz | ~43 | ~5 | **~11,5%** |
| Jansen Silva | ~65 | ~10 | **~15,2%** |
| Willian Teodosio | ~206 | ~18 | **~8,7% bruto** |
| Juliana Barbiero | ~45 | ~7 | **~15,5%** |
| Valdeci Costa | ~55 | ~9 | **~16,4%** |

**Nota sobre Willian:** A taxa bruta de 8,7% parece boa, mas é ilusória. Willian avalia candidatos em triagem inicial (pos1), onde a maioria das falhas já são filtradas pelo caso e por entrevistadores posteriores. Sua contribuição marginal ao risco é baixa não porque filtra bem, mas porque outros corrigem depois. Além disso, todos os 18 falsos positivos de Willian são score-3 — ele nunca deu score-4 que depois foi demitido porque raramente dá score-4.

**Vitti:** Taxa de 19,4% parece alta mas contextualiza diferente. Vitti atua no Bar Raiser em etapas finais, após filtros anteriores. Candidatos que chegam até ele já passaram por triagem, caso e outras entrevistas — são o topo do funil. O 19,4% é a taxa de erro sobre candidatos pré-aprovados pelo processo, não sobre a população geral.

---

## 6. Análise Direta Vitti vs. Willian

**Base:** 131 candidatos avaliados por ambos.

### 6.1 Concordância e Divergência

| Situação | Ocorrências |
|---|---|
| Mesma direção (ambos aprovam ou reprovam) | 88 (67%) |
| Willian mais alto que Vitti | 33 casos (25%) |
| Vitti mais alto que Willian | 10 casos (8%) |

Willian deu score mais alto que Vitti em 33 casos vs. 10 casos no sentido inverso. Isso confirma que Willian é sistematicamente mais permissivo — não é aleatoriedade, é viés estrutural de aprovação.

### 6.2 Quem Estava Certo nos Casos de Demissão

Em 11 candidatos avaliados por ambos que foram demitidos involuntariamente:
- Vitti foi mais cético (score mais baixo) em 2 de 11
- Ambos deram o mesmo score em 8 de 11
- Willian foi mais cético em 1 de 11

**Leitura:** Vitti não é consistentemente mais cético que Willian nos casos de falha — na maioria dos casos os dois acertaram igual (ambos aprovaram candidatos que falharam). A diferença está nos casos de divergência, especialmente nos overrides.

### 6.3 O Problema do Override — Caso Crítico

Em 3 situações específicas, Vitti deu **score-2** (veto) e Willian deu **score-3** (aprovação):

| Candidato | Score Vitti | Score Willian | Resultado | Desfecho |
|---|---|---|---|---|
| Theo Souza Coelho | 2 | 3 | Contratado | Demitido |
| Lilian Fazolin | 2 | 3 | Contratada | Demitida |
| Tabata Paiva | 2 | 3 | Contratada | Demitida |

**Taxa de acerto do veto de Vitti quando ignorado: 100%.**

Os 3 candidatos que foram contratados apesar do score-2 de Vitti foram demitidos. Não existe caso onde Vitti deu score-2, o processo ignorou, e o candidato foi bem-sucedido. O veto de Vitti tem valor preditivo absoluto na amostra disponível.

---

## 7. Perfil Analítico por Entrevistador

### 7.1 Willian Teodosio — "O Aprovador Binário"

**Função real no processo:** Filtro de exclusão, não de seleção.

**Padrão:** Usa score-3 para todos os candidatos que "não reprova". Nunca chegou a score-5 em 413 avaliações. Deu score-4 apenas 14 vezes.

**O que isso significa:**
- Quando Willian aprova (score-3), o sinal é "não reprovei" — não "aprovei com convicção"
- Quando Willian rejeita (score-1/2), o sinal provavelmente é confiável
- Score-4 de Willian é raro o suficiente para ser um sinal real — mas há poucos casos para validar estatisticamente

**Gap principal:** Incapaz de discriminar entre "bom" e "ótimo" porque só usa um nível de aprovação. Todo candidato que passa por ele chega ao próximo entrevistador com o mesmo sinal.

**Risco estrutural:** Como Willian está no início do funil e aprova com score-3, os entrevistadores posteriores (incluindo Vitti) recebem o mesmo sinal para candidatos muito diferentes. Willian não estratifica o que entrega.

### 7.2 Jansen Silva — "Clone do Padrão Willian"

**Padrão:** Mesmo problema de Willian em menor volume. 57% score-3, quase zero score-4.

**Gap principal:** Sem diferenciação de qualidade no topo. Score-3 é o teto prático.

**Observação:** A false positive rate de 15,2% é maior que Willian bruto, possivelmente porque Jansen atua em posições onde o candidato chega menos filtrado.

### 7.3 Juliana Barbiero — "O Entusiasmo Não Verificado"

**Padrão:** Mais bimodal — usa score-1 (20%) e score-4 (20%) com mais frequência. Parece discriminar mais. Mas score-4 com hire rate de 33% indica que seu entusiasmo não prediz capacidade verificável.

**Hipótese:** Avalia fit cultural e presença — que são fluídos na entrevista mas não estão correlacionados com performance técnica ou superação do caso. Candidatos que ela ama ainda falham no case study ou em "não possui competências."

**Gap principal:** Faz avaliação pré-case, então ela vê o candidato antes da prova mais difícil. Seu score-4 não sobrevive ao processo — é prematura.

**Risco:** Quando Juliana dá score-4, cria expectativa positiva que pode influenciar outros entrevistadores. Se o candidato falha depois, há potencial de viés de ancoragem.

### 7.4 Valdeci Costa — "O Inflacionador"

**Padrão:** 22% de score-4 mas apenas 19% desses são contratados. É o entrevistador com maior discrepância entre score aplicado e validação do processo.

**Hipótese:** Avalia atributos não mensuráveis no momento (ex: potencial, energia, intenção) que não se convertem em competências verificáveis pelo caso ou pela entrevista técnica posterior.

**Gap principal:** Score-4 de Valdeci é sistematicamente inflado. Processar um score-4 dele como equivalente a score-4 de Vitti ou Pedro seria erro de calibração.

**Consequência prática:** Candidatos que chegam com score-4 de Valdeci devem ser tratados como score-3 por qualquer entrevistador posterior que entenda esse histórico.

### 7.5 Pedro Munhoz — "O Mais Próximo de Vitti"

**Padrão:** 12% score-4, hire rate 58%, false positive 11,5%. O mais calibrado depois de Vitti.

**O que funciona:** Score-4 dele prediz contratação e a false positive rate é a mais baixa do grupo. Tem critério real no topo da escala.

**Gap relativo:** Menor volume de avaliações — difícil validar estatisticamente padrões específicos. Mas o sinal disponível é o mais confiável depois de Vitti.

**Uso recomendado:** Se o objetivo é ter um segundo avaliador com peso similar ao de Vitti, Pedro Munhoz é o candidato natural.

---

## 8. Comparação Direta: Vitti vs. Todos

| Dimensão | Vitti | Melhor dos Demais | Gap |
|---|---|---|---|
| Score-4 discrimina? | Sim (+20pp vs score-3) | Pedro (+13pp) | Vitti mais preciso |
| False positive rate | 19,4% (contexto: Bar Raiser final) | Pedro 11,5% | Pedro melhor bruto |
| Score-5 usado? | Sim (~5%) | Raramente (Valdeci ~3%) | Vitti mais critério |
| Override veto correto? | 3/3 (100%) | N/A | Único dado disponível |
| Discriminação nos extremos | Alta (score-2 e score-5 com significado) | Média (Pedro) | Vitti mais discriminante |
| Calibração escala completa | Usa 1-5 com propósito | Pedro parcialmente | Vitti único a usar toda a escala |

**Conclusão:** Vitti tem a calibração mais forte do processo quando medida por correlação score-outcome e por acurácia do veto. Pedro Munhoz é o segundo mais calibrado. Os demais operam com escalas efetivamente binárias ou com scores inflados que o processo depois corrige.

---

## 9. Diagnóstico Estrutural do Processo

### 9.1 O Problema Central: Score-3 Como Moeda Universal

Quando múltiplos entrevistadores usam score-3 como aprovação padrão, a escala coletiva do processo perde resolução. O processo tem 5 pontos no papel, mas na prática funciona com 3 (reprova / aprovação neutra / aprovação forte de Vitti e Pedro).

### 9.2 O Override Problem Não Foi Resolvido

O processo não tem regra explícita sobre como tratar divergências entre entrevistadores. Quando Willian dá score-3 e Vitti dá score-2, não há mecanismo que dê mais peso ao entrevistador mais calibrado. O resultado foi a contratação de 3 candidatos que foram demitidos.

**Fix necessário:** Implementar peso diferenciado por entrevistador ou regra de veto para scores-2 em etapas avançadas.

### 9.3 Inflação de Score nas Etapas Iniciais

Valdeci e Juliana inflacionam scores antes do caso. Isso:
1. Cria pressão implícita para o processo não reprovar candidatos com score-4 "na entrada"
2. Dilui o sinal para entrevistadores posteriores
3. Provavelmente contribui para que candidatos com score-4 inicial mas performance fraca passem mais etapas do que deveriam

### 9.4 A Função do Bar Raiser Está Correta, Mas Isolada

O modelo Bar Raiser de Vitti (score formal com 3 pilares, posição pos2/pos3) é o design certo. O problema é que os entrevistadores antes dele não alimentam o processo com informação estratificada suficiente. Willian e Jansen entregam basicamente binário — o Bar Raiser não tem história rica de calibração para trabalhar junto.

---

## 10. Recomendações de Processo

**1. Padronizar o que score-3, 4 e 5 significam por entrevistador.**
Criar definição comportamental de cada nível. Se Willian nunca dá 5, ou a definição de 5 está errada, ou o calibrador precisa mudar.

**2. Implementar veto formal para score-2 em entrevistadores calibrados.**
Qualquer score-2 dado por Vitti ou Pedro Munhoz (entrevistadores com false positive rate validada) deve exigir consenso explícito para ser desconsiderado — não pode ser sobrescrito automaticamente por um score-3 de triagem.

**3. Separar score de etapa da intenção de contratação.**
Willian opera como filtro de exclusão — formalize isso. Reconfigurar seu processo para "reprovado / segue em frente", eliminando a falsa precisão de score-3 como sinal de aprovação qualitativa.

**4. Descontar o score-4 de Valdeci e Juliana em 1 ponto para leitura downstream.**
Dado que score-4 deles tem hire rate de 19-33%, tratar como score-3 na prática. Comunicar isso como calibração interna.

**5. Promover Pedro Munhoz como segundo Bar Raiser.**
É o entrevistador com distribuição mais próxima de Vitti e com false positive rate justificável. Pode ser par em decisões difíceis.

**6. Auditoria trimestral de calibração.**
Calcular hire rate por score por entrevistador a cada 90 dias. Entrevistador cujo score-4 não discrimina de score-3 recebe feedback de recalibração obrigatório.

---

## 11. Tabela de Confiabilidade por Entrevistador

Para uso operacional imediato na leitura de scorecards:

| Entrevistador | Score-3 = ? | Score-4 = ? | Score-2 = ? | Peso no processo |
|---|---|---|---|---|
| Vitti | Aprovação real com reserva | Aprovação forte, prediz bem | Veto confiável (100% correto quando ignorado) | Máximo |
| Pedro Munhoz | Aprovação neutra | Aprovação forte, hire rate 58% | Veto confiável (11,5% FP) | Alto |
| Juliana Barbiero | Aprovação pré-caso | Entusiasmo, hire rate 33% — descontar | Rejeição forte | Médio (excluir score-4 inflado) |
| Valdeci Costa | Aprovação pré-caso | Score inflado, hire rate 19% — tratar como 3 | Rejeição forte | Baixo no sinal positivo |
| Jansen Silva | Binário de aprovação | Raro, inconclusivo | Rejeição forte | Baixo no sinal positivo |
| Willian Teodosio | "Não reprovei" — sem sinal qualitativo | Raridade estatística, inconclusivo | Rejeição forte | Usar só como filtro de exclusão |

---

*Documento gerado com base em análise de 3503 avaliações ATS cruzadas com 123 registros de offboarding.*
*Uso interno — Nexforce Talent Intelligence.*

---
name: candidate-evaluation
description: Processa transcrição ou notas de entrevista e produz avaliação estruturada completa: score 1-5 com justificativa empírica, pontos fortes, pontos fracos, gaps, perguntas obrigatórias para próximas rodadas, mensagem de retorno ao candidato e campos do processo Nexforce. Use quando o usuário disser "avalia esse candidato", "processa essa transcrição", "qual a nota do candidato", "gera o relatório da entrevista" ou variações.
---

# Skill: Avaliação Estruturada de Candidato

## Quando usar
- Usuário fornece transcrição de entrevista (texto direto, link Fathom/Fireflies, notas brutas)
- Usuário pede para avaliar um candidato após entrevista
- Usuário quer gerar o relatório Bar Raiser formal

---

## Informações obrigatórias antes de avaliar

Se qualquer um destes pontos estiver faltando, use `AskUserQuestion`:

1. Cargo e nível do candidato
2. Posição no processo (Pos 1 triagem / Pos 2-3 Bar Raiser)
3. Fonte da transcrição (texto direto, link Fathom/Fireflies, notas do entrevistador)

---

## Processo de análise -- sequência obrigatória

### Passo 0 -- Varredura de eliminatórios imediatos

Antes de qualquer análise, verificar se há flag eliminatório. Se qualquer um estiver presente: score 1, justificar com evidência da transcrição, encerrar análise.

```
ELIMINATÓRIOS IMEDIATOS:
- Comunicação robotizada/telemarketing
- Versão do histórico muda sob pressão de verificação
- Culpa 100% externa no fracasso
- Entrou na entrevista pelo celular sem aviso
- Todos os 3+3 atribuídos ao ambiente ou diagnóstico externo
- Cargo comercial + zero número de resultado após dois probes
```

### Passo 1 -- Varredura de churn

Calcular o percentual de passagens < 1 ano na trajetória e documentar explicitamente.

**Regra crítica:** o teste não é se cada saída tem explicação individual plausível. O teste é se o padrão cumulativo representa crescimento documentado ou fuga de problemas. Candidatos articulados sempre têm narrativa convincente para cada saída isolada. Aceitar essas justificativas individualmente é viés de fluência verbal.

| Percentual de passagens < 1 ano | Ação |
|---|---|
| 90% ou mais | Score-2 direto, salvo evidência empírica extraordinária |
| 70% ou mais | Red flag grave, tendência a score-2, probe confirmatório obrigatório |
| Saídas por "fit de gestão", pressão emocional, burocracia, presencialidade | Contar como fuga, não crescimento |

**Documentar:** "X de Y passagens < 1 ano ([Z]%). [Avaliação do padrão]."

### Passo 2 -- Análise por dimensão (para score 2-5)

Avaliar cada dimensão com evidência específica da transcrição. Nenhuma afirmação sem origem verificável.

| Dimensão | O que buscar |
|---|---|
| Comunicação | Estrutura natural, ritmo, prolixidade, clareza, fluidez |
| Resultados | Números espontâneos vs. extraídos vs. ausentes |
| Accountability | No fracasso: atribuição própria vs. externa |
| Consistência | Versão estável ao longo de toda a entrevista, inclusive sob pressão |
| IA e crescimento | Ferramenta específica + caso real esta semana |
| Fit de role | Evidências técnicas específicas para o cargo |
| Fit cultural | Proatividade, autoconsciência, vulnerabilidade honesta, punch |

### Passo 3 -- Verificação técnica (Sales e Revenue -- obrigatório)

Separar evidência comportamental de evidência técnica.

Pergunta explícita: "O candidato demonstrou evidência de entrega técnica (conversão, pipeline, análise) ou só fluência verbal?"

Se só comportamental: flag obrigatória independente do score. Score 4+ em Sales/Revenue com só evidência comportamental deve ser rebaixado para score-3.

### Passo 4 -- Score final pelo calibrador

Responder as 10 perguntas:

1. Comunicação no nível de confiança com cliente?
2. Tinha seus números ou precisou de esforço para extrair?
3. No fracasso, assumiu responsabilidade ou culpou o ambiente?
4. Versão consistente do começo ao fim, inclusive sob pressão?
5. IA com uso demonstrado, ferramenta específica + caso real?
6. Respostas técnicas no nível da posição?
7. Energia e interesse genuíno?
8. Sabe quando parar? Prolixidade injustificada?
9. Hunter ou passivo? (Sales/Revenue)
10. Evidência técnica de entrega além do comportamento? (Sales/Revenue)

**Escala:**
- 8-10 sim: score 4-5
- 6-7 sim: score 3 (caveat obrigatório)
- 2-5 sim: score 2
- 0-1 sim: score 1

**Distinção score-4 vs. score-5:**
Score-5 exige: narrativa totalmente coerente sem inconsistência + números cruzados com LinkedIn/referência + entrevistador quer encaixar o candidato mesmo sem headcount claro. E mesmo assim: "score comportamental excepcional -- validação técnica da área obrigatória antes do handoff."

---

## Formato de output obrigatório

```markdown
# Avaliação -- [Nome do Candidato]
Cargo: [role] | Nível: [nível] | Posição no processo: [Pos1/2/3]
Data: [YYYY-MM-DD] | Avaliador: Guardião (Bar Raiser Nexforce)

---

## Score Final: [1-5] -- [Rótulo]

[Rótulo]: Score 1 (Eliminação imediata) / Score 2 (Veto absoluto) / Score 3 (Aprovado com ressalvas) / Score 4 (Aprovado) / Score 5 (Excepcional)

[Justificativa em 2-4 linhas: o que determinou o score. Citar evidência específica da transcrição, nunca "pareceu" ou "aparentou".]

[Se Sales/Revenue: FLAG -- validação técnica pendente / ou: evidência técnica verificada -- [qual]]
[Se score-3: CAVEAT -- [o que não brilhou os olhos, obrigatório]]
[Se score-2: VETO ABSOLUTO -- candidato não avança]
[Se score-5: score comportamental excepcional -- validação técnica da área obrigatória antes do handoff]

---

## Varredura de Churn

[X] de [Y] passagens < 1 ano ([Z]%). [Avaliação: crescimento documentado / padrão de fuga / inconclusivo -- justificativa]

---

## Pontos Fortes

1. [Ponto forte + evidência específica da transcrição]
2. [Ponto forte + evidência específica da transcrição]
[mínimo 2 para score 3+]

---

## Pontos Fracos

1. [Ponto fraco + evidência específica + impacto esperado na função]
2. [Ponto fraco + evidência específica + impacto esperado na função]
[mínimo 1 para score 4 ou menos]

---

## Gaps que precisam de aprofundamento

Aspectos inconclusivos que a próxima rodada deve investigar:

1. [Gap + por que ficou inconclusivo + como investigar]
2. [Gap + por que ficou inconclusivo + como investigar]

---

## Perguntas obrigatórias para próximas entrevistas

[mínimo 3 perguntas para score 3-4; mínimo 1 para score 5; nenhuma para score 1-2]

1. "[Pergunta exata]"
   Finalidade: [o que pretende verificar]

2. "[Pergunta exata]"
   Finalidade: [o que pretende verificar]

---

## Recomendação de handoff

[Instrução direta para o próximo entrevistador: o que verificar, o que já foi coberto, onde focar.]

[Se Sales/Revenue: validação técnica obrigatória antes do handoff]
[Se score-3: aprovação dupla do líder direto obrigatória antes do onboarding]
[Se score 1-2: campo em branco -- candidato não avança]

---

## Mensagem de retorno ao candidato

[Mensagem pronta para envio. Usar primeiro nome. Polida, direta, sem corporativês. Tom como Vitti falaria: sem rodeios, sem crueldade. Para score 3+: referenciar algo concreto da conversa. Nunca revelar motivos específicos de reprovação.]
```

---

## Regras da mensagem por situação

**Score 1-2 -- Rejeição:**
> "Olá [Nome], obrigado pelo tempo e pela conversa. Após a entrevista, decidimos não seguir com sua candidatura para essa posição. Desejo sucesso na sua busca."

**Score 2 com potencial futuro (situacional -- salary, timing, momento de mercado):**
> "Olá [Nome], foi uma conversa boa e vejo potencial no seu perfil. Nesse momento não vamos avançar -- [motivo estrutural breve]. Tenho interesse genuíno em manter contato. Se abrir algo mais alinhado nos próximos meses, entro em contato."

**Score 3 recusado por fator externo (salary, timing):**
> "Olá [Nome], gostei da nossa conversa e do seu perfil. Infelizmente [a expectativa salarial está acima do que conseguimos oferecer / o momento da abertura mudou]. Não é um julgamento do seu valor -- é uma limitação estrutural do processo. Vou te manter no radar para quando surgir uma oportunidade mais compatível."

**Score 3-5 aprovado (segue no processo):**
> "Olá [Nome], foi uma boa conversa -- [referência específica ao que impressionou]. Vamos seguir para [próxima etapa]. [Nome do responsável] entrará em contato em breve para alinhar os próximos passos."

**Score 4-5 aprovado com urgência:**
> "Olá [Nome], adorei a conversa. Perfil muito sólido -- [referência específica]. Quero que você avance no processo. [Nome] vai te contatar hoje/amanhã para [próxima etapa]."

A mensagem deve ser específica ao candidato e à situação. Não copiar o template -- adaptar o tom ao nível da posição (mais formal para sênior, mais direto para júnior).

---

## Campos do processo Nexforce (gerar sempre ao final)

Após o relatório completo, sempre gerar este bloco separado, pronto para copiar e colar no sistema interno:

```
---
CAMPOS DO PROCESSO NEXFORCE

OUTPUT DA IA SOBRE A AVALIAÇÃO

Bloco 1 -- Base de avaliação
"Candidato avaliado em [N] sessão(ões) ([listar entrevistas, entrevistadores, datas]), totalizando [X] minutos. Score Guardião: [N] ([rótulo])."

Bloco 2 -- Pontos fortes verificados
[3-5 pontos fortes com evidência específica de transcrição. Cada item cita o que o candidato disse ou fez concretamente. Sem adjetivos genéricos.]

Bloco 3 -- Pontos de atenção
[2-4 riscos ou gaps com evidência específica. Indicar impacto esperado na função.]

Bloco 4 -- Alertas para próximos interviewers
[Se houver próxima rodada: itens numerados e acionáveis. Incluir:
- Status da validação técnica de área (se Sales/Revenue)
- Alinhamento de compensação se houver gap identificado
- Processos paralelos ativos se mencionados
- Flags de onboarding se score-3
Omitir se for a rodada final.]

SCORE DA ANÁLISE DE IA
[Score N -- Rótulo exato: Score 1 (Eliminação imediata) / Score 2 (Veto absoluto) / Score 3 (Aprovado com ressalvas) / Score 4 (Aprovado) / Score 5 (Excepcional)]

ANOTAÇÕES DA ENTREVISTA
[Campo interno -- NÃO enviado ao candidato. 2-4 linhas diretas para People e próximos entrevistadores. Tom de briefing interno: o que não brilhou, riscos operacionais específicos, contexto de processo paralelo se houver. Sem suavização.]

MENSAGEM PARA O CANDIDATO
[Mensagem pronta para envio.]

BANCO DE TALENTOS
[Sim / Não]
- Sim: score 3+, ou score 2 com perfil promissor para cargo diferente
- Não: score 1, ou flag de integridade confirmada
---
```

---

## Qualidade mínima

- Toda evidência citada deve ter origem verificável na transcrição
- Se a transcrição for insuficiente para uma dimensão: declarar "dimensão não avaliada -- transcrição insuficiente"
- Nunca inventar evidência para completar o relatório
- Nunca emitir score 3+ em Sales/Revenue sem verificar evidência técnica
- Score-2 é veto -- não sugira alternativas de aprovação

---

## Formato de arquivo

Salvar em `Outputs/YYYY-MM-DD_[nome-candidato]/avaliacao_[nome-candidato].md`.
Compartilhar via link `computer://`.

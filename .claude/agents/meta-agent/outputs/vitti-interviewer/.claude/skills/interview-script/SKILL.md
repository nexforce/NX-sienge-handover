---
name: interview-script
description: Gera roteiro de entrevista estruturado, completo e operacional para qualquer cargo da Nexforce. Use quando o usuário pedir "roteiro de entrevista para [cargo]", "guia de entrevista", "perguntas para entrevistar [role]", "prepara uma entrevista para [cargo]" ou qualquer variacao.
---

# Skill: Roteiro de Entrevista

## Quando usar
- Usuário informa o cargo/role a ser entrevistado
- Usuário quer saber quais perguntas fazer em uma entrevista
- Usuário precisa preparar uma entrevista estruturada para um candidato específico

---

## Informações obrigatórias antes de gerar

Se qualquer um destes pontos estiver faltando, use `AskUserQuestion` para obter, uma pergunta consolidada, não várias:

1. Cargo exato e nível de senioridade (ex: BDR Pleno, AE Sênior, FTE HubSpot Jr, Sales Manager)
2. Posição no processo (Pos 1 triagem rápida / Pos 2-3 Bar Raiser com scorecard formal)
3. Há algo específico para investigar nesse candidato? (lacuna no CV, passagem curta, troca de setor, etc.)

---

## Lógica de geração por posição no processo

### Pos 1 -- Triagem
- Duração: 20-25 minutos
- Objetivo: eliminação rápida ou avanço, não é avaliação profunda
- Cobrir obrigatoriamente: trajetória, 1-2 blocos técnicos do role, IA, um sinal de fit cultural
- Output: roteiro enxuto, máximo 6 blocos, sem scorecard formal

### Pos 2-3 -- Bar Raiser
- Duração: 30-40 minutos
- Objetivo: score formal 1-5 com evidências específicas por dimensão
- Cobrir os 10 blocos completos adaptados ao cargo
- Output: roteiro completo com scorecard, probes detalhados e calibrador pós-entrevista

---

## Estrutura obrigatória do roteiro (Pos 2-3)

### Cabeçalho
```
Cargo: [role] | Nível: [nível] | Modo: [Pos1 / Bar Raiser]
Duração estimada: [X min]
[Se Sales ou Revenue: ALERTA -- verificar evidência técnica antes de fechar score 3+]
[Se há ponto específico para investigar: FOCO EXTRA EM -- [ponto]]
```

---

### Bloco 1 -- Trajetória
**Pergunta:** "Me conta sua trajetória."

**O que extrair:**
- Lógica das transições (crescimento ou fuga?)
- Consistência entre o que está no LinkedIn e o que é dito
- Tempo em cada empresa (calcular % de passagens < 1 ano mentalmente)

**Sinais de avaliação:**

| Verde | Vermelho |
|---|---|
| Narrativa clara, com lógica de progressão | Justificativas vagas ou que mudam sob pressão |
| Cada saída tem razão específica e crescimento | Padrão de saídas por "fit de gestão" ou pressão |
| Volunteering de contexto relevante | Evita detalhar saídas específicas |

**Probes:**
- *"Em [empresa X] você ficou [N] meses -- o que te levou a sair nesse momento?"*
- *"Se eu falar com seu gestor de lá, o que ele me conta sobre você?"*
- *"Essa saída foi decisão sua ou da empresa?"* (se a narrativa for ambígua)

---

### Bloco 2 -- Resultados Quantificados
**Pergunta:** "Me conta seu histórico de atingimento de metas."

**Adaptar ao role:**
- BDR/SDR: taxa de conversão cold para meeting, volume de prospecções/semana
- AE: cota individual trimestral, % de atingimento, deal size médio
- FTE/HubSpot: projetos entregues, NPS de cliente, escopo das implementações
- Sales Manager: resultado do time antes e depois, evolução de ramp-up
- FP&A: modelos construídos, decisões geradas, precisão de forecast
- Revenue: análises produzidas, processos otimizados, impacto mensurável
- Marketing: leads gerados, custo por lead, pipeline influenciado

**Sinais de avaliação:**

| Verde | Vermelho |
|---|---|
| Número específico sem precisar perguntar duas vezes | "Atingia bem" sem número |
| Diferencia resultado individual do resultado de time | Todos os KPIs são coletivos |
| Aceita "quantas vezes não bateu?" sem defensividade | Defensividade ou explicação longa para meta não atingida |

**Probes:**
- *"E quantas vezes você não bateu a meta?"*
- *"Esse resultado foi individual ou do time?"*
- *"Você consegue me dar um número específico?"* (se a resposta for qualitativa)

---

### Bloco 3 -- Track Record e Saídas
**Pergunta:** Para cada empresa relevante: *"Por que você saiu de [empresa]?"*

**O que extrair:**
- Razão real vs. razão socialmente aceitável
- Consistência de versão ao longo da entrevista
- Padrão de saída (crescimento documentado vs. fuga de problemas)

**Probe de pressão de verificação (usar naturalmente):**
- *"Tenho um contato lá -- se eu ligar, o que ele me conta sobre você?"*
- *"Vou falar com [gestor] antes de fechar o processo."*

**Atenção:** se a narrativa mudar após qualquer um desses probes, é red flag de integridade. Eliminatório independente do resto.

---

### Bloco 4 -- Fracasso Profissional
**Pergunta:** "Qual foi o seu maior fracasso profissional?"

**Calibração de tamanho mínimo por nível:**
- Jr/Pleno: projeto que não entregou, meta muito abaixo, relacionamento que quebrou
- Sênior: time que não performou, cliente que perdeu, decisão estratégica errada
- Head/Manager: reestruturação mal-feita, contratação que não funcionou, resultado de área

**Sinais de avaliação:**

| Verde | Vermelho |
|---|---|
| Fracasso real com impacto real | "Aprendi que sou perfeccionista demais" |
| Descreve o que fez de errado especificamente | Culpa 100% atribuída ao ambiente |
| Aprendizado articulado e específico | "Aprendi a me comunicar melhor" sem exemplo |

**Probes:**
- *"O que você acha que você poderia ter feito diferente?"*
- *"Qual foi o impacto para a empresa?"*
- *"O que você mudou depois disso?"*

---

### Bloco 5 -- Conhecimento da Nexforce
**Pergunta:** "O que você sabe sobre a Nexforce?"

**O que extrair:**
- Profundidade da pesquisa (3 unidades, modelo de negócio, contexto LatAm)
- Interesse genuíno vs. resposta genérica
- Conexão entre o que o candidato quer e o que a Nexforce é

**Sinais de avaliação:**

| Verde | Vermelho |
|---|---|
| Cita as 3 unidades ou pelo menos 2 | "Vi que vocês são uma startup de tecnologia" |
| Conecta a posição com o que a empresa faz | "Quero crescer em uma empresa que valorize pessoas" |
| Perguntou algo específico para entender melhor | Não pesquisou nada além do LinkedIn básico |

*Em cargos comerciais: ausência de pesquisa sobre a Nexforce é red flag grave.*

---

### Bloco 6 -- Inteligência Artificial
**Pergunta:** "Como você está usando inteligência artificial no seu dia a dia?"

**Probe obrigatório se a resposta for genérica:**
- *"Me dá um exemplo específico de como você usou essa semana."*

**Adaptar ao role:**
- BDR/SDR: pesquisa de prospect com IA, personalização de abordagem
- AE: análise de contrato, preparação de reunião, pesquisa de concorrente
- FTE: documentação técnica, geração de código de automação
- FP&A: modelagem, análise de dados, narrativa de apresentação
- Revenue: análise de funil, geração de relatório, mapeamento de processo
- Marketing: geração de copy, análise de campanha, SEO

**Sinais de avaliação:**

| Verde | Vermelho |
|---|---|
| Ferramenta específica + caso de uso real desta semana | "Uso às vezes para emails" sem exemplo concreto |
| Integra IA no fluxo de trabalho, não só experimenta | "Não senti necessidade ainda" |
| Faz perguntas sobre como a Nexforce usa IA | "Não é muito para minha área" |

---

### Bloco 7 -- Ferramentas e Stack Técnico
**Pergunta:** Adaptar ao role.

**Por role:**
- BDR/SDR: *"Quais ferramentas você usa para pesquisa e cadência de prospecção?"*
- AE: *"Como você gerencia seu pipeline no CRM? Me mostra como é o fluxo."*
- FTE: *"Quais módulos do HubSpot você configurou? Me explica o mais avançado."*
- SM: *"Que ferramentas você usa para acompanhar performance do time?"*
- FP&A: *"Me conta o modelo financeiro mais complexo que você construiu."*
- Revenue: *"Qual foi a configuração mais complexa que você fez no CRM?"*
- Marketing: *"Quais ferramentas de automação de marketing você já operou?"*

**Probe de profundidade real:**
- *"Você usou ou configurou?"*
- *"Me dá um exemplo de uma customização que você fez."*
- *"Quem configurou isso -- você ou um consultor?"*

---

### Bloco 8 -- Feedback 3+3
**Pergunta:** "Se eu pedisse 3 pontos fortes e 3 de desenvolvimento para o seu líder atual, o que ele diria?"

**Framing obrigatório:** "o que o líder diria", não "na sua opinião." Reduz resposta decorada.

**Sinais de avaliação:**

| Verde | Vermelho |
|---|---|
| Ponto de desenvolvimento específico e incômodo de admitir | "Sou perfeccionista demais" ou "me dedico demais" |
| Plano ativo de mitigação ou reconhecimento honesto | Todos os fracos atribuídos ao ambiente ou diagnóstico externo |
| Pelo menos um ponto que o gestor diria que não seria dito como elogio | Todos os pontos "fracos" são virtudes disfarçadas |

**Probe se o terceiro ponto de desenvolvimento não vier:**
- *"E um terceiro ponto?"*
- *"Tem algo que você ainda não conseguiu superar completamente?"*

---

### Bloco 9 -- Adversidade
**Pergunta:** "Qual foi o momento mais difícil que você já enfrentou, pessoal ou profissional?"

**Calibração de threshold por nível:**
- Jr: situação que exigiu persistência real acima do cotidiano
- Pleno/Sênior: crise profissional, empresa em turbulência, meta impossível carregada
- Head: reestruturação, layoff, mudança de estratégia com time sob sua gestão

**Probes:**
- *"Qual foi o impacto disso?"*
- *"Como você saiu disso?"*
- *"O que essa situação mudou em você?"*

---

### Bloco 10 -- Case de Sucesso
**Pergunta:** "O que você mais tem orgulho na sua carreira?"

**O que extrair:**
- Capacidade de atribuir resultado a si mesmo (não ao time ou à sorte)
- Padrão de ambição, o tamanho do que considera conquista
- Número de resultado quando aplicável

**Probes:**
- *"O que você especificamente fez que foi decisivo nesse resultado?"*
- *"Esse sucesso foi individual ou coletivo?"*
- *"Se você não tivesse estado lá, teria acontecido do mesmo jeito?"*

---

### Encerramento -- Pergunta do candidato
**Pergunta:** "Você tem alguma pergunta para mim?"

**O que avaliar:**

| Verde | Vermelho |
|---|---|
| Pergunta sobre o desafio real da posição ou do time | "Quais são os benefícios?" como primeira pergunta |
| Pergunta sobre o que determinaria sucesso nos primeiros 90 dias | Não tem nenhuma pergunta |
| Pergunta que mostra que pesquisou e pensou na posição | Pergunta genérica que qualquer candidato faria |

---

### Calibrador pós-entrevista (scorecard interno)

Responder mentalmente antes de fechar score:

1. A comunicação está no nível de confiança para interagir com cliente?
2. O candidato tinha seus números ou precisou de esforço para extrair?
3. No fracasso, assumiu responsabilidade ou culpou o ambiente?
4. A versão foi consistente do começo ao fim, inclusive sob pressão?
5. Demonstrou uso real de IA com caso concreto?
6. As respostas técnicas estão no nível da posição?
7. Demonstrou energia e interesse genuíno?
8. Sabe quando parar, ou é prolixo de forma injustificada?
9. Hunter ou passivo? (Sales/Revenue obrigatório)
10. Há evidência técnica de entrega além do comportamento? (Sales/Revenue obrigatório)

**Escala:**
- 8-10 sim: score 4-5
- 6-7 sim: score 3 (caveat obrigatório)
- 2-5 sim: score 2
- 0-1 sim: score 1

---

## Alertas por role (incluir sempre no cabeçalho do roteiro)

**Sales (BDR, AE, SM):**
> ALERTA: verificar evidência técnica de conversão/pipeline antes de fechar score 3+. Comunicação excepcional não substitui número verificável. Prolixidade penaliza ativamente. Perfil passivo em vaga hunter é eliminatório.

**Revenue Operations:**
> ALERTA: verificar evidência técnica de análise/CRM antes de fechar score 3+. "Organizado e metódico" não é evidência de entrega. Exigir exemplo de decisão influenciada por dado.

**FTE/HubSpot:**
> ALERTA: diferenciar uso operacional de implementação técnica. Exigir módulo específico + cliente real + implementação conduzida.

---

## Formato de output

Salvar em `Outputs/YYYY-MM-DD_roteiro-[cargo]/roteiro_[cargo].md`.

O roteiro deve ser operacional: o entrevistador lê durante a entrevista sem precisar improvisar. Cada pergunta tem o que extrai, como avaliar, o que fazer se a resposta for fraca.

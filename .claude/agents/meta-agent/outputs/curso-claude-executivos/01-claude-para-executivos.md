# Aula 1, Claude para Executivos

## Metadata

- **Módulo:** 1, Fundamentos
- **Duração:** 60 min
- **Pré-requisito:** Nenhum
- **Modalidade sugerida:** Live síncrono + Q&A aberto

## Objetivo

Ao final da aula, o executivo:
1. Explica em 30 segundos o que é Claude, quem fez (Anthropic) e por que existe (foco em segurança e raciocínio)
2. Compara Claude com ChatGPT e Gemini em 3 dimensões: raciocínio, código, segurança
3. Entende **como o Claude consome tokens** (input, output, memória de sessão) e por que isso afeta seu custo
4. Identifica qual modelo da família Claude (Opus, Sonnet, Haiku) usar em cada contexto, com lente de custo
5. Lista 3 casos de uso concretos para sua função executiva

## Breakdown de tempo

| Tempo | Bloco |
|---|---|
| 00:00, 00:05 | Abertura: por que esse curso existe, o que muda na rotina do executivo |
| 00:05, 00:15 | Claude vs ChatGPT vs Gemini: comparativo objetivo |
| 00:15, 00:35 | **Como Claude consome tokens: input, output, memória de sessão** |
| 00:35, 00:50 | Família Claude (Opus, Sonnet, Haiku): quando usar cada, com custo por caso |
| 00:50, 00:60 | Demos reais Vitti + atividade + Q&A |

## Conteúdo detalhado

### Bloco 1, Abertura (5 min)

- O problema: liderança gasta horas em tarefas repetitivas (email, briefing, análise, redação)
- A promessa: Claude bem usado libera 5 a 10h/semana de tempo executivo
- Posicionamento: este curso é prático, não conceitual. Em 8 horas você sai usando.

### Bloco 2, Claude vs ChatGPT vs Gemini (10 min)

**Quem é a Anthropic:** empresa fundada em 2021 por ex-OpenAI (Dario e Daniela Amodei). Foco declarado: AI safety e modelos confiáveis para empresas. Investidores: Google, Amazon, Salesforce.

**Comparativo objetivo (atualizar conforme benchmarks):**

| Dimensão | Claude (Anthropic) | ChatGPT (OpenAI) | Gemini (Google) |
|---|---|---|---|
| Raciocínio complexo | Forte (líder em tarefas multi-step) | Forte | Moderado |
| Código | Líder (Claude Code é referência) | Forte | Moderado |
| Contexto longo | Até 1M tokens (Opus/Sonnet) | Até 400k | Até 1M+ |
| Segurança e hallucination | Conservador, prefere admitir incerteza | Médio | Médio |
| Integração com ferramentas | MCP nativo, Connectors maduros | GPTs e Plugins | Workspace |
| Custo | Competitivo | Competitivo | Mais barato em volume |

**Quando escolher Claude:**
- Análise estratégica que exige raciocínio cuidadoso
- Trabalho com documentos longos (contratos, relatórios)
- Construção de agentes corporativos
- Casos onde "errar bonito" é pior do que admitir "não sei"

**Quando outro modelo pode fazer sentido:**
- Geração massiva de imagens (DALL-E, Imagen)
- Pesquisa web nativa em tempo real (Gemini, Perplexity)
- Volume puro de baixa complexidade (custo)

### Bloco 3, Como Claude consome tokens (20 min)

**Por que esse bloco existe:** todo executivo que adota Claude pergunta "quanto vai custar". A resposta exige entender o que é um token, a diferença entre input e output, e por que uma sessão longa custa muito mais do que parece.

#### Token: a unidade que tudo paga

- Token é um pedaço de texto, em média **3 a 4 caracteres em português** (ou ~0.75 palavra em inglês)
- Tudo que entra e tudo que sai é convertido em tokens
- Anthropic cobra por **milhão de tokens** (MTok), com preços diferentes para input e output

**Regra prática:**
- 1 página de texto (~500 palavras em PT) = ~700 tokens
- 1 PDF de 10 páginas = ~7.000 tokens
- 1 conversa típica de 30 min com Claude = 15.000 a 50.000 tokens

#### Input vs Output: por que output custa 5x mais

| Tipo | O que é | Custo relativo |
|---|---|---|
| **Input** | Tudo que VOCÊ envia: prompt, anexos, mensagens anteriores, system prompt, instruções de Project | 1x |
| **Output** | Tudo que Claude RESPONDE | ~5x mais caro que input |

**Por que output é mais caro:** gerar texto é computacionalmente mais pesado do que ler. Cada palavra de resposta exige um cálculo completo da rede neural.

**Implicação prática:** uma análise onde você manda 50 páginas de input e pede um resumo de 1 página custa muito menos do que uma onde você manda 1 pergunta e pede um relatório de 50 páginas.

#### Memória de sessão: por que sessões longas explodem o custo

Claude **não tem memória persistente entre sessões** (a não ser que você use Memory, coberta na Aula 6). O que ele tem é uma **janela de contexto** dentro de uma única conversa.

**Como funciona dentro de 1 sessão:**

Cada nova mensagem que você envia, Claude relê **TUDO que veio antes**:
- Mensagem 1: você envia 1.000 tokens, Claude lê 1.000
- Mensagem 2: você envia mais 500, Claude lê **os 1.000 anteriores + 500 novos + a resposta anterior**
- Mensagem 3: Claude lê **tudo de novo**, agora ainda maior
- Mensagem 10 em uma sessão longa: Claude pode estar relendo 50.000+ tokens **cada vez**

**Por isso uma conversa que começa barata fica cara rápido.** É crescimento exponencial em volume de input cobrado.

**Visual sugerido para o slide:** gráfico de "tokens cobrados por turno" subindo em curva quase quadrática conforme a conversa avança.

**Regra prática para o executivo:**
- Conversa curta e focada (até 5 turnos): consumo controlado
- Conversa que passou de 10 turnos: começou a ficar cara
- Conversa que passou de 20 turnos: **abrir nova conversa** e levar só o essencial
- Se você precisa que o contexto persista entre sessões: usar Projects (Aula 3) ou Memory (Aula 6)

#### Cache de prompt: o desconto que poucos usam

Para contextos repetitivos (mesmo system prompt, mesmo Project), Anthropic oferece **prompt caching**: o conteúdo recorrente fica em cache e custa **~10% do preço normal**.

**Implicação executiva:** Projects bem montados (com bom system prompt + arquivos anexados) ficam cada vez mais baratos de usar conforme você volta neles. Vale o investimento de tempo em estruturar.

#### Quanto consome cada modelo (referência maio 2026, validar antes da aula)

| Modelo | Input | Output | 1 conversa típica de 30 min |
|---|---|---|---|
| **Haiku 4.5** | ~$1/MTok | ~$5/MTok | $0.05 a $0.15 |
| **Sonnet 4.6** | ~$3/MTok | ~$15/MTok | $0.15 a $0.50 |
| **Opus 4.6** | ~$15/MTok | ~$75/MTok | $0.75 a $2.50 |

**Observação:** assinaturas Pro/Team/Enterprise incluem uso (até limites de fair use), então o exec típico não paga por token diretamente. Mas entender o consumo importa porque os limites das assinaturas são definidos em tokens, e API é cobrada por token.

### Bloco 4, Família Claude com lente de custo (15 min)

| Modelo | Quando usar | Custo relativo | Exemplo Vitti / Nexforce |
|---|---|---|---|
| **Opus 4.6** | Decisões complexas, raciocínio profundo, agentes críticos, casos onde errar custa muito | Alto | Análise de estrutura societária internacional para expansão LatAm; revisão estratégica de M&A de startup do Nexforce Marketplace |
| **Sonnet 4.6** | Default produção, equilíbrio inteligência/custo, 80% dos casos executivos | Médio | Redação de post LinkedIn no estilo Vitti, análise de pipeline HubSpot (Marketplace), prep de call com prospect internacional, briefing pré-board |
| **Haiku 4.5** | Alta frequência, latência crítica, tarefas simples e bem definidas | Baixo | Classificação de email da caixa do Vitti (urgente/não urgente), triagem de leads MQL→SQL, resumo curto de transcrição de call |

**Regra de decisão executiva:**

```
Vai impactar decisão de mais de R$100k?      → Opus
É repetitivo, 100+ execuções por dia?         → Haiku
Tudo o resto (default)                        → Sonnet
```

**Erro comum a evitar:** usar Opus para tarefa simples. Sonnet entrega resposta equivalente em 90% dos casos com 5x menos custo.

**Erro oposto:** usar Haiku para análise estratégica. Você economiza centavos e perde insight. Falsa economia.

### Bloco 5, Demos reais Vitti + atividade + Q&A (10 min)

**3 demos rápidas com exemplos do Vitti (com permissão):**

1. **Redação de LinkedIn post (3 min):** mostrar Project "Conteúdo LinkedIn" do Vitti, rodar prompt para gerar post sobre insight do dia. Comentar: usa Sonnet, ~500 tokens input, ~400 tokens output, custo ~$0.01.

2. **Análise de pipeline HubSpot (3 min):** mostrar prompt "analisa meus deals em Open Stage, identifica os 3 com maior risco de stall, sugere ação". Comentar: input alto por causa dos dados de deal (~3.000 tokens), output médio. Sonnet, ~$0.10.

3. **Sparring estratégico OPMAX (2 min):** mostrar conversa onde Vitti usa Claude como sparring partner para refinar Objective do trimestre. Comentar: conversa longa (15+ turnos) que justifica Opus. Custo da sessão completa: ~$2.00. ROI: decisão estratégica refinada em 20 min em vez de reunião de 1h com 3 pessoas.

**Atividade introdutória (2 min):** introduzir a atividade de mapeamento (entrega entre aulas).

## Exemplo Nexforce destacado

**Como o Vitti distribui modelos no dia a dia:**

- **Haiku:** triagem de inbox, classificação de leads HubSpot (volume diário alto)
- **Sonnet:** ~80% do uso pessoal (conteúdo, análise, briefing, prep de call)
- **Opus:** decisões estratégicas Nexforce (expansão, M&A, redesenho de unidade)

Consumo mensal estimado: ~$80-150 em uso de API equivalente (mas pago via plano Team/Max, então o número visível é a assinatura).

## Atividade prática (entrega entre aulas)

**Título:** Mapeamento de 10 oportunidades + estimativa de modelo

**Brief:** Liste 10 tarefas da sua rotina semanal que consomem mais de 30 min cada e que envolvem texto, análise, ou pesquisa. Para cada uma:
- Frequência (diária / semanal / mensal)
- Tempo gasto hoje
- Potencial de redução com Claude (alto / médio / baixo)
- **Modelo recomendado** (Opus / Sonnet / Haiku) com justificativa de 1 linha

Entrega: 1 planilha simples ou doc com as 10 linhas. Será usada como base para as atividades das próximas aulas.

## Materiais de apoio

- **Slide deck:** ~22 slides
- **Cheat sheet:** "Família Claude em 1 página" (tabela de decisão Opus/Sonnet/Haiku com critérios + tabela de preços)
- **Calculadora de tokens:** planilha simples onde o exec coloca tamanho médio do prompt e da resposta e número de turnos, e calcula custo estimado por modelo
- **Vídeo curto (5 min):** Vitti mostrando 3 sessões reais com 3 modelos diferentes
- **Link oficial:** https://docs.claude.com/en/about-claude/models/overview e https://www.anthropic.com/pricing

## Checkpoints de aprendizado

Ao final da aula, o aluno deve conseguir responder:
1. O que diferencia Claude dos concorrentes em 2 frases?
2. Por que output custa mais que input?
3. Por que uma conversa de 30 turnos custa muito mais do que 3 conversas de 10 turnos?
4. Quando usar Opus vs Sonnet vs Haiku?
5. Quais 3 casos de uso eu vou testar essa semana?

## Notas para o agente de design

- Tom executivo, sem hype.
- Bloco de tokens é o mais denso e o mais novo para a audiência. Reservar tempo de design para um **slide de "como a conta cresce a cada turno"** com visual claro (curva crescente, não tabela).
- Comparativo Claude vs concorrentes: tabela limpa, sem viés evidente. Audiência tem ChatGPT no celular, vai questionar tabelas tendenciosas.
- Demos ao vivo com exemplos Vitti são o ponto alto. Validar com Vitti quais Projects ele autoriza mostrar antes da aula.
- Calculadora de tokens em Excel/Sheets, simples (3 inputs, 1 output por modelo).
- Sem em-dash em qualquer material entregue.
- Preços (US$) podem mudar. Versionar o cheat sheet com data de atualização visível.

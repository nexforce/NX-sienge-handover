# Aula 3, Claude Chat na Prática

## Metadata

- **Módulo:** 2, Uso prático
- **Duração:** 60 min
- **Pré-requisito:** Aulas 1 e 2
- **Modalidade sugerida:** Live síncrono com hands-on individual

## Objetivo

Ao final da aula, o executivo:
1. Navega com confiança na interface do Claude Chat (web, mobile, desktop)
2. Cria e organiza Projects para contexto persistente
3. Aplica 5 técnicas de prompt engineering executivo (clareza, contexto, exemplos, formato, papel)
4. Tem 3 prompts próprios funcionando para sua rotina (entregue como atividade)

## Breakdown de tempo

| Tempo | Bloco |
|---|---|
| 00:00, 00:05 | Check da atividade (mapeamento de time) |
| 00:05, 00:15 | Interface: web, mobile, desktop, atalhos essenciais |
| 00:15, 00:25 | Projects: o que são, quando usar, como organizar |
| 00:25, 00:45 | Prompt engineering executivo: 5 técnicas com exemplos |
| 00:45, 00:55 | Hands-on individual: cada exec cria seu primeiro Project |
| 00:55, 00:60 | Compartilhamento e feedback rápido |

## Conteúdo detalhado

### Bloco 1, Check da atividade (5 min)

- Revisar planos de cadastro de time
- Validar se os ambientes escolhidos fazem sentido
- Conectar com a aula: vamos começar pelo ambiente que TODOS vão usar (Chat)

### Bloco 2, Interface (10 min)

**Onde acessar:**
- Web: claude.ai
- Mobile: app Claude (iOS e Android)
- Desktop: Claude.app (Mac e Windows)

**Elementos da interface:**
- Sidebar: histórico de conversas, Projects, Settings
- Área central: conversa ativa
- Input: caixa de digitação, anexos, voice, ferramentas

**Atalhos essenciais (Desktop):**
- `Cmd/Ctrl + K`: nova conversa
- `Cmd/Ctrl + Shift + O`: criar Project
- `Cmd/Ctrl + Enter`: enviar sem quebrar linha
- `Cmd/Ctrl + /`: lista de comandos

**O que muitos executivos não sabem:**
- Pode anexar PDF, Word, Excel, PowerPoint, imagens, áudio
- Pode ditar (botão de microfone)
- Pode gerar e baixar arquivos (Excel, Word, PDF) direto da conversa
- Histórico fica salvo na sua conta, sincroniza entre dispositivos

### Bloco 3, Projects (10 min)

**O que é um Project:**
- Espaço persistente onde você anexa documentos, instruções customizadas e tem múltiplas conversas relacionadas
- O Claude tem acesso aos arquivos do Project em TODAS as conversas daquele Project
- Ideal para temas recorrentes (cliente, estratégia, processo)

**Quando criar Project:**
- Tema que você vai retomar em mais de 3 conversas
- Contexto que se repete (mesma empresa, mesmo cliente, mesmo framework)
- Documentos que servem de base para várias análises

**Estrutura recomendada de Projects para executivo:**

| Project | Conteúdo anexado | Custom instructions |
|---|---|---|
| Estratégia 2026 | Plano anual, OKRs, decks de board | "Você é meu sparring partner estratégico. Foque em trade-offs, não em opções." |
| Pipeline comercial | Lista de deals, ICP, sales playbook | "Use linguagem comercial. Sempre proponha próximo passo." |
| Conteúdo LinkedIn | Posts anteriores, voz, exemplos do meu estilo | "Replique meu tom: direto, analítico, sem hype." |
| Concorrentes | Battlecards, sites, news recentes | "Sempre cite fonte e data. Marque incerteza explicitamente." |

**Boas práticas:**
- 1 Project por tema, não 1 para tudo
- Atualizar arquivos periodicamente (quarterly review)
- Custom instructions curtas e específicas

### Bloco 4, Prompt engineering executivo (20 min)

**5 técnicas essenciais:**

**1. Clareza e especificidade**

❌ Ruim: "Me ajuda com esse email"
✅ Bom: "Reescreva este email para um cliente sênior de banco. Tom formal mas direto. Reduza para metade do tamanho. Mantenha os 3 pedidos finais explícitos."

**2. Contexto**

❌ Ruim: "Analise esses números"
✅ Bom: "Analise esses números de pipeline. Contexto: somos B2B SaaS LatAm, fazemos ~R$X de ARR, meta de Y. Identifique 3 riscos e 3 oportunidades."

**3. Exemplos (few-shot)**

❌ Ruim: "Classifique esses leads"
✅ Bom: "Classifique esses leads em A/B/C. Exemplos:
- A (ICP perfeito): empresa SaaS, 100+ funcionários, líder técnico identificado
- B (próximo do ICP): empresa tech, 50-100 funcionários
- C (fora): não-tech, pequena, ou sem contato técnico"

**4. Formato de saída**

❌ Ruim: "Resume esse contrato"
✅ Bom: "Resume esse contrato em uma tabela markdown com colunas: Cláusula, Risco (Alto/Médio/Baixo), Ação recomendada, Prazo."

**5. Papel (role prompting)**

❌ Ruim: "O que achar dessa proposta?"
✅ Bom: "Você é meu CFO. Avalie esta proposta de fornecedor sob ótica financeira: TCO em 3 anos, riscos contratuais, alternativas que eu deveria considerar antes de assinar."

**Estrutura de prompt executivo (template):**

```
[CONTEXTO]
Quem sou eu, o que faço, situação atual.

[TAREFA]
O que eu quero que você faça especificamente.

[FORMATO]
Como quero a resposta (tabela, bullets, parágrafo, número de palavras).

[RESTRIÇÕES]
O que NÃO fazer (sem jargão, sem disclaimers, no máximo X palavras).

[EXEMPLO, se aplicável]
Como uma resposta ideal seria.
```

### Bloco 5, Hands-on individual (10 min)

Cada executivo:
1. Cria 1 Project relacionado a uma das tarefas da atividade da aula 1
2. Anexa 1 ou 2 arquivos relevantes
3. Define custom instructions
4. Roda 1 prompt usando o template

Facilitador circula e ajuda individualmente. Resolver 2 ou 3 ao vivo para a turma toda.

### Bloco 6, Compartilhamento (5 min)

2 ou 3 voluntários compartilham o Project criado e o resultado obtido. Discussão de quem teve resultado melhor e por quê.

## Exemplo Nexforce destacado

**Project Vitti "Conteúdo LinkedIn":**

Anexos:
- 50 posts anteriores do Vitti (exportados)
- Doc com voz/tom: "Anti-AI writing style" do Vitti
- Contexto empresa: Nexforce overview, 3 unidades

Custom instructions:
- "Replique exatamente o estilo dos posts anexados. Direto, analítico, sem hype, sem clichês corporativos."
- "Nunca use em-dash."
- "Cada post começa com afirmação polêmica ou contraintuitiva, não com pergunta."
- "Termine com 1 frase de chamada à ação ou reflexão."

Resultado: Vitti gera primeira versão de post em ~2 min (vs ~30 min antes).

## Atividade prática (entrega entre aulas)

**Título:** 3 Projects funcionando

**Brief:** Criar 3 Projects diferentes no Claude Chat e usar cada um pelo menos 1 vez essa semana. Para cada Project, registrar:
- Nome
- Conteúdo anexado
- Custom instructions
- 1 prompt usado
- Avaliação do resultado (1 a 5)

Entrega: doc simples com as 3 entradas. Será discutido na aula 4.

## Materiais de apoio

- **Slide deck:** 25 slides
- **Cheat sheet:** "5 técnicas de prompt em 1 página" + template estrutura
- **Vídeo curto (3 min):** tour dos Projects do Vitti (com permissão)
- **Biblioteca de prompts:** 20 prompts executivos prontos (categorizados: análise, redação, decisão, briefing)
- **Link oficial:** https://docs.claude.com/en/build-with-claude/prompt-engineering

## Checkpoints de aprendizado

1. Eu sei criar um Project com instruções customizadas?
2. Eu consigo escrever um prompt seguindo o template (contexto, tarefa, formato, restrições)?
3. Eu tenho 3 Projects ativos que vou usar essa semana?

## Notas para o agente de design

- Hands-on é crítico. Pelo menos 10 min de sala devem ser cada um fazendo no próprio computador.
- Cheat sheet deve caber em 1 página A4 (não deck, página separada para imprimir).
- Biblioteca de 20 prompts: pedir ao Vitti exemplos reais (ou usar genéricos: "análise SWOT em 5 min", "briefing pré-reunião", "post LinkedIn em 200 palavras", etc.).
- Sem em-dash em qualquer material entregue.

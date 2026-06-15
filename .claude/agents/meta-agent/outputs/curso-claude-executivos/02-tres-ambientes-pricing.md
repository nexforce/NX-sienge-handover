# Aula 2, Os 3 Ambientes (Chat, Cowork, Code) e Pricing

## Metadata

- **Módulo:** 1, Fundamentos
- **Duração:** 60 min
- **Pré-requisito:** Aula 1
- **Modalidade sugerida:** Live síncrono + atividade de mapeamento

## Objetivo

Ao final da aula, o executivo:
1. Identifica os 3 ambientes Claude (Chat, Cowork, Code) e diz qual usar em cada situação
2. Sabe quando recomendar Claude Code ao time técnico (mesmo sem usá-lo pessoalmente)
3. Entende o modelo de pricing (por user vs por org, planos, limites, unlimited)
4. Define plano de cadastro do seu time: quem usa o quê, em qual plano

## Breakdown de tempo

| Tempo | Bloco |
|---|---|
| 00:00, 00:05 | Recap da aula 1 e check de atividade (5 oportunidades top de cada exec) |
| 00:05, 00:25 | Os 3 ambientes: Chat, Cowork, Code (visão executiva) |
| 00:25, 00:35 | Quando recomendar Claude Code ao time técnico |
| 00:35, 00:50 | Pricing, planos, limites, governança de consumo |
| 00:50, 00:60 | Atividade prática: mapeamento de time |

## Conteúdo detalhado

### Bloco 1, Recap e check (5 min)

- Revisar entregas da atividade da aula 1
- Escolher 1 ou 2 oportunidades para usar como exemplo na aula
- Conectar com agenda do dia: hoje vamos definir QUAL ambiente cada uma dessas tarefas usaria

### Bloco 2, Os 3 ambientes (20 min)

**Comparativo executivo:**

| Característica | Chat | Cowork | Code |
|---|---|---|---|
| Para quem | Todo mundo, default | Não-devs que automatizam workflows | Desenvolvedores |
| Onde roda | Browser, mobile, desktop | Desktop app | Terminal (CLI) |
| Acessa arquivos do seu PC | Não (anexos manuais) | Sim, pastas conectadas | Sim, repositório de código |
| Roda código | Limitado (analysis tool) | Sandbox Linux completo | Sandbox + execução local |
| Conecta MCPs / Connectors | Sim | Sim, mais profundo | Sim |
| Customização (Skills, Subagents) | Não | Sim | Sim, profundamente |
| Curva de aprendizado | Baixa | Média | Alta |
| Custo (relativo) | Plano por usuário | Plano por usuário (mesmo do Chat) | Plano por usuário (mesmo do Chat) ou API |

**Quando usar Chat:**
- Resposta rápida, tarefa pontual
- Trabalho em qualquer dispositivo
- Não envolve arquivos locais nem automação recorrente

**Quando usar Cowork:**
- Tarefa envolve seus arquivos (planilhas, docs, slides)
- Você quer criar um "agente" persistente para um projeto
- Você quer automação recorrente (briefing diário, dashboard ao vivo)
- Você quer skills e subagents customizados sem código

**Quando usar Code:**
- Trabalho dentro de um repositório de código
- Refatoração, debug, testes, deploy
- Construção de produtos digitais

### Bloco 3, Claude Code para executivos (10 min)

**Por que o executivo precisa saber, mesmo sem usar:**

- Claude Code é o ambiente mais poderoso para devs (pode escrever, ler, executar, debugar)
- Times de engenharia que adotam Claude Code reportam ganhos de produtividade significativos (varia muito por empresa, importante medir)
- Decisão de adoção envolve: licença, governança de repositórios, política de IP, segurança

**Quando recomendar ao time técnico:**
- Refatorações grandes que ninguém tem coragem de fazer
- Onboarding de novos devs (Claude Code lê base de código e responde dúvidas)
- Tarefas chatas repetitivas (testes, docs, migrations)
- Investigação de bugs complexos

**Quando NÃO usar Claude Code:**
- Decisões arquiteturais de longo prazo (use sparring com humano sênior)
- Código com PII em texto puro (revisar política antes)
- Repositórios com IP crítico sem revisão da política de uso

**Mensagem para o exec:** Você não vai usar Code, mas precisa saber quando autorizar o time a usar, e em que condições.

### Bloco 4, Pricing, planos e governança (15 min)

**Planos Anthropic (referência atualizada, validar antes da aula):**

| Plano | Para quem | Custo aprox. | O que inclui |
|---|---|---|---|
| Free | Indivíduo | $0 | Chat com limites baixos |
| Pro | Indivíduo profissional | $20/usuário/mês | Chat, Projects, limites maiores |
| Max | Power user individual | $100, $200/mês | Limites altos, acesso prioritário |
| Team | Times | $25/usuário/mês (anual) | Pro + colaboração, billing centralizado |
| Enterprise | Grandes empresas | Sob contrato | SSO, auditoria, controles avançados, suporte |
| API | Devs e integrações | Pay-as-you-go por token | Custo por uso, controle total |

**Pontos críticos para o executivo:**

1. **Por user vs por org:**
   - Planos de assinatura (Pro/Team/Enterprise) são por usuário/mês
   - API é por consumo de tokens (input + output)
   - Cowork e Code consomem do mesmo plano do usuário

2. **Limites:**
   - Não existe "unlimited" puro. Todos os planos têm fair use
   - Pro: limite de mensagens em janelas de 5h
   - Team/Enterprise: limites mais altos, mas existem
   - API: limite é seu orçamento

3. **Quando migrar para Enterprise:**
   - 20+ usuários
   - Necessidade de SSO, SAML, controle de auditoria
   - Política de dados (zero retention, escopos, etc.)
   - Casos de uso críticos com SLA

4. **Quando faz sentido API direta:**
   - Construção de produtos próprios (ex: agente embarcado em SaaS)
   - Casos de alto volume previsível
   - Necessidade de Batch API (50% desconto em jobs não-críticos)

**Governança de consumo (frameworks):**
- Cadastrar Champion por área (responsável por uso, treinamento, escalonamento)
- Definir orçamento mensal (especialmente se for API)
- Auditar uso trimestral: quem usa, quanto, qual ROI
- Política de dados: o que não pode entrar no Claude (ver aula 8)

### Bloco 5, Atividade prática (10 min)

**Mapeamento de time:**

Cada executivo recebe template e preenche para seu time:

| Função | Quantidade | Ambiente principal | Plano sugerido | Champion |
|---|---|---|---|---|
| CEO | 1 | Cowork | Max ou Team | (você) |
| Diretor comercial | 1 | Chat + Cowork | Team | (nome) |
| SDRs | 5 | Chat | Team | (nome) |
| ... | ... | ... | ... | ... |

Entrega na próxima aula: planilha preenchida com plano de cadastro de pelo menos 5 funções.

## Exemplo Nexforce destacado

**Como o Vitti estrutura a Nexforce:**

- **CEO (Vitti):** Cowork como principal (projetos persistentes, automação) + Chat no celular
- **Time técnico (Nexforce Agents):** Code como principal, Cowork e API para casos específicos
- **Time comercial (Nexforce Marketplace):** Chat para tarefas rápidas, Cowork para prospecção e propostas
- **Time consultivo (Nexforce Services):** Cowork para gestão de projetos cliente + skills customizadas por vertical

Cada unidade tem um Champion (referência interna) que centraliza dúvidas e mede uso.

## Atividade prática (entrega entre aulas)

**Título:** Plano de cadastro do meu time

**Brief:** Preencher template (será fornecido) com:
- Funções do seu time (até 10 linhas)
- Ambiente principal para cada (Chat, Cowork, Code)
- Plano sugerido (Pro, Team, Enterprise, API)
- Champion designado por área
- Estimativa de custo mensal total

Entrega: planilha. Será revisada na aula 3 como input para discussão de implementação.

## Materiais de apoio

- **Slide deck:** 22 slides
- **Cheat sheet:** "Qual ambiente usar" (fluxograma 1 página)
- **Planilha:** template de mapeamento de time + calculadora de custo
- **Link oficial:** https://www.anthropic.com/pricing

## Checkpoints de aprendizado

1. Qual ambiente eu (executivo) vou usar predominantemente?
2. Qual ambiente meu time técnico deveria avaliar?
3. Quanto vai custar por mês cadastrar meu time?
4. Quem é o Champion de Claude em cada área da empresa?

## Notas para o agente de design

- Tabela comparativa dos 3 ambientes é o ativo mais importante. Caprichar.
- Pricing muda. Construir o slide de planos de forma que seja fácil atualizar (idealmente, link para página oficial em vez de valores fixos no deck).
- Atividade de mapeamento exige template Excel/Google Sheets pronto para download.
- Reforçar que Code NÃO é só "para programadores": é também para automação técnica de processos (RPA, scripts).

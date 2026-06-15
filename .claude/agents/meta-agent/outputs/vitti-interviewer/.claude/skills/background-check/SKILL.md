---
name: background-check
description: Pesquisa completa de candidato antes de oferta ou onboarding: redes sociais, processos judiciais, histórico profissional verificável, participação societária, reputação online e inconsistências com o que foi declarado na entrevista. Use quando o usuário pedir "faz um background check de [nome]", "pesquisa o candidato [nome]", "verifica o histórico de [nome]", "quero saber mais sobre [candidato]" ou variações.
---

# Skill: Background Check de Candidato

## Quando usar
- Candidato recebeu score 3+ e está próximo de oferta
- Usuário quer verificar inconsistência específica identificada na entrevista
- Usuário quer due diligence completa antes de onboarding
- Candidato para cargo sênior, de confiança ou com acesso a dados sensíveis

---

## Informações obrigatórias antes de iniciar

Se qualquer um destes pontos estiver faltando, use `AskUserQuestion`:

1. Nome completo do candidato
2. CPF (se disponível -- acelera busca judicial e societária)
3. LinkedIn do candidato (se disponível)
4. Cargo pretendido (define profundidade técnica de verificação)
5. Há algum ponto específico para investigar? (ex: passagem curta em empresa X, mudança de versão na entrevista sobre saída de Y)

---

## Sequência de pesquisa

### Etapa 1 -- Presença digital e redes sociais

**O que buscar:**

- LinkedIn: verificar consistência com o que foi declarado na entrevista
  - Cargos, empresas, datas de início e término
  - Títulos declarados (ex: "Gerente" no CV vs. "Analista" no LinkedIn)
  - Conexões com ex-colegas que possam ser referência
  - Atividade recente (publica? Engaja? Aprendizado visível?)

- Instagram/Facebook: presença pública
  - Conteúdo que contradiga o perfil declarado na entrevista
  - Posts que indiquem viagem, vida social incompatível com histórico relatado
  - Nada de julgamento pessoal -- relevante apenas se contraditório com o que foi declarado profissionalmente

- X (Twitter): posicionamento público
  - Declarações que possam ser incompatíveis com valores da Nexforce
  - Histórico de conflito público com empregadores ou clientes

- Google: "[nome completo]" + "[empresa declarada]" + "[cargo declarado]"
  - Notícias, menções, entrevistas, artigos assinados

**Ferramenta:** `WebSearch` para cada fonte.

---

### Etapa 2 -- Processos judiciais

**Fontes primárias (Brasil):**

- JusBrasil (jusbrasil.com.br): busca por nome completo e CPF
  - Processos trabalhistas (ex-empregado processando empregadores anteriores)
  - Processos cíveis
  - Reclamações como réu

- Tribunais estaduais: verificar se há processo relevante no estado de domicílio declarado

- Processos como empregador (se o candidato teve empresa): verificar se funcionários o processaram

**O que registrar:**
- Processo encontrado: número, tipo, partes, data, status atual
- Interpretar com contexto: um processo trabalhista isolado pode ser trivial; padrão de múltiplos processos como réu é red flag

**Ferramenta:** `WebSearch` em JusBrasil + nome + CPF (se disponível).

---

### Etapa 3 -- Histórico societário e empresas

**Fontes:**

- Receita Federal / CNPJ.biz / QSA (Quadro Societário e Administradores):
  - Verificar se o candidato é ou foi sócio em empresas
  - Verificar situação cadastral dessas empresas (ativa, baixada, irregular)
  - Verificar se há dívidas fiscais ou irregularidades

- Junta Comercial Estadual: confirmar participação societária declarada

**Relevância por cargo:**
- Sales/AE/Manager: conflito de interesse com clientes concorrentes?
- FTE/RevOps: empresa de consultoria paralela ativa?
- Todos: empresa em débito fiscal ou situação irregular é sinal de gestão financeira desorganizada

**Ferramenta:** `WebSearch` em Receita Federal, CNPJ.biz, consulta por CPF ou nome.

---

### Etapa 4 -- Verificação profissional

**Consistência de carreira:**
- Cruzar empresas declaradas no CV/entrevista com LinkedIn e Google
- Verificar se as empresas existem e operam no período declarado
- Para cargos de liderança: verificar se a empresa tinha o porte que o candidato descreveu

**Referências verificáveis:**
- Identificar no LinkedIn ex-gestores ou colegas das empresas declaradas
- Não contatar sem autorização do candidato no estágio de bgcheck inicial
- Marcar para referência formal quando candidato avançar para oferta

**Registros profissionais (quando aplicável):**
- CRC (Contabilidade), OAB (Advocacia), CVM (Mercado de capitais), CFA/CGA: verificar se o candidato é registrado se declarou exercer função que exige registro

---

### Etapa 5 -- Reputação online e Glassdoor

**Glassdoor / Blind / LinkedIn Reviews:**
- Verificar se o candidato aparece em avaliações de empresas (como gestor ou funcionário problemático)
- Geralmente inconclusivo, mas padrão de menções negativas específicas é red flag

**Reclamações em portais:**
- Reclame Aqui: se o candidato teve empresa ou cargo de atendimento
- Procon: padrão de reclamações como empreendedor

**Ferramenta:** `WebSearch` por nome + "reclamação" + empresa declarada.

---

## Escala de risco

Ao final da pesquisa, classificar em uma das três categorias:

### Verde -- Sem inconsistências
- LinkedIn consistente com o declarado na entrevista
- Nenhum processo judicial ativo relevante
- Histórico societário limpo ou sem conflito de interesse
- Presença digital compatível com perfil declarado

### Amarelo -- Pontos de atenção (não eliminatório, exige verificação)
- Datas no LinkedIn ligeiramente diferentes do declarado (ex: 1-2 meses de diferença)
- Processo trabalhista como réu isolado, status encerrado
- Empresa paralela ativa, mas sem conflito de interesse claro
- Post ou declaração pública que pode ser mal interpretado fora de contexto
- Cargo ou empresa não encontrada nas buscas (inconclusivo, não necessariamente falso)

### Vermelho -- Eliminatório ou exige confronto direto
- Cargo, empresa ou data declarado na entrevista inconsistente com LinkedIn de forma clara
- Processos trabalhistas múltiplos como réu (padrão de conflito com subordinados)
- Empresa irregular ou em débito com possível participação ativa do candidato
- Declaração pública incompatível com integridade esperada para o cargo
- Título profissional declarado sem registro obrigatório (OAB, CRC, etc.)

---

## Formato de output obrigatório

```markdown
# Background Check -- [Nome do Candidato]
Cargo pretendido: [role] | Data: [YYYY-MM-DD]
Fontes consultadas: [listar quais fontes foram pesquisadas]

---

## Resultado: [VERDE / AMARELO / VERMELHO]

[1-3 linhas resumindo o achado mais relevante. Se vermelho: qual o achado específico e por que é eliminatório ou requer confronto.]

---

## 1. Presença Digital e Redes Sociais

### LinkedIn
[Consistências e inconsistências encontradas. Listar cargo/empresa/data declarado vs. encontrado no LinkedIn.]

### Outros perfis
[Instagram, X, Google: achados relevantes ou "nada relevante encontrado."]

---

## 2. Processos Judiciais

[Processos encontrados: número, tipo, partes, status. Ou: "Nenhum processo encontrado nas fontes consultadas."]

---

## 3. Histórico Societário

[Empresas em que é ou foi sócio, situação atual, relevância para o cargo. Ou: "Nenhuma participação societária identificada."]

---

## 4. Verificação Profissional

[Consistência das empresas declaradas. Registros profissionais (se aplicável). Referências identificadas para contactar formalmente.]

---

## 5. Reputação Online

[Glassdoor, Reclame Aqui, menções relevantes. Ou: "Nenhuma menção relevante encontrada."]

---

## Pontos para confrontar com o candidato (se houver)

[Se há inconsistência Amarela ou Vermelha: listar exatamente o que perguntar ao candidato antes de emitir oferta. Framing sugerido para a conversa.]

---

## Recomendação

[AVANÇAR SEM RESSALVAS / AVANÇAR COM VERIFICAÇÃO ADICIONAL / CONFRONTAR ANTES DE AVANÇAR / NÃO AVANÇAR]

[Justificativa em 2-3 linhas.]
```

---

## Regras operacionais

- Usar apenas fontes públicas e acessíveis. Não solicitar documentos diretamente ao candidato neste estágio sem aprovação de Fernando Vitti.
- Registrar explicitamente quando uma fonte foi consultada e não retornou resultado (distinguir "não encontrado" de "não pesquisado").
- Não especular além do que foi encontrado. Se inconclusivo, declarar inconclusivo.
- Inconsistências menores (1-2 meses de diferença em datas, cargo com nome ligeiramente diferente) são amarelas, não vermelhas.
- Inconsistências maiores (empresa que não existia, cargo não verificável, processo ativo relevante) são vermelhas e requerem posição explícita na recomendação.
- O output final é documento interno. Nunca enviar ao candidato.

---

## Formato de arquivo

Salvar em `Outputs/YYYY-MM-DD_bgcheck-[nome-candidato]/bgcheck_[nome-candidato].md`.
Compartilhar via link `computer://`.

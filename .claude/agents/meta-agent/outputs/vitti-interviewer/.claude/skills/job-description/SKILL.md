---
name: job-description
description: Gera job description calibrada ao padrao Bar Raiser da Nexforce para qualquer cargo. Nao e template generico de RH — a JD e construida a partir dos criterios reais de avaliacao do Guardiao. Use quando o usuario disser "cria uma JD para [cargo]", "escreve a descricao da vaga", "preciso de uma job description para [role]", "abre a vaga de [cargo]" ou variacoes.
---

# Skill: Job Description

## Quando usar
- Abrir uma nova vaga na Nexforce
- Revisar uma JD existente que nao esta atraindo os perfis certos
- Padronizar o que e descrito publicamente com o que o Guardiao vai avaliar

---

## Informacoes obrigatorias antes de gerar

Se qualquer um destes pontos estiver faltando, use `AskUserQuestion`:

1. Cargo exato e nivel de senioridade
2. Unidade da Nexforce: Marketplace / Services / Agents
3. Modalidade: presencial SP / hibrido SP / remoto Brasil
4. Ha algo especifico que o candidato ideal precisa ter que os candidatos errados costumam nao ter? (opcional mas util)

---

## Principio de construcao

A JD do Guardiao cumpre duas funcoes simultaneas:
1. **Atrair** o candidato certo descrevendo o trabalho real, nao o ideal corporativo
2. **Filtrar** o candidato errado sendo especifica o suficiente para que quem nao se encaixa nao aplique

JDs vagas atraem candidatos vagos. Especificidade na JD reduz volume de triagem e aumenta qualidade do funil.

Regra: cada requisito listado deve ser algo que o Guardiao vai efetivamente verificar em entrevista. Nao listar "boa comunicacao" se nao vai ser testada. Nao listar "espirit de equipe" sem definir o que isso significa na pratica.

---

## Estrutura da JD

### 1. Gancho (2-3 linhas)

Nao comecar com "Somos uma empresa de tecnologia inovadora". Comecar com o que a pessoa vai fazer e por que importa.

Exemplos de gancho forte:
- "Voce vai ser responsavel por construir o pipeline de novos clientes da Nexforce no Brasil — do zero, sem leads inbound, com autonomia para definir os canais e a abordagem."
- "Voce vai implementar HubSpot para empresas B2B LatAm que nao tem processo de vendas estruturado e precisam construir do zero."

### 2. O que voce vai fazer (5-8 bullets)

Concreto, no verbo de acao. O que a pessoa faz segunda a sexta.

Nao: "Responsavel por atividades de prospeccao e desenvolvimento de novos negocios."
Sim: "Construir e qualificar pipeline de 30+ oportunidades/mes via cold outreach, LinkedIn e eventos."

### 3. O que precisamos que voce tenha (requisitos reais)

Dividir em dois blocos:

**Sem isso a conversa nao acontece:**
[3-5 itens hard. O que o Guardiao vai eliminar se nao tiver. Usar linguagem direta.]

**Vai fazer diferenca:**
[3-5 itens que distinguem o candidato born para o cargo do candidato competente. O que empurra de Score-3 para Score-4.]

### 4. O que voce vai encontrar aqui

Nao listar beneficios genericos. Descrever o contexto real de trabalho:
- Estagio da empresa
- Autonomia real vs. estrutura disponivel
- Ritmo esperado
- O que nao temos (ser honesto reduz churn no onboarding)

### 5. Sobre a Nexforce (2-3 linhas)

Mencionar as 3 unidades (Marketplace, Services, Agents) e o contexto LatAm B2B. Nao mais do que isso.

### 6. Como funciona o processo

Descrever as etapas sem revelar o metodo Bar Raiser:
- "Entrevista inicial de 25 minutos"
- "Entrevista tecnica/comportamental aprofundada de 40 minutos"
- "Checagem de referencias e oferta"

---

## Alertas por role (incluir na geracao)

**BDR / SDR:**
JD deve explicitar que e papel de hunter ativo. Se o candidato espera receber leads, vai churn. Incluir: "Voce vai construir o pipeline do zero — nao ha SDR ou marketing gerando leads para voce."

**Account Executive:**
Explicitar se e ciclo curto ou longo, ticket medio esperado, se ha base de clientes para expandir ou e newbiz puro.

**FTE / HubSpot:**
Diferenciar "usa HubSpot" de "implementa e configura HubSpot para clientes". Candidatos que so operaram o CRM internamente nao estao prontos para consultoria.

**Sales Manager:**
Explicitar se e player-coach (fecha deals + lidera time) ou so gestao pura. A maioria dos gerentes comerciais LatAm nao consegue fazer os dois bem.

**FP&A / Revenue:**
Explicitar se o papel e analitico (produz insights) ou operacional (mantem sistemas). Candidatos confundem os dois e trazem expectativas erradas.

---

## Formato de output

```
# [Cargo] - Nexforce [Unidade]
[Modalidade] | [Cidade se presencial/hibrido]

---

[GANCHO - 2-3 linhas]

---

## O que voce vai fazer

- [bullet 1]
- [bullet 2]
- [bullet 3]
- [bullet 4]
- [bullet 5]

---

## O que precisamos que voce tenha

**Sem isso a conversa nao acontece:**
- [requisito hard 1]
- [requisito hard 2]
- [requisito hard 3]

**Vai fazer diferenca:**
- [diferencial 1]
- [diferencial 2]
- [diferencial 3]

---

## O que voce vai encontrar aqui

- [contexto real 1]
- [contexto real 2]
- [contexto real 3]
- [o que nao temos / o que requer construcao]

---

## Sobre a Nexforce

[2-3 linhas: distribuicao B2B SaaS LatAm, tres unidades (Marketplace, Services, Agents), contexto cross-border.]

---

## Como funciona o processo

1. Entrevista inicial (25 min)
2. Entrevista aprofundada (40 min)
3. Checagem de referencias
4. Oferta

[Prazo medio: X semanas]
```

---

## Formato de arquivo

Salvar em `Outputs/YYYY-MM-DD_jd-[cargo]/jd_[cargo].md`.
Compartilhar via link `computer://`.

---
name: background-check
description: Background check expandido com subagents paralelos e scoring ponderado 0-100. Pesquisa 5 categorias simultaneamente e agrega em recomendacao binaria. Use quando o usuario pedir "faz o bgcheck de [nome]", "pesquisa o candidato [nome]", "background check expandido" ou variacoes.
---

# Skill: Background Check Expandido v2 -- Arquitetura com Subagents

## Arquitetura

Esta skill lanca 5 subagents em paralelo, um por categoria de pesquisa. Cada subagent e independente e retorna um score parcial (0-100) com evidencias. O agente principal agrega os scores e gera o output final.

**Por que subagents paralelos?**
As 5 categorias de pesquisa sao completamente independentes entre si. Rodar em sequencia leva 15-25 min. Em paralelo, o tempo cai para o da categoria mais lenta (~8-12 min). Nao ha dependencia de dados entre eles.

**Quando NAO usar subagents:**
- Candidato para cargo junior com bgcheck de baixo risco (so LinkedIn + judicial basico)
- CPF nao disponivel (reduz cobertura a ponto de nao justificar o custo)
- Usuario pede verificacao rapida de um ponto especifico (usar busca direta, nao bgcheck completo)

---

## Informacoes obrigatorias antes de iniciar

Se qualquer um destes pontos estiver faltando, usar `AskUserQuestion`:

1. Nome completo do candidato
2. CPF (acelera todas as buscas judiciais e cadastrais -- sem ele, cobertura judicial cai ~40%)
3. LinkedIn (URL ou nome de usuario)
4. Cargo pretendido (define profundidade de verificacao tecnica)
5. Estado de domicilio declarado (direciona busca nos tribunais estaduais)
6. Inconsistencia especifica da entrevista para investigar? (direciona foco)

---

## Pesos por categoria

| Categoria | Subagent | Peso |
|---|---|---|
| Consistencia profissional | `professional` | 30% |
| Historico judicial | `judicial` | 30% |
| Societario e fiscal | `corporate` | 20% |
| Reputacao online | `reputation` | 10% |
| Redes sociais | `social` | 10% |

Score final = soma ponderada dos 5 scores. Score abaixo de 60 = nao avanca sem verificacao adicional. Score 0 em judicial = eliminatorio independente do total.

---

## Instrucoes para cada subagent

### Subagent: professional (peso 30%)

**Missao:** Verificar consistencia entre o que o candidato declarou na entrevista e o que e publicamente verificavel sobre sua carreira.

**Fontes:** LinkedIn, Google (nome + empresa + cargo), curriculo se disponivel.

**Verificar:**
- Cargos, empresas e datas declaradas vs. perfil LinkedIn publico
- Titulos (ex: "Gerente" no CV vs. "Analista" no LinkedIn)
- Tempo nas empresas (cruzar com churn sweep do Guardiao se disponivel)
- Atividade recente: publica conteudo relevante para o cargo?
- Conexoes identificaveis como referencia

**Scoring:**
- 0 inconsistencias: 100
- 1 inconsistencia menor (ate 2 meses de diferenca, titulo ligeiramente diferente): 75
- 1-2 inconsistencias moderadas (cargo diferente, data >3 meses, empresa nao listada): 40
- Inconsistencia grave (empresa inexistente no periodo, cargo nao verificavel): 0

**Output esperado:** score (0-100) + lista de inconsistencias encontradas (ou "nenhuma") + conexoes identificadas para referencia futura.

---

### Subagent: judicial (peso 30%)

**Missao:** Mapear historico de processos judiciais nas tres fontes nacionais disponiveis.

**Fontes:** JusBrasil (jusbrasil.com.br), Escavador (escavador.com.br), CNJ (cnj.jus.br -- consulta processual nacional com CPF).

**Verificar:** Processos como reu. Tipo (trabalhista, civel, criminal). Status (ativo, encerrado). Partes.

**Scoring:**
- Nenhum processo: 100
- 1 processo trabalhista encerrado como autor (moveu contra ex-empregador): 85
- 1 processo civel encerrado como reu: 70
- 1 processo trabalhista ativo como reu (subordinado moveu contra o candidato): 40
- 2+ processos como reu: 20
- Processo criminal ou fraude: 0 (ELIMINATORIO -- score final ignorado, candidato nao avanca)

**Output esperado:** score (0-100) + lista de processos (numero, tipo, vara, partes, status, data) ou "nenhum processo encontrado nas fontes consultadas" + flag ELIMINATORIO se score = 0.

---

### Subagent: corporate (peso 20%)

**Missao:** Mapear participacao societaria e situacao fiscal.

**Fontes:** Receita Federal (receita.fazenda.gov.br), CNPJ.biz, QSA (Quadro Societario e Administradores).

**Verificar:**
- Empresas abertas em nome do candidato (ativas ou baixadas)
- Situacao cadastral (regular, irregular, suspensa, divida ativa)
- Ramo de atividade vs. cargo pretendido na Nexforce (conflito de interesse?)
- Data de abertura/encerramento

**Scoring:**
- Nenhuma empresa ou empresas encerradas em ordem: 100
- Empresa ativa sem conflito de interesse: 85
- Empresa ativa no mesmo segmento da Nexforce (possivel conflito): 40
- Empresa em situacao irregular ou com divida ativa: 30
- Empresa ativa com divida fiscal relevante e em curso: 10

**Output esperado:** score (0-100) + lista de empresas (CNPJ, nome, ramo, situacao, datas) ou "nenhuma participacao identificada".

---

### Subagent: reputation (peso 10%)

**Missao:** Verificar reputacao online em plataformas publicas de avaliacao e restricao cadastral.

**Fontes:** Glassdoor (avaliacao como gestor ou funcionario), Reclame Aqui (se teve empresa ou cargo de CS), Serasa PF -- consulta publica por nome e estado (protestos, dividas em cartorio).

**Verificar:**
- Glassdoor: mencoes especificas ao candidato como gestor (microgerenciamento, assedio, conflito)
- Reclame Aqui: padrao de reclamacoes como empreendedor
- Serasa: restricao ativa no nome

**O que ignorar:** avaliacao de empresa onde o candidato trabalhou como funcionario comum (irrelevante para o candidato em si).

**Scoring:**
- Nada encontrado relevante: 100
- Mencao negativa isolada e contextualizada: 75
- Restricao Serasa ativa: 50
- Avaliacao Glassdoor negativa especifica e recente como gestor: 30
- Padrao de reclamacoes (3+) no Reclame Aqui: 40

**Output esperado:** score (0-100) + achados especificos ou "nenhuma mencao relevante encontrada".

---

### Subagent: social (peso 10%)

**Missao:** Verificar redes sociais publicas por conteudo que contradiga o historico declarado ou seja incompativel com o cargo.

**Fontes:** Instagram (perfil publico), X/Twitter (perfil publico), Facebook (perfil publico), Google (nome + cargo + declaracao publica).

**Protocolo objetivo -- verificar apenas:**
- Conteudo que contradiz o historico declarado (ex: viagem no periodo de empresa "X")
- Declaracao publica de conflito com empregadores ou clientes (nomear empresas, acusar gestores)
- Atividade de empresa concorrente ou paralela nao declarada

**Ignorar absolutamente:** opiniao politica, vida pessoal e social sem contradicao, conteudo de humor, entretenimento, religiao.

**Scoring:**
- Nada relevante encontrado pelo protocolo ou perfis privados/inexistentes: 100
- Conteudo que contradiz historico declarado: 30
- Conflito publico com empregador anterior nomeado: 20

**Output esperado:** score (0-100) + achados especificos pelo protocolo objetivo ou "nenhum achado relevante pelo protocolo".

---

## Instrucoes para o agente principal (agregador)

Apos receber os 5 outputs:

1. Verificar se qualquer subagent retornou flag ELIMINATORIO (judicial score = 0). Se sim: interromper agregacao, emitir score final 0, recomendacao NAO AVANCA, justificar.

2. Calcular score ponderado:
```
Score final = (professional * 0.30) + (judicial * 0.30) + (corporate * 0.20) + (reputation * 0.10) + (social * 0.10)
```

3. Aplicar recomendacao por faixa:
- 85-100: AVANCA -- sem restricao
- 70-84: AVANCA COM MONITORAMENTO -- registrar ponto de atencao
- 60-69: VERIFICACAO ADICIONAL -- confrontar candidato antes de oferta
- Abaixo de 60: NAO AVANCA sem investigacao aprofundada

4. Gerar output consolidado no formato abaixo.

---

## Formato de output

```markdown
# Background Check -- [Nome] (v2)
Cargo: [role] | Data: [YYYY-MM-DD] | CPF: [sim/nao] | Subagents: 5 paralelos
Fontes: LinkedIn, Google, JusBrasil, Escavador, CNJ, Receita Federal, CNPJ.biz, Glassdoor, Reclame Aqui, Serasa PF, Instagram, X

---

## Score Final: [0-100] -- [RECOMENDACAO]

[1-2 linhas sobre o achado mais relevante que determinou o score]

---

## Detalhamento por categoria

| Categoria | Score | Peso | Contribuicao |
|---|---|---|---|
| Consistencia profissional | /100 | 30% | |
| Historico judicial | /100 | 30% | |
| Societario e fiscal | /100 | 20% | |
| Reputacao online | /100 | 10% | |
| Redes sociais | /100 | 10% | |
| **TOTAL** | | | **/100** |

---

## Achados por categoria

### Consistencia profissional
[Inconsistencias ou "Nenhuma inconsistencia identificada."]

### Historico judicial
[Processos ou "Nenhum processo encontrado."]

### Societario e fiscal
[Empresas ou "Nenhuma participacao identificada."]

### Reputacao online
[Achados ou "Nenhuma mencao relevante."]

### Redes sociais
[Achados ou "Nenhum achado relevante pelo protocolo."]

---

## Pontos para confrontar com o candidato

[Se score < 85: o que perguntar, como enquadrar. Se score >= 85: "Nenhum."]

---

## Recomendacao

[AVANCA / AVANCA COM MONITORAMENTO / VERIFICACAO ADICIONAL / NAO AVANCA]
Justificativa: [2-3 linhas]

Referências verificaveis identificadas para contato formal: [nomes + empresa]
```

---

## Regras

- Todo subagent registra explicitamente fontes consultadas que nao retornaram resultado.
- Sem CPF: declarar limitacao no inicio do output, reduzir confianca judicial em 40%.
- Nao especular. Inconclusivo = declarar inconclusivo.
- Output e documento interno. Nao enviar ao candidato.
- Quando bgcheck v2 for validado em 3+ candidatos reais, aplicar em `../vitti-interviewer/.claude/skills/background-check/SKILL.md`.

---

## Formato de arquivo

Salvar em `outputs/YYYY-MM-DD_bgcheck-[nome].md`.
Compartilhar via link `computer://`.

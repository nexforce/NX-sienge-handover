---
name: reference-check
description: Conduz checagem de referencias profissionais estruturada para um candidato. Gera roteiro de perguntas calibrado ao score e aos gaps da avaliacao, coleta respostas e produz relatorio. Use quando o usuario disser "faz a checagem de referencia", "quero checar as referencias do candidato", "liga para os ex-gestores", "reference check do [nome]" ou variacoes.
---

# Skill: Reference Check

## Quando usar
- Candidato aprovado com Score 3 ou 4 no processo Guardiao e precisa de validacao adicional
- Score 5 com gap tecnico nao verificado em entrevista
- Qualquer candidato para cargo de lideranca (Head, Manager, Director)

---

## Informacoes obrigatorias antes de iniciar

Se qualquer um destes pontos estiver faltando, use `AskUserQuestion`:

1. Nome completo do candidato e cargo pretendido
2. Score Guardiao e os gaps documentados no relatorio de avaliacao
3. Pelo menos um contato de referencia (nome, cargo, empresa, telefone ou LinkedIn)
4. Preferencia de formato: roteiro para o usuario conduzir, ou relatorio estruturado apos coleta de respostas

---

## Logica de calibracao de perguntas

O roteiro nao e generico. Ele e construido a partir dos gaps identificados na avaliacao do Guardiao.

### Perguntas obrigatorias em toda referencia (independente de score):

1. "Como voce descreveria o estilo de trabalho de [nome] no dia a dia?"
2. "Qual foi o maior resultado que [nome] entregou enquanto trabalhou com voce?"
3. "Se voce pudesse contratar [nome] de volta hoje, contrataria? Por que?"
4. "O que [nome] precisaria desenvolver para dar o proximo salto na carreira?"
5. "Como [nome] reagia quando as coisas nao iam bem, quando tinha pressao ou quando o resultado estava abaixo?"

### Perguntas adicionais por gap identificado:

| Gap no relatorio Guardiao | Pergunta calibrada |
|---|---|
| Consistencia de versao / integridade | "Em algum momento voce sentiu que [nome] nao estava sendo completamente transparente sobre uma situacao?" |
| Culpa externa no fracasso | "Quando um projeto nao dava certo, como [nome] reagia? Assumia a parte dele ou tendia a explicar pelo contexto?" |
| Numeros ausentes ou extraidos com dificuldade | "Voce conseguia acompanhar os resultados de [nome] com facilidade? Ele/ela reportava metricas de forma proativa?" |
| Prolixidade ou comunicacao | "Como era a comunicacao de [nome] com clientes ou stakeholders? Tinha episodios em que isso gerou atritos?" |
| Churn alto / padrao de saida | "A saida de [nome] foi uma surpresa para voce ou algo esperado? O que levou a isso na sua leitura?" |
| Passividade em cargo hunter | "Voce via [nome] buscando ativamente oportunidades, gerando pipeline proprio, ou ele/ela respondia mais ao que chegava?" |
| Fit de gestao | "Como era o relacionamento de [nome] com a lideranca? Havia tensoes recorrentes?" |
| Uso de IA nao verificado | "Voce via [nome] usando ferramentas de produtividade ou IA de forma ativa no trabalho?" |

### Perguntas de fechamento:

- "Se eu disser que [nome] descreveu a saida de [empresa] como [versao do candidato] - isso bate com a sua leitura?"
  Finalidade: validar consistencia de versao. Usar a versao exata que o candidato deu na entrevista.

- "Ha algo que eu deveria saber sobre [nome] que nao te perguntei?"

---

## Modo de operacao

### Modo A - Roteiro para o usuario conduzir

Gerar roteiro formatado, pronto para imprimir ou ter em tela durante a ligacao.

Incluir:
- Contexto da referencia no topo (quem e quem, relacao, periodo)
- Perguntas em ordem logica: abertura, resultados, comportamento, fechamento
- Espaco para notas apos cada pergunta
- Dicas de probe para cada pergunta que pode gerar resposta defensiva

### Modo B - Relatorio apos coleta

Usuario conduz a referencia e fornece as respostas brutas. Processar e gerar:
- Resumo estruturado por dimensao
- Alertas de inconsistencia entre o que o referenciador disse e o que o candidato disse na entrevista
- Score de referencia: CONFIRMA (alinha com avaliacao), NEUTRO (inconclusivo), CONTRADIZ (diverge em dimensao relevante)
- Recomendacao final: avancar, avancar com caveat, ou reabrir avaliacao

---

## Formato de output - Roteiro (Modo A)

```
# Roteiro de Referencia - [Nome do Candidato]
Cargo pretendido: [role] | Score Guardiao: [N] | Data: [YYYY-MM-DD]

Referenciador: [Nome] | Cargo: [cargo] | Empresa: [empresa] | Periodo de convivencia: [periodo]
Relacao: [gestor direto / pares / subordinado / cliente]

---

## Abertura (2 min)
"[Nome do referenciador], obrigado pelo tempo. Estou avaliando [candidato] para [cargo] e quero entender melhor o trabalho dele. Vou fazer algumas perguntas diretas - pode ser igualmente direto, isso me ajuda muito mais do que respostas positivas genericas."

---

## Bloco 1 - Resultados (8 min)
[Perguntas obrigatorias 1 e 2 + pergunta de numeros se gap identificado]

---

## Bloco 2 - Comportamento sob pressao (8 min)
[Pergunta 5 + perguntas calibradas aos gaps da avaliacao]

---

## Bloco 3 - Consistencia de versao (5 min)
[Pergunta de fechamento de versao com a narrativa exata do candidato]

---

## Bloco 4 - Fechamento (3 min)
[Pergunta de recontratacao + pergunta aberta final]

---

## Notas internas (nao ler em voz alta)
[Alertas para o entrevistador: o que observar, onde o candidato pode ter distorcido a versao]
```

---

## Formato de output - Relatorio de Referencia (Modo B)

```
# Relatorio de Referencia - [Nome do Candidato]
Referenciador: [Nome] | Relacao: [tipo] | Data: [YYYY-MM-DD]
Score de referencia: [CONFIRMA / NEUTRO / CONTRADIZ]

---

## Dimensoes avaliadas

| Dimensao | Avaliacao do referenciador | Alinhamento com Guardiao |
|---|---|---|
| Resultados | [resumo] | [CONFIRMA / NEUTRO / CONTRADIZ] |
| Accountability | [resumo] | [CONFIRMA / NEUTRO / CONTRADIZ] |
| Comportamento sob pressao | [resumo] | [CONFIRMA / NEUTRO / CONTRADIZ] |
| Comunicacao | [resumo] | [CONFIRMA / NEUTRO / CONTRADIZ] |
| [Gap especifico investigado] | [resumo] | [CONFIRMA / NEUTRO / CONTRADIZ] |

---

## Inconsistencias identificadas

[Lista de divergencias entre o que o candidato disse e o que o referenciador disse. Cada item com: dimensao, versao do candidato, versao do referenciador, nivel de preocupacao (baixo/medio/alto).]

[Se nenhuma: "Nenhuma inconsistencia relevante identificada."]

---

## Recomendacao

[AVANCAR]: referencias confirmam a avaliacao. Sem ressalvas adicionais.
[AVANCAR COM CAVEAT]: [descrever o que ficou inconclusivo ou levemente divergente e como mitigar]
[REABRIR AVALIACAO]: [descrever a inconsistencia critica que justifica revisao do score]

---

## Mensagem de sintese para o processo

[2-3 linhas diretas para registrar no sistema Nexforce. Tom de briefing interno.]
```

---

## Formato de arquivo

Salvar em `Outputs/YYYY-MM-DD_[nome-candidato]/reference-check_[nome-candidato].md`.
Compartilhar via link `computer://`.

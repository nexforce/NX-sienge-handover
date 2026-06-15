---
name: onboarding-briefing
description: Gera briefing de onboarding para o gestor direto de um candidato aprovado. Alimentado pelo relatorio de avaliacao do Guardiao. Use quando o usuario disser "gera o briefing de onboarding", "prepara o gestor para receber [nome]", "o que o lider precisa saber antes do primeiro dia", "onboarding do [candidato]" ou variacoes.
---

# Skill: Onboarding Briefing

## Quando usar
- Candidato avancou para oferta ou oferta foi aceita (Score 3, 4 ou 5)
- Gestor direto vai receber o profissional e precisa de contexto estruturado
- Particularmente critico para Score-3: aprovados com ressalvas precisam de atencao especifica nos primeiros 90 dias

---

## Informacoes obrigatorias antes de gerar

Se qualquer um destes pontos estiver faltando, use `AskUserQuestion`:

1. Nome do candidato e cargo
2. Nome do gestor direto que vai receber o briefing
3. Relatorio de avaliacao do Guardiao (texto ou arquivo) — ou os campos do processo Nexforce preenchidos
4. Data prevista de inicio

---

## Processo de geracao

### Passo 1 — Extrair do relatorio

Ler o relatorio de avaliacao do Guardiao e extrair:
- Score final e rotulo
- Pontos fortes verificados com evidencia de transcricao
- Pontos fracos documentados com impacto esperado na funcao
- Gaps que ficaram inconclusos
- Resultado da referencia (se houver)
- Resultado do bgcheck (se houver)

### Passo 2 — Traduzir para linguagem de gestao

O relatorio do Guardiao e tecnicamente preciso mas voltado para o processo de selecao.
O briefing de onboarding precisa ser acionavel para o gestor no dia a dia.

Regra de traducao:
- "Comunicacao prolixidade injustificada" -> "Tende a dar contexto demais em reunioes. Estabeleca o formato esperado no primeiro 1:1."
- "Numeros extraidos com esforco" -> "Nao vai reportar metricas proativamente. Exija acompanhamento semanal com formato fixo desde o inicio."
- "Culpa parcialmente externa no fracasso" -> "Quando algo nao funcionar, pode atribuir ao contexto. Pergunte explicitamente o que ele faria diferente."
- "Churn historico de 60% das passagens < 1 ano" -> "Historico sugere sensibilidade a frustracao. Onboarding claro sobre o que e e o que nao e flexivel evita surpresas nos primeiros 90 dias."

### Passo 3 — Estruturar plano de 90 dias

Com base nos gaps documentados, sugerir foco por periodo:
- Semana 1: o que o gestor precisa cobrir no primeiro 1:1 e na semana de imersao
- Dias 30: primeira verificacao de alinhamento — o que checar
- Dias 60: verificacao de independencia — o que esperar
- Dias 90: primeira avaliacao de performance — criterios claros com base no score e cargo

---

## Formato de output

```
# Briefing de Onboarding - [Nome do Candidato]
Cargo: [role] | Nivel: [nivel] | Score Guardiao: [N] - [rotulo]
Gestor direto: [Nome do gestor] | Inicio previsto: [data]
Gerado em: [YYYY-MM-DD]

---

## O que este candidato traz

[3-5 pontos fortes verificados em entrevista, traducao para linguagem de gestao. Cada item: o que foi observado + o que isso significa no dia a dia do time.]

Exemplo: "Comunicacao estruturada e objetiva — em clientes e reunioes internas, chega ao ponto sem rodeios. Vai funcionar bem em contextos de alta pressao ou entrega rapida."

---

## O que requer atencao nos primeiros 90 dias

[2-4 areas de atencao. Cada item: gap documentado + como se manifesta na pratica + acao recomendada para o gestor.]

[Se Score-3:] FLAG: candidato aprovado com ressalvas. Os itens abaixo precisam ser acompanhados ativamente. Aprovacao dupla do lider direto e do People antes de qualquer revisao de escopo ou promovao nos primeiros 6 meses.

---

## Plano de 90 dias

### Semana 1

Cobrir no primeiro 1:1 (obrigatorio):
- [item 1]
- [item 2]
- [item 3]

Deixar claro desde o inicio:
- [expectativas de formato, ritmo, comunicacao que o gestor precisa explicitar]

### Dia 30 — Checkpoint

O que verificar:
- [criterio 1 com base nos gaps]
- [criterio 2]

Sinal de alerta: [o que indicaria que um gap esta se manifestando]

### Dia 60 — Checkpoint

O que verificar:
- [criterio de independencia para o cargo]
- [criterio de entrega]

### Dia 90 — Primeira avaliacao

Criterios de sucesso para este perfil especifico:
- [criterio 1]
- [criterio 2]
- [criterio 3]

O que seria considerado abaixo do esperado dado o perfil: [definicao clara]

---

## Perguntas para os primeiros 1:1s

[3-5 perguntas calibradas para o gestor fazer nos primeiros 30 dias, baseadas nos gaps e na necessidade de verificacao dos pontos inconclusos da avaliacao.]

1. "[Pergunta exata]"
   Finalidade: [o que pretende verificar]

---

## Informacoes do processo (nao compartilhar com o candidato)

Score Guardiao: [N] | Avaliador: Guardiao (Bar Raiser Nexforce)
Referencia: [REALIZADA - CONFIRMA / REALIZADA - NEUTRO / NAO REALIZADA]
Bgcheck: [APROVADO (score X/100) / NAO REALIZADO]

[Notas internas: informacoes que o People e o gestor precisam saber mas que nao devem ser comunicadas ao candidato. Ex: processo paralelo ativo no momento da contratacao, flag de salary expectation para revisao futura, gaps que precisam de validacao tecnica pos-contratacao.]
```

---

## Formato de arquivo

Salvar em `Outputs/YYYY-MM-DD_[nome-candidato]/onboarding-briefing_[nome-candidato].md`.
Compartilhar via link `computer://`.

A versao para o gestor direto nao deve incluir o bloco "Informacoes do processo". Gerar dois arquivos se necessario: um completo (People + CEO) e um para o gestor.

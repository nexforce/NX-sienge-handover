---
name: salary-benchmark
description: Pesquisa benchmark salarial de mercado para um cargo e gera recomendacao de faixa para a Nexforce. Use quando o usuario disser "qual e o salario de mercado para [cargo]", "benchmark salarial", "a expectativa do candidato esta dentro da faixa?", "quanto pagar para [role]" ou variacoes.
---

# Skill: Salary Benchmark

## Quando usar
- Antes de abrir uma vaga: definir faixa de remuneracao
- Durante o processo: verificar se a expectativa do candidato e compativel com mercado
- Apos oferta recusada por salario: entender se o problema e a faixa ou o candidato

---

## Informacoes obrigatorias antes de iniciar

Se qualquer um destes pontos estiver faltando, use `AskUserQuestion`:

1. Cargo exato e nivel de senioridade (ex: BDR Jr, AE Pleno, FTE HubSpot Senior, Sales Manager)
2. Cidade ou modalidade (Sao Paulo presencial, remoto Brasil, hibrido SP)
3. Contexto de uso: (a) abrir vaga, (b) avaliar expectativa de candidato especifico, (c) revisar grade interna

Se contexto (b): informar tambem a expectativa salarial do candidato.

---

## Processo de pesquisa

### Fontes a consultar (em ordem de prioridade):

1. **Glassdoor BR** - buscar cargo + cidade, coletar faixa median e percentil 25-75
2. **LinkedIn Salary** - verificar faixa para o cargo no Brasil
3. **Pesquisa web publica** - buscar "[cargo] salario Brasil [ano atual]" em fontes como Catho, Vagas.com, Robert Half, Michael Page, PageGroup
4. **Contexto Nexforce** - ajustar para empresa B2B tech LatAm, stage de crescimento (nao enterprise, nao early-stage): tipicamente no percentil 50-65 do mercado de tech SP

### Ajustes por modalidade:

| Modalidade | Ajuste |
|---|---|
| Sao Paulo presencial | Base da pesquisa |
| Remoto Brasil (fora SP) | Desconto de 10-20% em relacao a SP para cargos operacionais; sem desconto para cargos senior/estrategicos |
| Hibrido SP | Igual ao presencial SP |

### Ajustes por nivel:

| Nivel | Posicionamento tipico |
|---|---|
| Junior | Percentil 40-55 |
| Pleno | Percentil 50-65 |
| Senior | Percentil 55-70 |
| Head / Manager | Percentil 60-75 |

---

## Componentes de remuneracao a mapear

Para cargos comerciais (BDR, AE, SM):
- Fixo mensal
- Variavel mensal (OTE - On Target Earnings): estrutura tipica de mercado
- Beneficios-padrao do segmento (VR, VA, plano de saude, home office)

Para cargos tecnicos/operacionais (FTE, Revenue, FP&A):
- Fixo mensal
- Bonus anual se aplicavel
- Beneficios

---

## Formato de output

```
# Benchmark Salarial - [Cargo] | [Nivel] | [Cidade/Modalidade]
Data da pesquisa: [YYYY-MM-DD]

---

## Faixa de mercado

| Percentil | Fixo mensal (CLT) | OTE mensal (se comercial) |
|---|---|---|
| P25 (abaixo da media) | R$ [X] | R$ [X] |
| P50 (media de mercado) | R$ [X] | R$ [X] |
| P75 (acima da media) | R$ [X] | R$ [X] |

Fontes: [listar fontes consultadas com data]

---

## Recomendacao para a Nexforce

Faixa-alvo: R$ [X] a R$ [Y] fixo + [estrutura variavel se aplicavel]
Posicionamento: [percentil X-Y do mercado de tech SP]

Justificativa: [2-3 linhas — por que essa faixa faz sentido para o estagio e perfil da Nexforce]

---

[SE CONTEXTO (b) — AVALIACAO DE CANDIDATO ESPECIFICO]

## Avaliacao da expectativa do candidato

Candidato: [Nome] | Score Guardiao: [N]
Expectativa declarada: R$ [X] fixo [+ varivel se informado]

Status: [DENTRO DA FAIXA / ACIMA DA FAIXA / ABAIXO DA FAIXA]

[Se ACIMA DA FAIXA:]
Diferenca: R$ [X] acima do P75 da Nexforce (P[N] de mercado).
Recomendacao: [negociar / nao avancar por constraint de grade / abrir excecao se score 5]

[Se DENTRO DA FAIXA:]
Expectativa dentro do P[X]-P[Y]. Sem blockers de remuneracao para fechar o processo.

[Se ABAIXO DA FAIXA:]
Expectativa abaixo do P25. Confirmar se o candidato entendeu o escopo completo da posicao antes de fechar — risco de insatisfacao pos-contratacao.

---

## Estrutura variavel recomendada (cargos comerciais)

Fixo: R$ [X]
Variavel mensal no target: R$ [Y]
OTE no target: R$ [X+Y]
Upside (200% de meta): R$ [Z]
Estrutura: [descricao simples do modelo de comissao recomendado]
```

---

## Formato de arquivo

Salvar em `Outputs/YYYY-MM-DD_benchmark-[cargo]/benchmark_[cargo].md`.
Compartilhar via link `computer://`.

Se parte de um processo de candidato, salvar em `Outputs/YYYY-MM-DD_[nome-candidato]/benchmark_[nome-candidato].md`.

---
name: process-document
description: Use when generating or reviewing documentation for any of the 15 Sienge RaaS processes. Provides mandatory structure, field definitions, content organization (Functional vs Technical view), and quality criteria for process documents.
---

## Regras para geração dos documentos

1. **Nunca inventar.** Nenhuma regra de negócio, processo comercial, fluxo, condição ou comportamento deve ser escrito sem fonte confirmada (ClickUp ou HubSpot). Se não foi identificado com clareza, não vai no corpo do documento — vai em **Pontos a Validar**. Ambiguidade também vai para lá: se a fonte existe mas a interpretação é incerta, registrar o que foi encontrado e o que falta confirmar.
2. **HubSpot é a fonte de verdade para o estado atual.** O ClickUp documenta a intenção original e as mudanças — o HubSpot mostra o que está de fato ativo.
3. **Tickets de estabilização têm prioridade.** Quando há conflito entre o épico original e um ticket de estabilização posterior, o ticket de estabilização prevalece.
4. **Separar SaaS de LU.** Processos que diferem entre as modalidades devem ter sub-seções explícitas.
5. **Pontos a Validar é seção obrigatória e sempre a última.** Toda lacuna, inferência, contradição entre fontes ou ponto dependente de confirmação humana vai aqui — com texto preciso sobre o que é desconhecido e quem deve confirmar. Uma lacuna documentada como lacuna é mais útil do que uma lacuna preenchida com suposição.

# Estrutura obrigatória para cada processo

| Campo                      | Conteúdo esperado                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| **Nome do processo**       | Usar o nome da matriz de processos.                                                         |
| **Objetivo**               | Explicar para que o processo existe.                                                        |
| **Contexto de negócio**    | Descrever qual dor, necessidade ou operação o processo resolve.                             |
| **Fluxo operacional**      | Passo a passo resumido do processo.                                                         |
| **Objetos envolvidos**     | Empresas, contatos, negócios, tickets, contratos, Grupo de Contratos, Portfólio etc.        |
| **Propriedades críticas**  | Campos obrigatórios, campos calculados, campos usados em regras, integrações e minutas.     |
| **Workflows envolvidos**   | Apenas os workflows conectados ao processo, explicando o papel de cada um.                  |
| **Integrações envolvidas** | Oracle, RD Station, Freshdesk, Projuris, Cobran SaaS ou outras, quando aplicável.           |
| **Cards / customizações**  | UI Extensions, cards customizados, custom codes ou telas utilizadas no processo.            |
| **Regra de negócio**       | Condições, cálculos, exceções, decisões e critérios funcionais.                             |
| **Critério de validação**  | Como saber que o processo funcionou corretamente.                                           |
| **Riscos e dependências**  | O que pode quebrar, quais dados precisam existir e quais pontos dependem de outro processo. |
| **Materiais de apoio**     | Links de tasks, comentários, vídeos, Fathom, Miro, planilhas, documentos ou evidências.     |
| **Pontos a validar**       | Dúvidas ou lacunas que precisam de validação do responsável ou da Sienge.                   |

## Organização do conteúdo

Sempre separar:

### Visão Funcional

Objetivo, contexto, fluxo operacional, regras de negócio e critérios de validação.

### Visão Técnica

Workflows, propriedades, integrações, customizações, automações e dependências técnicas.

Para cada workflow documentar:

- Nome do workflow
- Objetivo
- Objeto HubSpot associado
- Evento de disparo
- Principais ações executadas
- Dependências relevantes

# Critérios de qualidade da entrega

- Cada processo deve ter começo, meio e fim compreensíveis para uma pessoa que não participou da implementação.
- Toda automação citada deve estar associada a um objetivo de negócio.
- Toda integração citada deve explicar:
  - Entrada;
  - Saída;
  - Objeto impactado;
  - Risco principal.
- Toda regra inferida, incompleta ou ambígua deve ir para **Pontos a Validar** — nunca para o corpo do documento como se fosse fato confirmado.
- Não misturar documentação funcional com documentação de código sem sinalizar a diferença.
- Evitar excesso de detalhe técnico quando o conteúdo não ajudar a operação do cliente.
- Manter nomes de processos, objetos, propriedades e sistemas consistentes com HubSpot e ClickUp.

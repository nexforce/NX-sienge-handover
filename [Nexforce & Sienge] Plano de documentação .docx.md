**\[Interno\] Documentação de Handover \- Sienge**

*Projeto Sienge | Escopo da documentação*

# **1\. Objetivo do material**

Este documento orienta o time responsável na criação da primeira versão da documentação de handover do projeto Sienge. **A V1 deve consolidar o que foi desenvolvido a partir dos processos mapeados, conectando regras de negócio, configurações HubSpot, integrações, customizações, responsáveis, fontes de consulta e lacunas de informação.**

# **2\. Diretriz central de documentação**

* A documentação deve ser organizada por processos de negócio, não por arquitetura HubSpot isolada.  
* Workflows, propriedades, objetos, cards, integrações e custom codes devem aparecer dentro do processo em que atuam.  
* Não criar uma lista solta de workflows, propriedades ou objetos. O valor da documentação está em explicar como cada elemento sustenta o processo.  
* Toda inferência feita pela IA deve ser marcada como ponto a validar, quando não houver evidência clara nas fontes.  
* Quando houver conflito entre tarefa, comentário, reunião ou configuração atual do HubSpot, sinalizar divergência e acionar o responsável do processo.  
* Separar regra de negócio de documentação técnica: regra funcional fica no processo; código, API e componentes customizados ficam em seção técnica própria.

# **3\. Como o time deve atuar**

| Etapa | Direcionamento |
| :---- | :---- |
| **1\. Inventariar fontes** | Mapear tarefas, comentários, documentos, planilhas, transcrições, vídeos e registros associados a cada processo. |
| **2\. Consolidar por processo** | Agrupar informações por área macro e processo, evitando duplicidade entre tarefas que tratam do mesmo tema. |
| **3\. Extrair regras de negócio** | Identificar gatilhos, condições, exceções, propriedades críticas, objetos impactados e validações esperadas. |
| **4\. Conectar componentes técnicos** | Relacionar workflows, integrações, cards, custom codes, APIs e telas ao processo correspondente. |
| **5\. Criar a V1** | Gerar uma primeira versão navegável, com texto claro, estrutura padrão e pontos pendentes destacados. |
| **6\. Sinalizar lacunas** | Marcar informações ausentes, conflitantes ou dependentes de validação humana. |
| **7\. Preparar validação** | Indicar, em cada seção, quem deve validar o conteúdo e quais dúvidas precisam ser respondidas. |

# **4\. Fontes e ferramentas que podem ser acessadas**

| Ferramenta / Fonte | Uso esperado na documentação |
| :---- | :---- |
| **ClickUp** | Tarefas, descrições, comentários, status, responsáveis, links de evidência e vídeos anexados às tasks. |
| **HubSpot** | Configuração atual de objetos, propriedades, pipelines, workflows, associações, permission sets, cards, views e integrações. |
| **Fathom** | Transcrições de reuniões, alinhamentos, decisões, dúvidas e mudanças de regra discutidas com cliente ou time interno. |
| **Slack** | Alinhamentos pontuais, decisões operacionais, prioridades e validações rápidas com cliente/time. |
| **Google Drive / Docs / Sheets** | Planilhas de mapeamento, materiais técnicos, documentação parcial, regras de negócio e insumos de handover. |
| **Miro / desenhos de processo** | Desenhos de To-Be, arquitetura, fluxos funcionais e regras construídas durante o projeto. |
| **CSV de tarefas mapeadas** | Base inicial para agrupar entregas por processo, identificar lacunas e garantir cobertura mínima. |

# **5\. Processos a documentar e responsáveis** 

| Título do processo | Área macro | Processo | Ponto focal NX |
| ----- | ----- | ----- | ----- |
| 1.0 \- Pré Vendas | Pré-vendas | Inbound / Outbound / Eventos / Inside Sales / Canais | Elias |
| 2.0 \- Vendas e Contratação | Vendas e Contratação | Aquisição / Nova Venda / Expansão / Retração | Vinícius Braz |
| 2.1 \- Vendas e Contratação | Vendas e Contratação | Contrato Grupo de Contratos Portfólio Anuentes | Vanoni |
| 2.2 \- Vendas e Contratação \[Dev\] | Vendas e Contratação | Cards Customizados | Dev |
| 3.0 \- Aprovações | Aprovações | Orçamentos / Assinatura de Contrato | João Pássaro |
| 4.0 \- Precificação | Precificação | Regras Nova Venda / Expansão / Retração | Vanoni |
| 4.1 \- Precificação \[Dev\] | Precificação | Desenvolvimento Nova Venda / Expansão / Retração | Dev |
| 5.0 \- Minutas | Minutas | Regras | Moisés |
| 5.1 \- Minutas \[Dev\] | Minutas | Desenvolvimento | Jorge |
| 6.0 \- CS e Atendimento | CS e Atendimento | Atendimento Reativo Engajamento Onboarding Retenção Retração CS | Moisés |
| 7.0 KPIs e Indicadores | KPIs e Indicadores | Cálculos / NPS / CSAT / Lifetime | Moisés |
| 8\. 0 Governança e Permissões | Governança e Permissões | Todos | Pedro Soave |
| 8.1 \- Integrações Oracle | Integrações | Oracle | Vanoni |
| 8.2 \- Integrações | Integrações | RD Station | Elias |
| 8.3 \- Integrações | Integrações | Freshdesk | Moisés |
|  |  |  |  |

#    **7\. Estrutura obrigatória para cada processo**

| Campo | Conteúdo esperado |
| :---- | :---- |
| **Nome do processo** | Usar o nome da matriz de processos. |
| **Objetivo** | Explicar para que o processo existe. |
| **Contexto de negócio** | Descrever qual dor, necessidade ou operação o processo resolve. |
| **Fluxo operacional** | Passo a passo resumido do processo. |
| **Objetos envolvidos** | Empresas, contatos, negócios, tickets, contratos, Grupo de Contratos, Portfólio etc. |
| **Propriedades críticas** | Campos obrigatórios, campos calculados, campos usados em regras, integrações e minutas. |
| **Workflows envolvidos** | Apenas os workflows conectados ao processo, explicando o papel de cada um. |
| **Integrações envolvidas** | Oracle, RD Station, Freshdesk, Projuris, Cobran SaaS ou outras, quando aplicável. |
| **Cards / customizações** | UI Extensions, cards customizados, custom codes ou telas utilizadas no processo. |
| **Regra de negócio** | Condições, cálculos, exceções, decisões e critérios funcionais. |
| **Critério de validação** | Como saber que o processo funcionou corretamente. |
| **Riscos e dependências** | O que pode quebrar, quais dados precisam existir e quais pontos dependem de outro processo. |
| **Materiais de apoio** | Links de tasks, comentários, vídeos, Fathom, Miro, planilhas, documentos ou evidências. |
| **Pontos a validar** | Dúvidas ou lacunas que precisam de validação do responsável ou da Sienge. |

# **8\. Critérios de qualidade da entrega**

* Cada processo deve ter começo, meio e fim compreensíveis para uma pessoa que não participou da implementação.  
* Toda automação citada deve estar associada a um objetivo de negócio.  
* Toda integração citada deve explicar entrada, saída, objeto impactado e risco principal.  
* Toda regra inferida ou incompleta deve estar marcada como ponto a validar.  
* Não misturar documentação funcional com documentação de código sem sinalizar a diferença.  
* Evitar excesso de detalhe técnico quando o conteúdo não ajudar a operação do cliente.  
* Manter nomes de processos, objetos, propriedades e sistemas consistentes com HubSpot e ClickUp.

# **9\. Riscos e dependências para execução**

| Risco / Dependência | Impacto |
| :---- | :---- |
| **Conteúdo disperso** | Informações podem estar em tarefas, comentários, vídeos no ClickUp, Fathom, Slack, Miro e documentos técnicos parciais. |
| **Regras não formalizadas** | Parte das regras foi discutida em vídeo ou comentário, sem documentação estruturada. |
| **Mudanças ao longo do projeto** | Algumas regras foram alteradas durante testes e estabilização; a V1 precisa refletir o estado mais atual. |
| **Limite da IA** | A IA pode organizar e sugerir estrutura, mas não deve assumir regra de negócio sem evidência. |
| **Validação humana obrigatória** | Responsáveis dos processos precisam revisar a V1 para confirmar regra, escopo e consistência. |
|  |  |

# **10\.  Próximos passos imediatos**

1. Fabiane compartilhar este direcionamento com o time responsável  
2. Time responsável acesso às fontes necessárias: ClickUp, HubSpot, Fathom, Drive/Docs/Sheets e materiais técnicos existentes.  
3. Time responsável agrupamento das tarefas por processo, usando a matriz deste documento como referência.  
4. Responsáveis dos processos ficarem disponíveis para dúvidas objetivas durante a criação da V1.  
5. Fabiane consolidar dúvidas recorrentes e pontos sem evidência para levar à Sienge durante a validação da estrutura.
# **Escopo de Desenvolvimento**

## **Criação e Atualização de Itens de Linha (Line Items) a partir do objeto “Grupo de Contrato” na HubSpot e suas propriedades**

---

## **1\. Objetivo do desenvolvimento**

Implementar um processo automatizado (via **Workflow \+ Custom Code**) que:

1. Crie e mantenha atualizados os **itens de linha** de faturamento associados ao objeto **Grupo de Contrato**.  
2. Utilize como fonte de dados as informações já consolidadas no **Grupo de Contrato**, que são alimentadas pela integração com o sistema externo (Oracle).  
3. Crie os itens de linha a partir da biblioteca de produtos cadastrados na Hubspot.  
4. Garanta que alterações contratuais (expansões, reduções, troca de sistemas) sejam refletidas corretamente nos itens de linha do Grupo de Contrato.  
5. Não altere, em hipótese alguma, os itens de linha associados ao **Deal** (itens de venda / histórico comercial).

Os itens de linha criados neste escopo representam **faturamento recorrente ou contratado**, e não histórico de venda. Esses dados são alimentados via integração com a Oracle, dentro do registro de Grupo de Contrato

---

## **2\. Premissas e definições de arquitetura**

### **2.1 Identificação do Grupo de Contrato**

* Cada Grupo de Contrato é identificado por um **ID único de integração (**`nr_contrato_hs`), utilizado para criação e atualização do registro na HubSpot.  
* O desenvolvimento parte do princípio de que o Grupo de Contrato já existe e está atualizado antes da execução do workflow, com todas as propriedades preenchidas.  
  * [Planilha de propriedades](https://docs.google.com/spreadsheets/d/1B7zPph1HgeNlPWVIftQZQtMkAQ4iu-nEC5eWBoAiEfg/edit?gid=1558384052#gid=1558384052)\> Aba “De-Para Oracle”

### **2.2 Estratégia de atualização dos itens de linha**

Não existe um identificador único que permita o *match* direto entre itens de linha da HubSpot e itens do sistema externo (itens de contrato). Por esse motivo, o processo adotado será:

1. Limpar todos os itens de linha atualmente associados ao Grupo de Contrato.  
2. Recriar integralmente os itens de linha com base no estado atual do Grupo de Contrato, baseado nas propriedades preenchidas pela integração e na de “Sistema”, correlacionando esses dados aos produtos cadastrados na biblioteca de produtos da Hubspot.

Essa abordagem reduz significativamente a complexidade do código e evita múltiplas regras de comparação e atualização item a item. Além disso, essas regras e arquitetura mais complexas, demandaria obrigatoriamente de objetos customizados, o que geraria custos extras com add-on de limite de objetos customizados na Hubspot.

### **2.3 Modalidade de aquisição (regra de negócio)**

Para um mesmo Grupo de Contrato:

* existem modalidades **SaaS**  
* existem modalidades **Manutenção (licença única / legado)**  
* existem modalidades que misturam **SaaS** e **Manutenção**  
  * Nesse caso, a regra deve ser considerada da seguinte forma:  
    * Split de itens de linha com o valor de **SaaS**  
    * Criar item de linha **Manutenção Mensal** com o valor de **Manutenção**

### **2.4 Split de itens** 

Para um Grupo de Contrato que possui valores preenchidos nas propriedades relacionadas a:

* SAAS  
* MANUTENCAO  
* CONNECTORS

*\*Foi identificado que os valores recebidos pela Oracle não batem 100% com o valor de tabela. Por esse motivo, ficou alinhado com a Sienge de que pode haver divergência entre o valor real e o valor exibido.*  
---

## **3\. Dados de entrada (lidos no objeto Grupo de Contrato)**

### **3.1 Propriedades obrigatórias**

O código deve considerar, no mínimo, as seguintes informações no Grupo de Contrato:

1. ID do Grupo de Contrato (chave de integração).  
2. Modalidade do contrato (SaaS ou Manutenção).  
3. Lista de sistemas/produtos contratados (campo multi-checkbox).  
4. Valores financeiros agregados por categoria, como:  
   * Valor total de SaaS  
   * Valor total de Manutenção  
   * Valor total de API  
   * Valor total de conectores  
   * Outros serviços que não exigem split  
5. Biblioteca de Produtos cadastrados

Abaixo, seguem as propriedades criadas para o objeto  Grupo de Contrato:

| Dados da Oracle |  | Propriedades Hubspot (Grupo de Contrato) |  |  |
| ----- | ----- | ----- | :---- | :---- |
| **lin\_servico** | **lin\_servico\_desc** | **lin\_servico (tipo=single line text)** | **lin\_servico\_desc (tipo=single line text)** | **prog\_qtd (tipo=number-currency)** |
| VS\_CNS.00001 | CONSULTORIA | lin\_servico\_consultoria | lin\_servico\_desc\_consultoria | prog\_qtd\_consultoria |
| VS\_DSV.00003 | DESENVOLVIMENTO (FABRICA DE DESENVOLVIMENTO) | lin\_servico\_desenvolvimento\_(fabrica\_de\_desenvolvimento) | lin\_servico\_desc\_desenvolvimento\_(fabrica\_de\_desenvolvimento) | prog\_qtd\_desenvolvimento\_(fabrica\_de\_desenvolvimento) |
| VS\_INT.00089 | INTERMEDIACAO | lin\_servico\_intermediacao | lin\_servico\_desc\_intermediacao | prog\_qtd\_intermediacao |
| VS\_LUS.00010 | LICENCA DE USO BASE (CLIENT SHARE) | lin\_servico\_licenca\_de\_uso\_base\_(client\_share) | lin\_servico\_desc\_licenca\_de\_uso\_base\_(client\_share) | prog\_qtd\_licenca\_de\_uso\_base\_(client\_share) |
| VS\_LDT.00009 | LOCACAO DE DATA CENTER | lin\_servico\_locacao\_de\_data\_center | lin\_servico\_desc\_locacao\_de\_data\_center | prog\_qtd\_locacao\_de\_data\_center |
| VS\_SD.00100 | BASE DE TESTES | lin\_servico\_base\_de\_testes | lin\_servico\_desc\_base\_de\_testes | prog\_qtd\_base\_de\_testes |
| VS\_LUS.00013 | SAAS | lin\_servico\_saas | lin\_servico\_desc\_saas | prog\_qtd\_saas |
| VS\_LUS.00031 | APIs | lin\_servico\_apis | lin\_servico\_desc\_apis | prog\_qtd\_apis |
| VS\_LUS.00032 | CONNECTORS | lin\_servico\_connectors | lin\_servico\_desc\_connectors | prog\_qtd\_connectors |
| VS\_LUS.00033 | ECUSTOS INTEGRAÇÃO | lin\_servico\_ecustos\_integração | lin\_servico\_desc\_ecustos\_integração | prog\_qtd\_ecustos\_integração |
| VS\_LCC.00008 | LOCACAO | lin\_servico\_locacao | lin\_servico\_desc\_locacao | prog\_qtd\_locacao |
| VS\_MAN.00122 | MANUTENCAO | lin\_servico\_manutencao | lin\_servico\_desc\_manutencao | prog\_qtd\_manutencao |
| VS\_SD.00071 | NOTA FISCAL ELETRONICA \- PROJETO RECEPCAO NOTA FISCAL | lin\_servico\_nota\_fiscal\_eletronica\_projeto\_recepcao\_nota\_fiscal | lin\_servico\_desc\_nota\_fiscal\_eletronica\_projeto\_recepcao\_nota\_fiscal | prog\_qtd\_nota\_fiscal\_eletronica\_projeto\_recepcao\_nota\_fiscal |
| VS\_SD.00094 | NOTA FISCAL DE SERVICO | lin\_servico\_nota\_fiscal\_de\_servico | lin\_servico\_desc\_nota\_fiscal\_de\_servico | prog\_qtd\_nota\_fiscal\_de\_servico |
| VS\_SD.00096 | EMISSAO DE CONHECIMENTO DE TRANSPORTE ELETRONICO (CTE) | lin\_servico\_emissao\_de\_conhecimento\_de\_transporte\_eletronico\_(cte) | lin\_servico\_desc\_emissao\_de\_conhecimento\_de\_transporte\_eletronico\_(cte) | prog\_qtd\_emissao\_de\_conhecimento\_de\_transporte\_eletronico\_(cte) |
| VS\_SD.00071 | NOTA FISCAL ELETRONICA | lin\_servico\_nota\_fiscal\_eletronica | lin\_servico\_desc\_nota\_fiscal\_eletronica | prog\_qtd\_nota\_fiscal\_eletronica |

---

## **4\. Resultado esperado (estrutura final de Line Items)**

Após a execução do custom code, o Grupo de Contrato deve possuir itens de linha que representem fielmente o faturamento atual, divididos em dois grupos:

### **4.1 Itens sem split (1:1)**

Itens cujo valor já chega individualizado e não depende de sistema, por exemplo:

* API  
* Base Teste  
* Serviços  
* Outros itens unitários

**Regra:**

* Criar **um único item de linha** para cada categoria, desde que o valor seja conhecido e maior que zero.  
* O item deve ser buscado na biblioteca de produtos da Hubspot e ser criado como um item de linha, conforme de-para criado na planilha: [\[Sienge\] Árvore de Aditivos | Modalidade de Aquisição | Int. Oracle](https://docs.google.com/spreadsheets/d/1mrwdANevwwbts1UsOnoPGrXfDNW1QbgD/edit?gid=1731742221#gid=1731742221)  
  * A busca deve ser realizada pelo nome do Produto

### **4.2 Itens com split obrigatório**

Categorias que chegam agregadas, mas precisam ser detalhadas por sistema/produto:

* SaaS  
* Manutenção  
* Connectors

Para esses casos:

* O valor total deve ser distribuído entre os Sistemas selecionados no Grupo de Contrato.  
* Cada sistema gera um item de linha próprio.  
* A propriedade “Sistema” é uma caixa de múltipla seleção, em que são preenchidos todos os produtos ativos dentro daquele Grupo de Contrato  
* A partir dos valores preenchidos em “Sistema”, é feita a busca pelos Produtos correspondentes na biblioteca, e na sequência, criar os itens de linha  
* Caso não existam produtos do tipo “sistema” ou que tenham “Conector”/”Conectors” no nome, criar itens de linha genéricos.

---

## **5\. Gatilhos do workflow**

O workflow no objeto **Grupo de Contrato** deve ser acionado quando ocorrer qualquer uma das situações abaixo:

1. Alteração em qualquer propriedade financeira vinda da integração (todas da coluna F (prog\_qtd (tipo=number-currency) da planilha).  
2. Alteração na lista de sistemas/produtos contratados (propriedade: Sistema).

Em qualquer cenário, o comportamento esperado é sempre o mesmo: **recalcular e reconstruir todos os itens de linha do Grupo de Contrato**.

---

## **6\. Fluxo de processamento geral**

### **Passo 1 — Limpeza dos itens de linha existentes**

* Identificar itens de linha associados ao Grupo de Contrato.  
* Excluir.

### **Passo 2 — Leitura do estado atual**

* Ler a modalidade do contrato  
  * SaaS, LU com DC ou Misto  
* Ler lista de sistemas/produtos  
  * Propriedade “Sistema (Produtos Starian)” do Grupo de Contrato  
* Ler valores financeiros agregados  
  * Propriedades que iniciam com “prog\_qtd”  
* Ler biblioteca de produtos  
  * Biblioteca atualizada na Hubspot

### **Passo 3 — Construção da lista de novos itens**

1. Identificar quais itens estão retornando da Oracle:  
   1. É possível identificar pelo preenchimento de qualquer uma das propriedades ([planilha](https://docs.google.com/spreadsheets/d/1mrwdANevwwbts1UsOnoPGrXfDNW1QbgD/edit?gid=1731742221#gid=1731742221)):  
      1. lin\_serv  
      2. lin\_serv\_desc  
      3. prog\_qtd  
2. Ler a propriedade “Sistema (Produtos Starian)” para identificar quais produtos estão ativos no Grupo de Contrato respectivo  
   1. Relação entre propriedade preenchidas pela Oracle e os produtos na [planilha](https://docs.google.com/spreadsheets/d/1B7zPph1HgeNlPWVIftQZQtMkAQ4iu-nEC5eWBoAiEfg/edit?gid=542930643#gid=542930643):  
   2. Os produtos da biblioteca possuem exatamente o mesmo nome dos campos da propriedade “Sistema (Produtos Starian)”  
3. Criar itens unitários (API, serviços, base teste, etc.), a partir dos Produtos que foram identificados como parte daquele Grupo de Contrato  
   1. As propriedades dos itens de linha devem vir conforme o cadastro do produto. Os únicos campos alterados serão:  
      1. `Unit price = prog_qtd_`”item relacionado” → Onde cada item possui uma propriedade específica dentro do Grupo de Contrato  
      2. `Quantity = 1`  
4. \*Para Conectores, SaaS ou Manutenção, executar a lógica de split por sistema.

### **Passo 4 — Criação e associação**

* Criar todos os novos itens de linha.  
* Associar cada item ao Grupo de Contrato correspondente.

---

## **7\. Regra de split (SaaS e Manutenção)**

### **7.1 Validação da modalidade do contrato**

Antes de executar o split:

* Se **prog\_qtd\_saas** for conhecido, fazer o split com base nesse valor  
* Se **prog\_qtd\_manutencao** for conhecido, fazer o split com base nesse valor  
* Se ambos forem conhecidos, considerar apenas **prog\_qtd\_saas** para o split e criar um item de linha “Manutenção Mensal” (conforme biblioteca de produtos)  **prog\_qtd\_manutencao** com seu respectivo valor

### **7.2 Origem da lista de sistemas e produtos**

* A lista de sistemas vem exclusivamente do campo multi-checkbox no Grupo de Contrato, localizado na propriedade ”Sistema”  
* Os itens que estiverem marcados têm correlação com os produtos cadastrados na biblioteca de produtos da Hubspot, que é onde a busca deve ser realizada, a partir dos nomes dos “Sistemas”.

### **7.3 Cálculo do split por peso**

Para cada sistema:

1. Obter um **peso** ([valor de tabela](https://docs.google.com/spreadsheets/d/117kJ_0YQ7VLm9iBKvPm3kik_jztgress/edit?gid=381047764#gid=381047764)).  
2. Calcular:  
   * Valor total \= Soma total dos Sistemas.  
   * Para cada Sistema:  
     1. Percentual \= LU Tabela / Valor total  
   * Valor final do item:  
     valor do sistema \= valor “prog\_qtd\_saas” × percentual OU valor do sistema \= valor “prog\_qtd\_manutencao” × percentual

### **7.4 Arredondamento**

* Evitar arredondamentos para não haver erros de cálculo.  
* Caso haja divergência, ajustar o último item para garantir que a soma final seja exatamente igual ao valor agregado original.

### **7.5 Exceção à regra**

Caso não existam valores marcados na propriedade “Sistema” que sejam produtos do tipo sistema, criar apenas um item de linha chamado “SaaS” ou “Manutenção”, com seu respectivo valor.

---

## **8\. Regras de Split (Conectores)**

### **8.1 Origem da lista de conectores**

* A lista de conectores vem exclusivamente do campo multi-checkbox no Grupo de Contrato, localizado na propriedade ”Sistema”.  
* O nome sempre inicia com “Conector” ou “Connectors”

### **8.2 Cálculo do split por peso**

Para cada conector:

3. Obter um **peso** ([valor de tabela](https://docs.google.com/spreadsheets/d/117kJ_0YQ7VLm9iBKvPm3kik_jztgress/edit?gid=381047764#gid=381047764)).  
4. Calcular:  
   * Valor total \= Soma total dos Conectores (prog\_qtd\_connectors)  
   * Para cada Conector:  
     1. Percentual \= Valor Tabela / Valor total  
   * Valor final do item:  
     valor do conector \= valor “pro\_qtd\_conectors” × percentual

### **8.3 Arredondamento**

* Evitar arredondamentos para não haver erros de cálculo.  
* Caso haja divergência, ajustar o último item para garantir que a soma final seja exatamente igual ao valor agregado original.

### **8.4 Exceção à regra**

Caso não existam valores marcados na propriedade “Sistema” que sejam produtos com nome “Conector”, criar apenas um item de linha chamado “CONNECTORS”, com seu respectivo valor.

---

## **9\. Critérios de aceite**

O desenvolvimento será considerado correto quando:

1. A soma dos valores dos itens criados for exatamente igual aos valores financeiros do Grupo de Contrato.  
2. Absorver totalmente todos os valores retornados pela API do Oracle (prog\_qtd), ou seja, todos os itens que retornarem na api devem ser distribuídos para algum item de linha.  
3. Alterações em sistemas, valores ou modalidade refletirem corretamente nos itens após reprocessamento.  
4. Nenhum item de linha do Deal for alterado por esse fluxo.  
5. A execução for idempotente (rodar mais de uma vez gera sempre o mesmo resultado).

## **10\. Material de apoio**

* [Miro Sienge \- Integração Oracle](https://miro.com/app/board/uXjVJcZ6Wbs=/?moveToWidget=3458764639518665177&cot=14)  
* [Planilha com de-para de propriedades](https://docs.google.com/spreadsheets/d/1B7zPph1HgeNlPWVIftQZQtMkAQ4iu-nEC5eWBoAiEfg/edit?gid=1558384052#gid=1558384052)
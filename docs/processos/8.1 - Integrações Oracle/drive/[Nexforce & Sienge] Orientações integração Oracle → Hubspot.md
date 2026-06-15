# **1 \- Regras de tratamento de dados (input →output)**

## **1.1. O que entra no HubSpot (visão ‘Portfólio’/Contrato)**

O objetivo é ter, diariamente, a visão do que o cliente paga (MRR) e os produtos contratados dentro do HubSpot, para:

* KPIs (MRR por contrato / faturamento por anuente /etc.)  
* visão “Portfólio” (tudo que o cliente tem contratado dentro daquele grupo de contrato).  
* suportar retrações / aditivos / cancelamentos com base na “foto real” do Oracle.

## **1.2. Identificação e agregação (regra base para middleware)**

Como o Oracle não tem “grupo de contrato” formal, o HubSpot (ou middleware) precisa construir esse agrupamento a partir da taxonomia do número do contrato (nr\_contrato):

### **Regra 1 — “Grupo de Contrato” (chave de agregação)**

* **grupo\_contrato\_id \= prefixo do nr\_contrato antes do primeiro . ou \_ ou \-**  
* Ex.: 72510.6\_UNIC\_MSAAS → grupoContratoId \= 72510  
* Esse prefixo pode se repetir em ‘**n**’ contratos na Oracle, logo, não pode ser considerado como identificador único (apenas no Grupo de Contrato da Hubspot)  
* Esse valor deve identificar todos os contratos de mesmo número (podem conter CNPJs distintos)

### **Regra 2 — Consolidar dados dentro do grupo**

Para cada **grupo\_contrato\_id**, consolidar:

* contratos (podem ser de **anuentes/pagadores diferentes** → cnpj muda)  
* vigencia\_de e vigencia\_ate → utilizar a primeira ocorrência, pois se repete nos contratos de mesmo número  
* **cnpjs\_relacionados** \= concatenar os CNPJs de contratos de mesmo número, separados por “ ; ” (ponto e vírgula)  
* itens de contrato (lista itens \[\])

### **Regra 3 — Normalização do item (chave de item)**

No JSON, o “item de contrato” vem em itens\[\] com campos diversos campos, porém, serão utilizados apenas:

* lin\_servico  
* lin\_servico\_desc  
* pro\_qtd

Ex.: item SaaS é identificado por:

* lin\_servico \= "VS\_LUS.00013" e lin\_servico\_desc \= "SAAS"

### **Regra 4 — Agregação por produto (sistema/serviço) no nível do Grupo de Contrato**

Dentro do  **grupo\_contrato\_id**, o mesmo serviço pode aparecer em vários contratos (por CNPJ / anuente / aditivos).  
Então, o tratamento de dados deve agregar por **\-**  **grupo\_contrato\_id \= ∑ ‘itens’ lin\_servico iguais \-** e somar o valor:

* valor\_total\_servico\_no\_grupo \= Σ prog\_qtd (somar todas as ocorrências do mesmo lin\_servico dentro do grupo)

No exemplo do json, há vários contratos do grupo 72510 contendo item SAAS com preço \~21450.04/21450.15 por contrato — na consolidação do grupo, isso vira **um total SaaS do grupo** (soma).

### **Regra 5 — De-para de objetos da Oracle → Hubspot**

Ao enviar os dados para a Hubspot, temos a seguinte correspondência para Grupo de Contratos  (Oracle → Hubspot):

* **nr\_contrato → nr\_contrato\_hs**  
* **vigencia\_de → vigencia\_de\_hs**  
* **vigencia\_ate →vigencia\_ate\_hs**  
* **lin\_servico → lin\_servico\_hs** (um para cada serviço, conforme planilha)  
* **lin\_servico\_desc → lin\_servico\_desc\_hs** (um para cada serviço, conforme planilha)  
* **prog\_qtd → prog\_qtd\_hs** (um para cada serviço, conforme planilha)

---

# **2 \- Regras para categorizar o item de contrato “SAAS” e “MANUTENCAO” (split de Line Item)**

Aqui está o ponto-chave que ficou acordado na reunião:

## **2.1. Fato: Oracle retorna “SaaS” como bloco (sem detalhar os sistemas)**

O Oracle manda um item para sistemas “SAAS” ou “MANUTENCAO” genérico:

* lin\_servico\_desc \= "SAAS" ou “MANUTENCAO”  
  e **não informa** “SaaS Gestão / módulo X / módulo Y”.

Inicialmente, os dados dos itens do contrato já somados,  serão enviados para o Grupo de Contrato, sendo uma propriedades para cada serviço (lin\_servico\_desc), conforme tabela abaixo:

| Dados da Oracle |  | Propriedades Hubspot |  |  |
| ----- | ----- | ----- | :---- | :---- |
| **lin\_servico** | **lin\_servico\_desc** | **lin\_servico (tipo=single line text)** | **lin\_servico\_desc (tipo=single line text)** | **prog\_qtd (tipo=number-currency)** |
| VS\_CNS.00001 | CONSULTORIA | lin\_servico\_consultoria | lin\_servico\_desc\_consultoria | prog\_qtd\_consultoria |
| VS\_DSV.00003 | DESENVOLVIMENTO (FABRICA DE DESENVOLVIMENTO) | lin\_servico\_desenvolvimento\_(fabrica\_de\_desenvolvimento) | lin\_servico\_desc\_desenvolvimento\_(fabrica\_de\_desenvolvimento) | prog\_qtd\_desenvolvimento\_(fabrica\_de\_desenvolvimento) |
| VS\_INT.00089 | INTERMEDIACAO | lin\_servico\_intermediacao | lin\_servico\_desc\_intermediacao | prog\_qtd\_intermediacao |
| VS\_LCC.00008 | LICENCA DE USO BASE (CLIENT SHARE) | lin\_servico\_licenca\_de\_uso\_base\_(client\_share) | lin\_servico\_desc\_licenca\_de\_uso\_base\_(client\_share) | prog\_qtd\_licenca\_de\_uso\_base\_(client\_share) |
| VS\_LDT.00009 | LOCACAO DE DATA CENTER | lin\_servico\_locacao\_de\_data\_center | lin\_servico\_desc\_locacao\_de\_data\_center | prog\_qtd\_locacao\_de\_data\_center |
| VS\_LUS.00010 | BASE DE TESTES | lin\_servico\_base\_de\_testes | lin\_servico\_desc\_base\_de\_testes | prog\_qtd\_base\_de\_testes |
| VS\_LUS.00013 | SAAS | lin\_servico\_saas | lin\_servico\_desc\_saas | prog\_qtd\_saas |
| VS\_LUS.00031 | APIs | lin\_servico\_apis | lin\_servico\_desc\_apis | prog\_qtd\_apis |
| VS\_LUS.00032 | CONNECTORS | lin\_servico\_connectors | lin\_servico\_desc\_connectors | prog\_qtd\_connectors |
| VS\_LUS.00033 | ECUSTOS INTEGRAÇÃO | lin\_servico\_ecustos\_integração | lin\_servico\_desc\_ecustos\_integração | prog\_qtd\_ecustos\_integração |
| VS\_LUS.90013 | LOCACAO | lin\_servico\_locacao | lin\_servico\_desc\_locacao | prog\_qtd\_locacao |
| VS\_MAN.00122 | MANUTENCAO | lin\_servico\_manutencao | lin\_servico\_desc\_manutencao | prog\_qtd\_manutencao |
| VS\_SD.00071 | NOTA FISCAL ELETRONICA \- PROJETO RECEPCAO NOTA FISCAL | lin\_servico\_nota\_fiscal\_eletronica\_projeto\_recepcao\_nota\_fiscal | lin\_servico\_desc\_nota\_fiscal\_eletronica\_projeto\_recepcao\_nota\_fiscal | prog\_qtd\_nota\_fiscal\_eletronica\_projeto\_recepcao\_nota\_fiscal |
| VS\_SD.00094 | NOTA FISCAL DE SERVICO | lin\_servico\_nota\_fiscal\_de\_servico | lin\_servico\_desc\_nota\_fiscal\_de\_servico | prog\_qtd\_nota\_fiscal\_de\_servico |
| VS\_SD.00096 | EMISSAO DE CONHECIMENTO DE TRANSPORTE ELETRONICO (CTE) | lin\_servico\_emissao\_de\_conhecimento\_de\_transporte\_eletronico\_(cte) | lin\_servico\_desc\_emissao\_de\_conhecimento\_de\_transporte\_eletronico\_(cte) | prog\_qtd\_emissao\_de\_conhecimento\_de\_transporte\_eletronico\_(cte) |
| VS\_SD.00100 | NOTA FISCAL ELETRONICA | lin\_servico\_nota\_fiscal\_eletronica | lin\_servico\_desc\_nota\_fiscal\_eletronica | prog\_qtd\_nota\_fiscal\_eletronica |

Já com os dados dentro da Hubspot, em Grupo de Contratos, será necessário realizar o split dessas informações, gerando “Itens de linha”.

## **2.2. Regra de split do SaaS/LU por “pesos” (proporção)**

Quando for necessário ver **“quanto do SaaS/LU pertence a cada módulo”**, o HubSpot fará:

\*Obs: Para LU (licença única), o valor a ser considerado para split entre sistemas, é o somatório de “prog\_qtd” do “lin\_servico\_desc \= MANUTENCAO”. 

\*\*Obs: LU é equivalente a MANUTENCAO (referem-se ao mesmo significado)

\*\*\*Obs: Podem acontecer situações  de contratos que retornam tanto “SAAS” quanto "MANUTENCAO”. Nesse caso, devemos considerar fazer o split apenas para o valor somado dos itens de MANUTENCAO.

1. Ter uma **tabela-base de sistemas SaaS ou “LU Tabela”** (fonte da verdade no HubSpot ou em config do middleware), contendo para cada sistema:   
   * sistema\_id  
   * sistema\_nome  
   * preco\_base\_lu\_tabela (ou “preço de referência” do sistema)  
   * Tabela base: [Precificação Sienge Plataforma AS IS](https://docs.google.com/spreadsheets/d/117kJ_0YQ7VLm9iBKvPm3kik_jztgress/edit?gid=1300379262#gid=1300379262)  
2. Identificar os sistemas ativos para aquele contrato (Grupo de Contrato)  
   * Propriedade “Sistema” na Hubspot (multiple checkbox)  
3. Calcular **peso** de cada módulo do portfólio de sistemas ativos:  
   * peso\_modulo \= preco\_base\_modulo / Σ(preco\_base\_de\_todos\_os\_modulos\_do\_pacote)  
4. Pegar o **valor total SAAS ou MANUTENCAO do Oracle** (já agregado no grupo):  
   * valor\_saas\_oracle\_grupo \= Σ prog\_qtd  onde lin\_servico \== VS\_LUS.00013  
   * valor\_manutencao\_oracle\_grupo \= Σ prog\_qtd  onde lin\_servico \== VS\_MAN.00122  
5. Distribuir o total do SaaS/LU proporcionalmente:  
   * valor\_modulo\_atual \= peso\_modulo \* valor\_saas\_oracle\_grupo  
   * valor\_modulo\_atual \= peso\_modulo \* valor\_manutencao\_oracle\_grupo

## **2.3. Por que o peso funciona mesmo com reajuste?**

A premissa de negócio informada: **reajustes do SaaS são tabelados e aplicados no mesmo % para todos os itens do SaaS**, então a relação (peso relativo) entre módulos permanece estável ao longo do tempo.  
➡️ Portanto, mesmo que o valor total do Oracle reflita reajustes que o CRM não tem, o split proporcional continua válido.

## **2.4. Regras de arredondamento e consistência**

Para evitar diferenças centavos:

* calcular todos os módulos com alta precisão  
* arredondar para 2 casas no fim  
* ajustar o **resíduo** (diferença para fechar exatamente o total) no módulo de maior valor.

## **2.5. Regras de fallback (quando não der para quebrar)**

Se faltar dado para o split (ex.: módulo sem preco\_base\_modulo ou propriedade “sistema” desconhecida):

* **não quebrar** o SaaS naquele grupo (manter 1 linha “SaaS total”)  
* setar flag: saas\_split\_status \= "INCOMPLETO" \+ motivo  
* (opcional) registrar a lista de módulos ausentes

## **2.6. Fonte dos “módulos/sistemas SaaS” (multiple checkbox no HubSpot)**

* Para o **split do SaaS por sistema/módulo**, a lista de sistemas contratados **não vem do Oracle** (vem apenas “SaaS” agregado).  
* Então a fonte de verdade para “quais sistemas entram no pacote daquele cliente” será o **multiple checkbox de sistemas** no HubSpot (no registro do Grupo de Contrato, pela propriedade “[Sistema](https://app.hubspot.com/property-settings/50102745/properties?type=2-54707985&search=sistema&action=edit&property=sistema)”).  
* O middleware deve:  
  1. Ler o multiple checkbox (lista de sistemas selecionados)  
  2. Mapear cada sistema para um **valor de tabela** (“preço de referência”) usado para cálculo de pesos.

## **2.7. Ordem correta do processamento no middleware (antes de criar itens de linha)**

Para SAAS  e MANUTENCAO, a criação de itens de linha **não é direta**. A sequência correta é:

1. **Oracle →** obter `valor_saas_total` do grupo (linha “SaaS”)  
2. **HubSpot →**recebe os dados em Grupo de Contrato  
3. **HubSpot →** custom code para ler multiple checkbox “sistemas contratados”  
4. **Tabela de preços →** buscar `preco_base` de cada sistema selecionado  
5. Calcular **pesos** (proporção)  
6. Aplicar pesos no `valor_saas_total` e gerar os valores por sistema  
7. **Só então** criar/atualizar os itens de linha no HubSpot:  
   * “SaaS \- total” (opcional, mas recomendado)  
   * “SaaS \- Sistema A”  
   * “SaaS \- Sistema B”  
   * etc.

Isso deixa claro para o dev que o split é um **pré-processamento obrigatório** antes do “upsert” dos itens filhos.

## **2.8. Correspondência direta vs. correspondência derivada (regra prática)**

* **Serviços não-SaaS**: vêm detalhados do Oracle → é só **correspondência direta** (mapear `lin_servico`/`lin_servico_desc` para item de linha e somar).  
* **SaaS**: não vem detalhado → exige **correspondência derivada**:  
  * usa **Oracle** para o total do SaaS  
  * usa **HubSpot** (multiple checkbox) \+ tabela de preços para identificar sistemas e pesos  
  * gera “itens de linha por sistema” no tratamento de dados

## **2.9. Dependência de consistência de cadastro (checkbox ↔ tabela de preços ↔ item de linha)**

Para evitar erro silencioso no split:

* todo valor selecionável no checkbox deve existir no “catálogo”/tabela de preços (chave única)  
* o middleware deve validar:  
  * sistema selecionado sem preço → `saas_split_status = INCOMPLETO` (não cria itens por sistema, mantém só SaaS total)  
  * preço zerado/ausente → idem  
* recomendação: usar IDs estáveis (ex.: `sistema_id`) em vez de texto solto.

---

# **3 \- Objeto que vai receber os dados (Grupo de Contrato e Itens de linha)**

Ficou alinhado  que o portfólio de produtos contratados deve estar associado ao Grupo de Contrato. Então a modelagem recomendada é:

## **3.1. Objeto ‘pai’:  Grupo de Contrato (Custom Object)**

**Um registro por grupo\_contrato\_id.**

Campos mínimos sugeridos:

* nr\_contrato\_hs (ex.: “72510”)  
* cnpjs\_relacionados (lista/concat para auditoria)  
* mrr\_total\_oracle (soma de todos os itens do grupo)  
* mrr\_saas\_total\_oracle (soma do SaaS do grupo)  
* last\_sync\_at  
* sync\_status (OK / WARNING / ERROR)

Mapeamento completo na planilha: [\[Nexforce & Sienge\] Mapeamento de propriedades dos objetos: CONTRATO; GRUPO DE CONTRATO; PORTFOLIO](https://docs.google.com/spreadsheets/d/1B7zPph1HgeNlPWVIftQZQtMkAQ4iu-nEC5eWBoAiEfg/edit?gid=1558384052#gid=1558384052) 

## **3.2. Objeto ‘filho’: Itens de Linha do Grupo de Contratos**

**Um registro por (grupo\_contrato\_id \+ lin\_servico\_desc)** após agregação.

Campos mínimos:

* lin\_servico\_hs \= lin\_servico (ex.: VS\_LUS.00013)  
* lin\_servico\_desc\_hs \= lin\_servico\_desc (ex.: SAAS, APIs, CONNECTORS)  
* prog\_qtd\_hs \= soma consolidada no grupo (Σ prog\_qtd)  
* sub\_servico\_desc\_hs  (ex.: “Sienge”) quando fizer sentido

## **3.3. “Split do SaaS” como filhos adicionais**

Para permitir relatórios por módulo, crie itens adicionais (filhos) quando lin\_servico\_desc\_hs \== SAAS ou MANUTENCAO:

* Item “SaaS \- total” (mantém o valor total Oracle)  
* Itens “SaaS \- Módulo X”, “SaaS \- Módulo Y”, etc.  
  * lin\_servico\_hs pode ser algo como SAAS\_MOD\_\<id\>  
  * prog\_qtd\_hs \= valor proporcional calculado

Isso evita “73 propriedades de valor” e mantém o Portfólio reportável.

* Item “MANUTENCAO” é gerado quando não existe recorrência SaaS, mas sim, um pagamento único para o sistema (Licença Única ou LU) 

---

# **4 \- O que acontece diariamente? Precisa deletar tudo e subir de novo?**

**Idealmente** não devemos “deletar tudo do HubSpot e subir tudo de novo” globalmente.  
O correto é **sincronização incremental por grupo** (ou por lote), com “reconciliação” de itens.

Porém, esse ponto depende da viabilidade técnica da integração.

---

# **5 \- Material de apoio**

* Planilha com De-Para de campos: [\[Nexforce & Sienge\] Mapeamento de propriedades dos objetos: CONTRATO; GRUPO DE CONTRATO; PORTFOLIO](https://docs.google.com/spreadsheets/d/1B7zPph1HgeNlPWVIftQZQtMkAQ4iu-nEC5eWBoAiEfg/edit?gid=1558384052#gid=1558384052) 
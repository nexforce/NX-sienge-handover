# Oracle API — dump de endpoints e mapeamento

**Fonte:** `hubspot-get-workflow 1758086000` em 2026-06-15

---

## Autenticação

| Campo | Valor |
|-------|-------|
| Método | POST |
| URL | `https://api-apex.softplan.com.br/ordsprd/apex_starian/hubspot/auth/login` |
| Body | `{"username": ORACLE_USERNAME, "password": ORACLE_PASSWORD}` |
| Resposta | `{"token": "..."}` |
| Secrets | `ORACLE_USERNAME`, `ORACLE_PASSWORD` (HubSpot Secrets) |

---

## Endpoint de contratos

| Campo | Valor |
|-------|-------|
| Método | GET |
| URL | `https://api-apex.softplan.com.br/ordsprd/apex_starian/hubspot/contratos?p_data={DDMMYYYY}&x_api_token={token}&p_operacao=1` |
| Parâmetro `p_data` | Data do dia no formato DDMMYYYY |
| Parâmetro `x_api_token` | Token obtido no passo de autenticação |
| Parâmetro `p_operacao` | `1` (fixo) |

**Estrutura da resposta:**
```json
{
  "status_code": 200,
  "l_return": true,
  "empresas": {
    "clientes": [
      {
        "cnpj": "...",
        "contratos": [
          {
            "nr_contrato": "12345.001",
            "itens": [
              {
                "lin_servico": "lin_servico_saas",
                "lin_servico_desc": "SAAS",
                "prog_qtd": 1500.00
              }
            ]
          }
        ]
      }
    ]
  }
}
```

**Extração do Grupo de Contrato ID:**
```python
import re
grupo_id = re.match(r"^[^._]+", nr_contrato).group(0)
# Exemplo: "12345.001" → "12345"
# Exemplo: "98765_A" → "98765"
```

---

## Mapeamento lin_servico → propriedade HubSpot

| Código Oracle (lin_servico) | lin_servico_desc | Propriedade HubSpot |
|-----------------------------|-----------------|---------------------|
| `lin_servico_saas` | SAAS | `prog_qtd_saas` |
| `lin_servico_manutencao` | MANUTENCAO | `prog_qtd_manutencao` |
| `lin_servico_apis` | APIs | `prog_qtd_apis` |
| `lin_servico_connectors` | CONNECTORS | `prog_qtd_connectors` |
| `lin_servico_consultoria` | CONSULTORIA | `prog_qtd_consultoria` |
| `lin_servico_locacao_de_data_center` | LOCACAO DE DATA CENTER | `prog_qtd_locacao_de_data_center` |
| `lin_servico_base_de_testes` | BASE DE TESTES | `prog_qtd_base_de_testes` |
| `lin_servico_ecustos_integracao` | ECUSTOS INTEGRAÇÃO | `prog_qtd_ecustos_integracao` |
| `lin_servico_locacao` | LOCACAO | `prog_qtd_locacao` |
| `lin_servico_nota_fiscal_eletronica` | NOTA FISCAL ELETRONICA | `prog_qtd_nota_fiscal_eletronica` |
| `lin_servico_nota_fiscal_de_servico` | NOTA FISCAL DE SERVICO | `prog_qtd_nota_fiscal_de_servico` |
| `lin_servico_emissao_...cte` | EMISSAO DE CONHECIMENTO DE TRANSPORTE ELETRONICO (CTE) | `prog_qtd_emissao_de_conhecimento_de_transporte_eletronico_cte` |
| `lin_servico_nota_fiscal_eletronica_projeto_recepcao_nota_fiscal` | NOTA FISCAL ELETRONICA - PROJETO RECEPCAO NOTA FISCAL | `prog_qtd_nota_fiscal_eletronica_projeto_recepcao_nota_fiscal` |
| `lin_servico_intermediacao` | INTERMEDIACAO | `prog_qtd_intermediacao` |
| `lin_servico_desenvolvimento_fabrica_de_desenvolvimento` | DESENVOLVIMENTO (FABRICA DE DESENVOLVIMENTO) | `prog_qtd_desenvolvimento_fabrica_de_desenvolvimento` |
| `lin_servico_licenca_de_uso_base_client_share` | LICENCA DE USO BASE (CLIENT SHARE) | `prog_qtd_licenca_de_uso_base_client_share` |

#!/usr/bin/env python3
"""
Replaces the "Estrutura de módulos HubL" table in the 5.1 document.
Reads DOCX from stdin, writes modified DOCX to stdout.

Finds the first <w:tbl> that follows the paragraph containing
"Estrutura de módulos HubL", replaces its header and all data rows
with the canonical module→template mapping, and preserves table branding.
"""
import sys
import io
import copy
from docx import Document
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

HEADERS = ["Módulo", "Templates que utilizam"]

ROWS = [
    ["Quadro Reativação de Usuários", "Upsell Reativação de Usuários"],
    ["Termos", "Base Teste"],
    ["Assinatura Eletrônica", "Cancelamento Plataforma"],
    ["Considerando Que", "Cancelamento Plataforma"],
    ["Da Resilição", "Cancelamento Plataforma"],
    ["Disposições Gerais", "Cancelamento Plataforma"],
    ["Quadro Cedente", "Cessão de Direitos, Cessão de Direitos GO"],
    ["Quadro Cessionária", "Cessão de Direitos, Cessão de Direitos GO"],
    ["Cabeçalho", "Consultoria Implantação"],
    ["Quadro Preço", "Consultoria Implantação"],
    ["Quadro Serviços Contratados", "Consultoria Implantação"],
    ["Seções", "Consultoria Implantação"],
    ["DOWNSELL SAAS - Quadro Preço", "Downsell Sistemas e/ou Usuários — SaaS"],
    ["DOWSELL LU DC - Quadro Redução de Escopos", "Downsell Usuários — LU com DC"],
    ["Quadro Redução de Serviços", "Downsell Serviços"],
    ["SAAS - Quadro Redução de Escopos", "Downsell Sistemas e/ou Usuários — SaaS"],
    ["Termos", "Downsell Sistemas e/ou Usuários — SaaS"],
    ["Clausulas", "Nova Venda GO"],
    ["Quadro Módulos", "Nova Venda GO"],
    ["Quadro Plano Contratado e Valores", "Nova Venda GO"],
    ["Quadro Planos", "Nova Venda GO"],
    ["ANUENTES - Assinaturas", "Base Teste, Cancelamento Plataforma, Consultoria Implantação, Divisão de Faturamento, Downsell Serviços, Downsell Sistemas e/ou Usuários — SaaS, Nova Venda GO, Primeira Venda, Redução Temporária, Resilição Migração GO para Plataforma, Troca de API, Troca de Modalidade LU com DC + Termo de Resilição, Upsell API, Upsell Conector, Upsell Data Center Exclusivo, Upsell E-Custos, Upsell NFs, Upsell Reativação de Usuários, Upsell Usuários e Sistemas, Upsell Usuários e Sistemas — LU com DC"],
    ["ANUENTES - Preços e Condições de Pagamento", "Resilição Migração GO para Plataforma"],
    ["Divisão de Faturamento", "Base Teste, Divisão de Faturamento, Downsell Sistemas e/ou Usuários — SaaS, Downsell Usuários — LU com DC, Nova Venda GO, Primeira Venda, Redução Temporária, Resilição Migração GO para Plataforma, Troca de API, Troca de Modalidade LU com DC + Termo de Resilição, Upsell E-Custos, Upsell Reativação de Usuários, Upsell Usuários e Sistemas, Upsell Usuários e Sistemas — LU com DC"],
    ["Divisão de Faturamento Filtro", "Downsell Sistemas e/ou Usuários — SaaS, Downsell Usuários — LU com DC, Troca de API, Upsell Usuários e Sistemas, Upsell Usuários e Sistemas — LU com DC"],
    ["Quadro Anuentes", "Base Teste, Divisão de Faturamento, Downsell Serviços, Downsell Sistemas e/ou Usuários — SaaS, Nova Venda GO, Primeira Venda, Redução Temporária, Resilição Migração GO para Plataforma, Troca de API, Troca de Modalidade LU com DC + Termo de Resilição, Upsell API, Upsell Conector, Upsell E-Custos, Upsell NFs, Upsell Reativação de Usuários, Upsell Usuários e Sistemas, Upsell Usuários e Sistemas — LU com DC"],
    ["SERVIÇOS - Divisão de Faturamento", "Upsell API, Upsell Conector, Upsell NFs"],
    ["Assinatura Eletrônica", "Primeira Venda, Resilição Migração GO para Plataforma"],
    ["Condição E-Custos", "Primeira Venda, Resilição Migração GO para Plataforma, Upsell Usuários e Sistemas — LU com DC"],
    ["Disposições Gerais", "Primeira Venda, Resilição Migração GO para Plataforma"],
    ["Foro de Eleição", "Primeira Venda, Resilição Migração GO para Plataforma"],
    ["Quadro Parâmetros Contratação", "Primeira Venda"],
    ["Quadro Preço", "Primeira Venda, Resilição Migração GO para Plataforma"],
    ["Quadro Serviços Conexos", "Primeira Venda, Resilição Migração GO para Plataforma, Troca de Modalidade LU com DC + Termo de Resilição"],
    ["Quadro Serviços Contratados", "Primeira Venda, Resilição Migração GO para Plataforma"],
    ["Quadro Sistemas Licenciados", "Primeira Venda, Resilição Migração GO para Plataforma, Troca de Modalidade LU com DC + Termo de Resilição"],
    ["Preços e Pagamento sem DF", "Resilição Migração GO para Plataforma"],
    ["Quadro Preço", "Redução Temporária"],
    ["Preços e Condições TROCA DM", "Troca de Modalidade LU com DC + Termo de Resilição"],
    ["Preços e Condições TROCA DM Com DF", "Troca de Modalidade LU com DC + Termo de Resilição"],
    ["REATIVAÇÃO USUÁRIOS - Quadro Preço", "Upsell Reativação de Usuários"],
    ["LU Quadro Aumento de Escopos", "Upsell Usuários e Sistemas — LU com DC"],
    ["SAAS Quadro Aumento de Escopos", "Upsell Usuários e Sistemas"],
    ["Termos", "Upsell Usuários e Sistemas"],
    ["Assinaturas", "Base Teste, Cancelamento Plataforma, Cessão de Direitos, Cessão de Direitos GO, Consultoria Implantação, Downsell Serviços, Downsell Sistemas e/ou Usuários — SaaS, Downsell Usuários — LU com DC, Nova Venda GO, Primeira Venda, Redução Temporária, Resilição Migração GO para Plataforma, Troca de API, Troca de Modalidade LU com DC + Termo de Resilição, Upsell API, Upsell Conector, Upsell Data Center Exclusivo, Upsell E-Custos, Upsell NFs, Upsell Reativação de Usuários, Upsell Usuários e Sistemas, Upsell Usuários e Sistemas — LU com DC"],
    ["Assinaturas - Cessão de direitos", "Cessão de Direitos, Cessão de Direitos GO"],
    ["Cabeçalho", "Base Teste, Cessão de Direitos GO, Divisão de Faturamento, Downsell Sistemas e/ou Usuários — SaaS, Downsell Usuários — LU com DC, Nova Venda GO, Primeira Venda, Redução Temporária, Resilição Migração GO para Plataforma, Troca de Modalidade LU com DC + Termo de Resilição, Upsell Data Center Exclusivo, Upsell E-Custos, Upsell Reativação de Usuários, Upsell Usuários e Sistemas, Upsell Usuários e Sistemas — LU com DC"],
    ["Cabeçalho Aditivo", "Divisão de Faturamento, Downsell Sistemas e/ou Usuários — SaaS, Downsell Usuários — LU com DC, Redução Temporária, Upsell Data Center Exclusivo, Upsell E-Custos, Upsell Reativação de Usuários, Upsell Usuários e Sistemas, Upsell Usuários e Sistemas — LU com DC"],
    ["Cidade Estado", "Base Teste, Cessão de Direitos, Cessão de Direitos GO, Consultoria Implantação, Divisão de Faturamento, Downsell Serviços, Downsell Sistemas e/ou Usuários — SaaS, Nova Venda GO, Redução Temporária, Resilição Migração GO para Plataforma, Troca de Modalidade LU com DC + Termo de Resilição, Upsell Reativação de Usuários, Upsell Usuários e Sistemas, Upsell Usuários e Sistemas — LU com DC"],
    ["QUADRO PREÇO SAAS", "Upsell Usuários e Sistemas"],
    ["Resilição GO - Quadro Parâmetros Contratação", "Resilição Migração GO para Plataforma"],
    ["Sistemas Licenciados BASE TESTE", "Base Teste"],
    ["Tabela Licenciada", "Base Teste, Cancelamento Plataforma, Consultoria Implantação, Divisão de Faturamento, Downsell Serviços, Downsell Sistemas e/ou Usuários — SaaS, Downsell Usuários — LU com DC, Nova Venda GO, Primeira Venda, Redução Temporária, Resilição Migração GO para Plataforma, Troca de API, Troca de Modalidade LU com DC + Termo de Resilição, Upsell API, Upsell Conector, Upsell Data Center Exclusivo, Upsell E-Custos, Upsell NFs, Upsell Reativação de Usuários, Upsell Usuários e Sistemas, Upsell Usuários e Sistemas — LU com DC"],
    ["Tabela Licenciante", "Todos"],
    ["Versão Sienge", "Base Teste, Troca de Modalidade LU com DC + Termo de Resilição"],
    ["header", "Todos"],
    ["quadro-e-custos", "Downsell Serviços, Downsell Sistemas e/ou Usuários — SaaS, Downsell Usuários — LU com DC, Nova Venda GO, Troca de Modalidade LU com DC + Termo de Resilição, Upsell NFs, Upsell Reativação de Usuários, Upsell Usuários e Sistemas, Upsell Usuários e Sistemas — LU com DC"],
]


def find_hubl_table(doc):
    """Return the first <w:tbl> that appears after the 'Estrutura de módulos HubL' paragraph."""
    body = doc.element.body
    found_marker = False
    for child in body:
        tag = child.tag
        if tag == qn('w:p'):
            from docx.text.paragraph import Paragraph
            text = Paragraph(child, doc).text
            if "Estrutura de módulos HubL" in text:
                found_marker = True
        elif tag == qn('w:tbl') and found_marker:
            from docx.table import Table
            return Table(child, doc)
    return None


def set_tr_cell_text(tr_elem, col_index, text):
    """Set the text of cell col_index in a <w:tr> element, preserving run formatting."""
    cells = tr_elem.findall(qn('w:tc'))
    if col_index >= len(cells):
        return
    tc = cells[col_index]
    paras = tc.findall(qn('w:p'))
    if not paras:
        return
    para = paras[0]

    # Capture formatting from first run if present
    first_rpr = None
    runs = para.findall(qn('w:r'))
    if runs:
        rpr = runs[0].find(qn('w:rPr'))
        if rpr is not None:
            first_rpr = copy.deepcopy(rpr)

    # Remove all existing runs
    for r in para.findall(qn('w:r')):
        para.remove(r)

    # Add single run with new text
    new_r = OxmlElement('w:r')
    if first_rpr is not None:
        new_r.append(first_rpr)
    new_t = OxmlElement('w:t')
    new_t.text = text
    if text != text.strip():
        new_t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    new_r.append(new_t)
    para.append(new_r)


def replace_table_content(table, headers, rows):
    tbl = table._tbl
    all_tr = tbl.findall(qn('w:tr'))

    if not all_tr:
        print("Table has no rows", file=sys.stderr)
        sys.exit(1)

    header_tr = all_tr[0]

    # Update header cell texts
    for i, h in enumerate(headers):
        set_tr_cell_text(header_tr, i, h)

    # Use the second row as the data-row template; fall back to header
    data_template = copy.deepcopy(all_tr[1] if len(all_tr) > 1 else all_tr[0])

    # Remove all existing data rows (keep only header)
    for tr in all_tr[1:]:
        tbl.remove(tr)

    # Append new data rows
    for row_data in rows:
        new_tr = copy.deepcopy(data_template)
        for col_i, text in enumerate(row_data):
            set_tr_cell_text(new_tr, col_i, text)
        tbl.append(new_tr)


def main():
    raw = sys.stdin.buffer.read()
    if not raw:
        print("No input on stdin", file=sys.stderr)
        sys.exit(1)

    doc = Document(io.BytesIO(raw))

    table = find_hubl_table(doc)
    if table is None:
        print("ERROR: could not find table after 'Estrutura de módulos HubL' paragraph", file=sys.stderr)
        sys.exit(1)

    replace_table_content(table, HEADERS, ROWS)

    buf = io.BytesIO()
    doc.save(buf)
    sys.stdout.buffer.write(buf.getvalue())


if __name__ == "__main__":
    main()

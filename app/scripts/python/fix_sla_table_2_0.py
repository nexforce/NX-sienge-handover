#!/usr/bin/env python3
"""
Fills the empty "Cluster: SLA e Notificações" table in the 2.0 document.
Reads DOCX from stdin, writes modified DOCX to stdout.

Finds the first <w:tbl> that follows the paragraph containing
"Cluster: SLA e Notificações" and replaces its header and data rows
with the canonical Retração SLA data (ticket 86b8m3dkx).
"""
import sys
import io
import copy
from docx import Document
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

HEADERS = ["Etapa", "Prazo", "Início do período", "Fim do período", "Alerta"]

ROWS = [
    [
        "Solicitação / Diagnóstico / Solução",
        "12 dias corridos",
        "Data de início do aviso prévio",
        "Envio do contrato para aprovação",
        "Customer Success",
    ],
    [
        "Formalização — aprovação do contrato",
        "6 dias",
        "Recebimento da aprovação do contrato",
        "Aprovação do financeiro",
        "Customer Success, Financeiro",
    ],
    [
        "Formalização — assinatura do cliente",
        "6 dias",
        "Aprovação do financeiro",
        "Assinatura do cliente",
        "Customer Success",
    ],
    [
        "Formalização — processamento financeiro",
        "5 dias",
        "Assinatura do cliente",
        "Processamento financeiro",
        "Financeiro",
    ],
    [
        "Final — registrar ganho",
        "1 dia",
        "Assinatura completa",
        'Registro em "Retração Realizada"',
        "—",
    ],
]


def find_sla_table(doc):
    """Return the first <w:tbl> that appears after the 'Cluster: SLA e Notificações' paragraph."""
    from docx.text.paragraph import Paragraph
    from docx.table import Table

    body = doc.element.body
    found_marker = False
    for child in body:
        tag = child.tag
        if tag == qn('w:p'):
            text = Paragraph(child, doc).text
            if "Cluster: SLA e Notificações" in text:
                found_marker = True
        elif tag == qn('w:tbl') and found_marker:
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

    first_rpr = None
    runs = para.findall(qn('w:r'))
    if runs:
        rpr = runs[0].find(qn('w:rPr'))
        if rpr is not None:
            first_rpr = copy.deepcopy(rpr)

    for r in para.findall(qn('w:r')):
        para.remove(r)

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
    header_cells = header_tr.findall(qn('w:tc'))

    # If header row has fewer cells than needed, pad it
    while len(header_cells) < len(headers):
        new_tc = copy.deepcopy(header_cells[-1])
        header_tr.append(new_tc)
        header_cells = header_tr.findall(qn('w:tc'))

    for i, h in enumerate(headers):
        set_tr_cell_text(header_tr, i, h)

    data_template = copy.deepcopy(all_tr[1] if len(all_tr) > 1 else all_tr[0])
    # Ensure the template has enough columns
    template_cells = data_template.findall(qn('w:tc'))
    while len(template_cells) < len(headers):
        new_tc = copy.deepcopy(template_cells[-1])
        data_template.append(new_tc)
        template_cells = data_template.findall(qn('w:tc'))

    for tr in all_tr[1:]:
        tbl.remove(tr)

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

    table = find_sla_table(doc)
    if table is None:
        print("ERROR: could not find table after 'Cluster: SLA e Notificações' paragraph", file=sys.stderr)
        sys.exit(1)

    replace_table_content(table, HEADERS, ROWS)

    buf = io.BytesIO()
    doc.save(buf)
    sys.stdout.buffer.write(buf.getvalue())


if __name__ == "__main__":
    main()

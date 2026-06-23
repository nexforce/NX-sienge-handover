#!/usr/bin/env python3
"""
Aplica edições com ENDEREÇAMENTO ESTRUTURADO a um .docx.

Lê o .docx do stdin e a lista de edições de um JSON (argv[1]); escreve o .docx
modificado no stdout.

Cada edição endereça um bloco top-level por índice (mesma ordem de
extract_docx_structure.py) e, dentro de tabelas, por linha/coluna — em vez de
um índice achatado frágil.

Operações:
  Parágrafos soltos (bloco do tipo paragraph):
    {"operation":"replace_paragraph","block":B,"old_text_snippet":"...","new_text":"..."}
    {"operation":"insert_paragraph_after","block":B,"new_text":"..."}
    {"operation":"insert_paragraph_before","block":B,"new_text":"..."}
    {"operation":"delete_paragraph","block":B}
  Tabelas (bloco do tipo table):
    {"operation":"set_cell","block":B,"row":R,"col":C,"old_text_snippet":"...","new_text":"..."}
    {"operation":"insert_row_after","block":B,"after_row":R,"new_row_cells":["...","..."]}
    {"operation":"delete_row","block":B,"row":R}

Estabilidade de índice: os alvos são resolvidos para referências de elemento
lxml ANTES de qualquer mutação, então inserções/remoções não deslocam os índices
das demais edições do mesmo lote.

Uso:
  cat file.docx | python3 edit_docx_structured.py /tmp/edits.json > out.docx
"""
import sys
import json
import io
import copy
from docx import Document
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.text.paragraph import Paragraph
from docx.table import Table

XML_SPACE = '{http://www.w3.org/XML/1998/namespace}space'

PARA_OPS = {'replace_paragraph', 'insert_paragraph_after', 'insert_paragraph_before', 'delete_paragraph'}
TABLE_OPS = {'set_cell', 'insert_row_after', 'delete_row'}
VALID_OPS = PARA_OPS | TABLE_OPS


def top_block_elements(doc):
    out = []
    for child in doc.element.body:
        if child.tag == qn('w:p') or child.tag == qn('w:tbl'):
            out.append(child)
    return out


def normalize_text(s):
    if not s:
        return ''
    s = s.replace(' ', ' ').replace('“', '"').replace('”', '"').replace('‘', "'").replace('’', "'")
    return ' '.join(s.split())


def first_rpr(p_elem):
    r = p_elem.find(qn('w:r'))
    if r is not None:
        rpr = r.find(qn('w:rPr'))
        if rpr is not None:
            return copy.deepcopy(rpr)
    return None


def set_paragraph_text(p_elem, new_text):
    """Substitui o conteúdo de um <w:p> por um único run com new_text, mantendo o estilo do 1º run."""
    rpr = first_rpr(p_elem)
    for r in p_elem.findall(qn('w:r')):
        p_elem.remove(r)
    new_r = OxmlElement('w:r')
    if rpr is not None:
        new_r.append(rpr)
    t = OxmlElement('w:t')
    t.text = new_text
    if new_text != new_text.strip():
        t.set(XML_SPACE, 'preserve')
    new_r.append(t)
    p_elem.append(new_r)


def make_paragraph_like(anchor_p, text):
    new_p = OxmlElement('w:p')
    ppr = anchor_p.find(qn('w:pPr'))
    if ppr is not None:
        new_p.append(copy.deepcopy(ppr))
    rpr = first_rpr(anchor_p)
    new_r = OxmlElement('w:r')
    if rpr is not None:
        new_r.append(rpr)
    t = OxmlElement('w:t')
    t.text = text
    if text != text.strip():
        t.set(XML_SPACE, 'preserve')
    new_r.append(t)
    new_p.append(new_r)
    return new_p


def set_tc_text(tc, text):
    """Define o texto de uma célula <w:tc>: primeiro parágrafo recebe text, demais limpos."""
    ps = tc.findall(qn('w:p'))
    if not ps:
        np = OxmlElement('w:p')
        tc.append(np)
        ps = [np]
    set_paragraph_text(ps[0], text)
    for extra in ps[1:]:
        for r in extra.findall(qn('w:r')):
            extra.remove(r)


def fail(msg):
    print(msg, file=sys.stderr)
    sys.exit(1)


def main():
    if len(sys.argv) < 2:
        fail("Usage: edit_docx_structured.py <edits_json_path>")
    try:
        with open(sys.argv[1], 'r', encoding='utf-8') as f:
            edits = json.load(f)
    except Exception as e:
        fail(f"Failed to read edits file: {e}")

    raw = sys.stdin.buffer.read()
    if not raw:
        fail("No input on stdin")

    doc = Document(io.BytesIO(raw))
    blocks = top_block_elements(doc)

    # ---- Passo 1: resolver todos os alvos para refs de elemento (antes de mutar) ----
    resolved = []
    for edit in edits:
        op = edit.get('operation')
        if op not in VALID_OPS:
            fail(f"Operação inválida: {op!r} em {edit}")
        b = edit.get('block')
        if not isinstance(b, int) or b < 0 or b >= len(blocks):
            fail(f"block {b} fora do intervalo (documento tem {len(blocks)} blocos) em {edit}")
        elem = blocks[b]

        if op in PARA_OPS:
            if elem.tag != qn('w:p'):
                fail(f"Operação {op} requer um bloco do tipo paragraph; bloco {b} é tabela")
            snippet = edit.get('old_text_snippet', '')
            if op == 'replace_paragraph' and snippet:
                current = Paragraph(elem, doc).text
                if current and normalize_text(snippet) not in normalize_text(current):
                    fail(f"Validação falhou no bloco {b}: snippet {snippet!r} não está em {current!r}")
            resolved.append((op, edit, {'p': elem}))

        else:  # TABLE_OPS
            if elem.tag != qn('w:tbl'):
                fail(f"Operação {op} requer um bloco do tipo table; bloco {b} é parágrafo")
            table = Table(elem, doc)
            n_rows = len(table.rows)
            if op == 'set_cell':
                r, c = edit.get('row'), edit.get('col')
                if not isinstance(r, int) or r < 0 or r >= n_rows:
                    fail(f"row {r} fora do intervalo (tabela do bloco {b} tem {n_rows} linhas)")
                cells = table.rows[r].cells
                if not isinstance(c, int) or c < 0 or c >= len(cells):
                    fail(f"col {c} fora do intervalo (linha {r} tem {len(cells)} colunas)")
                tc = cells[c]._tc
                snippet = edit.get('old_text_snippet', '')
                if snippet:
                    current = cells[c].text
                    if current and normalize_text(snippet) not in normalize_text(current):
                        fail(f"Validação falhou em ({b},{r},{c}): snippet {snippet!r} não está em {current!r}")
                resolved.append((op, edit, {'tc': tc}))
            elif op == 'insert_row_after':
                r = edit.get('after_row')
                if not isinstance(r, int) or r < 0 or r >= n_rows:
                    fail(f"after_row {r} fora do intervalo (tabela do bloco {b} tem {n_rows} linhas)")
                resolved.append((op, edit, {'ref_tr': table.rows[r]._tr}))
            elif op == 'delete_row':
                r = edit.get('row')
                if not isinstance(r, int) or r < 0 or r >= n_rows:
                    fail(f"row {r} fora do intervalo (tabela do bloco {b} tem {n_rows} linhas)")
                resolved.append((op, edit, {'tr': table.rows[r]._tr}))

    # ---- Passo 2: aplicar usando as refs resolvidas ----
    for op, edit, ref in resolved:
        if op == 'replace_paragraph':
            set_paragraph_text(ref['p'], edit.get('new_text', ''))
        elif op == 'insert_paragraph_after':
            ref['p'].addnext(make_paragraph_like(ref['p'], edit.get('new_text', '')))
        elif op == 'insert_paragraph_before':
            ref['p'].addprevious(make_paragraph_like(ref['p'], edit.get('new_text', '')))
        elif op == 'delete_paragraph':
            parent = ref['p'].getparent()
            if parent is not None:
                parent.remove(ref['p'])
        elif op == 'set_cell':
            set_tc_text(ref['tc'], edit.get('new_text', ''))
        elif op == 'insert_row_after':
            cells = edit.get('new_row_cells', [])
            new_tr = copy.deepcopy(ref['ref_tr'])
            tcs = new_tr.findall(qn('w:tc'))
            for i, tc in enumerate(tcs):
                set_tc_text(tc, cells[i] if i < len(cells) else '')
            ref['ref_tr'].addnext(new_tr)
        elif op == 'delete_row':
            parent = ref['tr'].getparent()
            if parent is not None:
                parent.remove(ref['tr'])

    buf = io.BytesIO()
    doc.save(buf)
    sys.stdout.buffer.write(buf.getvalue())


if __name__ == "__main__":
    main()

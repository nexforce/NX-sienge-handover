#!/usr/bin/env python3
"""
Lê um .docx do stdin e emite uma estrutura de blocos top-level em JSON.

Diferente do extract_docx_paragraphs.py (lista achatada de 332 parágrafos,
ambígua em documentos cheios de tabela), aqui cada local editável tem um
endereço estruturado e estável:

  - Parágrafo solto (corpo):  {block}
  - Célula de tabela:         {block, row, col}
  - Linha de tabela:          {block, row}

Saída:
  {
    "blocks": [
      {"block": 0, "kind": "paragraph", "text": "..."},
      {"block": 5, "kind": "table", "n_rows": 8, "n_cols": 4,
       "rows": [["Tipo","Quando ocorre",...], ["...", ...], ...]},
      ...
    ]
  }

O índice `block` conta apenas <w:p> e <w:tbl> top-level (na mesma ordem usada
por edit_docx_structured.py), ignorando <w:sectPr> e afins.

Uso:
  cat file.docx | python3 extract_docx_structure.py
"""
import sys
import json
import io
from docx import Document
from docx.oxml.ns import qn
from docx.text.paragraph import Paragraph
from docx.table import Table


def top_block_elements(doc):
    """Elementos top-level que contam como bloco: parágrafos soltos e tabelas, em ordem."""
    out = []
    for child in doc.element.body:
        if child.tag == qn('w:p') or child.tag == qn('w:tbl'):
            out.append(child)
    return out


def main():
    raw = sys.stdin.buffer.read()
    if not raw:
        print(json.dumps({"blocks": []}))
        return

    doc = Document(io.BytesIO(raw))
    blocks = []
    for bi, elem in enumerate(top_block_elements(doc)):
        if elem.tag == qn('w:p'):
            blocks.append({
                "block": bi,
                "kind": "paragraph",
                "text": Paragraph(elem, doc).text,
            })
        else:  # w:tbl
            table = Table(elem, doc)
            rows = [[cell.text for cell in row.cells] for row in table.rows]
            blocks.append({
                "block": bi,
                "kind": "table",
                "n_rows": len(rows),
                "n_cols": (len(rows[0]) if rows else 0),
                "rows": rows,
            })

    json.dump({"blocks": blocks}, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Reads a .docx file from stdin and outputs a JSON array of paragraphs
in document order, including paragraphs inside tables.

Output format:
  [{"index": 0, "text": "paragraph text"}, ...]

Usage:
  cat file.docx | python3 extract_docx_paragraphs.py
"""
import sys
import json
import io
from docx import Document
from docx.oxml.ns import qn


def iter_paragraphs_in_order(doc):
    """
    Yields every paragraph in the document body in DOM order,
    including paragraphs inside table cells.
    This mirrors how python-docx internal iteration works but respects
    the XML tree order (tables interleaved with loose paragraphs).
    """
    body = doc.element.body
    for child in body:
        tag = child.tag
        # Loose paragraph
        if tag == qn('w:p'):
            from docx.text.paragraph import Paragraph
            yield Paragraph(child, doc)
        # Table — recurse into all rows and cells
        elif tag == qn('w:tbl'):
            from docx.table import Table
            tbl = Table(child, doc)
            for row in tbl.rows:
                for cell in row.cells:
                    for para in cell.paragraphs:
                        yield para


def main():
    raw = sys.stdin.buffer.read()
    if not raw:
        print("[]")
        return

    doc = Document(io.BytesIO(raw))
    result = []
    for idx, para in enumerate(iter_paragraphs_in_order(doc)):
        result.append({"index": idx, "text": para.text})

    json.dump(result, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    main()

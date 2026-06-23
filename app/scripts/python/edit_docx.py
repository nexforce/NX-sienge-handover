#!/usr/bin/env python3
"""
Reads a .docx file from stdin, applies a list of paragraph edits,
and writes the modified .docx to stdout.

Edits are provided as a JSON file path via argv[1].
Edit schema:
  [{"paragraph_index": int,
    "operation": "replace" | "insert_paragraph_after" | "insert_paragraph_before"
                 | "delete_paragraph" | "insert_table_row_after",
    "old_text_snippet": str,
    "new_text": str,
    "new_row_cells": [str, ...]}, ...]

`operation` defaults to "replace" (backwards compatible with the old schema).

Each edit:
  1. Locates the anchor paragraph at paragraph_index (same order as
     extract_docx_paragraphs.py).
  2. Validates that old_text_snippet matches the anchor's current text
     (normalized comparison: whitespace collapsed, NBSP and smart quotes
     folded). If it does not match, aborts with a non-zero exit code.
  3. Applies the operation:
     - replace               → replaces the full anchor paragraph text with new_text.
     - insert_paragraph_after/before → inserts a new paragraph (new_text) as a
       sibling of the anchor, inheriting the anchor's paragraph/run style.
     - delete_paragraph      → removes the anchor paragraph.
     - insert_table_row_after → clones the table row that contains the anchor and
       fills its cells with new_row_cells, inserting it right after.

Index stability: paragraph_index always refers to the ORIGINAL document order.
Anchor paragraphs are resolved up-front to live lxml element references, which
stay valid across sibling insertions/deletions — so a batch of inserts does not
shift the indices of later edits.

Style trade-off (replace / paragraph insert): multiple-run formatting collapses
to a single run using the first run's character style. This preserves
document/table/branding structure, not per-character formatting.

Usage:
  cat file.docx | python3 edit_docx.py /tmp/edits.json > modified.docx
"""
import sys
import json
import io
import copy
from docx import Document
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.text.paragraph import Paragraph

XML_SPACE = '{http://www.w3.org/XML/1998/namespace}space'

VALID_OPERATIONS = {
    'replace',
    'insert_paragraph_after',
    'insert_paragraph_before',
    'delete_paragraph',
    'insert_table_row_after',
}


def iter_paragraphs_in_order(doc):
    """
    Yields every paragraph in the document body in DOM order,
    including paragraphs inside table cells.
    Must stay in sync with extract_docx_paragraphs.py.
    """
    body = doc.element.body
    for child in body:
        tag = child.tag
        if tag == qn('w:p'):
            yield Paragraph(child, doc)
        elif tag == qn('w:tbl'):
            from docx.table import Table
            tbl = Table(child, doc)
            for row in tbl.rows:
                for cell in row.cells:
                    for para in cell.paragraphs:
                        yield para


def normalize_text(s):
    """
    Normalizes text for snippet matching: folds NBSP and smart quotes to plain
    ASCII equivalents and collapses runs of whitespace to single spaces.
    Mirrors the normalization done in the accept route before the same check.
    """
    if not s:
        return ''
    s = s.replace(' ', ' ')
    s = s.replace('“', '"').replace('”', '"')
    s = s.replace('‘', "'").replace('’', "'")
    return ' '.join(s.split())


def first_run_rpr(p_elem):
    """Returns a deep copy of the first run's <w:rPr>, or None."""
    r = p_elem.find(qn('w:r'))
    if r is not None:
        rPr = r.find(qn('w:rPr'))
        if rPr is not None:
            return copy.deepcopy(rPr)
    return None


def set_paragraph_text(para, new_text, was_empty=False, doc=None):
    """
    Replaces all runs in a paragraph with a single run containing new_text,
    preserving the character formatting of the first run and the paragraph style.

    If the paragraph was empty (was_empty=True) it may carry a heading or
    unexpected style from the original document. In that case, reset it to
    'Normal' so that added content doesn't inherit an unwanted heading style.
    """
    if was_empty and doc is not None:
        try:
            current_style = para.style.name if para.style else ''
            if current_style != 'Normal':
                para.style = doc.styles['Normal']
        except (KeyError, AttributeError):
            pass  # style 'Normal' not found — keep as-is

    p_elem = para._p
    first_run_xml = first_run_rpr(p_elem)

    # Clear all existing runs from the paragraph element
    for r in p_elem.findall(qn('w:r')):
        p_elem.remove(r)

    # Create a new run with the replacement text
    new_r = OxmlElement('w:r')
    if first_run_xml is not None:
        new_r.append(first_run_xml)
    new_t = OxmlElement('w:t')
    new_t.text = new_text
    if new_text != new_text.strip():
        new_t.set(XML_SPACE, 'preserve')
    new_r.append(new_t)
    p_elem.append(new_r)


def make_paragraph_like(anchor_p, text):
    """
    Builds a new <w:p> element that inherits the anchor's paragraph properties
    (<w:pPr>) and first-run character properties (<w:rPr>), carrying `text`.
    """
    new_p = OxmlElement('w:p')
    pPr = anchor_p.find(qn('w:pPr'))
    if pPr is not None:
        new_p.append(copy.deepcopy(pPr))
    new_r = OxmlElement('w:r')
    rPr = first_run_rpr(anchor_p)
    if rPr is not None:
        new_r.append(rPr)
    new_t = OxmlElement('w:t')
    new_t.text = text
    if text != text.strip():
        new_t.set(XML_SPACE, 'preserve')
    new_r.append(new_t)
    new_p.append(new_r)
    return new_p


def find_ancestor(elem, tag):
    """Walks up the tree from elem returning the first ancestor with `tag`."""
    parent = elem.getparent()
    while parent is not None:
        if parent.tag == qn(tag):
            return parent
        parent = parent.getparent()
    return None


def set_cell_text(tc, text, doc):
    """
    Sets the text of a table cell <w:tc>: writes `text` into the first
    paragraph and clears any remaining paragraphs in the cell.
    """
    ps = tc.findall(qn('w:p'))
    if not ps:
        new_p = OxmlElement('w:p')
        tc.append(new_p)
        ps = [new_p]
    set_paragraph_text(Paragraph(ps[0], doc), text)
    for extra in ps[1:]:
        for r in extra.findall(qn('w:r')):
            extra.remove(r)


def main():
    if len(sys.argv) < 2:
        print("Usage: edit_docx.py <edits_json_path>", file=sys.stderr)
        sys.exit(1)

    edits_path = sys.argv[1]
    try:
        with open(edits_path, 'r', encoding='utf-8') as f:
            edits = json.load(f)
    except Exception as e:
        print(f"Failed to read edits file: {e}", file=sys.stderr)
        sys.exit(1)

    raw = sys.stdin.buffer.read()
    if not raw:
        print("No input received on stdin", file=sys.stderr)
        sys.exit(1)

    doc = Document(io.BytesIO(raw))

    # Index all paragraphs once, in the same order as extract_docx_paragraphs.py.
    # These Paragraph objects wrap live lxml elements; the references stay valid
    # even as we insert/delete siblings, so original indices never shift.
    all_paragraphs = list(iter_paragraphs_in_order(doc))

    # Snapshot the original text of every paragraph BEFORE applying any edit.
    # Snippet validation runs against this snapshot, not the live text — so an
    # earlier replace on a paragraph cannot invalidate a later edit anchored to
    # the same paragraph (both snippets refer to the document the model saw).
    original_texts = [p.text for p in all_paragraphs]

    for edit in edits:
        idx = edit.get('paragraph_index')
        operation = edit.get('operation', 'replace')
        snippet = edit.get('old_text_snippet', '')
        new_text = edit.get('new_text', '')

        if operation not in VALID_OPERATIONS:
            print(f"Invalid operation {operation!r} in {edit}", file=sys.stderr)
            sys.exit(1)

        if idx is None or not isinstance(idx, int):
            print(f"Invalid edit: missing or non-integer paragraph_index in {edit}", file=sys.stderr)
            sys.exit(1)

        if idx < 0 or idx >= len(all_paragraphs):
            print(f"paragraph_index {idx} out of range (document has {len(all_paragraphs)} paragraphs)", file=sys.stderr)
            sys.exit(1)

        para = all_paragraphs[idx]
        original_text = original_texts[idx]
        was_empty = original_text.strip() == ''

        # Validate the anchor against the ORIGINAL text with normalized
        # comparison. Skip when either side is empty (empty paragraphs are
        # separators with nothing to match).
        if snippet and original_text:
            if normalize_text(snippet) not in normalize_text(original_text):
                print(
                    f"Validation failed for paragraph {idx} (op={operation}): "
                    f"old_text_snippet not found.\n"
                    f"  Expected snippet: {snippet!r}\n"
                    f"  Actual text:      {original_text!r}",
                    file=sys.stderr,
                )
                sys.exit(1)

        if operation == 'replace':
            set_paragraph_text(para, new_text, was_empty=was_empty, doc=doc)

        elif operation == 'insert_paragraph_after':
            para._p.addnext(make_paragraph_like(para._p, new_text))

        elif operation == 'insert_paragraph_before':
            para._p.addprevious(make_paragraph_like(para._p, new_text))

        elif operation == 'delete_paragraph':
            parent = para._p.getparent()
            if parent is not None:
                parent.remove(para._p)

        elif operation == 'insert_table_row_after':
            new_row_cells = edit.get('new_row_cells', [])
            if not isinstance(new_row_cells, list) or not new_row_cells:
                print(
                    f"insert_table_row_after at paragraph {idx} requires a non-empty "
                    f"new_row_cells array",
                    file=sys.stderr,
                )
                sys.exit(1)
            tr = find_ancestor(para._p, 'w:tr')
            if tr is None:
                print(
                    f"insert_table_row_after at paragraph {idx}: anchor is not inside "
                    f"a table row",
                    file=sys.stderr,
                )
                sys.exit(1)
            new_tr = copy.deepcopy(tr)
            tcs = new_tr.findall(qn('w:tc'))
            for i, tc in enumerate(tcs):
                if i < len(new_row_cells):
                    set_cell_text(tc, new_row_cells[i], doc)
                else:
                    set_cell_text(tc, '', doc)
            tr.addnext(new_tr)

    # Write modified docx to stdout
    buf = io.BytesIO()
    doc.save(buf)
    sys.stdout.buffer.write(buf.getvalue())


if __name__ == "__main__":
    main()

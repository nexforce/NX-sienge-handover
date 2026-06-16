#!/usr/bin/env python3
"""
Reads a .docx file from stdin, applies a list of paragraph edits,
and writes the modified .docx to stdout.

Edits are provided as a JSON file path via argv[1].
Edit schema:
  [{"paragraph_index": int, "old_text_snippet": str, "new_text": str}, ...]

Each edit:
  1. Locates the paragraph at paragraph_index (same order as extract_docx_paragraphs.py).
  2. Validates that old_text_snippet is a substring of the paragraph's current text.
     If not found, aborts with a non-zero exit code and an error message on stderr.
  3. Replaces the full paragraph text with new_text, preserving paragraph-level style
     (font name, size, bold/italic of the first run, paragraph alignment, spacing, etc.)
     The trade-off: multiple-run formatting collapses to a single run using the first
     run's character style. This is acceptable because our goal is to preserve
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
            from docx.text.paragraph import Paragraph
            yield Paragraph(child, doc)
        elif tag == qn('w:tbl'):
            from docx.table import Table
            tbl = Table(child, doc)
            for row in tbl.rows:
                for cell in row.cells:
                    for para in cell.paragraphs:
                        yield para


def set_paragraph_text(para, new_text, was_empty=False, doc=None):
    """
    Replaces all runs in a paragraph with a single run containing new_text,
    preserving the character formatting of the first run and the paragraph style.

    If the paragraph was empty (was_empty=True) it may carry a heading or
    unexpected style from the original document. In that case, reset it to
    'Normal' so that added content doesn't inherit an unwanted heading style.
    """
    # If the paragraph was empty, reset its style to Normal to avoid inheriting
    # heading or other structural styles that were only there as separators.
    if was_empty and doc is not None:
        try:
            current_style = para.style.name if para.style else ''
            if current_style != 'Normal':
                para.style = doc.styles['Normal']
        except (KeyError, AttributeError):
            pass  # style 'Normal' not found — keep as-is

    # Capture formatting from first run (if any)
    first_run_xml = None
    runs = para.runs
    if runs:
        # Copy the first run's rPr (run properties)
        rPr = runs[0]._r.find(qn('w:rPr'))
        if rPr is not None:
            first_run_xml = copy.deepcopy(rPr)

    # Clear all existing runs from the paragraph element
    p_elem = para._p
    for r in p_elem.findall(qn('w:r')):
        p_elem.remove(r)

    # Create a new run with the replacement text
    new_r = OxmlElement('w:r')
    if first_run_xml is not None:
        new_r.append(first_run_xml)
    new_t = OxmlElement('w:t')
    new_t.text = new_text
    # Preserve leading/trailing whitespace
    if new_text != new_text.strip():
        new_t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    new_r.append(new_t)
    p_elem.append(new_r)


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

    # Index all paragraphs once, in the same order as extract_docx_paragraphs.py
    all_paragraphs = list(iter_paragraphs_in_order(doc))

    for edit in edits:
        idx = edit.get('paragraph_index')
        snippet = edit.get('old_text_snippet', '')
        new_text = edit.get('new_text', '')

        if idx is None or not isinstance(idx, int):
            print(f"Invalid edit: missing or non-integer paragraph_index in {edit}", file=sys.stderr)
            sys.exit(1)

        if idx < 0 or idx >= len(all_paragraphs):
            print(f"paragraph_index {idx} out of range (document has {len(all_paragraphs)} paragraphs)", file=sys.stderr)
            sys.exit(1)

        para = all_paragraphs[idx]
        current_text = para.text
        was_empty = current_text.strip() == ''

        # Skip validation if either the snippet or the paragraph itself is empty.
        # Empty paragraphs have nothing to match against; Claude may target them
        # to append new content at the end of a section.
        if snippet and current_text and snippet not in current_text:
            print(
                f"Validation failed for paragraph {idx}: "
                f"old_text_snippet not found.\n"
                f"  Expected snippet: {snippet!r}\n"
                f"  Actual text:      {current_text!r}",
                file=sys.stderr,
            )
            sys.exit(1)

        set_paragraph_text(para, new_text, was_empty=was_empty, doc=doc)

    # Write modified docx to stdout
    buf = io.BytesIO()
    doc.save(buf)
    sys.stdout.buffer.write(buf.getvalue())


if __name__ == "__main__":
    main()

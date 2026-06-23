#!/usr/bin/env python3
"""
Aplica o feedback completo do João Passaro ao documento 3.0 — Aprovações.

Lê o .docx (V5) do stdin, reescreve as seções 3.1, 3.2, 3.3, 4.2, 5 e 7
conforme a revisão de junho/2026, e escreve o .docx (V6) no stdout.

Manipula python-docx diretamente (localiza tabelas/parágrafos por marcador de
texto) para reestruturações grandes que o editor por índice não cobre bem.

Uso:
  cat v5.docx | python3 fix_3_0.py > v6.docx
"""
import sys
import io
import copy
from docx import Document
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.text.paragraph import Paragraph
from docx.table import Table

XML_SPACE = '{http://www.w3.org/XML/1998/namespace}space'


# ----------------------------- helpers -----------------------------

def iter_block_items(doc):
    body = doc.element.body
    for child in body:
        if child.tag == qn('w:p'):
            yield Paragraph(child, doc)
        elif child.tag == qn('w:tbl'):
            yield Table(child, doc)


def all_paragraphs(doc):
    out = []
    for child in doc.element.body:
        if child.tag == qn('w:p'):
            out.append(Paragraph(child, doc))
        elif child.tag == qn('w:tbl'):
            for row in Table(child, doc).rows:
                for cell in row.cells:
                    out.extend(cell.paragraphs)
    return out


def find_para(doc, marker):
    """Primeiro parágrafo (incluindo dentro de tabelas) cujo texto contém marker."""
    for p in all_paragraphs(doc):
        if marker in p.text:
            return p
    raise RuntimeError(f"Parágrafo não encontrado: {marker!r}")


def find_loose_para(doc, marker):
    """Primeiro parágrafo SOLTO (fora de tabela) cujo texto contém marker."""
    for child in doc.element.body:
        if child.tag == qn('w:p'):
            p = Paragraph(child, doc)
            if marker in p.text:
                return p
    raise RuntimeError(f"Parágrafo solto não encontrado: {marker!r}")


def first_rpr(p_elem):
    r = p_elem.find(qn('w:r'))
    if r is not None:
        rpr = r.find(qn('w:rPr'))
        if rpr is not None:
            return copy.deepcopy(rpr)
    return None


def set_para_text(para, text):
    """Substitui todo o conteúdo do parágrafo por `text`, mantendo o estilo do 1º run."""
    p_elem = para._p
    rpr = first_rpr(p_elem)
    for r in p_elem.findall(qn('w:r')):
        p_elem.remove(r)
    new_r = OxmlElement('w:r')
    if rpr is not None:
        new_r.append(rpr)
    t = OxmlElement('w:t')
    t.text = text
    if text != text.strip():
        t.set(XML_SPACE, 'preserve')
    new_r.append(t)
    p_elem.append(new_r)


def set_tc_text(tc, text):
    """Define o texto de uma célula <w:tc>: primeiro parágrafo recebe text, demais são limpos."""
    ps = tc.findall(qn('w:p'))
    if not ps:
        np = OxmlElement('w:p')
        tc.append(np)
        ps = [np]
    set_para_text(Paragraph(ps[0], None), text)
    for extra in ps[1:]:
        for r in extra.findall(qn('w:r')):
            extra.remove(r)


def make_para_like(anchor_para, text):
    new_p = OxmlElement('w:p')
    ppr = anchor_para._p.find(qn('w:pPr'))
    if ppr is not None:
        new_p.append(copy.deepcopy(ppr))
    rpr = first_rpr(anchor_para._p)
    new_r = OxmlElement('w:r')
    if rpr is not None:
        new_r.append(rpr)
    t = OxmlElement('w:t')
    t.text = text
    new_r.append(t)
    new_p.append(new_r)
    return new_p


def insert_para_after(anchor_para, text):
    new_p = make_para_like(anchor_para, text)
    anchor_para._p.addnext(new_p)
    return Paragraph(new_p, None)


def table_with_cell(doc, marker):
    """Tabela que contém uma célula cujo texto contém marker."""
    for child in doc.element.body:
        if child.tag == qn('w:tbl'):
            t = Table(child, doc)
            for row in t.rows:
                for cell in row.cells:
                    if marker in cell.text:
                        return t
    raise RuntimeError(f"Tabela não encontrada pelo marcador: {marker!r}")


def row_with(table, marker):
    for row in table.rows:
        for cell in row.cells:
            if marker in cell.text:
                return row
    raise RuntimeError(f"Linha não encontrada: {marker!r}")


def set_row(row, values):
    cells = row.cells
    for i, v in enumerate(values):
        if i < len(cells):
            # cells[i] may be merged; operate on the underlying tc once
            set_tc_text(cells[i]._tc, v)


def insert_row_after(ref_row, values):
    """Clona ref_row, preenche com values e insere logo após. Retorna a nova _Row-like via tr."""
    new_tr = copy.deepcopy(ref_row._tr)
    ref_row._tr.addnext(new_tr)
    tcs = new_tr.findall(qn('w:tc'))
    for i, tc in enumerate(tcs):
        set_tc_text(tc, values[i] if i < len(values) else '')
    return new_tr


def row_with_first_cell(table, exact_text):
    """Linha cuja PRIMEIRA célula tem texto exatamente igual a exact_text."""
    for row in table.rows:
        if row.cells and row.cells[0].text.strip() == exact_text:
            return row
    raise RuntimeError(f"Linha não encontrada (1ª célula == {exact_text!r})")


def move_rows(src_table, dst_table, markers):
    """Move (clona+remove) linhas de src_table (match exato pela 1ª célula) para o fim de dst_table."""
    dst_tbl = dst_table._tbl
    for marker in markers:
        src_row = row_with_first_cell(src_table, marker)
        clone = copy.deepcopy(src_row._tr)
        dst_tbl.append(clone)
        src_row._tr.getparent().remove(src_row._tr)


# ----------------------------- mudanças -----------------------------

LINK_RETRACAO = "https://app.hubspot.com/workflows/50102745/platform/flow/1830888270/edit"


def apply_changes(doc):
    log = []

    # === 3.1 — incluir tipo Gestor Obras (GO) ===
    set_para_text(find_para(doc, "O processo cobre seis tipos distintos"),
                  "O processo cobre sete tipos distintos de aprovação:")
    t31 = table_with_cell(doc, "Orçamento (padrão)")
    insert_row_after(row_with(t31, "Implantação"), [
        "Aprovação Gestor Obras (GO)",
        "Quando o Produto Starian do orçamento é Gestor Obras (GO) e o orçamento possui assinatura — validação pelo aprovador responsável",
        "Izabela Ribeiro",
        "Orçamento (0-14) / Negócio (0-3)",
    ])
    log.append("3.1: tipo GO incluído")

    # === 3.2 — reestruturação completa da sequência de etapas ===
    t32 = table_with_cell(doc, "1. Disparo")
    # rows[0] = cabeçalho; rows[1..10] = etapas 1..10
    rows = t32.rows
    # ref para inserir sub-etapas (capturar antes de mutar)
    ref_step3 = rows[3]   # 3. Validação do Produto
    ref_step8 = rows[8]   # 8. Verificação do pipeline

    set_row(rows[2], [
        "2. Validação do desconto escalonado",
        "Verifica se há desconto escalonado no negócio e se está aprovado. Se não estiver aprovado, o orçamento é reprovado automaticamente.",
        "Branch: aprovação para a próxima etapa ou rejeição do orçamento",
    ])
    set_row(rows[3], [
        "3. Validação do Produto",
        "Verifica se o Produto Starian definido no orçamento é Sienge Plataforma (SP) ou Gestor Obras (GO).",
        "Branch: se SP, avança para a etapa 4; se GO, avança para a etapa 3.1",
    ])
    set_row(rows[4], [
        "4. Validação do Tipo de Produto",
        "Verifica se algum item de linha do orçamento é \"Serviço de implantação\". Se houver, o orçamento é recusado (rejeição automática, regra dentro do WF 1741583212). Se não houver, avança para a próxima ramificação.",
        "Branch: com implantação (recusa) ou sem implantação (avança)",
    ])
    set_row(rows[5], [
        "5. Verificação do conector",
        "Verifica se conector_aprovado_pelo_backoffice_comercial está preenchido como Sim. Se não: orçamento é rejeitado com e-mail de notificação explicando a pendência.",
        "Rejeição automática se conector não validado",
    ])
    set_row(rows[6], [
        "6. Verificação de troca de modalidade",
        "Verifica se amount < 0. Se sim: verifica se troca_de_modalidade_com_delta_negativo_aprovada_pelo_time_de_relacionamento = Sim. Se não aprovada: orçamento é rejeitado.",
        "Rejeição automática se troca sem aprovação",
    ])
    set_row(rows[7], [
        "7. Verificação do representante legal",
        "Analisa se o contato associado ao negócio possui a propriedade \"Tag Representante Legal foi adicionada?\" = Sim (propriedade de contato, texto livre, preenchida com Sim quando os dados do representante legal na empresa e no contato estão completos). Se tiver, avança; caso contrário, é rejeitado automaticamente.",
        "Branch: aprovado ou rejeição automática",
    ])
    set_row(rows[8], [
        "8. Verificação do pipeline do negócio",
        "Verifica o pipeline do negócio associado e ramifica o fluxo entre Retenção e Aquisição/Expansão.",
        "Branch: Retenção ou Aquisição/Expansão",
    ])
    # rows[9] (9. Decisão humana) — manter
    set_row(rows[10], [
        "10. Pós-aprovação",
        "WF 1741583214 (aprovado) ou WF 1741583213 (alterações solicitadas) executam as ações subsequentes: notificação ao solicitante e avanço de pipeline.",
        "Fluxo continua no pipeline de Aquisição, Expansão e Retração",
    ])
    # inserir sub-etapa 3.1 (GO) logo após a etapa 3
    insert_row_after(ref_step3, [
        "3.1. Verificação de assinatura (Gestor Obras)",
        "Para produto Gestor Obras: verifica se o orçamento possui assinatura. Com assinatura, é enviado para o aprovador (Izabela Ribeiro). Sem assinatura, é aprovado automaticamente.",
        "Branch: com assinatura ou sem assinatura",
    ])
    # inserir sub-etapas 8.2 e depois 8.1 (addnext, então inserir 8.2 primeiro)
    insert_row_after(ref_step8, [
        "8.2. Aquisição/Expansão",
        "8.2.1 Verifica a etapa do negócio associado: se estiver em \"Contrato\", avança; caso contrário, é rejeitado. 8.2.2 Verifica se o orçamento possui assinatura e se as propriedades \"Nome do responsável pelo faturamento\" e \"E-mail do responsável pelo faturamento\" estão preenchidas. Se sim, é enviado para os aprovadores (Anna, Hérica e Márcia); caso contrário, é rejeitado.",
        "Aprovadores atribuídos ou rejeição automática",
    ])
    insert_row_after(ref_step8, [
        "8.1. Retenção",
        "8.1.1 Verifica se o orçamento possui assinatura. 8.1.2 Verifica se o orçamento foi aprovado pelo CS. Se sim, é enviado para os aprovadores (Anna, Hérica e Márcia) realizarem a aprovação manual; caso contrário, é rejeitado.",
        "Aprovadores atribuídos ou rejeição automática",
    ])
    log.append("3.2: sequência de etapas reestruturada (10 etapas + 3.1, 8.1, 8.2)")

    # === Fluxo de Assinatura Digital — incluir WF 1793664676 ===
    insert_para_after(
        find_para(doc, "WF 1790745492: Assinaturas completadas"),
        "WF 1793664676: Notificação para ganho manual nos orçamentos de Retração",
    )
    log.append("3.2: WF 1793664676 incluído no fluxo de assinatura digital")

    # === Fluxo de Desconto Escalonado — limpar markdown e reforçar Aquisição ===
    set_para_text(
        find_para(doc, "O desconto escalonado é um fluxo independente"),
        "O desconto escalonado é um fluxo independente, paralelo ao da aprovação do orçamento, "
        "acionado quando possui_desconto_escalonado = Sim é detectado no negócio. Esse fluxo faz "
        "parte do processo de Aquisição:",
    )
    log.append("3.2: desconto escalonado reforçado como parte de Aquisição")

    # === Movimentação de Pipeline por Aprovação ===
    set_para_text(
        find_para(doc, "O estado do orçamento move o negócio e os tickets automaticamente"),
        "O estado do orçamento move o negócio e os tickets automaticamente, separados por pipeline "
        "(Expansão e Retração):",
    )
    tmov = table_with_cell(doc, "Orçamento criado no negócio em Solução")
    set_row(row_with(tmov, "WF 1793577625"), [
        "Orçamento assinado no negócio em Contrato (SP)",
        "Não move para Upsell; apenas notifica para ganho manual (apenas SP)",
        "WF 1793577625",
    ])
    row_360 = row_with(tmov, "WF 1793577360")
    set_row(row_360, [
        "Orçamento de retração em Solução / Formalização",
        "Ticket retorna para a etapa Formalização",
        "WF 1793577360",
    ])
    insert_row_after(row_360, [
        "Orçamento de retração encaminhado para ganho manual",
        "Notificação para ganho manual nos orçamentos de Retração",
        "WF 1793664676",
    ])
    log.append("3.2: movimentação de pipeline separada por pipeline; WF 1793664676 incluído")

    # === 3.3 — Condições de rejeição automática (novas linhas) ===
    trej = table_with_cell(doc, "Conector não validado pelo backoffice")
    last_rej = row_with(trej, "CS reprovou o orçamento")
    tr = insert_row_after(last_rej, [
        "Desconto escalonado reprovado",
        "status_da_validacao_do_desconto_escalonado = Reprovado",
        "Orçamento rejeitado automaticamente",
    ])
    # inserir as próximas após a recém-criada
    tr2 = copy.deepcopy(tr)
    tr.addnext(tr2)
    for i, v in enumerate([
        "Orçamento de Expansão/Aquisição sem assinatura",
        "Orçamento sem assinatura eletrônica em negócio de Expansão/Aquisição",
        "Orçamento reprovado automaticamente",
    ]):
        set_tc_text(tr2.findall(qn('w:tc'))[i], v)
    tr3 = copy.deepcopy(tr2)
    tr2.addnext(tr3)
    for i, v in enumerate([
        "Etapa do negócio diferente de \"Contrato\" (Expansão/Aquisição)",
        "Etapa do negócio ≠ Contrato em orçamento de Expansão/Aquisição",
        "Orçamento rejeitado automaticamente",
    ]):
        set_tc_text(tr3.findall(qn('w:tc'))[i], v)
    log.append("3.3: 3 novas condições de rejeição automática")

    # === 3.3 — Atribuição de aprovadores por canal (critérios exatos + Izabela) ===
    set_para_text(find_para(doc, "Canal 1 (Anna)"),
                  "Hérica Aliere: canais STARIAN, FOCO, CONTROLLER, RIOSOLUTION e NG7")
    set_para_text(find_para(doc, "Canal 2 (Hérica)"),
                  "Márcia Duarte: canais INACX, CONSULTORIA, NPU e GESCON")
    p_anna = find_para(doc, "Canal 3 (Márcia)")
    set_para_text(p_anna,
                  "Anna Denzer: canais EXCELÊNCIA, DELTA 3, PONTARA, PSA PLANEJAMENTO, VERTENTE MG, BR PRO e PZR TECNOLOGIA")
    insert_para_after(p_anna, "Izabela Ribeiro: produto Gestor Obras (GO)")
    log.append("3.3: aprovadores por canal com critérios exatos + Izabela (GO)")

    # === 3.3 / Bug — Task 150 causa raiz documentada ===
    set_para_text(
        find_para(doc, "orçamentos estavam sendo reprovados automaticamente"),
        "Foi identificado um caso em que orçamentos estavam sendo reprovados automaticamente mesmo "
        "com todas as informações corretas. Causa raiz: com a nova regra de geração de orçamento via "
        "custom code, a base antiga não estava com as definições de rótulo de associações corretas. "
        "Solução aplicada: aplicar o rótulo manualmente nos casos antigos (status: done).",
    )

    # === 3.3 — Workflow desativado substituído ===
    set_para_text(find_para(doc, "WF 1793114638 — Desatualizado"),
                  "WF 1793114638 — Substituído")
    set_para_text(
        find_para(doc, "O workflow de geração automática de orçamento para retração está desativado"),
        "O workflow de geração automática de orçamento para retração (WF 1793114638) foi substituído "
        f"pelo novo fluxo de geração de orçamento via custom code: {LINK_RETRACAO}.",
    )
    log.append("3.3: workflow desativado substituído pelo novo fluxo")

    # === 4.2 — mover 4 propriedades de Orçamento (0-14) para Negócio (0-3) ===
    # marcadores únicos das tabelas de propriedades (hs_status / possui_desconto_escalonado
    # também aparecem nas tabelas 3.2/3.1, então usamos células exclusivas de cada tabela 4.2)
    t_orc = table_with_cell(doc, "hs_show_signature_box")
    t_neg = table_with_cell(doc, "responsavel_pela_aprovacao_do_desconto_escalonado")
    move_rows(t_orc, t_neg, [
        "conector_aprovado_pelo_backoffice_comercial",
        "troca_de_modalidade_com_delta_negativo_aprovada_pelo_time_de_relacionamento",
        "orcamento_aprovado_pelo_cs",
        "amount",
    ])
    log.append("4.2: 4 propriedades movidas de Orçamento (0-14) para Negócio (0-3)")

    # === 5 — Riscos e Dependências ===
    set_para_text(
        find_para(doc, "O workflow de geração automática de orçamento para retração (WF 1793114638) está desativado e marcado"),
        "O workflow de geração automática de orçamento para retração (WF 1793114638) foi substituído "
        f"pelo novo fluxo de geração de orçamento via custom code: {LINK_RETRACAO}. Risco mitigado.",
    )
    set_para_text(
        find_para(doc, "Task 150 registrou casos de orçamentos sendo rejeitados"),
        "Task 150 registrou casos de orçamentos rejeitados automaticamente. Causa raiz: com a nova "
        "regra de geração de orçamento via custom code, a base antiga não estava com as definições de "
        "rótulo de associações corretas. Solução aplicada: aplicar o rótulo manualmente nos casos "
        "antigos. Task resolvida (done).",
    )
    set_para_text(
        find_para(doc, "Orçamentos com assinatura digital dependem de dados completos"),
        "Orçamentos com assinatura digital dependem de dados completos do representante legal "
        "cadastrado na Empresa. Além disso, é necessário que o contato associado tenha a propriedade "
        "\"Tag Representante Legal foi adicionada?\" = Sim. Se não preenchidos, o orçamento é rejeitado "
        "automaticamente antes de chegar ao aprovador humano.",
    )
    log.append("5: riscos atualizados (WF substituído, causa raiz Task 150, tag representante legal)")

    # === 7 — Pontos a Validar -> resolvidos ===
    set_para_text(
        find_para(doc, "Os itens abaixo não puderam ser confirmados"),
        "Os itens abaixo foram validados com o responsável João Passaro na revisão de junho/2026 e "
        "estão resolvidos.",
    )
    pv = [
        ("PV-1 — Fluxo de geração de orçamentos para CS em retração — WF desativado",
         "O WF 1793114638 (geração automática de orçamento para retração) está desativado.",
         f"Resolvido: o WF 1793114638 foi substituído pelo novo fluxo de geração de orçamento via custom code: {LINK_RETRACAO}."),
        ("PV-2 — Causa raiz da rejeição automática indevida (Task 150)",
         "A task 150 foi marcada como done, mas a causa raiz do bug não está documentada.",
         "Resolvido: causa raiz — com a nova regra de geração de orçamento via custom code, a base antiga não estava com as definições de rótulo de associações corretas. Solução: aplicar o rótulo manualmente nos casos antigos."),
        ("PV-3 — Aprovadores exatos por canal — nomes e IDs",
         "Os branches do WF 1741583212 indicam Anna, Hérica e Márcia como aprovadores.",
         "Resolvido. Aprovadores por canal: Hérica Aliere (STARIAN, FOCO, CONTROLLER, RIOSOLUTION, NG7); Márcia Duarte (INACX, CONSULTORIA, NPU, GESCON); Anna Denzer (EXCELÊNCIA, DELTA 3, PONTARA, PSA PLANEJAMENTO, VERTENTE MG, BR PRO, PZR TECNOLOGIA); Izabela Ribeiro (produto Gestor Obras)."),
        ("PV-4 — Aprovação para pipeline de Retração — quem aprova",
         "O WF 1741583212 tem um branch específico para Retração.",
         "Resolvido: para orçamentos de retração, os aprovadores são os mesmos das novas vendas, definidos por canal."),
        ("PV-5 — Ajustes no pipeline de Retração — Task 646",
         "Task 646 ([Retração] Ajustes no Pipeline de Negócios) está com status",
         "Resolvido: a Task 646 foi a construção inicial do processo — regras e lógicas de emissão de orçamento via custom code, ajuste do processo de aprovação e seus validadores, além das regras de movimentação manual e alertas."),
        ("PV-6 — Workflow de movimentação para Upsell no GO",
         "O WF 1793577625 avança negócios [SP] para Upsell após orçamento assinado.",
         "Resolvido: a movimentação para Upsell existe apenas para Sienge Plataforma (SP); não há fluxo equivalente para Gestor Obras (GO)."),
    ]
    for title, body_marker, new_body in pv:
        # título: anexar " — Resolvido"
        try:
            tp = find_para(doc, title)
            if "Resolvido" not in tp.text:
                set_para_text(tp, tp.text + " — Resolvido")
        except RuntimeError:
            pass
        set_para_text(find_para(doc, body_marker), new_body)
    log.append("7: PV-1 a PV-6 resolvidos")

    return log


def main():
    raw = sys.stdin.buffer.read()
    if not raw:
        print("No input on stdin", file=sys.stderr)
        sys.exit(1)
    doc = Document(io.BytesIO(raw))
    log = apply_changes(doc)
    for line in log:
        print("[fix_3_0] " + line, file=sys.stderr)
    buf = io.BytesIO()
    doc.save(buf)
    sys.stdout.buffer.write(buf.getvalue())


if __name__ == "__main__":
    main()

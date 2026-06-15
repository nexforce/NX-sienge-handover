#!/usr/bin/env python3
"""
Separa sienge_tarefas_clickup_completo.md em 15 arquivos (um por processo) + não classificadas
"""

import re
from pathlib import Path
from collections import defaultdict

INPUT_FILE = "/home/hugo-zanni/Nexforce/Projects/handover-sienge/docs/clickup/sienge_tarefas_clickup_completo.md"
OUTPUT_DIR = "/home/hugo-zanni/Nexforce/Projects/handover-sienge/docs/clickup/processos"

PROCESSOS = {
    "1.0": "Pré Vendas",
    "2.0": "Vendas e Contratação",
    "2.1": "Vendas — Contrato/Portfólio",
    "2.2": "Vendas [Dev]",
    "3.0": "Aprovações",
    "4.0": "Precificação",
    "4.1": "Precificação [Dev]",
    "5.0": "Minutas",
    "5.1": "Minutas [Dev]",
    "6.0": "CS e Atendimento",
    "7.0": "KPIs e Indicadores",
    "8.0": "Governança e Permissões",
    "8.1": "Integrações Oracle",
    "8.2": "Integrações RD Station",
    "8.3": "Integrações Freshdesk",
}

def parse_markdown_table(lines):
    """Extrai linhas de uma tabela markdown e as retorna como dicts"""
    tasks = []
    in_table = False
    headers = []

    for line in lines:
        line = line.strip()

        # Detecta início de tabela
        if line.startswith("|") and not in_table:
            in_table = True
            # Próxima linha será o separador, depois os dados
            continue

        # Pula o separador
        if in_table and line.startswith("|") and "-" in line:
            continue

        # Processa linhas de dados
        if in_table and line.startswith("|"):
            parts = [p.strip() for p in line.split("|")[1:-1]]

            if len(parts) >= 8:
                task = {
                    "numero": parts[0],
                    "id": parts[1],
                    "nome": parts[2],
                    "status": parts[3],
                    "prioridade": parts[4],
                    "responsavel": parts[5],
                    "tags": parts[6],
                    "descricao": parts[7] if len(parts) > 7 else ""
                }
                tasks.append(task)

        # Detecta fim de tabela (linha vazia ou nova seção)
        elif in_table and (line == "" or line.startswith("##")):
            in_table = False

    return tasks

def classify_task(task):
    """Classifica tarefa no processo correto usando regras de prioridade"""
    nome = task["nome"].lower()
    tags = task["tags"].lower()
    responsavel = task["responsavel"].lower()
    descricao = task["descricao"].lower()

    # Nível 1: Tags específicas
    if "minutas" in tags and "sienge" in tags:
        return "5.0"
    if "minutas" in tags:
        return "5.0"
    if "cs" in tags:
        return "6.0"

    # Nível 2: Prefixo [X] no título
    prefixos = {
        "[minutas]": "5.0",
        "[kpis]": "7.0",
        "[governança]": "8.0",
        "[inbound": "1.0",
        "[outbound": "1.0",
        "[eventos]": "1.0",
        "[inside sales": "1.0",
        "[canais]": "1.0",
        "[engajamento]": "6.0",
        "[onboarding]": "6.0",
        "[retração cs": "6.0",
        "[atendimento reativo]": "6.0",
        "[aprovações orçamentos]": "3.0",
        "[grupos de contratos]": "2.1",
        "[portfólio]": "2.1",
        "[anuentes]": "2.1",
    }

    for prefixo, processo in prefixos.items():
        if nome.startswith(prefixo):
            return processo

    # Nível 3: Palavras-chave no título
    keywords = {
        "minuta": "5.0",
        "projuris": "5.0",
        "rd station": "8.2",
        "mql": "8.2",
        "freshdesk": "8.3",
        "oracle": "8.1",
        "kpi": "7.0",
        "indicador": "7.0",
        "permiss": "8.0",
        "governança": "8.0",
        "acesso": "8.0",
    }

    for keyword, processo in keywords.items():
        if keyword in nome or keyword in descricao:
            return processo

    # Nível 4: Responsável mapeado único
    responsaveis_unicos = {
        "vinicius vieira braz": "2.0",
        "joão passaro": "3.0",
        "pedro soave neto": "8.0",
    }

    for resp, processo in responsaveis_unicos.items():
        if resp in responsavel:
            return processo

    # Nível 5: Responsável + tags grupo
    if "elias" in responsavel:
        if "grupo 1" in tags:
            return "1.0"
        if "grupo" not in tags:
            return "8.2"  # RD Station

    if "vinicius vanoni" in responsavel:
        if "grupo 2" in tags:
            # Desambigua por título
            if "portfólio" in nome or "contrato" in nome or "anuente" in nome:
                return "2.1"
            return "4.0"  # Precificação
        return "8.1"  # Oracle

    if "jorge souza" in responsavel:
        if "grupo 2" in tags:
            if "minuta" in nome:
                return "5.1"
            if "precif" in nome:
                return "4.1"
            return "2.2"
        return "0.0"

    if "moisés" in responsavel or "moises" in responsavel:
        if "minutas" in tags or "minuta" in nome:
            return "5.0"
        if "grupo 3" in tags:
            return "6.0"
        if "grupo 4" in tags:
            if "kpi" in nome or "indicador" in nome:
                return "7.0"
            return "8.3"  # Freshdesk
        if "cs" in tags or "atendimento" in nome:
            return "6.0"

    # Nível 6: Não classificada
    return "0.0"

def main():
    # Cria diretório de saída
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)

    # Lê arquivo de entrada
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # Parseia todas as tarefas
    tasks = parse_markdown_table(lines)
    print(f"✓ Lidas {len(tasks)} tarefas do arquivo de entrada")

    # Classifica tarefas por processo
    classified = defaultdict(list)
    for task in tasks:
        processo = classify_task(task)
        classified[processo].append(task)

    # Gera arquivos por processo
    total_escrito = 0
    for processo_id in sorted(classified.keys()):
        tasks_processo = classified[processo_id]
        total_escrito += len(tasks_processo)

        # Define nome do processo
        if processo_id == "0.0":
            nome_processo = "Não Classificadas"
        else:
            nome_processo = PROCESSOS.get(processo_id, "Desconhecido")

        # Monta caminho (sanitiza caracteres especiais)
        nome_sanitizado = nome_processo.replace("—", "-").replace("/", "-")
        output_file = Path(OUTPUT_DIR) / f"{processo_id} - {nome_sanitizado}.md"

        # Escreve cabeçalho
        content = f"# {processo_id} — {nome_processo}\n\n"
        content += "## Tarefas do ClickUp\n\n"

        # Escreve tabela
        content += "| # | ID | Nome | Status | Prioridade | Responsável | Tags | Descrição |\n"
        content += "|---|---|---|---|---|---|---|---|\n"

        for task in tasks_processo:
            content += f"| {task['numero']} | {task['id']} | {task['nome']} | {task['status']} | {task['prioridade']} | {task['responsavel']} | {task['tags']} | {task['descricao']} |\n"

        # Escreve arquivo
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(content)

        print(f"✓ {processo_id} — {nome_processo}: {len(tasks_processo)} tarefas")

    print(f"\n✓ Total escrito: {total_escrito} tarefas")
    print(f"✓ Arquivos gerados em: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()

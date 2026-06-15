# Sistema de Controle de Revisão de Documentos

## Objetivo

Criar uma aplicação web para gerenciar o processo de revisão de 15 documentos de um cliente, permitindo acompanhar versões, comentários dos revisores e o status de aprovação de cada documento.

---

# Funcionalidades

## Dashboard de Documentos

A página inicial deve apresentar os 15 documentos em formato de cards.

### Cada card deve exibir:

- Nome do documento;
- Revisor responsável;
- Status atual;
- Data da última atualização;
- Indicador visual com cor correspondente ao status.

### Ações disponíveis

- Abrir o documento para visualizar seu histórico de versões.

---

# Tela do Documento

Ao selecionar um documento, o usuário deve acessar uma página dedicada contendo:

## Informações Gerais

- Nome do documento;
- Revisor responsável;
- Status atual;
- Botão para adicionar uma nova versão(upload) e um lugar de colocar o link(google docs).

---

# Histórico de Versões

Cada documento deve possuir um histórico contendo todas as versões cadastradas.

Exemplo:

- V1 - 05/06/2026
- V2 - 08/06/2026
- V3 - 11/06/2026

Cada versão é independente e possui:

- Status próprio;
- Comentários próprios;
- Data de criação;
- Link para o documento.

---

# Estrutura de uma Versão

Cada versão deverá possuir os seguintes campos:

| Campo             | Descrição                           |
| ----------------- | ----------------------------------- |
| Número da versão  | V1, V2, V3, etc.                    |
| Data de criação   | Data em que a versão foi adicionada |
| Link do documento | URL do Google Docs, PDF ou arquivo  |
| Status            | Estado atual da revisão             |

---

# Sistema de Comentários

Cada versão deve possuir uma área para comentários em formato de conversa.

## Informações do comentário

- Autor;
- Data e hora;
- Texto do comentário.

### Exemplo

João Silva — 09/06/2026 14:30

> A seção 3 precisa de mais detalhes.

Maria Santos — 09/06/2026 17:20

> Atualizado conforme solicitado.

### Ações disponíveis

- Adicionar comentário;
- Visualizar comentários anteriores.

---

# Status da Revisão

O sistema deverá possuir os seguintes status:

| Status          | Cor          |
| --------------- | ------------ |
| Pendente        | Cinza        |
| Em Progresso    | amarelo      |
| Under Review    | roxo         |
| Review Refused  | Vermelho     |
| Review Approved | Verde Claro  |
| Done            | Verde Escuro |

---

# Fluxo de Aprovação

```text
Pendente
    ↓
Em Progresso
    ↓
Under Review
   ↙        ↘
Review Refused   Review Approved
      ↓               ↓
Em Progresso         Done
```

## Porém, não precisa de uma ordem fixa, pode ir de Pendente para Done, por exemplo.

---

# Funcionalidades do Dashboard

- Visualizar todos os documentos;
- Visualizar status atual;
- Abrir documento;
- Identificar visualmente o status através das cores.

---

# Funcionalidades da Página do Documento

- Visualizar histórico de versões;
- Adicionar nova versão;
- Alterar status da versão;
- Adicionar comentários;
- Visualizar comentários anteriores;
- Visualizar data e autor de cada comentário.

---

# Estrutura de Dados

## Documento

```ts
Document {
    id
    nome
    revisor
    statusAtual
    ultimaAtualizacao
}
```

## Versão

```ts
DocumentVersion {
    id
    documentId
    numeroVersao
    linkDocumento
    status
    dataCriacao
}
```

## Comentário

```ts
Comment {
    id
    versionId
    mensagem
    dataCriacao
}
```

---

# Outras funcionalidades Melhorias

## Filtros

Permitir filtrar documentos pelos seguintes status:

- Todos;
- Pendente;
- Em Progresso;
- Under Review;
- Review Refused;
- Review Approved;
- Done.

---

## Busca

Permitir pesquisar documentos pelo nome.

---

## Ordenação

Permitir ordenar por:

- Mais recentes;
- Status;
- Revisor responsável.

---

## Dashboard de Métricas

Exibir indicadores no topo da página:

- Quantidade total de documentos;
- Quantidade por status;
- Quantidade de documentos concluídos.

Exemplo:

- 15 documentos totais;
- 3 Pendentes;
- 5 Em Progresso;
- 2 Under Review;
- 1 Review Refused;
- 2 Review Approved;
- 2 Done.

---

# Tecnologias Sugeridas

## Frontend

- React;
- Next.js;
- Tailwind CSS;
- Shadcn UI.

- Use a skill `nexforce-brand`

## Backend

- prisma.

## Banco de Dados

### Tabelas

- Documents;
- DocumentVersions;
- Comments.

---

# Objetivo Final

Disponibilizar uma ferramenta simples para acompanhamento do ciclo de revisão dos documentos do cliente, permitindo rastrear versões, centralizar comentários e acompanhar o progresso das aprovações de maneira organizada e visual.

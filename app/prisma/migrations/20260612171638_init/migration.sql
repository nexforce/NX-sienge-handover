-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "revisor" TEXT NOT NULL,
    "statusAtual" TEXT NOT NULL DEFAULT 'Pendente',
    "ultimaAtualizacao" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DocumentVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "numeroVersao" TEXT NOT NULL,
    "linkDocumento" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "versionId" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comment_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "DocumentVersion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

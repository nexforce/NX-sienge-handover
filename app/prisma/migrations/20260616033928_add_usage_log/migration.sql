-- CreateTable
CREATE TABLE "UsageLog" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "costUsd" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageLog_pkey" PRIMARY KEY ("id")
);

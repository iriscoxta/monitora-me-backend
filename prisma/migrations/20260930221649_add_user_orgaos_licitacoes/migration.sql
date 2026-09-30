-- CreateTable
CREATE TABLE "orgaos" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "razao_social" TEXT NOT NULL,

    CONSTRAINT "orgaos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "licitacoes" (
    "id" TEXT NOT NULL,
    "numeroControlePncp" TEXT NOT NULL,
    "orgaoId" TEXT NOT NULL,

    CONSTRAINT "licitacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orgaos_cnpj_key" ON "orgaos"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "licitacoes_numeroControlePncp_key" ON "licitacoes"("numeroControlePncp");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "licitacoes" ADD CONSTRAINT "licitacoes_orgaoId_fkey" FOREIGN KEY ("orgaoId") REFERENCES "orgaos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

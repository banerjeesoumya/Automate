-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "isTemplate" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TemplateMeta" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateMeta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TemplateMeta_workflowId_key" ON "TemplateMeta"("workflowId");

-- AddForeignKey
ALTER TABLE "TemplateMeta" ADD CONSTRAINT "TemplateMeta_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "diagnostic_report_templates" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT,
    "templateCode" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "description" TEXT,
    "testCategory" TEXT NOT NULL,
    "testSubCategory" TEXT,
    "testId" TEXT,
    "testCode" TEXT,
    "templateType" TEXT NOT NULL DEFAULT 'TABULAR',
    "headerConfig" JSONB,
    "sections" JSONB NOT NULL,
    "entryFields" JSONB,
    "referenceRanges" JSONB,
    "footerConfig" JSONB,
    "styling" JSONB,
    "printConfig" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "previousVersion" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isSystemTemplate" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostic_report_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "diagnostic_report_templates_hospitalId_idx" ON "diagnostic_report_templates"("hospitalId");

-- CreateIndex
CREATE INDEX "diagnostic_report_templates_testCategory_idx" ON "diagnostic_report_templates"("testCategory");

-- CreateIndex
CREATE INDEX "diagnostic_report_templates_templateCode_idx" ON "diagnostic_report_templates"("templateCode");

-- CreateIndex
CREATE INDEX "diagnostic_report_templates_isActive_idx" ON "diagnostic_report_templates"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_report_templates_hospitalId_templateCode_key" ON "diagnostic_report_templates"("hospitalId", "templateCode");

-- AddForeignKey
ALTER TABLE "diagnostic_report_templates" ADD CONSTRAINT "diagnostic_report_templates_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `entryFields` on the `diagnostic_report_templates` table. All the data in the column will be lost.
  - You are about to drop the column `previousVersion` on the `diagnostic_report_templates` table. All the data in the column will be lost.
  - You are about to drop the column `testCategory` on the `diagnostic_report_templates` table. All the data in the column will be lost.
  - Added the required column `category` to the `diagnostic_report_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `department` to the `diagnostic_report_templates` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX IF EXISTS "diagnostic_report_templates_testCategory_idx";

-- First, add columns with defaults to handle existing data
ALTER TABLE "diagnostic_report_templates" 
ADD COLUMN IF NOT EXISTS "category" TEXT,
ADD COLUMN IF NOT EXISTS "department" TEXT;

-- Migrate existing testCategory to category
UPDATE "diagnostic_report_templates" 
SET "category" = COALESCE("testCategory", 'PATHOLOGY'),
    "department" = 'LAB'
WHERE "category" IS NULL;

-- Now make them NOT NULL
ALTER TABLE "diagnostic_report_templates" 
ALTER COLUMN "category" SET NOT NULL,
ALTER COLUMN "department" SET NOT NULL;

-- AlterTable - Drop old columns and add new ones
ALTER TABLE "diagnostic_report_templates" DROP COLUMN IF EXISTS "entryFields",
DROP COLUMN IF EXISTS "previousVersion",
DROP COLUMN IF EXISTS "testCategory",
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "attachmentConfig" JSONB DEFAULT '{}',
ADD COLUMN     "calculatedFields" JSONB DEFAULT '[]',
ADD COLUMN     "complianceConfig" JSONB DEFAULT '{}',
ADD COLUMN     "criticalValueRules" JSONB DEFAULT '{}',
ADD COLUMN     "fhirMapping" JSONB DEFAULT '{}',
ADD COLUMN     "fields" JSONB DEFAULT '[]',
ADD COLUMN     "interpretationRules" JSONB DEFAULT '[]',
ADD COLUMN     "isEditable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lockedAt" TIMESTAMP(3),
ADD COLUMN     "previousVersionId" TEXT,
ADD COLUMN     "repeatableSections" JSONB DEFAULT '[]',
ADD COLUMN     "shortName" TEXT,
ADD COLUMN     "signOffConfig" JSONB DEFAULT '{}',
ADD COLUMN     "specimenConfig" JSONB DEFAULT '{}',
ADD COLUMN     "specimenSchema" JSONB DEFAULT '[]',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "subDepartment" TEXT,
ADD COLUMN     "supportsMultiSpecimen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "validationRules" JSONB DEFAULT '{}',
ADD COLUMN     "versionNotes" TEXT,
ALTER COLUMN "sections" SET DEFAULT '[]',
ALTER COLUMN "referenceRanges" SET DEFAULT '{}',
ALTER COLUMN "footerConfig" SET DEFAULT '{}',
ALTER COLUMN "styling" SET DEFAULT '{}',
ALTER COLUMN "printConfig" SET DEFAULT '{}';

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "gestationalWeeks" INTEGER,
ADD COLUMN     "isPregnant" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "template_audit_logs" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB,
    "reason" TEXT,
    "performedBy" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "template_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_reports" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "templateVersion" INTEGER NOT NULL,
    "templateSnapshot" JSONB,
    "diagnosticOrderId" TEXT,
    "orderItemId" TEXT,
    "testCode" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "testCategory" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "specimens" JSONB NOT NULL DEFAULT '[]',
    "results" JSONB NOT NULL DEFAULT '{}',
    "referenceRangesUsed" JSONB,
    "calculatedResults" JSONB DEFAULT '{}',
    "interpretation" TEXT,
    "autoInterpretation" TEXT,
    "manualInterpretation" TEXT,
    "impressions" TEXT,
    "recommendations" TEXT,
    "hasCriticalValues" BOOLEAN NOT NULL DEFAULT false,
    "criticalValues" JSONB DEFAULT '[]',
    "criticalNotifiedAt" TIMESTAMP(3),
    "criticalNotifiedTo" TEXT,
    "criticalAcknowledgedAt" TIMESTAMP(3),
    "criticalAcknowledgedBy" TEXT,
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "repeatableSectionsData" JSONB DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "workflowHistory" JSONB NOT NULL DEFAULT '[]',
    "enteredBy" TEXT,
    "enteredAt" TIMESTAMP(3),
    "entryNotes" TEXT,
    "qcStatus" TEXT,
    "qcCheckedBy" TEXT,
    "qcCheckedAt" TIMESTAMP(3),
    "qcNotes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewerNotes" TEXT,
    "reviewerDesignation" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approverDesignation" TEXT,
    "digitalSignature" TEXT,
    "signatureVerified" BOOLEAN NOT NULL DEFAULT false,
    "isReleased" BOOLEAN NOT NULL DEFAULT false,
    "releasedAt" TIMESTAMP(3),
    "releasedBy" TEXT,
    "releaseMode" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "lockReason" TEXT,
    "isAmended" BOOLEAN NOT NULL DEFAULT false,
    "amendmentCount" INTEGER NOT NULL DEFAULT 0,
    "amendments" JSONB NOT NULL DEFAULT '[]',
    "visibleToPatient" BOOLEAN NOT NULL DEFAULT false,
    "patientViewedAt" TIMESTAMP(3),
    "patientDownloadedAt" TIMESTAMP(3),
    "patientAccessToken" TEXT,
    "deliveryStatus" TEXT,
    "deliveryMode" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "deliveryDetails" JSONB,
    "printCount" INTEGER NOT NULL DEFAULT 0,
    "lastPrintedAt" TIMESTAMP(3),
    "lastPrintedBy" TEXT,
    "pdfUrl" TEXT,
    "pdfGeneratedAt" TIMESTAMP(3),
    "fhirResourceId" TEXT,
    "fhirExportedAt" TIMESTAMP(3),
    "isBilled" BOOLEAN NOT NULL DEFAULT false,
    "billId" TEXT,
    "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostic_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "template_audit_logs_templateId_idx" ON "template_audit_logs"("templateId");

-- CreateIndex
CREATE INDEX "template_audit_logs_performedAt_idx" ON "template_audit_logs"("performedAt");

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_reports_reportId_key" ON "diagnostic_reports"("reportId");

-- CreateIndex
CREATE INDEX "diagnostic_reports_reportId_idx" ON "diagnostic_reports"("reportId");

-- CreateIndex
CREATE INDEX "diagnostic_reports_hospitalId_idx" ON "diagnostic_reports"("hospitalId");

-- CreateIndex
CREATE INDEX "diagnostic_reports_patientId_idx" ON "diagnostic_reports"("patientId");

-- CreateIndex
CREATE INDEX "diagnostic_reports_templateId_idx" ON "diagnostic_reports"("templateId");

-- CreateIndex
CREATE INDEX "diagnostic_reports_testCode_idx" ON "diagnostic_reports"("testCode");

-- CreateIndex
CREATE INDEX "diagnostic_reports_status_idx" ON "diagnostic_reports"("status");

-- CreateIndex
CREATE INDEX "diagnostic_reports_isReleased_idx" ON "diagnostic_reports"("isReleased");

-- CreateIndex
CREATE INDEX "diagnostic_reports_reportDate_idx" ON "diagnostic_reports"("reportDate");

-- CreateIndex
CREATE INDEX "diagnostic_report_templates_category_idx" ON "diagnostic_report_templates"("category");

-- CreateIndex
CREATE INDEX "diagnostic_report_templates_department_idx" ON "diagnostic_report_templates"("department");

-- CreateIndex
CREATE INDEX "diagnostic_report_templates_templateType_idx" ON "diagnostic_report_templates"("templateType");

-- CreateIndex
CREATE INDEX "diagnostic_report_templates_status_idx" ON "diagnostic_report_templates"("status");

-- AddForeignKey
ALTER TABLE "template_audit_logs" ADD CONSTRAINT "template_audit_logs_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "diagnostic_report_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_reports" ADD CONSTRAINT "diagnostic_reports_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_reports" ADD CONSTRAINT "diagnostic_reports_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_reports" ADD CONSTRAINT "diagnostic_reports_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "diagnostic_report_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_reports" ADD CONSTRAINT "diagnostic_reports_diagnosticOrderId_fkey" FOREIGN KEY ("diagnosticOrderId") REFERENCES "diagnostic_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "city" TEXT,
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "state" TEXT;

-- CreateTable
CREATE TABLE "patient_visits" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "visitType" TEXT NOT NULL,
    "visitCategory" TEXT NOT NULL,
    "chiefComplaint" TEXT,
    "symptoms" JSONB,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "assignedDoctorId" TEXT,
    "assignedDoctorName" TEXT,
    "departmentCode" TEXT,
    "isEmergency" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "billId" TEXT,
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_visits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patient_visits_visitId_key" ON "patient_visits"("visitId");

-- CreateIndex
CREATE INDEX "patient_visits_hospitalId_idx" ON "patient_visits"("hospitalId");

-- CreateIndex
CREATE INDEX "patient_visits_patientId_idx" ON "patient_visits"("patientId");

-- CreateIndex
CREATE INDEX "patient_visits_visitId_idx" ON "patient_visits"("visitId");

-- CreateIndex
CREATE INDEX "patient_visits_visitType_idx" ON "patient_visits"("visitType");

-- CreateIndex
CREATE INDEX "patient_visits_status_idx" ON "patient_visits"("status");

-- CreateIndex
CREATE INDEX "patient_visits_visitDate_idx" ON "patient_visits"("visitDate");

-- AddForeignKey
ALTER TABLE "patient_visits" ADD CONSTRAINT "patient_visits_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_visits" ADD CONSTRAINT "patient_visits_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_visits" ADD CONSTRAINT "patient_visits_billId_fkey" FOREIGN KEY ("billId") REFERENCES "bills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

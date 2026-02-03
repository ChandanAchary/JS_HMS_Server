-- AlterTable
ALTER TABLE "bills" ADD COLUMN     "departmentCode" TEXT,
ADD COLUMN     "isEmergency" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "visitType" TEXT;

-- CreateTable
CREATE TABLE "patient_queues" (
    "id" TEXT NOT NULL,
    "queueNumber" TEXT NOT NULL,
    "tokenNumber" INTEGER NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "billId" TEXT,
    "serviceQueueId" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "priorityReason" TEXT,
    "isEmergency" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "originalPosition" INTEGER,
    "estimatedWaitTime" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calledAt" TIMESTAMP(3),
    "servedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "serviceName" TEXT,
    "serviceType" TEXT,
    "counterNumber" TEXT,
    "assignedToId" TEXT,
    "assignedToName" TEXT,
    "assignedToRole" TEXT,
    "skipCount" INTEGER NOT NULL DEFAULT 0,
    "maxSkips" INTEGER NOT NULL DEFAULT 3,
    "lastSkippedAt" TIMESTAMP(3),
    "recalledAt" TIMESTAMP(3),
    "transferredFrom" TEXT,
    "transferredTo" TEXT,
    "transferReason" TEXT,
    "diagnosticOrderId" TEXT,
    "notes" TEXT,
    "specialNeeds" TEXT,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "notificationSentAt" TIMESTAMP(3),
    "notificationMode" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_queues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_queues" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "queueCode" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "shortName" TEXT,
    "serviceType" TEXT NOT NULL,
    "department" TEXT,
    "doctorId" TEXT,
    "employeeId" TEXT,
    "counterNumber" TEXT,
    "location" TEXT,
    "maxCapacity" INTEGER NOT NULL DEFAULT 50,
    "currentCount" INTEGER NOT NULL DEFAULT 0,
    "averageServiceTime" INTEGER NOT NULL DEFAULT 15,
    "workingHours" JSONB,
    "breakTimes" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAcceptingPatients" BOOLEAN NOT NULL DEFAULT true,
    "isPaused" BOOLEAN NOT NULL DEFAULT false,
    "pauseReason" TEXT,
    "currentToken" INTEGER NOT NULL DEFAULT 0,
    "nextToken" INTEGER NOT NULL DEFAULT 1,
    "currentServingId" TEXT,
    "lastResetDate" TIMESTAMP(3),
    "todayPatientCount" INTEGER NOT NULL DEFAULT 0,
    "priorityRatio" INTEGER NOT NULL DEFAULT 3,
    "emergencyFirst" BOOLEAN NOT NULL DEFAULT true,
    "displayEnabled" BOOLEAN NOT NULL DEFAULT true,
    "displayMessage" TEXT,
    "announcementEnabled" BOOLEAN NOT NULL DEFAULT true,
    "avgWaitTimeToday" INTEGER,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_queues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue_history" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "serviceQueueId" TEXT NOT NULL,
    "patientQueueId" TEXT NOT NULL,
    "queueDate" DATE NOT NULL,
    "tokenNumber" INTEGER NOT NULL,
    "priority" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL,
    "calledAt" TIMESTAMP(3),
    "servedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "waitTimeMinutes" INTEGER,
    "serviceTimeMinutes" INTEGER,
    "totalTimeMinutes" INTEGER,
    "finalStatus" TEXT NOT NULL,
    "skipCount" INTEGER NOT NULL DEFAULT 0,
    "wasEmergency" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "queue_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "patient_queues_hospitalId_idx" ON "patient_queues"("hospitalId");

-- CreateIndex
CREATE INDEX "patient_queues_patientId_idx" ON "patient_queues"("patientId");

-- CreateIndex
CREATE INDEX "patient_queues_serviceQueueId_idx" ON "patient_queues"("serviceQueueId");

-- CreateIndex
CREATE INDEX "patient_queues_status_idx" ON "patient_queues"("status");

-- CreateIndex
CREATE INDEX "patient_queues_priority_idx" ON "patient_queues"("priority");

-- CreateIndex
CREATE INDEX "patient_queues_joinedAt_idx" ON "patient_queues"("joinedAt");

-- CreateIndex
CREATE INDEX "patient_queues_position_idx" ON "patient_queues"("position");

-- CreateIndex
CREATE UNIQUE INDEX "patient_queues_hospitalId_queueNumber_key" ON "patient_queues"("hospitalId", "queueNumber");

-- CreateIndex
CREATE INDEX "service_queues_hospitalId_idx" ON "service_queues"("hospitalId");

-- CreateIndex
CREATE INDEX "service_queues_serviceType_idx" ON "service_queues"("serviceType");

-- CreateIndex
CREATE INDEX "service_queues_doctorId_idx" ON "service_queues"("doctorId");

-- CreateIndex
CREATE INDEX "service_queues_isActive_idx" ON "service_queues"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "service_queues_hospitalId_queueCode_key" ON "service_queues"("hospitalId", "queueCode");

-- CreateIndex
CREATE INDEX "queue_history_hospitalId_idx" ON "queue_history"("hospitalId");

-- CreateIndex
CREATE INDEX "queue_history_serviceQueueId_idx" ON "queue_history"("serviceQueueId");

-- CreateIndex
CREATE INDEX "queue_history_queueDate_idx" ON "queue_history"("queueDate");

-- AddForeignKey
ALTER TABLE "patient_queues" ADD CONSTRAINT "patient_queues_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_queues" ADD CONSTRAINT "patient_queues_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_queues" ADD CONSTRAINT "patient_queues_billId_fkey" FOREIGN KEY ("billId") REFERENCES "bills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_queues" ADD CONSTRAINT "patient_queues_serviceQueueId_fkey" FOREIGN KEY ("serviceQueueId") REFERENCES "service_queues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_queues" ADD CONSTRAINT "patient_queues_diagnosticOrderId_fkey" FOREIGN KEY ("diagnosticOrderId") REFERENCES "diagnostic_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_queues" ADD CONSTRAINT "service_queues_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_queues" ADD CONSTRAINT "service_queues_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_queues" ADD CONSTRAINT "service_queues_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_history" ADD CONSTRAINT "queue_history_serviceQueueId_fkey" FOREIGN KEY ("serviceQueueId") REFERENCES "service_queues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

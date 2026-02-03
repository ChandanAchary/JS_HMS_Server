-- CreateTable
CREATE TABLE "diagnostic_tests" (
    "id" TEXT NOT NULL,
    "testCode" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "shortName" TEXT,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "department" TEXT,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "discountedPrice" DOUBLE PRECISION,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hsnSacCode" TEXT,
    "sampleType" TEXT,
    "sampleVolume" TEXT,
    "tubeType" TEXT,
    "tubeColor" TEXT,
    "turnaroundTime" INTEGER NOT NULL DEFAULT 24,
    "fastingRequired" BOOLEAN NOT NULL DEFAULT false,
    "fastingHours" INTEGER,
    "referenceRanges" JSONB,
    "unit" TEXT,
    "homeCollectionAvailable" BOOLEAN NOT NULL DEFAULT true,
    "homeCollectionCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiresAppointment" BOOLEAN NOT NULL DEFAULT false,
    "equipmentRequired" TEXT,
    "testMethod" TEXT,
    "hospitalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostic_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_orders" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "orderType" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "referringDoctorId" TEXT,
    "consultationId" TEXT,
    "externalPrescriptionId" TEXT,
    "clinicalIndication" TEXT,
    "urgency" TEXT NOT NULL DEFAULT 'ROUTINE',
    "specialInstructions" TEXT,
    "collectionMode" TEXT,
    "collectionScheduledAt" TIMESTAMP(3),
    "collectionSlotId" TEXT,
    "collectionCompletedAt" TIMESTAMP(3),
    "collectedBy" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "insuranceCovered" BOOLEAN NOT NULL DEFAULT false,
    "insuranceAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "patientAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "preAuthNumber" TEXT,
    "preAuthStatus" TEXT,
    "billId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "statusHistory" JSONB,
    "resultsDeliveredAt" TIMESTAMP(3),
    "resultsDeliveryMode" TEXT,
    "createdBy" TEXT,
    "cancelledBy" TEXT,
    "cancellationReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostic_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "testCode" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "testCategory" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netPrice" DOUBLE PRECISION NOT NULL,
    "sampleId" TEXT,
    "sampleCollectedAt" TIMESTAMP(3),
    "sampleQuality" TEXT,
    "sampleRejected" BOOLEAN NOT NULL DEFAULT false,
    "sampleRejectionReason" TEXT,
    "sampleCollectedBy" TEXT,
    "barcodeGenerated" BOOLEAN NOT NULL DEFAULT false,
    "barcodeData" TEXT,
    "processingStartedAt" TIMESTAMP(3),
    "processingCompletedAt" TIMESTAMP(3),
    "analyzerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ORDERED',
    "statusHistory" JSONB,
    "resultId" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'ROUTINE',
    "expectedCompletionAt" TIMESTAMP(3),
    "actualCompletionAt" TIMESTAMP(3),
    "tatBreached" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostic_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_results" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "testCode" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "resultValue" TEXT,
    "resultNumeric" DOUBLE PRECISION,
    "resultUnit" TEXT,
    "referenceMin" DOUBLE PRECISION,
    "referenceMax" DOUBLE PRECISION,
    "referenceText" TEXT,
    "interpretation" TEXT,
    "isCritical" BOOLEAN NOT NULL DEFAULT false,
    "criticalNotified" BOOLEAN NOT NULL DEFAULT false,
    "criticalNotifiedAt" TIMESTAMP(3),
    "criticalNotifiedTo" TEXT,
    "reportText" TEXT,
    "impressions" TEXT,
    "recommendations" TEXT,
    "attachments" JSONB,
    "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "enteredBy" TEXT,
    "enteredAt" TIMESTAMP(3),
    "qcCheckedBy" TEXT,
    "qcCheckedAt" TIMESTAMP(3),
    "qcStatus" TEXT,
    "qcNotes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewerNotes" TEXT,
    "reviewerSignature" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isReleased" BOOLEAN NOT NULL DEFAULT false,
    "releasedAt" TIMESTAMP(3),
    "releasedBy" TEXT,
    "isAmended" BOOLEAN NOT NULL DEFAULT false,
    "amendmentReason" TEXT,
    "previousValues" JSONB,
    "visibleToPatient" BOOLEAN NOT NULL DEFAULT false,
    "patientViewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostic_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_prescriptions" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "prescriptionDate" TIMESTAMP(3),
    "prescriptionImage" TEXT,
    "prescriptionPdf" TEXT,
    "referringDoctorName" TEXT,
    "referringHospital" TEXT,
    "referringDoctorPhone" TEXT,
    "referringDoctorRegNo" TEXT,
    "ocrExtractedText" TEXT,
    "ocrExtractedTests" JSONB,
    "ocrConfidence" DOUBLE PRECISION,
    "manualEntryTests" JSONB,
    "validationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "validatedBy" TEXT,
    "validatedAt" TIMESTAMP(3),
    "validationNotes" TEXT,
    "mappedTests" JSONB,
    "status" TEXT NOT NULL DEFAULT 'UPLOADED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_slots" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "slotDate" DATE NOT NULL,
    "slotStartTime" TEXT NOT NULL,
    "slotEndTime" TEXT NOT NULL,
    "slotDuration" INTEGER NOT NULL DEFAULT 15,
    "collectionType" TEXT NOT NULL DEFAULT 'WALK_IN',
    "locationName" TEXT,
    "locationAddress" TEXT,
    "technicianId" TEXT,
    "maxBookings" INTEGER NOT NULL DEFAULT 1,
    "currentBookings" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "blockReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_tests_testCode_key" ON "diagnostic_tests"("testCode");

-- CreateIndex
CREATE INDEX "diagnostic_tests_testCode_idx" ON "diagnostic_tests"("testCode");

-- CreateIndex
CREATE INDEX "diagnostic_tests_category_idx" ON "diagnostic_tests"("category");

-- CreateIndex
CREATE INDEX "diagnostic_tests_hospitalId_idx" ON "diagnostic_tests"("hospitalId");

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_orders_orderId_key" ON "diagnostic_orders"("orderId");

-- CreateIndex
CREATE INDEX "diagnostic_orders_orderId_idx" ON "diagnostic_orders"("orderId");

-- CreateIndex
CREATE INDEX "diagnostic_orders_patientId_idx" ON "diagnostic_orders"("patientId");

-- CreateIndex
CREATE INDEX "diagnostic_orders_hospitalId_idx" ON "diagnostic_orders"("hospitalId");

-- CreateIndex
CREATE INDEX "diagnostic_orders_status_idx" ON "diagnostic_orders"("status");

-- CreateIndex
CREATE INDEX "diagnostic_orders_collectionScheduledAt_idx" ON "diagnostic_orders"("collectionScheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_order_items_sampleId_key" ON "diagnostic_order_items"("sampleId");

-- CreateIndex
CREATE INDEX "diagnostic_order_items_sampleId_idx" ON "diagnostic_order_items"("sampleId");

-- CreateIndex
CREATE INDEX "diagnostic_order_items_orderId_idx" ON "diagnostic_order_items"("orderId");

-- CreateIndex
CREATE INDEX "diagnostic_order_items_testId_idx" ON "diagnostic_order_items"("testId");

-- CreateIndex
CREATE INDEX "diagnostic_order_items_status_idx" ON "diagnostic_order_items"("status");

-- CreateIndex
CREATE INDEX "diagnostic_results_patientId_idx" ON "diagnostic_results"("patientId");

-- CreateIndex
CREATE INDEX "diagnostic_results_hospitalId_idx" ON "diagnostic_results"("hospitalId");

-- CreateIndex
CREATE INDEX "diagnostic_results_testId_idx" ON "diagnostic_results"("testId");

-- CreateIndex
CREATE INDEX "diagnostic_results_status_idx" ON "diagnostic_results"("status");

-- CreateIndex
CREATE INDEX "external_prescriptions_patientId_idx" ON "external_prescriptions"("patientId");

-- CreateIndex
CREATE INDEX "external_prescriptions_hospitalId_idx" ON "external_prescriptions"("hospitalId");

-- CreateIndex
CREATE INDEX "external_prescriptions_status_idx" ON "external_prescriptions"("status");

-- CreateIndex
CREATE INDEX "lab_slots_hospitalId_idx" ON "lab_slots"("hospitalId");

-- CreateIndex
CREATE INDEX "lab_slots_slotDate_idx" ON "lab_slots"("slotDate");

-- CreateIndex
CREATE INDEX "lab_slots_isAvailable_idx" ON "lab_slots"("isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "lab_slots_hospitalId_slotDate_slotStartTime_collectionType_key" ON "lab_slots"("hospitalId", "slotDate", "slotStartTime", "collectionType");

-- AddForeignKey
ALTER TABLE "diagnostic_tests" ADD CONSTRAINT "diagnostic_tests_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_orders" ADD CONSTRAINT "diagnostic_orders_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_orders" ADD CONSTRAINT "diagnostic_orders_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_orders" ADD CONSTRAINT "diagnostic_orders_referringDoctorId_fkey" FOREIGN KEY ("referringDoctorId") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_orders" ADD CONSTRAINT "diagnostic_orders_externalPrescriptionId_fkey" FOREIGN KEY ("externalPrescriptionId") REFERENCES "external_prescriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_orders" ADD CONSTRAINT "diagnostic_orders_collectionSlotId_fkey" FOREIGN KEY ("collectionSlotId") REFERENCES "lab_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_orders" ADD CONSTRAINT "diagnostic_orders_billId_fkey" FOREIGN KEY ("billId") REFERENCES "bills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_order_items" ADD CONSTRAINT "diagnostic_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "diagnostic_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_order_items" ADD CONSTRAINT "diagnostic_order_items_testId_fkey" FOREIGN KEY ("testId") REFERENCES "diagnostic_tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_order_items" ADD CONSTRAINT "diagnostic_order_items_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "diagnostic_results"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_results" ADD CONSTRAINT "diagnostic_results_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_results" ADD CONSTRAINT "diagnostic_results_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_prescriptions" ADD CONSTRAINT "external_prescriptions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_prescriptions" ADD CONSTRAINT "external_prescriptions_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_slots" ADD CONSTRAINT "lab_slots_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_slots" ADD CONSTRAINT "lab_slots_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

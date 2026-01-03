-- CreateTable
CREATE TABLE "Admission" (
    "id" SERIAL NOT NULL,
    "patientId" TEXT NOT NULL,
    "medicalRecordId" INTEGER,
    "admittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dischargedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "chiefComplaint" TEXT NOT NULL,
    "provisionalDiagnosis" TEXT NOT NULL,
    "initialTherapyPlan" TEXT,
    "admittingDoctorId" TEXT,
    "referralDoctor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bed" (
    "id" SERIAL NOT NULL,
    "unitId" INTEGER NOT NULL,
    "bedNumber" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Bed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BedAllocation" (
    "id" SERIAL NOT NULL,
    "admissionId" INTEGER NOT NULL,
    "bedId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedAt" TIMESTAMP(3),

    CONSTRAINT "BedAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InpatientUnit" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InpatientUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admission_medicalRecordId_key" ON "Admission"("medicalRecordId");

-- CreateIndex
CREATE INDEX "Admission_patientId_idx" ON "Admission"("patientId");

-- CreateIndex
CREATE INDEX "Admission_medicalRecordId_idx" ON "Admission"("medicalRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "Bed_unitId_bedNumber_key" ON "Bed"("unitId", "bedNumber");

-- CreateIndex
CREATE INDEX "BedAllocation_admissionId_idx" ON "BedAllocation"("admissionId");

-- CreateIndex
CREATE INDEX "BedAllocation_bedId_idx" ON "BedAllocation"("bedId");

-- CreateIndex
CREATE UNIQUE INDEX "InpatientUnit_name_key" ON "InpatientUnit"("name");

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "MedicalRecords"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bed" ADD CONSTRAINT "Bed_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "InpatientUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BedAllocation" ADD CONSTRAINT "BedAllocation_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "Admission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BedAllocation" ADD CONSTRAINT "BedAllocation_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "Bed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

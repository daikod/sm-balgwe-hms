/* =========================================================
   STEP 1: ADD NEW COLUMNS AS NULLABLE
   ========================================================= */

ALTER TABLE "Appointment"
  ADD COLUMN "doctorId" TEXT,
  ADD COLUMN "patientId" TEXT;

ALTER TABLE "AuditLog"
  ADD COLUMN "userId" TEXT;

ALTER TABLE "Diagnosis"
  ADD COLUMN "doctorId" TEXT,
  ADD COLUMN "medicalId" INTEGER,
  ADD COLUMN "patientId" TEXT;

ALTER TABLE "MedicalRecords"
  ADD COLUMN "appointmentId" INTEGER,
  ADD COLUMN "doctorId" TEXT,
  ADD COLUMN "patientId" TEXT;

ALTER TABLE "Payment"
  ADD COLUMN "appointmentId" INTEGER,
  ADD COLUMN "patientId" TEXT;

ALTER TABLE "Rating"
  ADD COLUMN "doctorId" TEXT,
  ADD COLUMN "patientId" TEXT;

ALTER TABLE "VitalSigns"
  ADD COLUMN "medicalId" INTEGER,
  ADD COLUMN "patientId" TEXT;

ALTER TABLE "WorkingDays"
  ADD COLUMN "doctorId" TEXT;


/* =========================================================
   STEP 2: BACKFILL DATA FROM LEGACY COLUMNS
   ========================================================= */

UPDATE "Appointment"
SET "doctorId" = "doctor_id",
    "patientId" = "patient_id";

UPDATE "AuditLog"
SET "userId" = "user_id";

UPDATE "Diagnosis"
SET "doctorId" = "doctor_id",
    "medicalId" = "medical_id",
    "patientId" = "patient_id";

UPDATE "MedicalRecords"
SET "appointmentId" = "appointment_id",
    "doctorId" = "doctor_id",
    "patientId" = "patient_id";

UPDATE "Payment"
SET "appointmentId" = "appointment_id",
    "patientId" = "patient_id";

UPDATE "Rating"
SET "doctorId" = "staff_id",
    "patientId" = "patient_id";

UPDATE "VitalSigns"
SET "medicalId" = "medical_id",
    "patientId" = "patient_id";

UPDATE "WorkingDays"
SET "doctorId" = "doctor_id";


/* =========================================================
   STEP 3: USER ROLE ENUM MIGRATION (SAFE)
   ========================================================= */

DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM (
    'ADMIN','NURSE','DOCTOR','LAB_TECHNICIAN','PATIENT','CASHIER'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "notifications"
  ADD COLUMN "userRole_new" "Role";

UPDATE "notifications"
SET "userRole_new" = "userRole"::"Role";

ALTER TABLE "notifications"
  DROP COLUMN "userRole";

ALTER TABLE "notifications"
  RENAME COLUMN "userRole_new" TO "userRole";


/* =========================================================
   STEP 4: ENFORCE NOT NULL CONSTRAINTS
   ========================================================= */

ALTER TABLE "Appointment"
  ALTER COLUMN "doctorId" SET NOT NULL,
  ALTER COLUMN "patientId" SET NOT NULL;

ALTER TABLE "AuditLog"
  ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "Diagnosis"
  ALTER COLUMN "doctorId" SET NOT NULL,
  ALTER COLUMN "medicalId" SET NOT NULL,
  ALTER COLUMN "patientId" SET NOT NULL;

ALTER TABLE "MedicalRecords"
  ALTER COLUMN "appointmentId" SET NOT NULL,
  ALTER COLUMN "doctorId" SET NOT NULL,
  ALTER COLUMN "patientId" SET NOT NULL;

ALTER TABLE "Payment"
  ALTER COLUMN "appointmentId" SET NOT NULL,
  ALTER COLUMN "patientId" SET NOT NULL;

ALTER TABLE "Rating"
  ALTER COLUMN "doctorId" SET NOT NULL,
  ALTER COLUMN "patientId" SET NOT NULL;

ALTER TABLE "VitalSigns"
  ALTER COLUMN "medicalId" SET NOT NULL,
  ALTER COLUMN "patientId" SET NOT NULL;

ALTER TABLE "WorkingDays"
  ALTER COLUMN "doctorId" SET NOT NULL;


/* =========================================================
   STEP 5: DROP LEGACY COLUMNS (NOW SAFE)
   ========================================================= */

ALTER TABLE "Appointment"
  DROP COLUMN "doctor_id",
  DROP COLUMN "patient_id";

ALTER TABLE "AuditLog"
  DROP COLUMN "user_id";

ALTER TABLE "Diagnosis"
  DROP COLUMN "doctor_id",
  DROP COLUMN "medical_id",
  DROP COLUMN "patient_id";

ALTER TABLE "MedicalRecords"
  DROP COLUMN "appointment_id",
  DROP COLUMN "doctor_id",
  DROP COLUMN "patient_id";

ALTER TABLE "Payment"
  DROP COLUMN "appointment_id",
  DROP COLUMN "patient_id";

ALTER TABLE "Rating"
  DROP COLUMN "staff_id",
  DROP COLUMN "patient_id";

ALTER TABLE "VitalSigns"
  DROP COLUMN "medical_id",
  DROP COLUMN "patient_id";

ALTER TABLE "WorkingDays"
  DROP COLUMN "doctor_id";


/* =========================================================
   STEP 6: PRESCRIPTIONS RESTRUCTURE
   ========================================================= */

DROP TABLE IF EXISTS "medication_administrations";
DROP TABLE IF EXISTS "medications";
DROP TABLE IF EXISTS "prescriptions";

CREATE TABLE "Prescription" (
  "id" TEXT PRIMARY KEY,
  "prescriptionNumber" TEXT UNIQUE NOT NULL,
  "patientId" TEXT NOT NULL,
  "doctorId" TEXT NOT NULL,
  "appointmentId" INTEGER,
  "diagnosisId" INTEGER,
  "instructions" TEXT,
  "diagnosis" TEXT NOT NULL,
  "notes" TEXT,
  "prescribedDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "validUntil" TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL
);

CREATE TABLE "Medication" (
  "id" TEXT PRIMARY KEY,
  "prescriptionId" TEXT NOT NULL,
  "medicationName" TEXT NOT NULL,
  "dosage" TEXT NOT NULL,
  "frequency" TEXT NOT NULL,
  "duration" TEXT NOT NULL,
  "quantity" TEXT NOT NULL,
  "instructions" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL
);

CREATE TABLE "MedicationAdministration" (
  "id" TEXT PRIMARY KEY,
  "medicationId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "administeredBy" TEXT NOT NULL,
  "administeredByRole" TEXT NOT NULL,
  "administeredAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dosageGiven" TEXT NOT NULL,
  "notes" TEXT,
  "status" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


/* =========================================================
   STEP 7: INDEXES & VALID FOREIGN KEYS
   ========================================================= */

CREATE UNIQUE INDEX "Payment_appointmentId_key"
  ON "Payment"("appointmentId");

CREATE INDEX "notifications_userId_userRole_idx"
  ON "notifications"("userId", "userRole");

ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_doctorId_fkey"
  FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_patientId_fkey"
  FOREIGN KEY ("patientId") REFERENCES "Patient"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkingDays"
  ADD CONSTRAINT "WorkingDays_doctorId_fkey"
  FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

/* ⚠️ IMPORTANT:
   NO foreign keys on notifications.userId
   This is intentional and correct.
*/

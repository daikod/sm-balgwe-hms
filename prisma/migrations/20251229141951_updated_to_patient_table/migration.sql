-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'READY_FOR_ADMISSION';

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "doctorId" TEXT,
ADD COLUMN     "doctor_id" TEXT,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

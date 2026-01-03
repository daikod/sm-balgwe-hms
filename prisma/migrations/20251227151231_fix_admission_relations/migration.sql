/*
  Warnings:

  - Added the required column `updatedAt` to the `BedAllocation` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "LabTest_service_id_key";

-- AlterTable
ALTER TABLE "BedAllocation" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

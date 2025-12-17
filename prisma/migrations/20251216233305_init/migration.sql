-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "receipt_number" DROP DEFAULT;
DROP SEQUENCE "Payment_receipt_number_seq";

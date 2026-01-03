-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- DropIndex
DROP INDEX "notifications_userId_idx";

-- CreateIndex
CREATE INDEX "notifications_userId_userRole_idx" ON "notifications"("userId", "userRole");

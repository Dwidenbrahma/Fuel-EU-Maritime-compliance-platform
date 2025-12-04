/*
  Warnings:

  - The primary key for the `BankEntry` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "BankEntry" DROP CONSTRAINT "BankEntry_pkey",
ADD COLUMN     "applied" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "BankEntry_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "BankEntry_id_seq";

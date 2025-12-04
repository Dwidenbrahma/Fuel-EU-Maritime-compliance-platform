/*
  Warnings:

  - The primary key for the `Pool` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PoolMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cb_after` on the `PoolMember` table. All the data in the column will be lost.
  - You are about to drop the column `cb_before` on the `PoolMember` table. All the data in the column will be lost.
  - The primary key for the `Route` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `distance` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `fuelConsumption` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `fuelType` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `ghg_intensity` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `is_baseline` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `route_id` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `totalEmissions` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `vesselType` on the `Route` table. All the data in the column will be lost.
  - Added the required column `pooled_cb` to the `Pool` table without a default value. This is not possible if the table is not empty.
  - Added the required column `adjusted_cb` to the `PoolMember` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PoolMember" DROP CONSTRAINT "PoolMember_pool_id_fkey";

-- DropIndex
DROP INDEX "Route_route_id_key";

-- AlterTable
ALTER TABLE "Pool" DROP CONSTRAINT "Pool_pkey",
ADD COLUMN     "pooled_cb" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Pool_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Pool_id_seq";

-- AlterTable
ALTER TABLE "PoolMember" DROP CONSTRAINT "PoolMember_pkey",
DROP COLUMN "cb_after",
DROP COLUMN "cb_before",
ADD COLUMN     "adjusted_cb" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "pool_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "PoolMember_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PoolMember_id_seq";

-- AlterTable
ALTER TABLE "Route" DROP CONSTRAINT "Route_pkey",
DROP COLUMN "distance",
DROP COLUMN "fuelConsumption",
DROP COLUMN "fuelType",
DROP COLUMN "ghg_intensity",
DROP COLUMN "is_baseline",
DROP COLUMN "route_id",
DROP COLUMN "totalEmissions",
DROP COLUMN "vesselType",
ADD COLUMN     "baseline_intensity" DOUBLE PRECISION,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "distance_nm" DOUBLE PRECISION,
ADD COLUMN     "emissions_gco2eq" DOUBLE PRECISION,
ADD COLUMN     "energy_mj" DOUBLE PRECISION,
ADD COLUMN     "fuel_tons" DOUBLE PRECISION,
ADD COLUMN     "fuel_type" TEXT,
ADD COLUMN     "intensity_gco2_per_mj" DOUBLE PRECISION,
ADD COLUMN     "route_name" TEXT,
ADD COLUMN     "ship_id" TEXT,
ADD COLUMN     "vessel_type" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Route_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Route_id_seq";

-- CreateIndex
CREATE INDEX "PoolMember_ship_id_idx" ON "PoolMember"("ship_id");

-- AddForeignKey
ALTER TABLE "PoolMember" ADD CONSTRAINT "PoolMember_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "Pool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

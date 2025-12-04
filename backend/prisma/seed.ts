import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean tables
  await prisma.poolMember.deleteMany();
  await prisma.pool.deleteMany();
  await prisma.bankEntry.deleteMany();
  await prisma.shipCompliance.deleteMany();
  await prisma.route.deleteMany();

  // -------------------------
  // 🌱 ROUTE DATA (exact test data)
  // -------------------------
  await prisma.route.createMany({
    data: [
      {
        id: "R001",
        ship_id: "SHIP001",
        route_name: "Route 001",
        vessel_type: "Container",
        fuel_type: "HFO",
        fuel_tons: 5000,
        distance_nm: 12000,
        year: 2024,
        emissions_gco2eq: 4500,
        energy_mj: 550000,
        intensity_gco2_per_mj: 91.0,
        baseline_intensity: null,
      },
      {
        id: "R002",
        ship_id: "SHIP002",
        route_name: "Route 002",
        vessel_type: "BulkCarrier",
        fuel_type: "LNG",
        fuel_tons: 4800,
        distance_nm: 11500,
        year: 2024,
        emissions_gco2eq: 4200,
        energy_mj: 530000,
        intensity_gco2_per_mj: 88.0,
        baseline_intensity: null,
      },
      {
        id: "R003",
        ship_id: "SHIP003",
        route_name: "Route 003",
        vessel_type: "Tanker",
        fuel_type: "MGO",
        fuel_tons: 5100,
        distance_nm: 12500,
        year: 2024,
        emissions_gco2eq: 4700,
        energy_mj: 560000,
        intensity_gco2_per_mj: 93.5,
        baseline_intensity: null,
      },
      {
        id: "R004",
        ship_id: "SHIP004",
        route_name: "Route 004",
        vessel_type: "RoRo",
        fuel_type: "HFO",
        fuel_tons: 4900,
        distance_nm: 11800,
        year: 2025,
        emissions_gco2eq: 4300,
        energy_mj: 540000,
        intensity_gco2_per_mj: 89.2,
        baseline_intensity: null,
      },
      {
        id: "R005",
        ship_id: "SHIP005",
        route_name: "Route 005",
        vessel_type: "Container",
        fuel_type: "LNG",
        fuel_tons: 4950,
        distance_nm: 11900,
        year: 2025,
        emissions_gco2eq: 4400,
        energy_mj: 545000,
        intensity_gco2_per_mj: 90.5,
        baseline_intensity: null,
      },
    ],
  });

  console.log("🌱 Routes added.");

  // -------------------------
  // 🌱 SHIP COMPLIANCE DATA
  // -------------------------
  await prisma.shipCompliance.createMany({
    data: [
      { ship_id: "SHIP001", year: 2024, cb_gco2eq: 100 },
      { ship_id: "SHIP002", year: 2024, cb_gco2eq: 95 },
      { ship_id: "SHIP003", year: 2024, cb_gco2eq: 110 },
      { ship_id: "SHIP004", year: 2025, cb_gco2eq: 102 },
      { ship_id: "SHIP005", year: 2025, cb_gco2eq: 98 },
    ],
  });

  console.log("🌱 Compliance added.");

  // -------------------------
  // 🌱 BANK ENTRIES
  // -------------------------
  await prisma.bankEntry.createMany({
    data: [
      { ship_id: "SHIP001", year: 2024, amount_gco2eq: 50, applied: false },
      { ship_id: "SHIP001", year: 2024, amount_gco2eq: 25, applied: false },

      { ship_id: "SHIP002", year: 2024, amount_gco2eq: 40, applied: false },
      { ship_id: "SHIP003", year: 2024, amount_gco2eq: 60, applied: false },

      { ship_id: "SHIP004", year: 2025, amount_gco2eq: 55, applied: false },
      { ship_id: "SHIP005", year: 2025, amount_gco2eq: 35, applied: false },
    ],
  });

  console.log("🌱 Banking entries added.");

  // -------------------------
  // 🌱 POOL DATA
  // -------------------------
  const pool2024_A = await prisma.pool.create({
    data: {
      year: 2024,
      pooled_cb: 150,
    },
  });

  const pool2024_B = await prisma.pool.create({
    data: {
      year: 2024,
      pooled_cb: 120,
    },
  });

  const pool2025_A = await prisma.pool.create({
    data: {
      year: 2025,
      pooled_cb: 160,
    },
  });

  const pool2025_B = await prisma.pool.create({
    data: {
      year: 2025,
      pooled_cb: 140,
    },
  });

  // -------------------------
  // 🌱 POOL MEMBERS
  // -------------------------
  await prisma.poolMember.createMany({
    data: [
      // 2024 Pool A (SHIP001 + SHIP002)
      {
        pool_id: pool2024_A.id,
        ship_id: "SHIP001",
        adjusted_cb: 80,
      },
      {
        pool_id: pool2024_A.id,
        ship_id: "SHIP002",
        adjusted_cb: 70,
      },

      // 2024 Pool B (SHIP003)
      {
        pool_id: pool2024_B.id,
        ship_id: "SHIP003",
        adjusted_cb: 120,
      },

      // 2025 Pool A (SHIP004 + SHIP005)
      {
        pool_id: pool2025_A.id,
        ship_id: "SHIP004",
        adjusted_cb: 85,
      },
      {
        pool_id: pool2025_A.id,
        ship_id: "SHIP005",
        adjusted_cb: 75,
      },

      // 2025 Pool B (SHIP001 + SHIP002 in new pool)
      {
        pool_id: pool2025_B.id,
        ship_id: "SHIP001",
        adjusted_cb: 75,
      },
      {
        pool_id: pool2025_B.id,
        ship_id: "SHIP003",
        adjusted_cb: 65,
      },
    ],
  });

  console.log("🌱 Pools + Members added.");
}

main()
  .catch(e => console.error("❌ Seed Error: ", e))
  .finally(async () => await prisma.$disconnect());

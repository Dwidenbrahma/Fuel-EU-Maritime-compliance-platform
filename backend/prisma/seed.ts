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
  // 🌱 ROUTE DATA (dummy realistic)
  // -------------------------
  await prisma.route.createMany({
    data: [
      {
        ship_id: "SHIP001",
        route_name: "Atlantic EU Run",
        vessel_type: "Container",
        fuel_type: "HFO",
        fuel_tons: 125.5,
        distance_nm: 12000,
        year: 2024,
        emissions_gco2eq: 4500,
        energy_mj: 50000,
        intensity_gco2_per_mj: 0.09,
        baseline_intensity: 0.1,
      },
      {
        ship_id: "SHIP002",
        route_name: "Asia-Pacific Lane",
        vessel_type: "BulkCarrier",
        fuel_type: "LNG",
        fuel_tons: 120,
        distance_nm: 11500,
        year: 2024,
        emissions_gco2eq: 4200,
        energy_mj: 48000,
        intensity_gco2_per_mj: 0.087,
        baseline_intensity: 0.095,
      },
      {
        ship_id: "SHIP003",
        route_name: "Gulf Oil Route",
        vessel_type: "Tanker",
        fuel_type: "MGO",
        fuel_tons: 127.5,
        distance_nm: 12500,
        year: 2024,
        emissions_gco2eq: 4700,
        energy_mj: 52000,
        intensity_gco2_per_mj: 0.091,
        baseline_intensity: 0.1,
      },
      {
        ship_id: "SHIP004",
        route_name: "Northern EU Run",
        vessel_type: "RoRo",
        fuel_type: "HFO",
        fuel_tons: 122.5,
        distance_nm: 11800,
        year: 2025,
        emissions_gco2eq: 4300,
        energy_mj: 49500,
        intensity_gco2_per_mj: 0.086,
        baseline_intensity: 0.095,
      },
      {
        ship_id: "SHIP005",
        route_name: "Middle East Trade Route",
        vessel_type: "Container",
        fuel_type: "LNG",
        fuel_tons: 123.75,
        distance_nm: 11900,
        year: 2025,
        emissions_gco2eq: 4400,
        energy_mj: 51000,
        intensity_gco2_per_mj: 0.088,
        baseline_intensity: 0.094,
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
  -(
    // 🌱 BANK ENTRIES
    // -------------------------
    (await prisma.bankEntry.createMany({
      data: [
        { ship_id: "SHIP001", year: 2024, amount_gco2eq: 50, applied: false },
        { ship_id: "SHIP001", year: 2024, amount_gco2eq: 25, applied: false },

        { ship_id: "SHIP002", year: 2024, amount_gco2eq: 40, applied: false },
        { ship_id: "SHIP003", year: 2024, amount_gco2eq: 60, applied: false },

        { ship_id: "SHIP004", year: 2025, amount_gco2eq: 55, applied: false },
        { ship_id: "SHIP005", year: 2025, amount_gco2eq: 35, applied: false },
      ],
    }))
  );

  console.log("🌱 Banking entries added.");

  // -------------------------
  // 🌱 POOL DATA
  // -------------------------
  const pool2024 = await prisma.pool.create({
    data: {
      year: 2024,
      pooled_cb: 150, // dummy combined CB
    },
  });

  const pool2025 = await prisma.pool.create({
    data: {
      year: 2025,
      pooled_cb: 160,
    },
  });

  // -------------------------
  // 🌱 POOL MEMBERS
  // -------------------------
  await prisma.poolMember.createMany({
    data: [
      // 2024 Pool
      {
        pool_id: pool2024.id,
        ship_id: "SHIP001",
        adjusted_cb: 80,
      },
      {
        pool_id: pool2024.id,
        ship_id: "SHIP002",
        adjusted_cb: 70,
      },

      // 2025 Pool
      {
        pool_id: pool2025.id,
        ship_id: "SHIP004",
        adjusted_cb: 85,
      },
      {
        pool_id: pool2025.id,
        ship_id: "SHIP005",
        adjusted_cb: 75,
      },
    ],
  });

  console.log("🌱 Pools + Members added.");
}

main()
  .catch((e) => console.error("❌ Seed Error: ", e))
  .finally(async () => await prisma.$disconnect());

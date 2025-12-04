import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing routes (optional, safe for dev)
  await prisma.route.deleteMany();

  await prisma.route.createMany({
    data: [
      {
        route_id: "R001",
        vesselType: "Container",
        fuelType: "HFO",
        year: 2024,
        ghg_intensity: 91.0,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        is_baseline: true,
      },
      {
        route_id: "R002",
        vesselType: "BulkCarrier",
        fuelType: "LNG",
        year: 2024,
        ghg_intensity: 88.0,
        fuelConsumption: 4800,
        distance: 11500,
        totalEmissions: 4200,
      },
      {
        route_id: "R003",
        vesselType: "Tanker",
        fuelType: "MGO",
        year: 2024,
        ghg_intensity: 93.5,
        fuelConsumption: 5100,
        distance: 12500,
        totalEmissions: 4700,
      },
      {
        route_id: "R004",
        vesselType: "RoRo",
        fuelType: "HFO",
        year: 2025,
        ghg_intensity: 89.2,
        fuelConsumption: 4900,
        distance: 11800,
        totalEmissions: 4300,
      },
      {
        route_id: "R005",
        vesselType: "Container",
        fuelType: "LNG",
        year: 2025,
        ghg_intensity: 90.5,
        fuelConsumption: 4950,
        distance: 11900,
        totalEmissions: 4400,
      },
    ],
  });

  console.log("🌱 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    // Don't call process.exit() here because it will terminate the process
    // immediately and may prevent the `finally` block from running.
    // Instead, set the exit code and allow the process to exit naturally
    // after cleanup in the `finally` block.
    //process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch (disconnectErr) {
      console.error("Error during prisma.$disconnect():", disconnectErr);
    }
  });

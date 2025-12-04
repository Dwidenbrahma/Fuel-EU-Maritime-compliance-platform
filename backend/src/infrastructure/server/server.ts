import { createApp } from "./app";

const app = createApp();
const PORT = process.env.PORT || 4000;

try {
  app.listen(PORT, () => {
    console.log(`🚀 FuelEU backend running at http://localhost:${PORT}`);
  });
} catch (err: any) {
  console.error("❌ Failed to start server:", err.message);
  process.exit(1);
}

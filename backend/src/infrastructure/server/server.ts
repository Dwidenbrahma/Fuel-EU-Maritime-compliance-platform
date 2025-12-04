import { createApp } from "./app";

const app = createApp();
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 FuelEU backend running at http://localhost:${PORT}`);
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const app = (0, app_1.createApp)();
const PORT = process.env.PORT || 4000;
try {
    app.listen(PORT, () => {
        console.log(`🚀 FuelEU backend running at http://localhost:${PORT}`);
    });
}
catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
}

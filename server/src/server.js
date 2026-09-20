import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import { seedDemoCatalog } from "./seedCatalog.js";

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

async function start() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI is required");
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");

  await mongoose.connect(MONGODB_URI);

  try {
    await seedDemoCatalog();
  } catch (error) {
    console.error("Demo catalog seed failed:", error);
  }

  app.listen(PORT, () => {
    console.log(`Cartiva API running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Startup failed:", error);
  process.exit(1);
});

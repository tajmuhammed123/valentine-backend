import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Employee from "./models/Employee.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGO_URI || "";
const dataPath = path.join(__dirname, "data", "employees.sample.json");

async function seed() {
  if (!MONGO_URI) {
    console.error("Missing MONGO_URI in environment.");
    process.exit(1);
  }

  try {
    const raw = fs.readFileSync(dataPath, "utf-8");
    const employees = JSON.parse(raw);

    await mongoose.connect(MONGO_URI);
    await Employee.deleteMany({});
    await Employee.insertMany(employees);
    console.log(`Seeded ${employees.length} employees.`);
    process.exit(0);
  } catch (err) {
    console.error("Seed failed", err);
    process.exit(1);
  }
}

seed();

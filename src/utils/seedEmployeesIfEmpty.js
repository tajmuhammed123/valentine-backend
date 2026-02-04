import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Employee from "../models/Employee.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.resolve(__dirname, "..", "data", "employees.sample.json");

export default async function seedEmployeesIfEmpty() {
  const existing = await Employee.countDocuments();
  if (existing > 0) {
    return { seeded: false, count: existing };
  }

  const raw = fs.readFileSync(dataPath, "utf-8");
  const employees = JSON.parse(raw);

  if (!Array.isArray(employees) || employees.length === 0) {
    return { seeded: false, count: 0 };
  }

  await Employee.insertMany(employees);
  return { seeded: true, count: employees.length };
}

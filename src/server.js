import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import employeeRoutes from "./routes/employees.js";
import voteRoutes from "./routes/votes.js";
import seedEmployeesIfEmpty from "./utils/seedEmployeesIfEmpty.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "";

app.set("trust proxy", true); // so req.ip works behind proxies

app.use(helmet());
const allowedOrigins = (process.env.CLIENT_ORIGIN ||
  "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: false,
  }),
);
app.use(express.json({ limit: "10kb" }));
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use("/api/employees", employeeRoutes);
app.use("/api/votes", voteRoutes);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Server error";
  res.status(status).json({ error: message });
});

async function start() {
  if (!MONGO_URI) {
    console.error("Missing MONGO_URI in environment.");
    process.exit(1);
  }
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
    if (process.env.SEED_ON_START === "true") {
      const result = await seedEmployeesIfEmpty();
      if (result.seeded) {
        console.log(
          `Seeded ${result.count} employees from employees.sample.json`,
        );
      }
    }
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

start();

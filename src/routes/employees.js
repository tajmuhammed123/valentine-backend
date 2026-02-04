import express from "express";
import Employee from "../models/Employee.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const employees = await Employee.find({ active: true }).sort({ name: 1 });
    res.json(employees);
  } catch (err) {
    next(err);
  }
});

export default router;

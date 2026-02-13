const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const { protect } = require("../middleware/authMiddleware");

// 🔐 PROTECTED ROUTE
router.get("/", protect, async (req, res) => {
  const patients = await Patient.find();
  res.json(patients);
});

// Create patient (public for now)
router.post("/", async (req, res) => {
  const patient = await Patient.create(req.body);
  res.status(201).json(patient);
});

module.exports = router;
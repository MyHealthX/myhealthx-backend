const express = require("express");
const router = express.Router();

const {
  createPatient,
  getMyPatient
} = require("../controllers/patientController");

const { protect } = require("../middleware/authMiddleware");

// Create patient profile (only logged-in user)
router.post("/", protect, createPatient);

// Get my patient profile
router.get("/me", protect, getMyPatient);

module.exports = router;
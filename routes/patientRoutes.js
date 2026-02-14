const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const patientController = require("../controllers/patientController");

// Create Patient
router.post("/", protect, patientController.createPatient);

// Get My Patient
router.get("/me", protect, patientController.getMyPatient);

module.exports = router;
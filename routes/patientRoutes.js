const express = require("express");
const router = express.Router();

const patientController = require("../controllers/patientController");
const { protect } = require("../middleware/authMiddleware");

// =====================================================
// PATIENT ROUTES (Protected)
// =====================================================

// Create patient profile (1 user = 1 patient)
router.post("/", protect, patientController.createPatient);

// Get my patient profile
router.get("/me", protect, patientController.getMyPatient);

// Update my patient profile
router.put("/me", protect, patientController.updateMyPatient);

// Delete my patient profile
router.delete("/me", protect, patientController.deleteMyPatient);

module.exports = router;
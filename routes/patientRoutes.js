const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { requireActiveSubscription } = require("../middleware/subscriptionMiddleware");
const patientController = require("../controllers/patientController");

router.post("/", protect, patientController.createPatient);

// Now only active users can view profile
router.get("/me", protect, requireActiveSubscription, patientController.getMyPatient);

module.exports = router;
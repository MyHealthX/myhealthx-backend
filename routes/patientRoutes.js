const { protect } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();
const controller = require("../controllers/patientController");

router.post("/", controller.createPatient);
router.get("/", controller.getPatients);
router.get("/:id", controller.getPatientById);
router.put("/:id", controller.updatePatient);
router.delete("/:id", controller.deletePatient);

router.get("/emergency/:id", controller.emergencyPage);
router.get("/qr/:id", controller.generateQR);

module.exports = router;
const Patient = require("../models/Patient");

// =====================================================
// CREATE PATIENT PROFILE (One User = One Patient)
// =====================================================
exports.createPatient = async (req, res) => {
  try {
    // Check if patient profile already exists for this user
    const existing = await Patient.findOne({ user: req.user.id });

    if (existing) {
      return res.status(400).json({
        message: "Patient profile already exists",
      });
    }

    const {
      name,
      age,
      bloodGroup,
      allergies,
      chronicDiseases,
      currentMedications,
      emergencyContactName,
      emergencyContactPhone,
    } = req.body;

    const patient = new Patient({
      user: req.user.id,
      name,
      age,
      bloodGroup,
      allergies,
      chronicDiseases,
      currentMedications,
      emergencyContactName,
      emergencyContactPhone,
    });

    await patient.save();

    res.status(201).json({
      message: "Patient profile created successfully",
      patient,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// GET MY PATIENT PROFILE
// =====================================================
exports.getMyPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });

    if (!patient) {
      return res.status(404).json({
        message: "Patient profile not found",
      });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// UPDATE MY PATIENT PROFILE
// =====================================================
exports.updateMyPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });

    if (!patient) {
      return res.status(404).json({
        message: "Patient profile not found",
      });
    }

    Object.assign(patient, req.body);

    await patient.save();

    res.json({
      message: "Patient profile updated successfully",
      patient,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// DELETE MY PATIENT PROFILE
// =====================================================
exports.deleteMyPatient = async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({ user: req.user.id });

    if (!patient) {
      return res.status(404).json({
        message: "Patient profile not found",
      });
    }

    res.json({
      message: "Patient profile deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
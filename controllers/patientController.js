const Patient = require("../models/Patient");

// CREATE PATIENT PROFILE
exports.createPatient = async (req, res) => {
  try {
    const existing = await Patient.findOne({ user: req.user.id });
    if (existing) {
      return res.status(400).json({ message: "Patient profile already exists" });
    }

    const patient = new Patient({
      ...req.body,
      user: req.user.id
    });

    await patient.save();
    res.status(201).json(patient);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY PATIENT PROFILE
exports.getMyPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });

    if (!patient) {
      return res.status(404).json({
        message: "Patient profile not created yet"
      });
    }

    res.status(200).json(patient);

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};
const Patient = require("../models/Patient");

// Create Patient Profile
const createPatient = async (req, res) => {
  try {
    const existingPatient = await Patient.findOne({
      user: req.user._id,
    });

    if (existingPatient) {
      return res.status(400).json({
        message: "Patient profile already exists",
      });
    }

    const patient = new Patient({
      user: req.user._id,
      name: req.user.name,
      age: req.body.age,
      bloodGroup: req.body.bloodGroup,
      allergies: req.body.allergies,
      chronicDiseases: req.body.chronicDiseases,
      currentMedications: req.body.currentMedications,
      emergencyContactName: req.body.emergencyContactName,
      emergencyContactPhone: req.body.emergencyContactPhone,
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

// Get Logged In Patient Profile
const getMyPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      user: req.user._id,
    });

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

module.exports = {
  createPatient,
  getMyPatient,
};
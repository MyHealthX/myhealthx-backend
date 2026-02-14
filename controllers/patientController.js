exports.createPatient = async (req, res) => {
  try {
    // Check if patient already exists for this user
    const existingPatient = await Patient.findOne({ user: req.user.id });

    if (existingPatient) {
      return res.status(400).json({
        message: "Patient profile already exists for this user",
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
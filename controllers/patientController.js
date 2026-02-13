const Patient = require("../models/Patient");
const QRCode = require("qrcode");

// CREATE
exports.createPatient = async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// GET ALL
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET SINGLE
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
exports.updatePatient = async (req, res) => {
  try {
    const updated = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE
exports.deletePatient = async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// EMERGENCY PAGE
exports.emergencyPage = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).send("Patient not found");

    res.send(`
      <h1>🚨 Emergency Info</h1>
      <p>Name: ${patient.name}</p>
      <p>Age: ${patient.age}</p>
      <p>Blood Group: ${patient.bloodGroup}</p>
      <p>Allergies: ${patient.allergies || "None"}</p>
      <p>Chronic Diseases: ${patient.chronicDiseases || "None"}</p>
      <p>Current Medications: ${patient.currentMedications || "None"}</p>
      <p>Emergency Contact: ${patient.emergencyContact}</p>
    `);
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

// QR GENERATION
exports.generateQR = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).send("Patient not found");

    const qrURL = `http://localhost:3000/emergency/${patient._id}`;

    QRCode.toDataURL(qrURL, (err, url) => {
      res.send(`
        <h1>QR for ${patient.name}</h1>
        <img src="${url}" />
      `);
    });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};
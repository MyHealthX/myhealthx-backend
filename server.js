require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ===== ROOT ROUTE =====
app.get("/", (req, res) => {
  res.send("MyHealth X Backend Running 🚀");
});

// ===== MONGODB CONNECTION =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));


// ===== PATIENT SCHEMA =====
const patientSchema = new mongoose.Schema({
  name: String,
  age: Number,
  bloodGroup: String,
  allergies: String,
  chronicDiseases: String,
  currentMedications: String,
  emergencyContact: String,
}, { timestamps: true });

const Patient = mongoose.model("Patient", patientSchema);


// ===== CREATE PATIENT =====
app.post("/api/patients", async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== GET ALL PATIENTS =====
app.get("/api/patients", async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== EMERGENCY PUBLIC ROUTE =====
app.get("/emergency/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.send("Patient not found");
    }

    res.send(`
      <h1>🚑 Emergency Medical Info</h1>
      <hr/>
      <p><strong>Name:</strong> ${patient.name}</p>
      <p><strong>Age:</strong> ${patient.age}</p>
      <p><strong>Blood Group:</strong> ${patient.bloodGroup}</p>
      <p><strong>Allergies:</strong> ${patient.allergies}</p>
      <p><strong>Chronic Diseases:</strong> ${patient.chronicDiseases}</p>
      <p><strong>Current Medications:</strong> ${patient.currentMedications}</p>
      <p><strong>Emergency Contact:</strong> ${patient.emergencyContact}</p>
    `);
  } catch (error) {
    res.status(500).send("Server Error");
  }
});


// ===== START SERVER =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
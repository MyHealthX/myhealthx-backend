require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const bcrypt = require("bcryptjs");
const User = require("./models/User");

// ===== REGISTER =====
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
    });

    await user.save();

    res.json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== LOGIN =====
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
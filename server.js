const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

/* ================================
   MongoDB Connection
================================ */
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

/* ================================
   User Schema
================================ */
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = mongoose.model("User", userSchema);

/* ================================
   Patient Schema
================================ */
const patientSchema = new mongoose.Schema({
  name: String,
  age: Number,
  bloodGroup: String,
  allergies: String,
  chronicDiseases: String,
  currentMedications: String,
  emergencyContact: String
}, { timestamps: true });

const Patient = mongoose.model("Patient", patientSchema);

/* ================================
   JWT Middleware
================================ */
function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

/* ================================
   AUTH ROUTES
================================ */

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      email: req.body.email,
      password: hashedPassword
    });

    await user.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error registering user" });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Login error" });
  }
});

/* ================================
   PATIENT ROUTES
================================ */

// Get All Patients (Protected)
app.get("/api/patients", verifyToken, async (req, res) => {
  const patients = await Patient.find();
  res.json(patients);
});

// Emergency Public Route
app.get("/emergency/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).send("Patient not found");
    }

    res.send(`
      <html>
        <head><title>Emergency Medical Info</title></head>
        <body style="font-family: Arial; padding: 30px;">
          <h1>🚨 Emergency Medical Info</h1>
          <hr/>
          <p><strong>Name:</strong> ${patient.name}</p>
          <p><strong>Age:</strong> ${patient.age}</p>
          <p><strong>Blood Group:</strong> ${patient.bloodGroup}</p>
          <p><strong>Allergies:</strong> ${patient.allergies || "None"}</p>
          <p><strong>Chronic Diseases:</strong> ${patient.chronicDiseases || "None"}</p>
          <p><strong>Current Medications:</strong> ${patient.currentMedications || "None"}</p>
          <p><strong>Emergency Contact:</strong> ${patient.emergencyContact}</p>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

/* ================================
   Start Server
================================ */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
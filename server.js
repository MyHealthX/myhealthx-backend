require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const QRCode = require("qrcode");

const app = express();

// ==============================
// Middleware
// ==============================
app.use(express.json());

// ==============================
// MongoDB Connection
// ==============================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Connection Error:", err));

// ==============================
// Import Routes
// ==============================
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// ==============================
// Patient Schema
// ==============================
const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  bloodGroup: { type: String, required: true },
  allergies: { type: String },
  chronicDiseases: { type: String },
  currentMedications: { type: String },
  emergencyContact: { type: String, required: true }
}, { timestamps: true });

const Patient = mongoose.model("Patient", patientSchema);

// ==============================
// Root Route
// ==============================
app.get("/", (req, res) => {
  res.send("MyHealth X Backend Running 🚀");
});

// ==============================
// CREATE Patient (with QR)
// ==============================
app.post("/api/patients", async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();

    const emergencyURL = `http://localhost:3000/emergency/${patient._id}`;

    const qrImage = await QRCode.toDataURL(emergencyURL);

    res.send(`
      <html>
        <body style="font-family: Arial; text-align:center; padding:40px;">
          <h1>✅ Patient Created Successfully</h1>
          <p><strong>Name:</strong> ${patient.name}</p>
          <p><strong>ID:</strong> ${patient._id}</p>
          <h2>Scan this QR in Emergency</h2>
          <img src="${qrImage}" />
          <p>${emergencyURL}</p>
        </body>
      </html>
    `);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==============================
// GET All Patients
// ==============================
app.get("/api/patients", async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==============================
// 🚑 Emergency Page
// ==============================
app.get("/emergency/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).send("Patient not found");
    }

    res.send(`
      <html>
        <head>
          <title>Emergency Medical Info</title>
        </head>
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

  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// ==============================
// Start Server
// ==============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
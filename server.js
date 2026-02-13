require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/patients", require("./routes/patientRoutes"));

// Emergency QR Lookup (Public)
const Patient = require("./models/Patient");

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

// Root
app.get("/", (req, res) => {
  res.send("<h2>MyHealth X Backend Running 🚀</h2>");
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () =>
  console.log("Server running on port " + PORT)
);
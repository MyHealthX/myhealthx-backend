const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  bloodGroup: { type: String, required: true },
  allergies: { type: String },
  chronicDiseases: { type: String },
  currentMedications: { type: String },
  emergencyContact: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Patient", patientSchema);
const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    name: {
      type: String,
      required: true
    },

    age: Number,
    bloodGroup: String,
    allergies: String,
    chronicDiseases: String,
    currentMedications: String,

    emergencyContactName: String,
    emergencyContactPhone: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
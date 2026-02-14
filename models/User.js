const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["patient", "admin"],
      default: "patient",
    },

    // Health Information
    age: Number,
    bloodGroup: String,
    allergies: String,
    chronicDiseases: String,
    currentMedications: String,
    emergencyContactName: String,
    emergencyContactPhone: String,

    // QR Public ID
    emergencyId: {
      type: String,
      unique: true,
    },

    // Email Verification
    isVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Subscription
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
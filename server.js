require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("./models/User");
const { sendVerificationEmail } = require("./services/emailService");
const patientRoutes = require("./routes/patientRoutes");

const app = express();

// ===== Middlewares =====
app.use(cors());
app.use(express.json());

// ===== Database =====
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// ===== Root =====
app.get("/", (req, res) => {
  res.send("MyHealth X Backend Running 🚀");
});

// ==================================================
// ================= AUTH ROUTES ====================
// ==================================================

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "patient",
      isVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: Date.now() + 60 * 60 * 1000,
      subscriptionStatus: "inactive",
      isActive: true,
    });

    await user.save();

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: "Registration successful. Please verify your email.",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// VERIFY EMAIL
app.get("/api/auth/verify", async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send("Invalid or expired verification link.");
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    res.send("Email verified successfully. You can now login.");

  } catch (error) {
    res.status(500).send("Verification failed.");
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protected Profile
const { protect } = require("./middleware/authMiddleware");

app.get("/api/auth/profile", protect, async (req, res) => {
  res.json(req.user);
});

// Patient Routes
app.use("/api/patients", patientRoutes);

// ==================================================
// ================= START SERVER ===================
// ==================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
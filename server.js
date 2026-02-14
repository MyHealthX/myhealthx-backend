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

// ================= MIDDLEWARES =================
app.use(cors());
app.use(express.json());

// ================= DATABASE =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// ================= ROOT =================
app.get("/", (req, res) => {
  res.send("MyHealth X Backend Running 🚀");
});

// ======================================================
// ================= AUTH MIDDLEWARE =====================
// ======================================================
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Token failed" });
  }
};

// ======================================================
// ================= REGISTER ============================
// ======================================================
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
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

// ======================================================
// ================= VERIFY EMAIL ========================
// ======================================================
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

// ======================================================
// ================= LOGIN ===============================
// ======================================================
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

// ======================================================
// ================= PROFILE =============================
// ======================================================
app.get("/api/auth/profile", protect, async (req, res) => {
  res.json(req.user);
});

// ======================================================
// ================= PATIENT ROUTES ======================
// ======================================================
app.use("/api/patients", patientRoutes);

// ======================================================
// ================= START SERVER ========================
// ======================================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
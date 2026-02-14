require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("./models/User");
const { sendVerificationEmail } = require("./services/emailService");

const app = express();

// ===== MIDDLEWARES =====
app.use(cors());
app.use(express.json());

// ===== ROOT ROUTE =====
app.get("/", (req, res) => {
  res.send("MyHealth X Backend Running 🚀");
});

// =====================================================
// ================= AUTH ROUTES =======================
// =====================================================

// ===== REGISTER =====
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: Date.now() + 30 * 60 * 1000,
    });

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: "Registration successful. Please verify your email.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== VERIFY EMAIL =====
app.get("/api/auth/verify-email/:token", async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    // Generate public emergencyId
    user.emergencyId =
      "MHX-" + crypto.randomBytes(4).toString("hex").toUpperCase();

    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ===== LOGIN =====
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    if (!user.isVerified)
      return res
        .status(401)
        .json({ message: "Please verify your email first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      emergencyId: user.emergencyId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =====================================================
// =============== PROTECTED PROFILE ===================
// =====================================================

const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token provided" });

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ===== UPDATE OWN PROFILE =====
app.put("/api/profile", authMiddleware, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =====================================================
// =============== PUBLIC EMERGENCY ====================
// =====================================================

app.get("/emergency/:emergencyId", async (req, res) => {
  try {
    const user = await User.findOne({
      emergencyId: req.params.emergencyId,
      subscriptionStatus: "active",
      isActive: true,
    });

    if (!user) return res.send("Emergency profile not available");

    res.send(`
      <h1>🚑 Emergency Medical Info</h1>
      <hr/>
      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Age:</strong> ${user.age || "N/A"}</p>
      <p><strong>Blood Group:</strong> ${user.bloodGroup || "N/A"}</p>
      <p><strong>Allergies:</strong> ${user.allergies || "None"}</p>
      <p><strong>Chronic Diseases:</strong> ${user.chronicDiseases || "None"}</p>
      <p><strong>Current Medications:</strong> ${user.currentMedications || "None"}</p>
      <p><strong>Emergency Contact:</strong> ${user.emergencyContactPhone || "N/A"}</p>
    `);
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// =====================================================
// ================= DATABASE ==========================
// =====================================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// =====================================================
// ================= START SERVER ======================
// =====================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
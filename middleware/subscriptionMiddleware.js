const User = require("../models/User");

const requireActiveSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.subscriptionStatus !== "active") {
      return res.status(403).json({
        message: "Subscription inactive. Please activate your plan.",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { requireActiveSubscription };
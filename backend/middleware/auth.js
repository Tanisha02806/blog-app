// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ message: "Invalid token" });

    // ✅ Store plain info only
    req.user = { _id: user._id.toString(), role: user.role, email: user.email };
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUser } = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

// 🧩 Register new user
router.post("/register", registerUser);

// 🔑 Login user and return JWT
router.post("/login", loginUser);

// 👤 Get logged-in user data (protected)
router.get("/me", verifyToken, getUser);

module.exports = router;

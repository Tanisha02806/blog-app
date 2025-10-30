// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" })); // tighten in production

// routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/comments", require("./routes/comments"));

// central error handler (must be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch(err => console.error("Mongo connection error:", err));

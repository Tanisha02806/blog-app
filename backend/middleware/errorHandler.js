// backend/middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error("ERROR:", err);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || "Internal Server Error",
      details: process.env.NODE_ENV === "production" ? undefined : err.stack,
    },
  });
}

module.exports = errorHandler;

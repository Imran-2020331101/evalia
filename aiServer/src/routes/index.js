const express = require("express");
const resumeRoutes = require("./resumeRoutes");

const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Evalia AI Server is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Mount route modules
router.use("/resume", resumeRoutes);

module.exports = router;

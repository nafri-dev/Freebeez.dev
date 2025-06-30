const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

const app = express()

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin:[ process.env.VITE_FRONTEND_URL || "https://freebeez-dev.vercel.app/" || "https://freebeez-dev.vercel.app/"],
    credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/instavault")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err))

// Import routes after middleware setup
const authRoutes = require("./routes/auth")
const freebieRoutes = require("./routes/freebies")
const analyticsRoutes = require("./routes/analytics")
const aiRoutes = require("./routes/ai")

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/freebies", freebieRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/ai", aiRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "InstaVault API is running",
    timestamp: new Date().toISOString(),
  })
})

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "InstaVault API Server",
    version: "1.0.0",
    endpoints: ["/api/auth", "/api/freebies", "/api/analytics", "/api/ai"],
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`)
})

module.exports = app

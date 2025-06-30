const jwt = require("jsonwebtoken")
const User = require("../models/User")

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization")

    if (!authHeader) {
      return res.status(401).json({
        message: "No authorization header provided",
      })
    }

    const token = authHeader.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        message: "No token provided, access denied",
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (!decoded.userId) {
      return res.status(401).json({
        message: "Invalid token format",
      })
    }

    // Get user from database
    const user = await User.findById(decoded.userId).select("-password")

    if (!user) {
      return res.status(401).json({
        message: "User not found, token is invalid",
      })
    }

    // Add user to request
    req.user = user
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token",
      })
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
      })
    }

    res.status(500).json({
      message: "Server error in authentication",
      error: error.message,
    })
  }
}

module.exports = auth

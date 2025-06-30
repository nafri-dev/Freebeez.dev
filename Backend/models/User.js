const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: [50, "Name cannot exceed 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  instagramUsername: {
    type: String,
    trim: true,
    lowercase: true,
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    reminderFrequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: "weekly",
    },
    categories: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  stats: {
    totalFreebies: {
      type: Number,
      default: 0,
    },
    completedFreebies: {
      type: Number,
      default: 0,
    },
    completionRate: {
      type: Number,
      default: 0,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
})

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Update user stats
userSchema.methods.updateStats = async function () {
  try {
    const Freebie = mongoose.model("Freebie")

    const totalFreebies = await Freebie.countDocuments({ userId: this._id })
    const completedFreebies = await Freebie.countDocuments({
      userId: this._id,
      status: "completed",
    })

    this.stats.totalFreebies = totalFreebies
    this.stats.completedFreebies = completedFreebies
    this.stats.completionRate = totalFreebies > 0 ? Math.round((completedFreebies / totalFreebies) * 100) : 0

    await this.save()
    return this.stats
  } catch (error) {
    console.error("Error updating user stats:", error)
    throw error
  }
}

module.exports = mongoose.model("User", userSchema)

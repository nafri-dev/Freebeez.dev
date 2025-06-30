const mongoose = require("mongoose")

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  freebieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Freebie",
    required: true,
  },
  type: {
    type: String,
    enum: ["email", "push", "whatsapp"],
    default: "email",
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  sent: {
    type: Boolean,
    default: false,
  },
  sentAt: Date,
  message: {
    type: String,
    maxlength: [500, "Message cannot exceed 500 characters"],
  },
  recurring: {
    enabled: {
      type: Boolean,
      default: false,
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: "weekly",
    },
    nextDate: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index for efficient reminder queries
reminderSchema.index({ scheduledDate: 1, sent: 1 })
reminderSchema.index({ userId: 1, sent: 1 })

module.exports = mongoose.model("Reminder", reminderSchema)

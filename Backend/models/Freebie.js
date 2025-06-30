const mongoose = require("mongoose")

const freebieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    maxlength: [200, "Title cannot exceed 200 characters"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, "Description cannot exceed 1000 characters"],
  },
  url: {
    type: String,
    required: [true, "URL is required"],
    match: [/^https?:\/\/.+/, "Please enter a valid URL"],
  },
  instagramPost: {
    type: String,
    match: [/^https?:\/\/(www\.)?instagram\.com\/p\/[a-zA-Z0-9_-]+\/?$/, "Please enter a valid Instagram post URL"],
  },
  source: {
    type: String,
    trim: true,
    maxlength: [100, "Source cannot exceed 100 characters"],
  },
  tags: [
    {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [30, "Tag cannot exceed 30 characters"],
    },
  ],
  status: {
    type: String,
    enum: ["new", "opened", "completed"],
    default: "new",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
  dateOpened: Date,
  dateCompleted: Date,
  reminder: {
    date: Date,
    sent: {
      type: Boolean,
      default: false,
    },
  },
  extractedFrom: {
    type: String,
       enum: ["manual", "dm_paste", "api","ocr_upload","dm-import"],
    default: "manual",
  },
  aiSummary: {
    type: String,
    maxlength: [500, "AI summary cannot exceed 500 characters"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  notes: {
    type: String,
    maxlength: [1000, "Notes cannot exceed 1000 characters"],
  },
  fileType: {
    type: String,
    enum: ["pdf", "video", "course", "template", "ebook", "tool", "other"],
    default: "other",
  },
  estimatedReadTime: {
    type: Number, // in minutes
    min: 0,
  },
})

// Indexes for better query performance
freebieSchema.index({ userId: 1, status: 1 })
freebieSchema.index({ userId: 1, tags: 1 })
freebieSchema.index({ userId: 1, dateAdded: -1 })
freebieSchema.index({ "reminder.date": 1, "reminder.sent": 1 })

// Update status dates
freebieSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const now = new Date()

    if (this.status === "opened" && !this.dateOpened) {
      this.dateOpened = now
    } else if (this.status === "completed" && !this.dateCompleted) {
      this.dateCompleted = now
    }
  }
  next()
})

// Virtual for time since added
freebieSchema.virtual("daysSinceAdded").get(function () {
  const now = new Date()
  const diffTime = Math.abs(now - this.dateAdded)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

module.exports = mongoose.model("Freebie", freebieSchema)

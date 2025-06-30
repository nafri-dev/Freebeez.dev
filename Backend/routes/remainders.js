const express = require("express")
const Reminder = require("../models/Reminder")
const reminderService = require("../services/reminderService")
const auth = require("../middleware/auth")
const router = express.Router()

// @route   GET /api/reminders
// @desc    Get user's reminders
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { includeCompleted = false } = req.query
    const reminders = await reminderService.getUserReminders(req.user._id, includeCompleted === "true")

    res.json({
      success: true,
      reminders,
    })
  } catch (error) {
    console.error("Get reminders error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get reminders",
      error: error.message,
    })
  }
})

// @route   POST /api/reminders
// @desc    Create a new reminder
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { freebieId, scheduledDate, type = "email", message = "" } = req.body

    if (!freebieId || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: "Freebie ID and scheduled date are required",
      })
    }

    const reminder = await reminderService.createReminder(req.user._id, freebieId, scheduledDate, type, message)

    res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      reminder,
    })
  } catch (error) {
    console.error("Create reminder error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create reminder",
      error: error.message,
    })
  }
})

// @route   PUT /api/reminders/:id
// @desc    Update a reminder
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const { scheduledDate, type, message } = req.body
    const updates = {}

    if (scheduledDate) updates.scheduledDate = new Date(scheduledDate)
    if (type) updates.type = type
    if (message !== undefined) updates.message = message

    const reminder = await reminderService.updateReminder(req.params.id, req.user._id, updates)

    res.json({
      success: true,
      message: "Reminder updated successfully",
      reminder,
    })
  } catch (error) {
    console.error("Update reminder error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update reminder",
      error: error.message,
    })
  }
})

// @route   DELETE /api/reminders/:id
// @desc    Cancel a reminder
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    await reminderService.cancelReminder(req.params.id, req.user._id)

    res.json({
      success: true,
      message: "Reminder cancelled successfully",
    })
  } catch (error) {
    console.error("Cancel reminder error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to cancel reminder",
      error: error.message,
    })
  }
})

// @route   GET /api/reminders/stats
// @desc    Get reminder statistics
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    const stats = await reminderService.getReminderStats(req.user._id)

    res.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Get reminder stats error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get reminder stats",
      error: error.message,
    })
  }
})

// @route   POST /api/reminders/test
// @desc    Test reminder system
// @access  Private
router.post("/test", auth, async (req, res) => {
  try {
    // Create a test reminder for 1 minute from now
    const testDate = new Date()
    testDate.setMinutes(testDate.getMinutes() + 1)

    const reminder = await reminderService.createReminder(
      req.user._id,
      req.body.freebieId, // You need to provide a valid freebie ID
      testDate,
      "email",
      "This is a test reminder",
    )

    res.json({
      success: true,
      message: "Test reminder created - will be sent in 1 minute",
      reminder,
    })
  } catch (error) {
    console.error("Test reminder error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create test reminder",
      error: error.message,
    })
  }
})

module.exports = router

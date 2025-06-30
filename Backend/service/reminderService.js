const Reminder = require("../models/Reminder")
const Freebie = require("../models/Freebie")
const User = require("../models/User")
const emailService = require("./emailService")
const cron = require("node-cron")
const mongoose = require("mongoose") // Import mongoose to use mongoose.Types.ObjectId

class ReminderService {
  constructor() {
    this.startReminderScheduler()
  }

  // Create a new reminder
  async createReminder(userId, freebieId, scheduledDate, type = "email", message = "") {
    try {
      const reminder = new Reminder({
        userId,
        freebieId,
        type,
        scheduledDate: new Date(scheduledDate),
        message,
      })

      await reminder.save()
      console.log(`✅ Reminder created for user ${userId}, freebie ${freebieId}`)
      return reminder
    } catch (error) {
      console.error("❌ Failed to create reminder:", error)
      throw error
    }
  }

  // Get pending reminders for a user
  async getUserReminders(userId, includeCompleted = false) {
    try {
      const query = { userId }
      if (!includeCompleted) {
        query.sent = false
      }

      const reminders = await Reminder.find(query)
        .populate("freebieId", "title description url")
        .sort({ scheduledDate: 1 })

      return reminders
    } catch (error) {
      console.error("❌ Failed to get user reminders:", error)
      throw error
    }
  }

  // Check and send due reminders
  async checkAndSendReminders() {
    try {
      const now = new Date()
      console.log(`🔍 Checking for due reminders at ${now.toISOString()}`)

      // Find all unsent reminders that are due
      const dueReminders = await Reminder.find({
        sent: false,
        scheduledDate: { $lte: now },
      })
        .populate("userId", "name email")
        .populate("freebieId", "title description url")

      console.log(`📧 Found ${dueReminders.length} due reminders`)

      for (const reminder of dueReminders) {
        try {
          await this.sendReminder(reminder)
        } catch (error) {
          console.error(`❌ Failed to send reminder ${reminder._id}:`, error)
        }
      }

      return dueReminders.length
    } catch (error) {
      console.error("❌ Failed to check reminders:", error)
      throw error
    }
  }

  // Send a specific reminder
  async sendReminder(reminder) {
    try {
      const { userId, freebieId, type, message } = reminder

      if (!userId || !freebieId) {
        throw new Error("Missing user or freebie data")
      }

      let success = false

      switch (type) {
        case "email":
          const result = await emailService.sendReminderEmail(userId, freebieId)
          success = result.success
          break

        case "push":
          // TODO: Implement push notifications
          console.log("📱 Push notifications not implemented yet")
          success = false
          break

        case "whatsapp":
          // TODO: Implement WhatsApp notifications
          console.log("📱 WhatsApp notifications not implemented yet")
          success = false
          break

        default:
          throw new Error(`Unknown reminder type: ${type}`)
      }

      if (success) {
        // Mark reminder as sent
        reminder.sent = true
        reminder.sentAt = new Date()
        await reminder.save()

        console.log(`✅ Reminder sent successfully: ${reminder._id}`)

        // Handle recurring reminders
        if (reminder.recurring && reminder.recurring.enabled) {
          await this.createRecurringReminder(reminder)
        }
      }

      return success
    } catch (error) {
      console.error(`❌ Failed to send reminder ${reminder._id}:`, error)
      throw error
    }
  }

  // Create next occurrence of recurring reminder
  async createRecurringReminder(originalReminder) {
    try {
      const { frequency } = originalReminder.recurring
      const nextDate = new Date(originalReminder.scheduledDate)

      switch (frequency) {
        case "daily":
          nextDate.setDate(nextDate.getDate() + 1)
          break
        case "weekly":
          nextDate.setDate(nextDate.getDate() + 7)
          break
        case "monthly":
          nextDate.setMonth(nextDate.getMonth() + 1)
          break
        default:
          throw new Error(`Unknown frequency: ${frequency}`)
      }

      const newReminder = new Reminder({
        userId: originalReminder.userId,
        freebieId: originalReminder.freebieId,
        type: originalReminder.type,
        scheduledDate: nextDate,
        message: originalReminder.message,
        recurring: originalReminder.recurring,
      })

      await newReminder.save()
      console.log(`🔄 Created recurring reminder for ${nextDate.toISOString()}`)

      return newReminder
    } catch (error) {
      console.error("❌ Failed to create recurring reminder:", error)
      throw error
    }
  }

  // Start the reminder scheduler (runs every minute)
  startReminderScheduler() {
    console.log("🚀 Starting reminder scheduler...")

    // Run every minute
    cron.schedule("* * * * *", async () => {
      try {
        await this.checkAndSendReminders()
      } catch (error) {
        console.error("❌ Reminder scheduler error:", error)
      }
    })

    // Also run a cleanup job daily at midnight
    cron.schedule("0 0 * * *", async () => {
      try {
        await this.cleanupOldReminders()
      } catch (error) {
        console.error("❌ Cleanup job error:", error)
      }
    })

    console.log("✅ Reminder scheduler started")
  }

  // Cleanup old sent reminders (older than 30 days)
  async cleanupOldReminders() {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const result = await Reminder.deleteMany({
        sent: true,
        sentAt: { $lt: thirtyDaysAgo },
        "recurring.enabled": { $ne: true }, // Don't delete recurring reminders
      })

      console.log(`🧹 Cleaned up ${result.deletedCount} old reminders`)
      return result.deletedCount
    } catch (error) {
      console.error("❌ Failed to cleanup old reminders:", error)
      throw error
    }
  }

  // Cancel a reminder
  async cancelReminder(reminderId, userId) {
    try {
      const reminder = await Reminder.findOneAndDelete({
        _id: reminderId,
        userId,
        sent: false,
      })

      if (!reminder) {
        throw new Error("Reminder not found or already sent")
      }

      console.log(`🗑️ Cancelled reminder ${reminderId}`)
      return reminder
    } catch (error) {
      console.error("❌ Failed to cancel reminder:", error)
      throw error
    }
  }

  // Update reminder
  async updateReminder(reminderId, userId, updates) {
    try {
      const reminder = await Reminder.findOneAndUpdate({ _id: reminderId, userId, sent: false }, updates, { new: true })

      if (!reminder) {
        throw new Error("Reminder not found or already sent")
      }

      console.log(`📝 Updated reminder ${reminderId}`)
      return reminder
    } catch (error) {
      console.error("❌ Failed to update reminder:", error)
      throw error
    }
  }

  // Get reminder statistics
  async getReminderStats(userId) {
    try {
      const stats = await Reminder.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            sent: { $sum: { $cond: ["$sent", 1, 0] } },
            pending: { $sum: { $cond: ["$sent", 0, 1] } },
            overdue: {
              $sum: {
                $cond: [
                  {
                    $and: [{ $eq: ["$sent", false] }, { $lt: ["$scheduledDate", new Date()] }],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ])

      return stats[0] || { total: 0, sent: 0, pending: 0, overdue: 0 }
    } catch (error) {
      console.error("❌ Failed to get reminder stats:", error)
      throw error
    }
  }
}

module.exports = new ReminderService()

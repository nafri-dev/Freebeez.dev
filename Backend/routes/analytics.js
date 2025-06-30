const express = require("express")
const Freebie = require("../models/Freebie")
const auth = require("../middleware/auth")
const router = express.Router()

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private
router.get("/dashboard", auth, async (req, res) => {
  try {
    const userId = req.user._id

    // Basic stats
    const totalFreebies = await Freebie.countDocuments({ userId })
    const newFreebies = await Freebie.countDocuments({ userId, status: "new" })
    const openedFreebies = await Freebie.countDocuments({ userId, status: "opened" })
    const completedFreebies = await Freebie.countDocuments({ userId, status: "completed" })

    // Weekly stats
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const weeklyStats = {
      collected: await Freebie.countDocuments({
        userId,
        dateAdded: { $gte: weekAgo },
      }),
      completed: await Freebie.countDocuments({
        userId,
        status: "completed",
        dateCompleted: { $gte: weekAgo },
      }),
    }

    // Monthly stats
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    const monthlyStats = {
      collected: await Freebie.countDocuments({
        userId,
        dateAdded: { $gte: monthAgo },
      }),
      completed: await Freebie.countDocuments({
        userId,
        status: "completed",
        dateCompleted: { $gte: monthAgo },
      }),
    }

    // Top categories (tags)
    const categoryStats = await Freebie.aggregate([
      { $match: { userId } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    // Completion rate over time (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const completionTrend = await Freebie.aggregate([
      {
        $match: {
          userId,
          dateAdded: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$dateAdded" },
            month: { $month: "$dateAdded" },
          },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ])

    // Recent Activity (last 7 days)
    const recentFreebies = await Freebie.find({
      userId,
      $or: [
        { dateAdded: { $gte: weekAgo } },
        { dateCompleted: { $gte: weekAgo } },
        { dateOpened: { $gte: weekAgo } }
      ]
    })
    .sort({ dateAdded: -1 })
    .limit(10)
    .select("title tags status dateAdded dateCompleted dateOpened")

    // Process recent activity
    const recentActivity = []
    
    recentFreebies.forEach(freebie => {
      // Add completion activity
      if (freebie.dateCompleted && freebie.dateCompleted >= weekAgo) {
        recentActivity.push({
          title: freebie.title,
          action: 'completed',
          date: freebie.dateCompleted,
          tags: freebie.tags
        })
      }
      // Add opened activity
      else if (freebie.dateOpened && freebie.dateOpened >= weekAgo) {
        recentActivity.push({
          title: freebie.title,
          action: 'opened',
          date: freebie.dateOpened,
          tags: freebie.tags
        })
      }
      // Add creation activity
      else if (freebie.dateAdded >= weekAgo) {
        recentActivity.push({
          title: freebie.title,
          action: 'added',
          date: freebie.dateAdded,
          tags: freebie.tags
        })
      }
    })

    // Sort by date and limit
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date))

    res.json({
      basicStats: {
        total: totalFreebies,
        new: newFreebies,
        opened: openedFreebies,
        completed: completedFreebies,
        completionRate: totalFreebies > 0 ? Math.round((completedFreebies / totalFreebies) * 100) : 0,
      },
      weeklyStats,
      monthlyStats,
      topCategories: categoryStats.map((cat) => ({
        name: cat._id,
        count: cat.count,
        percentage: totalFreebies > 0 ? Math.round((cat.count / totalFreebies) * 100) : 0,
      })),
      completionTrend,
      recentActivity: recentActivity.slice(0, 8),
    })

  } catch (error) {
    console.error("Analytics error:", error)
    res.status(500).json({ message: "Failed to fetch analytics" })
  }
})

// @route   GET /api/analytics/summary
// @desc    Get quick analytics summary
// @access  Private
router.get("/summary", auth, async (req, res) => {
  try {
    const userId = req.user._id

    const summary = await Freebie.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "opened"] }, 1, 0] } },
          new: { $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] } },
        },
      },
    ])

    const result = summary[0] || { total: 0, completed: 0, inProgress: 0, new: 0 }
    result.completionRate = result.total > 0 ? Math.round((result.completed / result.total) * 100) : 0

    res.json({
      success: true,
      summary: result,
    })
  } catch (error) {
    console.error("Analytics summary error:", error)
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch analytics summary" 
    })
  }
})

module.exports = router
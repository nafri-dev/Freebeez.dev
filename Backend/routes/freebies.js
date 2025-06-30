const express = require("express")
const Freebie = require("../models/Freebie")
const User = require("../models/User")
const auth = require("../middleware/auth")
const mongoose = require("mongoose")

const router = express.Router()

// @route   GET /api/freebies
// @desc    Get all freebies for user
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { status, tags, search, page = 1, limit = 10, sortBy = "dateAdded", sortOrder = "desc" } = req.query

    // Build query
    const query = { userId: req.user._id }

    if (status && status !== "all") {
      query.status = status
    }

    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim().toLowerCase())
      query.tags = { $in: tagArray }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { source: { $regex: search, $options: "i" } },
      ]
    }

    // Execute query with pagination
    const freebies = await Freebie.find(query)
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .exec()

    const total = await Freebie.countDocuments(query)

    res.json({
      success: true,
      freebies,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    })
  } catch (error) {
    console.error("Get freebies error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch freebies",
      error: error.message,
    })
  }
})

// @route   GET /api/freebies/stats
// @desc    Get freebie stats for user
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user._id

    const stats = await Freebie.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          new: {
            $sum: {
              $cond: [{ $eq: ["$status", "new"] }, 1, 0],
            },
          },
          opened: {
            $sum: {
              $cond: [{ $eq: ["$status", "opened"] }, 1, 0],
            },
          },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
        },
      },
    ])

    const result = stats[0] || { total: 0, new: 0, opened: 0, completed: 0 }

    res.json({
      success: true,
      stats: result,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/freebies
// @desc    Create new freebie
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const freebieData = {
      ...req.body,
      userId: req.user._id,
      tags: req.body.tags?.map((tag) => tag.toLowerCase().trim()) || [],
    }

    const freebie = new Freebie(freebieData)
    await freebie.save()

    res.status(201).json({
      success: true,
      message: "Freebie created successfully",
      freebie,
    })
  } catch (error) {
    console.error("Create freebie error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create freebie",
      error: error.message,
    })
  }
})

// @route   POST /api/freebies/bulk
// @desc    Create multiple freebies
// @access  Private


router.post("/bulk", auth, async (req, res) => {
  try {


    // Step 1: Extract freebies from the request
    let freebiesData = req.body
    if (req.body.freebies && Array.isArray(req.body.freebies)) {
      freebiesData = req.body.freebies
    
    } else if (Array.isArray(req.body)) {
      console.log("Using req.body directly")
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid request format. Expected array of freebies.",
        received: typeof req.body,
      })
    }

  

    // Step 2: Validate and clean each freebie
    const validFreebies = []
    const errors = []

    for (let i = 0; i < freebiesData.length; i++) {
      const freebie = freebiesData[i]
   
      try {
        // Title validation
        if (!freebie.title || typeof freebie.title !== "string" || freebie.title.trim().length === 0) {
          errors.push(`Freebie ${i + 1}: Missing or invalid title`)
          continue
        }

        // URL validation
        if (!freebie.url || !/^https?:\/\/.+/.test(freebie.url)) {
          errors.push(`Freebie ${i + 1}: Missing or invalid URL`)
          continue
        }

        // Check extractedFrom enum manually
        const allowedExtractionSources = ["manual", "dm_paste", "extension", "api", "ocr_upload","dm-import"]
        const extractedFrom = freebie.extractedFrom || "manual"
        if (!allowedExtractionSources.includes(extractedFrom)) {
          errors.push(`Freebie ${i + 1}: Invalid extractedFrom value: ${extractedFrom}`)
          continue
        }

        // Create valid freebie
        const cleanFreebie = {
          title: freebie.title.trim(),
          description: freebie.description || "",
          url: freebie.url,
          ...(freebie.instagramPost ? { instagramPost: freebie.instagramPost } : {}),
          source: freebie.source || "Instagram",
          tags: Array.isArray(freebie.tags)
            ? freebie.tags.map((tag) => String(tag).toLowerCase().trim()).filter((tag) => tag.length > 0)
            : [],
          status: freebie.status || "new",
          priority: freebie.priority || "medium",
          fileType: freebie.fileType || "other",
          estimatedReadTime: Number(freebie.estimatedReadTime) || 15,
          extractedFrom,
          ...(freebie.aiSummary ? { aiSummary: freebie.aiSummary } : {}),
          userId: new mongoose.Types.ObjectId(req.user._id),
          dateAdded: freebie.dateAdded ? new Date(freebie.dateAdded) : new Date(),
        }

        console.log("Clean freebie:", cleanFreebie)
        validFreebies.push(cleanFreebie)
      } catch (err) {
        console.error(`Error processing freebie ${i + 1}:`, err)
        errors.push(`Freebie ${i + 1}: ${err.message}`)
      }
    }


    // Step 3: Insert into DB if any valid
    if (validFreebies.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid freebies to create",
        errors,
      })
    }

    const insertResult = await Freebie.insertMany(validFreebies, { ordered: false })

   

    res.status(201).json({
      success: true,
      message: `Successfully created ${insertResult.length} freebies`,
      total: insertResult.length,
      freebies: insertResult,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("=== BULK CREATE ERROR ===", error)
    res.status(500).json({
      success: false,
      message: "Failed to create freebies",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
})




// @route   PUT /api/freebies/:id
// @desc    Update freebie
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const freebie = await Freebie.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!freebie) {
      return res.status(404).json({
        success: false,
        message: "Freebie not found",
      })
    }

    // Update fields
    Object.keys(req.body).forEach((key) => {
      if (key === "tags" && req.body[key]) {
        freebie[key] = req.body[key].map((tag) => tag.toLowerCase().trim())
      } else if (req.body[key] !== undefined) {
        freebie[key] = req.body[key]
      }
    })

    await freebie.save()

    res.json({
      success: true,
      message: "Freebie updated successfully",
      freebie,
    })
  } catch (error) {
    console.error("Update freebie error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update freebie",
      error: error.message,
    })
  }
})

// @route   DELETE /api/freebies/:id
// @desc    Delete freebie
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const freebie = await Freebie.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!freebie) {
      return res.status(404).json({
        success: false,
        message: "Freebie not found",
      })
    }

    res.json({
      success: true,
      message: "Freebie deleted successfully",
    })
  } catch (error) {
    console.error("Delete freebie error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete freebie",
      error: error.message,
    })
  }
})

// @route   GET /api/freebies/tags
// @desc    Get all unique tags for user
// @access  Private
router.get("/tags", auth, async (req, res) => {
  try {
    const tags = await Freebie.distinct("tags", { userId: req.user._id })
    res.json({
      success: true,
      tags: tags.sort(),
    })
  } catch (error) {
    console.error("Get tags error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch tags",
      error: error.message,
    })
  }
})
router.get("/analytics", auth, async (req, res) => {
  try {
    const userId = req.user.id

    // Get total count
    const totalFreebies = await Freebie.countDocuments({ userId })

    // Get status breakdown
    const statusBreakdown = await Freebie.aggregate([
      { $match: { userId: req.user.id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])

    // Get tag breakdown
    const tagBreakdown = await Freebie.aggregate([
      { $match: { userId: req.user.id } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    // Get recent activity
    const recentFreebies = await Freebie.find({ userId })
      .sort({ dateAdded: -1 })
      .limit(5)
      .select("title dateAdded status")

    res.json({
      success: true,
      analytics: {
        totalFreebies,
        statusBreakdown,
        tagBreakdown,
        recentFreebies,
      },
    })
  } catch (error) {
    console.error("Analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
})
module.exports = router

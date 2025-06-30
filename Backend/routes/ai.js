const express = require("express")
const Freebie = require("../models/Freebie")
const auth = require("../middleware/auth")
const router = express.Router()

// Initialize OpenAI only if API key is available
let openai = null
try {
  if (process.env.OPENAI_API_KEY) {
    const OpenAI = require("openai")
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    console.log("✅ OpenAI initialized successfully")
  } else {
    console.log("⚠️ OpenAI API key not found, using fallback methods")
  }
} catch (error) {
  console.log("❌ OpenAI initialization failed:", error.message)
}

// @route   POST /api/ai/categorize
// @desc    Auto-categorize freebies using AI (with fallback)
// @access  Private
router.post("/categorize", auth, async (req, res) => {
  try {
    const { title, description, url } = req.body

    // Validate input
    if (!title && !description && !url) {
      return res.status(400).json({
        message: "At least one of title, description, or URL is required",
      })
    }

    let tags = []

    if (openai) {
      try {
        const prompt = `
        Categorize this freebie into relevant tags. Return 3-5 specific, lowercase tags.
        
        Title: ${title || "Not provided"}
        Description: ${description || "Not provided"}
        URL: ${url || "Not provided"}
        
        Common categories include: react, javascript, ai, design, marketing, business, productivity, finance, health, photography, writing, coding, social-media, instagram, figma, canva, notion, etc.
        
        Return only a JSON array of strings: ["tag1", "tag2", "tag3"]
        `

        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo", // Using cheaper model for categorization
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 100,
        })

        const content = response.choices[0].message.content.trim()

        // Try to parse JSON response
        try {
          tags = JSON.parse(content)
          if (!Array.isArray(tags)) {
            throw new Error("Response is not an array")
          }
        } catch (parseError) {
          console.log("Failed to parse AI response, using fallback")
          tags = categorizeWithPatterns(title, description, url)
        }
      } catch (aiError) {
        console.error("AI categorization failed:", aiError.message)
        tags = categorizeWithPatterns(title, description, url)
      }
    } else {
      tags = categorizeWithPatterns(title, description, url)
    }

    // Ensure we have valid tags
    if (!Array.isArray(tags) || tags.length === 0) {
      tags = ["resource", "freebie"]
    }

    // Clean and limit tags
    tags = tags
      .filter((tag) => typeof tag === "string" && tag.trim().length > 0)
      .map((tag) => tag.toLowerCase().trim())
      .slice(0, 5)

    res.json({
      tags,
      method: openai ? "ai" : "pattern_matching",
    })
  } catch (error) {
    console.error("AI categorization error:", error)
    res.status(500).json({
      message: "Failed to categorize",
      error: error.message,
    })
  }
})

// Enhanced fallback categorization function
function categorizeWithPatterns(title, description, url) {
  const text = `${title || ""} ${description || ""} ${url || ""}`.toLowerCase()
  const tags = []

  const categoryMap = {
    // Programming & Development
    react: ["react", "jsx", "component", "hooks"],
    javascript: ["javascript", "js", "node", "npm", "typescript"],
    python: ["python", "django", "flask", "pandas"],
    coding: ["code", "programming", "developer", "github", "git"],

    // Design & Creative
    design: ["design", "ui", "ux", "user interface", "user experience"],
    figma: ["figma", "prototype", "wireframe"],
    canva: ["canva", "graphic design"],
    photography: ["photo", "camera", "lightroom", "photoshop"],

    // Business & Marketing
    marketing: ["marketing", "social media", "seo", "advertising"],
    business: ["business", "entrepreneur", "startup", "strategy"],
    instagram: ["instagram", "insta", "ig", "social"],

    // Productivity & Tools
    productivity: ["productivity", "efficiency", "workflow"],
    notion: ["notion", "template", "organization"],
    ai: ["ai", "artificial intelligence", "chatgpt", "openai", "machine learning"],

    // Content & Writing
    writing: ["writing", "blog", "content", "copywriting"],
    ebook: ["ebook", "book", "pdf", "guide"],

    // Finance & Money
    finance: ["finance", "money", "budget", "investment", "crypto"],

    // Health & Lifestyle
    health: ["health", "fitness", "wellness", "nutrition"],

    // Education & Learning
    course: ["course", "tutorial", "lesson", "education"],
    template: ["template", "mockup", "layout"],
  }

  // Check for category matches
  Object.entries(categoryMap).forEach(([category, keywords]) => {
    if (keywords.some((keyword) => text.includes(keyword))) {
      tags.push(category)
    }
  })

  // Add file type based tags
  if (text.includes(".pdf") || text.includes("pdf")) tags.push("pdf")
  if (text.includes("video") || text.includes(".mp4")) tags.push("video")
  if (text.includes("template")) tags.push("template")
  if (text.includes("tool")) tags.push("tool")

  // Add default tags if none found
  if (tags.length === 0) {
    tags.push("resource", "freebie")
  }

  // Remove duplicates and limit
  return [...new Set(tags)].slice(0, 5)
}

// @route   POST /api/ai/detect-freebies
// @desc    Detect freebies from DM text using AI or fallback method
// @access  Private
router.post("/detect-freebies", auth, async (req, res) => {
  try {
    const { text, instagramPost } = req.body

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Text is required" })
    }

    let detectedFreebies = []

    // Try AI detection first if OpenAI is available
    if (openai) {
      try {
        const prompt = `
        Analyze this Instagram DM conversation and extract any freebies, resources, or downloadable content offered. 
        Look for PDFs, ebooks, courses, templates, tools, guides, checklists, or any valuable content being shared.
        
        Text to analyze:
        "${text}"
        
        Return a JSON array of objects with this exact structure:
        [
          {
            "title": "Clear, descriptive title of the freebie",
            "description": "Brief description of what it contains",
            "url": "Download link if found, otherwise empty string",
            "tags": ["relevant", "category", "tags"],
            "fileType": "pdf|video|course|template|ebook|tool|other",
            "estimatedReadTime": 30
          }
        ]
        
        Only include actual freebies/resources, not regular conversation. If no freebies found, return empty array [].
        `

        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 1000,
        })

        detectedFreebies = JSON.parse(response.choices[0].message.content)
      } catch (aiError) {
        console.error("AI detection failed, using fallback:", aiError.message)
        detectedFreebies = detectFreebiesWithPatterns(text)
      }
    } else {
      detectedFreebies = detectFreebiesWithPatterns(text)
    }

    // Add metadata to detected freebies
    const enrichedFreebies = detectedFreebies.map((freebie) => ({
      ...freebie,
      extractedFrom: "dm_paste",
      instagramPost: instagramPost || "",
      userId: req.user._id,
      dateAdded: new Date(),
    }))

    res.json({
      message: `Detected ${enrichedFreebies.length} freebies`,
      freebies: enrichedFreebies,
      method: openai ? "ai" : "pattern_matching",
    })
  } catch (error) {
    console.error("AI detection error:", error)
    res.status(500).json({
      message: "Failed to detect freebies",
      error: error.message,
    })
  }
})

// Enhanced pattern matching function
function detectFreebiesWithPatterns(text) {
  const freebies = []

  // Common freebie patterns
  const patterns = [
    {
      regex: /https?:\/\/[^\s]+\.(pdf|docx|zip|mp4|avi|mov)/gi,
      type: "pdf",
    },
    {
      regex: /https?:\/\/drive\.google\.com\/[^\s]+/gi,
      type: "other",
    },
    {
      regex: /https?:\/\/dropbox\.com\/[^\s]+/gi,
      type: "other",
    },
    {
      regex: /https?:\/\/[^\s]*notion\.so[^\s]*/gi,
      type: "template",
    },
    {
      regex: /https?:\/\/[^\s]*canva\.com[^\s]*/gi,
      type: "template",
    },
    {
      regex: /https?:\/\/[^\s]*figma\.com[^\s]*/gi,
      type: "template",
    },
  ]

  // Extract URLs and create freebies
  patterns.forEach((pattern) => {
    const matches = text.match(pattern.regex)
    if (matches) {
      matches.forEach((url) => {
        const urlIndex = text.indexOf(url)
        const beforeUrl = text.substring(Math.max(0, urlIndex - 100), urlIndex)
        const afterUrl = text.substring(urlIndex + url.length, urlIndex + url.length + 100)
        let title = "Free Resource"

        // Look for common freebie keywords near the URL
        const titlePatterns = [
          /(?:free|download|get your|here's your|check out this)\s+([^.!?\n]{10,50})/i,
          /([^.!?\n]{10,50})\s+(?:template|guide|ebook|pdf|course|checklist)/i,
        ]

        for (const titlePattern of titlePatterns) {
          const titleMatch = (beforeUrl + " " + afterUrl).match(titlePattern)
          if (titleMatch) {
            title = titleMatch[1].trim()
            break
          }
        }

        freebies.push({
          title: title,
          description: `Resource shared via Instagram DM`,
          url: url,
          tags: [pattern.type, "instagram", "dm"],
          fileType: pattern.type,
          estimatedReadTime: 15,
        })
      })
    }
  })

  // Look for text-based freebies (without URLs)
  const textPatterns = [
    /(?:free|download|get your|here's your)\s+([^.!?\n]{10,80})/gi,
    /([^.!?\n]{10,80})\s+(?:template|guide|ebook|pdf|course|checklist|freebie)/gi,
  ]

  textPatterns.forEach((pattern) => {
    const matches = text.match(pattern)
    if (matches) {
      matches.forEach((match) => {
        const cleanMatch = match.replace(/^(free|download|get your|here's your)\s+/i, "").trim()
        if (cleanMatch.length > 5 && !freebies.some((f) => f.title.includes(cleanMatch))) {
          freebies.push({
            title: cleanMatch,
            description: "Freebie mentioned in Instagram DM",
            url: "",
            tags: ["freebie", "instagram", "dm"],
            fileType: "other",
            estimatedReadTime: 10,
          })
        }
      })
    }
  })

  return freebies.slice(0, 5) // Limit to 5 results
}

// @route   POST /api/ai/summarize
// @desc    Generate AI summary for a freebie (with fallback)
// @access  Private
router.post("/summarize", auth, async (req, res) => {
  try {
    const { freebieId, content } = req.body

    const freebie = await Freebie.findOne({
      _id: freebieId,
      userId: req.user._id,
    })

    if (!freebie) {
      return res.status(404).json({ message: "Freebie not found" })
    }

    let summary = ""

    if (openai) {
      try {
        const prompt = `
        Create a concise summary of this content in 2-3 sentences. Focus on the key takeaways and value.
        
        Title: ${freebie.title}
        Description: ${freebie.description}
        Content: ${content || "No additional content provided"}
        
        Summary:
        `

        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5,
          max_tokens: 200,
        })

        summary = response.choices[0].message.content.trim()
      } catch (aiError) {
        console.error("AI summarization failed:", aiError.message)
        summary = `${freebie.title} - ${freebie.description || "A valuable resource shared via Instagram."}`
      }
    } else {
      summary = `${freebie.title} - ${freebie.description || "A valuable resource shared via Instagram."}`
    }

    // Update freebie with summary
    freebie.aiSummary = summary
    await freebie.save()

    res.json({
      message: "Summary generated successfully",
      summary,
    })
  } catch (error) {
    console.error("AI summarization error:", error)
    res.status(500).json({ message: "Failed to generate summary" })
  }
})

// @route   GET /api/ai/test
// @desc    Test AI functionality
// @access  Private
router.get("/test", auth, async (req, res) => {
  try {
    const status = {
      openaiAvailable: !!openai,
      apiKeyConfigured: !!process.env.OPENAI_API_KEY,
      timestamp: new Date().toISOString(),
    }

    if (openai) {
      try {
        // Test with a simple request
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: "Say 'AI is working'" }],
          max_tokens: 10,
        })
        status.testResponse = response.choices[0].message.content
        status.working = true
      } catch (testError) {
        status.working = false
        status.error = testError.message
      }
    }

    res.json(status)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router

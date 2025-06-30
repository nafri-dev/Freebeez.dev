/* eslint-disable no-unused-vars */
"use client"

import { useState } from "react"
import { freebiesAPI } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline"
import toast from "react-hot-toast"

const DMImport = () => {
  const [dmText, setDmText] = useState("")
  const [instagramPost, setInstagramPost] = useState("")
  const [loading, setLoading] = useState(false)
  const [detectedFreebies, setDetectedFreebies] = useState([])
  const [importing, setImporting] = useState(false)

  const { user } = useAuth()

  const handleDetectFreebies = async () => {
    if (!dmText.trim()) {
      toast.error("Please enter some DM text to analyze")
      return
    }

    setLoading(true)
    try {
      // Improved pattern-based detection
      const freebies = detectFreebiesFromText(dmText, instagramPost)

      if (freebies.length === 0) {
        toast("No clear freebies detected. You can add them manually below.", {
          icon: "ℹ️",
        })
      } else {
        toast.success(`Found ${freebies.length} potential freebie${freebies.length > 1 ? "s" : ""}!`)
      }

      setDetectedFreebies(freebies)
    } catch (error) {
      console.error("Detection failed:", error)
      toast.error("Failed to analyze text. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const detectFreebiesFromText = (text, postUrl = "") => {
    const freebies = []

    // Strong freebie indicators (more specific)
    const strongFreebieKeywords = [
      "free download",
      "free template",
      "free ebook",
      "free guide",
      "free pdf",
      "free course",
      "free checklist",
      "free worksheet",
      "free planner",
      "download free",
      "get your free",
      "here's your free",
      "grab your free",
      "claim your free",
      "complimentary",
      "no cost",
      "at no charge",
    ]

    // URL patterns
    const urlRegex = /(https?:\/\/[^\s]+)/gi
    const urls = text.match(urlRegex) || []

    // Split text into meaningful sentences/paragraphs
    const sentences = text
      .split(/[.!?\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15) // Only consider substantial sentences

    console.log("Processing sentences:", sentences)

    sentences.forEach((sentence, index) => {
      const lowerSentence = sentence.toLowerCase()

      // Check for strong freebie keywords
      const hasStrongKeyword = strongFreebieKeywords.some((keyword) => lowerSentence.includes(keyword))

      if (hasStrongKeyword) {
        // Find URL in this sentence or use a general URL
        const sentenceUrl = sentence.match(urlRegex)?.[0] || urls[0] || ""

        // Extract meaningful title
        const title = extractMeaningfulTitle(sentence) || `Free Resource ${freebies.length + 1}`

        freebies.push({
          title: title,
          description: sentence.trim(),
          url: sentenceUrl,
          source: "Instagram DM",
          instagramPost: postUrl,
          tags: extractTags(sentence),
          status: "new",
          extractedFrom: "dm-import",
          dateAdded: new Date().toISOString(),
        })
      }
    })

    // If no freebies detected but URLs exist with some freebie context
    if (freebies.length === 0 && urls.length > 0) {
      const hasAnyFreebieContext = strongFreebieKeywords.some((keyword) => text.toLowerCase().includes(keyword))

      if (hasAnyFreebieContext) {
        urls.slice(0, 2).forEach((url, index) => {
          // Limit to 2 URLs
          freebies.push({
            title: `Free Resource ${index + 1}`,
            description: `Resource found in DM conversation`,
            url: url,
            source: "Instagram DM",
            instagramPost: postUrl,
            tags: ["resource", "manual-review-needed"],
            status: "new",
            extractedFrom: "dm-import",
            dateAdded: new Date().toISOString(),
          })
        })
      }
    }

    console.log("Detected freebies:", freebies)
    return freebies
  }

  const extractMeaningfulTitle = (sentence) => {
    // Look for patterns that indicate the freebie name
    const patterns = [
      /(?:free|download|get your|here's your|grab your|claim your)\s+([^.!?\n]{5,50})/i,
      /([^.!?\n]{5,50})\s+(?:template|guide|ebook|pdf|course|checklist|worksheet|planner)/i,
      /(?:this|the)\s+([^.!?\n]{5,50})\s+(?:is free|for free|at no cost)/i,
    ]

    for (const pattern of patterns) {
      const match = sentence.match(pattern)
      if (match && match[1]) {
        let title = match[1].trim()
        // Clean up the title
        title = title.replace(/^(free|the|this|your|my)\s+/i, "")
        return title.charAt(0).toUpperCase() + title.slice(1)
      }
    }

    // Fallback: use first meaningful part of sentence
    const words = sentence.split(/\s+/).slice(0, 6).join(" ")
    return words.length > 40 ? words.substring(0, 40) + "..." : words
  }

  const extractTags = (text) => {
    const tags = []
    const lowerText = text.toLowerCase()

    // Category mapping
    const categories = {
      business: ["business", "entrepreneur", "startup", "marketing", "sales"],
      design: ["design", "template", "graphic", "canva", "photoshop"],
      productivity: ["productivity", "planner", "organize", "schedule", "time"],
      education: ["course", "learn", "tutorial", "guide", "training"],
      finance: ["money", "budget", "finance", "investment", "wealth"],
      health: ["health", "fitness", "wellness", "nutrition", "workout"],
      lifestyle: ["lifestyle", "travel", "fashion", "beauty", "home"],
      content: ["content", "social media", "instagram", "blog", "writing"],
    }

    Object.entries(categories).forEach(([category, keywords]) => {
      if (keywords.some((keyword) => lowerText.includes(keyword))) {
        tags.push(category)
      }
    })

    return tags.length > 0 ? tags : ["general"]
  }

  const handleImportFreebies = async () => {
    if (detectedFreebies.length === 0) {
      toast.error("No freebies to import")
      return
    }

    // Validate freebies
    const validFreebies = detectedFreebies.filter((freebie) => {
      const hasTitle = freebie.title && freebie.title.trim().length > 0
      if (!hasTitle) {
        console.log("Invalid freebie (no title):", freebie)
      }
      return hasTitle
    })

    if (validFreebies.length === 0) {
      toast.error("Please ensure all freebies have valid titles")
      return
    }

    console.log("=== DM IMPORT: IMPORTING FREEBIES ===")
    console.log("Valid freebies count:", validFreebies.length)
    console.log("Valid freebies:", validFreebies)

    setImporting(true)
    try {
      const response = await freebiesAPI.bulkCreate(validFreebies)
      console.log("DM Import: Backend response:", response.data)

      if (response.data.success && response.data.total > 0) {
        toast.success(`Successfully imported ${response.data.total} freebies!`)
        setDmText("")
        setInstagramPost("")
        setDetectedFreebies([])
      } else {
        console.error("DM Import: No freebies were imported:", response.data)
        toast.error(`Failed to import freebies: ${response.data.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("DM Import: Import failed:", error)
      const errorMessage = error.response?.data?.message || error.message || "Unknown error"
      toast.error(`Failed to import freebies: ${errorMessage}`)
    } finally {
      setImporting(false)
    }
  }

  const removeFreebie = (index) => {
    setDetectedFreebies((prev) => prev.filter((_, i) => i !== index))
  }

  const updateFreebie = (index, field, value) => {
    setDetectedFreebies((prev) => prev.map((freebie, i) => (i === index ? { ...freebie, [field]: value } : freebie)))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Import from Instagram DMs (BETA)</h1>
        <p className="mt-2 text-gray-600">
          Paste your Instagram DM conversation to automatically detect and import freebies
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <InformationCircleIcon className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">How to use:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Copy the text from your Instagram DM conversation</li>
              <li>Paste it in the text area below</li>
              <li>Optionally add the Instagram post URL for reference</li>
              <li>Click "Detect Freebies" to analyze the content</li>
              <li>Review and edit the detected freebies before importing</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="dmText" className="block text-sm font-medium text-gray-700 mb-2">
              Instagram DM Text *
            </label>
            <textarea
              id="dmText"
              rows={8}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Paste your Instagram DM conversation here...

Example:
Hey! Thanks for commenting 😊
Here's your free social media template: https://drive.google.com/file/d/abc123
Also check out this free course: https://example.com/free-course
Let me know if you have any questions!"
              value={dmText}
              onChange={(e) => setDmText(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="instagramPost" className="block text-sm font-medium text-gray-700 mb-2">
              Instagram Post URL (Optional)
            </label>
            <input
              type="url"
              id="instagramPost"
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://instagram.com/p/..."
              value={instagramPost}
              onChange={(e) => setInstagramPost(e.target.value)}
            />
          </div>

          <button
            onClick={handleDetectFreebies}
            disabled={loading || !dmText.trim()}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Detect Freebies
              </>
            )}
          </button>
        </div>
      </div>

      {/* Detected Freebies */}
      {detectedFreebies.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Detected Freebies ({detectedFreebies.length})</h2>
            <button
              onClick={handleImportFreebies}
              disabled={importing}
              className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                  Import All
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            {detectedFreebies.map((freebie, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <button onClick={() => removeFreebie(index)} className="text-red-600 hover:text-red-800 text-sm">
                    Remove
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={freebie.title}
                      onChange={(e) => updateFreebie(index, "title", e.target.value)}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter a descriptive title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={freebie.description}
                      onChange={(e) => updateFreebie(index, "description", e.target.value)}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                    <input
                      type="url"
                      value={freebie.url}
                      onChange={(e) => updateFreebie(index, "url", e.target.value)}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                      <input
                        type="text"
                        value={freebie.tags?.join(", ") || ""}
                        onChange={(e) =>
                          updateFreebie(
                            index,
                            "tags",
                            e.target.value.split(",").map((t) => t.trim()),
                          )
                        }
                        placeholder="business, design, productivity"
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                      <input
                        type="text"
                        value={freebie.source}
                        onChange={(e) => updateFreebie(index, "source", e.target.value)}
                        placeholder="@username"
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-yellow-700">
            <p className="font-medium mb-1">💡 Tips for better detection:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Include messages that mention "free", "download", "template", "guide", etc.</li>
              <li>Make sure URLs are included in the conversation</li>
              <li>Copy the entire conversation for better context</li>
              <li>You can always edit the detected freebies before importing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DMImport

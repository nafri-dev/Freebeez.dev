/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { freebiesAPI } from "../services/api"
import {
  PlusIcon,
  LinkIcon,
  TagIcon,
  CalendarIcon,
  SparklesIcon,
  XMarkIcon,
  ArrowLeftIcon,
  DocumentIcon,
  ClockIcon,
  FireIcon,
  StarIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline"
import toast from "react-hot-toast"

const AddFreebie = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    instagramPost: "",
    source: "",
    tags: [],
    status: "new",
    priority: "medium",
    fileType: "other",
    estimatedReadTime: "",
    notes: "",
  })
  const [customTag, setCustomTag] = useState("")
  const [reminderDate, setReminderDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [availableTags, setAvailableTags] = useState([])
  const navigate = useNavigate()

  const popularTags = [
    "react",
    "javascript",
    "ai",
    "design",
    "marketing",
    "productivity",
    "business",
    "finance",
    "health",
    "photography",
    "writing",
    "coding",
    "social-media",
    "instagram",
    "figma",
    "canva",
    "notion",
  ]

  const fileTypeIcons = {
    pdf: <DocumentIcon className="w-5 h-5" />,
    video: <FireIcon className="w-5 h-5" />,
    course: <BookOpenIcon className="w-5 h-5" />,
    template: <StarIcon className="w-5 h-5" />,
    ebook: <BookOpenIcon className="w-5 h-5" />,
    tool: <SparklesIcon className="w-5 h-5" />,
    other: <DocumentIcon className="w-5 h-5" />,
  }

  const priorityColors = {
    low: "from-gray-500 to-gray-600",
    medium: "from-blue-500 to-blue-600",
    high: "from-red-500 to-red-600",
  }

  const statusColors = {
    new: "from-blue-500 to-blue-600",
    opened: "from-amber-500 to-orange-500",
    completed: "from-emerald-500 to-green-600",
  }

  useEffect(() => {
    fetchAvailableTags()
  }, [])

  const fetchAvailableTags = async () => {
    try {
      const response = await freebiesAPI.getTags()
      setAvailableTags(response.data)
    } catch (error) {
      console.error("Failed to fetch tags:", error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const addTag = (tag) => {
    if (!formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }))
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const addCustomTag = () => {
    if (customTag.trim() && !formData.tags.includes(customTag.trim().toLowerCase())) {
      addTag(customTag.trim().toLowerCase())
      setCustomTag("")
    }
  }

  const handleAiCategorize = async () => {
    if (!formData.title && !formData.description && !formData.url) {
      toast.error("Please fill in at least the title, description, or URL first")
      return
    }

    setAiLoading(true)
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`${API_BASE_URL}/api/ai/categorize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          url: formData.url,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const suggestedTags = data.tags || []

      const newTags = suggestedTags.filter((tag) => !formData.tags.includes(tag))
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, ...newTags],
      }))

      if (newTags.length > 0) {
        toast.success(`Added ${newTags.length} AI-suggested tags: ${newTags.join(", ")}`)
      } else {
        toast.info("No new tags to suggest")
      }
    } catch (error) {
      console.error("AI categorization failed:", error)

      if (error.message.includes("404")) {
        toast.error("AI service not available. Please check your server configuration.")
      } else if (error.message.includes("401") || error.message.includes("authentication")) {
        toast.error("Authentication failed. Please log in again.")
      } else {
        toast.error(`AI suggestions failed: ${error.message}`)
      }

      const fallbackTags = getFallbackTags(formData.title, formData.description, formData.url)
      if (fallbackTags.length > 0) {
        const newTags = fallbackTags.filter((tag) => !formData.tags.includes(tag))
        if (newTags.length > 0) {
          setFormData((prev) => ({
            ...prev,
            tags: [...prev.tags, ...newTags],
          }))
          toast.success(`Added ${newTags.length} suggested tags: ${newTags.join(", ")}`)
        }
      }
    } finally {
      setAiLoading(false)
    }
  }

  const getFallbackTags = (title, description, url) => {
    const text = `${title || ""} ${description || ""} ${url || ""}`.toLowerCase()
    const tags = []

    const categoryMap = {
      react: ["react", "jsx", "component", "hooks"],
      javascript: ["javascript", "js", "node", "typescript"],
      design: ["design", "ui", "ux", "figma", "canva"],
      marketing: ["marketing", "social", "instagram", "facebook"],
      business: ["business", "entrepreneur", "startup"],
      productivity: ["productivity", "notion", "template"],
      ai: ["ai", "artificial intelligence", "chatgpt"],
      photography: ["photo", "camera", "lightroom"],
      writing: ["writing", "blog", "content"],
      finance: ["finance", "money", "budget"],
    }

    Object.entries(categoryMap).forEach(([category, keywords]) => {
      if (keywords.some((keyword) => text.includes(keyword))) {
        tags.push(category)
      }
    })

    return tags.slice(0, 3)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.url.trim()) {
      toast.error("Title and URL are required")
      return
    }

    setLoading(true)
    try {
      const freebieData = {
        ...formData,
        estimatedReadTime: formData.estimatedReadTime ? Number.parseInt(formData.estimatedReadTime) : undefined,
        reminder: reminderDate
          ? {
              date: new Date(reminderDate),
              type: "email",
              message: `Don't forget to check out: ${formData.title}`,
            }
          : undefined,
      }

      console.log("Submitting freebie data:", freebieData)
      await freebiesAPI.create(freebieData)
      toast.success("Freebie added successfully!")
      navigate("/dashboard")
    } catch (error) {
      console.error("Failed to create freebie:", error)
      toast.error("Failed to add freebie")
    } finally {
      setLoading(false)
    }
  }

  const getTagStyle = (tag, index) => {
    const colors = [
      "bg-gradient-to-r from-purple-500 to-pink-500",
      "bg-gradient-to-r from-blue-500 to-cyan-500",
      "bg-gradient-to-r from-emerald-500 to-teal-500",
      "bg-gradient-to-r from-orange-500 to-red-500",
      "bg-gradient-to-r from-indigo-500 to-purple-500",
      "bg-gradient-to-r from-pink-500 to-rose-500",
      "bg-gradient-to-r from-yellow-500 to-orange-500",
      "bg-gradient-to-r from-green-500 to-emerald-500",
    ]

    const colorIndex = tag.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[colorIndex]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Add New Freebie
            </h1>
            <p className="mt-2 text-gray-600 text-lg">
              Add a new Instagram freebie to your vault and keep it organized
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <PlusIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                <p className="text-gray-600">Essential details about your freebie</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-lg"
                  placeholder="e.g., Complete React Hooks Guide"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                  placeholder="Brief description of what this freebie contains..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-2">
                    Resource URL *
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="url"
                      name="url"
                      type="url"
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      placeholder="https://example.com/resource.pdf"
                      value={formData.url}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="instagramPost" className="block text-sm font-semibold text-gray-700 mb-2">
                    Instagram Post URL
                  </label>
                  <input
                    id="instagramPost"
                    name="instagramPost"
                    type="url"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    placeholder="https://instagram.com/p/abc123"
                    value={formData.instagramPost}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="source" className="block text-sm font-semibold text-gray-700 mb-2">
                    Source Account
                  </label>
                  <input
                    id="source"
                    name="source"
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    placeholder="@username"
                    value={formData.source}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="fileType" className="block text-sm font-semibold text-gray-700 mb-2">
                    File Type
                  </label>
                  <div className="relative">
                    <select
                      id="fileType"
                      name="fileType"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 appearance-none"
                      value={formData.fileType}
                      onChange={handleChange}
                    >
                      <option value="other">Other</option>
                      <option value="pdf">PDF</option>
                      <option value="video">Video</option>
                      <option value="course">Course</option>
                      <option value="template">Template</option>
                      <option value="ebook">E-book</option>
                      <option value="tool">Tool</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      {fileTypeIcons[formData.fileType]}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tags & Categories */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <TagIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Tags & Categories</h2>
                  <p className="text-gray-600">Organize your freebie with relevant tags</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAiCategorize}
                disabled={aiLoading}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Getting suggestions...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    AI Suggest
                  </>
                )}
              </button>
            </div>

            {/* Selected Tags */}
            {formData.tags.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Selected Tags:</p>
                <div className="flex flex-wrap gap-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white ${getTagStyle(tag, index)} shadow-lg group hover:scale-105 transition-all duration-200`}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Tags */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Popular Tags:</p>
              <div className="flex flex-wrap gap-2">
                {popularTags
                  .filter((tag) => !formData.tags.includes(tag))
                  .map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 hover:scale-105"
                    >
                      + {tag}
                    </button>
                  ))}
              </div>
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Add custom tag..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Additional Settings</h2>
                <p className="text-gray-600">Configure priority, status, and reminders</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <div className="relative">
                  <select
                    id="status"
                    name="status"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 appearance-none"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="new">New</option>
                    <option value="opened">Opened</option>
                    <option value="completed">Completed</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${statusColors[formData.status]}`}></div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority
                </label>
                <div className="relative">
                  <select
                    id="priority"
                    name="priority"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 appearance-none"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${priorityColors[formData.priority]}`}></div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="estimatedReadTime" className="block text-sm font-semibold text-gray-700 mb-2">
                  Estimated Read Time (minutes)
                </label>
                <div className="relative">
                  <ClockIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="estimatedReadTime"
                    name="estimatedReadTime"
                    type="number"
                    min="0"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    placeholder="30"
                    value={formData.estimatedReadTime}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label htmlFor="reminderDate" className="block text-sm font-semibold text-gray-700 mb-2">
                  Reminder Date & Time (Coming Soon...)
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="reminderDate"
                    name="reminderDate"
                    type="datetime-local"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                {reminderDate && (
                  <p className="text-sm text-blue-600 mt-2">
                    📧 Email reminder will be sent on {new Date(reminderDate).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                  placeholder="Any additional notes about this freebie..."
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Adding...
                </>
              ) : (
                <>
                  <PlusIcon className="w-6 h-6 mr-3" />
                  Add Freebie
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddFreebie

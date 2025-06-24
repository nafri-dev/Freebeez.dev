"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { freebiesAPI, aiAPI } from "../services/api"
import { PlusIcon, LinkIcon, TagIcon, CalendarIcon, SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline"
import LoadingSpinner from "../components/LoadingSpinner"
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
      const response = await aiAPI.categorize(formData.title, formData.description, formData.url)
      const suggestedTags = response.data.tags

      // Add suggested tags that aren't already selected
      const newTags = suggestedTags.filter((tag) => !formData.tags.includes(tag))
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, ...newTags],
      }))

      toast.success(`Added ${newTags.length} AI-suggested tags!`)
    } catch (error) {
      console.error("AI categorization failed:", error)
      toast.error("Failed to get AI suggestions")
    } finally {
      setAiLoading(false)
    }
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
        reminder: reminderDate ? { date: new Date(reminderDate) } : undefined,
      }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Freebie</h1>
        <p className="mt-2 text-gray-600">Add a new Instagram freebie to your vault and keep it organized</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <PlusIcon className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className="input"
                placeholder="e.g., Complete React Hooks Guide"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="input"
                placeholder="Brief description of what this freebie contains..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Resource URL *
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="url"
                  name="url"
                  type="url"
                  required
                  className="input pl-10"
                  placeholder="https://example.com/resource.pdf"
                  value={formData.url}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="instagramPost" className="block text-sm font-medium text-gray-700 mb-2">
                Instagram Post URL
              </label>
              <input
                id="instagramPost"
                name="instagramPost"
                type="url"
                className="input"
                placeholder="https://instagram.com/p/abc123"
                value={formData.instagramPost}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
                Source Account
              </label>
              <input
                id="source"
                name="source"
                type="text"
                className="input"
                placeholder="@username"
                value={formData.source}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="fileType" className="block text-sm font-medium text-gray-700 mb-2">
                File Type
              </label>
              <select id="fileType" name="fileType" className="input" value={formData.fileType} onChange={handleChange}>
                <option value="other">Other</option>
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
                <option value="course">Course</option>
                <option value="template">Template</option>
                <option value="ebook">E-book</option>
                <option value="tool">Tool</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TagIcon className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold">Tags & Categories</h2>
            </div>
            <button
              type="button"
              onClick={handleAiCategorize}
              disabled={aiLoading}
              className="btn-secondary flex items-center text-sm"
            >
              {aiLoading ? <LoadingSpinner size="small" text="" /> : <SparklesIcon className="w-4 h-4 mr-1" />}
              {aiLoading ? "Getting suggestions..." : "AI Suggest"}
            </button>
          </div>

          {/* Selected Tags */}
          {formData.tags.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Selected Tags:</p>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span key={tag} className="badge-tag flex items-center gap-1">
                    {tag}
                    <XMarkIcon className="w-3 h-3 cursor-pointer hover:text-red-600" onClick={() => removeTag(tag)} />
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Popular Tags */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Popular Tags:</p>
            <div className="flex flex-wrap gap-2">
              {popularTags
                .filter((tag) => !formData.tags.includes(tag))
                .map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="badge-tag hover:bg-primary-100 hover:text-primary-700 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
            </div>
          </div>

          {/* Custom Tag Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add custom tag..."
              className="input flex-1"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
            />
            <button type="button" onClick={addCustomTag} className="btn-secondary">
              Add Tag
            </button>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <CalendarIcon className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold">Additional Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select id="status" name="status" className="input" value={formData.status} onChange={handleChange}>
                <option value="new">New</option>
                <option value="opened">Opened</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select id="priority" name="priority" className="input" value={formData.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label htmlFor="estimatedReadTime" className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Read Time (minutes)
              </label>
              <input
                id="estimatedReadTime"
                name="estimatedReadTime"
                type="number"
                min="0"
                className="input"
                placeholder="30"
                value={formData.estimatedReadTime}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label htmlFor="reminderDate" className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Date
              </label>
              <input
                id="reminderDate"
                name="reminderDate"
                type="datetime-local"
                className="input"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="input"
                placeholder="Any additional notes about this freebie..."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn-primary flex items-center">
            {loading ? <LoadingSpinner size="small" text="" /> : <PlusIcon className="w-5 h-5 mr-2" />}
            {loading ? "Adding..." : "Add Freebie"}
          </button>
          <button type="button" onClick={() => navigate("/dashboard")} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddFreebie

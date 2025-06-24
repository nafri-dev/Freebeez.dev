"use client"

import { useState } from "react"
import { aiAPI, freebiesAPI } from "../services/api"
import { DocumentTextIcon, SparklesIcon, PlusIcon } from "@heroicons/react/24/outline"
import LoadingSpinner from "../components/LoadingSpinner"
import toast from "react-hot-toast"

const DMImport = () => {
  const [dmText, setDmText] = useState("")
  const [instagramPost, setInstagramPost] = useState("")
  const [loading, setLoading] = useState(false)
  const [detectedFreebies, setDetectedFreebies] = useState([])
  const [saving, setSaving] = useState(false)

  const handleDetectFreebies = async () => {
    if (!dmText.trim()) {
      toast.error("Please paste your DM conversation")
      return
    }

    setLoading(true)
    try {
      const response = await aiAPI.detectFreebies(dmText, instagramPost)
      setDetectedFreebies(response.data.freebies)

      if (response.data.freebies.length === 0) {
        toast.info("No freebies detected in this conversation")
      } else {
        toast.success(`Detected ${response.data.freebies.length} freebies!`)
      }
    } catch (error) {
      console.error("Detection failed:", error)
      toast.error("Failed to detect freebies")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAll = async () => {
    if (detectedFreebies.length === 0) return

    setSaving(true)
    try {
      await freebiesAPI.bulkCreate(detectedFreebies)
      toast.success(`Saved ${detectedFreebies.length} freebies to your vault!`)
      setDetectedFreebies([])
      setDmText("")
      setInstagramPost("")
    } catch (error) {
      console.error("Save failed:", error)
      toast.error("Failed to save freebies")
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveFreebie = (index) => {
    setDetectedFreebies(detectedFreebies.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Smart DM Import</h1>
        <p className="mt-2 text-gray-600">
          Paste your Instagram DM conversations and let AI automatically detect and extract freebies for you.
        </p>
      </div>

      {/* Import Form */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <DocumentTextIcon className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-semibold">Import from DMs</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="instagram-post" className="block text-sm font-medium text-gray-700 mb-2">
              Instagram Post URL (Optional)
            </label>
            <input
              id="instagram-post"
              type="url"
              className="input"
              placeholder="https://instagram.com/p/abc123..."
              value={instagramPost}
              onChange={(e) => setInstagramPost(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="dm-text" className="block text-sm font-medium text-gray-700 mb-2">
              DM Conversation Text *
            </label>
            <textarea
              id="dm-text"
              rows={8}
              className="input"
              placeholder="Paste your Instagram DM conversation here...

Example:
Hey! Thanks for commenting 😊
Here's your free social media template: https://drive.google.com/file/d/abc123
Also check out this free course: https://example.com/free-course
Let me know if you have any questions!"
              value={dmText}
              onChange={(e) => setDmText(e.target.value)}
            />
            <p className="mt-1 text-sm text-gray-500">
              Copy and paste the entire DM conversation where freebies were shared
            </p>
          </div>

          <button
            onClick={handleDetectFreebies}
            disabled={loading || !dmText.trim()}
            className="btn-primary flex items-center"
          >
            {loading ? <LoadingSpinner size="small" text="" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
            {loading ? "Detecting..." : "Detect Freebies with AI"}
          </button>
        </div>
      </div>

      {/* Detected Freebies */}
      {detectedFreebies.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Detected Freebies ({detectedFreebies.length})</h2>
            <button onClick={handleSaveAll} disabled={saving} className="btn-primary flex items-center">
              {saving ? <LoadingSpinner size="small" text="" /> : <PlusIcon className="w-5 h-5 mr-2" />}
              {saving ? "Saving..." : "Save All to Vault"}
            </button>
          </div>

          <div className="space-y-4">
            {detectedFreebies.map((freebie, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{freebie.title}</h3>
                    {freebie.description && <p className="text-gray-600 mb-3">{freebie.description}</p>}

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="capitalize">Type: {freebie.fileType}</span>
                      {freebie.estimatedReadTime && (
                        <>
                          <span>•</span>
                          <span>{freebie.estimatedReadTime} min read</span>
                        </>
                      )}
                    </div>

                    {freebie.url && (
                      <a
                        href={freebie.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                      >
                        View Resource →
                      </a>
                    )}

                    {freebie.tags && freebie.tags.length > 0 && (
                      <div className="flex gap-1 mt-3">
                        {freebie.tags.map((tag) => (
                          <span key={tag} className="badge-tag text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button onClick={() => handleRemoveFreebie(index)} className="text-gray-400 hover:text-red-600 ml-4">
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How it Works */}
      <div className="card p-6 bg-gradient-to-r from-primary-50 to-secondary-50">
        <h2 className="text-xl font-semibold mb-4">How Smart DM Import Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="font-medium mb-2">1. Copy DM Text</h3>
            <p className="text-sm text-gray-600">Copy the conversation from Instagram where freebies were shared</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="font-medium mb-2">2. AI Detection</h3>
            <p className="text-sm text-gray-600">Our AI analyzes the text and automatically detects freebies</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">💾</span>
            </div>
            <h3 className="font-medium mb-2">3. Save to Vault</h3>
            <p className="text-sm text-gray-600">Review and save detected freebies to your organized vault</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="card p-6 border-l-4 border-yellow-400 bg-yellow-50">
        <h3 className="font-semibold text-yellow-800 mb-2">💡 Pro Tips</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Include the entire conversation for better detection accuracy</li>
          <li>• Make sure to copy any links or file names mentioned</li>
          <li>• The AI can detect PDFs, courses, templates, and other digital resources</li>
          <li>• You can edit the detected freebies before saving them</li>
        </ul>
      </div>
    </div>
  )
}

export default DMImport

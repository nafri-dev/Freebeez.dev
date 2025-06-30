/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import Tesseract from "tesseract.js"
import { freebiesAPI } from "../services/api"
import {
  CameraIcon,
  DocumentTextIcon,
  SparklesIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline"
import LoadingSpinner from "../components/LoadingSpinner"
import toast from "react-hot-toast"

const OCRUpload = () => {
  const [uploadedImage, setUploadedImage] = useState(null)
  const [extractedText, setExtractedText] = useState("")
  const [ocrProgress, setOcrProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [detectedFreebies, setDetectedFreebies] = useState([])
  const [saving, setSaving] = useState(false)

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setUploadedImage({
          file,
          preview: reader.result,
        })
        processImage(file)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".bmp", ".webp"],
    },
    multiple: false,
  })

  const processImage = async (file) => {
    setIsProcessing(true)
    setOcrProgress(0)
    setExtractedText("")
    setDetectedFreebies([])

    try {
      const result = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round(m.progress * 100))
          }
        },
      })

      const text = result.data.text
      setExtractedText(text)

      if (text.trim()) {
        await detectFreebiesFromText(text)
      } else {
        toast.error("No text detected in the image")
      }
    } catch (error) {
      console.error("OCR processing failed:", error)
      toast.error("Failed to process image")
    } finally {
      setIsProcessing(false)
      setOcrProgress(0)
    }
  }

  const detectFreebiesFromText = async (text) => {
    try {
      const freebies = []

      // More strict detection to avoid false positives
      const urlRegex = /https?:\/\/[^\s]+/g
      const urls = text.match(urlRegex) || []

      // Strong freebie indicators
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
      ]

      // Split text into meaningful chunks (sentences/paragraphs)
      const chunks = text
        .split(/[.!?\n]+/)
        .map((chunk) => chunk.trim())
        .filter((chunk) => chunk.length > 20) // Only consider substantial chunks


      // Only process chunks that have strong freebie indicators AND URLs
      chunks.forEach((chunk, index) => {
        const lowerChunk = chunk.toLowerCase()

        // Check for strong freebie keywords
        const hasStrongKeyword = strongFreebieKeywords.some((keyword) => lowerChunk.includes(keyword))

        // Check if this chunk contains a URL
        const chunkUrls = chunk.match(urlRegex) || []

        // Only create freebie if it has both strong keywords AND a URL
        if (hasStrongKeyword && chunkUrls.length > 0) {
          const title = extractTitleFromChunk(chunk)

          freebies.push({
            title: title || `Free Resource ${freebies.length + 1}`,
            description: chunk.substring(0, 150) + (chunk.length > 150 ? "..." : ""),
            url: chunkUrls[0],
            tags: ["screenshot", "ocr"],
            source: "Instagram",
            extractedFrom: "ocr_upload",
            status: "new",
            dateAdded: new Date().toISOString(),
          })
        }
      })

      // If no freebies found but URLs exist, be more selective
      if (freebies.length === 0 && urls.length > 0) {
        // Only create generic freebies if there are clear freebie indicators in the text
        const hasAnyFreebieKeyword = strongFreebieKeywords.some((keyword) => text.toLowerCase().includes(keyword))

        if (hasAnyFreebieKeyword) {
          urls.slice(0, 2).forEach((url, index) => {
            // Limit to 2 URLs max
            freebies.push({
              title: `Free Resource ${index + 1}`,
              description: `Resource found in screenshot`,
              url: url,
              tags: ["screenshot", "ocr", "manual-review-needed"],
              source: "Instagram",
              extractedFrom: "ocr_upload",
              status: "new",
              dateAdded: new Date().toISOString(),
            })
          })
        }
      }

   
      setDetectedFreebies(freebies)

      if (freebies.length === 0) {
        toast("No clear freebies detected. You can add them manually below.", {
          icon: "ℹ️",
        })
      } else {
        toast.success(`Detected ${freebies.length} freebie${freebies.length > 1 ? "s" : ""}!`)
      }
    } catch (error) {
      console.error("Freebie detection failed:", error)
      toast.error("Failed to detect freebies")
    }
  }

  const extractTitleFromChunk = (chunk) => {
    // Look for patterns like "free [something]" or "download [something]"
    const patterns = [
      /(?:free|download|get your|here's your|grab your)\s+([^.!?\n]{5,40})/i,
      /([^.!?\n]{5,40})\s+(?:template|guide|ebook|pdf|course|checklist|worksheet|planner)/i,
    ]

    for (const pattern of patterns) {
      const match = chunk.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }

    // Fallback: use first meaningful part of chunk
    const words = chunk.split(/\s+/).slice(0, 8).join(" ")
    return words.length > 50 ? words.substring(0, 50) + "..." : words
  }

  const handleEditFreebie = (index, field, value) => {
    const updatedFreebies = [...detectedFreebies]
    updatedFreebies[index][field] = value
    setDetectedFreebies(updatedFreebies)
  }

  const handleRemoveFreebie = (index) => {
    setDetectedFreebies(detectedFreebies.filter((_, i) => i !== index))
  }

  const handleSaveAll = async () => {
    if (detectedFreebies.length === 0) {
      toast.error("No freebies to save")
      return
    }

    // Validate freebies before sending
    const validFreebies = detectedFreebies.filter((freebie) => {
      const hasTitle = freebie.title && freebie.title.trim().length > 0
    
      return hasTitle
    })

    if (validFreebies.length === 0) {
      toast.error("Please ensure all freebies have valid titles")
      return
    }


    setSaving(true)
    try {
      const response = await freebiesAPI.bulkCreate(validFreebies)
    

      if (response.data.success && response.data.total > 0) {
        toast.success(`Successfully saved ${response.data.total} freebies to your vault!`)
        // Reset form
        setUploadedImage(null)
        setExtractedText("")
        setDetectedFreebies([])
      } else {
        console.error("OCR Upload: No freebies were created:", response.data)
        toast.error(`Failed to save freebies: ${response.data.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("OCR Upload: Save failed:", error)
      const errorMessage = error.response?.data?.message || error.message || "Unknown error"
      toast.error(`Failed to save freebies: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  const handleAddManualFreebie = () => {
    const newFreebie = {
      title: "",
      description: "",
      url: "",
      tags: ["screenshot", "manual"],
      source: "Instagram",
      extractedFrom: "ocr_upload",
      status: "new",
      dateAdded: new Date().toISOString(),
    }
    setDetectedFreebies([...detectedFreebies, newFreebie])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">OCR Upload (BETA)</h1>
        <p className="mt-2 text-gray-600">
          Upload screenshots of Instagram DMs and automatically extract freebie information using OCR technology.
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <CameraIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Upload Screenshot</h2>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input {...getInputProps()} />
          <CameraIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-lg text-blue-600">Drop the screenshot here...</p>
          ) : (
            <div>
              <p className="text-lg text-gray-600 mb-2">Drag & drop a screenshot here, or click to select</p>
              <p className="text-sm text-gray-500">Supports: JPG, PNG, GIF, BMP, WebP</p>
            </div>
          )}
        </div>

        {uploadedImage && (
          <div className="mt-4">
            <img
              src={uploadedImage.preview || "/placeholder.svg"}
              alt="Uploaded screenshot"
              className="max-w-full h-auto max-h-64 mx-auto rounded-lg shadow-md"
            />
          </div>
        )}
      </div>

      {/* OCR Processing */}
      {isProcessing && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Processing Image</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Extracting text...</span>
                <span>{ocrProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
            </div>
            <LoadingSpinner text="Analyzing image content..." />
          </div>
        </div>
      )}

      {/* Extracted Text */}
      {extractedText && !isProcessing && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <DocumentTextIcon className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">Extracted Text</h2>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">{extractedText}</pre>
          </div>
        </div>
      )}

      {/* Detected Freebies */}
      {detectedFreebies.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Detected Freebies ({detectedFreebies.length})</h2>
            <div className="flex gap-2">
              <button
                onClick={handleAddManualFreebie}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Manual
              </button>
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? <LoadingSpinner size="small" text="" /> : <CheckCircleIcon className="w-4 h-4 mr-2" />}
                {saving ? "Saving..." : "Save All to Vault"}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {detectedFreebies.map((freebie, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                      <input
                        type="text"
                        value={freebie.title}
                        onChange={(e) => handleEditFreebie(index, "title", e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter a descriptive title"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={freebie.description}
                        onChange={(e) => handleEditFreebie(index, "description", e.target.value)}
                        rows={2}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Describe this freebie"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Resource URL</label>
                        <input
                          type="url"
                          value={freebie.url}
                          onChange={(e) => handleEditFreebie(index, "url", e.target.value)}
                          placeholder="https://..."
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                        <input
                          type="text"
                          value={freebie.source}
                          onChange={(e) => handleEditFreebie(index, "source", e.target.value)}
                          placeholder="@username or source"
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    {freebie.tags && freebie.tags.length > 0 && (
                      <div className="flex gap-1">
                        {freebie.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button onClick={() => handleRemoveFreebie(index)} className="ml-4 text-gray-400 hover:text-red-600">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">💡 Pro Tips for Better Detection</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Take clear, high-contrast screenshots with readable text</li>
          <li>• Ensure freebie offers include clear keywords like "free download", "free template", etc.</li>
          <li>• Screenshots with URLs and freebie keywords work best</li>
          <li>• You can always edit or add freebies manually before saving</li>
          <li>• If detection seems off, try uploading a clearer image</li>
        </ul>
      </div>
    </div>
  )
}

export default OCRUpload

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  TrashIcon,
  ClockIcon,
  TagIcon,
  LinkIcon,
  CalendarIcon,
  ChevronDownIcon,
  SparklesIcon,
  FireIcon,
  StarIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from "@heroicons/react/24/outline"
import { Link } from "react-router-dom"
import LoadingSpinner from "../components/LoadingSpinner"
import toast from "react-hot-toast"
import { freebiesAPI } from "../services/api"
import { useAuth } from "../contexts/AuthContext"

// Custom hook for debouncing
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const Dashboard = () => {
  const [freebies, setFreebies] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, new: 0, opened: 0, completed: 0 })
  const [openDropdowns, setOpenDropdowns] = useState({})
  const [viewMode, setViewMode] = useState("grid") // grid or list

  // Separate immediate inputs from debounced values
  const [searchInput, setSearchInput] = useState("")
  const [tagsInput, setTagsInput] = useState("")
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    tags: "",
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { user } = useAuth()

  // Debounce both search and tags with 500ms delay
  const debouncedSearch = useDebounce(searchInput, 500)
  const debouncedTags = useDebounce(tagsInput, 500)

  // Update filters when debounced values change
  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch }))
  }, [debouncedSearch])

  useEffect(() => {
    setFilters((prev) => ({ ...prev, tags: debouncedTags }))
  }, [debouncedTags])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // Fetch data when filters or page changes
  useEffect(() => {
    fetchFreebies()
  }, [filters, currentPage])

  // Fetch stats on mount only
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchFreebies = async () => {
    try {
      setLoading(true)
      const params = {
        ...filters,
        page: currentPage,
        limit: 12, // Increased for better grid layout
      }

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (!params[key] || params[key] === "all") {
          delete params[key]
        }
      })

      console.log("Dashboard: Fetching freebies with params:", params)
      const response = await freebiesAPI.getAll(params)
      console.log("Dashboard API response:", response.data)

      if (response.data.success) {
        setFreebies(response.data.freebies || [])
        setTotalPages(response.data.totalPages || 1)
      } else {
        console.error("Failed to fetch freebies:", response.data)
        toast.error("Failed to load freebies")
      }
    } catch (error) {
      console.error("Error fetching freebies:", error)
      toast.error("Failed to load freebies")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await freebiesAPI.getStats()
      if (response.data.success) {
        setStats(response.data.stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleStatusChange = async (freebieId, newStatus) => {
    try {
      await freebiesAPI.update(freebieId, { status: newStatus })
      toast.success("Status updated successfully")
      fetchFreebies()
      fetchStats()
      setOpenDropdowns((prev) => ({ ...prev, [freebieId]: false }))
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status")
    }
  }

  const handleDelete = async (freebieId) => {
    if (window.confirm("Are you sure you want to delete this freebie?")) {
      try {
        await freebiesAPI.delete(freebieId)
        toast.success("Freebie deleted successfully")
        fetchFreebies()
        fetchStats()
      } catch (error) {
        console.error("Error deleting freebie:", error)
        toast.error("Failed to delete freebie")
      }
    }
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case "new":
        return {
          color: "bg-gradient-to-r from-blue-500 to-blue-600",
          bgColor: "bg-blue-50",
          textColor: "text-blue-700",
          icon: <ClockIcon className="w-4 h-4" />,
          label: "New",
          nextStatus: "opened",
          nextLabel: "Start Working",
          nextIcon: <EyeIcon className="w-4 h-4" />,
        }
      case "opened":
        return {
          color: "bg-gradient-to-r from-amber-500 to-orange-500",
          bgColor: "bg-amber-50",
          textColor: "text-amber-700",
          icon: <EyeIcon className="w-4 h-4" />,
          label: "In Progress",
          nextStatus: "completed",
          nextLabel: "Mark Complete",
          nextIcon: <CheckIcon className="w-4 h-4" />,
        }
      case "completed":
        return {
          color: "bg-gradient-to-r from-emerald-500 to-green-600",
          bgColor: "bg-emerald-50",
          textColor: "text-emerald-700",
          icon: <CheckIcon className="w-4 h-4" />,
          label: "Completed",
          nextStatus: "new",
          nextLabel: "Reset",
          nextIcon: <ClockIcon className="w-4 h-4" />,
        }
      default:
        return {
          color: "bg-gray-100",
          bgColor: "bg-gray-50",
          textColor: "text-gray-700",
          icon: <ClockIcon className="w-4 h-4" />,
          label: "Unknown",
        }
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

  const getTagIcon = (tag) => {
    const lowerTag = tag.toLowerCase()
    if (lowerTag.includes("design") || lowerTag.includes("ui") || lowerTag.includes("ux")) {
      return <SparklesIcon className="w-3 h-3" />
    }
    if (lowerTag.includes("code") || lowerTag.includes("programming") || lowerTag.includes("dev")) {
      return <FireIcon className="w-3 h-3" />
    }
    if (lowerTag.includes("premium") || lowerTag.includes("pro") || lowerTag.includes("exclusive")) {
      return <StarIcon className="w-3 h-3" />
    }
    return null
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const clearSearch = () => {
    setSearchInput("")
  }

  const clearTags = () => {
    setTagsInput("")
  }

  const toggleDropdown = (freebieId) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [freebieId]: !prev[freebieId],
    }))
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdowns({})
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  if (loading && freebies.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner text="Loading your freebies..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="mt-2 text-gray-600">Manage your freebie collection with ease</p>
          </div>
          <Link
            to="/add"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Freebie
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: "Total Freebies",
              value: stats.total,
              icon: <Squares2X2Icon className="w-6 h-6" />,
              gradient: "from-blue-500 to-blue-600",
              bgGradient: "from-blue-50 to-blue-100",
            },
            {
              label: "New",
              value: stats.new,
              icon: <ClockIcon className="w-6 h-6" />,
              gradient: "from-blue-500 to-cyan-500",
              bgGradient: "from-blue-50 to-cyan-50",
            },
            {
              label: "In Progress",
              value: stats.opened,
              icon: <EyeIcon className="w-6 h-6" />,
              gradient: "from-amber-500 to-orange-500",
              bgGradient: "from-amber-50 to-orange-50",
            },
            {
              label: "Completed",
              value: stats.completed,
              icon: <CheckIcon className="w-6 h-6" />,
              gradient: "from-emerald-500 to-green-600",
              bgGradient: "from-emerald-50 to-green-50",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.bgGradient} border border-white/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg`}
                >
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-6 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search freebies..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
                {searchInput && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                  >
                    ×
                  </button>
                )}
              </div>
              {loading && debouncedSearch !== searchInput && (
                <p className="text-xs text-blue-600 mt-2 flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                  Searching...
                </p>
              )}
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="opened">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Tags Filter */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
              <div className="relative">
                <TagIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by tags..."
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
                {tagsInput && (
                  <button
                    onClick={clearTags}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                  >
                    ×
                  </button>
                )}
              </div>
              {loading && debouncedTags !== tagsInput && (
                <p className="text-xs text-blue-600 mt-2 flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                  Filtering...
                </p>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="lg:w-32">
              <label className="block text-sm font-semibold text-gray-700 mb-2">View</label>
              <div className="flex bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex-1 flex items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                    viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex-1 flex items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                    viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <ListBulletIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Freebies Section */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Your Freebies</h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{freebies.length} items</span>
            </div>
          </div>

          {freebies.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No freebies found</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {filters.search || filters.status !== "all" || filters.tags
                  ? "Try adjusting your filters or search terms to find what you're looking for."
                  : "Get started by adding your first freebie to begin building your collection!"}
              </p>
              <Link
                to="/dashboard/add"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Your First Freebie
              </Link>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {freebies.map((freebie) => {
                    const statusConfig = getStatusConfig(freebie.status)
                    return (
                      <div
                        key={freebie._id}
                        className="bg-white border border-gray-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                              {freebie.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${statusConfig.color} shadow-lg`}
                              >
                                {statusConfig.icon}
                                <span className="ml-1">{statusConfig.label}</span>
                              </span>
                            </div>
                          </div>
                          <div className="relative ml-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleDropdown(freebie._id)
                              }}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                            >
                              <ChevronDownIcon className="w-5 h-5" />
                            </button>
                            {openDropdowns[freebie._id] && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-200 z-10">
                                <div className="py-2">
                                  <button
                                    onClick={() => handleStatusChange(freebie._id, statusConfig.nextStatus)}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center transition-colors duration-200"
                                  >
                                    {statusConfig.nextIcon}
                                    <span className="ml-3 font-medium">{statusConfig.nextLabel}</span>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(freebie._id)}
                                    className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center text-red-600 transition-colors duration-200"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                    <span className="ml-3 font-medium">Delete</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        {freebie.description && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                            {freebie.description}
                          </p>
                        )}

                        {/* Meta Info */}
                        <div className="space-y-2 mb-4">
                          {freebie.url && (
                            <div className="flex items-center text-sm text-gray-500">
                              <LinkIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                              <a
                                href={freebie.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 truncate font-medium hover:underline"
                              >
                                {freebie.url}
                              </a>
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-500">
                            <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>Added {formatDate(freebie.dateAdded)}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        {freebie.tags && freebie.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {freebie.tags.slice(0, 3).map((tag, index) => {
                              const tagIcon = getTagIcon(tag)
                              return (
                                <span
                                  key={tag}
                                  className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold text-white ${getTagStyle(tag, index)} shadow-sm`}
                                >
                                  {tagIcon && <span className="mr-1">{tagIcon}</span>}
                                  {tag}
                                </span>
                              )
                            })}
                            {freebie.tags.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium text-gray-500 bg-gray-100">
                                +{freebie.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="divide-y divide-gray-100">
                  {freebies.map((freebie) => {
                    const statusConfig = getStatusConfig(freebie.status)
                    return (
                      <div key={freebie._id} className="p-6 hover:bg-gray-50/50 transition-all duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-4 mb-3">
                              <h3 className="text-xl font-semibold text-gray-900 truncate">{freebie.title}</h3>
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${statusConfig.color} shadow-lg`}
                              >
                                {statusConfig.icon}
                                <span className="ml-2">{statusConfig.label}</span>
                              </span>
                            </div>

                            {freebie.description && (
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                                {freebie.description}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-4">
                              {freebie.url && (
                                <div className="flex items-center">
                                  <LinkIcon className="w-4 h-4 mr-2" />
                                  <a
                                    href={freebie.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 truncate max-w-xs font-medium hover:underline"
                                  >
                                    {freebie.url}
                                  </a>
                                </div>
                              )}
                              {freebie.source && (
                                <div className="flex items-center">
                                  <span className="font-medium text-gray-700">Source:</span>
                                  <span className="ml-2 text-gray-600">{freebie.source}</span>
                                </div>
                              )}
                              <div className="flex items-center">
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                <span>Added {formatDate(freebie.dateAdded)}</span>
                              </div>
                            </div>

                            {freebie.tags && freebie.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {freebie.tags.map((tag, index) => {
                                  const tagIcon = getTagIcon(tag)
                                  return (
                                    <span
                                      key={tag}
                                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${getTagStyle(tag, index)} shadow-sm`}
                                    >
                                      {tagIcon && <span className="mr-1.5">{tagIcon}</span>}
                                      {tag}
                                    </span>
                                  )
                                })}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3 ml-6">
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleDropdown(freebie._id)
                                }}
                                className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-xl transition-all duration-200 ${statusConfig.textColor} ${statusConfig.bgColor} border-gray-200 hover:bg-white`}
                              >
                                {statusConfig.nextIcon}
                                <span className="ml-2">{statusConfig.nextLabel}</span>
                                <ChevronDownIcon className="ml-2 w-4 h-4" />
                              </button>

                              {openDropdowns[freebie._id] && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-10">
                                  <div className="py-2">
                                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                      Change Status
                                    </div>
                                    <button
                                      onClick={() => handleStatusChange(freebie._id, statusConfig.nextStatus)}
                                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center transition-colors duration-200"
                                    >
                                      <div
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${statusConfig.bgColor} ${statusConfig.textColor}`}
                                      >
                                        {statusConfig.nextIcon}
                                      </div>
                                      <div>
                                        <div className="font-medium text-gray-900">{statusConfig.nextLabel}</div>
                                        <div className="text-xs text-gray-500">
                                          {statusConfig.nextStatus === "completed" && "Mark this freebie as done"}
                                          {statusConfig.nextStatus === "opened" && "Start working on this freebie"}
                                          {statusConfig.nextStatus === "new" && "Reset to beginning"}
                                        </div>
                                      </div>
                                    </button>
                                    <button
                                      onClick={() => handleDelete(freebie._id)}
                                      className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center text-red-600 transition-colors duration-200"
                                    >
                                      <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 bg-red-50">
                                        <TrashIcon className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <div className="font-medium">Delete Freebie</div>
                                        <div className="text-xs text-red-500">This action cannot be undone</div>
                                      </div>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50/50 px-6 py-4 flex items-center justify-between border-t border-gray-200/50">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
                    >
                      Next
                    </button>
                  </div>

                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700 font-medium">
                        Page <span className="font-bold">{currentPage}</span> of{" "}
                        <span className="font-bold">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-2xl shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-4 py-2 rounded-l-2xl border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-4 py-2 rounded-r-2xl border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

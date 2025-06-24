/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { freebiesAPI } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,

  CalendarIcon,
  TagIcon,
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline"
import LoadingSpinner from "../components/LoadingSpinner"
import toast from "react-hot-toast"

const Dashboard = () => {
  const [freebies, setFreebies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    opened: 0,
    completed: 0,
  })

  const { user } = useAuth()

  useEffect(() => {
    fetchFreebies()
  }, [statusFilter])

  const fetchFreebies = async () => {
    try {
      setLoading(true)
      const params = {}
      if (statusFilter !== "all") {
        params.status = statusFilter
      }
      if (searchTerm) {
        params.search = searchTerm
      }

      const response = await freebiesAPI.getAll(params)
      setFreebies(response.data.freebies)

      // Calculate stats
      const allFreebies = await freebiesAPI.getAll()
      const allData = allFreebies.data.freebies
      setStats({
        total: allData.length,
        new: allData.filter((f) => f.status === "new").length,
        opened: allData.filter((f) => f.status === "opened").length,
        completed: allData.filter((f) => f.status === "completed").length,
      })
    } catch (error) {
      console.error("Failed to fetch freebies:", error)
      toast.error("Failed to load freebies")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (freebieId, newStatus) => {
    try {
      await freebiesAPI.update(freebieId, { status: newStatus })
      toast.success("Status updated successfully")
      fetchFreebies()
    } catch (error) {
      console.error("Failed to update status:", error)
      toast.error("Failed to update status")
    }
  }

  const handleDelete = async (freebieId) => {
    if (window.confirm("Are you sure you want to delete this freebie?")) {
      try {
        await freebiesAPI.delete(freebieId)
        toast.success("Freebie deleted successfully")
        fetchFreebies()
      } catch (error) {
        console.error("Failed to delete freebie:", error)
        toast.error("Failed to delete freebie")
      }
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "new":
        return "badge-new"
      case "opened":
        return "badge-opened"
      case "completed":
        return "badge-completed"
      default:
        return "badge"
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return <LoadingSpinner text="Loading your freebies..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.name}! Manage your Instagram freebies and track your learning progress.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/add" className="btn-primary">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Freebie
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Freebies</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <BookOpenIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New</p>
              <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
            </div>
            <ClockIcon className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.opened}</p>
            </div>
            <BookOpenIcon className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search freebies..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && fetchFreebies()}
          />
        </div>
        <div className="flex gap-2">
          <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="opened">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <button onClick={fetchFreebies} className="btn-secondary">
            <FunnelIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Freebies List */}
      <div className="space-y-4">
        {freebies.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No freebies found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Start by adding your first Instagram freebie!"}
            </p>
            <Link to="/add" className="btn-primary">
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Your First Freebie
            </Link>
          </div>
        ) : (
          freebies.map((freebie) => (
            <div key={freebie._id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{freebie.title}</h3>
                    <span className={getStatusBadgeClass(freebie.status)}>{freebie.status}</span>
                  </div>

                  {freebie.description && <p className="text-gray-600 mb-3">{freebie.description}</p>}

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    {freebie.source && <span>From {freebie.source}</span>}
                    <span>•</span>
                    <span>Added {formatDate(freebie.dateAdded)}</span>
                    {freebie.reminder?.date && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          Reminder: {formatDate(freebie.reminder.date)}
                        </span>
                      </>
                    )}
                  </div>

                  {freebie.tags && freebie.tags.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <TagIcon className="w-4 h-4 text-gray-400" />
                      <div className="flex gap-1 flex-wrap">
                        {freebie.tags.map((tag) => (
                          <span key={tag} className="badge-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <a
                    href={freebie.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Open resource"
                  >
                    <BookOpenIcon className="w-5 h-5" />
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <select
                    value={freebie.status}
                    onChange={(e) => handleStatusChange(freebie._id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="new">New</option>
                    <option value="opened">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(freebie._id)}
                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Dashboard

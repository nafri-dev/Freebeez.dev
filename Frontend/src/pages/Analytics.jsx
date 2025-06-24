"use client"

import { useState, useEffect } from "react"
import { analyticsAPI } from "../services/api"
import {
  ChartBarIcon,
  ClockIcon,
  
  CalendarIcon,
  BookOpenIcon,
  CheckCircleIcon,
  BellIcon,
} from "@heroicons/react/24/outline"
import LoadingSpinner from "../components/LoadingSpinner"
import toast from "react-hot-toast"

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [timeTracking, setTimeTracking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeFrame, setTimeFrame] = useState("week")

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const [analyticsResponse, timeResponse] = await Promise.all([
        analyticsAPI.getDashboard(),
        analyticsAPI.getTimeTracking(),
      ])

      setAnalytics(analyticsResponse.data)
      setTimeTracking(timeResponse.data)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
      toast.error("Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getCompletionRateColor = (rate) => {
    if (rate >= 70) return "text-green-600"
    if (rate >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading) {
    return <LoadingSpinner text="Loading analytics..." />
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
        <p className="text-gray-600">Start adding freebies to see your analytics!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-gray-600">Track your learning progress and freebie usage patterns</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select value={timeFrame} onChange={(e) => setTimeFrame(e.target.value)} className="input">
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Freebies</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.basicStats.total}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <BookOpenIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-3xl font-bold text-blue-600">{analytics.weeklyStats.collected}</p>
              <p className="text-xs text-green-600 mt-1">+{analytics.weeklyStats.completed} completed</p>
            </div>
            <CalendarIcon className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className={`text-3xl font-bold ${getCompletionRateColor(analytics.basicStats.completionRate)}`}>
                {analytics.basicStats.completionRate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.basicStats.completed} of {analytics.basicStats.total}
              </p>
            </div>
            <CalendarIcon className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Time Saved</p>
              <p className="text-3xl font-bold text-purple-600">
                {timeTracking ? formatTime(timeTracking.completedTime) : "0m"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Learning time</p>
            </div>
            <ClockIcon className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <ChartBarIcon className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold">Top Categories</h2>
          </div>

          {analytics.topCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No categories yet. Start tagging your freebies!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.topCategories.slice(0, 5).map((category, index) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{category.name}</span>
                    <span className="text-sm text-gray-500">
                      {category.count} items ({category.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Time Tracking */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <ClockIcon className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold">Time Tracking</h2>
          </div>

          {timeTracking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">{formatTime(timeTracking.weeklyTime)}</div>
                  <p className="text-sm text-gray-600">This Week</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">{formatTime(timeTracking.completedTime)}</div>
                  <p className="text-sm text-gray-600">Total Completed</p>
                </div>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-semibold">{timeTracking.efficiency}%</div>
                <p className="text-sm text-gray-600">Efficiency Rate</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${timeTracking.efficiency}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Reminders */}
      {analytics.upcomingReminders && analytics.upcomingReminders.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <BellIcon className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold">Upcoming Reminders</h2>
          </div>

          <div className="space-y-3">
            {analytics.upcomingReminders.map((reminder, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{reminder.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {reminder.tags && reminder.tags.length > 0 && (
                      <div className="flex gap-1">
                        {reminder.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="badge-tag text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="text-sm text-gray-500">
                      Due: {new Date(reminder.reminder.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="text-sm text-primary-600 hover:text-primary-800">Mark Complete</button>
                  <button className="text-sm text-gray-500 hover:text-gray-700">Snooze</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Summary */}
      <div className="card p-6 bg-gradient-to-r from-primary-50 to-secondary-50">
        <h2 className="text-xl font-semibold mb-4">Progress Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpenIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{analytics.basicStats.new}</div>
            <p className="text-sm text-gray-600">New Freebies</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ClockIcon className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">{analytics.basicStats.opened}</div>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{analytics.basicStats.completed}</div>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {analytics.basicStats.completionRate >= 70
              ? "🎉 Excellent progress! You're doing great!"
              : analytics.basicStats.completionRate >= 40
                ? "📈 Good progress! Keep it up!"
                : "🚀 Just getting started! Every freebie completed is progress!"}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Analytics

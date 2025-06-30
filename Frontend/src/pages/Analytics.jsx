/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { analyticsAPI } from "../services/api"
import {
  ChartBarIcon,
  CalendarIcon,
  BookOpenIcon,
  CheckCircleIcon,
  EyeIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  ClockIcon,
  FireIcon,
} from "@heroicons/react/24/outline"
import LoadingSpinner from "../components/LoadingSpinner"
import toast from "react-hot-toast"

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeFrame, setTimeFrame] = useState("week")

  useEffect(() => {
    fetchAnalytics()
  }, [timeFrame])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await analyticsAPI.getDashboard()
      setAnalytics(response.data)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
      toast.error("Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }

  const getCompletionRateColor = (rate) => {
    if (rate >= 70) return "from-emerald-500 to-green-600"
    if (rate >= 40) return "from-amber-500 to-orange-500"
    return "from-red-500 to-pink-500"
  }

  const getProgressMessage = (rate) => {
    if (rate >= 70)
      return {
        emoji: "🎉",
        title: "Outstanding Progress!",
        message: "You're crushing your learning goals! Keep up the excellent work!",
        color: "from-emerald-50 to-green-50",
      }
    if (rate >= 40)
      return {
        emoji: "📈",
        title: "Great Momentum!",
        message: "You're making solid progress! Stay consistent and you'll reach your goals!",
        color: "from-amber-50 to-orange-50",
      }
    return {
      emoji: "🚀",
      title: "Just Getting Started!",
      message: "Every journey begins with a single step. You're building great habits!",
      color: "from-blue-50 to-purple-50",
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <LoadingSpinner text="Loading analytics..." />
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-6">
        <div className="text-center bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-12 shadow-xl max-w-md">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ChartBarIcon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No Analytics Data</h3>
          <p className="text-gray-600 leading-relaxed">
            Start adding freebies to unlock powerful insights about your learning journey!
          </p>
        </div>
      </div>
    )
  }

  const progressData = getProgressMessage(analytics.basicStats.completionRate)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="mt-2 text-gray-600 text-lg">Track your freebie collection and progress</p>
          </div>
          <div className="lg:w-64">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Time Period</label>
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white/80 backdrop-blur-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-lg"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Total Freebies",
              value: analytics.basicStats.total,
              subtitle: "All time collection",
              icon: <BookOpenIcon className="w-6 h-6" />,
              gradient: "from-blue-500 to-blue-600",
              bgGradient: "from-blue-50 to-blue-100",
              change: null,
            },
            {
              title: "New This Week",
              value: analytics.weeklyStats.collected,
              subtitle: "Recently added",
              icon: <CalendarIcon className="w-6 h-6" />,
              gradient: "from-purple-500 to-purple-600",
              bgGradient: "from-purple-50 to-purple-100",
              change: "+12%",
            },
            {
              title: "Completed",
              value: analytics.basicStats.completed,
              subtitle: `${analytics.basicStats.completed} finished`,
              icon: <CheckCircleIcon className="w-6 h-6" />,
              gradient: "from-emerald-500 to-green-600",
              bgGradient: "from-emerald-50 to-green-50",
              change: "+8%",
            },
            {
              title: "Completion Rate",
              value: `${analytics.basicStats.completionRate}%`,
              subtitle: "Overall progress",
              icon: <ArrowTrendingUpIcon className="w-6 h-6" />,
              gradient: getCompletionRateColor(analytics.basicStats.completionRate),
              bgGradient:
                analytics.basicStats.completionRate >= 70
                  ? "from-emerald-50 to-green-50"
                  : analytics.basicStats.completionRate >= 40
                    ? "from-amber-50 to-orange-50"
                    : "from-red-50 to-pink-50",
              change:
                analytics.basicStats.completionRate >= 70
                  ? "+5%"
                  : analytics.basicStats.completionRate >= 40
                    ? "+2%"
                    : "-1%",
            },
          ].map((metric, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${metric.bgGradient} border border-white/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${metric.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {metric.icon}
                </div>
                {metric.change && (
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      metric.change.startsWith("+") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {metric.change}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</p>
                <p className="text-xs text-gray-500">{metric.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Freebies Over Time */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Activity Trend</h2>
                <p className="text-gray-600">Freebies added over time</p>
              </div>
            </div>

            {analytics.completionTrend && analytics.completionTrend.length > 0 ? (
              <div className="space-y-4">
                {analytics.completionTrend.slice(-6).map((trend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(trend._id.year, trend._id.month - 1).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{trend.total}</div>
                        <div className="text-xs text-gray-500">added</div>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min((trend.total / Math.max(...analytics.completionTrend.map((t) => t.total))) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ArrowTrendingUpIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No trend data yet</p>
                <p className="text-gray-400 text-sm">Add more freebies to see your activity pattern!</p>
              </div>
            )}
          </div>

          {/* Top Tags */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <TagIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Popular Tags</h2>
                <p className="text-gray-600">Your most used categories</p>
              </div>
            </div>

            {analytics.topCategories && analytics.topCategories.length > 0 ? (
              <div className="space-y-4">
                {analytics.topCategories.slice(0, 6).map((category, index) => (
                  <div key={category.name} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold ${
                            index === 0
                              ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                              : index === 1
                                ? "bg-gradient-to-r from-gray-400 to-gray-500"
                                : index === 2
                                  ? "bg-gradient-to-r from-amber-600 to-yellow-600"
                                  : "bg-gradient-to-r from-purple-500 to-pink-500"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className="text-sm font-semibold capitalize text-gray-900 group-hover:text-purple-600 transition-colors">
                          {category.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">{category.count}</div>
                        <div className="text-xs text-gray-500">{category.percentage}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          index === 0
                            ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                            : index === 1
                              ? "bg-gradient-to-r from-gray-400 to-gray-500"
                              : index === 2
                                ? "bg-gradient-to-r from-amber-600 to-yellow-600"
                                : "bg-gradient-to-r from-purple-500 to-pink-500"
                        }`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TagIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No tags yet</p>
                <p className="text-gray-400 text-sm">Start tagging your freebies to see insights!</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Funnel */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Progress Funnel</h2>
              <p className="text-gray-600">Your freebie journey flow</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <BookOpenIcon className="w-8 h-8" />,
                value: analytics.basicStats.total,
                label: "Collected",
                description: "Total freebies added",
                color: "from-blue-500 to-blue-600",
                bgColor: "from-blue-50 to-blue-100",
                percentage: 100,
              },
              {
                icon: <EyeIcon className="w-8 h-8" />,
                value: analytics.basicStats.opened,
                label: "Viewed",
                description: "Started exploring",
                color: "from-amber-500 to-orange-500",
                bgColor: "from-amber-50 to-orange-100",
                percentage:
                  analytics.basicStats.total > 0
                    ? Math.round((analytics.basicStats.opened / analytics.basicStats.total) * 100)
                    : 0,
              },
              {
                icon: <CheckCircleIcon className="w-8 h-8" />,
                value: analytics.basicStats.completed,
                label: "Completed",
                description: "Fully utilized",
                color: "from-emerald-500 to-green-600",
                bgColor: "from-emerald-50 to-green-100",
                percentage:
                  analytics.basicStats.total > 0
                    ? Math.round((analytics.basicStats.completed / analytics.basicStats.total) * 100)
                    : 0,
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${item.bgColor} border border-white/50 rounded-2xl p-6 text-center group hover:scale-105 transition-all duration-300 relative overflow-hidden`}
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {item.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{item.value}</div>
                <p className="text-gray-900 font-semibold mb-1">{item.label}</p>
                <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                <div className="text-lg font-bold text-gray-700">{item.percentage}%</div>

                {/* Progress indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                  <div
                    className={`h-1 bg-gradient-to-r ${item.color} transition-all duration-1000`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
              <p className="text-gray-600">Last 7 days activity feed</p>
            </div>
          </div>

          {analytics.recentActivity && analytics.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {analytics.recentActivity.slice(0, 5).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl hover:shadow-md transition-all duration-300 group"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      activity.action === "completed"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                        : activity.action === "opened"
                          ? "bg-gradient-to-r from-amber-500 to-orange-500"
                          : "bg-gradient-to-r from-blue-500 to-purple-500"
                    }`}
                  >
                    {activity.action === "completed" ? (
                      <CheckCircleIcon className="w-5 h-5 text-white" />
                    ) : activity.action === "opened" ? (
                      <EyeIcon className="w-5 h-5 text-white" />
                    ) : (
                      <BookOpenIcon className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {activity.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          activity.action === "completed"
                            ? "bg-green-100 text-green-700"
                            : activity.action === "opened"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {activity.action === "completed"
                          ? "Completed"
                          : activity.action === "opened"
                            ? "Opened"
                            : "Added"}
                      </span>
                      {activity.tags &&
                        activity.tags.slice(0, 2).map((tag, tagIndex) => (
                          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No recent activity</p>
              <p className="text-gray-400 text-sm">Start using freebies to see your activity here!</p>
            </div>
          )}
        </div>

        {/* Motivational Progress Summary */}
        <div className={`bg-gradient-to-br ${progressData.color} border border-white/50 rounded-3xl p-8 shadow-lg`}>
          <div className="text-center">
            <div className="text-6xl mb-4">{progressData.emoji}</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{progressData.title}</h2>
            <p className="text-gray-700 text-lg max-w-2xl mx-auto mb-8">{progressData.message}</p>

            <div className="flex justify-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FireIcon className="w-8 h-8 text-white" />
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-8 h-8 text-white" />
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <ArrowTrendingUpIcon className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics

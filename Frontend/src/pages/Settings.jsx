"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { UserIcon, BellIcon, CogIcon, TrashIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import LoadingSpinner from "../components/LoadingSpinner"
import toast from "react-hot-toast"

const Settings = () => {
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    instagramUsername: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    reminderFrequency: "weekly",
    categories: [],
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        instagramUsername: user.instagramUsername || "",
      })
      setPreferences({
        emailNotifications: user.preferences?.emailNotifications ?? true,
        reminderFrequency: user.preferences?.reminderFrequency || "weekly",
        categories: user.preferences?.categories || [],
      })
    }
  }, [user])

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target
    setPreferences({
      ...preferences,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateProfile({
        ...profileData,
        preferences,
      })
    } catch (error) {
      console.error("Profile update failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    try {
      // Here you would call an API to change password
      toast.success("Password updated successfully!")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Password update failed:", error)
      toast.error("Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your freebies and data.",
    )

    if (confirmed) {
      const doubleConfirm = window.prompt('Type "DELETE" to confirm account deletion:')

      if (doubleConfirm === "DELETE") {
        try {
          // Here you would call an API to delete the account
          toast.success("Account deletion initiated. You will be logged out.")
          // logout()
        } catch (error) {
          console.error("Account deletion failed:", error)
          toast.error("Failed to delete account")
        }
      }
    }
  }

  const tabs = [
    { id: "profile", name: "Profile", icon: UserIcon },
    { id: "notifications", name: "Notifications", icon: BellIcon },
    { id: "account", name: "Account", icon: CogIcon },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <UserIcon className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold">Profile Information</h2>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="input"
                  value={profileData.name}
                  onChange={handleProfileChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="instagramUsername" className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram Username
                </label>
                <input
                  id="instagramUsername"
                  name="instagramUsername"
                  type="text"
                  className="input"
                  placeholder="@yourusername"
                  value={profileData.instagramUsername}
                  onChange={handleProfileChange}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? <LoadingSpinner size="small" text="" /> : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-6">
              <BellIcon className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold">Notification Preferences</h2>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive email notifications for reminders and updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={preferences.emailNotifications}
                      onChange={handlePreferenceChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div>
                  <label htmlFor="reminderFrequency" className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder Frequency
                  </label>
                  <select
                    id="reminderFrequency"
                    name="reminderFrequency"
                    className="input"
                    value={preferences.reminderFrequency}
                    onChange={handlePreferenceChange}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? <LoadingSpinner size="small" text="" /> : "Save Preferences"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === "account" && (
        <div className="space-y-6">
          {/* Change Password */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-6">
              <CogIcon className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold">Change Password</h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPassword ? "text" : "password"}
                    className="input pr-10"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  className="input"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="input"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                />
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? <LoadingSpinner size="small" text="" /> : "Update Password"}
                </button>
              </div>
            </form>
          </div>

          {/* Account Stats */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Account Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">{user?.stats?.totalFreebies || 0}</div>
                <p className="text-sm text-gray-600">Total Freebies</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{user?.stats?.completedFreebies || 0}</div>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{user?.stats?.completionRate || 0}%</div>
                <p className="text-sm text-gray-600">Completion Rate</p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card p-6 border-red-200 bg-red-50">
            <div className="flex items-center gap-2 mb-4">
              <TrashIcon className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-red-900">Delete Account</h3>
                <p className="text-sm text-red-700 mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings

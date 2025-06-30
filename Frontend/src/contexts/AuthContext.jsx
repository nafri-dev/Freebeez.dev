/* eslint-disable react-refresh/only-export-components */
"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Set auth token in axios headers
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      localStorage.setItem("token", token)
    } else {
      delete axios.defaults.headers.common["Authorization"]
      localStorage.removeItem("token")
    }
  }

  // Load user from token on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token")

      if (token) {
        setAuthToken(token)
        try {
          const response = await axios.get("/auth/me")
          setUser(response.data)
        } catch (error) {
          console.error("Failed to load user:", error)
          localStorage.removeItem("token")
          delete axios.defaults.headers.common["Authorization"]
        }
      }

      setLoading(false)
    }

    loadUser()
  }, [])

  // Register function
  const register = async (userData) => {
    try {
      const response = await axios.post("/auth/register", userData)
      const { token, user } = response.data

      setAuthToken(token)
      setUser(user)
      toast.success("Registration successful!")

      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed"
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Login function
  const login = async (credentials) => {
    try {
      const response = await axios.post("/auth/login", credentials)
      const { token, user } = response.data

      setAuthToken(token)
      setUser(user)
      toast.success("Login successful!")

      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed"
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Logout function
  const logout = () => {
    setAuthToken(null)
    setUser(null)
    toast.success("Logged out successfully")
  }

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put("/auth/profile", profileData)
      setUser(response.data.user)
      toast.success("Profile updated successfully!")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Profile update failed"
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

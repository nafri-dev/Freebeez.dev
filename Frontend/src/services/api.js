import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
   withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/profile"),
}

// Freebies API
export const freebiesAPI = {
  getAll: (params = {}) => api.get("/freebies", { params }),
  getById: (id) => api.get(`/freebies/${id}`),
  create: (freebieData) => api.post("/freebies", freebieData),
  bulkCreate: (freebiesArray) => {
    console.log("API: Sending bulk create request")
    console.log("API: Data being sent:", freebiesArray)
    console.log("API: Data type:", typeof freebiesArray)
    console.log("API: Is array?", Array.isArray(freebiesArray))

    // Send the array directly as the request body
    return api.post("/freebies/bulk", freebiesArray)
  },
  update: (id, freebieData) => api.put(`/freebies/${id}`, freebieData),
  delete: (id) => api.delete(`/freebies/${id}`),
  getStats: () => api.get("/freebies/stats"),
  getTags: () => api.get("/freebies/tags"),
}

// Analytics API
// Analytics API functions
export const analyticsAPI = {
  getDashboard: () => api.get("/analytics/dashboard"),
  getTimeTracking: () => api.get("/analytics/time-tracking"),
}

// AI API
export const aiAPI = {
  summarize: (content) => api.post("/ai/summarize", { content }),
  detectFreebies: (text) => api.post("/ai/detect-freebies", { text }),
  generateTags: (content) => api.post("/ai/generate-tags", { content }),
}

export default api

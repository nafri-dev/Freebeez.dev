import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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

// Freebies API
export const freebiesAPI = {
  getAll: (params = {}) => api.get("/freebies", { params }),
  create: (data) => api.post("/freebies", data),
  update: (id, data) => api.put(`/freebies/${id}`, data),
  delete: (id) => api.delete(`/freebies/${id}`),
  bulkCreate: (freebies) => api.post("/freebies/bulk", { freebies }),
  getTags: () => api.get("/freebies/tags"),
}

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get("/analytics/dashboard"),
  getTimeTracking: () => api.get("/analytics/time-tracking"),
}

// AI API
export const aiAPI = {
  detectFreebies: (text, instagramPost) => api.post("/ai/detect-freebies", { text, instagramPost }),
  summarize: (freebieId, content) => api.post("/ai/summarize", { freebieId, content }),
  categorize: (title, description, url) => api.post("/ai/categorize", { title, description, url }),
}

export default api

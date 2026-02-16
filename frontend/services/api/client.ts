import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/"

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send cookies automatically
})

let refreshFailed = false

export function setAuthToken(token: string | null) {
  refreshFailed = token ? false : true
}

export function setRefreshToken(token: string | null) {
  refreshFailed = token ? false : true
}

export function getAccessToken() {
  return null
}

export function getRefreshToken() {
  // Cannot access refresh token from client - it's in HttpOnly cookie
  return null
}

export async function refreshAccessToken() {
  if (refreshFailed) return null
  try {
    // Server will automatically send refresh token in cookie
    const res = await api.post("auth/refresh/", {})
    // Server sets new access token cookie, we don't need to handle it here
    return "refreshed"
  } catch {
    refreshFailed = true
    setAuthToken(null)
  }
  return null
}

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    const url = originalRequest?.url || ""
    const isAuthEndpoint = url.includes("auth/login/") || url.includes("auth/register/") || url.includes("auth/refresh/") || url.includes("auth/logout/")
    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      originalRequest._retry = true
      const newAccess = await refreshAccessToken()
      if (newAccess) {
        return api(originalRequest)
      }
    }
    return Promise.reject(error)
  }
)



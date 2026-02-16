import { api, setAuthToken, setRefreshToken } from "./client"
import { z } from "zod"

// User schema for /api/auth/me/ endpoint
const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  email: z.string(),
})

const authMeSchema = z.object({
  user: userSchema,
})

export type User = z.infer<typeof userSchema>

/**
 * ⚠️ CRITICAL: Get current user from backend
 * This is the SOURCE OF TRUTH for authentication state.
 * Should be called on app initialization to validate auth.
 * 
 * Returns user data if authenticated, throws 401 if not.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await api.get("auth/me/")
    const data = authMeSchema.parse(res.data)
    return data.user
  } catch (error: any) {
    // 401 = not authenticated (expected when no valid token)
    if (error.response?.status === 401) {
      return null
    }
    // Any other error should be re-thrown
    throw error
  }
}

export async function login(username: string, password: string) {
  const res = await api.post("auth/login/", { username, password })
  setAuthToken("cookie")
  setRefreshToken("cookie")
  try {
    localStorage.setItem("username", username)
  } catch {
    // ignore
  }
  return res.data as { detail: string }
}

export async function register(username: string, email: string, password: string) {
  const res = await api.post("auth/register/", { username, email, password })
  setAuthToken("cookie")
  setRefreshToken("cookie")
  try {
    localStorage.setItem("username", username)
  } catch {
    // ignore
  }
  return res.data as { detail: string }
}

export async function logout() {
  try {
    await api.post("auth/logout/")
  } catch {
    // ignore
  }
  setAuthToken(null)
  setRefreshToken(null)
  
  // Clear all auth-related localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("username")
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
    } catch {
      // ignore
    }
  }
}

export async function refreshSession() {
  const res = await api.post("auth/refresh/", {})
  return res.data as { detail: string }
}

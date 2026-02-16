"use client"

import { ReactNode, useEffect, useState, useCallback } from "react"
import { AuthContext, AuthContextType, User } from "./AuthContext"
import { getCurrentUser, login as loginApi, logout as logoutApi, refreshSession } from "../services/api/auth"

interface AuthProviderProps {
  children: ReactNode
}

/**
 * AuthProvider - Single Source of Truth for Authentication
 *
 * Responsibilities:
 * 1. Fetches /api/auth/me/ on app load to verify auth
 * 2. Maintains user state and authentication status
 * 3. Provides login/logout/refresh methods
 * 4. Ensures all auth state changes come from backend verification
 * 5. Prevents desync by centralizing all auth operations
 *
 * Auth Flow:
 * - Provider mounts → calls /me → discovers user or 401
 * - User calls login → POST /login → Provider calls /me → state updates
 * - User calls logout → POST /logout → Provider clears state
 * - Token refresh happens in interceptor → Provider can refetch /me if needed
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch the current user from backend.
   * This is the SOURCE OF TRUTH for auth state.
   * If it fails with 401, the user is definitely not authenticated.
   */
  const fetchMe = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        setError(null)
      } else {
        setUser(null)
      }
    } catch (err: any) {
      // 401 means not authenticated - this is expected for logged-out users
      if (err.response?.status === 401) {
        setUser(null)
        setError(null)
      } else {
        // Unexpected error
        console.error("Error fetching auth user:", err)
        setError("Failed to verify authentication")
        setUser(null)
      }
    }
  }, [])

  /**
   * On mount: Verify auth state from backend
   * This runs once on app load and discovers the current user (or lack thereof)
   */
  useEffect(() => {
    let isMounted = true

    if (typeof window !== "undefined") {
      const apiBaseUrl = api.defaults.baseURL || ""
      let apiHost = ""
      try {
        apiHost = new URL(apiBaseUrl).hostname
      } catch {
        apiHost = ""
      }

      if (window.location.hostname === "localhost" && apiHost === "127.0.0.1") {
        const target = window.location.href.replace("localhost", "127.0.0.1")
        window.location.replace(target)
        return () => {
          isMounted = false
        }
      }
    }

    const initAuth = async () => {
      try {
        await fetchMe()
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initAuth()

    return () => {
      isMounted = false
    }
  }, [fetchMe])

  /**
   * Login with username and password
   * Steps:
   * 1. POST /api/auth/login/ with credentials
   * 2. Backend sets httpOnly cookies
   * 3. Call /me to verify and load user data
   * 4. Update context
   */
  const login = useCallback(
    async (username: string, password: string) => {
      try {
        setIsLoading(true)
        setError(null)

        // Call login endpoint - backend sets cookies
        await loginApi(username, password)

        // Verify login worked by fetching current user
        await fetchMe()
      } catch (err: any) {
        const message = err.response?.data?.detail || "Login failed"
        setError(message)
        setUser(null)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [fetchMe]
  )

  /**
   * Logout
   * Steps:
   * 1. POST /api/auth/logout/ to clear backend state
   * 2. Clear user from context
   * 3. Cookies are cleared by backend
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Call logout endpoint - backend clears cookies
      await logoutApi()
    } catch (err) {
      // Even if logout fails on backend, clear client state
      console.error("Logout error:", err)
    } finally {
      // Always clear the user, regardless of backend response
      setUser(null)
      setIsLoading(false)
    }
  }, [])

  /**
   * Refresh - can be called manually or by interceptor
   * Ensures token is fresh, then re-verifies auth state
   */
  const refresh = useCallback(async () => {
    try {
      await refreshSession()
      // After refresh, verify user still exists
      await fetchMe()
    } catch (err) {
      console.error("Refresh error:", err)
      // If refresh fails, we're likely not authenticated
      setUser(null)
      setError("Session expired")
    }
  }, [fetchMe])

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
    refresh,
    error,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

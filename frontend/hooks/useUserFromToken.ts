import { useState, useEffect } from "react"
import { getCurrentUser, User } from "../services/api/auth"

/**
 * useUserFromToken Hook
 * 
 * ⚠️ CRITICAL: Validates authentication state by calling GET /api/auth/me/
 * This is the SOURCE OF TRUTH for auth state (not localStorage).
 * 
 * Usage:
 * const { user, isLoading, error } = useUserFromToken()
 * 
 * Returns:
 * - user: null if not authenticated, User object if authenticated
 * - isLoading: true while checking auth
 * - error: Error message if auth check failed (not 401)
 */
export function useUserFromToken() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // ⚠️ CRITICAL: Call service function which validates /api/auth/me/
        // This validates the httpOnly JWT cookie against the backend
        const user = await getCurrentUser()

        if (isMounted) {
          setUser(user)
          
          // If no user, ensure localStorage is clean
          if (!user) {
            try {
              localStorage.removeItem("username")
              localStorage.removeItem("access_token")
              localStorage.removeItem("refresh_token")
            } catch {
              // ignore - localStorage may not be available
            }
          }
        }
      } catch (err: any) {
        if (isMounted) {
          // Any error other than 401 is a real error
          const message = err?.response?.status === 401 
            ? null 
            : err?.message || "Failed to verify authentication"
          
          setError(message)
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [])

  return { user, isLoading, error }
}

/**
 * Deprecated: Use useUserFromToken() hook instead
 * Returns user from token, or null if not authenticated
 */
export function useIsLoggedIn() {
  const { user } = useUserFromToken()
  return !!user?.username
}
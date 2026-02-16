"use client"

import { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"

/**
 * Hook to access auth state from the AuthProvider context.
 * This is the ONLY way components should access auth information.
 *
 * Usage:
 *   const { user, isAuthenticated, isLoading, login, logout } = useAuth()
 *
 * Never:
 *   - Read cookies directly
 *   - Check localStorage
 *   - Assume auth based on token presence
 *   - Decode tokens in components
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

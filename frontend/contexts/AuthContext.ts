"use client"

import { createContext } from "react"

export interface User {
  id: number
  username: string
  email: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  error: string | null
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

if (process.env.NODE_ENV === "development") {
  AuthContext.displayName = "AuthContext"
}

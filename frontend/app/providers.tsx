"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode, useState } from "react"
import { AuthProvider } from "../contexts/AuthProvider"
import { QuizServicesProvider } from "../contexts/QuizServicesContext"

/**
 * Providers - App-level context providers
 *
 * Hierarchy (bottom-up):
 * 1. AuthProvider → Manages all authentication state
 * 2. QueryClientProvider → React Query for data fetching
 *
 * AuthProvider is first so all child components can useAuth()
 */
export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <AuthProvider>
      <QuizServicesProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </QuizServicesProvider>
    </AuthProvider>
  )
}

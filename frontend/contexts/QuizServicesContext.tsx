"use client"

import { createContext, useContext, useMemo } from "react"
import { AnalyticsService, AttemptService, QuizService } from "../services/quiz"

export type QuizServices = {
  quizService: QuizService
  attemptService: AttemptService
  analyticsService: AnalyticsService
}

const QuizServicesContext = createContext<QuizServices | null>(null)

export function QuizServicesProvider({ children }: { children: React.ReactNode }) {
  const services = useMemo(
    () => ({
      quizService: new QuizService(),
      attemptService: new AttemptService(),
      analyticsService: new AnalyticsService(),
    }),
    []
  )

  return <QuizServicesContext.Provider value={services}>{children}</QuizServicesContext.Provider>
}

export function useQuizServices() {
  const context = useContext(QuizServicesContext)
  if (!context) {
    throw new Error("useQuizServices must be used within QuizServicesProvider")
  }
  return context
}

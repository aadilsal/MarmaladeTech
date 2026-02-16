"use client"

import { useQuery } from "@tanstack/react-query"
import { useQuizServices } from "../contexts/QuizServicesContext"

export function useSubjectPerformance() {
  const { analyticsService } = useQuizServices()
  return useQuery({
    queryKey: ["analytics-subject"],
    queryFn: () => analyticsService.subjectPerformance(),
  })
}

export function useProgressTrend() {
  const { analyticsService } = useQuizServices()
  return useQuery({
    queryKey: ["analytics-trend"],
    queryFn: () => analyticsService.progressTrend(),
  })
}

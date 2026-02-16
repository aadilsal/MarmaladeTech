"use client"

import { useQuery } from "@tanstack/react-query"
import { useQuizServices } from "../contexts/QuizServicesContext"

export function useAttemptResult(attemptId: number) {
  const { attemptService } = useQuizServices()
  return useQuery({
    queryKey: ["attempt-result", attemptId],
    queryFn: () => attemptService.getResult(attemptId),
    enabled: Number.isFinite(attemptId),
  })
}

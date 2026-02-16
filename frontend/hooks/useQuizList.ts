"use client"

import { useQuery } from "@tanstack/react-query"
import { useQuizServices } from "../contexts/QuizServicesContext"

export function useQuizList() {
  const { quizService } = useQuizServices()
  return useQuery({
    queryKey: ["quizzes"],
    queryFn: () => quizService.listQuizzes(),
  })
}

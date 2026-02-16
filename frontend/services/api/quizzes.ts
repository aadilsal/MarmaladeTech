import { api } from "./client"
import { quizListSchema, quizDetailSchema } from "../../types/api"

export async function fetchQuizzes() {
  const res = await api.get("quizzes/")
  if (Array.isArray(res.data)) {
    return quizListSchema.parse(res.data)
  }
  return quizListSchema.parse(res.data.results || [])
}

export async function fetchQuiz(id: string | number) {
  const res = await api.get(`quizzes/${id}/`)
  return quizDetailSchema.parse(res.data)
}

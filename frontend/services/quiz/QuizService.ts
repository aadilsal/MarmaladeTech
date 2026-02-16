import { api } from "../api/client"
import { quizDetailSchema, quizListSchema } from "../../types/api"

export class QuizService {
  async listQuizzes() {
    const res = await api.get("quizzes/")
    if (Array.isArray(res.data)) {
      return quizListSchema.parse(res.data)
    }
    return quizListSchema.parse(res.data.results || [])
  }

  async getQuiz(id: number) {
    const res = await api.get(`quizzes/${id}/`)
    return quizDetailSchema.parse(res.data)
  }
}

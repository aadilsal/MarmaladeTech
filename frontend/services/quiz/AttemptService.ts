import { api } from "../api/client"
import {
  attemptStartSchema,
  attemptQuestionsSchema,
  attemptSubmitSchema,
  attemptResultSchema,
  attemptReviewSchema,
  attemptAnalysisSchema,
} from "../../types/api"

export class AttemptService {
  async startAttempt(quizId: number) {
    const res = await api.post(`quizzes/${quizId}/start/`)
    return attemptStartSchema.parse(res.data)
  }

  async getQuestions(attemptId: number) {
    const res = await api.get(`attempts/${attemptId}/questions/`)
    return attemptQuestionsSchema.parse(res.data)
  }

  async saveAnswer(attemptId: number, questionId: number, choiceId: number) {
    const res = await api.post(`attempts/${attemptId}/answer/`, {
      question_id: questionId,
      choice_id: choiceId,
    })
    return res.data as { detail: string }
  }

  async submit(attemptId: number, timeTakenSeconds?: number) {
    const res = await api.post(`attempts/${attemptId}/submit/`, {
      time_taken_seconds: timeTakenSeconds,
    })
    return attemptSubmitSchema.parse(res.data)
  }

  async getResult(attemptId: number) {
    const res = await api.get(`attempts/${attemptId}/results/`)
    return attemptResultSchema.parse(res.data)
  }

  async getReview(attemptId: number) {
    const res = await api.get(`attempts/${attemptId}/review/`)
    return attemptReviewSchema.parse(res.data)
  }

  async getAnalysis(attemptId: number) {
    const res = await api.get(`attempts/${attemptId}/analysis/`)
    return attemptAnalysisSchema.parse(res.data)
  }
}

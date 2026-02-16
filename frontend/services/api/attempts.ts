import { api } from "./client"
import {
  attemptStartSchema,
  attemptQuestionsSchema,
  attemptSubmitSchema,
  attemptResultSchema,
  attemptReviewSchema,
} from "../../types/api"

export async function startQuizAttempt(quizId: number) {
  const res = await api.post(`quizzes/${quizId}/start/`)
  return attemptStartSchema.parse(res.data)
}

export async function fetchAttemptQuestions(attemptId: number) {
  const res = await api.get(`attempts/${attemptId}/questions/`)
  return attemptQuestionsSchema.parse(res.data)
}

export async function saveAttemptAnswer(attemptId: number, questionId: number, choiceId: number) {
  const res = await api.post(`attempts/${attemptId}/answer/`, {
    question_id: questionId,
    choice_id: choiceId,
  })
  return res.data as { detail: string }
}

export async function submitAttempt(attemptId: number, timeTakenSeconds?: number) {
  const res = await api.post(`attempts/${attemptId}/submit/`, {
    time_taken_seconds: timeTakenSeconds,
  })
  return attemptSubmitSchema.parse(res.data)
}

export async function fetchAttemptResult(attemptId: number) {
  const res = await api.get(`attempts/${attemptId}/results/`)
  return attemptResultSchema.parse(res.data)
}

export async function fetchAttemptReview(attemptId: number) {
  const res = await api.get(`attempts/${attemptId}/review/`)
  return attemptReviewSchema.parse(res.data)
}

export async function fetchAttemptAnalysis(attemptId: number) {
  const res = await api.get(`attempts/${attemptId}/analysis/`)
  return res.data as {
    attempt_id: number
    quiz_id: number
    correct: number
    incorrect: number
    total_questions: number
    accuracy: number
  }
}

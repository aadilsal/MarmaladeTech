"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useQuizServices } from "./QuizServicesContext"
import { QuizDetail } from "../types/api"
import { useDebouncedEffect } from "../hooks/useDebouncedEffect"
import {
  clearAttemptProgress,
  loadAttemptProgress,
  saveAttemptProgress,
  saveAttemptResult,
} from "../features/quiz/attemptStorage"

export type QuizAttemptState = {
  quiz: QuizDetail | null
  attemptId: number | null
  questionsCount: number
  currentIndex: number
  answers: Record<number, number>
  isSaving: boolean
  lastSavedAt: string | null
  startedAt: string
  isSubmitting: boolean
  submitError: string | null
}

export type QuizAttemptContextValue = QuizAttemptState & {
  isLoading: boolean
  isError: boolean
  currentQuestion: QuizDetail["questions"][number] | null
  progress: number
  selectAnswer: (choiceId: number) => void
  nextQuestion: () => void
  previousQuestion: () => void
  submitAttempt: () => Promise<void>
}

const QuizAttemptContext = createContext<QuizAttemptContextValue | null>(null)

export function QuizAttemptProvider({ quizId, children }: { quizId: number; children: React.ReactNode }) {
  const router = useRouter()
  const { quizService, attemptService } = useQuizServices()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [attemptId, setAttemptId] = useState<number | null>(null)

  const quizQuery = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => quizService.getQuiz(quizId),
    enabled: Number.isFinite(quizId),
  })

  useEffect(() => {
    if (!quizQuery.data) return
    const saved = loadAttemptProgress(quizQuery.data.id)
    if (saved) {
      setAnswers(saved.answers || {})
      if (saved.startedAt) setStartedAt(saved.startedAt)
      if (saved.attemptId) setAttemptId(saved.attemptId)
      setCurrentIndex(typeof saved.currentIndex === "number" ? saved.currentIndex : 0)
      return
    }

    attemptService
      .startAttempt(quizQuery.data.id)
      .then(attempt => {
        setAttemptId(attempt.id)
        saveAttemptProgress({
          quizId: quizQuery.data.id,
          attemptId: attempt.id,
          answers: {},
          startedAt,
          currentIndex: 0,
        })
      })
      .catch(() => {
        setSubmitError("Unable to start quiz. Please try again.")
      })
  }, [attemptService, quizQuery.data, startedAt])

  useDebouncedEffect(
    () => {
      if (!quizQuery.data) return
      saveAttemptProgress({
        quizId: quizQuery.data.id,
        attemptId: attemptId ?? undefined,
        answers,
        startedAt,
        currentIndex,
      })
      setIsSaving(false)
      setLastSavedAt(new Date().toLocaleTimeString())
    },
    [answers, currentIndex, startedAt, attemptId, quizQuery.data],
    500
  )

  const questionsQuery = useQuery({
    queryKey: ["attempt-questions", attemptId],
    queryFn: () => attemptService.getQuestions(attemptId as number),
    enabled: !!attemptId,
  })

  const questions = questionsQuery.data?.questions || []
  const currentQuestion = useMemo(() => questions[currentIndex] || null, [questions, currentIndex])
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0

  useEffect(() => {
    if (questions.length === 0) return
    if (currentIndex >= questions.length) {
      setCurrentIndex(Math.max(0, questions.length - 1))
    }
  }, [questions.length, currentIndex])

  const selectAnswer = (choiceId: number) => {
    if (!currentQuestion) return
    setIsSaving(true)
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: choiceId }))
    if (attemptId && currentQuestion?.id) {
      attemptService.saveAnswer(attemptId, currentQuestion.id, choiceId).catch(() => {
        // ignore network save errors; retry on next change
      })
    }
  }

  const submitAttempt = async () => {
    if (!quizQuery.data) return
    if (isSubmitting) return
    setIsSubmitting(true)
    setSubmitError(null)
    const timeTakenSeconds = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)

    try {
      if (!attemptId) throw new Error("Attempt not started")
      const submission = await attemptService.submit(attemptId, timeTakenSeconds)

      saveAttemptResult(submission.attempt_id, {
        quizId: submission.quiz_id,
        attemptId: submission.attempt_id,
        startedAt,
        submittedAt: submission.submitted_at,
        answers,
        score: submission.score,
        totalQuestions: submission.total_questions,
        timeTakenSeconds,
      })
      clearAttemptProgress(quizQuery.data.id)
      router.push(`/results/${submission.attempt_id}`)
    } catch (error: any) {
      setSubmitError(error?.response?.data?.detail || "Submission failed. Please try again.")
      setIsSubmitting(false)
    }
  }

  const value: QuizAttemptContextValue = {
    quiz: quizQuery.data || null,
    attemptId,
    questionsCount: questions.length,
    currentIndex,
    answers,
    isSaving,
    lastSavedAt,
    startedAt,
    isSubmitting,
    submitError,
    isLoading: quizQuery.isLoading || questionsQuery.isLoading,
    isError: quizQuery.isError || questionsQuery.isError,
    currentQuestion,
    progress,
    selectAnswer,
    nextQuestion: () => setCurrentIndex(index => Math.min(index + 1, Math.max(0, questions.length - 1))),
    previousQuestion: () => setCurrentIndex(index => Math.max(index - 1, 0)),
    submitAttempt,
  }

  return <QuizAttemptContext.Provider value={value}>{children}</QuizAttemptContext.Provider>
}

export function useQuizAttempt() {
  const context = useContext(QuizAttemptContext)
  if (!context) {
    throw new Error("useQuizAttempt must be used within QuizAttemptProvider")
  }
  return context
}

"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { loadAttemptResult } from "../../../features/quiz/attemptStorage"
import { useAttemptResult } from "../../../hooks/useAttemptResult"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Skeleton } from "../../../components/ui/skeleton"
import { ErrorState } from "../../../components/ui/empty-state"

export default function ResultsPage() {
  const params = useParams()
  const attemptId = Number(params?.attemptId)
  const localResult = loadAttemptResult(attemptId)

  const resultQuery = useAttemptResult(attemptId)

  const totalQuestions = localResult?.totalQuestions || resultQuery.data?.total_questions || 0
  const score = localResult?.score ?? resultQuery.data?.score ?? 0
  const accuracy = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0
  const incorrect = totalQuestions - score

  const feedback = useMemo(() => {
    if (accuracy >= 80) return "Excellent! You’re exam-ready on this topic."
    if (accuracy >= 60) return "Good work — revise weak areas for a higher score."
    return "Keep practicing. Focus on accuracy before speed."
  }, [accuracy])

  if (resultQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <Skeleton className="h-10" />
        <Skeleton className="mt-4 h-48" />
      </div>
    )
  }

  if (resultQuery.isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <ErrorState title="Result not available" description="Please try again later." />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Quiz Result</h1>
        <p className="text-sm text-slate-600">Here is your performance summary.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{resultQuery.data?.quiz_title || `Quiz #${resultQuery.data?.quiz_id}`}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">Score {score}/{totalQuestions}</Badge>
            <Badge variant="info">Accuracy {accuracy}%</Badge>
            {localResult?.timeTakenSeconds !== undefined && (
              <Badge>Time taken {Math.round(localResult.timeTakenSeconds / 60)} min</Badge>
            )}
            {resultQuery.data?.category && <Badge variant="warning">{resultQuery.data.category}</Badge>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Correct</p>
              <p className="text-2xl font-semibold text-slate-900">{score}</p>
            </div>
            <div className="rounded-lg border bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Incorrect</p>
              <p className="text-2xl font-semibold text-slate-900">{incorrect}</p>
            </div>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-slate-600">Subject performance</p>
            <p className="text-base font-semibold text-slate-900 mt-1">
              {resultQuery.data?.category || "General"}: {accuracy}%
            </p>
          </div>
          <p className="text-sm text-slate-600">{feedback}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button asChild>
              <Link href={`/results/${attemptId}/review`}>Review answers</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/quizzes">Take another quiz</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

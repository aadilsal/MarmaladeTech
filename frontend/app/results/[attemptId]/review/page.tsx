"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { fetchAttemptReview } from "../../../../services/api/attempts"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Badge } from "../../../../components/ui/badge"
import { Button } from "../../../../components/ui/button"
import { Skeleton } from "../../../../components/ui/skeleton"
import { EmptyState, ErrorState } from "../../../../components/ui/empty-state"

export default function ReviewPage() {
  const params = useParams()
  const attemptId = Number(params?.attemptId)
  const reviewQuery = useQuery({
    queryKey: ["attempt-review", attemptId],
    queryFn: () => fetchAttemptReview(attemptId),
    enabled: Number.isFinite(attemptId),
  })

  const [showIncorrectOnly, setShowIncorrectOnly] = useState(false)

  if (reviewQuery.isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-4">
        <Skeleton className="h-10" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (reviewQuery.isError || !reviewQuery.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <ErrorState title="Could not load review" description="Please try again." />
      </div>
    )
  }

  const questions = reviewQuery.data.questions
  const filtered = questions.filter(q => {
    const selected = q.selected_choice_id
    const correct = q.correct_choice_id
    const isCorrect = selected && selected === correct
    return showIncorrectOnly ? !isCorrect : true
  })

  if (filtered.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <EmptyState title="No incorrect answers" description="Great job! You got everything correct." />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Answer review</h1>
          <p className="text-sm text-slate-600">Compare your responses with correct answers.</p>
        </div>
        <Button variant="outline" onClick={() => setShowIncorrectOnly(prev => !prev)}>
          {showIncorrectOnly ? "Show all" : "Only incorrect"}
        </Button>
      </div>

      <div className="space-y-4">
        {filtered.map((q, index) => {
          const selected = q.selected_choice_id
          const correct = q.correct_choice_id
          const isCorrect = selected && selected === correct
          const selectedIndex = selected ? q.choices.findIndex(c => c.id === selected) : -1
          const correctIndex = correct ? q.choices.findIndex(c => c.id === correct) : -1
          const selectedLabel = selectedIndex >= 0 ? String.fromCharCode(65 + selectedIndex) : "Not answered"
          const correctLabel = correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : "--"

          return (
            <Card key={q.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Q{index + 1}. {q.text}</CardTitle>
                  <Badge variant={isCorrect ? "success" : "error"}>{isCorrect ? "Correct" : "Incorrect"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-slate-600">
                  <span className="font-medium text-slate-800">Your answer:</span> {selectedLabel} &nbsp;|&nbsp;
                  <span className="font-medium text-slate-800">Correct:</span> {correctLabel}
                </div>
                {q.choices.map((choice, idx) => {
                  const isSelected = selected === choice.id
                  const isRight = choice.id === correct
                  return (
                    <div
                      key={choice.id}
                      className={`rounded-lg border px-4 py-2 text-sm ${
                        isRight ? "border-emerald-300 bg-emerald-50" : isSelected ? "border-red-300 bg-red-50" : "border-slate-200"
                      }`}
                    >
                      <span className="mr-2 font-semibold">{String.fromCharCode(65 + idx)}.</span>
                      {choice.text}
                    </div>
                  )
                })}
                <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                  {q.ai_explanation || q.explanation || "Explanation not available yet."}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

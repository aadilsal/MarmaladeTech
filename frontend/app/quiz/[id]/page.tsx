"use client"

import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "../../../components/ui/button"
import { Card } from "../../../components/ui/card"
import { Progress } from "../../../components/ui/progress"
import { Skeleton } from "../../../components/ui/skeleton"
import { EmptyState, ErrorState } from "../../../components/ui/empty-state"
import { QuizAttemptProvider, useQuizAttempt } from "../../../contexts/QuizAttemptContext"

function QuizAttemptContent() {
  const {
    quiz,
    questionsCount,
    currentIndex,
    answers,
    isSaving,
    lastSavedAt,
    isSubmitting,
    submitError,
    isLoading,
    isError,
    currentQuestion,
    progress,
    selectAnswer,
    nextQuestion,
    previousQuestion,
    submitAttempt,
  } = useQuizAttempt()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-4">
        <Skeleton className="h-10" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (isError || !quiz) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <ErrorState title="Quiz not available" description="Please try again later." />
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <EmptyState title="No questions yet" description="This quiz is still being prepared." />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6">
      <div className="sticky top-0 z-10 bg-slate-50 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">{quiz.title}</span>
            <span className="text-slate-600">
              Question {currentIndex + 1} <span className="text-slate-400">/</span> {questionsCount}
            </span>
          </div>
          <div className="relative">
            <Progress value={progress} className="h-2" />
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className={`flex items-center gap-1 ${isSaving ? "text-brand-600" : "text-slate-500"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isSaving ? "bg-brand-600 animate-pulse" : "bg-slate-400"}`} />
                {isSaving ? "Saving..." : lastSavedAt ? `Saved ${lastSavedAt}` : "Autosave active"}
              </span>
              <span className="text-slate-500">
                {Object.keys(answers).length} / {questionsCount} answered
              </span>
            </div>
            <span className="text-slate-500">No time limit</span>
          </div>
        </div>
      </div>

      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-white rounded-2xl shadow-soft border-2 border-slate-100 p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-6">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm">
              {currentIndex + 1}
            </div>
            <h2 className="question-text text-slate-900 flex-1 pt-0.5">{currentQuestion.text}</h2>
          </div>

          <div className="space-y-3">
            {currentQuestion.choices.map((choice, idx) => {
              const selected = answers[currentQuestion.id] === choice.id
              const optionLetter = String.fromCharCode(65 + idx)

              return (
                <button
                  key={choice.id}
                  className={`btn-exam w-full text-left rounded-xl border-2 px-5 py-4 transition-all duration-200 ${
                    selected
                      ? "border-brand-500 bg-brand-50 shadow-sm ring-2 ring-brand-100"
                      : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
                  }`}
                  onClick={() => selectAnswer(choice.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm transition-colors ${
                        selected ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {optionLetter}
                    </div>
                    <span
                      className={`text-base sm:text-lg leading-relaxed ${
                        selected ? "text-slate-900 font-medium" : "text-slate-700"
                      }`}
                    >
                      {choice.text}
                    </span>
                  </div>
                </button>
              )}
            )}
          </div>
        </div>
      </motion.div>

      <div className="flex items-center justify-between gap-4 pb-6">
        <Button variant="outline" size="lg" onClick={previousQuestion} disabled={currentIndex === 0}>
          Previous
        </Button>
        {currentIndex < questionsCount - 1 ? (
          <Button size="lg" onClick={nextQuestion}>
            Next
          </Button>
        ) : (
          <Button size="lg" onClick={submitAttempt} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Quiz"}
          </Button>
        )}
      </div>

      {submitError && (
        <Card className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{submitError}</Card>
      )}
    </div>
  )
}

export default function QuizAttemptPage() {
  const params = useParams()
  const quizId = Number(params?.id)

  if (!Number.isFinite(quizId)) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <ErrorState title="Quiz not available" description="Please try again later." />
      </div>
    )
  }

  return (
    <QuizAttemptProvider quizId={quizId}>
      <QuizAttemptContent />
    </QuizAttemptProvider>
  )
}

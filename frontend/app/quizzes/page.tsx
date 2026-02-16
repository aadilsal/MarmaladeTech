"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { fetchSubmissions } from "../../services/api/submissions"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Skeleton } from "../../components/ui/skeleton"
import { EmptyState, ErrorState } from "../../components/ui/empty-state"
import { listSavedResults } from "../../features/quiz/attemptStorage"
import { useUserFromToken } from "../../hooks/useUserFromToken"
import { useQuizList } from "../../hooks/useQuizList"

function difficultyFromQuestions(count: number) {
  if (count <= 20) return "Easy"
  if (count <= 50) return "Medium"
  return "Hard"
}

export default function QuizzesPage() {
  const [subject, setSubject] = useState("All")
  const [difficulty, setDifficulty] = useState("All")
  const [chapter, setChapter] = useState("")
  const user = useUserFromToken()

  const quizzesQuery = useQuizList()
  const submissionsQuery = useQuery({
    queryKey: ["submissions"],
    queryFn: fetchSubmissions,
    enabled: !!user?.user_id || !!user?.username,
  })
  const results = listSavedResults()
  const userSubmissions = (submissionsQuery.data || []).filter(sub => {
    if (user?.user_id) return sub.user?.id === user.user_id
    if (user?.username) return sub.user?.username === user.username
    return false
  })

  const subjects = useMemo(() => {
    const list = quizzesQuery.data?.map(q => q.category || "General") || []
    return ["All", ...Array.from(new Set(list))]
  }, [quizzesQuery.data])

  const filtered = useMemo(() => {
    const quizzes = quizzesQuery.data || []
    return quizzes.filter(quiz => {
      const matchesSubject = subject === "All" || (quiz.category || "General") === subject
      const matchesDifficulty =
        difficulty === "All" || difficultyFromQuestions(quiz.question_count || 0) === difficulty
      const matchesChapter =
        chapter.trim().length === 0 ||
        quiz.title.toLowerCase().includes(chapter.toLowerCase()) ||
        (quiz.description || "").toLowerCase().includes(chapter.toLowerCase())
      return matchesSubject && matchesDifficulty && matchesChapter
    })
  }, [quizzesQuery.data, subject, difficulty, chapter])

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Quiz library</h1>
        <p className="text-sm text-slate-600">Choose a subject and start solving.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-3">
          <label className="text-xs font-semibold text-slate-500">Subject</label>
          <select
            className="mt-2 w-full rounded-md border border-slate-200 bg-white p-2 text-sm"
            value={subject}
            onChange={e => setSubject(e.target.value)}
          >
            {subjects.map(item => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-xl border bg-white p-3">
          <label className="text-xs font-semibold text-slate-500">Difficulty</label>
          <select
            className="mt-2 w-full rounded-md border border-slate-200 bg-white p-2 text-sm"
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
          >
            {["All", "Easy", "Medium", "Hard"].map(item => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-xl border bg-white p-3">
          <label className="text-xs font-semibold text-slate-500">Chapter</label>
          <Input
            className="mt-2"
            placeholder="Search by chapter or topic"
            value={chapter}
            onChange={e => setChapter(e.target.value)}
          />
        </div>
      </div>

      {quizzesQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : quizzesQuery.isError ? (
        <ErrorState title="Could not load quizzes" description="Please try again in a moment." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No quizzes found" description="Try adjusting your filters." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map(quiz => {
            const lastResult = results.find(r => r.quizId === quiz.id)
            const submission = userSubmissions.find(s => s.quiz === quiz.id)
            const score = lastResult?.score ?? submission?.score
            const total = lastResult?.totalQuestions ?? quiz.question_count
            return (
              <Card key={quiz.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{quiz.title}</CardTitle>
                    <Badge variant="info">{quiz.category || "General"}</Badge>
                  </div>
                  <p className="text-sm text-slate-600">{quiz.description || "Focused practice"}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                    <Badge>{quiz.question_count} questions</Badge>
                    <Badge variant="warning">{difficultyFromQuestions(quiz.question_count)}</Badge>
                    <Badge>Time limit: None</Badge>
                    {score !== undefined && (
                      <Badge variant="success">Prev score: {score}/{total}</Badge>
                    )}
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/quiz/${quiz.id}`}>Start Quiz</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

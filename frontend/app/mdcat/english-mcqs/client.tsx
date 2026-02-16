"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { EnglishIcon } from "../../../components/icons/SubjectIcons"
import { fetchQuizzes } from "../../../services/api/quizzes"
import { Skeleton } from "../../../components/ui/skeleton"

export default function EnglishMCQsClient() {
  const quizzesQuery = useQuery({
    queryKey: ["quizzes", "english"],
    queryFn: async () => {
      const allQuizzes = await fetchQuizzes()
      return allQuizzes.filter(q => 
        q.title.toLowerCase().includes("english") || 
        q.category?.toLowerCase() === "english"
      )
    },
  })

  const englishQuizzes = quizzesQuery.data || []
  const totalMCQs = englishQuizzes.reduce((acc, quiz) => acc + (quiz.question_count || 0), 0)

  return (
    <div className="bg-slate-50 min-h-screen">
      <section className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-b">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_300px] items-start">
            <div>
              <div className="inline-flex items-center gap-2 mb-6">
                <Link href="/" className="text-sm text-slate-600 hover:text-brand-600">Home</Link>
                <span className="text-slate-400">/</span>
                <span className="text-sm font-medium text-slate-900">English MCQs</span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <EnglishIcon className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-2">
                    MDCAT English MCQs
                  </h1>
                  <p className="text-lg text-slate-600">
                    Vocabulary & comprehension practice
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 border">
                  <span className="text-2xl font-bold text-orange-600">{totalMCQs}+</span>
                  <span className="text-sm text-slate-600">MCQs</span>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 border">
                  <span className="text-2xl font-bold text-orange-600">{englishQuizzes.length}</span>
                  <span className="text-sm text-slate-600">Topic Tests</span>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 border">
                  <span className="text-2xl font-bold text-orange-600">100%</span>
                  <span className="text-sm text-slate-600">Free</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="shadow-lg">
                  <Link href="/quizzes">Start English Practice →</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/dashboard">Track Progress</Link>
                </Button>
              </div>
            </div>

            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Practice Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    <span className="text-slate-700">Vocabulary</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    <span className="text-slate-700">Synonyms & Antonyms</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    <span className="text-slate-700">Analogies</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    <span className="text-slate-700">Comprehension</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    <span className="text-slate-700">Sentence Completion</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Available English Quizzes</h2>
        
        {quizzesQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : englishQuizzes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {englishQuizzes.map(quiz => (
              <Card key={quiz.id} className="card-interactive border-2 hover:border-orange-300">
                <CardHeader>
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <CardDescription>
                    {quiz.question_count} questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/quiz/${quiz.id}`}>Start Quiz →</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600">English quizzes coming soon!</p>
              <Button asChild className="mt-4">
                <Link href="/quizzes">Browse All Quizzes</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          Improve English Skills Today
        </h2>
        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
          Build vocabulary and comprehension with targeted practice MCQs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="shadow-lg">
            <Link href="/quizzes">Practice English MCQs →</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

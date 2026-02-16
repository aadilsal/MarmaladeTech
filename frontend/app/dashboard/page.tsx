"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { fetchQuizzes } from "../../services/api/quizzes"
import { fetchDashboardSummary, fetchRecentAttempts } from "../../services/api/dashboard"
import { useUserFromToken } from "../../hooks/useUserFromToken"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import { Skeleton } from "../../components/ui/skeleton"
import { EmptyState, ErrorState } from "../../components/ui/empty-state"
import { WelcomeModal } from "../../components/ui/welcome-modal"
import { QuickActions } from "../../components/ui/quick-actions"
import { AchievementsSection } from "../../components/ui/achievements-section"
import { RecommendedQuizzes } from "../../components/ui/recommended-quizzes"
import { DailyChallenge } from "../../components/ui/daily-challenge"
import { PerformanceStats } from "../../components/ui/performance-stats"
import { MotivationalTip } from "../../components/ui/motivational-tip"
import { listInProgressAttempts, listSavedResults } from "../../features/quiz/attemptStorage"
import {
  BiologyIcon,
  ChemistryIcon,
  PhysicsIcon,
  EnglishIcon,
  LogicIcon,
  StreakIcon,
  TargetIcon,
} from "../../components/icons/SubjectIcons"

const subjectIcons: Record<string, any> = {
  biology: BiologyIcon,
  chemistry: ChemistryIcon,
  physics: PhysicsIcon,
  english: EnglishIcon,
  logical: LogicIcon,
}

export default function DashboardPage() {
  const user = useUserFromToken()
  const [showWelcome, setShowWelcome] = useState(false)
  
  const quizzesQuery = useQuery({ queryKey: ["quizzes"], queryFn: fetchQuizzes })
  const summaryQuery = useQuery({ queryKey: ["dashboard-summary"], queryFn: fetchDashboardSummary })
  const recentQuery = useQuery({ queryKey: ["dashboard-recent"], queryFn: fetchRecentAttempts })

  const quizzes = quizzesQuery.data || []
  const inProgress = listInProgressAttempts().sort((a, b) => (b.startedAt > a.startedAt ? 1 : -1))[0]
  const recentResults = recentQuery.data || listSavedResults().slice(0, 2)

  // Check if user is new (first time login)
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome")
    const totalAttempts = summaryQuery.data?.total_attempts || 0
    
    if (!hasSeenWelcome && totalAttempts === 0) {
      setShowWelcome(true)
    }
  }, [summaryQuery.data])

  const handleCloseWelcome = () => {
    setShowWelcome(false)
    localStorage.setItem("hasSeenWelcome", "true")
  }

  // Calculate daily streak (simplified - would need backend tracking)
  const today = new Date().toDateString()
  const lastAttempt = summaryQuery.data?.last_attempt
  const lastAttemptDate = lastAttempt?.submitted_at ? new Date(lastAttempt.submitted_at as string).toDateString() : null
  const isStreakActive = lastAttemptDate === today

  const groupedQuizzes = quizzes.reduce((acc: Record<string, any[]>, quiz) => {
    const subject = quiz.category?.toLowerCase() || "other"
    if (!acc[subject]) acc[subject] = []
    acc[subject].push(quiz)
    return acc
  }, {})

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 min-h-screen">
      {/* Welcome Modal for First-time Users */}
      {showWelcome && (
        <WelcomeModal username={user?.username} onClose={handleCloseWelcome} />
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Welcome Section with Enhanced Gradient */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl p-8 shadow-xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome back{user?.username ? `, ${user.username}` : ""}! 🎯
                </h1>
                <p className="text-lg text-white/90">
                  {isStreakActive
                    ? "Great! You've practiced today. Keep the momentum going!"
                    : "Start your practice today to build your streak."}
                </p>
              </div>
              <div className="hidden sm:block text-6xl">
                {isStreakActive ? "🔥" : "💪"}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats - Streak & Recent Activity */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <StreakIcon className="w-5 h-5 text-orange-600" />
                Daily Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-orange-600 mb-2">
                {summaryQuery.isLoading ? (
                  <Skeleton className="h-10 w-20" />
                ) : (
                  0
                )}
              </p>
              <p className="text-sm text-slate-600">
                {isStreakActive ? "Practiced today ✓" : "Start today"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TargetIcon className="w-5 h-5 text-brand-600" />
                Total Attempts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-brand-600 mb-2">
                {summaryQuery.isLoading ? (
                  <Skeleton className="h-10 w-20" />
                ) : (
                  summaryQuery.data?.total_attempts || 0
                )}
              </p>
              <p className="text-sm text-slate-600">
                {summaryQuery.data?.total_questions || 0} questions answered
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              {summaryQuery.isLoading ? (
                <Skeleton className="h-10 w-20" />
              ) : summaryQuery.data?.accuracy ? (
                <div>
                  <p className="text-4xl font-bold text-success-600 mb-2">
                    {Math.round(summaryQuery.data.accuracy)}%
                  </p>
                  <p className="text-sm text-slate-600">Across all quizzes</p>
                </div>
              ) : (
                <div>
                  <p className="text-2xl text-slate-400 mb-2">--</p>
                  <p className="text-sm text-slate-600">No attempts yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <QuickActions 
          hasInProgress={!!inProgress} 
          inProgressQuizId={inProgress?.quizId?.toString()}
        />

        {/* Daily Challenge & Achievements Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <DailyChallenge 
            questionsToday={0}
            targetQuestions={20}
            completedToday={false}
          />
          
          <AchievementsSection 
            totalAttempts={summaryQuery.data?.total_attempts || 0}
            totalCorrect={summaryQuery.data?.total_score || 0}
            streak={0}
          />
        </div>

        {/* Recommended Quizzes */}
        {quizzes.length > 0 && (
          <RecommendedQuizzes 
            quizzes={quizzes as any}
          />
        )}

        {/* Performance Stats & Recent Activity Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PerformanceStats />

          {/* Recent Quiz Attempts */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Your last few quiz attempts</CardDescription>
            </CardHeader>
            <CardContent>
              {recentResults.length === 0 ? (
                <EmptyState
                  title="No quiz attempts yet"
                  description="Complete your first quiz to see your progress here."
                />
              ) : (
                <div className="space-y-3">
                  {recentResults.map((result, idx) => {
                    const total = (result as any).total_questions ?? (result as any).totalQuestions ?? 0
                    const score = (result as any).score ?? 0
                    const title = (result as any).quiz_title
                      ? (result as any).quiz_title
                      : `Quiz #${(result as any).quizId || (result as any).quiz_id}`
                    const percentage = Math.round(((score || 0) / (total || 1)) * 100)

                    return (
                      <motion.div
                        key={(result as any).attempt_id || (result as any).attemptId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-slate-50 hover:bg-slate-100 transition-colors">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{title}</p>
                            <p className="text-sm text-slate-600">
                              {score}/{total} correct
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${percentage >= 70 ? "text-success-600" : "text-warning-600"}`}>
                              {percentage}%
                            </p>
                            <p className="text-xs text-slate-500">accuracy</p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Motivational Tip */}
        <MotivationalTip />

        {/* Subject-wise Quiz Selection */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Browse by Subject</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(groupedQuizzes).map(([subject, subjectQuizzes]: [string, any[]]) => {
              const Icon = subjectIcons[subject] || BiologyIcon
              const colors: Record<string, { bg: string; text: string; border: string }> = {
                biology: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
                chemistry: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
                physics: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
                english: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
                logical: { bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-200" },
                other: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" },
              }
              const color = colors[subject] || colors.other

              return (
                <motion.div
                  key={subject}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`border-2 ${color.border} card-interactive cursor-pointer hover:shadow-lg transition-all`}>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-3 rounded-xl ${color.bg}`}>
                          <Icon className={`w-6 h-6 ${color.text}`} />
                        </div>
                        <Badge variant="default" className="bg-slate-200 text-slate-900">{subjectQuizzes.length}</Badge>
                      </div>
                      <CardTitle className="capitalize text-lg">{subject}</CardTitle>
                      <CardDescription>
                        {subjectQuizzes.length} quiz{subjectQuizzes.length !== 1 ? "zes" : ""} available
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild className="w-full" variant="outline">
                        <Link href="/quizzes">Browse →</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

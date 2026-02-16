"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Button } from "./button"
import Link from "next/link"
import { Progress } from "./progress"
import { motion } from "framer-motion"

interface DailyChallengeProps {
  completedToday?: boolean
  questionsToday?: number
  targetQuestions?: number
}

export function DailyChallenge({ 
  completedToday = false, 
  questionsToday = 0,
  targetQuestions = 20 
}: DailyChallengeProps) {
  const progress = Math.min((questionsToday / targetQuestions) * 100, 100)
  const remaining = Math.max(targetQuestions - questionsToday, 0)

  return (
    <Card className="border-2 border-focus-200 bg-gradient-to-br from-focus-50 via-white to-brand-50 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-100 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-focus-100 rounded-full blur-3xl opacity-30" />
      
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            ⚡ Daily Challenge
          </CardTitle>
          {completedToday && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <span className="text-2xl">✅</span>
            </motion.div>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="space-y-4">
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-sm font-medium text-slate-700">
                {completedToday
                  ? "Challenge completed! 🎉"
                  : `Answer ${targetQuestions} questions today`}
              </p>
              <span className="text-2xl font-bold text-brand-600">
                {questionsToday}/{targetQuestions}
              </span>
            </div>
            <Progress value={progress} className="h-2.5" />
          </div>

          {!completedToday && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                {remaining} question{remaining !== 1 ? 's' : ''} to go
              </p>
              <Button asChild size="sm" className="shadow-md">
                <Link href="/quizzes">Start Now →</Link>
              </Button>
            </div>
          )}

          {completedToday && (
            <div className="bg-success-50 border border-success-200 rounded-lg p-3 text-center">
              <p className="text-sm font-semibold text-success-800">
                Keep going! Extra practice builds mastery 💪
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

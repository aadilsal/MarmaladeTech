"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Button } from "./button"
import Link from "next/link"
import { Badge } from "./badge"
import { motion } from "framer-motion"
import {
  BiologyIcon,
  ChemistryIcon,
  PhysicsIcon,
  EnglishIcon,
} from "../icons/SubjectIcons"

interface Quiz {
  id: string
  title: string
  category?: string
  question_count?: number
  difficulty?: string
}

interface RecommendedQuizzesProps {
  quizzes?: Quiz[]
  weakSubject?: string
}

const subjectIcons: Record<string, any> = {
  biology: BiologyIcon,
  chemistry: ChemistryIcon,
  physics: PhysicsIcon,
  english: EnglishIcon,
}

const subjectColors: Record<string, { bg: string; text: string; border: string }> = {
  biology: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
  chemistry: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
  physics: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  english: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
}

export function RecommendedQuizzes({ quizzes = [], weakSubject }: RecommendedQuizzesProps) {
  // Recommend based on weak subject or show popular quizzes
  const recommendations = quizzes
    .filter(q => weakSubject ? q.category?.toLowerCase() === weakSubject : true)
    .slice(0, 3)

  if (recommendations.length === 0) {
    return null
  }

  return (
    <Card className="border-2 border-focus-200 bg-gradient-to-br from-focus-50 to-brand-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          💡 Recommended for You
        </CardTitle>
        {weakSubject && (
          <p className="text-sm text-slate-600">
            Practice more {weakSubject} to improve your score
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((quiz, idx) => {
            const subject = quiz.category?.toLowerCase() || "biology"
            const Icon = subjectIcons[subject] || BiologyIcon
            const colors = subjectColors[subject] || subjectColors.biology

            return (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex items-center justify-between p-4 rounded-xl border-2 bg-white hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 text-sm mb-1 truncate">
                        {quiz.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span>{quiz.question_count || 0} questions</span>
                        {quiz.difficulty && (
                          <>
                            <span>•</span>
                            <Badge variant="default" className="text-xs capitalize bg-slate-200 text-slate-900">
                              {quiz.difficulty}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button asChild size="sm" className="ml-2">
                    <Link href={`/quiz/${quiz.id}`}>Start</Link>
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

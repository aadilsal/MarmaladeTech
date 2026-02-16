"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Progress } from "./progress"
import {
  BiologyIcon,
  ChemistryIcon,
  PhysicsIcon,
  EnglishIcon,
} from "../icons/SubjectIcons"

interface SubjectPerformance {
  subject: string
  score: number
  attempted: number
  icon?: any
  color: string
}

interface PerformanceStatsProps {
  subjectData?: SubjectPerformance[]
}

const defaultSubjects: SubjectPerformance[] = [
  { subject: "Biology", score: 0, attempted: 0, icon: BiologyIcon, color: "text-green-600" },
  { subject: "Chemistry", score: 0, attempted: 0, icon: ChemistryIcon, color: "text-purple-600" },
  { subject: "Physics", score: 0, attempted: 0, icon: PhysicsIcon, color: "text-blue-600" },
  { subject: "English", score: 0, attempted: 0, icon: EnglishIcon, color: "text-orange-600" },
]

export function PerformanceStats({ subjectData }: PerformanceStatsProps) {
  const subjects = subjectData && subjectData.length > 0 ? subjectData : defaultSubjects

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-lg">Subject-wise Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subjects.map((subject) => {
            const Icon = subject.icon
            const percentage = subject.attempted > 0 
              ? Math.round((subject.score / subject.attempted) * 100) 
              : 0

            return (
              <div key={subject.subject} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className={`w-4 h-4 ${subject.color}`} />}
                    <span className="text-sm font-medium text-slate-700">
                      {subject.subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">
                      {subject.attempted} questions
                    </span>
                    <span className={`text-sm font-bold ${subject.color}`}>
                      {percentage}%
                    </span>
                  </div>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2"
                />
              </div>
            )
          })}
          
          {subjects.every(s => s.attempted === 0) && (
            <div className="text-center py-4 text-slate-500 text-sm">
              Complete quizzes to see your subject-wise performance
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

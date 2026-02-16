"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Progress } from "./progress"
import { Badge } from "./badge"
import { TrophyIcon } from "../icons/SubjectIcons"

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress?: number
  maxProgress?: number
}

interface AchievementsSectionProps {
  totalAttempts?: number
  totalCorrect?: number
  streak?: number
}

export function AchievementsSection({ 
  totalAttempts = 0, 
  totalCorrect = 0,
  streak = 0 
}: AchievementsSectionProps) {
  const achievements: Achievement[] = [
    {
      id: "first-quiz",
      title: "First Steps",
      description: "Complete your first quiz",
      icon: "🎯",
      unlocked: totalAttempts >= 1,
    },
    {
      id: "streak-3",
      title: "Getting Consistent",
      description: "Maintain a 3-day streak",
      icon: "🔥",
      unlocked: streak >= 3,
      progress: Math.min(streak, 3),
      maxProgress: 3,
    },
    {
      id: "100-questions",
      title: "Century",
      description: "Answer 100 questions correctly",
      icon: "💯",
      unlocked: totalCorrect >= 100,
      progress: Math.min(totalCorrect, 100),
      maxProgress: 100,
    },
    {
      id: "perfect-score",
      title: "Perfectionist",
      description: "Score 100% on any quiz",
      icon: "⭐",
      unlocked: false, // Would need backend data
    },
  ]

  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-amber-600" />
            Achievements
          </CardTitle>
          <Badge variant="default" className="bg-slate-200 text-slate-900">
            {unlockedCount}/{achievements.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {achievements.slice(0, 2).map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                achievement.unlocked
                  ? "bg-amber-50 border-amber-200 shadow-sm"
                  : "bg-slate-50 border-slate-200 opacity-60"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{achievement.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-slate-900 mb-1">
                    {achievement.title}
                  </h4>
                  <p className="text-xs text-slate-600 mb-2">
                    {achievement.description}
                  </p>
                  {!achievement.unlocked && achievement.maxProgress && (
                    <div className="space-y-1">
                      <Progress
                        value={((achievement.progress || 0) / achievement.maxProgress) * 100}
                        className="h-1.5"
                      />
                      <p className="text-xs text-slate-500">
                        {achievement.progress}/{achievement.maxProgress}
                      </p>
                    </div>
                  )}
                  {achievement.unlocked && (
                    <Badge variant="default" className="bg-amber-600 text-xs">
                      Unlocked
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Button } from "./button"
import Link from "next/link"
import { motion } from "framer-motion"

interface QuickAction {
  title: string
  description: string
  icon: string
  href: string
  variant?: "default" | "outline" | "secondary"
  color?: string
}

interface QuickActionsProps {
  hasInProgress?: boolean
  inProgressQuizId?: string
}

export function QuickActions({ hasInProgress, inProgressQuizId }: QuickActionsProps) {
  const actions: QuickAction[] = [
    hasInProgress
      ? {
          title: "Resume Quiz",
          description: "Continue where you left off",
          icon: "▶️",
          href: `/quiz/${inProgressQuizId}`,
          variant: "default",
          color: "bg-brand-600 hover:bg-brand-700",
        }
      : {
          title: "Random Quiz",
          description: "Surprise me with a quiz",
          icon: "🎲",
          href: "/quizzes?random=true",
          variant: "outline",
        },
    {
      title: "Daily Challenge",
      description: "Complete today's challenge",
      icon: "⚡",
      href: "/quizzes?filter=daily",
      variant: "outline",
    },
    {
      title: "Browse All",
      description: "Explore all available quizzes",
      icon: "📚",
      href: "/quizzes",
      variant: "outline",
    },
  ]

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action, idx) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Button
                asChild
                variant={action.variant}
                className={`w-full h-auto flex-col items-start p-4 ${action.color || ""}`}
              >
                <Link href={action.href}>
                  <span className="text-2xl mb-2">{action.icon}</span>
                  <span className="font-semibold block">{action.title}</span>
                  <span className="text-xs font-normal opacity-80">
                    {action.description}
                  </span>
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

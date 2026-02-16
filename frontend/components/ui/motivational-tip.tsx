"use client"

import { Card, CardContent } from "./card"
import { useState, useEffect } from "react"

const motivationalTips = [
  {
    quote: "Consistency beats intensity.",
    tip: "Study 20 minutes daily rather than 3 hours once a week.",
    icon: "🔥",
  },
  {
    quote: "Practice makes perfect.",
    tip: "The more MCQs you solve, the faster and more accurate you become.",
    icon: "🎯",
  },
  {
    quote: "Learn from mistakes.",
    tip: "Review wrong answers carefully - they're your best teachers.",
    icon: "💡",
  },
  {
    quote: "Break it down.",
    tip: "Master one topic at a time instead of rushing through everything.",
    icon: "📚",
  },
  {
    quote: "Stay focused.",
    tip: "Quality practice beats quantity. Focus on understanding concepts.",
    icon: "🧠",
  },
  {
    quote: "Track your progress.",
    tip: "Regular self-assessment helps identify weak areas early.",
    icon: "📊",
  },
]

export function MotivationalTip() {
  const [tip, setTip] = useState(motivationalTips[0])

  useEffect(() => {
    // Show a random tip each day
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    setTip(motivationalTips[dayOfYear % motivationalTips.length])
  }, [])

  return (
    <Card className="border-2 border-brand-200 bg-gradient-to-r from-brand-50 to-focus-50 overflow-hidden relative">
      {/* Decorative blob */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand-200 rounded-full blur-2xl opacity-40" />
      
      <CardContent className="pt-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className="text-4xl">{tip.icon}</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              {tip.quote}
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              {tip.tip}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

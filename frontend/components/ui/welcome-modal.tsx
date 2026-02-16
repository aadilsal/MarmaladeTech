"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./button"
import { Card } from "./card"
import {
  TargetIcon,
  StreakIcon,
  TrophyIcon,
} from "../icons/SubjectIcons"

interface WelcomeModalProps {
  username?: string
  onClose: () => void
}

const features = [
  {
    icon: TargetIcon,
    title: "Practice One MCQ at a Time",
    description: "Focused learning with instant feedback on every question",
    color: "text-brand-600",
    bg: "bg-brand-50",
  },
  {
    icon: StreakIcon,
    title: "Build Your Daily Streak",
    description: "Consistent practice leads to success. Start your streak today!",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: TrophyIcon,
    title: "Track Your Progress",
    description: "Comprehensive analytics to identify strengths and weaknesses",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
]

export function WelcomeModal({ username, onClose }: WelcomeModalProps) {
  const [step, setStep] = useState(0)

  const handleNext = () => {
    if (step < features.length - 1) {
      setStep(step + 1)
    } else {
      onClose()
    }
  }

  const handleSkip = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        style={{ width: '100%', maxWidth: '32rem' }}
      >
        <Card className="p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Welcome{username ? ` ${username}` : ""}! 🎉
              </h2>
              <p className="text-slate-600">
                Let's quickly show you around
              </p>
            </motion.div>
          </div>

          {/* Feature showcase */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ marginBottom: '2rem' }}
            >
              <div className={`${features[step].bg} rounded-2xl p-8 text-center`}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white mb-4">
                  {(() => {
                    const Icon = features[step].icon
                    return <Icon className={`w-8 h-8 ${features[step].color}`} />
                  })()}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {features[step].title}
                </h3>
                <p className="text-slate-700">
                  {features[step].description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {features.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === step
                    ? "w-8 bg-brand-600"
                    : "w-2 bg-slate-300"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              Skip
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              {step === features.length - 1 ? "Get Started" : "Next"}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

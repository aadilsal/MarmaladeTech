"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { fetchQuizzes } from "../services/api/quizzes"
import {
  BiologyIcon,
  ChemistryIcon,
  PhysicsIcon,
  EnglishIcon,
  LogicIcon,
  TargetIcon,
  StreakIcon,
  TrophyIcon,
} from "../components/icons/SubjectIcons"

const subjects = [
  {
    title: "Biology",
    slug: "biology",
    description: "Cell biology, genetics, biodiversity & bioenergetics",
    icon: BiologyIcon,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    title: "Chemistry",
    slug: "chemistry",
    description: "Organic, physical & inorganic chemistry concepts",
    icon: ChemistryIcon,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    title: "Physics",
    slug: "physics",
    description: "Mechanics, electricity, waves & modern physics",
    icon: PhysicsIcon,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    title: "English",
    slug: "english",
    description: "Vocabulary, comprehension & language skills",
    icon: EnglishIcon,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    title: "Logical Reasoning",
    slug: "logical",
    description: "Patterns, series & analytical thinking",
    icon: LogicIcon,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
  },
]

export default function HomePage() {
  const quizzesQuery = useQuery({ queryKey: ["quizzes"], queryFn: fetchQuizzes })
  const totalQuizzes = quizzesQuery.data?.length || 0
  const totalMcqs = quizzesQuery.data?.reduce((acc, quiz) => acc + (quiz.question_count || 0), 0) || 0

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Hero Section with Enhanced Gradient */}
      <section className="relative border-b">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {/* Badge with gradient */}
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-1.5 text-sm font-medium text-purple-700 mb-6 border border-purple-200">
                <StreakIcon className="w-4 h-4" />
                <span>🎯 MDCAT 2026 Preparation</span>
              </div>
              
              {/* Main heading with gradient text */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="text-slate-900">Practice MDCAT MCQs</span>{" "}
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  the Right Way
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-8 max-w-2xl">
                Master Pakistan's medical entry test with exam-accurate questions. 
                One focused MCQ at a time, instant feedback, zero distractions.
              </p>
              
              {/* Enhanced CTAs with gradients */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button asChild size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-600/50 transition-all duration-300">
                  <Link href="/quizzes">Start Practicing Free →</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50">
                  <Link href="/dashboard">View Your Dashboard</Link>
                </Button>
              </div>
              
              {/* Stats Row with enhanced design */}
              <div className="grid grid-cols-3 gap-6">
                <motion.div
                  as="div"
                  className="text-center sm:text-left p-4 rounded-xl bg-white/80 backdrop-blur-sm shadow-soft border border-purple-100"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                      <TrophyIcon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{totalMcqs.toLocaleString()}</p>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">Practice MCQs</p>
                </motion.div>
                
                <motion.div
                  as="div"
                  className="text-center sm:text-left p-4 rounded-xl bg-white/80 backdrop-blur-sm shadow-soft border border-green-100"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                      <TargetIcon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{totalQuizzes}</p>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">Topic Quizzes</p>
                </motion.div>
                
                <motion.div
                  as="div"
                  className="text-center sm:text-left p-4 rounded-xl bg-white/80 backdrop-blur-sm shadow-soft border border-blue-100"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                      <span className="text-2xl">✓</span>
                    </div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">100%</p>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">Free Access</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Quick Start Card with enhanced design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="shadow-soft-lg border-2 border-purple-100 bg-gradient-to-br from-white to-purple-50/30 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span className="text-2xl">🚀</span>
                    Quick Start Today
                  </CardTitle>
                  <CardDescription className="text-base">
                    Start with high-yield topics for maximum retention
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {subjects.slice(0, 3).map((subject, idx) => {
                    const Icon = subject.icon
                    return (
                      <Link
                        key={subject.slug}
                        href={`/mdcat/${subject.slug}-mcqs`}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 ${subject.borderColor} ${subject.bgColor} hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]`}
                      >
                        <div className={`p-2 rounded-lg bg-white shadow-sm ${subject.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 mb-0.5">{subject.title}</p>
                          <p className="text-sm text-slate-600 leading-snug">{subject.description}</p>
                        </div>
                      </Link>
                    )
                  })}
                  <Button asChild className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" size="lg">
                    <Link href="/quizzes">View All Subjects →</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Subject Cards Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Master All MDCAT Subjects
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Practice exam-accurate MCQs covering the complete MDCAT syllabus
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject, idx) => {
            const Icon = subject.icon
            return (
              <motion.div
                key={subject.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Link href={`/mdcat/${subject.slug}-mcqs`}>
                  <Card className="h-full border-2 card-interactive hover:border-brand-300">
                    <CardHeader>
                      <div className={`w-14 h-14 rounded-2xl ${subject.bgColor} ${subject.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <CardTitle className="text-xl">{subject.title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        {subject.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full group">
                        Practice {subject.title} MCQs
                        <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="bg-white border-y">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why Students Choose MDCAT Expert
            </h2>
            <p className="text-lg text-slate-600">
              Built specifically for serious MDCAT preparation
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Zero Clutter</h3>
              <p className="text-slate-600 leading-relaxed">
                Clean interface focused on one thing: helping you master MCQs. No ads, no distractions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-success-50 text-success-600 flex items-center justify-center mx-auto mb-4">
                <TargetIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Exam-Accurate</h3>
              <p className="text-slate-600 leading-relaxed">
                Questions mirror real MDCAT patterns. Practice with the same structure you'll face on exam day.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-focus-50 text-focus-600 flex items-center justify-center mx-auto mb-4">
                <StreakIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Build Daily Habits</h3>
              <p className="text-slate-600 leading-relaxed">
                Track streaks and progress. Small daily practice creates long-term retention and confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Block */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-slate max-w-none">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            How MDCAT Expert Helps You Score Higher
          </h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            The Medical and Dental College Admission Test (MDCAT) is Pakistan's gateway to top medical universities including 
            KEMU, King Edward Medical University, Nishtar Medical University, and all UHS-affiliated colleges. Success requires 
            consistent practice with <strong>exam-accurate MCQs</strong> that mirror the real test format.
          </p>
          
          <h3 className="text-xl font-semibold text-slate-900 mb-3">
            What Makes Our MCQ Platform Different?
          </h3>
          <ul className="space-y-2 text-slate-600 mb-6">
            <li className="flex items-start">
              <span className="text-brand-600 mr-2">✓</span>
              <span><strong>Subject-wise coverage:</strong> Biology, Chemistry, Physics, English, and Logical Reasoning</span>
            </li>
            <li className="flex items-start">
              <span className="text-brand-600 mr-2">✓</span>
              <span><strong>Instant feedback:</strong> Learn from mistakes immediately with detailed explanations</span>
            </li>
            <li className="flex items-start">
              <span className="text-brand-600 mr-2">✓</span>
              <span><strong>Mobile-optimized:</strong> Practice anywhere, anytime on your phone or tablet</span>
            </li>
            <li className="flex items-start">
              <span className="text-brand-600 mr-2">✓</span>
              <span><strong>Progress tracking:</strong> Monitor improvement and identify weak areas</span>
            </li>
          </ul>

          <p className="text-slate-600 leading-relaxed">
            Whether you're preparing for UHS MDCAT, NUMS entry test, or any medical college entrance exam in Pakistan, 
            our platform provides the focused practice you need. Start today with free access to thousands of MCQs.
          </p>
        </div>
      </section>
    </div>
  )
}

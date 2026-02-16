"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { fetchCurrentUserProfile } from "../../services/api/profiles"
import { fetchDashboardSummary } from "../../services/api/dashboard"
import { fetchSubjectPerformance } from "../../services/api/analytics"
import { useUserFromToken } from "../../hooks/useUserFromToken"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import { Skeleton } from "../../components/ui/skeleton"
import { EmptyState } from "../../components/ui/empty-state"
import { clearAllLocalResults, listSavedResults } from "../../features/quiz/attemptStorage"

export default function ProfilePage() {
  const user = useUserFromToken()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const profileQuery = useQuery({ 
    queryKey: ["current-profile"],
    queryFn: fetchCurrentUserProfile,
    enabled: !!user?.user_id,
  })
  const summaryQuery = useQuery({ queryKey: ["dashboard-summary"], queryFn: fetchDashboardSummary })
  const subjectQuery = useQuery({ queryKey: ["subject-performance"], queryFn: fetchSubjectPerformance })

  const profile = profileQuery.data
  const totalQuestions = summaryQuery.data?.total_questions || 0
  const overallAccuracy = summaryQuery.data?.accuracy || 0

  const subjectAccuracy = useMemo(() => {
    return (subjectQuery.data || []).map(item => ({
      subject: item.subject,
      accuracy: item.accuracy,
      questions: item.total || 0,
    }))
  }, [subjectQuery.data])

  const allResults = listSavedResults()
  const totalAttempts = allResults.length
  const totalCorrect = allResults.reduce((acc, r) => acc + ((r as any).score || 0), 0)

  // Performance insights
  const bestSubject = subjectAccuracy.length > 0 ? subjectAccuracy.reduce((a, b) => (a.accuracy > b.accuracy ? a : b)) : null
  const needsWork = subjectAccuracy.length > 0 ? subjectAccuracy.reduce((a, b) => (a.accuracy < b.accuracy ? a : b)) : null

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Account & Analytics</h1>
            <p className="text-slate-600 mt-2">
              Manage your profile and review your detailed performance analytics
            </p>
          </div>
        </motion.div>

        {/* User Account Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Account Information - Left Side */}
          <Card className="lg:col-span-2 border-2">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-2xl">Account Information</CardTitle>
                <CardDescription>Your profile details and account settings</CardDescription>
              </div>
              {profile && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/profile/edit">Edit</Link>
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {profileQuery.isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : profile ? (
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-lg p-4 border">
                    <p className="text-sm text-slate-600 mb-1">Username</p>
                    <p className="text-lg font-semibold text-slate-900">{profile.user.username}</p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 border">
                    <p className="text-sm text-slate-600 mb-1">Email</p>
                    <p className="text-lg font-semibold text-slate-900">{profile.user.email || "Not set"}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-slate-50 rounded-lg p-4 border">
                      <p className="text-sm text-slate-600 mb-1">First Name</p>
                      <p className="text-lg font-semibold text-slate-900">{profile.user.first_name || "Not set"}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border">
                      <p className="text-sm text-slate-600 mb-1">Last Name</p>
                      <p className="text-lg font-semibold text-slate-900">{profile.user.last_name || "Not set"}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-slate-50 rounded-lg p-4 border">
                      <p className="text-sm text-slate-600 mb-1">Location</p>
                      <p className="text-lg font-semibold text-slate-900">{profile.location || "Not specified"}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border">
                      <p className="text-sm text-slate-600 mb-1">Gender</p>
                      <p className="text-lg font-semibold text-slate-900">{profile.gender || "Not specified"}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 border">
                    <p className="text-sm text-slate-600 mb-1">Bio</p>
                    <p className="text-base text-slate-900">{profile.bio || "No bio yet"}</p>
                  </div>
                </div>
              ) : (
                <EmptyState title="Profile not found" description="Unable to load profile information." />
              )}
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card className="border-2 bg-gradient-to-br from-brand-50 to-focus-50">
            <CardHeader>
              <CardTitle>Your Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Attempts</p>
                <p className="text-4xl font-bold text-brand-600">{totalAttempts}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Questions Solved</p>
                <p className="text-2xl font-bold text-slate-900">{totalQuestions}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Correct Answers</p>
                <p className="text-2xl font-bold text-success-600">{totalCorrect}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Performance Analytics */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Overall Performance</CardTitle>
            <CardDescription>Your cumulative accuracy across all attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-end justify-between mb-3">
                  <p className="text-lg font-semibold text-slate-900">Overall Accuracy</p>
                  <p className="text-5xl font-bold text-brand-600">{overallAccuracy}%</p>
                </div>
                <Progress value={overallAccuracy} variant="default" />
              </div>

              {bestSubject && needsWork && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-success-50 rounded-lg p-4 border-2 border-success-200">
                    <p className="text-sm text-success-700 font-semibold mb-1">📈 Your Strength</p>
                    <p className="text-2xl font-bold text-success-700 mb-2">{bestSubject.subject}</p>
                    <p className="text-sm text-success-600">{bestSubject.accuracy}% accuracy</p>
                  </div>

                  <div className="bg-warning-50 rounded-lg p-4 border-2 border-warning-200">
                    <p className="text-sm text-warning-700 font-semibold mb-1">📍 Needs Focus</p>
                    <p className="text-2xl font-bold text-warning-700 mb-2">{needsWork.subject}</p>
                    <p className="text-sm text-warning-600">{needsWork.accuracy}% accuracy</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subject-Wise Breakdown */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Subject-Wise Performance</CardTitle>
            <CardDescription>How you're performing in each subject</CardDescription>
          </CardHeader>
          <CardContent>
            {subjectAccuracy.length === 0 ? (
              <EmptyState
                title="No performance data yet"
                description="Complete a quiz to see your subject-wise performance."
              />
            ) : (
              <div className="space-y-4">
                {subjectAccuracy.map((item, idx) => (
                  <motion.div
                    key={item.subject}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-slate-900 capitalize">{item.subject}</p>
                        <p className="text-sm text-slate-600">{item.questions} questions attempted</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-brand-600">{item.accuracy}%</p>
                      </div>
                    </div>
                    <Progress value={item.accuracy} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Management Section */}
        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Data Management</CardTitle>
            <CardDescription>Clear or reset your local data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-red-800">
              Be careful with these actions. Clearing data cannot be undone.
            </p>

            {!showDeleteConfirm ? (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full"
              >
                Clear All Local Data
              </Button>
            ) : (
              <div className="space-y-3 p-4 bg-white rounded-lg border-2 border-red-300">
                <p className="font-semibold text-slate-900">
                  Are you sure? This will delete all your progress stored on this device.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      clearAllLocalResults()
                      window.location.reload()
                    }}
                    className="flex-1"
                  >
                    Yes, Delete All
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <p className="text-xs text-red-700">
              ℹ️ This only clears data stored on this device. Your server-synced data remains safe.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

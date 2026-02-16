"use client"

import { motion } from "framer-motion"
import { useSubjectPerformance, useProgressTrend } from "../../hooks/useAnalytics"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Skeleton } from "../../components/ui/skeleton"
import { BarChart, LineChart, StatGrid } from "../../components/ui/charts"
import { TrendingUp, Target, Activity } from "lucide-react"

export default function AnalyticsPage() {
  const { data: subjectData, isLoading: subjectLoading } = useSubjectPerformance()
  const { data: trendData, isLoading: trendLoading } = useProgressTrend()

  const isLoading = subjectLoading || trendLoading

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            Performance Analytics
          </h1>
          <p className="text-slate-600 mt-2">
            Track your progress and identify areas for improvement
          </p>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="grid lg:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <Card key={i} className="border-2">
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Grid */}
            {subjectData && subjectData.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <StatGrid
                  data={[
                    {
                      label: "Avg Accuracy",
                      value: `${Math.round(subjectData.reduce((sum, s) => sum + s.accuracy, 0) / subjectData.length)}%`,
                      color: "blue",
                    },
                    {
                      label: "Total Practice",
                      value: subjectData.reduce((sum, s) => sum + s.total, 0).toString(),
                      color: "green",
                    },
                    {
                      label: "Correct Answers",
                      value: subjectData.reduce((sum, s) => sum + s.correct, 0).toString(),
                      color: "purple",
                    },
                  ]}
                />
              </motion.div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Subject Performance */}
              {subjectData && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <Card className="border-2 h-full">
                    <CardHeader>
                      <CardTitle>Subject Performance</CardTitle>
                      <CardDescription>Accuracy by subject</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BarChart
                        data={subjectData.map((s: any) => ({
                          name: s.subject,
                          value: s.accuracy,
                        }))}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Progress Trend */}
              {trendData && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                  <Card className="border-2 h-full">
                    <CardHeader>
                      <CardTitle>Progress Trend</CardTitle>
                      <CardDescription>Last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <LineChart
                        data={trendData.map((d: any) => ({
                          date: d.date,
                          value: d.accuracy,
                        }))}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Detailed Stats */}
            {subjectData && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Subject Breakdown</CardTitle>
                    <CardDescription>Detailed performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {subjectData.map((subject: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <p className="font-semibold text-slate-900">{subject.subject}</p>
                            <span className="text-lg font-bold text-blue-600">{subject.accuracy}%</span>
                          </div>
                          <div className="space-y-2 text-sm text-slate-600">
                            <p>Attempts: {subject.total}</p>
                            <p>Correct: {subject.correct}</p>
                          </div>
                          <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${subject.accuracy}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Recommendations */}
            {subjectData && subjectData.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-2 bg-amber-50">
                  <CardHeader>
                    <CardTitle className="text-lg">💡 Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-slate-700">
                    <p className="text-sm">
                      📚 Focus on <strong>{subjectData.sort((a, b) => a.accuracy - b.accuracy)[0].subject}</strong> - it
                      has the lowest accuracy ({subjectData.sort((a, b) => a.accuracy - b.accuracy)[0].accuracy}%)
                    </p>
                    <p className="text-sm">
                      ✨ You're excelling in <strong>{subjectData.sort((a, b) => b.accuracy - a.accuracy)[0].subject}</strong> -
                      keep up the momentum!
                    </p>
                    <p className="text-sm">
                      📈 Practice consistently to improve your overall accuracy. Aim for 80%+ on each subject.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

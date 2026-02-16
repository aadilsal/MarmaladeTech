"use client"

import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import Link from "next/link"
import { fetchLeaderboard } from "../../services/api/leaderboard"
import { useUserFromToken } from "../../hooks/useUserFromToken"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Skeleton } from "../../components/ui/skeleton"
import { Badge } from "../../components/ui/badge"
import { Trophy, Medal } from "lucide-react"

export default function LeaderboardPage() {
  const { user } = useUserFromToken()
  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboard,
  })

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Medal className="w-5 h-5 text-orange-400" />
      default:
        return <span className="text-slate-400 font-semibold">{rank}</span>
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case 2:
        return "bg-gray-100 text-gray-800 border-gray-200"
      case 3:
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Global Leaderboard
            </h1>
            <p className="text-slate-600 mt-2">
              Top performers on MDCAT Expert. See how you rank among other students.
            </p>
          </div>
        </motion.div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Top 50 Players</CardTitle>
            <CardDescription>Ranked by total score across all quizzes</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                Failed to load leaderboard. Please try again.
              </div>
            ) : !leaderboard || leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-lg">No players yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Rank</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Username</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-900">Total Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, idx) => {
                      const isCurrentUser = user?.username === entry.username
                      const rowClasses = isCurrentUser
                        ? "bg-blue-50 border-l-4 border-l-blue-600"
                        : idx % 2 === 0
                        ? "bg-white"
                        : "bg-slate-50"

                      return (
                        <tr
                          key={entry.username}
                          className={`${rowClasses} border-b border-slate-200 hover:bg-slate-100 transition-colors`}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8">
                                {getMedalIcon(entry.rank)}
                              </div>
                              <Badge className={getRankBadgeColor(entry.rank)}>
                                #{entry.rank}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-slate-900">
                              {entry.username}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                                  You
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="text-lg font-bold text-slate-900">
                              {entry.total_score}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* About Section */}
        <Card className="mt-8 border-2">
          <CardHeader>
            <CardTitle>About This Leaderboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            <p>
              The leaderboard updates automatically as students complete quizzes. Your ranking is based on
              your total score across all attempts.
            </p>
            <div>
              <p className="font-semibold text-slate-900 mb-2">How to climb the ranks:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Complete quizzes consistently</li>
                <li>Aim for high accuracy on each attempt</li>
                <li>Focus on different subjects to build well-rounded knowledge</li>
                <li>Review explanations to improve your score</li>
              </ul>
            </div>
            <p className="text-xs text-slate-500 italic">
              ⚠️ The leaderboard shows top 50 players. Refresh the page to see the latest rankings.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

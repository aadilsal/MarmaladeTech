import { api } from "./client"
import { z } from "zod"

/**
 * Leaderboard Service
 * Fetches current rankings and top user scores
 */

const leaderboardEntrySchema = z.object({
  username: z.string(),
  rank: z.number(),
  total_score: z.number(),
})

const leaderboardListSchema = z.array(leaderboardEntrySchema)

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>

/**
 * Fetch leaderboard (top 50 users by total score)
 * This is read-only, available to all users
 * 
 * Returns: Array of top users with rank and total score
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await api.get("leaderboard/")
  return leaderboardListSchema.parse(res.data)
}

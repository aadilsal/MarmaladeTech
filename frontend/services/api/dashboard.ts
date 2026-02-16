import { api } from "./client"
import { dashboardSummarySchema, recentAttemptListSchema } from "../../types/api"

export async function fetchDashboardSummary() {
  const res = await api.get("dashboard/summary/")
  return dashboardSummarySchema.parse(res.data)
}

export async function fetchRecentAttempts() {
  const res = await api.get("dashboard/recent-attempts/")
  return recentAttemptListSchema.parse(res.data)
}

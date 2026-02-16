import { api } from "./client"
import { subjectPerformanceListSchema, progressTrendListSchema } from "../../types/api"

export async function fetchSubjectPerformance() {
  const res = await api.get("analytics/subject-performance/")
  return subjectPerformanceListSchema.parse(res.data)
}

export async function fetchProgressTrend() {
  const res = await api.get("analytics/progress-trend/")
  return progressTrendListSchema.parse(res.data)
}

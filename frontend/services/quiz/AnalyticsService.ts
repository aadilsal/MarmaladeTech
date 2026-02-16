import { api } from "../api/client"
import { progressTrendListSchema, subjectPerformanceListSchema } from "../../types/api"

export class AnalyticsService {
  async subjectPerformance() {
    const res = await api.get("analytics/subject-performance/")
    return subjectPerformanceListSchema.parse(res.data)
  }

  async progressTrend() {
    const res = await api.get("analytics/progress-trend/")
    return progressTrendListSchema.parse(res.data)
  }
}

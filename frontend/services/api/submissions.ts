import { api } from "./client"
import { submissionListSchema, submissionSchema } from "../../types/api"

export async function fetchSubmissions() {
  const res = await api.get("submissions/")
  if (Array.isArray(res.data)) {
    return submissionListSchema.parse(res.data)
  }
  return submissionListSchema.parse(res.data.results || [])
}

export async function fetchSubmission(id: string | number) {
  const res = await api.get(`submissions/${id}/`)
  return submissionSchema.parse(res.data)
}

export async function createSubmission(quizId: number, score: number) {
  const res = await api.post("submissions/", { quiz: quizId, score })
  return submissionSchema.parse(res.data)
}

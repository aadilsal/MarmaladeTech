import { api } from "./client"
import { z } from "zod"

/**
 * AI Explanation Service
 * Handles asynchronous AI explanation generation for quiz questions.
 * 
 * Workflow:
 * 1. User completes quiz and views results
 * 2. User clicks "Get Explanation" on a question
 * 3. Frontend calls generateExplanation() → backend queues task
 * 4. Frontend polls getTaskStatus() to track progress
 * 5. When done, explanation appears in results UI
 */

// Task status schema from backend
const explanationTaskSchema = z.object({
  id: z.number(),
  task_id: z.string(),
  question: z.number(),
  user: z.object({
    id: z.number(),
    username: z.string(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
  }),
  status: z.enum(["QUEUED", "RUNNING", "SUCCESS", "FAILURE"]),
  result: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
  success: z.boolean().nullable().optional(),
  cost: z.number().nullable().optional(),
  generated_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

const explanationTaskListSchema = z.array(explanationTaskSchema)

const generateExplanationResponseSchema = z.object({
  task_id: z.string(),
  status: z.literal("queued"),
})

const taskStatusResponseSchema = z.object({
  task_id: z.string(),
  state: z.enum(["QUEUED", "RUNNING", "SUCCESS", "FAILURE"]),
  result: z.any().optional(),
})

export type ExplanationTask = z.infer<typeof explanationTaskSchema>
export type GenerateExplanationResponse = z.infer<typeof generateExplanationResponseSchema>
export type TaskStatusResponse = z.infer<typeof taskStatusResponseSchema>

/**
 * Request AI explanation generation for a question
 * Rate limited to 10 per hour per user
 * User must have completed the quiz first
 * 
 * Returns task_id for polling
 */
export async function generateExplanation(questionId: number): Promise<GenerateExplanationResponse> {
  const res = await api.post(`questions/${questionId}/generate-explanation/`)
  return generateExplanationResponseSchema.parse(res.data)
}

/**
 * Get user's explanation tasks (paginated)
 * Users see only their own tasks
 * Staff can see all tasks
 */
export async function fetchExplanationTasks(): Promise<ExplanationTask[]> {
  const res = await api.get("tasks/")
  return explanationTaskListSchema.parse(res.data.results || res.data)
}

/**
 * Get single explanation task details
 * Includes current status and result if available
 */
export async function fetchExplanationTask(taskId: number): Promise<ExplanationTask> {
  const res = await api.get(`tasks/${taskId}/`)
  return explanationTaskSchema.parse(res.data)
}

/**
 * Poll task status by task_id (Celery task ID)
 * Used to monitor async task progress
 * 
 * Returns: { task_id, state: "QUEUED" | "RUNNING" | "SUCCESS" | "FAILURE", result? }
 */
export async function getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  const res = await api.get(`tasks/status/${taskId}/`)
  return taskStatusResponseSchema.parse(res.data)
}

/**
 * Retry explanation generation for a failed task
 * Admin or task owner only
 */
export async function requeueExplanation(taskId: number): Promise<GenerateExplanationResponse> {
  const res = await api.post(`tasks/${taskId}/requeue/`)
  return generateExplanationResponseSchema.parse(res.data)
}

/**
 * Helper: Poll task status until complete
 * Useful for frontend to wait for explanation generation
 */
export async function pollUntilComplete(
  taskId: string,
  maxAttempts = 120, // 2 minutes with 1s polls
  pollIntervalMs = 1000,
): Promise<TaskStatusResponse | null> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const status = await getTaskStatus(taskId)
      
      if (status.state === "SUCCESS" || status.state === "FAILURE") {
        return status
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs))
    } catch (error: any) {
      // Task not ready yet
      if (error.response?.status === 404) {
        await new Promise(resolve => setTimeout(resolve, pollIntervalMs))
        continue
      }
      throw error
    }
  }
  
  // Timeout
  return null
}

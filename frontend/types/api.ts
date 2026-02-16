import { z } from "zod"

export const choiceSchema = z.object({
  id: z.number(),
  text: z.string(),
})

export const choiceReviewSchema = choiceSchema.extend({
  is_correct: z.boolean(),
})

export const questionSchema = z.object({
  id: z.number(),
  text: z.string(),
  image: z.string().nullable().optional(),
  choices: z.array(choiceSchema),
})

export const questionReviewSchema = z.object({
  id: z.number(),
  text: z.string(),
  image: z.string().nullable().optional(),
  choices: z.array(choiceReviewSchema),
  selected_choice_id: z.number().nullable().optional(),
  correct_choice_id: z.number().nullable().optional(),
  explanation: z.string().nullable().optional(),
  ai_explanation: z.string().nullable().optional(),
  ai_generated_at: z.string().nullable().optional(),
  ai_cost: z.number().nullable().optional(),
  ai_model: z.string().nullable().optional(),
  ai_error: z.string().nullable().optional(),
})

export const quizSummarySchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  created_at: z.string(),
  question_count: z.number(),
})

export const quizDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  created_at: z.string(),
  questions: z.array(questionSchema).default([]),
})

export const quizListSchema = z.array(quizSummarySchema)

export const submissionSchema = z.object({
  id: z.number(),
  user: z
    .object({
      id: z.number(),
      username: z.string(),
      first_name: z.string().nullable().optional(),
      last_name: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
    })
    .optional(),
  quiz: z.number(),
  score: z.number(),
  submitted_at: z.string(),
  total_questions: z.number().optional(),
})

export const submissionListSchema = z.array(submissionSchema)

export const profileSchema = z.object({
  user: z.object({
    id: z.number(),
    username: z.string(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
  }),
  bio: z.string().nullable().optional(),
  profile_img: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
})

export const profileListSchema = z.array(profileSchema)

export const attemptStartSchema = z.object({
  id: z.number(),
  quiz: z.number(),
  status: z.string(),
  started_at: z.string(),
  submitted_at: z.string().nullable().optional(),
  score: z.number().nullable().optional(),
  total_questions: z.number().nullable().optional(),
  time_taken_seconds: z.number().nullable().optional(),
})

export const attemptQuestionsSchema = z.object({
  attempt_id: z.number(),
  quiz_id: z.number(),
  questions: z.array(questionSchema),
})

export const attemptSubmitSchema = z.object({
  attempt_id: z.number(),
  quiz_id: z.number(),
  score: z.number(),
  total_questions: z.number(),
  submitted_at: z.string(),
})

export const attemptResultSchema = z.object({
  attempt_id: z.number(),
  quiz_id: z.number(),
  quiz_title: z.string(),
  category: z.string().nullable().optional(),
  score: z.number(),
  total_questions: z.number(),
  accuracy: z.number(),
  submitted_at: z.string().nullable().optional(),
  time_taken_seconds: z.number().nullable().optional(),
})

export const attemptReviewSchema = z.object({
  attempt_id: z.number(),
  quiz_id: z.number(),
  questions: z.array(questionReviewSchema),
})

export const attemptAnalysisSchema = z.object({
  attempt_id: z.number(),
  quiz_id: z.number(),
  correct: z.number(),
  incorrect: z.number(),
  total_questions: z.number(),
  accuracy: z.number(),
})

export const dashboardSummarySchema = z.object({
  total_attempts: z.number(),
  total_questions: z.number(),
  total_score: z.number(),
  accuracy: z.number(),
  last_attempt: z
    .object({
      attempt_id: z.number(),
      quiz_id: z.number(),
      quiz_title: z.string(),
      score: z.number().nullable().optional(),
      total_questions: z.number().nullable().optional(),
      submitted_at: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
})

export const recentAttemptSchema = z.object({
  attempt_id: z.number(),
  quiz_id: z.number(),
  quiz_title: z.string(),
  score: z.number().nullable().optional(),
  total_questions: z.number().nullable().optional(),
  submitted_at: z.string().nullable().optional(),
})

export const recentAttemptListSchema = z.array(recentAttemptSchema)

export const subjectPerformanceSchema = z.object({
  subject: z.string(),
  correct: z.number(),
  total: z.number(),
  accuracy: z.number(),
})

export const subjectPerformanceListSchema = z.array(subjectPerformanceSchema)

export const progressTrendSchema = z.object({
  date: z.string(),
  correct: z.number(),
  total: z.number(),
  accuracy: z.number(),
})

export const progressTrendListSchema = z.array(progressTrendSchema)

export type Choice = z.infer<typeof choiceSchema>
export type Question = z.infer<typeof questionSchema>
export type QuizSummary = z.infer<typeof quizSummarySchema>
export type QuizDetail = z.infer<typeof quizDetailSchema>
export type Submission = z.infer<typeof submissionSchema>
export type Profile = z.infer<typeof profileSchema>
export type AttemptStart = z.infer<typeof attemptStartSchema>
export type AttemptQuestions = z.infer<typeof attemptQuestionsSchema>
export type AttemptSubmit = z.infer<typeof attemptSubmitSchema>
export type AttemptResult = z.infer<typeof attemptResultSchema>
export type AttemptReview = z.infer<typeof attemptReviewSchema>
export type AttemptAnalysis = z.infer<typeof attemptAnalysisSchema>

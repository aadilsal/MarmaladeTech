/**
 * 🔗 API Service Layer Index
 * 
 * This file documents all API services and their purposes.
 * Each service corresponds to a specific set of Django backend views.
 * 
 * RULE: One file per domain, one function per endpoint.
 * 
 * Import guide:
 * import { getCurrentUser, login, logout } from '@/services/api/auth'
 * import { fetchQuizzes, fetchQuiz, startQuizAttempt } from '@/services/api/quizzes'
 * import { fetchLeaderboard } from '@/services/api/leaderboard'
 * // etc.
 */

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * File: services/api/auth.ts
 * 
 * ⚠️ CRITICAL functions:
 * - getCurrentUser() ← Call this on app initialization
 *   Returns: { id, username, email, first_name, last_name } or null
 *   This is the SOURCE OF TRUTH for auth state.
 * 
 * Functions:
 * - login(username, password) - JWT login with httpOnly cookies
 * - register(username, email, password) - Create user account
 * - logout() - Logout and blacklist token
 * - getCurrentUser() - Get authenticated user (401 if not logged in)
 * 
 * Backend endpoints:
 * POST   /api/auth/login/     - Authenticate user
 * POST   /api/auth/register/  - Create account
 * POST   /api/auth/logout/    - Logout
 * GET    /api/auth/me/        - Get current user (⚠️ CRITICAL)
 * POST   /api/auth/refresh/   - Refresh token (auto-handled)
 */
export * from './auth'

/**
 * File: services/api/password.ts
 * 
 * Functions:
 * - requestPasswordReset(email) - Request password reset email
 * - confirmPasswordReset(uid, token, newPassword) - Confirm reset with token
 * 
 * Backend endpoints:
 * POST   /api/auth/password-reset/          - Request reset email
 * POST   /api/auth/password-reset/confirm/  - Confirm reset
 */
export * from './password'

/**
 * File: services/api/users.ts
 * 
 * Functions:
 * - searchUsers(query) - Search users by username/name
 * - deleteAccount() - Delete current user's account
 * 
 * Backend endpoints:
 * GET    /search-users?q={query}  - Search users
 * POST   /user/delete             - Delete account
 */
export * from './users'

// ============================================================================
// QUIZZES
// ============================================================================

/**
 * File: services/api/quizzes.ts
 * 
 * Functions:
 * - fetchQuizzes() - List quizzes with filtering
 * - fetchQuiz(id) - Get quiz detail with all questions
 * 
 * Backend endpoints:
 * GET    /api/quizzes/          - List (supports: subject, chapter, difficulty)
 * GET    /api/quizzes/{id}/     - Detail with full questions
 */
export * from './quizzes'

// ============================================================================
// QUIZ ATTEMPTS (Core Quiz Workflow)
// ============================================================================

/**
 * File: services/api/attempts.ts
 * 
 * WORKFLOW:
 * 1. startQuizAttempt(quizId) → Create attempt record
 * 2. fetchAttemptQuestions(attemptId) → Get questions for attempt
 * 3. saveAttemptAnswer(attemptId, questionId, choiceId) → Repeat for each answer
 * 4. submitAttempt(attemptId, timeTakenSeconds) → Submit & calculate score
 * 5. fetchAttemptResult(attemptId) → Show results
 * 6. fetchAttemptReview(attemptId) → Show detailed review with answers
 * 
 * Functions:
 * - startQuizAttempt(quizId) - Create new attempt
 * - fetchAttemptQuestions(attemptId) - Get questions (optional, can use fetchQuiz too)
 * - saveAttemptAnswer(attemptId, questionId, choiceId) - Save answer
 * - submitAttempt(attemptId, timeTaken?) - Submit & finalize
 * - fetchAttemptResult(attemptId) - Get result score/accuracy
 * - fetchAttemptReview(attemptId) - Get detailed review with explanations
 * 
 * Backend endpoints:
 * POST   /api/quizzes/{id}/start/        - Create attempt
 * GET    /api/attempts/{id}/questions/   - Get attempt's questions
 * POST   /api/attempts/{id}/answer/      - Save answer
 * POST   /api/attempts/{id}/submit/      - Submit & score
 * GET    /api/attempts/{id}/results/     - Get results
 * GET    /api/attempts/{id}/review/      - Get review with corrections
 * GET    /api/attempts/{id}/analysis/    - Get breakdown stats
 */
export * from './attempts'

// ============================================================================
// EXPLANATIONS (AI)
// ============================================================================

/**
 * File: services/api/explanations.ts
 * 
 * WORKFLOW:
 * 1. generateExplanation(questionId) → Request async generation
 * 2. Poll getTaskStatus(taskId) → Check progress
 * 3. When status === "SUCCESS", display explanation
 * 
 * Functions:
 * - generateExplanation(questionId) - Request explanation generation
 * - fetchExplanationTask(taskId) - Get task details
 * - getTaskStatus(taskId) - Poll task status
 * - pollUntilComplete(taskId) - Helper to wait for completion
 * - requeueExplanation(taskId) - Retry failed task
 * 
 * Backend endpoints:
 * POST   /api/questions/{id}/generate-explanation/ - Request explanation
 * GET    /api/tasks/ - List user's tasks
 * GET    /api/tasks/{id}/ - Get task status
 * GET    /api/tasks/{taskId}/ - Poll by Celery task_id
 * POST   /api/tasks/{id}/requeue/ - Retry failed task
 */
export * from './explanations'

// ============================================================================
// DASHBOARD & ANALYTICS
// ============================================================================

/**
 * File: services/api/dashboard.ts
 * 
 * Functions:
 * - fetchDashboardSummary() - User stats overview
 * - fetchRecentAttempts() - Last 5 attempts
 * 
 * Backend endpoints:
 * GET    /api/dashboard/summary/           - User stats
 * GET    /api/dashboard/recent-attempts/   - Recent quiz attempts
 */
export * from './dashboard'

/**
 * File: services/api/analytics.ts
 * 
 * Functions:
 * - fetchSubjectPerformance() - Accuracy per subject
 * - fetchProgressTrend() - Daily accuracy trend
 * 
 * Backend endpoints:
 * GET    /api/analytics/subject-performance/ - Per-subject accuracy
 * GET    /api/analytics/progress-trend/      - Daily trend data
 */
export * from './analytics'

// ============================================================================
// LEADERBOARD
// ============================================================================

/**
 * File: services/api/leaderboard.ts
 * 
 * Functions:
 * - fetchLeaderboard() - Top 50 users by score
 * 
 * Backend endpoints:
 * GET    /api/leaderboard/ - Top users ranking
 */
export * from './leaderboard'

// ============================================================================
// PROFILES
// ============================================================================

/**
 * File: services/api/profiles.ts
 * 
 * IMPORTANT DEPENDENCY:
 * - Call getCurrentUser() from auth first to get user ID
 * - Then use fetchProfile(userId) to get profile
 * 
 * Functions:
 * - fetchProfile(userId) - Get user's profile
 * - fetchCurrentUserProfile() - Get current user's profile
 * - updateProfile(data) - Update current user's profile
 * - fetchProfiles(page) - List all profiles (admin)
 * 
 * Backend endpoints:
 * GET    /api/profiles/ - List profiles (paginated)
 * GET    /api/profiles/by-user/{user_id}/ - Get profile
 * GET    /api/profiles/me/ - Get current user's profile (if available)
 * PATCH  /api/profiles/me/ - Update current user (if available)
 */
export * from './profiles'

// ============================================================================
// BLOGS
// ============================================================================

/**
 * File: services/api/blogs.ts
 * 
 * Functions:
 * - fetchBlogs(page) - List public blogs (paginated)
 * - fetchBlog(id) - Get single blog post
 * 
 * Backend endpoints:
 * GET    /api/blogs/ - List public blogs
 * GET    /api/blogs/{id}/ - Get blog post
 */
export * from './blogs'

// ============================================================================
// PAGES (About, Contact)
// ============================================================================

/**
 * File: services/api/pages.ts
 * 
 * Functions:
 * - fetchAbout() - Get about page content
 * - submitContact(name, email, subject, message) - Submit contact form
 * 
 * Backend endpoints:
 * GET    /api/about/ - About page CMS content
 * POST   /api/contact/ - Submit contact form
 */
export * from './pages'

// ============================================================================
// CLIENT CONFIG
// ============================================================================

/**
 * File: services/api/client.ts
 * 
 * Core axios instance setup:
 * - Base URL configured from NEXT_PUBLIC_API_URL
 * - withCredentials: true (sends httpOnly cookies automatically)
 * - Response interceptors for auth errors
 * 
 * The `api` instance is used by all services above.
 * All requests automatically include httpOnly JWT token.
 */
export { api } from './client'

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * In a React component:
 * 
 * import { useQuery, useMutation } from '@tanstack/react-query'
 * import { getCurrentUser, logout } from '@/services/api/auth'
 * import { fetchDashboardSummary } from '@/services/api/dashboard'
 * import { startQuizAttempt, submitAttempt } from '@/services/api/attempts'
 * 
 * export function MyComponent() {
 *   // Check if user is logged in
 *   const { data: user } = useQuery({
 *     queryKey: ['auth', 'me'],
 *     queryFn: getCurrentUser,
 *     retry: false, // Don't retry 401
 *   })
 * 
 *   // Fetch dashboard if logged in
 *   const { data: summary } = useQuery({
 *     queryKey: ['dashboard'],
 *     queryFn: fetchDashboardSummary,
 *     enabled: !!user, // Only run if user exists
 *   })
 * 
 *   // Handle logout
 *   const logoutMutation = useMutation({
 *     mutationFn: logout,
 *     onSuccess: () => {
 *       router.push('/auth/login')
 *     },
 *   })
 * 
 *   return (
 *     <>
 *       {user && <p>Welcome, {user.username}!</p>}
 *       {summary && <p>Score: {summary.total_score}</p>}
 *       <button onClick={() => logoutMutation.mutate()}>Logout</button>
 *     </>
 *   )
 * }
 */

// ============================================================================
// KEY PATTERNS
// ============================================================================

/**
 * PATTERN 1: Check auth on app init
 * 
 * In app/layout.tsx or app/providers.tsx:
 * 
 * useEffect(() => {
 *   getCurrentUser()
 *     .then(user => {
 *       if (user) {
 *         setIsAuthenticated(true)
 *       } else {
 *         setIsAuthenticated(false)
 *       }
 *     })
 *     .catch(() => setIsAuthenticated(false))
 * }, [])
 */

/**
 * PATTERN 2: Gate components on auth
 * 
 * function ProtectedComponent() {
 *   const { data: user, isLoading } = useQuery({
 *     queryKey: ['auth', 'me'],
 *     queryFn: getCurrentUser,
 *     retry: false,
 *   })
 * 
 *   if (isLoading) return <Skeleton />
 *   if (!user) return <Redirect to="/auth/login" />
 *   
 *   return <Dashboard user={user} />
 * }
 */

/**
 * PATTERN 3: Poll async task
 * 
 * const [taskId, setTaskId] = useState<string>()
 * 
 * const requestExplanation = async () => {
 *   const { task_id } = await generateExplanation(questionId)
 *   setTaskId(task_id)
 * }
 * 
 * useEffect(() => {
 *   if (!taskId) return
 *   
 *   const interval = setInterval(async () => {
 *     const status = await getTaskStatus(taskId)
 *     if (status.state === 'SUCCESS') {
 *       showExplanation(status.result)
 *       clearInterval(interval)
 *     } else if (status.state === 'FAILURE') {
 *       showError('Failed to generate explanation')
 *       clearInterval(interval)
 *     }
 *   }, 1000)
 *   
 *   return () => clearInterval(interval)
 * }, [taskId])
 */

export { }

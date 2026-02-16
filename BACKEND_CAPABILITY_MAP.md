# 🔄 Backend Capability Map
## Complete Django View Inventory & Frontend Integration Status

---

## 1. AUTHENTICATION & AUTHORIZATION

### Traditional Session Auth (account/views.py)
| View | Endpoint | Method | Purpose | Permissions | Frontend Usage |
|------|----------|--------|---------|-------------|----------------|
| `register()` | `/account/register` | GET/POST | User registration | AllowAny | ✅ auth/register |
| `login()` | `/account/login` | GET/POST | User login | AllowAny | ✅ auth/login |
| `logout()` | `/account/logout` | GET | Session logout | IsAuthenticated | ✅ Navbar logout button |
| `profile()` | `/account/profile/<username>` | GET | View user profile | IsAuthenticated | ✅ profile/[username] |
| `editProfile()` | `/account/settings` | GET/POST | Edit profile | IsAuthenticated | ✅ profile/settings |
| `deleteProfile()` | `/account/delete` | GET/POST | Delete account | IsAuthenticated | ❌ Not in frontend |

### API/JWT Auth (api/auth_views.py)
| View | Endpoint | Method | Purpose | Permissions | Frontend Usage |
|------|----------|--------|---------|-------------|----------------|
| `CookieTokenObtainPairView` | `/api/auth/login/` | POST | JWT login (httpOnly) | AllowAny | ✅ Uses this |
| `CookieTokenRefreshView` | `/api/auth/refresh/` | POST | Refresh token | AllowAny | ✅ Auto-refresh |
| `LogoutView` | `/api/auth/logout/` | POST | Logout (blacklist token) | AllowAny | ✅ Logout endpoint |
| `RegisterView` | `/api/auth/register/` | POST | API registration | AllowAny | ✅ Uses this |
| `MeView` | `/api/auth/me/` | GET | Get current user | IsAuthenticated | ❌ **MISSING** |

**⚠️ CRITICAL ISSUE:** Frontend should use `/api/auth/me/` on app load to validate auth state instead of checking localStorage.

---

## 2. QUIZ MANAGEMENT

### Quiz Discovery & Listing
| View | Endpoint | Method | Purpose | Request | Response | Frontend Usage |
|------|----------|--------|---------|---------|----------|----------------|
| `QuizViewSet.list()` | `/api/quizzes/` | GET | List all quizzes | Query params: `subject`, `chapter`, `difficulty` | `{ results: [ { id, title, description, category, question_count }... ] }` | ✅ mdcat/[subject] |
| `QuizViewSet.retrieve()` | `/api/quizzes/{id}/` | GET | Get quiz detail | - | Full quiz with all questions & choices | ❌ **NOT USED** |

**Query Parameters (Filtering):**
- `subject` or `category`: Filter by subject name (case-insensitive)
- `chapter` or `q`: Filter by title/description (contains search)
- `difficulty`: `easy` (≤20 Qs), `medium` (21-50 Qs), `hard` (>50 Qs)

### Quiz Attempts (Core Workflow)
| View | Endpoint | Method | Purpose | Request | Response | Frontend Usage |
|------|----------|--------|---------|---------|----------|----------------|
| `QuizViewSet.start()` | `/api/quizzes/{id}/start/` | POST | Create attempt | - | `{ id, quiz, status: 'IN_PROGRESS', started_at, total_questions }` | ❌ **NOT USED** |
| `QuizAttemptViewSet.questions()` | `/api/attempts/{id}/questions/` | GET | Get attempt questions | - | `{ attempt_id, quiz_id, questions: [ { id, text, image, choices: [ { id, text }... ] }... ] }` | ❌ **NOT USED** |
| `QuizAttemptViewSet.answer()` | `/api/attempts/{id}/answer/` | POST | Save single answer | `{ question_id, choice_id }` | `{ detail: 'Answer saved' }` | ❌ **NOT USED** |
| `QuizAttemptViewSet.submit()` | `/api/attempts/{id}/submit/` | POST | Submit attempt | `{ time_taken_seconds? }` | `{ attempt_id, quiz_id, score, total_questions, submitted_at }` | ❌ **NOT USED** |
| `QuizAttemptViewSet.results()` | `/api/attempts/{id}/results/` | GET | Get attempt results | - | `{ attempt_id, quiz_id, quiz_title, category, score, total_questions, accuracy, submitted_at, time_taken_seconds }` | ❌ **NOT USED** |
| `QuizAttemptViewSet.review()` | `/api/attempts/{id}/review/` | GET | Review attempt answers | - | `{ attempt_id, quiz_id, questions: [ {...with correct_choice_id, selected_choice_id, explanation, ai_explanation} ] }` | ❌ **NOT USED** |
| `QuizAttemptViewSet.analysis()` | `/api/attempts/{id}/analysis/` | GET | Get attempt stats | - | `{ attempt_id, quiz_id, correct, incorrect, total_questions, accuracy }` | ❌ **NOT USED** |

**⚠️ CRITICAL:** Quiz attempt workflow is completely missing from frontend!

---

## 3. EXPLANATIONS (AI)

| View | Endpoint | Method | Purpose | Request | Response | Permissions | Frontend Usage |
|------|----------|--------|---------|---------|----------|-------------|----------------|
| `QuestionViewSet.generate_explanation()` | `/api/questions/{id}/generate-explanation/` | POST | Async explanation generation | - | `{ task_id, status: 'queued' }` | IsAuthenticated (must complete quiz first) | ❌ **NOT USED** |
| `ExplanationTaskViewSet.list()` | `/api/tasks/` | GET | List user's tasks | - | Array of tasks | IsAuthenticated (users see own only, staff see all) | ❌ **NOT USED** |
| `ExplanationTaskViewSet.retrieve()` | `/api/tasks/{id}/` | GET | Get task status | - | `{ id, task_id, question, user, status, result, error, cost, generated_at }` | IsAuthenticated | ❌ **NOT USED** |
| `ExplanationTaskViewSet.requeue()` | `/api/tasks/{id}/requeue/` | POST | Requeue failed task | - | `{ task_id, status: 'queued' }` | IsAuthenticated | ❌ **NOT USED** |
| `task_status()` | `/api/tasks/{task_id}/` | GET | Poll task status | - | `{ task_id, state, result }` | - | ❌ **NOT USED** |

---

## 4. USER DATA & ANALYTICS

### Dashboard
| View | Endpoint | Method | Purpose | Response | Permissions | Frontend Usage |
|------|----------|--------|---------|-----------|-------------|----------------|
| `dashboard_summary()` | `/api/dashboard/summary/` | GET | User stats overview | `{ total_attempts, total_questions, total_score, accuracy, last_attempt: {...} }` | IsAuthenticated | ❌ **NOT USED** |
| `dashboard_recent_attempts()` | `/api/dashboard/recent-attempts/` | GET | Last 5 attempts | Array of attempts | IsAuthenticated | ❌ **NOT USED** |

### Analytics
| View | Endpoint | Method | Purpose | Response | Permissions | Frontend Usage |
|------|----------|--------|---------|-----------|-------------|----------------|
| `analytics_subject_performance()` | `/api/analytics/subject-performance/` | GET | Performance by subject | `[ { subject, correct, total, accuracy } ]` | IsAuthenticated | ❌ **NOT USED** |
| `analytics_progress_trend()` | `/api/analytics/progress-trend/` | GET | Accuracy over time | `[ { date, correct, total, accuracy } ]` | IsAuthenticated | ❌ **NOT USED** |

### Leaderboard
| View | Endpoint | Method | Purpose | Response | Permissions | Frontend Usage |
|------|----------|--------|---------|-----------|-------------|----------------|
| `leaderboard()` | `/api/leaderboard/` | GET | Top 50 users | `[ { username, rank, total_score } ]` | - | ❌ **NOT USED** |

### Profiles
| View | Endpoint | Method | Purpose | Permissions | Frontend Usage |
|------|----------|--------|---------|-------------|----------------|
| `ProfileViewSet.list()` | `/api/profiles/` | GET | List profiles | IsAuthenticatedOrReadOnly | ❌ Not needed |
| `ProfileViewSet.retrieve()` | `/api/profiles/{id}/` | GET | Get profile | IsAuthenticatedOrReadOnly | ❌ Not needed (use Django profile view) |
| `ProfileViewSet.partial_update()` | `/api/profiles/{id}/` | PATCH | Update own profile | IsAuthenticated | ❌ **PARTIAL** (needs wiring) |

---

## 5. BLOG & CONTENT

| View | Endpoint | Method | Purpose | Response | Permissions | Frontend Usage |
|------|----------|--------|---------|-----------|-------------|----------------|
| `BlogViewSet.list()` | `/api/blogs/` | GET | List public blogs | `[ { id, title, content, author, created_at, status } ]` | IsAuthenticatedOrReadOnly | ✅ blog listing |
| `BlogViewSet.retrieve()` | `/api/blogs/{id}/` | GET | Get single blog | Full blog content | IsAuthenticatedOrReadOnly | ✅ blog page |

---

## 6. STATIC PAGES

| View | Endpoint | Method | Purpose | Response | Permissions | Frontend Usage |
|------|----------|--------|---------|-----------|-------------|----------------|
| `about_view()` | `/api/about/` | GET | About page data | `{ title, description, mission, vision, features, team, stats }` | AllowAny | ✅ /about |
| `contact_view()` | `/api/contact/` | POST | Contact form submit | `{ detail: 'Message sent' }` | AllowAny | ✅ /contact |

---

## 7. MEDIA & UPLOADS

| View | Endpoint | Method | Purpose | Request | Response | Frontend Usage |
|------|----------|--------|---------|---------|----------|----------------|
| `CloudinarySignView` | `/api/cloudinary/sign/` | POST | Get upload signature | `{ file }` | `{ signature, timestamp, cloud_name }` | ❌ **PARTIAL** (exists but may not be wired) |

---

## 8. QUIZ SUBMISSIONS (Legacy)

| View | Endpoint | Method | Purpose | Status | Frontend Usage |
|------|----------|--------|---------|--------|----------------|
| `QuizSubmissionViewSet.list()` | `/api/submissions/` | GET | List submissions | ⚠️ Legacy (uses old QuizSubmission model) | ❌ **DEPRECATED** |
| `QuizSubmissionViewSet.create()` | `/api/submissions/` | POST | Create submission | ⚠️ Legacy | ❌ **DEPRECATED** |

**Note:** New attempts should use `QuizAttemptViewSet` instead.

---

## 9. KEY BEHAVIORS & CONSTRAINTS

### Rate Limiting
- Quiz start: **10/hour per user**
- Answer submission: **30/minute per user**
- Submit attempt: **2/minute per user** (prevents spam submissions)
- Explanation generation: **10/hour per user**

### Attempt State Machine
```
NOT_STARTED (implicit)
    ↓
IN_PROGRESS (after POST /quizzes/{id}/start/)
    ↓
SUBMITTED (after POST /attempts/{id}/submit/)
    ↑
    └─ Cannot transition back (idempotent)
```

### Permissions
- **Quiz list/detail:** `IsAuthenticatedOrReadOnly` (anyone can view)
- **Start attempt:** `IsAuthenticated` (must be logged in)
- **Submit attempt:** `IsAuthenticated` + IDOR check (can only submit own attempts)
- **View results/review:** `IsAuthenticated` + IDOR check (can only view own attempts)
- **Generate explanations:** `IsAuthenticated` + must have completed quiz first
- **Admin endpoints:** `is_superuser` required

### Response Validation
All responses are **NOT** guaranteed to match frontend expectations. Frontend must:
1. Validate response shape before using
2. Handle 401/403 gracefully
3. Check for `{ detail: '...' }` error messages
4. Queue operations if rate-limited (429)

---

## ✅ SUMMARY: What's Implemented in Backend

✅ Complete authentication (JWT + traditional)  
✅ Quiz discovery with filtering  
✅ Full attempt lifecycle (start → answer → submit → review)  
✅ Result calculations & analytics  
✅ Async AI explanations  
✅ Leaderboard  
✅ Dashboard & per-subject analytics  
✅ Profile management  
✅ Blog system  
✅ Contact form  

---

## ❌ SUMMARY: What's MISSING in Frontend

❌ Quiz attempt workflow (most critical)  
❌ Dashboard & analytics pages  
❌ Results & review pages  
❌ Explanation generation UI  
❌ Leaderboard  
❌ Profile management in API layer  
❌ Auth state validation via `/api/auth/me/`  

---

## 🎯 NEXT STEPS

1. **Create centralized API service layer** - One function per backend endpoint
2. **Implement quiz attempt workflow** - The core user journey
3. **Build dashboard & analytics** - Visualize user progress
4. **Wire all existing pages** - Use the API service layer
5. **Add auth state validation** - Use `/api/auth/me/` on app load
6. **Handle errors properly** - 401, 403, 429, timeouts


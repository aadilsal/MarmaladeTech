# 🗺️ View → Frontend Mapping
## Complete Integration Status of Django Views in Next.js Frontend

---

## IMPLEMENTATION STATUS LEGEND

- ✅ **COMPLETE** - View fully used, API service exists, types defined
- 🟡 **PARTIAL** - Service exists but not all features used or incomplete type validation
- ❌ **NOT IMPLEMENTED** - Service missing, view unused, or needs implementation
- ⚠️ **CRITICAL** - Essential for core user journey, must implement

---

## AUTHENTICATION VIEWS

### Traditional Session Auth (Legacy - Used by Django Templates)

| Django View | Endpoint | Frontend Usage | Status | Notes |
|------------|----------|-----------------|--------|-------|
| `account.views.register` | `/account/register` | None (API used instead) | ❌ | Use `/api/auth/register/` instead |
| `account.views.login` | `/account/login` | None (API used instead) | ❌ | Use `/api/auth/login/` instead |
| `account.views.logout` | `/account/logout` | None (API used instead) | ❌ | Use `/api/auth/logout/` instead |
| `account.views.profile` | `/account/profile/<user>` | None (API used instead) | ❌ | Use profile pages with API |
| `account.views.editProfile` | `/account/settings` | /profile/edit | 🟡 | PARTIAL - form exists but no API integration |
| `account.views.deleteProfile` | `/account/delete` | None | ❌ | Should use `/api/auth/logout/` instead |

**Decision:** Frontend should use API auth exclusively. Django templates handled server-side; frontend needs pure API approach.

---

### API/JWT Authentication

| Django View | Endpoint | Service File | Frontend Page | Request | Response Type | Status |
|------------|----------|--------------|---------------|---------|--------------|--------|
| `CookieTokenObtainPairView` | `POST /api/auth/login/` | ✅ auth.ts | `/auth/login` | `{username, password}` | `{detail}` (tokens in cookies) | ✅ COMPLETE |
| `CookieTokenRefreshView` | `POST /api/auth/refresh/` | ✅ client.ts | Auto (interceptor) | `{}` | `{detail}` (refresh token) | ✅ COMPLETE |
| `LogoutView` | `POST /api/auth/logout/` | ✅ auth.ts | `/auth/login` (logout button) | Optional `{refresh}` | `{detail}` | ✅ COMPLETE |
| `RegisterView` | `POST /api/auth/register/` | ✅ auth.ts | `/auth/register` | `{username, email, password}` | `{detail}` (tokens in cookies) | ✅ COMPLETE |
| `MeView` | `GET /api/auth/me/` | ❌ MISSING | Dashboard (app init) | - | `{user: {id, username, email, ...}}` | ⚠️ CRITICAL |

**⚠️ CRITICAL ISSUE:** 
- `/api/auth/me/` endpoint exists in backend but NOT USED in frontend
- Frontend should call this on app load to validate auth state
- **Should replace:** localStorage-based auth checks
- **Benefit:** Source-of-truth authentication from backend

**TODO:** Create `auth.ts::getCurrentUser()` that calls `/api/auth/me/`

---

## QUIZ MANAGEMENT VIEWS

### Quiz Discovery & Listing

| Django View | Endpoint | Service File | Frontend Page | Filters | Status | Notes |
|------------|----------|--------------|---------------|---------|--------|-------|
| `QuizViewSet.list()` | `GET /api/quizzes/` | ✅ quizzes.ts | `/mdcat/[subject]` | subject, chapter, difficulty | ✅ COMPLETE | Filters work correctly |
| `QuizViewSet.retrieve()` | `GET /api/quizzes/{id}/` | ✅ quizzes.ts (fetchQuiz) | `/quiz/[id]` | - | ✅ COMPLETE | Returns full quiz + questions |

---

### Quiz Attempt Workflow (Core Journey)

| Django View | Endpoint | Service File | Frontend Page | Purpose | Status | 🔴 ISSUE |
|------------|----------|--------------|---------------|---------|--------|---------|
| `QuizViewSet.start()` | `POST /api/quizzes/{id}/start/` | ✅ attempts.ts | `/quiz/[id]` | Create attempt record | ✅ COMPLETE | ✅ Implemented |
| `QuizAttemptViewSet.questions()` | `GET /api/attempts/{id}/questions/` | ✅ attempts.ts | `/quiz/[id]` | Get questions for attempt | ❌ NOT USED | Uses `fetchQuiz` instead |
| `QuizAttemptViewSet.answer()` | `POST /api/attempts/{id}/answer/` | ✅ attempts.ts | `/quiz/[id]` | Save individual answer | ✅ COMPLETE | Called on each answer change |
| `QuizAttemptViewSet.submit()` | `POST /api/attempts/{id}/submit/` | ✅ attempts.ts | `/quiz/[id]` (submit button) | Submit & score attempt | ✅ COMPLETE | Includes time_taken_seconds |
| `QuizAttemptViewSet.results()` | `GET /api/attempts/{id}/results/` | ✅ attempts.ts | `/results/[id]` | Get final score & stats | ✅ COMPLETE | Shows accuracy % |
| `QuizAttemptViewSet.review()` | `GET /api/attempts/{id}/review/` | ✅ attempts.ts | `/quiz/[id]` (review mode) | Review answers with corrections | ✅ COMPLETE | Shows explanations |
| `QuizAttemptViewSet.analysis()` | `GET /api/attempts/{id}/analysis/` | ❌ MISSING | None | Breakdown: correct/incorrect | ❌ NOT USED | - |

**✅ Status:** Quiz workflow is mostly complete! Questions flow correctly.

**🟡 ISSUE:** `fetchAttemptQuestions()` is NOT BEING CALLED
- Backend provides this endpoint for efficiency (to fetch attempt-specific questions)
- Frontend currently uses `fetchQuiz()` instead (all questions loaded upfront)
- Not a critical bug, but misaligns with backend design

---

### Explanations (AI)

| Django View | Endpoint | Service File | Frontend Page | Purpose | Status |
|------------|----------|--------------|---------------|---------|--------|
| `QuestionViewSet.generate_explanation()` | `POST /api/questions/{id}/generate-explanation/` | ❌ MISSING | None | Request async explanation | ⚠️ CRITICAL |
| `ExplanationTaskViewSet.list()` | `GET /api/tasks/` | ❌ MISSING | None | List user's tasks | ❌ NOT USED |
| `ExplanationTaskViewSet.retrieve()` | `GET /api/tasks/{id}/` | ❌ MISSING | None | Get task status | ❌ NOT USED |
| `ExplanationTaskViewSet.requeue()` | `POST /api/tasks/{id}/requeue/` | ❌ MISSING | None | Retry failed task | ❌ NOT USED |
| `task_status()` | `GET /api/tasks/{task_id}/` | ❌ MISSING | None | Monitor async task | ❌ NOT USED |

**⚠️ CRITICAL ISSUE:** AI explanation system has zero frontend integration
- Backend has full async task support (Celery)
- Frontend does NOT have UI for requesting explanations
- Backend returns explanations in results, but frontend can't trigger them
- **TODO:** Create explanations service & UI components

---

## DASHBOARD & ANALYTICS VIEWS

### Dashboard

| Django View | Endpoint | Service File | Frontend Page | Response | Status | Notes |
|------------|----------|--------------|---------------|----------|--------|-------|
| `dashboard_summary()` | `GET /api/dashboard/summary/` | ✅ dashboard.ts | `/dashboard` | `{total_attempts, total_score, accuracy, last_attempt}` | 🟡 PARTIAL | Data fetched but not all displayed |
| `dashboard_recent_attempts()` | `GET /api/dashboard/recent-attempts/` | ✅ dashboard.ts | `/dashboard` | Array of last 5 attempts | 🟡 PARTIAL | Shown but limited display |

**Status:** Dashboard fetches data but doesn't fully utilize it. Missing visualizations.

---

### Analytics

| Django View | Endpoint | Service File | Frontend Page | Response | Status | Notes |
|------------|----------|--------------|---------------|----------|--------|-------|
| `analytics_subject_performance()` | `GET /api/analytics/subject-performance/` | ✅ analytics.ts | `/dashboard` (analytics tab?) | `[{subject, correct, total, accuracy}]` | 🟡 PARTIAL | Service exists, not used in UI |
| `analytics_progress_trend()` | `GET /api/analytics/progress-trend/` | ✅ analytics.ts | `/dashboard` (progress chart) | `[{date, correct, total, accuracy}]` | 🟡 PARTIAL | Service exists, not used in UI |

**Issues:**
- Services fetch data correctly
- Types are defined
- But UI components don't consume/display the data
- No charts or visualizations

---

### Leaderboard

| Django View | Endpoint | Service File | Frontend Page | Response | Status |
|------------|----------|--------------|---------------|----------|--------|
| `leaderboard()` | `GET /api/leaderboard/` | ❌ MISSING | None (no leaderboard page) | `[{username, rank, total_score}]` | ❌ NOT IMPLEMENTED |

**Status:** Backend has leaderboard, frontend has no page or service for it.

---

## USER PROFILE VIEWS

### Profile Management

| Django View | Endpoint | Service File | Frontend Page | Status | Notes |
|------------|----------|--------------|---------------|--------|-------|
| `account.views.profile()` | `/account/profile/<u>` | ❌ MISSING (API) | `/profile/[username]` | ❌ PARTIAL | View exists, needs API integration |
| `account.views.editProfile()` | `/account/settings` | ❌ MISSING (API) | `/profile/edit` | ❌ PARTIAL | Form exists, no API service |
| `ProfileViewSet.retrieve()` | `GET /api/profiles/{id}/` | ❌ MISSING | `/profile/[username]` | ❌ NOT USED | Should use this instead |
| `ProfileViewSet.partial_update()` | `PATCH /api/profiles/{id}/` | ❌ MISSING | `/profile/edit` | ❌ NOT USED | Backend ready, frontend missing |

**Issues:**
- Profile UI exists but doesn't call backend
- Edit profile form is hardcoded/mock
- Backend API is ready but not wired

**TODO:** 
1. Create `profiles.ts` service with `fetchProfile()` and `updateProfile()`
2. Wire `/profile/[username]` to fetch from backend
3. Wire `/profile/edit` form to call update endpoint

---

## BLOG VIEWS

| Django View | Endpoint | Service File | Frontend Page | Status | Notes |
|------------|----------|--------------|---------------|--------|-------|
| `BlogViewSet.list()` | `GET /api/blogs/` | ❌ MISSING | `/blog` (implied) | ❌ NOT USED | List page missing |
| `BlogViewSet.retrieve()` | `GET /api/blogs/{id}/` | ❌ MISSING | `/blog/[id]` (implied) | ❌ NOT USED | Detail page missing |

**Status:** No blog pages in frontend currently.

---

## STATIC PAGES

| Django View | Endpoint | Service File | Frontend Page | Status | Notes |
|------------|----------|--------------|---------------|--------|-------|
| `pages_views.about_view()` | `GET /api/about/` | ❌ MISSING | `/about` | 🟡 PARTIAL | Page exists, API not used |
| `pages_views.contact_view()` | `POST /api/contact/` | ❌ MISSING | `/contact` | 🟡 PARTIAL | Page exists, form not wired |

**Issues:**
- About page is hardcoded, doesn't fetch from backend
- Contact form exists but doesn't POST to `/api/contact/`

---

## MEDIA & UPLOADS

| Django View | Endpoint | Service File | Frontend Page | Purpose | Status |
|------------|----------|--------------|---------------|---------|--------|
| `CloudinarySignView` | `POST /api/cloudinary/sign/` | ❌ MISSING | Profile image upload | Get signature for direct upload | ❌ NOT USED |

**Status:** Backend ready for image uploads, frontend not using it.

---

## LEGACY/DEPRECATED

| Django View | Endpoint | Status | Migration Path |
|------------|----------|--------|-----------------|
| `QuizSubmissionViewSet` | `/api/submissions/` | ⚠️ DEPRECATED | Use `QuizAttemptViewSet` instead |
| `account.views.deleteProfile()` | `/account/delete` | ⚠️ DEPRECATED | No need for explicit delete (logout sufficient) |

---

## 📊 SUMMARY: IMPLEMENTATION STATUS

### ✅ FULLY IMPLEMENTED (Ready to Use)
- ✅ Authentication (login, register, logout, token refresh)
- ✅ Quiz discovery with filtering
- ✅ Quiz attempt workflow (start/answer/submit/results)
- ✅ Basic dashboard data fetching
- ✅ Analytics data fetching (services + types)

### 🟡 PARTIALLY IMPLEMENTED (Service exists, UI missing or incomplete)
- 🟡 Dashboard visualizations (data fetched, charts missing)
- 🟡 Analytics displays (services exist, UI not consuming)
- 🟡 Profile viewing & editing (pages exist, API not wired)
- 🟡 About & contact pages (UI exists, backend API not used)
- 🟡 Image uploads (backend ready, frontend not using)

### ❌ NOT IMPLEMENTED (Service or frontend missing)
- ❌ `/api/auth/me/` endpoint integration (APP INITIALIZATION BLOCKER)
- ❌ AI explanations (entire workflow)
- ❌ Leaderboard page
- ❌ Blog system
- ❌ Explanation task monitoring & polling
- ❌ Profile API service layer
- ❌ About & contact API service layer

### ⚠️ CRITICAL ISSUES (Must Fix for Production)

1. **Missing `getCurrentUser()` on app initialization**
   - Backend: `GET /api/auth/me/`
   - Frontend: Not called
   - Impact: App doesn't validate auth on load
   - Fix: Call in root layout/loading.tsx

2. **Profile pages not wired to backend**
   - Profile view shows mock data
   - Edit profile doesn't save
   - Fix: Create `profiles.ts` service

3. **AI explanation system completely missing**
   - Backend has async task system ready
   - Zero frontend implementation
   - Fix: Create explanations service + UI

4. **Dashboard analytics not visualized**
   - Data is fetched but not displayed
   - Missing charts/graphs
   - Fix: Add visualization components

---

## 🎯 PRIORITY FIXES (In Order)

**TIER 1 - CRITICAL (Blocks core functionality)**
| Task | Impact | Effort |
|------|--------|--------|
| Add `getCurrentUser()` on app init | Auth state source-of-truth | 1 hr |
| Wire profile pages to API | User profile rendering | 2 hrs |
| Create profiles.ts service | Profile updates functionality | 1 hr |

**TIER 2 - HIGH (Important features)**
| Task | Impact | Effort |
|------|--------|--------|
| AI explanation UI | User feature expectation | 8 hrs |
| Dashboard analytics visualization | User engagement | 4 hrs |
| Leaderboard page | Gamification | 3 hrs |

**TIER 3 - MEDIUM (Polish)**
| Task | Impact | Effort |
|------|--------|--------|
| Blog system | Content | 4 hrs |
| About/contact API integration | CMS | 1 hr |
| Image upload via Cloudinary | UX | 2 hrs |

---

## 🔍 KEY VALIDATION CHECKLIST

Before declaring alignment complete, verify:

- [ ] `GET /api/auth/me/` called on app initialization
- [ ] Auth state always synced with backend (not localStorage only)
- [ ] Profile pages fetch from API
- [ ] Profile editing calls PATCH endpoint
- [ ] Quiz attempts use correct state from backend
- [ ] Results page displays all backend data
- [ ] Dashboard shows real-time analytics
- [ ] No hardcoded UI states (all from backend)
- [ ] 401 errors handled gracefully
- [ ] 403 errors show permission denied
- [ ] 429 errors queue requests
- [ ] All API calls use centralized service layer
- [ ] All responses validated against Zod schemas


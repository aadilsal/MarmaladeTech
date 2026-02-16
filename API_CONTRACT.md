# API Contract (Single Source of Truth)

Base URL: /api/

Conventions
- Auth: JWT in HttpOnly cookies (access_token, refresh_token). Use withCredentials in client.
- Naming: snake_case for all fields.
- Dates: ISO 8601 strings (UTC).
- Pagination: list endpoints return { count, next, previous, results }.
- Errors: { detail: string } for auth/permission; validation uses field errors.

## Auth
POST /api/auth/login/
- Auth: public
- Request: { username, password }
- Response 200: { detail }
- Errors: 401 { detail }

POST /api/auth/register/
- Auth: public
- Request: { username, email?, password }
- Response 201: { detail }
- Errors: 400 { detail }

POST /api/auth/refresh/
- Auth: public (uses refresh cookie)
- Request: {}
- Response 200: { detail }
- Errors: 401 { detail }

POST /api/auth/logout/
- Auth: public
- Request: {}
- Response 200: { detail }

GET /api/auth/me/
- Auth: required
- Response 200: { user: { id, username, first_name, last_name, email } }
- Errors: 401 { detail }

POST /api/auth/password-reset/
- Auth: public
- Request: { email }
- Response 200: { detail }

POST /api/auth/password-reset/confirm/
- Auth: public
- Request: { uid, token, new_password }
- Response 200: { detail }
- Errors: 400 { detail }

## Pages
GET /api/about/
- Auth: public
- Response 200: { title, description, mission, vision, features: [{ title, description }], team: [{ name, role, bio }], stats: { total_questions, total_users, success_rate, average_rating } }

POST /api/contact/
- Auth: public
- Request: { name, email, subject, message }
- Response 201: { detail }
- Errors: 400 { detail }

## Users
GET /api/users/search/?q=&page=&page_size=
- Auth: required
- Response 200: { count, next, previous, results: [{ id, username, first_name, last_name, email }] }

DELETE /api/users/me/
- Auth: required
- Response 204: empty body

## Profiles
GET /api/profiles/
- Auth: required (staff only; others see self)
- Response 200: { count, next, previous, results: [{ user: { id, username, first_name, last_name, email }, bio, profile_img, location, gender }] }

GET /api/profiles/me/
- Auth: required
- Response 200: { user: { id, username, first_name, last_name, email }, bio, profile_img, location, gender }

PATCH /api/profiles/me/
- Auth: required
- Request: { bio?, location?, gender?, profile_img?, first_name?, last_name?, username?, email? }
- Response 200: { user: { id, username, first_name, last_name, email }, bio, profile_img, location, gender }
- Errors: 400 { username? | email? }

GET /api/profiles/by-user/{user_id}/
- Auth: required (self or staff)
- Response 200: { user: { id, username, first_name, last_name, email }, bio, profile_img, location, gender }

## Quizzes
GET /api/quizzes/?subject=&category=&chapter=&q=&difficulty=
- Auth: public
- Response 200: { count, next, previous, results: [{ id, title, description, category, created_at, question_count }] }

GET /api/quizzes/{id}/
- Auth: public
- Response 200: { id, title, description, category, created_at, questions: [{ id, text, image, choices: [{ id, text }] }] }

POST /api/quizzes/{id}/start/
- Auth: required
- Response 201: { id, quiz, status, started_at, submitted_at, score, total_questions, time_taken_seconds }

## Questions
GET /api/questions/
- Auth: public
- Response 200: { count, next, previous, results: [{ id, text, image, choices: [{ id, text }] }] }

GET /api/questions/{id}/
- Auth: public
- Response 200: { id, text, image, choices: [{ id, text }] }

POST /api/questions/{id}/generate-explanation/
- Auth: required
- Response 202: { task_id, status }
- Errors: 403 { detail }

## Choices
GET /api/choices/
- Auth: public
- Response 200: { count, next, previous, results: [{ id, text }] }

GET /api/choices/{id}/
- Auth: public
- Response 200: { id, text }

## Submissions
GET /api/submissions/
- Auth: required (staff sees all)
- Response 200: { count, next, previous, results: [{ id, user: { id, username, first_name, last_name, email }, quiz, score, submitted_at, total_questions }] }

POST /api/submissions/
- Auth: required
- Request: { quiz, score }
- Response 201: { id, user, quiz, score, submitted_at, total_questions }

GET /api/submissions/{id}/
- Auth: required
- Response 200: { id, user, quiz, score, submitted_at, total_questions }

## Attempts
GET /api/attempts/{id}/questions/
- Auth: required
- Response 200: { attempt_id, quiz_id, questions: [{ id, text, image, choices: [{ id, text }] }] }

POST /api/attempts/{id}/answer/
- Auth: required
- Request: { question_id, choice_id }
- Response 200: { detail }
- Errors: 400 { detail }

POST /api/attempts/{id}/submit/
- Auth: required
- Request: { time_taken_seconds? }
- Response 200: { attempt_id, quiz_id, score, total_questions, submitted_at }
- Errors: 400 { detail }

GET /api/attempts/{id}/results/
- Auth: required
- Response 200: { attempt_id, quiz_id, quiz_title, category, score, total_questions, accuracy, submitted_at, time_taken_seconds }

GET /api/attempts/{id}/review/
- Auth: required
- Response 200: { attempt_id, quiz_id, questions: [{ id, text, image, choices: [{ id, text, is_correct }], selected_choice_id, correct_choice_id, explanation, ai_explanation, ai_generated_at, ai_cost, ai_model, ai_error }] }

GET /api/attempts/{id}/analysis/
- Auth: required
- Response 200: { attempt_id, quiz_id, correct, incorrect, total_questions, accuracy }

## Explanation Tasks
GET /api/tasks/
- Auth: required
- Response 200: { count, next, previous, results: [{ id, task_id, question, user: { id, username, first_name, last_name, email }, status, result, error, success, cost, generated_at, created_at, updated_at }] }

GET /api/tasks/{id}/
- Auth: required
- Response 200: { id, task_id, question, user, status, result, error, success, cost, generated_at, created_at, updated_at }

POST /api/tasks/{id}/requeue/
- Auth: required (owner or staff)
- Response 202: { task_id, status }

GET /api/tasks/status/{task_id}/
- Auth: required (owner or staff)
- Response 200: { task_id, state, result? }

## Blogs
GET /api/blogs/
- Auth: public
- Response 200: { count, next, previous, results: [{ id, title, content, author: { id, username, first_name, last_name, email }, status, created_at }] }

GET /api/blogs/{id}/
- Auth: public
- Response 200: { id, title, content, author, status, created_at }

## Analytics & Dashboard
GET /api/leaderboard/
- Auth: public
- Response 200: [{ username, rank, total_score }]

GET /api/dashboard/summary/
- Auth: required
- Response 200: { total_attempts, total_questions, total_score, accuracy, last_attempt: { attempt_id, quiz_id, quiz_title, score, total_questions, submitted_at } | null }

GET /api/dashboard/recent-attempts/
- Auth: required
- Response 200: [{ attempt_id, quiz_id, quiz_title, score, total_questions, submitted_at }]

GET /api/analytics/subject-performance/
- Auth: required
- Response 200: [{ subject, correct, total, accuracy }]

GET /api/analytics/progress-trend/
- Auth: required
- Response 200: [{ date, correct, total, accuracy }]

## Cloudinary
POST /api/cloudinary/sign/
- Auth: required
- Request: {}
- Response 200: { signature, timestamp, api_key, cloud_name }

# Next.js Frontend Integration — Quickstart

This file documents the minimal steps to connect the new Next.js frontend (hosted on Vercel) to this Django backend using JWT authentication and asynchronous AI explanation generation via Celery.

## New features added
- Django REST Framework API at `/api/` with viewsets for quizzes, questions, choices, submissions, profiles, and blogs.
- JWT auth (SimpleJWT) token endpoints at `/api/token/` and `/api/token/refresh/`.
- Asynchronous AI explanation generation using Celery tasks (`quiz.tasks.generate_explanation_task`) and a task status endpoint at `/api/tasks/<task_id>/`.
- CORS support via `django-cors-headers` and `CORS_ALLOWED_ORIGINS` (read from `.env`).

## Important environment variables
- `CORS_ALLOWED_ORIGINS` — comma-separated list of allowed origins (e.g., `http://localhost:3000` and your Vercel URL).
- `CELERY_BROKER_URL` — e.g., `redis://localhost:6379/0`.
- `CELERY_RESULT_BACKEND` — `django-db` or a redis backend URI.
- `GEMINI_API_KEY` and Gemini configuration (`GEMINI_MODEL`, `GEMINI_MAX_TOKENS`, etc.).

## Run locally (development)
1. Create a virtualenv and install dependencies:
   pip install -r requirements.txt

2. Initialize the database and migrations:
   python manage.py migrate

3. Start Redis (for Celery broker) locally or use a hosted Redis.

4. Start a Celery worker:
   celery -A mdcat_expert worker -l info

5. Run the Django dev server:
   python manage.py runserver

6. From the Next.js frontend, set `NEXT_PUBLIC_API_URL` to `http://localhost:8000/api/` and call the token endpoints to authenticate:
   - POST `/api/token/` with `{username, password}` → receive `access` and `refresh` tokens.
   - Send `Authorization: Bearer <access>` on subsequent API requests.

## Explanation generation flow (async + persistence)
- Frontend POSTs to `/api/questions/<id>/generate_explanation/` (requires authenticated user). The endpoint enqueues a Celery task and creates an `ExplanationTask` DB record; it returns `task_id` and 202 status.
- Frontend can poll `/api/tasks/<task_id>/` (Celery result) or GET `/api/tasks/` to read persisted task state and result when available.
- Admins can requeue or regenerate tasks via the admin UI or via the `tasks` API endpoint.

## Deployment notes
- Backend: Render. Add Redis add-on to support Celery; set `CELERY_BROKER_URL` and `CELERY_RESULT_BACKEND` accordingly.
- Frontend: Vercel. Add `NEXT_PUBLIC_API_URL` env var pointing to the backend API URL and the domain to `CORS_ALLOWED_ORIGINS` in the backend.

## Next steps for frontend implementation
- Build a Next.js app (TypeScript) with authentication via JWT. Store access token in memory or secure cookie and refresh using refresh token.
- Implement pages matching existing templates: home, quiz list, quiz detail (take quiz), quiz results, login/register, profile, dashboard, leaderboard, blogs, contact, etc.
- Use Cloudinary direct uploads for profile and question images where possible.

I have scaffolded a starter Next.js app under `frontend/` with TypeScript, Tailwind CSS, and a minimal set of pages and an API client that demonstrates JWT login, fetching quizzes, queuing explanation generation, and polling task status. To run locally:

1. cd frontend
2. npm install
3. npm run dev

Notes:
- Ensure `NEXT_PUBLIC_API_URL` is set (default is `http://localhost:8000/api/`).
- The scaffold uses an HttpOnly cookie for refresh tokens and returns short-lived access tokens for the frontend to store in-memory (or localStorage for demo). Use HttpOnly cookies for refresh tokens in production and ensure `CORS_ALLOWED_ORIGINS` and `CORS_ALLOW_CREDENTIALS` are configured correctly.

If you want, I can continue adding UI polish (Framer Motion transitions, responsive utilities, fine-grained components, and mobile UX) and wire more pages (profile edit, leaderboard, blog list/detail, dashboard). Just tell me which pages you want prioritized for styling and interactions.
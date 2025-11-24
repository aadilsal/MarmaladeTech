Vercel deployment notes
======================

This project ships a `Dockerfile` and `vercel.json` so it can be deployed to Vercel using the Docker builder. The Dockerfile installs requirements, runs `collectstatic` and serves the app with Gunicorn.

Quick steps
-----------

1. In the Vercel dashboard, create a new project and point it at this repository.
2. Add the following Environment Variables in the project settings (Production):
   - `SECRET_KEY` — your production Django secret key
   - `DEBUG` — set to `False`
   - `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT` — if you will use PostgreSQL
   - `DATABASE_URL` — recommended; if present it will be used to configure the DB automatically (e.g. postgres://user:pass@host:5432/dbname)
   - Any other env vars your app needs (e.g., media storage creds)

Notes
-----
- The Dockerfile uses `python:3.12-slim` and installs `requirements.txt`.
- `manage.py collectstatic --noinput` runs during the image build, so static files are baked into the image at `/app/staticfiles`.
- The app is served with Gunicorn on port 8000.
- WhiteNoise is enabled in `settings.py` and `STATICFILES_STORAGE` uses the compressed manifest storage for efficient static serving.
- The container entrypoint (`entrypoint.sh`) runs `python manage.py migrate --noinput` before starting Gunicorn. Make sure your production DB is reachable during container startup.

If you prefer not to use Docker on Vercel, you'll need to adapt `vercel.json` to use a platform builder and ensure a suitable build command installs dependencies and runs `collectstatic`.

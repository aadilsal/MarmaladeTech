#!/bin/sh
set -e

# Run migrations (no input) before starting the server
echo "Running database migrations..."
python manage.py migrate --noinput

echo "Starting Gunicorn..."
exec gunicorn mdcat_expert.wsgi:application --bind 0.0.0.0:8000 --workers 3

#!/usr/bin/env bash
set -euo pipefail

echo "Installing dependencies..."
python -m pip install --upgrade pip

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Build complete!"

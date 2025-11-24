#!/bin/bash

# MarmaladeTech Deployment Script

echo "🚀 Starting MarmaladeTech Deployment..."

# Set production environment variables
export SECRET_KEY="o%+%%8zj!7m=8y=ug4jdnzd=5la_bm9bghq^i)frli=wc=z-at"
export DEBUG="False"
export DATABASE_URL="postgresql://postgres:zxIiqdNJVLwNPEVAnkBxXxSGKaRbsvhC@ballast.proxy.rlwy.net:19556/railway"
export PGDATABASE="railway"
export PGHOST="ballast.proxy.rlwy.net"
export PGPASSWORD="zxIiqdNJVLwNPEVAnkBxXxSGKaRbsvhC"
export PGPORT="19556"
export PGUSER="postgres"

echo "📦 Installing dependencies..."
pip install -r requirements.txt

echo "🗄️ Running database migrations..."
python manage.py migrate

echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

echo "👤 Creating superuser (if not exists)..."
echo "from django.contrib.auth.models import User; User.objects.create_superuser('admin', 'admin@mdcatexpert.com', 'Admin@123') if not User.objects.filter(username='admin').exists() else None" | python manage.py shell

echo "✅ Deployment preparation complete!"
echo ""
echo "🔑 Admin Credentials:"
echo "   Username: admin"
echo "   Email: admin@mdcatexpert.com"
echo "   Password: Admin@123"
echo ""
echo "🌐 Access your application at: https://your-domain.com"
echo "🔧 Admin panel: https://your-domain.com/admin"

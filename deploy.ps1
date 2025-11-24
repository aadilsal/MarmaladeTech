# MDCAT EXPERT Deployment Script for Windows

Write-Host "🚀 Starting MarmaladeTech Deployment..." -ForegroundColor Green

# Set production environment variables
$env:SECRET_KEY = "o%+%%8zj!7m=8y=ug4jdnzd=5la_bm9bghq^i)frli=wc=z-at"
$env:DEBUG = "False"
$env:DATABASE_URL = "postgresql://postgres:zxIiqdNJVLwNPEVAnkBxXxSGKaRbsvhC@ballast.proxy.rlwy.net:19556/railway"
$env:PGDATABASE = "railway"
$env:PGHOST = "ballast.proxy.rlwy.net"
$env:PGPASSWORD = "zxIiqdNJVLwNPEVAnkBxXxSGKaRbsvhC"
$env:PGPORT = "19556"
$env:PGUSER = "postgres"

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
C:\Users\aadil\AppData\Local\Programs\Python\Python312\python.exe -m pip install -r requirements.txt

Write-Host "🗄️ Running database migrations..." -ForegroundColor Yellow
C:\Users\aadil\AppData\Local\Programs\Python\Python312\python.exe manage.py migrate

Write-Host "📁 Collecting static files..." -ForegroundColor Yellow
C:\Users\aadil\AppData\Local\Programs\Python\Python312\python.exe manage.py collectstatic --noinput

Write-Host "👤 Creating superuser (if not exists)..." -ForegroundColor Yellow
$createUserScript = @"
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@mdcatexpert.com', 'Admin@123')
    print('Superuser created successfully!')
else:
    print('Superuser already exists!')
"@
$createUserScript | C:\Users\aadil\AppData\Local\Programs\Python\Python312\python.exe manage.py shell

Write-Host "✅ Deployment preparation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🔑 Admin Credentials:" -ForegroundColor Cyan
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Email: admin@mdcatexpert.com" -ForegroundColor White
Write-Host "   Password: Admin@123" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Access your application at: https://your-domain.com" -ForegroundColor Cyan
Write-Host "🔧 Admin panel: https://your-domain.com/admin" -ForegroundColor Cyan

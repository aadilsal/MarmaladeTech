# MarmaladeTech - Deployment Guide

## Issues Fixed

### 1. Code Bugs and Typos
- **Fixed typo in account views**: `regsiter` → `register`
- **Fixed typo in quiz models**: `_str__` → `__str__`
- **Fixed typo in account models**: `GENDER={` → `GENDER=(`
- **Fixed typo in quiz models**: `calculate_leaderbaord` → `calculate_leaderboard`
- **Fixed profile view logic**: Corrected user object references

### 2. Error Handling Improvements
- **Replaced `Profile.objects.get()` with `get_object_or_404()`** in all views to prevent 500 errors
- **Added proper error handling** in quiz import functionality
- **Fixed JavaScript variable declaration** in quiz template

### 3. Security Updates
- **Upgraded from CKEditor 4 to CKEditor 5** to resolve security vulnerabilities
- **Added production security settings** (HSTS, SSL redirect, secure cookies)
- **Updated requirements.txt** to use `psycopg2-binary` for better compatibility

### 4. Database Configuration
- **Added conditional database configuration** (SQLite for development, PostgreSQL for production)
- **Fixed environment variable handling** for DEBUG setting

### 5. Static Files
- **Verified static file collection** works properly
- **Confirmed all static assets** are properly configured

## Deployment Instructions

### 1. Environment Variables
Set the following environment variables in your production environment:

```bash
SECRET_KEY=your_generated_secret_key_here
DEBUG=False
DATABASE_URL=your_postgresql_connection_string
PGDATABASE=your_database_name
PGHOST=your_database_host
PGPASSWORD=your_database_password
PGPORT=your_database_port
PGUSER=your_database_user
```

### 2. Database Setup
1. Ensure your PostgreSQL database is running and accessible
2. Run migrations: `python manage.py migrate`
3. Create a superuser: `python manage.py createsuperuser`

### 3. Static Files
1. Collect static files: `python manage.py collectstatic --noinput`
2. Ensure your web server is configured to serve static files from the `staticfiles` directory

### 4. Railway Deployment
The application is configured for Railway deployment with:
- `railway.json` with proper build and start commands
- `runtime.txt` specifying Python 3.12.4
- `requirements.txt` with all necessary dependencies

### 5. Security Checklist
- [x] DEBUG=False in production
- [x] Strong SECRET_KEY generated
- [x] HTTPS/SSL configured
- [x] Secure cookies enabled
- [x] HSTS headers configured
- [x] CSRF protection enabled
- [x] CKEditor upgraded to secure version

### 6. Testing
Before deployment, test the following:
1. User registration and login
2. Quiz creation and submission
3. Profile management
4. Admin interface
5. Static file serving
6. Database operations

## Local Development

For local development, set:
```bash
DEBUG=True
```

This will automatically use SQLite database and disable production security settings.

## File Structure
```
MarmaladeTech/
├── account/          # User authentication and profiles
├── base/            # Core views and models
├── quiz/            # Quiz functionality
├── templates/       # HTML templates
├── static/          # Static files (CSS, JS, images)
├── media/           # User uploaded files
├── MarmaladeTech/   # Django settings and URLs
├── requirements.txt # Python dependencies
├── railway.json     # Railway deployment config
└── runtime.txt      # Python version specification
```

## Support
For any issues or questions, please refer to the Django documentation or contact the development team.

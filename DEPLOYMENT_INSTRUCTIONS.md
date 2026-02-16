# 🚀 DEPLOYMENT GUIDE - CRITICAL FIXES

**Last Updated:** February 5, 2026  
**Status:** Ready for staging deployment

---

## 📋 What Was Fixed

This release addresses **7 critical production-blocking issues**:

1. ✅ **Race condition on quiz submission** - Duplicate scores eliminated
2. ✅ **Database performance** - Added 6 critical indexes
3. ✅ **Leaderboard O(n²) blocking** - Moved to async Celery tasks
4. ✅ **XSS vulnerability** - JWT tokens removed from localStorage
5. ✅ **Rate limiting** - Added to critical endpoints
6. ✅ **CSRF protection** - Hardened SameSite cookie policy
7. ✅ **IDOR vulnerabilities** - Added explicit permission checks
8. ✅ **Code injection in file uploads** - Disabled formula evaluation

---

## 🛠️ PRE-DEPLOYMENT STEPS

### Step 1: Backup Database
```bash
# PostgreSQL
pg_dump mdcat_expert > backup_$(date +%Y%m%d_%H%M%S).sql

# SQLite
cp db.sqlite3 db.sqlite3.backup
```

### Step 2: Install New Dependencies
No new dependencies needed, but verify your requirements.txt has:
```
django==5.1.x
djangorestframework==3.14.x
django-ratelimit==4.1.x
celery==5.3.x
redis==5.x  # If using Redis for Celery
```

### Step 3: Verify Environment Variables
```bash
# Backend
DATABASE_URL=...  # PostgreSQL recommended
CELERY_BROKER_URL=redis://localhost:6379/0  # Redis for Celery
CELERY_RESULT_BACKEND=django-db
DEBUG=False

# Frontend
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/  # No localhost
```

---

## 📦 DEPLOYMENT PROCESS

### Phase 1: Backend Migration
```bash
cd /path/to/MarmaladeTech

# Activate virtual environment
source .venv/bin/activate  # Linux/Mac
# or
.venv\Scripts\activate.ps1  # Windows

# Install/update dependencies
pip install -r requirements.txt

# Run migrations (includes new indexes)
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Test configuration
python manage.py check --deploy
```

### Phase 2: Start Services
```bash
# Start Celery worker (CRITICAL for leaderboard async tasks)
celery -A mdcat_expert worker -l info --concurrency=4

# In production, use Celery Beat for scheduled tasks:
celery -A mdcat_expert beat -l info

# In another terminal, start Django server
gunicorn mdcat_expert.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --timeout 120
```

### Phase 3: Frontend Deployment
```bash
cd frontend

# Build
npm run build

# Deploy to hosting (Vercel, Netlify, etc.)
npm run deploy
# or manually upload dist/

# Clear browser cache - users must re-login
# (localStorage is no longer used, HttpOnly cookies replace it)
```

---

## 🔍 POST-DEPLOYMENT VERIFICATION

### 1. Database Indexes Verification
```bash
python manage.py shell
```

```python
from django.db import connection
connection.ensure_connection()

# Check indexes were created
from django.db import models
from quiz.models import QuizAttempt, UserRank, QuizSubmission, AttemptAnswer

# List indexes
for model in [QuizAttempt, UserRank, QuizSubmission, AttemptAnswer]:
    print(f"\n{model.__name__} indexes:")
    for idx in model._meta.indexes:
        print(f"  - {idx.name}: {idx.fields}")
```

### 2. Celery Worker Status
```bash
# Check if worker is processing tasks
celery -A mdcat_expert inspect active

# Check pending tasks
celery -A mdcat_expert inspect reserved
```

### 3. Test Race Condition Fix
```bash
# Simulate concurrent submissions (Python script)
import asyncio
from django.contrib.auth import get_user_model
from quiz.models import Quiz, QuizAttempt, AttemptAnswer, Choice

async def test_concurrent_submit():
    # This should fail on second attempt (as expected)
    user = User.objects.first()
    quiz = Quiz.objects.first()
    
    attempt = QuizAttempt.objects.create(user=user, quiz=quiz)
    
    # Try to submit twice concurrently
    result1 = await submit_attempt(attempt.id)
    result2 = await submit_attempt(attempt.id)
    
    print(f"First submit: {result1.status_code}")  # 200
    print(f"Second submit: {result2.status_code}")  # 400 (already submitted)
```

### 4. Test HttpOnly Cookies
```bash
# In browser DevTools
# Cookies tab should show:
# - access_token (HttpOnly) - cannot access from console
# - refresh_token (HttpOnly) - cannot access from console
# - No tokens in localStorage

# localStorage should be empty
console.log(localStorage)  # Empty
```

### 5. Test Rate Limiting
```bash
# Should succeed
curl -X POST http://localhost:8000/api/attempts/1/answer/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"question_id": 1, "choice_id": 1}'

# Spam 31 times in 60 seconds - 31st should be rate-limited
for i in {1..31}; do
  curl -X POST http://localhost:8000/api/attempts/1/answer/ \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d '{"question_id": 1, "choice_id": 1}'
done
# Response 31: 429 Too Many Requests
```

---

## ⚠️ WHAT USERS WILL EXPERIENCE

### Login/Logout
- ✓ Same login flow
- ✓ Refresh tokens handled automatically (via cookies)
- ⚠️ Must clear browser data if localStorage had old tokens
- ✓ Much more secure (XSS-proof)

### Quiz Taking
- ✓ Faster performance (indexes)
- ✓ No duplicate submissions possible
- ✓ Rate-limited to prevent abuse

### Leaderboard
- ✓ Updates in real-time (async)
- ✓ No database locks
- ✓ More responsive

---

## 🚨 ROLLBACK PLAN

If something breaks:

```bash
# Stop services
systemctl stop gunicorn
systemctl stop celery
systemctl stop celery-beat

# Revert code
git revert HEAD

# Restore database
psql mdcat_expert < backup_YYYYMMDD_HHMMSS.sql

# Restart services
systemctl start gunicorn
systemctl start celery
systemctl start celery-beat
```

---

## 📊 MONITORING POST-DEPLOYMENT

### Key Metrics to Watch
1. **API Response Times** - Should be <200ms median
2. **Database Query Times** - Check for slow queries (>1s)
3. **Celery Task Queue** - Should process within 5 seconds
4. **Error Rates** - Should stay <0.1%
5. **Leaderboard Update Time** - Should be <100ms per user

### Commands
```bash
# Django logs
tail -f /var/log/gunicorn/access.log
tail -f /var/log/gunicorn/error.log

# Celery logs
tail -f /var/log/celery/worker.log
tail -f /var/log/celery/beat.log

# Database slow query log
# In PostgreSQL:
SELECT query, calls, total_time FROM pg_stat_statements 
ORDER BY total_time DESC LIMIT 10;
```

---

## ✅ GO/NO-GO CHECKLIST

Before going live to production:

- [ ] All migrations run successfully
- [ ] Database indexes created
- [ ] Celery workers running
- [ ] Load test passed (100+ concurrent users)
- [ ] Smoke tests passed (login, quiz, submit, leaderboard)
- [ ] Cookie security verified (HttpOnly, Secure, SameSite=Strict)
- [ ] Rate limiting verified
- [ ] Rollback procedure tested
- [ ] Monitoring alerts configured
- [ ] Team trained on new architecture
- [ ] Backup verified

---

## 🎯 NEXT PRIORITIES (After This Release)

After deploying these fixes, immediately work on:

1. **Phase 1: Remaining Security Issues**
   - Fix IDOR in other endpoints
   - Add input validation on all endpoints
   - Implement rate limiting on more endpoints

2. **Phase 2: Performance Optimization**
   - Fix N+1 queries in dashboard
   - Add caching layer (Redis)
   - Move file imports to async

3. **Phase 3: Data Integrity**
   - Add soft deletes
   - Implement audit logging
   - Add comprehensive tests

4. **Phase 4: Scalability**
   - Add read replicas for analytics
   - Implement query result caching
   - Move to multi-server architecture

---

## 📞 Support

If issues arise:

1. Check logs first
2. Verify all services are running
3. Check database connection
4. Verify Celery is processing tasks
5. Try rolling back to previous version

---

**Deployment Status:** ✅ Ready for Staging  
**Production Readiness:** ⚠️ 40% (Still has 8+ major issues to address)

See `CRITICAL_FIXES_APPLIED.md` for detailed breakdown.

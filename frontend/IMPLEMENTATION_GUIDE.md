# Implementation Checklist & Migration Guide

## ✅ Phase 1: Architecture Implementation (COMPLETE)

### Backend Changes
- ✅ `/api/auth/login/` - sets httpOnly cookies (CookieTokenObtainPairView)
- ✅ `/api/auth/register/` - creates user + sets httpOnly cookies (RegisterView)
- ✅ `/api/auth/logout/` - clears cookies + blacklists token (LogoutView)
- ✅ `/api/auth/refresh/` - refreshes tokens, sets new cookies (CookieTokenRefreshView)
- ✅ `/api/auth/me/` - authoritative auth check, returns user or 401 (MeView)
- ✅ All endpoints use httpOnly, Secure, SameSite=Strict cookies
- ✅ Token expiry: access (15 min), refresh (30 days)

### Frontend Infrastructure
- ✅ `frontend/contexts/AuthContext.ts` - Context definition
- ✅ `frontend/contexts/AuthProvider.tsx` - Central provider with login/logout/refresh
- ✅ `frontend/hooks/useAuth.ts` - Hook to access auth from components
- ✅ `frontend/app/providers.tsx` - Updated to include AuthProvider
- ✅ `frontend/components/Navbar.tsx` - Refactored to use useAuth()
- ✅ `frontend/middleware.ts` - Updated to check refresh_token cookie

### Documentation
- ✅ `frontend/AUTH_ARCHITECTURE.md` - Comprehensive architecture guide
- ✅ `frontend/ARCHITECTURE_DIAGRAMS.md` - Visual diagrams and flows
- ✅ `frontend/DESYNC_IMMUNITY_PROOF.md` - Why this can't desync
- ✅ `frontend/LEGACY_AUTH_REMOVAL.md` - How to remove old code

---

## ⏳ Phase 2: Page Updates (TODO)

### Login Page
**File:** `frontend/app/auth/login/page.tsx`

**Current State:** Likely using old auth.ts or direct API calls

**Required Changes:**
```typescript
// ❌ OLD
const handleLogin = async () => {
  await api.post('auth/login/', { username, password })
  localStorage.setItem('access_token', res.data.access)
  router.push('/dashboard')
}

// ✅ NEW
const { login, isLoading, error } = useAuth()

const handleLogin = async (e) => {
  try {
    await login(username, password)
    router.push('/dashboard')
  } catch (err) {
    setError(err.message)
  }
}
```

**Checklist:**
- [ ] Import `useAuth` from `@/hooks/useAuth`
- [ ] Remove localStorage code
- [ ] Remove manual API calls to login endpoint
- [ ] Use `login()` from useAuth hook
- [ ] Display `error` from useAuth
- [ ] Show loading state during login
- [ ] Don't manually redirect (AuthProvider ensures auth)

### Register Page
**File:** `frontend/app/auth/register/page.tsx`

**Changes:** Same as login page (use useAuth().login after registration)

**Checklist:**
- [ ] Create user via backend register endpoint
- [ ] Backend returns tokens in cookies automatically
- [ ] Call `login()` to update AuthProvider state
- [ ] Redirect to dashboard
- [ ] Display validation errors

### Forgot Password (if exists)
**File:** `frontend/app/auth/forgot-password/`

**Note:** May need separate reset token handling
- Keep as-is if working
- Update to use context for UI state (is-processing, error, etc)

### Dashboard Page
**File:** `frontend/app/dashboard/page.tsx`

**Current State:** Likely uses useUserFromToken

**Required Changes:**
```typescript
// ❌ OLD
const user = useUserFromToken()
if (!user) return <Redirect to="/login" />

// ✅ NEW
const { user, isLoading } = useAuth()
if (isLoading) return <Skeleton />
if (!user) return <NotAuthenticated />  // Shouldn't happen (middleware prevents)
```

**Checklist:**
- [ ] Import `useAuth` hook
- [ ] Remove `useUserFromToken` usage
- [ ] Handle loading state
- [ ] Handle not-authenticated state (gracefully, shouldn't happen)
- [ ] Display user data from context

### Profile Pages
**File:** `frontend/app/profile/`

**Changes:** Same as dashboard (replace useUserFromToken with useAuth)

### Quiz Pages
**Files:** `frontend/app/quiz/`, `frontend/app/results/`

**Changes:** 
- Remove useUserFromToken
- Add useAuth hook for user info
- Verify user is authenticated in loading state

### All Components Accessing Auth
**Pattern:**
```typescript
// ❌ BEFORE
const user = useUserFromToken()
const isAuth = !!localStorage.getItem('access_token')

// ✅ AFTER
const { user, isAuthenticated, isLoading } = useAuth()
```

---

## 🗑️ Phase 3: Legacy Code Removal (TODO)

### Files to Delete (After Verification)
- [ ] `frontend/hooks/useUserFromToken.ts`
  - Command: `grep -r "useUserFromToken" frontend/` (should be empty)
  - Then: Delete file

- [ ] `frontend/lib/api.ts` (if exists)
  - Check: `grep -r "from.*lib/api" frontend/`
  - Migrate all imports to: `@/services/api/client`
  - Then: Delete file

### Code to Remove
- [ ] localStorage auth code (in any component)
  - Pattern: `localStorage.getItem('access_token')`
  - Pattern: `localStorage.getItem('username')`
  - Pattern: `localStorage.getItem('refresh_token')`
  - Replace with: `useAuth()` hook

- [ ] Manual token decode in components
  - Pattern: `JWT.decode(token)`
  - Pattern: `JSON.parse(atob(token.split('.')[1]))`
  - Replace with: `useAuth().user`

- [ ] Manual token interceptor code
  - Keep: `frontend/services/api/client.ts` as-is
  - Remove: Any custom interceptor code in components

- [ ] useUserFromToken imports
  - Find: `grep -r "useUserFromToken" frontend/`
  - Replace each with: `const { user } = useAuth()`

---

## 🧪 Testing Checklist

### Manual Testing (Before Deployment)

#### Test 1: Fresh Login
- [ ] Open app (not logged in)
- [ ] Navigate to /dashboard → redirected to /auth/login (middleware works)
- [ ] Enter credentials
- [ ] Click Login
- [ ] Navbar shows username ✓
- [ ] Redirected to /dashboard ✓
- [ ] Refresh page → still authenticated ✓

#### Test 2: Logout
- [ ] Click Logout button in navbar
- [ ] Navbar shows "Login" button ✓
- [ ] Refresh page → redirected to /auth/login ✓
- [ ] Try /dashboard → redirected to /auth/login ✓

#### Test 3: Multiple Tabs
- [ ] Tab 1: Open app, login
- [ ] Tab 2: Open app (should show login)
- [ ] Tab 2: Refresh → still shows login until you check navbar
- [ ] Tab 1: Logout
- [ ] Tab 2: Refresh page → redirected to /auth/login ✓

#### Test 4: Page Refresh
- [ ] Login
- [ ] Navigate to /dashboard
- [ ] Refresh page (F5)
- [ ] No loading flicker (middleware pre-checked) ✓
- [ ] Navbar shows username ✓
- [ ] Dashboard content loads ✓

#### Test 5: Network Error
- [ ] Open DevTools Network tab
- [ ] Throttle to "Slow 3G"
- [ ] Click Login
- [ ] Error handling works (shows error message) ✓
- [ ] Doesn't redirect prematurely ✓

#### Test 6: Invalid Credentials
- [ ] Try login with wrong password
- [ ] Backend returns 401
- [ ] Error message displays ✓
- [ ] Navbar still shows "Login" ✓

#### Test 7: Protected Routes
- [ ] Not logged in, try /dashboard directly
- [ ] Middleware redirects to /auth/login?next=/dashboard ✓
- [ ] Login
- [ ] `next` param redirects to /dashboard ✓

#### Test 8: Token Expiry
- [ ] Wait for access token to expire (usually >15 min)
- [ ] Make any API request
- [ ] Interceptor refreshes token automatically ✓
- [ ] Request succeeds ✓
- [ ] AuthProvider still valid ✓

---

## 📋 Code Review Checklist

### Backend Review
- [ ] All auth endpoints return proper status codes (200, 201, 401)
- [ ] Cookies have httpOnly=true, secure=true, samesite='Strict'
- [ ] /me endpoint requires IsAuthenticated permission
- [ ] /me endpoint returns 401 for unauthenticated (not 403 or redirect)
- [ ] Logout blacklists token
- [ ] No auth tokens in response body (only cookies)
- [ ] CORS headers configured for frontend domain
- [ ] CSRF protection enabled (SameSite handles it)

### Frontend Review
- [ ] No component reads cookies directly
- [ ] No component reads localStorage for auth
- [ ] No component decodes JWT
- [ ] All auth checks use `useAuth()` hook
- [ ] AuthProvider called in app/providers.tsx
- [ ] Middleware checks refresh_token cookie
- [ ] Navbar uses useAuth only
- [ ] Protected pages check useAuth and handle loading
- [ ] Error handling for auth failures
- [ ] No manual page refreshes for auth state

### Type Safety
- [ ] AuthContext types are exported
- [ ] useAuth hook has proper TypeScript types
- [ ] Components using useAuth have type inference
- [ ] No `any` types in auth code
- [ ] User type matches backend User serializer

---

## Deployment Checklist

- [ ] Backend: DEBUG=False
- [ ] Backend: SECURE_BROWSER_XSS_FILTER = True
- [ ] Backend: SECURE_HSTS_SECONDS = 31536000
- [ ] Backend: Cookie secure flag = True (HTTPS only)
- [ ] Backend: SameSite = Strict
- [ ] Frontend: NEXT_PUBLIC_API_URL = production backend URL
- [ ] Frontend: No localStorage auth code
- [ ] Frontend: No console.logs in auth flows
- [ ] Frontend: useAuth hook used everywhere
- [ ] Frontend: Navbar refactored to use useAuth
- [ ] Middleware: Production-ready path checking
- [ ] SSL/TLS certificate valid
- [ ] CORS configured correctly
- [ ] Database backups taken
- [ ] Rollback plan documented

---

## If Something Goes Wrong

### Issue: Navbar shows "Login" but middleware allows page
**Cause:** AuthProvider fetch failed or middleware doesn't match middleware logic
**Fix:** 
1. Check middleware.ts for cookie check logic
2. Check AuthProvider.fetchMe() error handling
3. Verify backend /me endpoint returns 401 for invalid tokens

### Issue: Logout doesn't redirect
**Cause:** Router redirect not triggered or Navbar update slow
**Fix:**
1. Verify logout() completes before redirect
2. Add router.refresh() after logout() if needed
3. Check if middleware redirects on next navigation

### Issue: Token expiry causes errors
**Cause:** Interceptor not refreshing or refresh fails
**Fix:**
1. Check api/client.ts interceptor code
2. Verify /api/auth/refresh/ endpoint working
3. Add error handling in AuthProvider.refresh()

### Issue: Multiple tabs show different states
**Cause:** localStorage used instead of cookies
**Fix:**
1. Grep for localStorage: `grep -r "localStorage" frontend/`
2. Remove all auth localStorage code
3. Verify backend cookies are httpOnly

---

## Performance Notes

- AuthProvider fetches /me once on app mount → ~100-200ms
- Subsequent renders read context (no network) → instant
- Login/logout each requires one API call + fetchMe → ~200-400ms total
- Page refresh: middleware pre-check → instant redirect
- Token refresh: automatic via interceptor → transparent

---

## Monitoring & Debugging

### Add to monitoring:
- [ ] /api/auth/me/ - track 401 rate (should be low)
- [ ] /api/auth/login/ - track success rate
- [ ] /api/auth/refresh/ - track success rate
- [ ] AuthProvider error state - log when truthy
- [ ] useAuth() hook errors - log failures

### Debug tips:
```typescript
// In development, log auth state changes
useEffect(() => {
  console.log('Auth updated:', { user, isAuthenticated, isLoading })
}, [user, isAuthenticated, isLoading])

// Check cookies in DevTools
// Application → Cookies → check refresh_token
```

---

## Success Criteria

✅ **All of these must be true:**

1. Navbar shows correct state (logged in/out)
2. Page refresh keeps auth state
3. Multiple tabs sync auth state
4. Logout clears everything
5. Protected routes require auth
6. No localStorage auth code
7. No component reads cookies directly
8. Middleware redirects unauthenticated users
9. AuthProvider calls /me on mount
10. Login/logout update all components instantly

🎉 **When all above are true, deployment is ready!**

# Enterprise-Grade Authentication Architecture

## 🎯 Problem Statement

The previous authentication system had **multiple sources of truth** leading to desynchronization:

```
OLD (Broken) Architecture:
┌─────────────────────────────────────────┐
│         Multiple Auth Sources            │
├─────────────────────────────────────────┤
│ • localStorage (username, access_token) │
│ • Cookie (refresh_token - httpOnly)     │
│ • Token decode in components            │
│ • useUserFromToken hook (runs once)     │
│ • Navbar reads localStorage             │
│ • Middleware reads cookies              │
└─────────────────────────────────────────┘
         ↓
   DESYNC INEVITABLE
   ├─ Tab 1 logout → clears localStorage
   ├─ Tab 2 still has old localStorage
   ├─ Page refresh → new /me call differs
   ├─ Navbar out of sync with middleware
   └─ Components infer auth (wrong)
```

**Why this breaks:**

1. **Scattered state** - Auth info in multiple places
2. **No central updates** - Components don't know when to refetch
3. **No refresh trigger** - `useUserFromToken` runs once on mount
4. **Tab isolation** - localStorage changes don't cross-tab sync
5. **Silent failures** - Components assume auth instead of verifying
6. **Naive token reading** - Components decode JWT without backend verification

---

## ✅ NEW SOLUTION: Single Source of Truth

```
NEW (Enterprise) Architecture:
┌──────────────────────────────────────────┐
│       BACKEND: Source of Truth           │
│  /api/auth/me/ → 200 or 401 only        │
│  Auth cookies httpOnly, secure, SameSite│
└──────────────────┬───────────────────────┘
                   │ (verified)
                   ▼
        ┌──────────────────────┐
        │    AuthProvider      │  ◄─── SINGLE
        │     (React Context)  │      SOURCE
        │ ┌──────────────────┐ │      OF TRUTH
        │ │ user             │ │
        │ │ isAuthenticated  │ │
        │ │ isLoading        │ │
        │ └──────────────────┘ │
        │ ┌──────────────────┐ │
        │ │ login()          │ │
        │ │ logout()         │ │
        │ │ refresh()        │ │
        │ └──────────────────┘ │
        └─────────┬──────────┬─┘
                  │          │
            Updates only when:
            • App mounts (fetch /me)
            • User calls login/logout
            • Token refresh completes
                  │          │
         ┌────────┘          └─────────┐
         ▼                              ▼
    ┌─────────────┐          ┌────────────────┐
    │  Navbar     │          │ Route Middleware│
    │ (Consumer)  │          │  (Consumer)    │
    │ Uses useAuth│          │ Checks cookies │
    │ No cookies  │          │ Then redirects │
    │ No localStorage        │ AuthProvider   │
    └─────────────┘          │ verifies on pg │
                             └────────────────┘
```

---

## 🔄 Auth Flow (Exact Implementation)

### 1. APP INITIALIZATION

```typescript
// Step 1: App starts
ReactDOM.render(<App />, root)

// Step 2: Providers.tsx mounts
<AuthProvider>
  <QueryClientProvider>
    <App />
  </QueryClientProvider>
</AuthProvider>

// Step 3: AuthProvider.useEffect fires
useEffect(() => {
  fetchMe() // Fetch /api/auth/me/
}, [])

// Step 4: Backend responds
200: user exists → set user context
401: not auth → set user = null

// Step 5: Children render with auth state
<Navbar /> ← reads context, updates UI
```

### 2. LOGIN

```typescript
// User submits login form
POST /api/auth/login/ { username, password }
  ↓ (Backend sets httpOnly cookies)
Backend sets:
  - refresh_token (httpOnly, secure, SameSite=Strict)
  - access_token (httpOnly, secure, SameSite=Strict)
  ↓
Frontend calls login() in AuthProvider
  ↓
AuthProvider calls fetchMe()
  ↓
Backend returns user data
  ↓
setUser(userData)
  ↓
UI updates everywhere (Navbar, protected routes, etc.)
```

### 3. LOGOUT

```typescript
// User clicks logout
POST /api/auth/logout/
  ↓ (Backend clears cookies)
Backend deletes:
  - refresh_token cookie
  - Blacklists tokens
  ↓
Frontend logout() completes
  ↓
setUser(null)
  ↓
UI updates everywhere
  ↓
Middleware redirects to /auth/login on next navigation
```

### 4. PAGE REFRESH

```
User refreshes /dashboard

Middleware runs:
├─ Check: request.cookies.has('refresh_token')
├─ YES → proceed to page
└─ NO → redirect to /auth/login

Page loads → AuthProvider mounts
├─ useEffect fires
├─ fetchMe() called
└─ Backend verifies refresh_token cookie
    ├─ Valid → user context updates
    └─ Invalid → user = null, 401 response

Result:
✓ Navbar shows correct state
✓ Protected page renders (if auth)
✓ NO race conditions
✓ NO flickering (middleware pre-checks)
```

### 5. TAB SYNCHRONIZATION

```
Tab 1: User logs out
└─ POST /logout
   ├─ Backend deletes refresh_token cookie
   └─ All tabs: Backend cookie cleared

Tab 2: User refreshes page
└─ Middleware: checks refresh_token cookie
   ├─ NOT FOUND (Tab 1 deleted it)
   └─ Redirect to /auth/login

Result:
✓ All tabs sync via backend cookies
✓ No cross-tab messaging needed
✓ No localStorage inconsistencies
```

---

## 📁 NEW FILE STRUCTURE

```
frontend/
├── contexts/
│   ├── AuthContext.ts         ← Context definition
│   └── AuthProvider.tsx       ← Provider implementation
├── hooks/
│   └── useAuth.ts             ← Hook to access context
├── app/
│   ├── providers.tsx          ← Updated (includes AuthProvider)
│   ├── middleware.ts          ← Updated (better docs)
│   └── ...
├── components/
│   ├── Navbar.tsx             ← Refactored (uses useAuth)
│   └── ...
└── services/
    └── api/
        ├── client.ts          ← Existing (no changes needed)
        └── auth.ts            ← Existing (no changes needed)
```

---

## 🔐 Security Properties

### Cookie Strategy
```
REFRESH TOKEN:
├─ Path: /api/auth/
├─ HttpOnly: true        (XSS protection)
├─ Secure: true          (HTTPS only)
├─ SameSite: Strict      (CSRF protection)
└─ Long expiry (7-30 days)

ACCESS TOKEN:
├─ Path: /
├─ HttpOnly: true
├─ Secure: true
├─ SameSite: Strict
└─ Short expiry (5-15 min)
```

### XSS Prevention
- ✓ No auth tokens in localStorage
- ✓ Tokens in httpOnly cookies
- ✓ Frontend never accesses tokens
- ✓ Even if JS is compromised, attacker can't steal tokens

### CSRF Prevention
- ✓ SameSite=Strict cookies
- ✓ Automatic with httpOnly
- ✓ No manual CSRF tokens needed
- ✓ Invalid cross-site requests

---

## 🎯 Implementation Details

### AuthProvider

```typescript
// on mount
useEffect(() => {
  fetchMe()
}, [fetchMe])

// login()
const login = async (username, password) => {
  POST /auth/login/ { username, password }
  await fetchMe()  ← re-verify from backend
  setUser(userData)
}

// logout()
const logout = async () => {
  POST /auth/logout/  ← backend clears cookies
  setUser(null)
}

// refresh()
const refresh = async () => {
  POST /auth/refresh/  ← backend uses refresh_token cookie
  await fetchMe()
}
```

### Middleware

```typescript
// Step 1: Check for refresh_token cookie
const hasRefreshToken = request.cookies.has("refresh_token")

// Step 2: If protected route, require token
if (isProtectedPath && !hasRefreshToken) {
  redirect("/auth/login?next=/dashboard")
}

// Step 3: If auth page, redirect if already logged in
if (isAuthPage && hasRefreshToken) {
  redirect("/dashboard")
}

// Step 4: Proceed (AuthProvider will verify on page load)
```

---

## ✅ Why This Can't Desync

### Desync Vector 1: localStorage inconsistency
**OLD:** Tab 1 clears localStorage, Tab 2 still reads old value
**NEW:** Backend cookies are shared → all tabs get same truth

### Desync Vector 2: Multiple auth sources
**OLD:** localStorage + cookies + component state = chaos
**NEW:** Single source (backend) → one place to update

### Desync Vector 3: Stale token reading
**OLD:** Components decode JWT (might be expired)
**NEW:** AuthProvider calls /me (backend validates)

### Desync Vector 4: No refresh trigger
**OLD:** useUserFromToken runs once, never updates
**NEW:** AuthProvider refetches on login/logout/refresh

### Desync Vector 5: Navbar vs Middleware mismatch
**OLD:** Navbar reads localStorage, Middleware reads cookies
**NEW:** Both read backend cookies → identical behavior

### Desync Vector 6: Page refresh flicker
**OLD:** Page loads, Navbar in one state, component initializes in another
**NEW:** Middleware checks first → AuthProvider knows state before render

### Desync Vector 7: Component inference
**OLD:** Components assume "if token exists, I'm logged in"
**NEW:** Components ONLY trust AuthProvider.isAuthenticated

---

## 🧪 Testing the Architecture

### Test 1: Login Sync
```
1. Open app
2. Navbar shows "Login" button
3. Click Login → enter credentials
4. Navbar IMMEDIATELY shows username
5. Middleware allows /dashboard access
✓ Single source of truth at work
```

### Test 2: Logout Sync
```
1. User on /dashboard (logged in)
2. Click Logout
3. Navbar IMMEDIATELY shows "Login" button
4. Refresh page → redirected to /auth/login
✓ Backend cookie deleted instantly
```

### Test 3: Tab Sync
```
1. Open 2 tabs, both on /dashboard
2. Tab 1: Click Logout
3. Tab 2: Refresh page
4. Tab 2 redirected to /auth/login
✓ Cookies synced across tabs
```

### Test 4: Page Refresh
```
1. User logged in at /dashboard
2. Refresh page
3. Middleware checks refresh_token cookie
4. AuthProvider mounts, calls /me
5. User data loads, navbar shows username
✓ NO loading flicker (middleware pre-check)
```

### Test 5: Network Failure
```
1. Middleware passes (has cookie)
2. Page loads, AuthProvider calls /me
3. Network fails → 401
4. AuthProvider sets user = null
5. Component can handle gracefully
✓ Not a race condition
```

---

## 🚀 Deployment Checklist

- [ ] Backend has /api/auth/me/ with proper 401 response
- [ ] All auth endpoints set httpOnly cookies with SameSite=Strict
- [ ] Production: Secure flag = true (HTTPS only)
- [ ] AuthProvider replaces old auth logic
- [ ] Navbar uses useAuth hook only
- [ ] Middleware checks refresh_token cookie
- [ ] Old localStorage auth code removed
- [ ] useUserFromToken hook deprecated
- [ ] Test login/logout/refresh/tab-sync
- [ ] Test middleware protection
- [ ] Test SSR (AuthProvider mounts correctly)

---

## 📚 Reference Files

- [AuthContext.ts](../contexts/AuthContext.ts) - Context definition
- [AuthProvider.tsx](../contexts/AuthProvider.tsx) - Provider implementation
- [useAuth.ts](../hooks/useAuth.ts) - Hook to access auth
- [Navbar.tsx](../components/Navbar.tsx) - Refactored navbar
- [middleware.ts](../middleware.ts) - Updated middleware
- [providers.tsx](../app/providers.tsx) - App providers setup

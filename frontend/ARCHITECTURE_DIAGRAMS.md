# Authentication Architecture Diagram

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER (Multiple Tabs)                        │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Tab 1: /dashboard              Tab 2: /quizzes                        │ │
│  │  ┌──────────────────────────┐  ┌──────────────────────────┐           │ │
│  │  │ middleware.ts            │  │ middleware.ts            │           │ │
│  │  │ (checks refresh_token)   │  │ (checks refresh_token)   │           │ │
│  │  └────────────┬─────────────┘  └────────────┬─────────────┘           │ │
│  │               │                              │                          │ │
│  │  ┌────────────▼──────────────────────────────▼────────────────────────┐ │
│  │  │              Providers.tsx                                         │ │
│  │  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │  │  AuthProvider (SINGLE SOURCE OF TRUTH)                      │ │ │
│  │  │  │                                                              │ │ │
│  │  │  │  ┌────────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  │ State:                                                 │ │ │ │
│  │  │  │  │  • user: { id, username, email }                      │ │ │ │
│  │  │  │  │  • isAuthenticated: boolean                           │ │ │ │
│  │  │  │  │  • isLoading: boolean                                 │ │ │ │
│  │  │  │  │  • error: string | null                               │ │ │ │
│  │  │  │  └────────────────────────────────────────────────────────┘ │ │ │
│  │  │  │                                                              │ │ │
│  │  │  │  ┌────────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  │ Methods:                                               │ │ │ │
│  │  │  │  │  • login(username, password)                           │ │ │ │
│  │  │  │  │  • logout()                                            │ │ │ │
│  │  │  │  │  • refresh()                                           │ │ │ │
│  │  │  │  │  • fetchMe() [private]                                 │ │ │ │
│  │  │  │  └────────────────────────────────────────────────────────┘ │ │ │
│  │  │  │                                                              │ │ │
│  │  │  │  useEffect (Mount)                                          │ │ │
│  │  │  │    └─ fetchMe() ────────────────────────────────────────────┤ │ │
│  │  │  └──────────────┬─────────────────────────────────────────────┘ │ │
│  │  │                 │                                                │ │
│  │  └─────────────────┼────────────────────────────────────────────────┘ │
│  │                    │                                                   │
│  │  ┌─────────────────▼─────────────────────────────────────────────────┐ │
│  │  │ Components Consuming useAuth()                                   │ │
│  │  │                                                                   │ │
│  │  │  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐  │ │
│  │  │  │    Navbar       │  │ Dashboard Page   │  │ Protected Page │  │ │
│  │  │  │                 │  │                  │  │                │  │ │
│  │  │  │ const { user,   │  │ const { user,    │  │ const {        │  │ │
│  │  │  │  isAuth,        │  │  isLoading }     │  │  isLoading }   │  │ │
│  │  │  │  isLoading,     │  │                  │  │                │  │ │
│  │  │  │  logout }       │  │ if (isLoading)   │  │ if (isLoading) │  │ │
│  │  │  │   = useAuth()   │  │   return Spinner │  │   return Spin  │  │ │
│  │  │  │                 │  │                  │  │                │  │ │
│  │  │  │ {isAuth ?       │  │ if (!user)       │  │ return Content │  │ │
│  │  │  │   <LogoutBtn /> │  │   return Error   │  │                │  │ │
│  │  │  │   : <LoginBtn/> │  │                  │  │                │  │ │
│  │  │  │ }               │  │ return <Content/>│  │                │  │ │
│  │  │  └─────────────────┘  └──────────────────┘  └────────────────┘  │ │
│  │  │                                                                   │ │
│  │  └───────────────────────────────────────────────────────────────────┘ │
│  │                                                                          │
│  │  Cookies (httpOnly, Secure, SameSite=Strict)                           │
│  │  ├─ refresh_token  (set by: login, refresh)                            │
│  │  └─ access_token   (set by: login, refresh)                            │
│  │     [Shared across all tabs in same domain]                            │
│  │                                                                          │
│  └──────────────────────────────────────────────────────────────────────────┘
│                                                                              │
│  Network Requests:                                                          │
│  ├─ GET /api/auth/me/           (AuthProvider.fetchMe)                     │
│  ├─ POST /api/auth/login/        (AuthProvider.login)                      │
│  ├─ POST /api/auth/logout/       (AuthProvider.logout)                     │
│  └─ POST /api/auth/refresh/      (AuthProvider.refresh)                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/HTTPS
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Django + DRF)                                    │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Authentication Endpoints                                             │  │
│  │                                                                      │  │
│  │ POST /api/auth/login/                                               │  │
│  │   ├─ Validate credentials                                          │  │
│  │   ├─ Generate JWT tokens (access + refresh)                        │  │
│  │   ├─ Set httpOnly cookies                                          │  │
│  │   └─ Response: 200 OK or 401 Unauthorized                          │  │
│  │                                                                      │  │
│  │ POST /api/auth/register/                                            │  │
│  │   ├─ Validate (username unique, email, password)                   │  │
│  │   ├─ Create user                                                    │  │
│  │   ├─ Generate tokens                                               │  │
│  │   ├─ Set httpOnly cookies                                          │  │
│  │   └─ Response: 201 Created or 400 Bad Request                      │  │
│  │                                                                      │  │
│  │ GET /api/auth/me/  [IsAuthenticated]                               │  │
│  │   ├─ Read refresh_token from cookie                                │  │
│  │   ├─ If invalid → 401 Unauthorized                                 │  │
│  │   ├─ If valid → verify user still exists                           │  │
│  │   ├─ Return: { user: { id, username, email } }                     │  │
│  │   └─ Response: 200 OK or 401 Unauthorized                          │  │
│  │                                                                      │  │
│  │ POST /api/auth/refresh/  [AllowAny]                                │  │
│  │   ├─ Read refresh_token from cookie                                │  │
│  │   ├─ Generate new access_token                                     │  │
│  │   ├─ Optionally rotate refresh_token                               │  │
│  │   ├─ Set new cookies                                               │  │
│  │   └─ Response: 200 OK or 401 Unauthorized                          │  │
│  │                                                                      │  │
│  │ POST /api/auth/logout/  [AllowAny]                                 │  │
│  │   ├─ Read refresh_token from cookie                                │  │
│  │   ├─ Blacklist token (prevent reuse)                               │  │
│  │   ├─ Delete cookies                                                │  │
│  │   └─ Response: 200 OK (always succeeds)                            │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Database Layer                                                             │
│  ├─ User model (id, username, email, password_hash)                       │
│  ├─ Token Blacklist (optional, for explicit revocation)                   │
│  └─ Session tracking (optional)                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Authentication State Transitions

```
                         ┌─────────────────────┐
                         │   APP START         │
                         │  Provider Mounts    │
                         └──────────┬──────────┘
                                    │
                      ┌─────────────▼──────────────┐
                      │ fetchMe()                  │
                      │ GET /api/auth/me/          │
                      └─────────────┬──────────────┘
                                    │
                    ┌───────────────┴────────────────┐
                    │                                │
            ┌───────▼─────────┐          ┌───────────▼───────┐
            │ 200 OK          │          │ 401 Unauthorized  │
            │ User found      │          │ Not authenticated │
            └───────┬─────────┘          └───────────┬───────┘
                    │                                │
    ┌───────────────▼─────────────┐    ┌────────────▼────────────┐
    │ setUser(userData)           │    │ setUser(null)           │
    │ isAuthenticated = true       │    │ isAuthenticated = false │
    │ Navbar: Show Logout         │    │ Navbar: Show Login      │
    │ Middleware: Allow protected │    │ Middleware: Redirect    │
    └───────────────┬─────────────┘    └────────────┬────────────┘
                    │                                │
                    │                                │
        ┌───────────┴────────┐              ┌────────┴─────────┐
        │                    │              │                  │
        │ User clicks        │              │ User clicks      │
        │ Logout button      │              │ Login button     │
        │                    │              │                  │
        ▼                    │              │                  ▼
    ┌────────────────┐      │              │         ┌──────────────────┐
    │ POST /logout/  │      │              │         │ POST /login/     │
    │ (backend       │      │              │         │ (credentials)    │
    │  clears        │      │              │         │ (backend sets    │
    │  cookies)      │      │              │         │  cookies)        │
    │                │      │              │         │                  │
    │ setUser(null)  │      │              │         │ fetchMe()        │
    │ Component      │      │              │         │ setUser(data)    │
    │ updated        │      │              │         │ Component        │
    └────────────────┘      │              │         │ updated          │
                            │              │         └──────────────────┘
                            │              │
                    ┌───────▼──────────────▼────────┐
                    │ Navigation                     │
                    │ (middleware checks cookies)    │
                    │ Protected routes work/fail     │
                    └────────────────────────────────┘
```

---

## Data Flow: Login Sequence

```
BROWSER                          FRONTEND API               BACKEND
├─ User fills form               │                          │
│  (username, password)          │                          │
│                                │                          │
├─ Click "Sign In"               │                          │
│  ├─ useAuth().login()          │                          │
│  │  (via AuthProvider)         │                          │
│  │                             │                          │
│  │                    POST /api/auth/login/
│  │                    { username, password }
│  │                             ──────────────────────────▶ │
│  │                             │                          │ Validate
│  │                             │                          │ credentials
│  │                             │                          │
│  │                             │                          │ Generate JWT
│  │                             │                          │ tokens
│  │                             │                          │
│  │                             │                    Set cookies:
│  │                             │                    - refresh_token
│  │                             │                    - access_token
│  │                             │                    (httpOnly, Secure,
│  │                             │                     SameSite=Strict)
│  │                             │                          │
│  │                    ◀───────────────────────── 200 OK
│  │                    { detail: "..." }
│  │                             │
│  │                             │ Cookies stored in
│  │                             │ browser automatically
│  │                             │ (httpOnly - JS can't access)
│  │
│  ├─ fetchMe()                  │
│  │                    GET /api/auth/me/
│  │                    (cookies sent automatically)
│  │                             ──────────────────────────▶ │
│  │                             │                          │ Read
│  │                             │                          │ refresh_token
│  │                             │                          │ cookie
│  │                             │                          │
│  │                             │                          │ Validate
│  │                             │                          │ token
│  │                             │                          │
│  │                    ◀───────────────────────── 200 OK
│  │                    {                                    │
│  │                      user: {
│  │                        id: 123,
│  │                        username: "john",
│  │                        email: "john@example.com"
│  │                      }
│  │                    }
│  │
│  ├─ setUser(userData)
│  │  setIsAuthenticated(true)
│  │
│  └─ Re-render components
│     ├─ Navbar shows "john" + Logout
│     ├─ Protected pages now accessible
│     └─ Middleware allows /dashboard
│
└─ User can navigate freely
   (all requests include cookies automatically)
```

---

## Data Flow: Logout Sequence

```
BROWSER                          FRONTEND API               BACKEND
├─ User clicks Logout            │                          │
│  ├─ useAuth().logout()         │                          │
│  │                             │                          │
│  │                    POST /api/auth/logout/
│  │                    (cookies sent automatically)
│  │                             ──────────────────────────▶ │
│  │                             │                          │ Read
│  │                             │                          │ refresh_token
│  │                             │                          │ cookie
│  │                             │                          │
│  │                             │                          │ Blacklist
│  │                             │                          │ token
│  │                             │                          │
│  │                             │                    Delete cookies:
│  │                             │                    - refresh_token
│  │                             │                    - access_token
│  │                             │                          │
│  │                    ◀───────────────────────── 200 OK
│  │                    { detail: "..." }
│  │
│  ├─ setUser(null)
│  │  setIsAuthenticated(false)
│  │
│  └─ Re-render components
│     ├─ Navbar shows "Login" + "Sign up"
│     ├─ Protected pages show "Not authenticated"
│     └─ Middleware redirects to /auth/login
│
└─ Cookies cleared in browser
   (next requests don't include auth cookies)
```

---

## Refresh Token Flow

```
┌─ Automatic (via interceptor)
│  or Manual (useAuth().refresh())
│
├─ POST /api/auth/refresh/
│  (refresh_token cookie sent automatically)
│
├─ Backend validates refresh_token
│  ├─ Valid → Generate new access_token
│  └─ Invalid → Return 401
│
├─ Backend sets new cookies
│  ├─ access_token (new)
│  ├─ refresh_token (optionally rotated)
│  └─ Both httpOnly, Secure, SameSite=Strict
│
└─ Frontend can optionally:
   └─ Call fetchMe() to re-verify user
```

---

## Tab Synchronization Flow

```
TAB 1                     BACKEND                      TAB 2
(logged in)              (source of truth)             (logged in)

User clicks Logout
    │
    ├─ POST /logout/
    │  (refresh_token from cookie)
    │  ────────────────────────────────────────────────▶
    │                                          Delete cookies
    │                                          Blacklist token
    │  ◀─────────────────────────────────────────────── 200 OK
    │
    ├─ setUser(null)
    │  (local state cleared)
    │
    └─ Navbar updated
       (shows Login button)

                        User refreshes Page
                             │
                        Middleware checks:
                        request.cookies.get('refresh_token')
                        → NOT FOUND (backend deleted it)
                             │
                             ▼
                        Redirect to /auth/login
                             │
                             └─────────────────────▶ RESULT: Tab 2 now shows login


✓ No cross-tab messaging needed
✓ Cookies are shared at OS/browser level
✓ All tabs sync automatically via backend
```

---

## Why This Architecture is Desync-Proof

| Desync Vector | OLD (Problem) | NEW (Solution) |
|---|---|---|
| **localStorage sync** | Different values in different tabs | Backend cookies shared at OS level |
| **Multiple auth sources** | Component checks token + navbar checks localStorage + middleware checks cookies | Single AuthProvider → all read same source |
| **Stale token reading** | Component decodes JWT (doesn't know if expired) | AuthProvider calls /me (backend validates) |
| **Update trigger** | No automatic refetch on login/logout | AuthProvider calls fetchMe() after each action |
| **Page refresh flicker** | Navbar renders before checking auth | Middleware checks before page loads |
| **Network race conditions** | Multiple async auth checks | AuthProvider sequential: login → fetchMe → render |
| **Component inference** | "if token exists, I'm logged in" | "isAuthenticated from context" (verified by backend) |
| **Silent failures** | Component doesn't know if auth failed | 401 response is unambiguous |

---

## Security Properties Matrix

| Feature | HTTP-Only | Secure | SameSite | Expires | Backend-Only |
|---|---|---|---|---|---|
| **access_token** | ✅ | ✅ | Strict | 15 min | ✅ |
| **refresh_token** | ✅ | ✅ | Strict | 30 days | ✅ |
| **XSS Prevention** | ✅ | - | - | - | ✅ |
| **CSRF Prevention** | - | - | ✅ | - | - |
| **HTTPS Enforcement** | - | ✅ | - | - | - |
| **Token Expiry** | - | - | - | ✅ | ✅ |


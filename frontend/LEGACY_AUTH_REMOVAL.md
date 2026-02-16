# Legacy Auth Code Removal Guide

## ⚠️ DEPRECATED - DO NOT USE

This document lists all legacy authentication code that should be removed or replaced.

## Files to Delete

### 1. `frontend/hooks/useUserFromToken.ts`
**Status:** ❌ DEPRECATED
**Reason:** Replaced by AuthProvider + useAuth hook
**Action:** DELETE after verifying no imports

```bash
# Check for imports
grep -r "useUserFromToken" frontend/
```

### 2. `frontend/lib/api.ts` (if exists)
**Status:** ❌ DEPRECATED
**Reason:** Superseded by `frontend/services/api/client.ts`
**Action:** DELETE after verifying no imports

---

## Files to Replace

### 1. `frontend/services/api/auth.ts`
**Old:** Manual token handling, localStorage usage
**New:** Use AuthProvider.login() and AuthProvider.logout()

**BEFORE (OLD):**
```typescript
export async function login(username: string, password: string) {
  const res = await api.post("auth/login/", { username, password })
  const { access, refresh } = res.data
  if (access) {
    setAuthToken(access)  // ❌ Manual token handling
    localStorage.setItem("username", username)  // ❌ localStorage
  }
  return res.data
}
```

**AFTER (NEW):**
```typescript
// Don't use this file directly!
// Instead, use AuthProvider's login/logout methods:

const { login, logout } = useAuth()

// In a login form:
await login(username, password)  // ✓ Handles everything
```

---

## Components to Update

### 1. `frontend/components/Navbar.tsx` ✅ DONE
- ❌ Removed: `localStorage.getItem('access_token')`
- ❌ Removed: `localStorage.getItem('username')`
- ✅ Added: `useAuth()` hook
- ✅ Added: Loading state handling

### 2. Login Page: `frontend/app/auth/login/`
**Old Implementation:**
```typescript
// ❌ Direct API call + manual localStorage
const handleSubmit = async (e) => {
  const res = await api.post('auth/login/', { username, password })
  localStorage.setItem('access_token', res.data.access)
  localStorage.setItem('refresh_token', res.data.refresh)
  router.push('/dashboard')
}
```

**New Implementation:**
```typescript
// ✅ Use AuthProvider
const { login, isLoading } = useAuth()

const handleSubmit = async (e) => {
  try {
    await login(username, password)
    router.push('/dashboard')  // AuthProvider ensures auth state
  } catch (error) {
    setError(error.message)
  }
}
```

### 3. Protected Page Components
**Old Implementation:**
```typescript
// ❌ Component checks token itself
const Page = () => {
  const user = useUserFromToken()  // Runs once, never updates
  
  if (!user) return <Redirect to="/login" />
  return <Dashboard />
}
```

**New Implementation:**
```typescript
// ✅ Use middleware + context
// Middleware prevents access if not authed
// Page can trust auth state

const Page = () => {
  const { user, isLoading } = useAuth()
  
  if (isLoading) return <Skeleton />
  if (!user) return <div>Not authenticated</div>  // Shouldn't happen if middleware works
  return <Dashboard />
}
```

---

## API Client Configuration

### `frontend/services/api/client.ts`
**Current:** Uses httpOnly cookies automatically ✅

No changes needed. The client already:
- Sets `withCredentials: true` ✓
- Sends cookies automatically ✓
- Has error interceptor for 401 ✓

---

## Authentication Flow - Before vs After

### BEFORE (Problem)
```
User clicks Login
  ↓
POST /auth/login/
  ↓
localStorage.setItem('access_token', token)
  ↓
Component reads localStorage
  ↓
Navbar manually updates
  ↓
Page refresh → localStorage read again
  ↓
PROBLEM: localStorage can be out of sync
```

### AFTER (Solution)
```
User clicks Login
  ↓
useAuth().login() called
  ↓
POST /auth/login/ (backend sets cookies)
  ↓
AuthProvider calls /me (gets user from backend)
  ↓
setUser(userData)
  ↓
All components reading useAuth() update instantly
  ↓
Page refresh → middleware checks cookies → AuthProvider re-verifies
  ↓
GUARANTEED: Single source of truth
```

---

## Deprecation Timeline

### Phase 1: Add New (DONE)
- ✅ Create AuthProvider
- ✅ Create useAuth hook
- ✅ Update Navbar to use useAuth
- ✅ Update middleware

### Phase 2: Update Pages (TODO)
- [ ] Update login page to use useAuth().login()
- [ ] Update register page to use useAuth().login()
- [ ] Update protected pages to use useAuth()
- [ ] Update logout buttons to use useAuth().logout()

### Phase 3: Remove Old (TODO)
- [ ] Delete useUserFromToken.ts
- [ ] Delete old auth.ts (or gut it)
- [ ] Remove localStorage auth code
- [ ] Audit for remaining localStorage usage

---

## Checklist: Migration

- [ ] All login forms use `useAuth().login()`
- [ ] All logout buttons use `useAuth().logout()`
- [ ] All protected pages check `useAuth()` not localStorage
- [ ] No component decodes JWT tokens
- [ ] No `localStorage.getItem('access_token')`
- [ ] No `localStorage.getItem('refresh_token')`
- [ ] No `localStorage.getItem('username')`
- [ ] Middleware uses `request.cookies.has('refresh_token')`
- [ ] No page refreshes forced on auth state change
- [ ] No setTimeout hacks for auth state updates

---

## Common Mistakes to Avoid

### ❌ WRONG: Reading localStorage
```typescript
const token = localStorage.getItem('access_token')
if (token) {
  // Assume logged in
}
```

### ✅ CORRECT: Using AuthProvider
```typescript
const { isAuthenticated, isLoading } = useAuth()
if (isAuthenticated) {
  // Definitely logged in
}
```

---

### ❌ WRONG: Decoding JWT in component
```typescript
const payload = JSON.parse(atob(token.split('.')[1]))
const username = payload.username
```

### ✅ CORRECT: Using user from context
```typescript
const { user } = useAuth()
const username = user?.username
```

---

### ❌ WRONG: Multiple auth checks
```typescript
const token = localStorage.getItem('token')
const user = useUserFromToken()
const { isAuth } = useAuth()

if (token && user && isAuth) {
  // Consensus vote?
}
```

### ✅ CORRECT: Single source of truth
```typescript
const { isAuthenticated } = useAuth()

if (isAuthenticated) {
  // One source, no ambiguity
}
```

---

## Questions?

If you find code that:
- Reads cookies directly: Redirect to AuthProvider
- Uses localStorage for auth: Migrate to useAuth()
- Decodes JWT: Get user from useAuth()
- Has multiple auth checks: Consolidate to useAuth()
- Refreshes page for auth: Let AuthProvider handle it

All auth must flow through AuthProvider.

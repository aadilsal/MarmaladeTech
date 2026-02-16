import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Middleware - Route Protection
 *
 * This middleware protects routes by checking for valid auth cookies.
 * The auth cookies are set by the backend and are httpOnly.
 *
 * Flow:
 * 1. User navigates to /dashboard
 * 2. Middleware checks for valid refresh_token cookie
 * 3. No token → redirect to /auth/login
 * 4. Has token → proceed to page
 * 5. AuthProvider on page mounts, fetches /me, verifies
 *
 * Why cookies?
 * - httpOnly prevents XSS from stealing tokens
 * - Automatic with every request (no localStorage reading)
 * - Backend-controlled (can be revoked instantly)
 *
 * Protected routes that require authentication
 */
const protectedPaths = ["/dashboard", "/profile", "/quiz", "/results"]

/**
 * Public auth pages - redirect to dashboard if already logged in
 */
const authPages = ["/auth/login", "/auth/register", "/auth/forgot-password"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (process.env.NODE_ENV !== "production" && request.nextUrl.hostname === "localhost") {
    const url = request.nextUrl.clone()
    url.hostname = "127.0.0.1"
    return NextResponse.redirect(url)
  }

  // Check for refresh token (httpOnly cookie)
  // This is set by backend after login and removed after logout
  const hasRefreshToken = request.cookies.has("refresh_token")
  const hasAccessToken = request.cookies.has("access_token")
  const hasAuthCookie = hasRefreshToken || hasAccessToken

  // Check if this is a protected path
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  // Check if this is an auth page
  const isAuthPage = authPages.some(path => pathname.startsWith(path))

  /**
   * Rule 1: Protected paths require auth
   * If no refresh token, redirect to login
   */
  if (isProtectedPath && !hasAuthCookie) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  /**
   * Rule 2: Auth pages redirect to dashboard if already logged in
   * This prevents logged-in users from seeing login/register pages
   */
  if (isAuthPage && hasAuthCookie) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  // All checks passed, proceed
  return NextResponse.next()
}

export const config = {
  // Apply middleware to protected and auth routes
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/quiz/:path*",
    "/results/:path*",
    "/auth/:path*",
  ],
}

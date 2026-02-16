"use client"

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import type { AuthContextType } from '../contexts/AuthContext'

/**
 * Navbar - Refactored with Profile Dropdown Icon
 *
 * Features:
 * - Profile dropdown on hover (authenticated users)
 * - Mobile menu for navigation
 * - Links to About and Contact pages
 * - Uses AuthProvider (useAuth hook)
 */
export default function Navbar(){
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  let authContext: AuthContextType | null = null
  try {
    authContext = useAuth() as AuthContextType
  } catch (e) {
    // Not within AuthProvider, use default values
    authContext = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: async () => {},
      logout: async () => {},
      refresh: async () => {},
    }
  }

  const { user, isAuthenticated, isLoading, logout } = authContext

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      setProfileDropdownOpen(false)
      setMobileMenuOpen(false)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sky-700 font-bold text-lg">
            Marmalade Tech
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-4 text-sm text-slate-600">
            <Link href="/quizzes" className="hover:text-sky-600 transition-colors">
              Quizzes
            </Link>
            <Link href="/leaderboard" className="hover:text-sky-600 transition-colors">
              Leaderboard
            </Link>
            <Link href="/blogs" className="hover:text-sky-600 transition-colors">
              Blogs
            </Link>
            <Link href="/about" className="hover:text-sky-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-sky-600 transition-colors">
              Contact
            </Link>
          </nav>
        </div>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center gap-4">
          {isLoading ? (
            // Loading state
            <div className="flex items-center gap-2">
              <div className="h-2 w-16 bg-slate-200 rounded animate-pulse" />
            </div>
          ) : isAuthenticated && user ? (
            // Authenticated state - Profile dropdown with enhanced gradient
            <div className="relative" ref={profileDropdownRef}>
              <button
                onMouseEnter={() => setProfileDropdownOpen(true)}
                onMouseLeave={() => setProfileDropdownOpen(false)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 text-white font-bold shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                title={user.username}
              >
                {user.username.charAt(0).toUpperCase()}
              </button>

              {/* Dropdown Menu with enhanced styling */}
              {profileDropdownOpen && (
                <div
                  onMouseEnter={() => setProfileDropdownOpen(true)}
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-56 bg-white border-2 border-purple-100 rounded-xl shadow-xl py-2 z-50 animate-slide-up"
                >
                  <div className="px-4 py-3 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
                    <p className="text-sm font-bold text-slate-900">{user.username}</p>
                    <p className="text-xs text-slate-600">{user.email}</p>
                  </div>

                  <Link
                    href="/profile/me"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    View Profile
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </Link>

                  <div className="border-t border-purple-100 my-1" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Unauthenticated state
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="text-sm text-sky-600 hover:text-sky-700 transition-colors font-medium"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="text-sm text-white bg-sky-600 px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors font-medium"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          aria-label="Toggle menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded hover:bg-slate-100 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 5h14a1 1 0 010 2H3a1 1 0 110-2zm0 4h14a1 1 0 010 2H3a1 1 0 110-2zm0 4h14a1 1 0 010 2H3a1 1 0 110-2z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-6 py-4 flex flex-col gap-3">
            <Link
              href="/quizzes"
              className="text-slate-700 hover:text-sky-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Quizzes
            </Link>
            <Link
              href="/leaderboard"
              className="text-slate-700 hover:text-sky-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Leaderboard
            </Link>
            <Link
              href="/blogs"
              className="text-slate-700 hover:text-sky-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blogs
            </Link>
            <Link
              href="/about"
              className="text-slate-700 hover:text-sky-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-slate-700 hover:text-sky-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>

            <div className="pt-3 border-t">
              {isLoading ? (
                <div className="h-2 w-20 bg-slate-200 rounded animate-pulse" />
              ) : isAuthenticated && user ? (
                <div className="flex flex-col gap-3">
                  <div className="px-3 py-2 bg-sky-50 rounded-lg">
                    <p className="text-sm font-semibold text-slate-900">{user.username}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <Link
                    href="/profile/me"
                    className="text-slate-700 hover:text-sky-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    View Profile
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-slate-700 hover:text-sky-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-red-600 hover:text-red-700 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link
                    href="/auth/login"
                    className="flex-1 text-center px-3 py-2 text-slate-700 hover:bg-slate-100 rounded transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex-1 text-center px-3 py-2 text-white bg-sky-600 hover:bg-sky-700 rounded transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

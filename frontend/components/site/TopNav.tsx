"use client"

import Link from "next/link"
import { useState } from "react"
import { logout } from "../../services/api/auth"
import { useUserFromToken } from "../../hooks/useUserFromToken"
import { Button } from "../ui/button"

const navLinks = [
  { href: "/quizzes", label: "Quizzes" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analytics", label: "Analytics" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/profile", label: "Profile" },
]

const footerLinks = [
  { href: "/blogs", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export default function TopNav() {
  const [open, setOpen] = useState(false)
  const user = useUserFromToken()

  return (
    <header className="bg-white/80 backdrop-blur border-b">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          Marmalade Tech
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="hover:text-slate-900 transition-colors">
              {link.label}
            </Link>
          ))}
          <div className="relative group">
            <button className="hover:text-slate-900 transition-colors">Resources</button>
            <div className="absolute right-0 mt-0 w-40 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {footerLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user?.username ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">Hi, {user.username}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await logout()
                  window.location.href = "/auth/login"
                }}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="text-sm text-slate-600 hover:text-slate-900">
                Login
              </Link>
              <Button asChild size="sm">
                <Link href="/auth/register">Start Free</Link>
              </Button>
            </div>
          )}
        </div>

        <button
          className="md:hidden rounded-md border border-slate-200 p-2"
          onClick={() => setOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          <span className="block h-0.5 w-5 bg-slate-700" />
          <span className="mt-1 block h-0.5 w-5 bg-slate-700" />
          <span className="mt-1 block h-0.5 w-5 bg-slate-700" />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-4 space-y-3 text-sm">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="block text-slate-700 hover:text-blue-600">
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase">Resources</p>
              {footerLinks.map(link => (
                <Link key={link.href} href={link.href} className="block text-slate-700 hover:text-blue-600">
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="pt-2 border-t">
              {user?.username ? (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={async () => {
                    await logout()
                    window.location.href = "/auth/login"
                  }}
                >
                  Logout
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/auth/login">Login</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/auth/register">Start</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

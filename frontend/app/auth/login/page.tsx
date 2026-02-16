"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "../../../hooks/useAuth"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { login } from "../../../services/api/auth"
import type { AuthContextType } from "../../../contexts/AuthContext"

export default function LoginPage() {
  const router = useRouter()
  const authContext = useAuth() as AuthContextType
  const { refresh } = authContext
  
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      // 1. Call login API to set tokens
      await login(username, password)
      
      // 2. Call refresh to fetch user data from /me/ endpoint
      // This ensures AuthProvider updates with the user before redirect
      await refresh()
      
      // 3. Now redirect to dashboard with auth state confirmed
      router.push("/dashboard")
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <p className="text-sm text-slate-600">Log in to continue your MDCAT prep.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>
        <div className="mt-4 flex items-center justify-between text-sm">
          <Link href="/auth/forgot-password" className="text-brand-600">
            Forgot password?
          </Link>
          <Link href="/auth/register" className="text-slate-600">
            Create account
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

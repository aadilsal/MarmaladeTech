"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "../../../hooks/useAuth"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { register } from "../../../services/api/auth"
import type { AuthContextType } from "../../../contexts/AuthContext"

export default function RegisterPage() {
  const router = useRouter()
  const authContext = useAuth() as AuthContextType
  const { refresh } = authContext
  
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      console.info("[auth/register] Submitting registration", { username, email })
      // 1. Call register API to set tokens
      await register(username, email, password)
      console.info("[auth/register] Register API succeeded")
      
      // 2. Call refresh to fetch user data from /me/ endpoint
      // This ensures AuthProvider updates with the user before redirect
      await refresh()
      console.info("[auth/register] Auth refresh succeeded")
      
      // 3. Now redirect to dashboard with auth state confirmed
      router.push("/dashboard")
    } catch (err: any) {
      console.error("[auth/register] Registration failed", {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      })
      setError(err?.response?.data?.detail || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <p className="text-sm text-slate-600">Start your focused MDCAT practice today.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
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
            {loading ? "Creating..." : "Create account"}
          </Button>
        </form>
        <div className="mt-4 text-sm text-slate-600">
          Already have an account? <Link href="/auth/login" className="text-brand-600">Login</Link>
        </div>
      </CardContent>
    </Card>
  )
}

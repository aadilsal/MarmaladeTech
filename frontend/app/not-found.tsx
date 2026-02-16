import Link from "next/link"
import { Button } from "../components/ui/button"
import { AlertCircle, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <AlertCircle className="w-20 h-20 text-slate-300 mx-auto" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
        <p className="text-xl text-slate-600 mb-2">Page Not Found</p>
        <p className="text-slate-500 mb-8">
          Sorry, the page you're looking for doesn't exist. It might have been
          moved or deleted.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

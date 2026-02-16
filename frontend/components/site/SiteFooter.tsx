import Link from "next/link"

export default function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600">
        <p>© 2026 Marmalade Tech. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/quizzes" className="hover:text-slate-900">
            Quizzes
          </Link>
          <Link href="/dashboard" className="hover:text-slate-900">
            Dashboard
          </Link>
          <Link href="/profile" className="hover:text-slate-900">
            Profile
          </Link>
        </div>
      </div>
    </footer>
  )
}

import { ReactNode } from "react"
import { Button } from "./button"

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: { label: string; href?: string; onClick?: () => void }
}) {
  return (
    <div className="rounded-xl border bg-white p-6 text-center">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      {action && (
        <div className="mt-4">
          {action.href ? (
            <Button asChild>
              <a href={action.href}>{action.label}</a>
            </Button>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      )}
    </div>
  )
}

export function ErrorState({ title, description, onRetry }: { title: string; description: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <h3 className="text-lg font-semibold text-red-700">{title}</h3>
      <p className="mt-2 text-sm text-red-600">{description}</p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  )
}

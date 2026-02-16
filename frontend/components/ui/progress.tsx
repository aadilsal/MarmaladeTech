import * as React from "react"
import { cn } from "../../lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  variant?: "default" | "success" | "warning"
  animated?: boolean
}

export function Progress({ 
  value, 
  className, 
  variant = "default",
  animated = true,
  ...props 
}: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value))
  
  const colorClasses = {
    default: "bg-brand-600",
    success: "bg-success-600",
    warning: "bg-warning-500",
  }

  return (
    <div 
      className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-200", className)} 
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300 ease-out",
          colorClasses[variant],
          animated && "animate-pulse-subtle"
        )}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  )
}

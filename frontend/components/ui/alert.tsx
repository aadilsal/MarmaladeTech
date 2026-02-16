/**
 * Alert Component - Display errors, warnings, success messages
 */

import React from 'react'
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

export interface AlertProps {
  type: 'error' | 'success' | 'warning' | 'info'
  title?: string
  message: string
  onClose?: () => void
  dismissible?: boolean
}

export function Alert({
  type,
  title,
  message,
  onClose,
  dismissible = true,
}: AlertProps) {
  const styles = {
    error: {
      container: 'bg-red-50 border border-red-200 text-red-900',
      icon: 'text-red-600',
      title: 'text-red-900 font-semibold',
    },
    success: {
      container: 'bg-green-50 border border-green-200 text-green-900',
      icon: 'text-green-600',
      title: 'text-green-900 font-semibold',
    },
    warning: {
      container: 'bg-amber-50 border border-amber-200 text-amber-900',
      icon: 'text-amber-600',
      title: 'text-amber-900 font-semibold',
    },
    info: {
      container: 'bg-blue-50 border border-blue-200 text-blue-900',
      icon: 'text-blue-600',
      title: 'text-blue-900 font-semibold',
    },
  }

  const IconMap = {
    error: AlertCircle,
    success: CheckCircle2,
    warning: AlertTriangle,
    info: Info,
  }

  const Icon = IconMap[type]
  const style = styles[type]

  return (
    <div className={`rounded-lg p-4 flex gap-3 ${style.container}`}>
      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${style.icon}`} />
      <div className="flex-1">
        {title && <p className={style.title}>{title}</p>}
        <p className={title ? 'mt-1 text-sm' : 'text-sm'}>{message}</p>
      </div>
      {dismissible && onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 -mr-1 -mt-0.5 p-1 hover:bg-white/20 rounded transition"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

/**
 * FormError - Display error at top of form
 */
export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return <Alert type="error" title="Error" message={message} dismissible={false} />
}

/**
 * FormSuccess - Display success message
 */
export function FormSuccess({ message }: { message?: string }) {
  if (!message) return null
  return <Alert type="success" title="Success" message={message} dismissible={false} />
}

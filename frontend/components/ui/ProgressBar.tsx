import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  color?: 'brand' | 'success' | 'warning' | 'focus'
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
}

const colorStyles = {
  brand: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  focus: '#06b6d4',
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

const sizeValues = {
  sm: '0.375rem',
  md: '0.625rem',
  lg: '1rem',
}

export function ProgressBar({ 
  value, 
  max = 100, 
  label,
  color = 'brand',
  size = 'md',
  showPercentage = false
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && <span className="text-sm font-semibold text-gray-900">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          style={{
            height: sizeValues[size],
            backgroundColor: colorStyles[color],
            borderRadius: '9999px',
            width: 0
          }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

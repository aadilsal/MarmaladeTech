import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface StatCardProps {
  icon: ReactNode
  value: string | number
  label: string
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'brand' | 'success' | 'warning' | 'focus'
}

const colorClasses = {
  brand: {
    bg: 'bg-brand-50',
    text: 'text-brand-600',
    border: 'border-brand-200',
  },
  success: {
    bg: 'bg-success-50',
    text: 'text-success-600',
    border: 'border-success-200',
  },
  warning: {
    bg: 'bg-warning-50',
    text: 'text-warning-600',
    border: 'border-warning-200',
  },
  focus: {
    bg: 'bg-focus-50',
    text: 'text-focus-600',
    border: 'border-focus-200',
  },
}

export function StatCard({ 
  icon, 
  value, 
  label, 
  trend,
  color = 'brand' 
}: StatCardProps) {
  const colors = colorClasses[color]

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`relative overflow-hidden rounded-xl border-2 ${colors.border} bg-white p-6 shadow-card hover:shadow-card-hover transition-shadow`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <p className={`text-sm font-medium mt-2 ${trend.isPositive ? 'text-success-600' : 'text-red-600'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colors.bg} ${colors.text}`}>
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

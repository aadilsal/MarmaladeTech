/**
 * Simple Chart Components using Tailwind CSS
 * No external charting library required
 */

import React from 'react'

export interface BarChartData {
  name: string
  value: number
  maxValue?: number
  color?: string
}

export function BarChart({
  data,
  title,
  showValue = true,
}: {
  data: BarChartData[]
  title?: string
  showValue?: boolean
}) {
  const maxVal = Math.max(...data.map(d => d.maxValue || d.value || 0), 100)

  return (
    <div className="space-y-4">
      {title && <h3 className="font-semibold text-slate-900">{title}</h3>}
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-slate-700 font-medium">{item.name}</span>
              {showValue && <span className="text-sm font-semibold text-slate-900">{item.value}%</span>}
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  item.color || 'bg-blue-600'
                }`}
                style={{ width: `${Math.min((item.value / (item.maxValue || 100)) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export interface LineChartData {
  date: string
  value: number
}

export function LineChart({
  data,
  title,
  height = 200,
}: {
  data: LineChartData[]
  title?: string
  height?: number
}) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-slate-500 text-sm">Not enough data points</p>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value), 100)
  const minValue = Math.min(...data.map(d => d.value), 0)
  const range = maxValue - minValue || 1

  // Simple SVG line chart
  const points = data.map((item, idx) => {
    const x = (idx / (data.length - 1)) * 100
    const y = ((item.value - minValue) / range) * 100
    return { ...item, x: x, y: 100 - y }
  })

  const pathData = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <div className="space-y-3">
      {title && <h3 className="font-semibold text-slate-900">{title}</h3>}
      <svg
        viewBox="0 0 100 100"
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
      >
        {/* Grid */}
        <g stroke="#e2e8f0" strokeWidth="0.5" opacity="0.5">
          {[0, 25, 50, 75, 100].map(y => (
            <line key={`h-${y}`} x1="0" y1={y} x2="100" y2={y} />
          ))}
        </g>

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />

        {/* Points */}
        {points.map((p, idx) => (
          <circle
            key={`point-${idx}`}
            cx={p.x}
            cy={p.y}
            r="1"
            fill="#3b82f6"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="flex justify-between text-xs text-slate-600">
        <span>Min: {minValue.toFixed(0)}%</span>
        <span>Max: {maxValue.toFixed(0)}%</span>
      </div>
    </div>
  )
}

export interface StatData {
  label: string
  value: string | number
  subtext?: string
  color?: 'slate' | 'blue' | 'green' | 'purple' | 'orange'
}

export function StatGrid({ data }: { data: StatData[] }) {
  const colors = {
    slate: 'bg-slate-50 border-slate-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200',
  }

  const textColors = {
    slate: 'text-slate-900',
    blue: 'text-blue-900',
    green: 'text-green-900',
    purple: 'text-purple-900',
    orange: 'text-orange-900',
  }

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      {data.map((stat, idx) => (
        <div key={idx} className={`rounded-lg border p-4 ${colors[stat.color || 'slate']}`}>
          <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">{stat.label}</p>
          <p className={`text-2xl font-bold ${textColors[stat.color || 'slate']}`}>
            {stat.value}
          </p>
          {stat.subtext && <p className="text-xs text-slate-600 mt-1">{stat.subtext}</p>}
        </div>
      ))}
    </div>
  )
}

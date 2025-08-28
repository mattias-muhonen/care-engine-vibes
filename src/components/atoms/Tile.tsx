import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface TileProps {
  title: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
    positive: boolean
  }
  variant?: 'default' | 'warning' | 'critical' | 'success'
  children?: ReactNode
  onClick?: () => void
}

function Tile({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = 'default', 
  children, 
  onClick 
}: TileProps) {
  const variants = {
    default: 'bg-white border-gray-200',
    warning: 'bg-yellow-50 border-yellow-200',
    critical: 'bg-red-50 border-red-200',
    success: 'bg-green-50 border-green-200'
  }

  const valueColors = {
    default: 'text-primary-600',
    warning: 'text-yellow-600',
    critical: 'text-red-600',
    success: 'text-green-600'
  }

  return (
    <div 
      className={`rounded-lg shadow-sm border p-6 transition-colors ${variants[variant]} ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-700 mb-1">{title}</h3>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-bold ${valueColors[variant]}`}>
              {value}
            </p>
            {Icon && <Icon className={`w-6 h-6 ${valueColors[variant]}`} />}
          </div>
          
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-xs font-medium ${
                trend.positive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.positive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-gray-500 ml-1">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
      
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  )
}

export default Tile
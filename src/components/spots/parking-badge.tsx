import { cn } from '@/lib/utils'
import { PARKING_STATUS_CONFIG } from '@/lib/google-maps/config'
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react'
import type { ParkingLargeBike } from '@/types/database'

const icons = {
  ok: CheckCircle2,
  ng: XCircle,
  unknown: HelpCircle,
}

interface ParkingBadgeProps {
  status: ParkingLargeBike
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function ParkingBadge({
  status,
  size = 'md',
  showLabel = true,
  className,
}: ParkingBadgeProps) {
  const config = PARKING_STATUS_CONFIG[status]
  const Icon = icons[status]

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-0.5',
    md: 'text-sm px-2 py-1 gap-1',
    lg: 'text-base px-3 py-1.5 gap-1.5',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium text-white',
        config.bgClass,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && config.label}
    </span>
  )
}

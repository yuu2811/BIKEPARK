import { AlertTriangle, Info, AlertOctagon } from 'lucide-react'
import type { Database } from '@/types/database'

type Advisory = Database['public']['Tables']['spot_advisories']['Row']

interface AdvisoryBannerProps {
  advisory: Advisory
}

const severityConfig = {
  info: {
    icon: Info,
    bgClass: 'bg-blue-50 border-blue-200 text-blue-800',
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  },
  danger: {
    icon: AlertOctagon,
    bgClass: 'bg-red-50 border-red-200 text-red-800',
  },
}

const typeLabels: Record<string, string> = {
  road_closure: '通行止め',
  construction: '工事',
  weather: '天候注意',
  seasonal_closure: '季節閉鎖',
  other: 'お知らせ',
}

export function AdvisoryBanner({ advisory }: AdvisoryBannerProps) {
  const config = severityConfig[advisory.severity as keyof typeof severityConfig] || severityConfig.info
  const Icon = config.icon

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-3 ${config.bgClass}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-sm font-medium">
          {typeLabels[advisory.advisory_type] || advisory.advisory_type}
        </p>
        <p className="text-sm">{advisory.message}</p>
        {(advisory.starts_at || advisory.expires_at) && (
          <p className="mt-1 text-xs opacity-70">
            {advisory.starts_at && `${advisory.starts_at} から`}
            {advisory.expires_at && ` ${advisory.expires_at} まで`}
          </p>
        )}
      </div>
    </div>
  )
}

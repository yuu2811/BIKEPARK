import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ParkingBadge } from '@/components/spots/parking-badge'
import { Star, MapPin } from 'lucide-react'
import type { Database } from '@/types/database'

type Spot = Database['public']['Tables']['spots']['Row']

interface SpotCardProps {
  spot: Spot
  compact?: boolean
}

export function SpotInfoCard({ spot, compact }: SpotCardProps) {
  if (compact) {
    return (
      <Link href={`/spots/${spot.id}`} className="block min-w-[200px] max-w-[280px]">
        <div className="space-y-1.5 p-1">
          <h3 className="font-semibold leading-tight">{spot.name}</h3>
          <div className="flex items-center gap-2">
            <ParkingBadge status={spot.parking_large_bike} size="sm" />
            {spot.average_rating > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {spot.average_rating.toFixed(1)}
              </span>
            )}
          </div>
          {spot.formatted_address && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{spot.formatted_address}</span>
            </p>
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/spots/${spot.id}`}
      className="group block rounded-lg border bg-card transition-shadow hover:shadow-md"
    >
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="font-semibold leading-tight group-hover:text-primary">
            {spot.name}
          </h3>
          <ParkingBadge status={spot.parking_large_bike} size="sm" />
        </div>

        {spot.description && (
          <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
            {spot.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {spot.formatted_address && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{spot.prefecture || spot.formatted_address}</span>
            </span>
          )}
          {spot.average_rating > 0 && (
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {spot.average_rating.toFixed(1)} ({spot.review_count})
            </span>
          )}
          {spot.verification_tier !== 'unverified' && (
            <Badge variant="secondary" className="text-[10px]">
              {spot.verification_tier === 'rider_verified' && 'Rider Verified'}
              {spot.verification_tier === 'community_trusted' && 'Community Trusted'}
              {spot.verification_tier === 'well_established' && 'Well Established'}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  )
}

export function SpotCard({ spot }: { spot: Spot }) {
  return <SpotInfoCard spot={spot} />
}

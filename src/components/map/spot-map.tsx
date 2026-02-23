'use client'

import { useState, useCallback } from 'react'
import { Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps'
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, PARKING_STATUS_CONFIG, CATEGORY_COLORS } from '@/lib/google-maps/config'
import { SpotInfoCard } from '@/components/spots/spot-card'
import type { Database } from '@/types/database'

type Spot = Database['public']['Tables']['spots']['Row'] & {
  categories?: { slug: string }[]
}

interface SpotMapProps {
  spots: Spot[]
  onBoundsChanged?: (bounds: { north: number; south: number; east: number; west: number }) => void
  selectedSpotId?: string | null
  onSpotSelect?: (spotId: string | null) => void
  className?: string
}

export function SpotMap({
  spots,
  onBoundsChanged,
  selectedSpotId,
  onSpotSelect,
  className = 'h-[calc(100vh-3.5rem)]',
}: SpotMapProps) {
  const map = useMap()
  const [infoWindowSpot, setInfoWindowSpot] = useState<Spot | null>(null)

  const handleIdle = useCallback(() => {
    if (!map || !onBoundsChanged) return
    const bounds = map.getBounds()
    if (bounds) {
      const ne = bounds.getNorthEast()
      const sw = bounds.getSouthWest()
      onBoundsChanged({
        north: ne.lat(),
        south: sw.lat(),
        east: ne.lng(),
        west: sw.lng(),
      })
    }
  }, [map, onBoundsChanged])

  const handleMarkerClick = (spot: Spot) => {
    setInfoWindowSpot(spot)
    onSpotSelect?.(spot.id)
  }

  return (
    <Map
      defaultCenter={MAP_DEFAULT_CENTER}
      defaultZoom={MAP_DEFAULT_ZOOM}
      mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || undefined}
      gestureHandling="greedy"
      disableDefaultUI={false}
      className={className}
      onIdle={handleIdle}
    >
      {spots.map((spot) => {
        const categorySlug = spot.categories?.[0]?.slug || 'scenic_spot'
        const markerColor = CATEGORY_COLORS[categorySlug] || '#3b82f6'
        const parkingConfig = PARKING_STATUS_CONFIG[spot.parking_large_bike]

        return (
          <AdvancedMarker
            key={spot.id}
            position={{ lat: spot.latitude, lng: spot.longitude }}
            onClick={() => handleMarkerClick(spot)}
          >
            <div className="relative flex flex-col items-center">
              {/* Parking status indicator */}
              <div
                className="mb-0.5 h-2.5 w-2.5 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: parkingConfig.color }}
                title={parkingConfig.label}
              />
              {/* Category marker */}
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-md transition-transform hover:scale-110"
                style={{ backgroundColor: markerColor }}
              >
                <span className="text-xs font-bold text-white">
                  {spot.name.charAt(0)}
                </span>
              </div>
              {/* Pin tail */}
              <div
                className="h-2 w-0.5"
                style={{ backgroundColor: markerColor }}
              />
            </div>
          </AdvancedMarker>
        )
      })}

      {infoWindowSpot && (
        <InfoWindow
          position={{
            lat: infoWindowSpot.latitude,
            lng: infoWindowSpot.longitude,
          }}
          onCloseClick={() => {
            setInfoWindowSpot(null)
            onSpotSelect?.(null)
          }}
          pixelOffset={[0, -40]}
        >
          <SpotInfoCard spot={infoWindowSpot} compact />
        </InfoWindow>
      )}
    </Map>
  )
}

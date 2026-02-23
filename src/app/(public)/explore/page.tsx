'use client'

import { useState, useCallback, useEffect } from 'react'
import { MapProvider } from '@/components/map/map-provider'
import { SpotMap } from '@/components/map/spot-map'
import { SpotFilters } from '@/components/spots/spot-filters'
import { SpotInfoCard } from '@/components/spots/spot-card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { List, Map as MapIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Database, ParkingLargeBike } from '@/types/database'

type Spot = Database['public']['Tables']['spots']['Row']
type Category = Database['public']['Tables']['categories']['Row']

interface Bounds {
  north: number
  south: number
  east: number
  west: number
}

interface Filters {
  query: string
  parkingFilter: ParkingLargeBike | 'all'
  selectedCategories: number[]
  prefecture: string
}

export default function ExplorePage() {
  const [spots, setSpots] = useState<Spot[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [bounds, setBounds] = useState<Bounds | null>(null)
  const [loading, setLoading] = useState(false)
  const [panelOpen, setPanelOpen] = useState(true)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({
    query: '',
    parkingFilter: 'all',
    selectedCategories: [],
    prefecture: '',
  })

  const supabase = createClient()

  // Load categories once
  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order')
      if (data) setCategories(data)
    }
    loadCategories()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch spots when bounds or filters change
  const fetchSpots = useCallback(async () => {
    if (!bounds) return
    setLoading(true)

    try {
      let query = supabase
        .from('spots')
        .select('*, spot_categories(category_id)')
        .eq('is_active', true)
        .gte('latitude', bounds.south)
        .lte('latitude', bounds.north)
        .gte('longitude', bounds.west)
        .lte('longitude', bounds.east)
        .limit(200)

      if (filters.parkingFilter !== 'all') {
        query = query.eq('parking_large_bike', filters.parkingFilter)
      }

      if (filters.query) {
        query = query.ilike('name', `%${filters.query}%`)
      }

      const { data } = await query

      if (data) {
        let filtered = data
        if (filters.selectedCategories.length > 0) {
          filtered = data.filter((spot: Spot & { spot_categories?: { category_id: number }[] }) =>
            spot.spot_categories?.some((sc: { category_id: number }) =>
              filters.selectedCategories.includes(sc.category_id)
            )
          )
        }
        setSpots(filtered)
      }
    } finally {
      setLoading(false)
    }
  }, [bounds, filters, supabase])

  useEffect(() => {
    const timer = setTimeout(fetchSpots, 300)
    return () => clearTimeout(timer)
  }, [fetchSpots])

  return (
    <div className="relative flex h-[calc(100vh-3.5rem)]">
      {/* Side panel */}
      <div
        className={`absolute left-0 top-0 z-10 h-full w-80 transform border-r bg-background transition-transform md:relative ${
          panelOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Panel header */}
          <div className="border-b p-3">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                スポット探索
                {spots.length > 0 && (
                  <span className="ml-1 text-muted-foreground">({spots.length})</span>
                )}
              </h2>
              <div className="flex gap-1">
                <Button
                  variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setViewMode('map')}
                >
                  <MapIcon className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <SpotFilters
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories}
            />
          </div>

          {/* Spot list */}
          <div className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : spots.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <p>この範囲にスポットがありません</p>
                <p className="mt-1">地図を移動するか、フィルタを変更してください</p>
              </div>
            ) : (
              <div className="space-y-2">
                {spots.map((spot) => (
                  <div
                    key={spot.id}
                    className={selectedSpotId === spot.id ? 'ring-2 ring-primary rounded-lg' : ''}
                    onClick={() => setSelectedSpotId(spot.id)}
                  >
                    <SpotInfoCard spot={spot} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Panel toggle */}
      <button
        className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-r-md border border-l-0 bg-background p-1 shadow-sm md:left-auto"
        style={{ left: panelOpen ? '320px' : '0' }}
        onClick={() => setPanelOpen(!panelOpen)}
      >
        {panelOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {/* Map */}
      <div className="flex-1">
        <MapProvider>
          <SpotMap
            spots={spots}
            onBoundsChanged={setBounds}
            selectedSpotId={selectedSpotId}
            onSpotSelect={setSelectedSpotId}
          />
        </MapProvider>
      </div>
    </div>
  )
}

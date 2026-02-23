import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ExternalLink, MapPin, Clock, Route as RouteIcon } from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('routes').select('title, description').eq('id', id).single()
  if (!data) return { title: 'ルート' }
  return { title: `${data.title} - BIKEPARK`, description: data.description || undefined }
}

export default async function RouteDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: route } = await supabase
    .from('routes')
    .select('*, profiles(display_name, avatar_url)')
    .eq('id', id)
    .single()

  if (!route) notFound()

  const { data: stops } = await supabase
    .from('route_stops')
    .select('*, spots(name, parking_large_bike)')
    .eq('route_id', id)
    .order('sort_order')

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold">
            <RouteIcon className="h-8 w-8 text-primary" />
            {route.title}
          </h1>
          {route.description && (
            <p className="mb-3 text-muted-foreground">{route.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {route.total_distance_km && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {Number(route.total_distance_km).toFixed(1)}km
              </span>
            )}
            {route.estimated_duration_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                約{Math.floor(route.estimated_duration_minutes / 60)}時間{route.estimated_duration_minutes % 60}分
              </span>
            )}
            <span>
              {(route.profiles as { display_name: string })?.display_name || 'ライダー'}
            </span>
          </div>
        </div>

        {/* Google Maps link */}
        {route.google_maps_url && (
          <div className="mb-6">
            <a href={route.google_maps_url} target="_blank" rel="noopener noreferrer">
              <Button className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Googleマップで開く
              </Button>
            </a>
          </div>
        )}

        {/* Stops */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">停車地 ({stops?.length || 0})</h2>
          {stops?.map((stop, index) => {
            const spotData = stop.spots as unknown as { name: string; parking_large_bike: string } | null

            return (
              <Card key={stop.id}>
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {spotData?.name || stop.custom_name || `地点 ${index + 1}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                      {stop.stop_type === 'via' && ' (経由地)'}
                    </p>
                    {stop.notes && (
                      <p className="mt-1 text-xs italic text-muted-foreground">{stop.notes}</p>
                    )}
                  </div>
                  {stop.spot_id && (
                    <Link href={`/spots/${stop.spot_id}`}>
                      <Button variant="ghost" size="sm">詳細</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

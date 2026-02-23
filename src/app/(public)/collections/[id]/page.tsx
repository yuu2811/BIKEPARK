import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ParkingBadge } from '@/components/spots/parking-badge'
import { GitFork, MapPin, Star, ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('collections').select('title, description').eq('id', id).single()
  if (!data) return { title: 'コレクション' }
  return { title: `${data.title} - BIKEPARK`, description: data.description || undefined }
}

export default async function CollectionDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: collection } = await supabase
    .from('collections')
    .select('*, profiles(display_name, avatar_url)')
    .eq('id', id)
    .single()

  if (!collection) notFound()

  const { data: items } = await supabase
    .from('collection_items')
    .select('*, spots(*)')
    .eq('collection_id', id)
    .order('sort_order')

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">{collection.title}</h1>
        {collection.description && (
          <p className="mb-3 text-muted-foreground">{collection.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {collection.spot_count}スポット
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="h-4 w-4" />
            {collection.fork_count}フォーク
          </span>
          <span>
            {(collection.profiles as { display_name: string })?.display_name || 'ライダー'}
          </span>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <form action={`/api/fork-collection?id=${id}`} method="POST">
          <Button variant="outline" size="sm" className="gap-1.5">
            <GitFork className="h-4 w-4" />
            フォークする
          </Button>
        </form>
      </div>

      <div className="space-y-3">
        {items?.map((item, index) => {
          const spot = item.spots as unknown as { id: string; name: string; formatted_address: string | null; parking_large_bike: 'ok' | 'ng' | 'unknown'; average_rating: number; review_count: number; latitude: number; longitude: number }
          if (!spot) return null

          return (
            <Card key={item.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <Link href={`/spots/${spot.id}`} className="font-semibold hover:text-primary">
                    {spot.name}
                  </Link>
                  {spot.formatted_address && (
                    <p className="text-xs text-muted-foreground">{spot.formatted_address}</p>
                  )}
                  {item.note && (
                    <p className="mt-1 text-xs italic text-muted-foreground">{item.note}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <ParkingBadge status={spot.parking_large_bike} size="sm" />
                  {spot.average_rating > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {Number(spot.average_rating).toFixed(1)}
                    </span>
                  )}
                  <Link
                    href={`https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`}
                    target="_blank"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

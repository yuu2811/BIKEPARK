import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SpotCard } from '@/components/spots/spot-card'
import { MapPin, Star, FolderOpen, Route, Shield, Bike } from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('display_name').eq('id', id).single()
  if (!data) return { title: 'ライダー' }
  return { title: `${data.display_name} - BIKEPARK` }
}

export default async function RiderProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const { data: bikes } = await supabase
    .from('user_bikes')
    .select('*')
    .eq('user_id', id)

  const { data: badges } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', id)

  const { data: spots } = await supabase
    .from('spots')
    .select('*')
    .eq('created_by', id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(6)

  const { count: spotCount } = await supabase
    .from('spots')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', id)
    .eq('is_active', true)

  const { count: reviewCount } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', id)

  const badgeLabels: Record<string, string> = {
    trail_blazer: 'Trail Blazer',
    road_captain: 'Road Captain',
    curator: 'Curator',
    parking_scout: 'Parking Scout',
  }

  const bikeTypeLabels: Record<string, string> = {
    touring: 'ツアラー', adventure: 'アドベンチャー', sport: 'スポーツ',
    cruiser: 'クルーザー', naked: 'ネイキッド', 'off-road': 'オフロード',
    scooter: 'スクーター', other: 'その他',
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-3xl">
        {/* Profile header */}
        <div className="mb-8 flex items-start gap-4">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={`${profile.display_name}のアバター`} width={64} height={64} className="h-16 w-16 rounded-full" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-2xl font-bold">
              {profile.display_name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{profile.display_name}</h1>
            {profile.home_prefecture && (
              <p className="text-sm text-muted-foreground">{profile.home_prefecture}</p>
            )}
            {profile.bio && <p className="mt-1 text-sm">{profile.bio}</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 flex gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold">{spotCount || 0}</p>
            <p className="text-xs text-muted-foreground">スポット</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{reviewCount || 0}</p>
            <p className="text-xs text-muted-foreground">レビュー</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Bikes */}
          {bikes && bikes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bike className="h-5 w-5" />
                  バイク
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {bikes.map((bike) => (
                  <div key={bike.id} className="rounded-md bg-muted p-2">
                    <p className="font-medium">{bike.manufacturer} {bike.model}</p>
                    <p className="text-xs text-muted-foreground">
                      {bike.displacement_cc && `${bike.displacement_cc}cc`}
                      {bike.bike_type && ` / ${bikeTypeLabels[bike.bike_type] || bike.bike_type}`}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Badges */}
          {badges && badges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5" />
                  バッジ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge) => (
                    <Badge key={badge.id} variant="secondary">
                      {badgeLabels[badge.badge_type] || badge.badge_type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent spots */}
        {spots && spots.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-4 text-lg font-semibold">登録スポット</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {spots.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, FolderOpen, Route, Star, Plus, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'ダッシュボード',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { count: spotCount } = await supabase
    .from('spots')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', user.id)
    .eq('is_active', true)

  const { count: reviewCount } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: collectionCount } = await supabase
    .from('collections')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: routeCount } = await supabase
    .from('routes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: verificationCount } = await supabase
    .from('parking_verifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { data: badges } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', user.id)

  const { data: recentSpots } = await supabase
    .from('spots')
    .select('id, name, created_at')
    .eq('created_by', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: '登録スポット', value: spotCount || 0, icon: MapPin, color: 'text-green-500' },
    { label: 'レビュー', value: reviewCount || 0, icon: Star, color: 'text-yellow-500' },
    { label: 'コレクション', value: collectionCount || 0, icon: FolderOpen, color: 'text-blue-500' },
    { label: 'ルート', value: routeCount || 0, icon: Route, color: 'text-purple-500' },
    { label: '駐車場確認', value: verificationCount || 0, icon: Shield, color: 'text-orange-500' },
  ]

  const badgeLabels: Record<string, string> = {
    trail_blazer: 'Trail Blazer',
    road_captain: 'Road Captain',
    curator: 'Curator',
    parking_scout: 'Parking Scout',
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            こんにちは、{profile?.display_name || 'ライダー'}さん
          </h1>
          <p className="text-muted-foreground">あなたの貢献状況</p>
        </div>
        <Link href="/spots/new">
          <Button className="gap-1.5">
            <Plus className="h-4 w-4" />
            スポット登録
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <stat.icon className={`mx-auto mb-1 h-6 w-6 ${stat.color}`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">獲得バッジ</CardTitle>
          </CardHeader>
          <CardContent>
            {badges && badges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <Badge key={badge.id} variant="secondary" className="text-sm">
                    {badgeLabels[badge.badge_type] || badge.badge_type}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                スポットを登録したりレビューを書くとバッジを獲得できます
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent spots */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">最近登録したスポット</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSpots && recentSpots.length > 0 ? (
              <ul className="space-y-2">
                {recentSpots.map((spot) => (
                  <li key={spot.id}>
                    <Link
                      href={`/spots/${spot.id}`}
                      className="flex items-center justify-between text-sm hover:text-primary"
                    >
                      <span>{spot.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(spot.created_at).toLocaleDateString('ja-JP')}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                まだスポットを登録していません
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

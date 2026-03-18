import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ParkingBadge } from '@/components/spots/parking-badge'
import { ReviewSection } from '@/components/reviews/review-section'
import { VerificationSection } from '@/components/shared/verification-section'
import { AdvisoryBanner } from '@/components/shared/advisory-banner'
import {
  MapPin,
  Star,
  Globe,
  Phone,
  Calendar,
  Shield,
  ExternalLink,
  FolderPlus,
  Route,
  ParkingSquare,
} from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: spot } = await supabase.from('spots').select('name, description, prefecture').eq('id', id).single()

  if (!spot) return { title: 'スポットが見つかりません' }

  return {
    title: `${spot.name} - BIKEPARK`,
    description: spot.description || `${spot.name}の詳細情報 - ${spot.prefecture || ''}のツーリングスポット`,
  }
}

export default async function SpotDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: spot } = await supabase
    .from('spots')
    .select('*, profiles(display_name, avatar_url)')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!spot) notFound()

  const { data: categories } = await supabase
    .from('spot_categories')
    .select('categories(id, name_ja, slug, color)')
    .eq('spot_id', id)

  const { data: photos } = await supabase
    .from('spot_photos')
    .select('*')
    .eq('spot_id', id)
    .order('sort_order')

  const { data: advisories } = await supabase
    .from('spot_advisories')
    .select('*')
    .eq('spot_id', id)
    .eq('is_active', true)

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles(display_name, avatar_url)')
    .eq('spot_id', id)
    .order('created_at', { ascending: false })

  const parkingSurfaceLabels: Record<string, string> = {
    paved: '舗装', gravel: '砂利', dirt: '土', grass: '芝生', mixed: '複合',
  }
  const parkingSlopeLabels: Record<string, string> = {
    flat: '平坦', slight: 'やや傾斜', steep: '急傾斜',
  }
  const seasonLabels: Record<string, string> = {
    spring: '春', summer: '夏', autumn: '秋', winter: '冬',
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spotCategories = categories?.map((sc: any) => sc.categories).filter(Boolean).flat() as { id: number; name_ja: string; slug: string; color: string }[] ?? []

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Advisories */}
      {advisories && advisories.length > 0 && (
        <div className="mb-4 space-y-2">
          {advisories.map((advisory) => (
            <AdvisoryBanner key={advisory.id} advisory={advisory} />
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header */}
          <div>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {spotCategories.map((cat: { id: number; name_ja: string; color: string }) => (
                <Badge key={cat.id} style={{ backgroundColor: cat.color }} className="text-white">
                  {cat.name_ja}
                </Badge>
              ))}
            </div>
            <h1 className="mb-2 text-3xl font-bold">{spot.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {spot.formatted_address && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {spot.formatted_address}
                </span>
              )}
              {spot.average_rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {Number(spot.average_rating).toFixed(1)} ({spot.review_count}件)
                </span>
              )}
              {spot.verification_tier !== 'unverified' && (
                <span className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  {spot.verification_tier === 'rider_verified' && 'Rider Verified'}
                  {spot.verification_tier === 'community_trusted' && 'Community Trusted'}
                  {spot.verification_tier === 'well_established' && 'Well Established'}
                  ({spot.verification_count}件確認)
                </span>
              )}
            </div>
          </div>

          {/* Photos */}
          {photos && photos.length > 0 && (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {photos.map((photo) => (
                <div key={photo.id} className="aspect-video overflow-hidden rounded-lg bg-muted">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/spot-photos/${photo.storage_path}`}
                    alt={photo.caption || spot.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {spot.description && (
            <div>
              <h2 className="mb-2 text-lg font-semibold">概要</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{spot.description}</p>
            </div>
          )}

          {/* Parking Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ParkingSquare className="h-5 w-5" />
                駐車場情報
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">大型バイク駐車</p>
                  <ParkingBadge status={spot.parking_large_bike} size="lg" />
                </div>
                {spot.parking_spots_estimate && (
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">推定台数</p>
                    <p className="font-medium">約{spot.parking_spots_estimate}台</p>
                  </div>
                )}
                {spot.parking_surface && (
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">路面</p>
                    <p className="font-medium">{parkingSurfaceLabels[spot.parking_surface]}</p>
                  </div>
                )}
                {spot.parking_slope && (
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">傾斜</p>
                    <p className="font-medium">{parkingSlopeLabels[spot.parking_slope]}</p>
                  </div>
                )}
                {spot.parking_covered !== null && (
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">屋根</p>
                    <p className="font-medium">{spot.parking_covered ? 'あり' : 'なし'}</p>
                  </div>
                )}
                {spot.parking_free !== null && (
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">料金</p>
                    <p className="font-medium">{spot.parking_free ? '無料' : '有料'}</p>
                  </div>
                )}
              </div>
              {spot.parking_notes && (
                <div className="mt-4 rounded-md bg-muted p-3">
                  <p className="text-sm">{spot.parking_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification */}
          <VerificationSection spotId={spot.id} currentTier={spot.verification_tier} count={spot.verification_count} />

          {/* Reviews */}
          <ReviewSection spotId={spot.id} reviews={reviews || []} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <Card>
            <CardContent className="space-y-2 p-4">
              <Link
                href={`https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`}
                target="_blank"
                className="block"
              >
                <Button className="w-full gap-2" variant="outline">
                  <ExternalLink className="h-4 w-4" />
                  Googleマップで開く
                </Button>
              </Link>
              <Button className="w-full gap-2" variant="outline">
                <FolderPlus className="h-4 w-4" />
                コレクションに追加
              </Button>
              <Link href={`/route-builder?spot=${spot.id}`} className="block">
                <Button className="w-full gap-2" variant="outline">
                  <Route className="h-4 w-4" />
                  ルートに追加
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardContent className="space-y-3 p-4">
              {spot.website_url && (
                <a
                  href={spot.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  ウェブサイト
                </a>
              )}
              {spot.phone && (
                <p className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {spot.phone}
                </p>
              )}
              {spot.best_season && spot.best_season.length > 0 && (
                <div>
                  <p className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    おすすめの季節
                  </p>
                  <div className="flex gap-1">
                    {spot.best_season.map((s: string) => (
                      <Badge key={s} variant="secondary">
                        {seasonLabels[s] || s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {spot.access_notes && (
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">アクセス</p>
                  <p className="text-sm">{spot.access_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contributor */}
          <Card>
            <CardContent className="p-4">
              <p className="mb-2 text-xs text-muted-foreground">登録者</p>
              <div className="flex items-center gap-2">
                {(spot.profiles as { display_name: string; avatar_url: string | null })?.avatar_url && (
                  <img
                    src={(spot.profiles as { avatar_url: string }).avatar_url}
                    alt=""
                    className="h-6 w-6 rounded-full"
                  />
                )}
                <span className="text-sm font-medium">
                  {(spot.profiles as { display_name: string })?.display_name || 'ライダー'}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(spot.created_at).toLocaleDateString('ja-JP')}に登録
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

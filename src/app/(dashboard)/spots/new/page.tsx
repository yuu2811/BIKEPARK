'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapProvider } from '@/components/map/map-provider'
import { createSpot, type SpotFormData } from '@/actions/spots'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  ArrowRight,
  ParkingSquare,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MapPin,
} from 'lucide-react'
import { Map, AdvancedMarker, type MapMouseEvent } from '@vis.gl/react-google-maps'
import { MAP_DEFAULT_CENTER } from '@/lib/google-maps/config'
import type { Database } from '@/types/database'

type Category = Database['public']['Tables']['categories']['Row']

const steps = ['場所', '基本情報', '駐車場情報', '追加情報', '確認']

export default function NewSpotPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [formattedAddress, setFormattedAddress] = useState('')
  const [prefecture, setPrefecture] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [parkingLargeBike, setParkingLargeBike] = useState<'ok' | 'ng' | 'unknown'>('unknown')
  const [parkingSpotsEstimate, setParkingSpotsEstimate] = useState('')
  const [parkingSurface, setParkingSurface] = useState<string>('')
  const [parkingSlope, setParkingSlope] = useState<string>('')
  const [parkingCovered, setParkingCovered] = useState<boolean | undefined>()
  const [parkingFree, setParkingFree] = useState<boolean | undefined>()
  const [parkingNotes, setParkingNotes] = useState('')
  const [bestSeason, setBestSeason] = useState<string[]>([])
  const [accessNotes, setAccessNotes] = useState('')

  const supabase = createClient()

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

  const handleMapClick = (e: MapMouseEvent) => {
    const latLng = e.detail?.latLng
    if (latLng) {
      setLatitude(latLng.lat)
      setLongitude(latLng.lng)
    }
  }

  const handleSubmit = async () => {
    if (!latitude || !longitude) return
    setLoading(true)
    setError('')

    const formData: SpotFormData = {
      name,
      description: description || undefined,
      latitude,
      longitude,
      formatted_address: formattedAddress || undefined,
      prefecture: prefecture || undefined,
      website_url: websiteUrl || undefined,
      phone: phone || undefined,
      parking_large_bike: parkingLargeBike,
      parking_spots_estimate: parkingSpotsEstimate ? parseInt(parkingSpotsEstimate) : undefined,
      parking_surface: parkingSurface as SpotFormData['parking_surface'],
      parking_slope: parkingSlope as SpotFormData['parking_slope'],
      parking_covered: parkingCovered,
      parking_free: parkingFree,
      parking_notes: parkingNotes || undefined,
      best_season: bestSeason.length > 0 ? bestSeason : undefined,
      access_notes: accessNotes || undefined,
      category_ids: selectedCategories,
    }

    const result = await createSpot(formData)

    if (result.success) {
      router.push(`/spots/${result.data.id}`)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const toggleSeason = (season: string) => {
    setBestSeason((prev) =>
      prev.includes(season) ? prev.filter((s) => s !== season) : [...prev, season]
    )
  }

  const canProceed = () => {
    switch (step) {
      case 0: return latitude !== null && longitude !== null
      case 1: return name.length > 0 && selectedCategories.length > 0
      case 2: return true
      case 3: return true
      case 4: return true
      default: return false
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">スポット登録</h1>

      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                i === step
                  ? 'bg-primary text-primary-foreground'
                  : i < step
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i + 1}
            </button>
            <span className={`hidden text-sm md:block ${i === step ? 'font-medium' : 'text-muted-foreground'}`}>
              {s}
            </span>
            {i < steps.length - 1 && <div className="h-px w-4 bg-border md:w-8" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Step 0: Location */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" />
              場所を選択
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              地図をクリックしてスポットの場所を選択してください
            </p>
            <div className="h-80 overflow-hidden rounded-lg border">
              <MapProvider>
                <Map
                  defaultCenter={MAP_DEFAULT_CENTER}
                  defaultZoom={6}
                  mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || undefined}
                  gestureHandling="greedy"
                  onClick={handleMapClick}
                  className="h-full w-full"
                >
                  {latitude && longitude && (
                    <AdvancedMarker position={{ lat: latitude, lng: longitude }} />
                  )}
                </Map>
              </MapProvider>
            </div>
            {latitude && longitude && (
              <div className="space-y-2">
                <p className="text-sm">
                  座標: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
                <div className="space-y-2">
                  <Label>住所（任意）</Label>
                  <Input
                    value={formattedAddress}
                    onChange={(e) => setFormattedAddress(e.target.value)}
                    placeholder="住所を入力..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>都道府県</Label>
                  <Input
                    value={prefecture}
                    onChange={(e) => setPrefecture(e.target.value)}
                    placeholder="例: 北海道"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 1: Basic info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">スポット名 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 美瑛の丘"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="スポットの説明を入力..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>カテゴリ *（1つ以上選択）</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Badge
                    key={cat.id}
                    variant={selectedCategories.includes(cat.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleCategory(cat.id)}
                    style={
                      selectedCategories.includes(cat.id)
                        ? { backgroundColor: cat.color }
                        : undefined
                    }
                  >
                    {cat.name_ja}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="website">ウェブサイト</Label>
                <Input
                  id="website"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">電話番号</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0xx-xxx-xxxx"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Parking info */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ParkingSquare className="h-5 w-5" />
              駐車場情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>大型バイク駐車 *</Label>
              <div className="flex gap-2">
                {([
                  { value: 'ok' as const, label: 'OK', icon: CheckCircle2, color: 'bg-green-500' },
                  { value: 'ng' as const, label: 'NG', icon: XCircle, color: 'bg-red-500' },
                  { value: 'unknown' as const, label: '不明', icon: HelpCircle, color: 'bg-gray-400' },
                ]).map(({ value, label, icon: Icon, color }) => (
                  <button
                    key={value}
                    onClick={() => setParkingLargeBike(value)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-3 transition-colors ${
                      parkingLargeBike === value
                        ? `${color} border-transparent text-white`
                        : 'border-input hover:bg-accent'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>推定駐車台数</Label>
                <Input
                  type="number"
                  value={parkingSpotsEstimate}
                  onChange={(e) => setParkingSpotsEstimate(e.target.value)}
                  placeholder="例: 10"
                />
              </div>
              <div className="space-y-2">
                <Label>路面</Label>
                <select
                  value={parkingSurface}
                  onChange={(e) => setParkingSurface(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">選択してください</option>
                  <option value="paved">舗装</option>
                  <option value="gravel">砂利</option>
                  <option value="dirt">土</option>
                  <option value="grass">芝生</option>
                  <option value="mixed">複合</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>傾斜</Label>
                <select
                  value={parkingSlope}
                  onChange={(e) => setParkingSlope(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">選択してください</option>
                  <option value="flat">平坦</option>
                  <option value="slight">やや傾斜</option>
                  <option value="steep">急傾斜</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>屋根</Label>
                <div className="flex gap-2">
                  {[
                    { value: true, label: 'あり' },
                    { value: false, label: 'なし' },
                  ].map(({ value, label }) => (
                    <button
                      key={String(value)}
                      onClick={() => setParkingCovered(value)}
                      className={`flex-1 rounded-md border p-2 text-sm ${
                        parkingCovered === value ? 'border-primary bg-primary/10' : 'border-input'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>料金</Label>
              <div className="flex gap-2">
                {[
                  { value: true, label: '無料' },
                  { value: false, label: '有料' },
                ].map(({ value, label }) => (
                  <button
                    key={String(value)}
                    onClick={() => setParkingFree(value)}
                    className={`flex-1 rounded-md border p-2 text-sm ${
                      parkingFree === value ? 'border-primary bg-primary/10' : 'border-input'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>駐車場メモ</Label>
              <Textarea
                value={parkingNotes}
                onChange={(e) => setParkingNotes(e.target.value)}
                placeholder="例: 裏手の駐車場が広くて停めやすい"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Additional info */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">追加情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>おすすめの季節</Label>
              <div className="flex flex-wrap gap-2">
                {['spring', 'summer', 'autumn', 'winter'].map((season) => {
                  const labels: Record<string, string> = { spring: '春', summer: '夏', autumn: '秋', winter: '冬' }
                  return (
                    <Badge
                      key={season}
                      variant={bestSeason.includes(season) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleSeason(season)}
                    >
                      {labels[season]}
                    </Badge>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>アクセス情報</Label>
              <Textarea
                value={accessNotes}
                onChange={(e) => setAccessNotes(e.target.value)}
                placeholder="例: 国道1号線から県道30号に入って約5km"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">登録内容の確認</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">スポット名</p>
              <p className="font-medium">{name}</p>
            </div>
            {description && (
              <div>
                <p className="text-sm text-muted-foreground">説明</p>
                <p className="text-sm">{description}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">座標</p>
              <p className="text-sm">{latitude?.toFixed(6)}, {longitude?.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">大型バイク駐車</p>
              <Badge variant={parkingLargeBike === 'ok' ? 'success' : parkingLargeBike === 'ng' ? 'destructive' : 'secondary'}>
                {parkingLargeBike === 'ok' ? 'OK' : parkingLargeBike === 'ng' ? 'NG' : '不明'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">カテゴリ</p>
              <div className="flex flex-wrap gap-1">
                {categories
                  .filter((c) => selectedCategories.includes(c.id))
                  .map((c) => (
                    <Badge key={c.id} style={{ backgroundColor: c.color }} className="text-white">
                      {c.name_ja}
                    </Badge>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={() => (step === 0 ? router.back() : setStep(step - 1))}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          {step === 0 ? '戻る' : '前へ'}
        </Button>

        {step < steps.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="gap-1">
            次へ
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading} className="gap-1">
            {loading ? '登録中...' : 'スポットを登録'}
          </Button>
        )}
      </div>
    </div>
  )
}

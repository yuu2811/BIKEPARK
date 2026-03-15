'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Map } from 'lucide-react'
import type { BikeType } from '@/types/database'

const bikeTypes: { value: BikeType; label: string }[] = [
  { value: 'touring', label: 'ツアラー' },
  { value: 'adventure', label: 'アドベンチャー' },
  { value: 'sport', label: 'スポーツ' },
  { value: 'cruiser', label: 'クルーザー' },
  { value: 'naked', label: 'ネイキッド' },
  { value: 'off-road', label: 'オフロード' },
  { value: 'scooter', label: 'スクーター' },
  { value: 'other', label: 'その他' },
]

const prefectures = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
]

function OnboardingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [homePrefecture, setHomePrefecture] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [model, setModel] = useState('')
  const [displacementCc, setDisplacementCc] = useState('')
  const [bikeType, setBikeType] = useState<BikeType>('touring')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Update profile
      await supabase
        .from('profiles')
        .update({
          display_name: displayName || 'ライダー',
          home_prefecture: homePrefecture || null,
        })
        .eq('id', user.id)

      // Add bike if filled
      if (manufacturer && model) {
        await supabase.from('user_bikes').insert({
          user_id: user.id,
          manufacturer,
          model,
          displacement_cc: displacementCc ? parseInt(displacementCc) : null,
          bike_type: bikeType,
          is_primary: true,
        })
      }

      router.push(redirect)
    } catch {
      setError('プロフィールの保存に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Map className="h-7 w-7 text-primary-foreground" />
        </div>
        <CardTitle>プロフィール設定</CardTitle>
        <CardDescription>BIKEPARKへようこそ！あなたの情報を教えてください</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="displayName">表示名 *</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="ニックネーム"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prefecture">居住エリア</Label>
            <select
              id="prefecture"
              value={homePrefecture}
              onChange={(e) => setHomePrefecture(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">選択してください</option>
              {prefectures.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t pt-4">
            <h3 className="mb-3 text-sm font-semibold">バイク情報（任意）</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="manufacturer">メーカー</Label>
                <Input
                  id="manufacturer"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="Honda"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">車種</Label>
                <Input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="CB1300SF"
                />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cc">排気量 (cc)</Label>
                <Input
                  id="cc"
                  type="number"
                  value={displacementCc}
                  onChange={(e) => setDisplacementCc(e.target.value)}
                  placeholder="1300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bikeType">タイプ</Label>
                <select
                  id="bikeType"
                  value={bikeType}
                  onChange={(e) => setBikeType(e.target.value as BikeType)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {bikeTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !displayName}>
            {loading ? '保存中...' : '始める'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingForm />
    </Suspense>
  )
}

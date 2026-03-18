'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updateProfile, addBike, removeBike } from '@/actions/profile'
import { createClient } from '@/lib/supabase/client'
import { User, Bike, Plus, Trash2 } from 'lucide-react'
import type { BikeType, Database } from '@/types/database'

type UserBike = Database['public']['Tables']['user_bikes']['Row']

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

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [homePrefecture, setHomePrefecture] = useState('')
  const [bikes, setBikes] = useState<UserBike[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // New bike form
  const [newManufacturer, setNewManufacturer] = useState('')
  const [newModel, setNewModel] = useState('')
  const [newCc, setNewCc] = useState('')
  const [newBikeType, setNewBikeType] = useState<BikeType>('touring')

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setDisplayName(profile.display_name)
        setBio(profile.bio || '')
        setHomePrefecture(profile.home_prefecture || '')
      }

      const { data: bikesData } = await supabase
        .from('user_bikes')
        .select('*')
        .eq('user_id', user.id)

      if (bikesData) setBikes(bikesData)
      setInitialLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveProfile = async () => {
    setLoading(true)
    const result = await updateProfile({
      display_name: displayName,
      bio: bio || undefined,
      home_prefecture: homePrefecture || undefined,
    })
    if (result.success) {
      toast.success('プロフィールを更新しました')
    } else {
      toast.error(result.error)
    }
    setLoading(false)
  }

  const handleAddBike = async () => {
    if (!newManufacturer || !newModel) return
    const result = await addBike({
      manufacturer: newManufacturer,
      model: newModel,
      displacement_cc: newCc ? parseInt(newCc) : undefined,
      bike_type: newBikeType,
    })
    if (result.success) {
      toast.success('バイクを追加しました')
      setNewManufacturer('')
      setNewModel('')
      setNewCc('')
      // Reload bikes
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('user_bikes').select('*').eq('user_id', user.id)
        if (data) setBikes(data)
      }
    } else {
      toast.error('バイクの追加に失敗しました')
    }
  }

  const handleRemoveBike = async (bikeId: string) => {
    const result = await removeBike(bikeId)
    if (result.success) {
      setBikes((prev) => prev.filter((b) => b.id !== bikeId))
      toast.success('バイクを削除しました')
    } else {
      toast.error('バイクの削除に失敗しました')
    }
  }

  if (initialLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">設定</h1>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">設定</h1>

      {/* Profile */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            プロフィール
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>表示名</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>自己紹介</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="あなたのツーリングスタイルなど..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>居住エリア</Label>
            <Input
              value={homePrefecture}
              onChange={(e) => setHomePrefecture(e.target.value)}
              placeholder="例: 東京都"
            />
          </div>
          <Button onClick={handleSaveProfile} disabled={loading}>
            {loading ? '保存中...' : '保存'}
          </Button>
        </CardContent>
      </Card>

      {/* Bikes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bike className="h-5 w-5" />
            バイク情報
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bikes.map((bike) => (
            <div key={bike.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">{bike.manufacturer} {bike.model}</p>
                <p className="text-xs text-muted-foreground">
                  {bike.displacement_cc && `${bike.displacement_cc}cc`}
                  {bike.bike_type && ` / ${bikeTypes.find((t) => t.value === bike.bike_type)?.label}`}
                </p>
              </div>
              <button onClick={() => handleRemoveBike(bike.id)} className="rounded p-1 hover:bg-destructive/10">
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          ))}

          <div className="border-t pt-4">
            <p className="mb-3 text-sm font-medium">バイクを追加</p>
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={newManufacturer}
                onChange={(e) => setNewManufacturer(e.target.value)}
                placeholder="メーカー"
              />
              <Input
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                placeholder="車種"
              />
              <Input
                type="number"
                value={newCc}
                onChange={(e) => setNewCc(e.target.value)}
                placeholder="排気量 (cc)"
              />
              <select
                value={newBikeType}
                onChange={(e) => setNewBikeType(e.target.value as BikeType)}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {bikeTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleAddBike}
              disabled={!newManufacturer || !newModel}
              size="sm"
              className="mt-2 gap-1"
            >
              <Plus className="h-4 w-4" />
              追加
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

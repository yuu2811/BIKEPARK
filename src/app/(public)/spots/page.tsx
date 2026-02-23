import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SpotCard } from '@/components/spots/spot-card'
import { Button } from '@/components/ui/button'
import { Map, Plus } from 'lucide-react'

export const metadata = {
  title: 'スポット一覧 - BIKEPARK',
  description: 'ツーリングスポットを検索・閲覧',
}

export default async function SpotsPage() {
  const supabase = await createClient()

  const { data: spots } = await supabase
    .from('spots')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold">スポット</h1>
          <p className="text-muted-foreground">
            ライダーが登録したツーリングスポットの一覧
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/explore">
            <Button variant="outline" className="gap-1.5">
              <Map className="h-4 w-4" />
              地図で探索
            </Button>
          </Link>
          <Link href="/spots/new">
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" />
              登録
            </Button>
          </Link>
        </div>
      </div>

      {!spots || spots.length === 0 ? (
        <div className="py-16 text-center">
          <Map className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">まだスポットが登録されていません</p>
          <p className="mb-4 text-muted-foreground">
            最初のスポットを登録してみましょう！
          </p>
          <Link href="/spots/new">
            <Button>スポットを登録</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {spots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      )}
    </div>
  )
}

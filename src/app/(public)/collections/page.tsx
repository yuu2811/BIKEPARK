import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FolderOpen, MapPin, GitFork } from 'lucide-react'

export const metadata = {
  title: 'コレクション - BIKEPARK',
  description: 'ライダーが作成したツーリングスポットコレクションを発見しよう',
}

export default async function CollectionsPage() {
  const supabase = await createClient()

  const { data: collections } = await supabase
    .from('collections')
    .select('*, profiles(display_name, avatar_url)')
    .eq('visibility', 'public')
    .order('fork_count', { ascending: false })
    .limit(50)

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">コレクション</h1>
        <p className="text-muted-foreground">
          ライダーが作成したツーリングスポットのコレクションを探索しよう
        </p>
      </div>

      {!collections || collections.length === 0 ? (
        <div className="py-16 text-center">
          <FolderOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">まだ公開コレクションがありません</p>
          <p className="text-muted-foreground">
            最初のコレクションを作成しましょう！
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <Link key={collection.id} href={`/collections/${collection.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <h3 className="mb-1 text-lg font-semibold">{collection.title}</h3>
                  {collection.description && (
                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                      {collection.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {collection.spot_count}スポット
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="h-3 w-3" />
                      {collection.fork_count}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {(collection.profiles as { display_name: string })?.display_name || 'ライダー'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

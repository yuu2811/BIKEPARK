'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { addSpotToCollection } from '@/actions/collections'
import { createClient } from '@/lib/supabase/client'
import { FolderPlus, Loader2, Check } from 'lucide-react'

interface Collection {
  id: string
  title: string
  spot_count: number
}

interface AddToCollectionButtonProps {
  spotId: string
}

export function AddToCollectionButton({ spotId }: AddToCollectionButtonProps) {
  const [open, setOpen] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  const [loadingCollections, setLoadingCollections] = useState(false)
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [added, setAdded] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    const loadCollections = async () => {
      setLoadingCollections(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('ログインが必要です')
        setLoadingCollections(false)
        return
      }

      const { data } = await supabase
        .from('collections')
        .select('id, title, spot_count')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      setCollections(data || [])
      setLoadingCollections(false)
    }

    loadCollections()
  }, [open])

  const handleAdd = async (collectionId: string) => {
    setAddingTo(collectionId)
    setError(null)

    const result = await addSpotToCollection(collectionId, spotId)

    if (result.success) {
      setAdded((prev) => new Set(prev).add(collectionId))
    } else {
      setError(result.error)
    }
    setAddingTo(null)
  }

  return (
    <>
      <Button className="w-full gap-2" variant="outline" onClick={() => setOpen(true)}>
        <FolderPlus className="h-4 w-4" />
        コレクションに追加
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClose={() => setOpen(false)}>
          <DialogHeader>
            <DialogTitle>コレクションに追加</DialogTitle>
            <DialogDescription>追加先のコレクションを選択してください</DialogDescription>
          </DialogHeader>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {loadingCollections ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : collections.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              コレクションがありません。先にコレクションを作成してください。
            </p>
          ) : (
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {collections.map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => handleAdd(collection.id)}
                  disabled={addingTo === collection.id || added.has(collection.id)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent disabled:opacity-60"
                >
                  <div>
                    <p className="font-medium">{collection.title}</p>
                    <p className="text-xs text-muted-foreground">{collection.spot_count}スポット</p>
                  </div>
                  {addingTo === collection.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : added.has(collection.id) ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createCollection, deleteCollection } from '@/actions/collections'
import { createClient } from '@/lib/supabase/client'
import { Plus, FolderOpen, MapPin, GitFork, Trash2, Eye, EyeOff, Link2 } from 'lucide-react'
import type { Database, Visibility } from '@/types/database'

type Collection = Database['public']['Tables']['collections']['Row']

const visibilityConfig: Record<Visibility, { label: string; icon: typeof Eye }> = {
  private: { label: '非公開', icon: EyeOff },
  unlisted: { label: 'リンク共有', icon: Link2 },
  public: { label: '公開', icon: Eye },
}

export default function MyCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('private')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
      if (data) setCollections(data)
      setInitialLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    setLoading(true)
    const result = await createCollection({ title, description, visibility })
    if (result.success) {
      toast.success('コレクションを作成しました')
      setShowCreateDialog(false)
      setTitle('')
      setDescription('')
      // Reload
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('collections')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
        if (data) setCollections(data)
      }
    } else {
      toast.error('コレクションの作成に失敗しました')
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このコレクションを削除しますか？')) return
    const result = await deleteCollection(id)
    if (result.success) {
      setCollections((prev) => prev.filter((c) => c.id !== id))
      toast.success('コレクションを削除しました')
    } else {
      toast.error('コレクションの削除に失敗しました')
    }
  }

  if (initialLoading) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">マイコレクション</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">マイコレクション</h1>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          新規作成
        </Button>
      </div>

      {collections.length === 0 ? (
        <div className="py-16 text-center">
          <FolderOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">コレクションがありません</p>
          <p className="mb-4 text-muted-foreground">
            お気に入りのスポットをまとめましょう
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>コレクションを作成</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => {
            const vis = visibilityConfig[collection.visibility as Visibility]
            const VisIcon = vis.icon

            return (
              <Card key={collection.id} className="group relative">
                <CardContent className="p-5">
                  <Link href={`/collections/${collection.id}`}>
                    <h3 className="mb-1 font-semibold group-hover:text-primary">
                      {collection.title}
                    </h3>
                  </Link>
                  {collection.description && (
                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                      {collection.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {collection.spot_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="h-3 w-3" />
                      {collection.fork_count}
                    </span>
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <VisIcon className="h-3 w-3" />
                      {vis.label}
                    </Badge>
                  </div>
                  <button
                    onClick={() => handleDelete(collection.id)}
                    className="absolute right-3 top-3 rounded p-1 opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent onClose={() => setShowCreateDialog(false)}>
          <DialogHeader>
            <DialogTitle>コレクションを作成</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>タイトル *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: 北海道夏ツーリング"
              />
            </div>
            <div className="space-y-2">
              <Label>説明</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="コレクションの説明..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>公開設定</Label>
              <div className="flex gap-2">
                {(Object.entries(visibilityConfig) as [Visibility, typeof visibilityConfig[Visibility]][]).map(
                  ([value, config]) => {
                    const Icon = config.icon
                    return (
                      <button
                        key={value}
                        onClick={() => setVisibility(value)}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-md border p-2 text-sm ${
                          visibility === value
                            ? 'border-primary bg-primary/10'
                            : 'border-input'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {config.label}
                      </button>
                    )
                  }
                )}
              </div>
            </div>
            <Button onClick={handleCreate} disabled={loading || !title} className="w-full">
              {loading ? '作成中...' : '作成'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

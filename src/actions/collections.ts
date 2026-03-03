'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const collectionSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100),
  description: z.string().max(1000).optional(),
  visibility: z.enum(['private', 'unlisted', 'public']).default('private'),
})

export type CollectionFormData = z.infer<typeof collectionSchema>

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createCollection(
  formData: CollectionFormData
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '認証が必要です' }

  const parsed = collectionSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const insertData: {
    user_id: string
    title: string
    description?: string
    visibility?: 'private' | 'unlisted' | 'public'
  } = {
    user_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description,
    visibility: parsed.data.visibility,
  }

  const { data, error } = await supabase
    .from('collections')
    .insert(insertData)
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/my-collections')
  return { success: true, data: { id: data.id } }
}

export async function updateCollection(
  id: string,
  formData: Partial<CollectionFormData>
): Promise<ActionResult<void>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '認証が必要です' }

  const { error } = await supabase
    .from('collections')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/collections/${id}`)
  revalidatePath('/my-collections')
  return { success: true, data: undefined }
}

export async function deleteCollection(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '認証が必要です' }

  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/my-collections')
  revalidatePath('/collections')
  return { success: true, data: undefined }
}

export async function addSpotToCollection(
  collectionId: string,
  spotId: string
): Promise<ActionResult<void>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '認証が必要です' }

  // Get max sort_order
  const { data: maxItem } = await supabase
    .from('collection_items')
    .select('sort_order')
    .eq('collection_id', collectionId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (maxItem?.sort_order ?? -1) + 1

  const { error } = await supabase
    .from('collection_items')
    .insert({
      collection_id: collectionId,
      spot_id: spotId,
      sort_order: nextOrder,
    })

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'このスポットは既に追加されています' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath(`/collections/${collectionId}`)
  return { success: true, data: undefined }
}

export async function removeSpotFromCollection(
  collectionId: string,
  spotId: string
): Promise<ActionResult<void>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '認証が必要です' }

  const { error } = await supabase
    .from('collection_items')
    .delete()
    .eq('collection_id', collectionId)
    .eq('spot_id', spotId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/collections/${collectionId}`)
  return { success: true, data: undefined }
}

export async function reorderCollectionItems(
  collectionId: string,
  itemIds: string[]
): Promise<ActionResult<void>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '認証が必要です' }

  // Update sort_order for each item
  const updates = itemIds.map((id, index) =>
    supabase
      .from('collection_items')
      .update({ sort_order: index })
      .eq('id', id)
  )

  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed?.error) return { success: false, error: failed.error.message }

  revalidatePath(`/collections/${collectionId}`)
  return { success: true, data: undefined }
}

export async function forkCollection(
  collectionId: string
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '認証が必要です' }

  // Get source collection
  const { data: source } = await supabase
    .from('collections')
    .select('*, collection_items(*)')
    .eq('id', collectionId)
    .single()

  if (!source) return { success: false, error: 'コレクションが見つかりません' }

  // Create forked collection
  const { data: forked, error: forkError } = await supabase
    .from('collections')
    .insert({
      user_id: user.id,
      title: `${source.title} (コピー)`,
      description: source.description,
      visibility: 'private',
      forked_from: collectionId,
    })
    .select('id')
    .single()

  if (forkError) return { success: false, error: forkError.message }

  // Copy items
  if (source.collection_items && source.collection_items.length > 0) {
    const { error: itemsError } = await supabase.from('collection_items').insert(
      source.collection_items.map((item: { spot_id: string; sort_order: number; note: string | null }) => ({
        collection_id: forked.id,
        spot_id: item.spot_id,
        sort_order: item.sort_order,
        note: item.note,
      }))
    )
    if (itemsError) return { success: false, error: itemsError.message }
  }

  // Increment fork count
  const { error: countError } = await supabase
    .from('collections')
    .update({ fork_count: (source.fork_count || 0) + 1 })
    .eq('id', collectionId)
  if (countError) return { success: false, error: countError.message }

  revalidatePath('/my-collections')
  return { success: true, data: { id: forked.id } }
}

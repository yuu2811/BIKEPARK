'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const reviewSchema = z.object({
  spot_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
  visit_date: z.string().optional(),
  parking_accurate: z.boolean().optional(),
})

export type ReviewFormData = z.infer<typeof reviewSchema>

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createReview(formData: ReviewFormData): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '認証が必要です' }

  const parsed = reviewSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      ...parsed.data,
      user_id: user.id,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'このスポットには既にレビューを投稿しています' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath(`/spots/${parsed.data.spot_id}`)
  return { success: true, data: { id: data.id } }
}

export async function updateReview(
  id: string,
  formData: Partial<ReviewFormData>
): Promise<ActionResult<void>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '認証が必要です' }

  const { error } = await supabase
    .from('reviews')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/spots/${formData.spot_id}`)
  return { success: true, data: undefined }
}

export async function deleteReview(id: string, spotId: string): Promise<ActionResult<void>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '認証が必要です' }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/spots/${spotId}`)
  return { success: true, data: undefined }
}

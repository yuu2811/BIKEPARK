'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const spotSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(200),
  description: z.string().max(2000).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  formatted_address: z.string().optional(),
  prefecture: z.string().optional(),
  city: z.string().optional(),
  google_place_id: z.string().optional(),
  website_url: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  parking_large_bike: z.enum(['ok', 'ng', 'unknown']),
  parking_spots_estimate: z.number().int().positive().optional(),
  parking_surface: z.enum(['paved', 'gravel', 'dirt', 'grass', 'mixed']).optional(),
  parking_slope: z.enum(['flat', 'slight', 'steep']).optional(),
  parking_covered: z.boolean().optional(),
  parking_free: z.boolean().optional(),
  parking_notes: z.string().max(500).optional(),
  best_season: z.array(z.string()).optional(),
  access_notes: z.string().max(1000).optional(),
  category_ids: z.array(z.number().int().positive()),
})

export type SpotFormData = z.infer<typeof spotSchema>

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createSpot(formData: SpotFormData): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '認証が必要です' }

  const parsed = spotSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { category_ids, ...spotData } = parsed.data

  // Insert spot
  const { data: spot, error: spotError } = await supabase
    .from('spots')
    .insert({
      ...spotData,
      created_by: user.id,
      website_url: spotData.website_url || null,
    })
    .select('id')
    .single()

  if (spotError) return { success: false, error: spotError.message }

  // Insert categories
  if (category_ids.length > 0) {
    const { error: catError } = await supabase
      .from('spot_categories')
      .insert(
        category_ids.map((category_id) => ({
          spot_id: spot.id,
          category_id,
        }))
      )
    if (catError) return { success: false, error: catError.message }
  }

  revalidatePath('/explore')
  revalidatePath('/spots')

  return { success: true, data: { id: spot.id } }
}

export async function updateSpot(
  id: string,
  formData: Partial<SpotFormData>
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '認証が必要です' }

  const { category_ids, ...spotData } = formData

  const { error } = await supabase
    .from('spots')
    .update({ ...spotData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) return { success: false, error: error.message }

  // Update categories if provided
  if (category_ids) {
    await supabase.from('spot_categories').delete().eq('spot_id', id)
    if (category_ids.length > 0) {
      await supabase.from('spot_categories').insert(
        category_ids.map((category_id) => ({ spot_id: id, category_id }))
      )
    }
  }

  revalidatePath(`/spots/${id}`)
  revalidatePath('/explore')

  return { success: true, data: { id } }
}

export async function deleteSpot(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '認証が必要です' }

  const { error } = await supabase
    .from('spots')
    .update({ is_active: false })
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/explore')
  revalidatePath('/spots')

  return { success: true, data: undefined }
}

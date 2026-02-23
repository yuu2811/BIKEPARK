'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import type { BikeType } from '@/types/database'

const profileSchema = z.object({
  display_name: z.string().min(1).max(50),
  bio: z.string().max(500).optional(),
  home_prefecture: z.string().optional(),
})

const bikeSchema = z.object({
  manufacturer: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  displacement_cc: z.number().int().positive().optional(),
  bike_type: z.enum([
    'touring', 'adventure', 'sport', 'cruiser',
    'naked', 'off-road', 'scooter', 'other',
  ] as const).optional(),
  is_primary: z.boolean().optional(),
})

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function updateProfile(
  formData: z.infer<typeof profileSchema>
): Promise<ActionResult<void>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '認証が必要です' }

  const parsed = profileSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const { error } = await supabase
    .from('profiles')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/settings')
  revalidatePath(`/riders/${user.id}`)
  return { success: true, data: undefined }
}

export async function addBike(
  formData: z.infer<typeof bikeSchema>
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '認証が必要です' }

  const parsed = bikeSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const { data, error } = await supabase
    .from('user_bikes')
    .insert({ ...parsed.data, user_id: user.id })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/settings')
  return { success: true, data: { id: data.id } }
}

export async function removeBike(bikeId: string): Promise<ActionResult<void>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '認証が必要です' }

  const { error } = await supabase
    .from('user_bikes')
    .delete()
    .eq('id', bikeId)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/settings')
  return { success: true, data: undefined }
}

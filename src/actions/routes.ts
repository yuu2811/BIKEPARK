'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { buildGoogleMapsDirectionsUrl } from '@/lib/google-maps/url-builder'

const routeStopSchema = z.object({
  spot_id: z.string().uuid().optional(),
  custom_name: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  stop_type: z.enum(['origin', 'destination', 'stop', 'via']),
  sort_order: z.number().int(),
  notes: z.string().optional(),
})

const routeSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(200),
  description: z.string().max(2000).optional(),
  visibility: z.enum(['private', 'unlisted', 'public']).default('private'),
  total_distance_km: z.number().optional(),
  estimated_duration_minutes: z.number().int().optional(),
  route_polyline: z.string().optional(),
  stops: z.array(routeStopSchema).min(2, '最低2つの停車地が必要です'),
})

export type RouteFormData = z.infer<typeof routeSchema>

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createRoute(
  formData: RouteFormData
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '認証が必要です' }

  const parsed = routeSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const { stops, ...routeData } = parsed.data

  // Generate Google Maps URL
  const googleMapsUrl = buildGoogleMapsDirectionsUrl(stops)

  // Create route
  const { data: route, error: routeError } = await supabase
    .from('routes')
    .insert({
      ...routeData,
      user_id: user.id,
      google_maps_url: googleMapsUrl,
    })
    .select('id')
    .single()

  if (routeError) return { success: false, error: routeError.message }

  // Insert stops
  const { error: stopsError } = await supabase
    .from('route_stops')
    .insert(
      stops.map((stop) => ({
        ...stop,
        route_id: route.id,
      }))
    )

  if (stopsError) return { success: false, error: stopsError.message }

  revalidatePath('/route-builder')
  return { success: true, data: { id: route.id } }
}

export async function updateRoute(
  id: string,
  formData: RouteFormData
): Promise<ActionResult<void>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '認証が必要です' }

  const { stops, ...routeData } = formData

  const googleMapsUrl = buildGoogleMapsDirectionsUrl(stops)

  // Update route
  const { error: routeError } = await supabase
    .from('routes')
    .update({
      ...routeData,
      google_maps_url: googleMapsUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (routeError) return { success: false, error: routeError.message }

  // Replace stops
  await supabase.from('route_stops').delete().eq('route_id', id)
  await supabase.from('route_stops').insert(
    stops.map((stop) => ({ ...stop, route_id: id }))
  )

  revalidatePath(`/routes/${id}`)
  return { success: true, data: undefined }
}

export async function deleteRoute(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '認証が必要です' }

  const { error } = await supabase
    .from('routes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/route-builder')
  return { success: true, data: undefined }
}

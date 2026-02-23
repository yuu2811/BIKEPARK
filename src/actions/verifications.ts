'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ParkingLargeBike } from '@/types/database'

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function verifyParking(
  spotId: string,
  status: ParkingLargeBike
): Promise<ActionResult<void>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '認証が必要です' }

  const { error } = await supabase
    .from('parking_verifications')
    .upsert(
      {
        spot_id: spotId,
        user_id: user.id,
        parking_large_bike: status,
        verified_at: new Date().toISOString(),
      },
      { onConflict: 'spot_id,user_id' }
    )

  if (error) return { success: false, error: error.message }

  revalidatePath(`/spots/${spotId}`)
  return { success: true, data: undefined }
}

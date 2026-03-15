import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const north = parseFloat(searchParams.get('north') || '')
  const south = parseFloat(searchParams.get('south') || '')
  const east = parseFloat(searchParams.get('east') || '')
  const west = parseFloat(searchParams.get('west') || '')

  if ([north, south, east, west].some((v) => isNaN(v))) {
    return NextResponse.json({ error: 'Invalid bounds parameters' }, { status: 400 })
  }

  const parking = searchParams.get('parking')
  const categories = searchParams.get('categories')

  const supabase = await createClient()

  let query = supabase
    .from('spots')
    .select('*, spot_categories(category_id)')
    .eq('is_active', true)
    .gte('latitude', south)
    .lte('latitude', north)
    .gte('longitude', west)
    .lte('longitude', east)
    .limit(200)

  if (parking && parking !== 'all') {
    query = query.eq('parking_large_bike', parking)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let spots = data || []

  // Filter by categories if provided
  if (categories) {
    const categoryIds = categories.split(',').map(Number).filter((n) => !isNaN(n))
    if (categoryIds.length > 0) {
      spots = spots.filter((spot) =>
        (spot.spot_categories as { category_id: number }[])?.some((sc) =>
          categoryIds.includes(sc.category_id)
        )
      )
    }
  }

  return NextResponse.json(spots)
}

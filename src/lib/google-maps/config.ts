export const MAP_DEFAULT_CENTER = { lat: 36.2048, lng: 138.2529 } // Center of Japan
export const MAP_DEFAULT_ZOOM = 6
export const MAP_SPOT_DETAIL_ZOOM = 15

export const CATEGORY_COLORS: Record<string, string> = {
  scenic_spot: '#22c55e',
  hot_spring: '#ef4444',
  gourmet: '#f97316',
  road_station: '#3b82f6',
  campground: '#84cc16',
  gas_station: '#eab308',
  mountain_pass: '#8b5cf6',
  scenic_road: '#06b6d4',
  gear_shop: '#64748b',
  rest_area: '#a855f7',
  photo_spot: '#ec4899',
  shrine_temple: '#dc2626',
}

export const PARKING_STATUS_CONFIG = {
  ok: { label: '大型バイクOK', color: '#22c55e', bgClass: 'bg-green-500' },
  ng: { label: '大型バイクNG', color: '#ef4444', bgClass: 'bg-red-500' },
  unknown: { label: '未確認', color: '#9ca3af', bgClass: 'bg-gray-400' },
} as const

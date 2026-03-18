import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Spotスキーマを再定義（Server Actionのスキーマと同等）
const spotSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(200),
  description: z.string().max(2000).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  formatted_address: z.string().optional(),
  prefecture: z.string().optional(),
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

const validSpot = {
  name: '美瑛の丘',
  latitude: 43.5857,
  longitude: 142.4554,
  parking_large_bike: 'ok' as const,
  category_ids: [1],
}

describe('spotSchema バリデーション', () => {
  it('有効なスポットデータを受け付ける', () => {
    const result = spotSchema.safeParse(validSpot)
    expect(result.success).toBe(true)
  })

  it('名前が空の場合エラーになる', () => {
    const result = spotSchema.safeParse({ ...validSpot, name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('名前は必須です')
    }
  })

  it('名前が200文字を超える場合エラーになる', () => {
    const result = spotSchema.safeParse({ ...validSpot, name: 'a'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('緯度が範囲外の場合エラーになる', () => {
    expect(spotSchema.safeParse({ ...validSpot, latitude: 91 }).success).toBe(false)
    expect(spotSchema.safeParse({ ...validSpot, latitude: -91 }).success).toBe(false)
  })

  it('経度が範囲外の場合エラーになる', () => {
    expect(spotSchema.safeParse({ ...validSpot, longitude: 181 }).success).toBe(false)
    expect(spotSchema.safeParse({ ...validSpot, longitude: -181 }).success).toBe(false)
  })

  it('駐車場ステータスが無効な値の場合エラーになる', () => {
    const result = spotSchema.safeParse({ ...validSpot, parking_large_bike: 'maybe' })
    expect(result.success).toBe(false)
  })

  it('有効なURLを受け付ける', () => {
    const result = spotSchema.safeParse({
      ...validSpot,
      website_url: 'https://example.com',
    })
    expect(result.success).toBe(true)
  })

  it('空文字列のURLを受け付ける', () => {
    const result = spotSchema.safeParse({
      ...validSpot,
      website_url: '',
    })
    expect(result.success).toBe(true)
  })

  it('無効なURLはエラーになる', () => {
    const result = spotSchema.safeParse({
      ...validSpot,
      website_url: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })

  it('カテゴリIDが空配列でも受け付ける', () => {
    const result = spotSchema.safeParse({ ...validSpot, category_ids: [] })
    expect(result.success).toBe(true)
  })

  it('全オプションフィールドを含むデータを受け付ける', () => {
    const result = spotSchema.safeParse({
      ...validSpot,
      description: 'テスト説明',
      formatted_address: '北海道上川郡美瑛町',
      prefecture: '北海道',
      website_url: 'https://example.com',
      phone: '0166-92-1111',
      parking_spots_estimate: 10,
      parking_surface: 'paved',
      parking_slope: 'flat',
      parking_covered: false,
      parking_free: true,
      parking_notes: '広い駐車場あり',
      best_season: ['summer', 'autumn'],
      access_notes: '国道237号線沿い',
    })
    expect(result.success).toBe(true)
  })
})

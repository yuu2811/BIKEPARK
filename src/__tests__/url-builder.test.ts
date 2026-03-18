import { describe, it, expect } from 'vitest'
import {
  buildGoogleMapsDirectionsUrl,
  buildSegmentedGoogleMapsUrls,
} from '@/lib/google-maps/url-builder'

describe('buildGoogleMapsDirectionsUrl', () => {
  it('2地点のルートURLを生成する', () => {
    const stops = [
      { latitude: 35.6812, longitude: 139.7671 },
      { latitude: 35.0116, longitude: 135.7681 },
    ]
    const url = buildGoogleMapsDirectionsUrl(stops)

    expect(url).toContain('https://www.google.com/maps/dir/')
    expect(url).toContain('origin=35.6812%2C139.7671')
    expect(url).toContain('destination=35.0116%2C135.7681')
    expect(url).toContain('travelmode=driving')
    expect(url).not.toContain('waypoints')
  })

  it('中間地点を含むルートURLを生成する', () => {
    const stops = [
      { latitude: 35.6812, longitude: 139.7671 },
      { latitude: 35.3606, longitude: 138.7274 },
      { latitude: 35.0116, longitude: 135.7681 },
    ]
    const url = buildGoogleMapsDirectionsUrl(stops)

    expect(url).toContain('waypoints=35.3606%2C138.7274')
  })

  it('複数のウェイポイントをパイプで区切る', () => {
    const stops = [
      { latitude: 35.0, longitude: 139.0 },
      { latitude: 35.5, longitude: 139.5 },
      { latitude: 36.0, longitude: 140.0 },
      { latitude: 36.5, longitude: 140.5 },
    ]
    const url = buildGoogleMapsDirectionsUrl(stops)
    const decodedUrl = decodeURIComponent(url)

    expect(decodedUrl).toContain('35.5,139.5|36,140')
  })

  it('2地点未満でエラーをスローする', () => {
    expect(() => buildGoogleMapsDirectionsUrl([{ latitude: 35.0, longitude: 139.0 }])).toThrow(
      'Route needs at least 2 stops'
    )
  })

  it('空配列でエラーをスローする', () => {
    expect(() => buildGoogleMapsDirectionsUrl([])).toThrow()
  })
})

describe('buildSegmentedGoogleMapsUrls', () => {
  it('11地点以下はセグメント分割しない', () => {
    const stops = Array.from({ length: 11 }, (_, i) => ({
      latitude: 35.0 + i * 0.1,
      longitude: 139.0 + i * 0.1,
    }))
    const urls = buildSegmentedGoogleMapsUrls(stops)

    expect(urls).toHaveLength(1)
  })

  it('12地点以上を正しくセグメント分割する', () => {
    const stops = Array.from({ length: 15 }, (_, i) => ({
      latitude: 35.0 + i * 0.1,
      longitude: 139.0 + i * 0.1,
    }))
    const urls = buildSegmentedGoogleMapsUrls(stops)

    expect(urls.length).toBeGreaterThan(1)
    urls.forEach((url) => {
      expect(url).toContain('https://www.google.com/maps/dir/')
    })
  })

  it('各セグメントが有効なURLを生成する', () => {
    const stops = Array.from({ length: 25 }, (_, i) => ({
      latitude: 35.0 + i * 0.1,
      longitude: 139.0 + i * 0.1,
    }))
    const urls = buildSegmentedGoogleMapsUrls(stops)

    expect(urls.length).toBeGreaterThanOrEqual(3)
    urls.forEach((url) => {
      expect(url).toContain('origin=')
      expect(url).toContain('destination=')
    })
  })
})

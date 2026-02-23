interface RouteStop {
  latitude: number
  longitude: number
}

export function buildGoogleMapsDirectionsUrl(stops: RouteStop[]): string {
  if (stops.length < 2) throw new Error('Route needs at least 2 stops')

  const origin = `${stops[0].latitude},${stops[0].longitude}`
  const destination = `${stops[stops.length - 1].latitude},${stops[stops.length - 1].longitude}`

  const params = new URLSearchParams({
    api: '1',
    origin,
    destination,
    travelmode: 'driving',
  })

  if (stops.length > 2) {
    const waypoints = stops
      .slice(1, -1)
      .map((s) => `${s.latitude},${s.longitude}`)
      .join('|')
    params.set('waypoints', waypoints)
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`
}

export function buildSegmentedGoogleMapsUrls(
  stops: RouteStop[],
  maxWaypoints: number = 9
): string[] {
  const maxStopsPerSegment = maxWaypoints + 2
  const urls: string[] = []

  for (let i = 0; i < stops.length - 1; i += maxStopsPerSegment - 1) {
    const segment = stops.slice(i, i + maxStopsPerSegment)
    if (segment.length >= 2) {
      urls.push(buildGoogleMapsDirectionsUrl(segment))
    }
  }

  return urls
}

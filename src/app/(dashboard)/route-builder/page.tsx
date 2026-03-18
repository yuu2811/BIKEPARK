'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { MapProvider } from '@/components/map/map-provider'
import { createRoute } from '@/actions/routes'
import { buildGoogleMapsDirectionsUrl, buildSegmentedGoogleMapsUrls } from '@/lib/google-maps/url-builder'
import { Map, AdvancedMarker, type MapMouseEvent } from '@vis.gl/react-google-maps'
import { MAP_DEFAULT_CENTER } from '@/lib/google-maps/config'
import {
  Plus,
  Trash2,
  GripVertical,
  ExternalLink,
  Copy,
  QrCode,
  Route,
  MapPin,
  Save,
  Navigation,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import type { StopType } from '@/types/database'

interface RouteStop {
  id: string
  custom_name: string
  latitude: number
  longitude: number
  stop_type: StopType
}

export default function RouteBuilderPage() {
  const router = useRouter()
  const [stops, setStops] = useState<RouteStop[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const addStop = useCallback((lat: number, lng: number) => {
    const newStop: RouteStop = {
      id: crypto.randomUUID(),
      custom_name: `地点 ${stops.length + 1}`,
      latitude: lat,
      longitude: lng,
      stop_type: stops.length === 0 ? 'origin' : 'stop',
    }
    setStops((prev) => [...prev, newStop])
  }, [stops.length])

  const removeStop = (id: string) => {
    setStops((prev) => prev.filter((s) => s.id !== id))
  }

  const updateStopName = (id: string, name: string) => {
    setStops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, custom_name: name } : s))
    )
  }

  const moveStop = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= stops.length) return
    const newStops = [...stops]
    ;[newStops[index], newStops[newIndex]] = [newStops[newIndex], newStops[index]]
    setStops(newStops)
  }

  const handleMapClick = (e: MapMouseEvent) => {
    const latLng = e?.detail?.latLng
    if (latLng) {
      addStop(latLng.lat, latLng.lng)
    }
  }

  const googleMapsUrl = stops.length >= 2 ? buildGoogleMapsDirectionsUrl(stops) : null
  const segmentedUrls = stops.length > 11 ? buildSegmentedGoogleMapsUrls(stops) : null

  const handleCopyUrl = async () => {
    if (googleMapsUrl) {
      await navigator.clipboard.writeText(googleMapsUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSave = async () => {
    if (stops.length < 2 || !title) return
    setLoading(true)

    const result = await createRoute({
      title,
      description: description || undefined,
      visibility: 'private',
      stops: stops.map((stop, index) => ({
        custom_name: stop.custom_name,
        latitude: stop.latitude,
        longitude: stop.longitude,
        stop_type: index === 0 ? 'origin' : index === stops.length - 1 ? 'destination' : stop.stop_type,
        sort_order: index,
      })),
    })

    if (result.success) {
      toast.success('ルートを保存しました')
      router.push(`/routes/${result.data.id}`)
    } else {
      toast.error('ルートの保存に失敗しました')
    }
    setLoading(false)
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem-3rem)] flex-col gap-4 md:flex-row">
      {/* Side panel */}
      <div className="w-full shrink-0 overflow-y-auto rounded-lg border bg-card p-4 md:w-96">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-lg font-bold">
            <Route className="h-5 w-5" />
            ルートビルダー
          </h1>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          地図をクリックして停車地を追加してください
        </p>

        {/* Stop list */}
        <div className="mb-4 space-y-2">
          {stops.map((stop, index) => (
            <Card key={stop.id}>
              <CardContent className="flex items-center gap-2 p-2">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveStop(index, -1)}
                    disabled={index === 0}
                    className="rounded p-0.5 hover:bg-accent disabled:opacity-30"
                  >
                    <GripVertical className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {index + 1}
                </div>
                <Input
                  value={stop.custom_name}
                  onChange={(e) => updateStopName(stop.id, e.target.value)}
                  className="h-8 text-sm"
                />
                <button
                  onClick={() => removeStop(stop.id)}
                  className="rounded p-1 hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        {stops.length === 0 && (
          <div className="rounded-lg border-2 border-dashed p-6 text-center text-sm text-muted-foreground">
            <MapPin className="mx-auto mb-2 h-8 w-8" />
            地図をクリックして
            <br />
            最初の地点を追加
          </div>
        )}

        {/* Summary */}
        {stops.length >= 2 && (
          <div className="mb-4 rounded-lg bg-muted p-3">
            <p className="text-sm font-medium">ルートサマリー</p>
            <p className="text-xs text-muted-foreground">
              {stops.length}停車地
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <Button
            onClick={() => setShowExportDialog(true)}
            disabled={stops.length < 2}
            className="w-full gap-2"
          >
            <Navigation className="h-4 w-4" />
            Googleマップで開く
          </Button>
          <Button
            onClick={() => setShowSaveDialog(true)}
            disabled={stops.length < 2}
            variant="outline"
            className="w-full gap-2"
          >
            <Save className="h-4 w-4" />
            ルートを保存
          </Button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 overflow-hidden rounded-lg border">
        <MapProvider>
          <Map
            defaultCenter={MAP_DEFAULT_CENTER}
            defaultZoom={6}
            mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || undefined}
            gestureHandling="greedy"
            onClick={handleMapClick}
            className="h-full w-full"
          >
            {stops.map((stop, index) => (
              <AdvancedMarker
                key={stop.id}
                position={{ lat: stop.latitude, lng: stop.longitude }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary text-sm font-bold text-primary-foreground shadow-lg">
                  {index + 1}
                </div>
              </AdvancedMarker>
            ))}
          </Map>
        </MapProvider>
      </div>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent onClose={() => setShowExportDialog(false)}>
          <DialogHeader>
            <DialogTitle>Googleマップにエクスポート</DialogTitle>
            <DialogDescription>
              ルートをGoogleマップで開きます
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {googleMapsUrl && (
              <>
                <div className="flex gap-2">
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button className="w-full gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Googleマップで開く
                    </Button>
                  </a>
                  <Button variant="outline" onClick={handleCopyUrl} className="gap-2">
                    <Copy className="h-4 w-4" />
                    {copied ? 'コピー済み' : 'URLコピー'}
                  </Button>
                </div>

                {stops.length > 11 && segmentedUrls && (
                  <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                    <p className="font-medium">停車地が多いため分割されます</p>
                    <p className="text-xs">Googleマップは最大9つのウェイポイントに対応しています</p>
                    <div className="mt-2 space-y-1">
                      {segmentedUrls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-blue-600 underline"
                        >
                          セグメント {i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* QR Code */}
                <div className="flex flex-col items-center gap-2 border-t pt-4">
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <QrCode className="h-4 w-4" />
                    スマホで読み取り
                  </p>
                  <QRCodeSVG value={googleMapsUrl} size={160} />
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent onClose={() => setShowSaveDialog(false)}>
          <DialogHeader>
            <DialogTitle>ルートを保存</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>タイトル *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: 箱根日帰りツーリング"
              />
            </div>
            <div className="space-y-2">
              <Label>説明</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ルートの説明..."
                rows={3}
              />
            </div>
            <Button onClick={handleSave} disabled={loading || !title} className="w-full">
              {loading ? '保存中...' : '保存'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

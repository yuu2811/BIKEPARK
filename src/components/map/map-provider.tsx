'use client'

import { APIProvider } from '@vis.gl/react-google-maps'

export function MapProvider({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return (
      <div className="flex h-full items-center justify-center bg-muted p-8 text-center">
        <div>
          <p className="text-lg font-semibold">Google Maps API キーが未設定です</p>
          <p className="mt-2 text-sm text-muted-foreground">
            .env.local に NEXT_PUBLIC_GOOGLE_MAPS_API_KEY を設定してください
          </p>
        </div>
      </div>
    )
  }

  return (
    <APIProvider apiKey={apiKey} language="ja" region="JP">
      {children}
    </APIProvider>
  )
}

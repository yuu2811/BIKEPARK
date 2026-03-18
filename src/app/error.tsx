'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <AlertTriangle className="mb-4 h-16 w-16 text-destructive" />
      <h1 className="mb-2 text-2xl font-bold">エラーが発生しました</h1>
      <p className="mb-6 text-muted-foreground">
        予期しないエラーが発生しました。もう一度お試しください。
      </p>
      <Button onClick={reset}>もう一度試す</Button>
    </div>
  )
}

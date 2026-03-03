'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { forkCollection } from '@/actions/collections'
import { GitFork, Loader2 } from 'lucide-react'

interface ForkButtonProps {
  collectionId: string
}

export function ForkButton({ collectionId }: ForkButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFork = async () => {
    setLoading(true)
    setError(null)

    const result = await forkCollection(collectionId)

    if (result.success) {
      router.push(`/collections/${result.data.id}`)
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={handleFork}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GitFork className="h-4 w-4" />
        )}
        フォークする
      </Button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}

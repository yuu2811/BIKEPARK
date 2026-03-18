import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <MapPin className="mb-4 h-16 w-16 text-muted-foreground" />
      <h1 className="mb-2 text-4xl font-bold">404</h1>
      <p className="mb-1 text-xl font-semibold">ページが見つかりません</p>
      <p className="mb-6 text-muted-foreground">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button variant="outline">トップページへ</Button>
        </Link>
        <Link href="/explore">
          <Button>スポットを探索</Button>
        </Link>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { Map } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Map className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">BIKEPARK</span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              ライダーによる、ライダーのための
              <br />
              ツーリングスポット共有プラットフォーム
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">機能</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/explore" className="hover:text-foreground">スポット探索</Link></li>
              <li><Link href="/collections" className="hover:text-foreground">コレクション</Link></li>
              <li><Link href="/route-builder" className="hover:text-foreground">ルートビルダー</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">カテゴリ</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/spots?category=scenic_spot" className="hover:text-foreground">景勝地</Link></li>
              <li><Link href="/spots?category=hot_spring" className="hover:text-foreground">温泉</Link></li>
              <li><Link href="/spots?category=gourmet" className="hover:text-foreground">グルメ</Link></li>
              <li><Link href="/spots?category=campground" className="hover:text-foreground">キャンプ場</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">BIKEPARK について</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">BIKEPARKとは</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">利用規約</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">プライバシーポリシー</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} BIKEPARK. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

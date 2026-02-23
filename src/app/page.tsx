import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Map,
  ParkingSquare,
  FolderOpen,
  Route,
  Shield,
  Users,
  Star,
  Mountain,
  Flame,
  Utensils,
  Store,
  Tent,
  Fuel,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

const features = [
  {
    icon: ParkingSquare,
    title: '大型バイク駐車情報',
    description:
      '路面状態、傾斜、台数、屋根の有無まで。大型バイクが安心して停められるか、ライダーが実際に確認した情報を共有。',
    color: 'text-touring-green',
  },
  {
    icon: Map,
    title: 'マップで探索',
    description:
      '地図上でツーリングスポットを探索。カテゴリや駐車場情報でフィルタリングして、最適なスポットを見つけよう。',
    color: 'text-touring-blue',
  },
  {
    icon: FolderOpen,
    title: 'コレクション',
    description:
      'お気に入りのスポットをテーマ別に整理。「北海道夏ツーリング」「絶品ラーメン巡り」など自分だけのリストを作成・共有。',
    color: 'text-touring-orange',
  },
  {
    icon: Route,
    title: 'ルートビルダー',
    description:
      'スポットを繋げてツーリングルートを作成。距離や所要時間を確認して、ワンタップでGoogleマップにエクスポート。',
    color: 'text-primary',
  },
  {
    icon: Shield,
    title: 'コミュニティ検証',
    description:
      'ライダーが実際に訪問して駐車場情報を確認。確認数に応じて信頼度バッジが付与され、情報の正確性が一目で分かる。',
    color: 'text-touring-red',
  },
  {
    icon: Users,
    title: 'ライダーコミュニティ',
    description:
      'レビュー、写真共有、季節の注意情報など、ライダー同士で知見を共有。貢献に応じてバッジを獲得。',
    color: 'text-purple-500',
  },
]

const categories = [
  { icon: Mountain, label: '景勝地', color: 'bg-green-500' },
  { icon: Flame, label: '温泉', color: 'bg-red-500' },
  { icon: Utensils, label: 'グルメ', color: 'bg-orange-500' },
  { icon: Store, label: '道の駅', color: 'bg-blue-500' },
  { icon: Tent, label: 'キャンプ場', color: 'bg-lime-500' },
  { icon: Fuel, label: 'ガソリンスタンド', color: 'bg-yellow-500' },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-touring-orange/5">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <ParkingSquare className="h-4 w-4" />
              大型バイクの駐車情報をライダーが共有
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-6xl">
              ツーリングを、
              <br />
              <span className="text-primary">もっと自由に。</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              大型バイクが停められるか分からない不安を解消。
              <br />
              ライダーが実際に確認した駐車場情報をもとに、
              <br className="hidden md:block" />
              安心してツーリングスポットを探索・共有・ルート作成できるプラットフォーム。
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/explore">
                <Button size="lg" className="gap-2 text-base">
                  <Map className="h-5 w-5" />
                  スポットを探索する
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="gap-2 text-base">
                  スポットを登録する
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it solves the pain */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-touring-green" />
              <div>
                <h3 className="font-semibold">駐車場の不安を解消</h3>
                <p className="text-sm text-muted-foreground">
                  大型バイクOK/NG、路面状態、傾斜、台数がひと目で分かる
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-touring-green" />
              <div>
                <h3 className="font-semibold">スポットを整理・共有</h3>
                <p className="text-sm text-muted-foreground">
                  カテゴリ別コレクションでお気に入りを管理。仲間にも共有
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-touring-green" />
              <div>
                <h3 className="font-semibold">Googleマップ連携</h3>
                <p className="text-sm text-muted-foreground">
                  ルートを作成してGoogleマップにワンタップエクスポート
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">ライダーに必要な、すべてがここに</h2>
            <p className="text-muted-foreground">
              ツーリング計画から実際のナビゲーションまで、シームレスな体験
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <feature.icon className={`mb-4 h-8 w-8 ${feature.color}`} />
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">カテゴリで探す</h2>
            <p className="text-muted-foreground">
              目的に合わせてスポットを検索
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href={`/spots?category=${cat.label}`}
                className="group flex flex-col items-center gap-3 rounded-lg border bg-background p-6 transition-shadow hover:shadow-md"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${cat.color} text-white transition-transform group-hover:scale-110`}
                >
                  <cat.icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Parking Verification */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h2 className="mb-3 text-3xl font-bold">コミュニティ検証システム</h2>
            <p className="mb-8 text-muted-foreground">
              ライダーが実際に訪問して確認した情報は、確認数に応じて信頼度が上がります
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                  <Star className="h-3.5 w-3.5" />
                  Rider Verified
                </div>
                <p className="text-sm text-muted-foreground">3人以上のライダーが確認</p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
                  <Star className="h-3.5 w-3.5" />
                  Community Trusted
                </div>
                <p className="text-sm text-muted-foreground">10人以上のライダーが確認</p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                  <Star className="h-3.5 w-3.5" />
                  Well Established
                </div>
                <p className="text-sm text-muted-foreground">25人以上のライダーが確認</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">ツーリングを始めよう</h2>
          <p className="mb-8 text-primary-foreground/80">
            まずはスポットを探索するところから。ログインすれば、スポット登録やルート作成も可能です。
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/explore">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 text-base"
              >
                <Map className="h-5 w-5" />
                スポットを探索する
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-primary-foreground/30 text-base text-primary-foreground hover:bg-primary-foreground/10"
              >
                無料で始める
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

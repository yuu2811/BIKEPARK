import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/server'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'BIKEPARK - ツーリングスポット共有プラットフォーム',
    template: '%s | BIKEPARK',
  },
  description:
    'ライダーによる、ライダーのためのツーリングスポット共有アプリ。大型バイクの駐車可否、カテゴリ別スポット検索、ルート作成からGoogleマップへの共有まで。',
  keywords: [
    'ツーリング',
    'バイク',
    'ツーリングスポット',
    '大型バイク',
    '駐車場',
    'ルート',
    'Googleマップ',
  ],
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', user.id)
      .single()
    profile = data
  }

  const headerUser = user
    ? {
        id: user.id,
        email: user.email,
        display_name: profile?.display_name ?? undefined,
        avatar_url: profile?.avatar_url ?? undefined,
      }
    : null

  return (
    <html lang="ja">
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <Header user={headerUser} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}

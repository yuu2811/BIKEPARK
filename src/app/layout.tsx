import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Toaster } from 'sonner'
import { createClient } from '@/lib/supabase/server'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bikepark.jp'

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
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'BIKEPARK - ツーリングスポット共有プラットフォーム',
    description:
      '大型バイクの駐車情報をライダーが共有。スポット探索・コレクション・ルート作成を1つのアプリで。',
    url: siteUrl,
    siteName: 'BIKEPARK',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BIKEPARK - ツーリングスポット共有プラットフォーム',
    description:
      '大型バイクの駐車情報をライダーが共有。スポット探索・コレクション・ルート作成を1つのアプリで。',
  },
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
          <Toaster position="top-right" richColors closeButton />
        </div>
      </body>
    </html>
  )
}

# BIKEPARK

バイクツーリング愛好家のためのスポット共有プラットフォーム。
大型バイクの駐車情報を中心に、ツーリングスポットの登録・検索・コレクション管理・ルート作成を提供します。

## 解決する課題

| 課題 | BIKEPARKの解決策 |
|------|------------------|
| Google マップだけでは大型バイクが駐車できるか分からない | ユーザーが駐車可否・路面・傾斜等を共有し、コミュニティで検証 |
| ツーリングスポットをカテゴリ別に整理・共有したい | コレクション機能で保存・公開・Fork |
| ルートを作成してGoogle マップへ渡したい | ルートビルダーでルート組立 → Google マップアプリにエクスポート |

## 技術スタック

| 技術 | バージョン | 用途 |
|------|-----------|------|
| [Next.js](https://nextjs.org/) | 15 (App Router) | フレームワーク (SSR, Server Actions) |
| [React](https://react.dev/) | 19 | UI |
| [TypeScript](https://www.typescriptlang.org/) | 5.7 | 型安全 |
| [Supabase](https://supabase.com/) | — | PostgreSQL + PostGIS + Auth + Storage |
| [@vis.gl/react-google-maps](https://visgl.github.io/react-google-maps/) | 1.4 | Google Maps 公式 React ラッパー |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | スタイリング |
| [shadcn/ui](https://ui.shadcn.com/) 互換 | — | UI コンポーネント |
| [@dnd-kit](https://dndkit.com/) | 6 | ドラッグ & ドロップ |
| [react-hook-form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | — | フォーム & バリデーション |
| [Compressor.js](https://fengyuanchen.github.io/compressorjs/) | 1.2 | クライアント側画像圧縮 |
| [qrcode.react](https://github.com/zpao/qrcode.react) | 4.2 | QR コード生成 |

## 機能一覧

### スポット管理
- **5 ステップ登録フォーム** — 地図クリックで位置指定 → 基本情報 → 駐車場詳細 → 写真アップロード → 確認
- **駐車場情報** — 大型バイク可否 (OK / NG / 不明)、路面 (舗装・砂利・土・芝生・複合)、傾斜 (平坦・やや傾斜・急傾斜)、屋根、料金
- **カテゴリ** — 12 種 (景勝地、温泉、グルメ、道の駅、キャンプ場、ガソリンスタンド、峠、絶景ロード、バイク用品店、休憩スポット、フォトスポット、神社仏閣)
- **注意情報** — 道路閉鎖・工事・天候・季節閉鎖を期限付きで投稿

### マップ探索
- **全画面 Google Maps** — カテゴリ色分けマーカー、駐車ステータスドット表示
- **リアルタイムフィルタ** — テキスト検索、「大型バイク OK のみ」トグル、カテゴリチップ選択
- **サイドパネル** — スポット一覧とマップの連動、開閉トグル

### コレクション
- **CRUD** — 作成・編集・削除
- **公開設定** — private / unlisted / public
- **Fork** — 他ユーザーのコレクションを自分のアカウントにコピー
- **並べ替え** — ドラッグ & ドロップ

### ルートビルダー
- **停車地管理** — 地図クリックまたはスポットから追加、出発/経由/目的地の種別設定
- **ルート表示** — Google Directions API でルート計算・地図上にポリライン描画
- **Google マップエクスポート** — URL 生成 + QR コード (PC → スマホ転送用)
- **Waypoint 上限対応** — 上限超過時はセグメント分割

### コミュニティ
- **レビュー** — 1〜5 星評価 + コメント + 駐車場情報の正確性確認
- **検証バッジ** — Unverified → Rider Verified (3+) → Community Trusted (10+) → Well Established (25+)
- **ユーザーバッジ** — Trail Blazer, Road Captain, Curator, Parking Scout
- **公開プロフィール** — 登録スポット・レビュー・コレクション・バイク情報

### 認証
- **Google OAuth** — Supabase Auth 経由
- **オンボーディング** — 初回ログイン時に表示名・居住エリア・バイク情報を登録
- **保護ルート** — ダッシュボード・スポット登録・コレクション・ルートビルダー・設定はログイン必須

## プロジェクト構成

```
BIKEPARK/
├── middleware.ts                           # Supabase Auth セッション管理
├── supabase/migrations/                    # DB マイグレーション (3 ファイル)
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # ルートレイアウト (ヘッダー/フッター)
│   │   ├── page.tsx                       # ランディングページ
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx             # Google OAuth ログイン
│   │   │   ├── auth/callback/route.ts     # OAuth コールバック
│   │   │   └── onboarding/page.tsx        # 初回セットアップ
│   │   ├── (public)/
│   │   │   ├── explore/page.tsx           # マップ探索 (核心ページ)
│   │   │   ├── spots/page.tsx             # スポット一覧
│   │   │   ├── spots/[id]/page.tsx        # スポット詳細
│   │   │   ├── collections/page.tsx       # コレクション一覧
│   │   │   ├── collections/[id]/page.tsx  # コレクション詳細
│   │   │   ├── routes/[id]/page.tsx       # ルート詳細
│   │   │   └── riders/[id]/page.tsx       # ライダープロフィール
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx         # ダッシュボード
│   │   │   ├── spots/new/page.tsx         # スポット登録フォーム
│   │   │   ├── my-collections/page.tsx    # マイコレクション
│   │   │   ├── route-builder/page.tsx     # ルートビルダー
│   │   │   └── settings/page.tsx          # ユーザー設定
│   │   └── api/spots/in-bounds/route.ts   # 地図表示用 API
│   ├── actions/                            # Server Actions
│   │   ├── spots.ts                       # スポット CRUD
│   │   ├── reviews.ts                     # レビュー CRUD
│   │   ├── collections.ts                 # コレクション CRUD + Fork
│   │   ├── routes.ts                      # ルート CRUD
│   │   ├── verifications.ts               # 駐車場検証
│   │   └── profile.ts                     # プロフィール・バイク管理
│   ├── components/
│   │   ├── ui/                            # 汎用 UI (Button, Card, Badge, Dialog 等)
│   │   ├── layout/                        # Header, Footer
│   │   ├── map/                           # MapProvider, SpotMap
│   │   ├── spots/                         # SpotCard, ParkingBadge, SpotFilters
│   │   ├── reviews/                       # ReviewSection
│   │   └── shared/                        # VerificationSection, AdvisoryBanner
│   ├── lib/
│   │   ├── supabase/                      # client.ts, server.ts, middleware.ts
│   │   ├── google-maps/                   # config.ts, url-builder.ts
│   │   └── utils.ts                       # cn() ヘルパー
│   └── types/database.ts                  # DB 型定義 (全テーブル)
```

## データベース

### ER 概要

```
profiles ─┬─< user_bikes
          ├─< user_badges
          ├─< spots ──┬─< spot_categories >── categories
          │           ├─< spot_photos
          │           ├─< reviews ──< review_photos
          │           ├─< parking_verifications
          │           └─< spot_advisories
          ├─< collections ──< collection_items >── spots
          └─< routes ──< route_stops >── spots
```

### 主要テーブル

| テーブル | 説明 |
|---------|------|
| `profiles` | ユーザープロフィール (`auth.users` 連携、トリガーで自動作成) |
| `user_bikes` | バイク情報 (メーカー, モデル, 排気量, タイプ) |
| `categories` | 12 カテゴリマスタ |
| `spots` | スポット本体 + PostGIS `GEOGRAPHY(POINT, 4326)` + 駐車場情報 |
| `spot_categories` | スポット × カテゴリ (多対多) |
| `spot_photos` | スポット写真 (Supabase Storage) |
| `reviews` | レビュー (1-5 星, 駐車場正確性確認) |
| `collections` | コレクション (公開設定, Fork カウント) |
| `collection_items` | コレクション内スポット (並び順付き) |
| `routes` | ルート (距離, 所要時間, Google Maps URL, ポリライン) |
| `route_stops` | ルート停車地 (origin/destination/stop/via) |
| `parking_verifications` | 駐車場クイック検証 |
| `spot_advisories` | 注意情報 (期限付き、重要度レベル) |

### DB トリガー

| トリガー | 発火条件 | 動作 |
|---------|---------|------|
| `on_review_change` | `reviews` INSERT/UPDATE/DELETE | `spots.average_rating`, `review_count` 再計算 |
| `on_verification_change` | `parking_verifications` INSERT/DELETE | `spots.verification_count`, `verification_tier` 更新 |
| `on_auth_user_created` | `auth.users` INSERT | `profiles` 自動作成 |
| `on_collection_item_change` | `collection_items` INSERT/DELETE | `collections.spot_count` 更新 |

### 検証ティア

| ティア | 条件 | 意味 |
|-------|------|------|
| Unverified | 検証 0 件 | 未検証 |
| Rider Verified | 検証 3 件以上 | ライダー確認済み |
| Community Trusted | 検証 10 件以上 | コミュニティ信頼 |
| Well Established | 検証 25 件以上 | 定評あり |

## セットアップ

### 前提条件

- Node.js 18+
- npm
- Supabase アカウント
- Google Cloud アカウント

### 1. リポジトリのクローン

```bash
git clone https://github.com/yuu2811/BIKEPARK.git
cd BIKEPARK
npm install
```

### 2. Supabase プロジェクト作成

1. [Supabase Dashboard](https://supabase.com/dashboard) でプロジェクトを作成
2. **Settings > API** から `Project URL` と `anon public key` を控える
3. **Authentication > Providers** で Google OAuth を有効化:
   - [Google Cloud Console](https://console.cloud.google.com/) で OAuth 2.0 クライアント ID を作成
   - Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
   - Client ID と Client Secret を Supabase に設定

### 3. データベースマイグレーション

Supabase Dashboard の **SQL Editor** で以下を順番に実行:

```
supabase/migrations/00001_initial_schema.sql   # スキーマ + トリガー
supabase/migrations/00002_rls_policies.sql      # Row Level Security ポリシー
supabase/migrations/00003_seed_categories.sql   # カテゴリ初期データ
```

### 4. Supabase Storage バケット作成

Supabase Dashboard の **Storage** で以下のバケットを作成:

| バケット名 | 公開 | 用途 |
|-----------|------|------|
| `spot-photos` | Yes (Public) | スポット写真 |
| `review-photos` | Yes (Public) | レビュー写真 |

### 5. Google Maps API セットアップ

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
2. 以下の API を有効化:
   - **Maps JavaScript API**
   - **Places API (New)**
   - **Directions API**
   - **Geocoding API**
3. **認証情報** から API キーを発行し、HTTP リファラー制限を設定
4. **Maps Management** で Map ID を作成 (Cloud-based Map Styling 用)

### 6. 環境変数

`.env.local` を作成:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
NEXT_PUBLIC_GOOGLE_MAP_ID=your_map_id
```

### 7. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアクセスできます。

## npm スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 (http://localhost:3000) |
| `npm run build` | プロダクションビルド |
| `npm run start` | プロダクションサーバー起動 |
| `npm run lint` | ESLint 実行 |

## ページ一覧

| パス | アクセス | 説明 |
|------|---------|------|
| `/` | 公開 | ランディングページ |
| `/explore` | 公開 | マップ探索 |
| `/spots` | 公開 | スポット一覧 |
| `/spots/[id]` | 公開 | スポット詳細 |
| `/collections` | 公開 | コレクション一覧 |
| `/collections/[id]` | 公開 | コレクション詳細 |
| `/routes/[id]` | 公開 | ルート詳細 |
| `/riders/[id]` | 公開 | ライダープロフィール |
| `/login` | 公開 | ログイン |
| `/onboarding` | 認証後 | 初回セットアップ |
| `/dashboard` | 要ログイン | ダッシュボード |
| `/spots/new` | 要ログイン | スポット登録 |
| `/my-collections` | 要ログイン | マイコレクション管理 |
| `/route-builder` | 要ログイン | ルートビルダー |
| `/settings` | 要ログイン | ユーザー設定 |

## API

| エンドポイント | メソッド | 説明 |
|--------------|---------|------|
| `/api/spots/in-bounds` | GET | 地図表示範囲内のスポットを返す |

クエリパラメータ: `north`, `south`, `east`, `west`, `parking` (ok/ng/unknown/all), `categories` (カンマ区切り ID)

## ライセンス

Private

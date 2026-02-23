# BIKEPARK セットアップ残課題

> 作成日: 2026-02-23

## 未完了タスク

### 1. Google OAuth クライアントシークレットの設定

**状態**: ブロック中 (PC ブラウザでの操作が必要)

**手順**:

1. PC ブラウザで [Google Cloud Console - 認証情報](https://console.cloud.google.com/apis/credentials) にアクセス
2. 「OAuth 2.0 クライアント ID」セクションの **BIKEPARK** をクリック
3. 右側に表示される **クライアントシークレット** (`GOCSPX-...`) をコピー
   - 表示されない場合: 行の右端にある **ダウンロードアイコン (↓)** から JSON を取得し、`client_secret` フィールドの値を使用
4. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
5. **Authentication > Providers > Google** を開く
6. 以下を入力して保存:
   - **Client ID**: Google Cloud Console の OAuth クライアント ID
   - **Client Secret**: 上記でコピーしたシークレット

### 2. データベースマイグレーション実行

**状態**: 未実施

**手順**:

1. [Supabase Dashboard](https://supabase.com/dashboard) の **SQL Editor** を開く
2. 以下のファイルを **順番に** コピペ実行:
   - `supabase/migrations/00001_initial_schema.sql`
   - `supabase/migrations/00002_rls_policies.sql`
   - `supabase/migrations/00003_seed_categories.sql`

### 3. Supabase Storage バケット作成

**状態**: 未実施

**手順**:

1. Supabase Dashboard の **Storage** を開く
2. 「New bucket」で以下を作成:

| バケット名 | Public | 用途 |
|-----------|--------|------|
| `spot-photos` | ✅ Yes | スポット写真 |
| `review-photos` | ✅ Yes | レビュー写真 |

### 4. 動作確認

**状態**: 上記完了後

- `npm run dev` でローカルサーバー起動
- Google ログインが動作するか確認
- スポット登録・写真アップロードが動作するか確認

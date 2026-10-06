# CLAUDE.md

このファイルは、本リポジトリで作業する Claude Code 向けのガイドです。

## プロジェクト概要

Supabase 認証付きの不動産管理 Web アプリ。

- メールアドレス＋パスワードによる会員登録・ログイン
- ログイン後は物件一覧画面へ遷移
- 未ログイン時はログイン画面へリダイレクト
- ログアウト機能
- ログイン失敗時のパスワードリセットメール送信と再設定画面（`/reset-password`）
- 物件（物件名・家賃・エリア名・間取り）の一覧・登録・編集・削除（Supabase の `properties` テーブル）
- RLS により自分が登録した物件のみ操作可能

## 技術スタック

- React + Vite
- React Router（画面遷移・ルートガード）
- Supabase（`@supabase/supabase-js`）による認証

## ディレクトリ構成

```
supabase/
  schema.sql              properties テーブル・RLS ポリシーの定義（SQL Editor で実行）
src/
  lib/supabaseClient.js   Supabase クライアントの生成（.env から接続情報を読み込む）
  lib/propertiesApi.js    properties テーブルへの CRUD 操作
  contexts/AuthContext.jsx 認証状態（セッション）を全体に提供するコンテキスト
  components/ProtectedRoute.jsx 未ログイン時にログイン画面へリダイレクトするガード
  components/GuestRoute.jsx     ログイン済み時に物件一覧へリダイレクトするガード
  components/PropertyForm.jsx   物件の登録・編集で共用するフォーム
  pages/Login.jsx         ログイン画面
  pages/Signup.jsx        会員登録画面
  pages/ResetPassword.jsx パスワード再設定画面（リセットメールのリンク先）
  pages/Properties.jsx    物件一覧画面（カード形式・登録/編集/削除）
```

## データベース

- テーブル定義は `supabase/schema.sql` で管理する。変更時はこのファイルを更新し、Supabase の SQL Editor で実行する
- `properties.user_id` は既定値 `auth.uid()` で登録者が自動設定される
- アクセス制御は RLS ポリシーで行う（クライアント側でユーザー絞り込みをしなくても自分の物件のみ返る）

## よく使うコマンド

```bash
npm install      # 依存関係のインストール
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド
npm run preview  # ビルド結果のプレビュー
```

## 環境変数

Supabase の接続情報は `.env` で管理する（`.gitignore` 済み。絶対にコミットしない）。
`.env.example` をコピーして `.env` を作成すること。

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

## デプロイ（Vercel）

- `vercel.json` で全 URL を `index.html` に書き換え、React Router の画面を直接開いても 404 にならないようにしている
- 環境変数（`VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`）は Vercel ダッシュボードで設定する（`vercel.json` には含めない）

## デプロイ情報

- 本番URL：https://realestate-app-xi-ten.vercel.app
- Supabaseプロジェクト名：realestate-app

## コーディング規約

- コード中のコメントは日本語で記載する
- UI 文言も日本語で記載する

## Git 運用ルール

- リモート: `https://github.com/takagawa-glitch/realestate-app.git`（ブランチ `main`）
- **コードを変更するたびに、コミットして GitHub にプッシュする**
- **ただし、コミットする前に必ずユーザーに確認を取ること**
  - 変更内容の要約とコミットメッセージ案を提示し、ユーザーの承認後にコミット＆プッシュする
  - 承認が得られない場合はコミットもプッシュもしない
- コミットメッセージは変更内容が分かるよう簡潔に日本語で記載する
- `.env` などの機密情報は絶対にコミットしない

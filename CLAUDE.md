# CLAUDE.md

このファイルは、本リポジトリで作業する Claude Code 向けのガイドです。

## プロジェクト概要

Supabase 認証付きの不動産管理 Web アプリ。

- メールアドレス＋パスワードによる会員登録・ログイン
- ログイン後は物件一覧画面（ダミーデータ）へ遷移
- 未ログイン時はログイン画面へリダイレクト
- ログアウト機能

## 技術スタック

- React + Vite
- React Router（画面遷移・ルートガード）
- Supabase（`@supabase/supabase-js`）による認証

## ディレクトリ構成

```
src/
  lib/supabaseClient.js   Supabase クライアントの生成（.env から接続情報を読み込む）
  contexts/AuthContext.jsx 認証状態（セッション）を全体に提供するコンテキスト
  components/ProtectedRoute.jsx 未ログイン時にログイン画面へリダイレクトするガード
  pages/Login.jsx         ログイン画面
  pages/Signup.jsx        会員登録画面
  pages/Properties.jsx    物件一覧画面（カード形式）
  data/properties.js      物件のダミーデータ
```

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

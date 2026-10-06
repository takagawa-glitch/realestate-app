-- =========================================================
-- 不動産管理アプリ用テーブル定義
-- Supabase ダッシュボードの SQL Editor に貼り付けて実行する
-- =========================================================

-- 物件テーブル
create table if not exists public.properties (
  id         uuid primary key default gen_random_uuid(),
  -- 登録したユーザー（未指定ならログイン中のユーザーIDが自動で入る）
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- 物件名
  name       text not null check (char_length(name) > 0),
  -- 家賃（円）
  rent       integer not null check (rent >= 0),
  -- エリア名
  area       text not null,
  -- 間取り（例：1LDK）
  layout     text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ユーザーごとの一覧取得を速くするためのインデックス
create index if not exists properties_user_id_idx on public.properties (user_id);

-- 更新時に updated_at を自動で現在時刻にする
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- 行レベルセキュリティ（RLS）
-- 自分が登録した物件のみ表示・登録・編集・削除できる
-- ---------------------------------------------------------
alter table public.properties enable row level security;

-- ログインユーザーにテーブル操作の権限を付与する（行の制限は下のポリシーで行う）
grant select, insert, update, delete on public.properties to authenticated;

-- 表示：自分の物件のみ
drop policy if exists "自分の物件のみ表示" on public.properties;
create policy "自分の物件のみ表示"
  on public.properties for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- 登録：自分のユーザーIDでのみ登録できる
drop policy if exists "自分の物件として登録" on public.properties;
create policy "自分の物件として登録"
  on public.properties for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- 編集：自分の物件のみ、かつ他人の物件に書き換えられない
drop policy if exists "自分の物件のみ編集" on public.properties;
create policy "自分の物件のみ編集"
  on public.properties for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 削除：自分の物件のみ
drop policy if exists "自分の物件のみ削除" on public.properties;
create policy "自分の物件のみ削除"
  on public.properties for delete
  to authenticated
  using ((select auth.uid()) = user_id);

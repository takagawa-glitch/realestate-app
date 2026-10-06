import { supabase } from './supabaseClient'

// 物件テーブルへの CRUD 操作をまとめたモジュール
// どの行を操作できるかは Supabase 側の RLS ポリシーで制限される（自分の物件のみ）

const TABLE = 'properties'
const COLUMNS = 'id, name, rent, area, layout, created_at'

// エラーがあれば例外にして呼び出し側でまとめて扱えるようにする
const unwrap = ({ data, error }) => {
  if (error) throw error
  return data
}

// 一覧取得（SELECT）：新しく登録した順
export async function fetchProperties() {
  return unwrap(
    await supabase
      .from(TABLE)
      .select(COLUMNS)
      .order('created_at', { ascending: false })
  )
}

// 新規登録（INSERT）：user_id はテーブルの既定値でログイン中のユーザーになる
export async function createProperty(property) {
  return unwrap(
    await supabase.from(TABLE).insert(property).select(COLUMNS).single()
  )
}

// 編集（UPDATE）
export async function updateProperty(id, property) {
  return unwrap(
    await supabase
      .from(TABLE)
      .update(property)
      .eq('id', id)
      .select(COLUMNS)
      .single()
  )
}

// 削除（DELETE）
export async function deleteProperty(id) {
  unwrap(await supabase.from(TABLE).delete().eq('id', id))
}

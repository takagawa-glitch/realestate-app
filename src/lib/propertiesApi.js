import { supabase } from './supabaseClient'

// 物件テーブルへの CRUD 操作をまとめたモジュール
// どの行を操作できるかは Supabase 側の RLS ポリシーで制限される（自分の物件のみ）

const TABLE = 'properties'
const COLUMNS = 'id, name, rent, area, layout, image_path, created_at'

// 物件画像を保存する Storage のバケット（非公開）
const BUCKET = 'property-images'
// 署名付きURLの有効期間（秒）
const SIGNED_URL_EXPIRES_IN = 60 * 60

// アップロードできる画像の条件（バケット側の制限と合わせる）
export const IMAGE_MAX_SIZE = 5 * 1024 * 1024
export const IMAGE_ACCEPT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// エラーがあれば例外にして呼び出し側でまとめて扱えるようにする
const unwrap = ({ data, error }) => {
  if (error) throw error
  return data
}

// 画像を「ユーザーID/ランダムなファイル名」でアップロードし、保存先のパスを返す
async function uploadImage(file) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) throw new Error('ログインしていません')

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${session.user.id}/${crypto.randomUUID()}.${ext}`
  unwrap(
    await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false })
  )
  return path
}

// 画像を削除する（物件データの保存は済んでいるため、失敗しても処理は止めない）
async function removeImage(path) {
  if (!path) return
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) console.error('画像の削除に失敗しました', error)
}

// 物件の配列に、画像表示用の署名付きURL（image_url）を付与する
async function attachImageUrls(properties) {
  const paths = properties.map((p) => p.image_path).filter(Boolean)
  if (paths.length === 0) {
    return properties.map((p) => ({ ...p, image_url: null }))
  }

  const signed = unwrap(
    await supabase.storage
      .from(BUCKET)
      .createSignedUrls(paths, SIGNED_URL_EXPIRES_IN)
  )
  const urlByPath = new Map(signed.map((s) => [s.path, s.signedUrl]))
  return properties.map((p) => ({
    ...p,
    image_url: p.image_path ? urlByPath.get(p.image_path) ?? null : null,
  }))
}

// 1件分の画像URLを付与する
async function attachImageUrl(property) {
  const [withUrl] = await attachImageUrls([property])
  return withUrl
}

// 一覧取得（SELECT）：新しく登録した順
export async function fetchProperties() {
  const properties = unwrap(
    await supabase
      .from(TABLE)
      .select(COLUMNS)
      .order('created_at', { ascending: false })
  )
  return attachImageUrls(properties)
}

// 新規登録（INSERT）：user_id はテーブルの既定値でログイン中のユーザーになる
// imageFile を渡すと画像をアップロードして物件に紐づける
export async function createProperty(property, { imageFile } = {}) {
  const imagePath = imageFile ? await uploadImage(imageFile) : null
  try {
    const created = unwrap(
      await supabase
        .from(TABLE)
        .insert({ ...property, image_path: imagePath })
        .select(COLUMNS)
        .single()
    )
    return attachImageUrl(created)
  } catch (err) {
    // 登録に失敗した場合はアップロード済みの画像を片付ける
    await removeImage(imagePath)
    throw err
  }
}

// 編集（UPDATE）
// imageFile を渡すと画像を差し替え、removeImage: true で画像を削除する
// currentImagePath は差し替え・削除前の画像パス（古い画像の削除に使う）
export async function updateProperty(
  id,
  property,
  { imageFile, removeImage: shouldRemoveImage, currentImagePath } = {}
) {
  const values = { ...property }
  let newImagePath = null
  if (imageFile) {
    newImagePath = await uploadImage(imageFile)
    values.image_path = newImagePath
  } else if (shouldRemoveImage) {
    values.image_path = null
  }

  let updated
  try {
    updated = unwrap(
      await supabase
        .from(TABLE)
        .update(values)
        .eq('id', id)
        .select(COLUMNS)
        .single()
    )
  } catch (err) {
    await removeImage(newImagePath)
    throw err
  }

  // 画像を差し替え・削除した場合は古い画像を Storage から消す
  if ((imageFile || shouldRemoveImage) && currentImagePath) {
    await removeImage(currentImagePath)
  }
  return attachImageUrl(updated)
}

// 削除（DELETE）：物件に紐づく画像もあわせて削除する
export async function deleteProperty(id, imagePath) {
  unwrap(await supabase.from(TABLE).delete().eq('id', id))
  await removeImage(imagePath)
}

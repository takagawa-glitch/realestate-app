import { useEffect, useState } from 'react'
import { IMAGE_ACCEPT_TYPES, IMAGE_MAX_SIZE } from '../lib/propertiesApi'

// 物件の新規登録・編集で共用するフォーム
// initialValues を渡すと編集フォームとして値が入った状態で表示される
// onSubmit(values, { imageFile, removeImage }) の形で呼び出す
export default function PropertyForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [rent, setRent] = useState(initialValues?.rent?.toString() ?? '')
  const [area, setArea] = useState(initialValues?.area ?? '')
  const [layout, setLayout] = useState(initialValues?.layout ?? '')
  // 新しく選択した画像ファイル
  const [imageFile, setImageFile] = useState(null)
  // 新しく選択した画像のプレビュー用URL
  const [previewUrl, setPreviewUrl] = useState(null)
  // 登録済みの画像を削除するかどうか
  const [removeImage, setRemoveImage] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 選択した画像のプレビューURLを作成し、不要になったら解放する
  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(imageFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  // 画像の選択：形式とサイズを確認する
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    // 同じファイルを選び直しても反応するように値をリセットする
    e.target.value = ''
    if (!file) return
    if (!IMAGE_ACCEPT_TYPES.includes(file.type)) {
      setError('画像は JPEG・PNG・WebP・GIF 形式のみ添付できます')
      return
    }
    if (file.size > IMAGE_MAX_SIZE) {
      setError('画像のサイズは 5MB 以下にしてください')
      return
    }
    setError('')
    setImageFile(file)
    setRemoveImage(false)
  }

  // 画像を外す：新しく選んだ画像があればそれを取り消し、なければ登録済み画像を削除対象にする
  const handleImageClear = () => {
    if (imageFile) {
      setImageFile(null)
    } else {
      setRemoveImage(true)
    }
  }

  // 表示する画像（新しく選んだ画像 → 登録済みの画像の順）
  const displayImageUrl =
    previewUrl ?? (removeImage ? null : initialValues?.image_url ?? null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      // 家賃は数値に変換して渡す
      await onSubmit(
        {
          name: name.trim(),
          rent: Number(rent),
          area: area.trim(),
          layout: layout.trim(),
        },
        { imageFile, removeImage }
      )
    } catch (err) {
      setError('保存に失敗しました：' + err.message)
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="property-form">
      <label>
        物件名
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label>
        家賃（円）
        <input
          type="number"
          min="0"
          step="1"
          value={rent}
          onChange={(e) => setRent(e.target.value)}
          required
        />
      </label>
      <label>
        エリア名
        <input value={area} onChange={(e) => setArea(e.target.value)} required />
      </label>
      <label>
        間取り
        <input
          value={layout}
          onChange={(e) => setLayout(e.target.value)}
          placeholder="例：1LDK"
          required
        />
      </label>
      <div className="image-field">
        <span>物件画像（任意・5MB まで）</span>
        {displayImageUrl && (
          <img src={displayImageUrl} alt="物件画像のプレビュー" className="image-preview" />
        )}
        <div className="image-field-actions">
          <label className="file-button">
            {displayImageUrl ? '画像を変更' : '画像を選択'}
            <input
              type="file"
              accept={IMAGE_ACCEPT_TYPES.join(',')}
              onChange={handleImageChange}
              disabled={submitting}
            />
          </label>
          {displayImageUrl && (
            <button type="button" onClick={handleImageClear} disabled={submitting}>
              画像を外す
            </button>
          )}
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting ? '保存中...' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} disabled={submitting}>
          キャンセル
        </button>
      </div>
    </form>
  )
}

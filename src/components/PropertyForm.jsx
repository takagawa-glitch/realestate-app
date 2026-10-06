import { useState } from 'react'

// 物件の新規登録・編集で共用するフォーム
// initialValues を渡すと編集フォームとして値が入った状態で表示される
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
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      // 家賃は数値に変換して渡す
      await onSubmit({
        name: name.trim(),
        rent: Number(rent),
        area: area.trim(),
        layout: layout.trim(),
      })
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

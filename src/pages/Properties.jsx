import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PropertyForm from '../components/PropertyForm'
import {
  createProperty,
  deleteProperty,
  fetchProperties,
  updateProperty,
} from '../lib/propertiesApi'

// 家賃を「68,000円」の形式に整形する
const formatRent = (rent) => `${rent.toLocaleString('ja-JP')}円`

// 物件一覧画面（カード形式）
export default function Properties() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // 新規登録フォームの表示状態
  const [creating, setCreating] = useState(false)
  // 編集中の物件ID（編集していなければ null）
  const [editingId, setEditingId] = useState(null)

  // 画面表示時に Supabase から物件一覧を取得する
  useEffect(() => {
    fetchProperties()
      .then(setProperties)
      .catch((err) => setError('物件の取得に失敗しました：' + err.message))
      .finally(() => setLoading(false))
  }, [])

  // 新規登録：保存後は一覧の先頭に追加する
  const handleCreate = async (values) => {
    const created = await createProperty(values)
    setProperties((prev) => [created, ...prev])
    setCreating(false)
  }

  // 編集：保存後は該当の物件を差し替える
  const handleUpdate = async (id, values) => {
    const updated = await updateProperty(id, values)
    setProperties((prev) => prev.map((p) => (p.id === id ? updated : p)))
    setEditingId(null)
  }

  // 削除：確認ダイアログで OK の場合のみ削除する
  const handleDelete = async (property) => {
    if (!window.confirm(`「${property.name}」を削除しますか？`)) return
    setError('')
    try {
      await deleteProperty(property.id)
      setProperties((prev) => prev.filter((p) => p.id !== property.id))
    } catch (err) {
      setError('削除に失敗しました：' + err.message)
    }
  }

  // ログアウト後はログイン画面へ遷移する
  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="page">
      <header className="header">
        <h1>物件一覧</h1>
        <div className="header-right">
          <span className="user-email">{user?.email}</span>
          <button onClick={handleLogout} className="logout-button">
            ログアウト
          </button>
        </div>
      </header>

      {/* 新規登録 */}
      {creating ? (
        <section className="card form-card">
          <h2 className="card-title">物件を登録</h2>
          <PropertyForm
            submitLabel="登録"
            onSubmit={handleCreate}
            onCancel={() => setCreating(false)}
          />
        </section>
      ) : (
        <button className="primary-button add-button" onClick={() => setCreating(true)}>
          ＋ 物件を登録
        </button>
      )}

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p className="loading">読み込み中...</p>
      ) : properties.length === 0 ? (
        <p className="empty">登録された物件はまだありません。</p>
      ) : (
        <ul className="card-list">
          {properties.map((property) => (
            <li key={property.id} className="card">
              {editingId === property.id ? (
                // 編集フォーム
                <PropertyForm
                  initialValues={property}
                  submitLabel="更新"
                  onSubmit={(values) => handleUpdate(property.id, values)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <h2 className="card-title">{property.name}</h2>
                  <p className="card-rent">
                    家賃 <strong>{formatRent(property.rent)}</strong> / 月
                  </p>
                  <p className="card-area">エリア：{property.area}</p>
                  <p className="card-area">間取り：{property.layout}</p>
                  <div className="card-actions">
                    <button onClick={() => setEditingId(property.id)}>編集</button>
                    <button
                      className="danger-button"
                      onClick={() => handleDelete(property)}
                    >
                      削除
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

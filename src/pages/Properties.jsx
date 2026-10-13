import { useEffect, useMemo, useState } from 'react'
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

// 検索・絞り込み条件の初期値
const INITIAL_FILTERS = {
  keyword: '',
  area: '',
  layout: '',
  rentMin: '',
  rentMax: '',
  sort: 'newest',
}

// 並び順の選択肢
const SORT_OPTIONS = [
  { value: 'newest', label: '新着順' },
  { value: 'rentAsc', label: '家賃が安い順' },
  { value: 'rentDesc', label: '家賃が高い順' },
]

// 重複を除いて並べた選択肢を作る
const uniqueSorted = (values) =>
  [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ja'))

// 検索・絞り込み・並び替えを適用する
function applyFilters(properties, filters) {
  const keyword = filters.keyword.trim().toLowerCase()
  const rentMin = filters.rentMin === '' ? null : Number(filters.rentMin)
  const rentMax = filters.rentMax === '' ? null : Number(filters.rentMax)

  const result = properties.filter((p) => {
    // キーワード：物件名・エリア名・間取りのいずれかに部分一致
    if (
      keyword &&
      ![p.name, p.area, p.layout].some((v) => v.toLowerCase().includes(keyword))
    ) {
      return false
    }
    if (filters.area && p.area !== filters.area) return false
    if (filters.layout && p.layout !== filters.layout) return false
    if (rentMin !== null && p.rent < rentMin) return false
    if (rentMax !== null && p.rent > rentMax) return false
    return true
  })

  if (filters.sort === 'rentAsc') return result.sort((a, b) => a.rent - b.rent)
  if (filters.sort === 'rentDesc') return result.sort((a, b) => b.rent - a.rent)
  // 新着順は取得時の並び（登録日時の新しい順）のまま
  return result
}

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
  // 検索・絞り込み条件
  const [filters, setFilters] = useState(INITIAL_FILTERS)

  // 絞り込みの選択肢（登録済みの物件から作る）
  const areaOptions = useMemo(
    () => uniqueSorted(properties.map((p) => p.area)),
    [properties]
  )
  const layoutOptions = useMemo(
    () => uniqueSorted(properties.map((p) => p.layout)),
    [properties]
  )
  // 条件を適用した表示用の物件一覧
  const filteredProperties = useMemo(
    () => applyFilters(properties, filters),
    [properties, filters]
  )
  // 並び順以外の条件が指定されているか
  const isFiltering = Object.keys(INITIAL_FILTERS).some(
    (key) => key !== 'sort' && filters[key] !== INITIAL_FILTERS[key]
  )

  // 検索・絞り込み条件を 1 項目更新する
  const updateFilter = (key) => (e) =>
    setFilters((prev) => ({ ...prev, [key]: e.target.value }))

  // 並び順はそのままで、検索・絞り込み条件をクリアする
  const clearFilters = () =>
    setFilters((prev) => ({ ...INITIAL_FILTERS, sort: prev.sort }))

  // 画面表示時に Supabase から物件一覧を取得する
  useEffect(() => {
    fetchProperties()
      .then(setProperties)
      .catch((err) => setError('物件の取得に失敗しました：' + err.message))
      .finally(() => setLoading(false))
  }, [])

  // 新規登録：保存後は一覧の先頭に追加する
  const handleCreate = async (values, { imageFile }) => {
    const created = await createProperty(values, { imageFile })
    setProperties((prev) => [created, ...prev])
    setCreating(false)
  }

  // 編集：保存後は該当の物件を差し替える
  const handleUpdate = async (property, values, { imageFile, removeImage }) => {
    const updated = await updateProperty(property.id, values, {
      imageFile,
      removeImage,
      currentImagePath: property.image_path,
    })
    setProperties((prev) => prev.map((p) => (p.id === property.id ? updated : p)))
    setEditingId(null)
  }

  // 削除：確認ダイアログで OK の場合のみ削除する（画像もあわせて削除）
  const handleDelete = async (property) => {
    if (!window.confirm(`「${property.name}」を削除しますか？`)) return
    setError('')
    try {
      await deleteProperty(property.id, property.image_path)
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

      {/* 検索・絞り込み */}
      {!loading && properties.length > 0 && (
        <section className="card filter-card">
          <div className="filter-grid">
            <label className="filter-keyword">
              キーワード
              <input
                type="search"
                value={filters.keyword}
                onChange={updateFilter('keyword')}
                placeholder="物件名・エリア・間取りで検索"
              />
            </label>
            <label>
              エリア
              <select value={filters.area} onChange={updateFilter('area')}>
                <option value="">すべて</option>
                {areaOptions.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </label>
            <label>
              間取り
              <select value={filters.layout} onChange={updateFilter('layout')}>
                <option value="">すべて</option>
                {layoutOptions.map((layout) => (
                  <option key={layout} value={layout}>
                    {layout}
                  </option>
                ))}
              </select>
            </label>
            <div className="filter-rent">
              <span>家賃（円）</span>
              <div className="filter-rent-inputs">
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={filters.rentMin}
                  onChange={updateFilter('rentMin')}
                  placeholder="下限なし"
                  aria-label="家賃の下限"
                />
                <span>〜</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={filters.rentMax}
                  onChange={updateFilter('rentMax')}
                  placeholder="上限なし"
                  aria-label="家賃の上限"
                />
              </div>
            </div>
            <label>
              並び順
              <select value={filters.sort} onChange={updateFilter('sort')}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="filter-footer">
            <span className="filter-count">
              {filteredProperties.length} 件 / 全 {properties.length} 件
            </span>
            {isFiltering && (
              <button type="button" onClick={clearFilters}>
                条件をクリア
              </button>
            )}
          </div>
        </section>
      )}

      {loading ? (
        <p className="loading">読み込み中...</p>
      ) : properties.length === 0 ? (
        <p className="empty">登録された物件はまだありません。</p>
      ) : filteredProperties.length === 0 ? (
        <p className="empty">条件に一致する物件はありません。</p>
      ) : (
        <ul className="card-list">
          {filteredProperties.map((property) => (
            <li key={property.id} className="card">
              {editingId === property.id ? (
                // 編集フォーム
                <PropertyForm
                  initialValues={property}
                  submitLabel="更新"
                  onSubmit={(values, image) => handleUpdate(property, values, image)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  {property.image_url ? (
                    <img
                      src={property.image_url}
                      alt={`${property.name}の画像`}
                      className="card-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="card-image card-image-empty">画像なし</div>
                  )}
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

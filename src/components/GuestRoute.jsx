import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// ログイン画面・会員登録画面用のコンポーネント
// すでにログイン済みの場合は物件一覧画面へリダイレクトする
export default function GuestRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) {
    return <p className="loading">読み込み中...</p>
  }

  if (session) {
    return <Navigate to="/properties" replace />
  }

  return children
}

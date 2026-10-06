import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// ログインが必要な画面を守るコンポーネント
// 未ログインの場合はログイン画面へリダイレクトする
export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  // セッション確認中は何も判定せず待機表示にする
  if (loading) {
    return <p className="loading">読み込み中...</p>
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}

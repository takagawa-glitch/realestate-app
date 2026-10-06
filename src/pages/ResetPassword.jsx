import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// パスワード再設定画面
// リセットメールのリンクを開くと、Supabase が一時的なログイン状態にしてこの画面へ戻す
export default function ResetPassword() {
  const { session, loading, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 新しいパスワードを保存する
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('確認用パスワードが一致しません。')
      return
    }

    setSubmitting(true)
    const { error } = await updatePassword(password)
    setSubmitting(false)

    if (error) {
      setError('パスワードの変更に失敗しました：' + error.message)
      return
    }

    // 変更後はそのままログイン状態なので物件一覧へ遷移する
    window.alert('パスワードを変更しました。')
    navigate('/properties', { replace: true })
  }

  if (loading) {
    return <p className="loading">読み込み中...</p>
  }

  // リンクの期限切れなどでログイン状態になっていない場合
  if (!session) {
    return (
      <div className="auth-container">
        <h1>パスワード再設定</h1>
        <p className="error">
          リンクが無効か、有効期限が切れています。ログイン画面から再度リセットメールを送信してください。
        </p>
        <p className="auth-link">
          <Link to="/login">ログイン画面へ</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <h1>パスワード再設定</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          新しいパスワード（6文字以上）
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>
        <label>
          新しいパスワード（確認）
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? '変更中...' : 'パスワードを変更'}
        </button>
      </form>
    </div>
  )
}

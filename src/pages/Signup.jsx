import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// 会員登録画面
export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // フォーム送信時に会員登録処理を行う
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)

    const { data, error } = await signUp(email, password)
    setSubmitting(false)

    if (error) {
      setError('会員登録に失敗しました：' + error.message)
      return
    }

    // メール確認が不要な設定ならセッションが返るので、そのまま物件一覧へ遷移する
    if (data.session) {
      navigate('/properties', { replace: true })
      return
    }

    // メール確認が必要な設定の場合は案内を表示する
    setMessage(
      '確認メールを送信しました。メール内のリンクをクリックしてから、ログインしてください。'
    )
  }

  return (
    <div className="auth-container">
      <h1>会員登録</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          メールアドレス
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label>
          パスワード（6文字以上）
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? '登録中...' : '会員登録'}
        </button>
      </form>
      <p className="auth-link">
        すでにアカウントをお持ちの方は <Link to="/login">ログイン</Link>
      </p>
    </div>
  )
}

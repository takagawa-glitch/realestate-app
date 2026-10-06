import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// ログイン画面
export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // フォーム送信時にログイン処理を行う
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { error } = await signIn(email, password)
    setSubmitting(false)

    if (error) {
      setError('ログインに失敗しました：' + error.message)
      return
    }

    // ログイン成功後は物件一覧画面へ遷移する
    navigate('/properties', { replace: true })
  }

  return (
    <div className="auth-container">
      <h1>ログイン</h1>
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
          パスワード
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
      <p className="auth-link">
        アカウントをお持ちでない方は <Link to="/signup">会員登録</Link>
      </p>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// ログイン画面
export default function Login() {
  const { signIn, sendPasswordResetEmail } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // パスワードリセットメールの送信状態と結果メッセージ
  const [sendingReset, setSendingReset] = useState(false)
  const [resetMessage, setResetMessage] = useState('')

  // 入力中のメールアドレス宛てにパスワードリセットメールを送信する
  const handleSendReset = async () => {
    setError('')
    setResetMessage('')
    setSendingReset(true)

    const { error } = await sendPasswordResetEmail(email)
    setSendingReset(false)

    if (error) {
      setError('メールの送信に失敗しました：' + error.message)
      return
    }

    // 登録の有無が第三者に分からないよう、常に同じ文言で案内する
    setResetMessage(
      `${email} が登録済みの場合、パスワード再設定用のメールを送信しました。メール内のリンクから新しいパスワードを設定してください。`
    )
  }

  // フォーム送信時にログイン処理を行う
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResetMessage('')
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
        {resetMessage && <p className="success">{resetMessage}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'ログイン中...' : 'ログイン'}
        </button>
        {/* ログインに失敗したときだけリセットメール送信ボタンを表示する */}
        {error && email && (
          <button
            type="button"
            className="secondary-button"
            onClick={handleSendReset}
            disabled={sendingReset}
          >
            {sendingReset ? '送信中...' : 'パスワードリセットメールを送る'}
          </button>
        )}
      </form>
      <p className="auth-link">
        アカウントをお持ちでない方は <Link to="/signup">会員登録</Link>
      </p>
    </div>
  )
}

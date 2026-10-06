import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// 認証状態を共有するためのコンテキスト
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // 現在のセッション（未ログインなら null）
  const [session, setSession] = useState(null)
  // 初回のセッション確認が終わるまでは読み込み中とする
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 起動時に保存済みのセッションを取得する
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // ログイン・ログアウトなど認証状態の変化を監視する
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    // アンマウント時に監視を解除する
    return () => data.subscription.unsubscribe()
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    // メールアドレスとパスワードで会員登録する
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    // メールアドレスとパスワードでログインする
    signIn: (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),
    // ログアウトする
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 各コンポーネントから認証情報を取得するためのフック
export function useAuth() {
  return useContext(AuthContext)
}

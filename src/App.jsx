import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Properties from './pages/Properties'

// ルーティングの定義
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 未ログイン向けの画面 */}
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />

          {/* ログインが必要な画面 */}
          <Route
            path="/properties"
            element={<ProtectedRoute><Properties /></ProtectedRoute>}
          />

          {/* それ以外のパスは物件一覧へ（未ログインならさらにログイン画面へ） */}
          <Route path="*" element={<Navigate to="/properties" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

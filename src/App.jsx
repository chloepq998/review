import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute'
import { isFirebaseConfigured } from './firebase/config'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import HomePlaceholder from './pages/HomePlaceholder'
import FirebaseSetupNotice from './pages/FirebaseSetupNotice'

function App() {
  if (!isFirebaseConfigured) {
    return <FirebaseSetupNotice />
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePlaceholder />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

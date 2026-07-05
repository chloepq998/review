import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute'
import { isFirebaseConfigured } from './firebase/config'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import HomePage from './pages/HomePage'
import NoteInputPage from './pages/NoteInputPage'
import ReviewPlaceholder from './pages/ReviewPlaceholder'
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
            <Route path="/" element={<HomePage />} />
            <Route path="/notes/new" element={<NoteInputPage />} />
            <Route path="/review" element={<ReviewPlaceholder />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

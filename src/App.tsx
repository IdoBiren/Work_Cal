import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { RequireApproved, RequireManager } from './auth/Guards'
import LoginPage from './pages/LoginPage'
import CompleteProfilePage from './pages/CompleteProfilePage'
import PendingPage from './pages/PendingPage'
import MyAvailabilityPage from './pages/MyAvailabilityPage'
import WeekSummaryPage from './pages/WeekSummaryPage'
import RequirementsPage from './pages/RequirementsPage'
import ManageUsersPage from './pages/ManageUsersPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/complete-profile" element={<CompleteProfilePage />} />
          <Route path="/pending" element={<PendingPage />} />
          <Route
            path="/"
            element={
              <RequireApproved>
                <MyAvailabilityPage />
              </RequireApproved>
            }
          />
          <Route
            path="/summary"
            element={
              <RequireManager>
                <WeekSummaryPage />
              </RequireManager>
            }
          />
          <Route
            path="/requirements"
            element={
              <RequireManager>
                <RequirementsPage />
              </RequireManager>
            }
          />
          <Route
            path="/users"
            element={
              <RequireManager>
                <ManageUsersPage />
              </RequireManager>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

import { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthPage from './components/auth/AuthPage'
import { DistributorDashboard } from './components/dashboard/distributor-dashboard'
import { BusinessAdminDashboard } from './components/dashboard/business-admin-dashboard'
import { ComplianceDashboard } from './components/dashboard/compliance-dashboard'
import { ServiceEventSubmission } from './components/service/service-event-submission'
import ServiceSelection from './components/ServiceSelection'
import Selection from './pages/Selection'
import CashIn from './pages/CashIn'
import CashOut from './pages/CashOut'
import TransactionHistory from './pages/TransactionHistory'
import Profile from './pages/Profile'
import { AuthProvider, useAuth } from './lib/AuthContext'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth()

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-brand'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-accent'></div>
      </div>
    )
  }

  if (!token) {
    return <Navigate to='/login' replace />
  }

  return <>{children}</>
}

function RoleBasedRoute({
  children,
}: {
  allowedRoles: string[]
  children: React.ReactNode
}) {
  return <>{children}</>
}

function RoleBasedRedirect() {
  const { token } = useAuth()

  if (!token) {
    return <Navigate to='/login' replace />
  }

  return <Navigate to='/services' replace />
  // switch (user.role) {
  //   // case "business-admin":
  //     // return <Navigate to="/business-admin" replace />;
  //   case "distributor":
  //   default:
  // }
}

const App = () => {
  return (
    <div className='bg-brand text-brand'>
      <Suspense fallback={<div>Loading...</div>}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path='/login' element={<AuthPage />} />

              <Route
                path='/distributor'
                element={
                  <ProtectedRoute>
                    <DistributorDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path='/distributor/submit-service'
                element={
                  <ProtectedRoute>
                    <ServiceEventSubmission
                      onBack={() => window.history.back()}
                    />
                  </ProtectedRoute>
                }
              />

              <Route
                path='/business-admin'
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={['business-admin']}>
                      <BusinessAdminDashboard />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />

              <Route
                path='/compliance'
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={['compliance']}>
                      <ComplianceDashboard />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />

              <Route
                path='/'
                element={
                  <ProtectedRoute>
                    <RoleBasedRedirect />
                  </ProtectedRoute>
                }
              />

              <Route
                path='/services'
                element={
                  <ProtectedRoute>
                    <ServiceSelection />
                  </ProtectedRoute>
                }
              />

              <Route
                path='/distributor/cico'
                element={
                  <ProtectedRoute>
                    <Selection />
                  </ProtectedRoute>
                }
              />

              <Route
                path='/distributor/cico/cash-in'
                element={
                  <ProtectedRoute>
                    <CashIn />
                  </ProtectedRoute>
                }
              />

              <Route
                path='/distributor/cico/cash-out'
                element={
                  <ProtectedRoute>
                    <CashOut />
                  </ProtectedRoute>
                }
              />

              <Route
                path='/profile'
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path='/distributor/cico/history'
                element={
                  <ProtectedRoute>
                    <TransactionHistory />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </Suspense>
    </div>
  )
}

export default App

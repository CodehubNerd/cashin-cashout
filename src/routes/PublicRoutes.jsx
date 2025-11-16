import { Routes, Route } from 'react-router-dom'
import {
  Home,
  Login,
  CicoOptions,
  CashIn,
  Cashout,
  Profile,
  Transactionhistory,
} from '../pages/User'
import PrivateRoute from '../components/PrivateRoute'

export default function PublicRoutes() {
  return (
    <Routes>
      <Route path='/' element={<Login />} />
      <Route
        path='/home'
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />

      {/* Profile */}
      <Route
        path='/profile'
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />

      {/* Transaction History */}
      <Route
        path='/history'
        element={
          <PrivateRoute>
            <Transactionhistory />
          </PrivateRoute>
        }
      />

      {/* Allow wallet as URL param so direct visits don't rely on location.state */}
      <Route
        path='/distributor/cico/cash-in/:wallet?'
        element={
          <PrivateRoute>
            <CashIn />
          </PrivateRoute>
        }
      />
      <Route
        path='/distributor/cico/cash-out/:wallet?'
        element={
          <PrivateRoute>
            <Cashout />
          </PrivateRoute>
        }
      />
      <Route
        path='/cico'
        element={
          <PrivateRoute>
            <CicoOptions />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

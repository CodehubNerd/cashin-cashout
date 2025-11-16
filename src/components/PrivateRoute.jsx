import React from 'react'
import { Navigate } from 'react-router-dom'
import { useUserAuth } from '../context/appstate/UserAuthContext'

export default function PrivateRoute({ children }) {
  const { token } = useUserAuth()
  
  if (!token) return <Navigate to="/" replace />

  return children
}

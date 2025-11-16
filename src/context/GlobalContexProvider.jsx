import React from 'react'
import { UserAuthProvider } from './appstate/UserAuthContext'

const GlobalContextProvider = ({ children }) => {
  return <UserAuthProvider>{children}</UserAuthProvider>
}

export default GlobalContextProvider

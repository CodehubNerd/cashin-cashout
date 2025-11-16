import { createContext, useContext, useState } from 'react'

const UserAuthContext = createContext()

export const useUserAuth = () => useContext(UserAuthContext)
// Add the expected hook name used across the app
export const useAuth = () => useContext(UserAuthContext)

export const UserAuthProvider = ({ children }) => {
  const [agent, setAgent] = useState(null)
  const [sessionToken, setSessionToken] = useState(null)

  const login = (agentData, tokenData) => {
    setAgent(agentData)
    setSessionToken(tokenData)
  }

  const logout = () => {
    setAgent(null)
    setSessionToken(null)
  }

  const updateAgent = (newAgent) => {
    setAgent(newAgent)
  }

  return (
    <UserAuthContext.Provider
      value={{
        agent,
        sessionToken,
        updateAgent,
        user: agent,
        token: sessionToken,
        login,
        logout,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  )
}

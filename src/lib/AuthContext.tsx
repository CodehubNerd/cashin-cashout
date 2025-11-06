'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { AUTH_URL } from '../api/config'

type ServiceType = 'daas' | 'cico'

interface Agent {
  agent_id: string
  current_balance: number
  email?: string
  full_name?: string
  fund_limit?: number
  phone_number: string
  username?: string
  // ...other agent fields...
}

interface AuthContextType {
  sessionToken: string | null
  token: string | null
  agent: Agent | null
  currentPhone: string | null
  selectedService: ServiceType | null
  loading: boolean
  login: (phone: string, otp: string) => Promise<void>
  logout: () => void
  setSelectedService: (service: ServiceType) => void
  updateAgent?: (agent: Agent) => void // <-- add optional here for backward compatibility
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [agent, setAgent] = useState<Agent | null>(null)
  const [selectedService, setSelectedServiceState] =
    useState<ServiceType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = sessionStorage.getItem('session_token')
      const savedAgent = sessionStorage.getItem('agent')
      const savedService = sessionStorage.getItem(
        'selectedService'
      ) as ServiceType | null

      if (savedToken) setSessionToken(savedToken)
      if (savedAgent) {
        try {
          setAgent(JSON.parse(savedAgent))
        } catch {
          setAgent(null)
        }
      }
      if (savedService) setSelectedServiceState(savedService)

      setLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (phone: string, otp: string) => {
    setLoading(true)
    try {
      const res = await axios.post(
        `${AUTH_URL}/v1/cico/agents/auth/verify-otp`,
        {
          phone_number: phone,
          otp_code: otp,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )

      // expected shape: { data: { session_token, agent, ... } }
      const respData = res.data?.data
      const token = respData?.session_token ?? null
      const agentObj: Agent | null = respData?.agent ?? null

      if (!token || !agentObj) {
        throw new Error('Invalid login response')
      }

      sessionStorage.setItem('session_token', token)
      sessionStorage.setItem('agent', JSON.stringify(agentObj))
      setSessionToken(token)
      setAgent(agentObj)
    } catch (err) {
      // rethrow to caller
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    sessionStorage.removeItem('session_token')
    sessionStorage.removeItem('agent')
    sessionStorage.removeItem('selectedService')
    setSessionToken(null)
    setAgent(null)
    setSelectedServiceState(null)
  }

  const setSelectedService = (service: ServiceType) => {
    sessionStorage.setItem('selectedService', service)
    setSelectedServiceState(service)
  }

  // Add updateAgent to keep agent state + sessionStorage in sync
  const updateAgent = (updatedAgent: Agent) => {
    try {
      sessionStorage.setItem('agent', JSON.stringify(updatedAgent))
    } catch {
      // ignore storage failures
    }
    setAgent(updatedAgent)
  }

  return (
    <AuthContext.Provider
      value={{
        sessionToken,
        token: sessionToken,
        agent,
        currentPhone: agent?.phone_number ?? null,
        selectedService,
        loading,
        login,
        logout,
        setSelectedService,
        updateAgent, // <-- expose it
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

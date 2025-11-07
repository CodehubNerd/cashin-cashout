import React from 'react'
import Layout from '../components/Layout'
import axios from 'axios'
import { useAuth } from '@/lib/AuthContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../components/ui/card'
import { Button } from '../components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AUTH_URL } from '../api/config'

type AgentResp = {
  success: boolean
  data: {
    agent_id: string
    username: string
    email?: string
    full_name?: string
    phone_number?: string
    fund_limit?: number
    current_balance?: number
    available_balance?: number
    holds_balance?: number
    is_active?: boolean
    is_suspended?: boolean
    total_transactions_count?: number
    last_transaction_at?: number
    last_login_at?: number
  }
}

type Txn = {
  transaction_id: string
  transaction_type: string
  amount: number
  party_id: string
  status: string
  status_message?: string
  created_at?: number
  completed_at?: number
}

type TxnsResp = {
  success: boolean
  data: Txn[]
  pagination?: {
    total: number
    page: number
    limit: number
    total_pages: number
  }
}

type SummaryResp = {
  success: boolean
  data: {
    total_transactions: number
    successful_transactions: number
    failed_transactions: number
    total_volume: number
    cash_in: { count: number; volume: number }
    cash_out: { count: number; volume: number }
    average_transaction_amount: number
    current_balance: number
    fund_limit: number
  }
}

const Profile: React.FC = () => {
  const { sessionToken } = useAuth()
  const [agent, setAgent] = React.useState<AgentResp['data'] | null>(null)
  const [txns, setTxns] = React.useState<Txn[]>([])
  const [summary, setSummary] = React.useState<SummaryResp['data'] | null>(null)
  const [loading, setLoading] = React.useState(true)
  const navigate = useNavigate()

  // Full-width banner messages (status checks)
  const [statusMessages, setStatusMessages] = React.useState<
    Record<string, { status: string; status_message?: string }>
  >({})
  const [latestStatusId, setLatestStatusId] = React.useState<string | null>(
    null
  )

  // persisted failure reasons (loaded from localStorage 'txnReasons')
  const [failureReasons, setFailureReasons] = React.useState<
    Record<string, string>
  >({})

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('txnReasons')
      if (raw) setFailureReasons(JSON.parse(raw))
    } catch (e) {
      console.error('load txnReasons error', e)
    }
  }, [])

  const checkTxnStatus = async (transaction_id: string) => {
    if (!sessionToken) return
    setStatusMessages((s) => ({
      ...s,
      [transaction_id]: { status: 'loading', status_message: 'Checking...' },
    }))
    setLatestStatusId(transaction_id)

    try {
      const headers = {
        Authorization: `Bearer ${sessionToken ?? ''}`,
        'Content-Type': 'application/json',
      }
      const resp = await axios.get(
        `${AUTH_URL}/v1/cico/agents/transactions/${transaction_id}`,
        { headers }
      )
      const payload = resp?.data?.data ?? resp?.data ?? null
      const status = payload?.status ?? 'unknown'
      const status_message =
        payload?.status_message ?? payload?.description ?? ''
      setStatusMessages((s) => ({
        ...s,
        [transaction_id]: { status, status_message },
      }))
      setTimeout(() => {
        setStatusMessages((s) => {
          const copy = { ...s }
          delete copy[transaction_id]
          return copy
        })
        setLatestStatusId((cur) => (cur === transaction_id ? null : cur))
      }, 5000)
    } catch (err) {
      console.error('Check txn status error', err)
      setStatusMessages((s) => ({
        ...s,
        [transaction_id]: {
          status: 'error',
          status_message: 'Unable to fetch transaction status',
        },
      }))
      setLatestStatusId(transaction_id)
      setTimeout(() => {
        setStatusMessages((s) => {
          const copy = { ...s }
          delete copy[transaction_id]
          return copy
        })
        setLatestStatusId((cur) => (cur === transaction_id ? null : cur))
      }, 5000)
    }
  }

  React.useEffect(() => {
    let mounted = true
    const headers = {
      Authorization: `Bearer ${sessionToken ?? ''}`,
      'Content-Type': 'application/json',
    }

    const p1 = axios.get<AgentResp>(`${AUTH_URL}/v1/cico/agents/me`, {
      headers,
    })
    const p2 = axios.get<TxnsResp>(
      `${AUTH_URL}/v1/cico/agents/me/transactions?page=1&limit=10`,
      { headers }
    )
    const p3 = axios.get<SummaryResp>(
      `${AUTH_URL}/v1/cico/agents/me/summary/daily`,
      { headers }
    )

    Promise.all([p1, p2, p3])
      .then(([a, b, c]) => {
        if (!mounted) return
        const agentData = a?.data ? a.data.data ?? a.data : null
        let txnsData = b?.data ? b.data.data ?? b.data : []
        if (Array.isArray(txnsData)) {
          txnsData = txnsData.map((t: any) => ({
            ...t,
            status_message:
              t.status_message ?? t.statusMessage ?? t.description ?? undefined,
          }))
        }
        const summaryData = c?.data ? c.data.data ?? c.data : null

        setAgent(agentData ?? null)
        setTxns(Array.isArray(txnsData) ? txnsData : [])
        setSummary(summaryData ?? null)
      })
      .catch((err) => {
        console.error('Profile fetch error', err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [sessionToken])

  const formatCurrency = (n?: number) =>
    typeof n === 'number' ? `E ${n.toFixed(2)}` : 'E 0.00'

  const formatDate = (s?: number) =>
    s ? new Date(s * 1000).toLocaleString() : '-'

  return (
    <Layout title='Profile' showBack serviceType='cico'>
      <div className='max-w-3xl mx-auto space-y-4'>
        <div className='flex items-center justify-between'>
          <div />
          <Button
            variant='ghost'
            onClick={() => navigate(-1)}
            className='hidden sm:flex'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back
          </Button>
        </div>

        <Card className='bg-surface border-outline hover:shadow-lg transition-all'>
          <CardHeader>
            <CardTitle className='text-form-title text-lg text-white'>
              Agent Profile
            </CardTitle>
            <CardDescription className='text-secondary'>
              Account details & summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className='py-6 flex items-center justify-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-accent' />
              </div>
            ) : (
              <>
                <div className='flex items-center gap-4'>
                  <div className='h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl'>
                    {agent?.full_name
                      ? agent.full_name
                          .split(' ')
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join('')
                      : (agent?.username ?? 'A').slice(0, 2).toUpperCase()}
                  </div>
                  <div className='flex-1'>
                    <div className='text-sm text-secondary'>Name</div>
                    <div className='text-lg font-semibold text-white'>
                      {agent?.full_name ?? agent?.username ?? '-'}
                    </div>
                    <div className='text-sm text-secondary'>
                      {agent?.email ?? ''}
                    </div>
                    <div className='text-xs text-secondary mt-2'>
                      Phone: {agent?.phone_number ?? '-'}
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='text-xs text-secondary'>Available</div>
                    <div className='text-lg font-semibold text-blue-600'>
                      {formatCurrency(
                        agent?.available_balance ?? agent?.current_balance
                      )}
                    </div>
                    <div className='text-xs text-secondary mt-1'>
                      Current {formatCurrency(agent?.current_balance)} • Holds{' '}
                      {formatCurrency(agent?.holds_balance)}
                    </div>
                    <div className='text-xs text-secondary mt-1'>
                      Limit {formatCurrency(agent?.fund_limit)}
                    </div>
                  </div>
                </div>

                <div className='mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4'>
                  <div className='p-3 bg-stat rounded'>
                    <div className='text-xs text-secondary'>Total TXNS</div>
                    <div className='font-semibold text-lg text-white'>
                      {agent?.total_transactions_count ?? '-'}
                    </div>
                    <div className='text-xs text-secondary'>All time</div>
                  </div>

                  <div className='p-3 bg-stat rounded'>
                    <div className='text-xs text-secondary'>Last Login</div>
                    <div className='font-semibold text-sm text-white'>
                      {formatDate(agent?.last_login_at)}
                    </div>
                  </div>

                  <div className='p-3 bg-stat rounded'>
                    <div className='text-xs text-secondary'>Active</div>
                    <div className='font-semibold text-sm text-white'>
                      {agent?.is_active ? 'Yes' : 'No'}
                    </div>
                  </div>

                  <div className='p-3 bg-stat rounded'>
                    <div className='text-xs text-secondary'>Suspended</div>
                    <div className='font-semibold text-sm text-white'>
                      {agent?.is_suspended ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className='bg-surface border-outline hover:shadow-lg transition-all'>
          <CardHeader>
            <CardTitle className='text-form-title text-white'>
              Daily Summary
            </CardTitle>
            <CardDescription className='text-secondary'>
              Overview of today's activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className='py-4 text-secondary'>Loading summary...</div>
            ) : summary ? (
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                <div className='p-3 bg-stat rounded'>
                  <div className='text-xs text-secondary'>Total TXNS</div>
                  <div className='font-semibold text-lg text-white'>
                    {summary.total_transactions}
                  </div>
                  <div className='text-xs text-secondary'>
                    {summary.total_volume
                      ? `Vol: E ${summary.total_volume.toFixed(2)}`
                      : ''}
                  </div>
                </div>

                <div className='p-3 bg-stat rounded'>
                  <div className='text-xs text-secondary'>Successful</div>
                  <div className='font-semibold text-lg text-white'>
                    {summary.successful_transactions}
                  </div>
                  <div className='text-xs text-secondary'>
                    Failed {summary.failed_transactions}
                  </div>
                </div>

                <div className='p-3 bg-stat rounded'>
                  <div className='text-xs text-secondary'>Avg Amount</div>
                  <div className='font-semibold text-lg text-white'>
                    E {summary.average_transaction_amount?.toFixed(2)}
                  </div>
                  <div className='text-xs text-secondary'>
                    Current Balance {formatCurrency(summary.current_balance)}
                  </div>
                </div>
              </div>
            ) : (
              <div className='py-4 text-secondary'>No summary available</div>
            )}
          </CardContent>
        </Card>

        <Card className='bg-surface border-outline hover:shadow-lg transition-all'>
          <CardHeader>
            <CardTitle className='text-form-title text-white'>
              Recent Transactions
            </CardTitle>
            <CardDescription className='text-secondary'>
              Latest activity (amount, type, party, time, status)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className='py-4 text-secondary'>Loading transactions...</div>
            ) : txns && txns.length > 0 ? (
              <div className='space-y-2'>
                {txns.map((t) => (
                  <div
                    key={t.transaction_id}
                    className='p-3 bg-surface rounded flex items-center justify-between'
                  >
                    <div>
                      <div className='text-sm font-semibold text-white'>
                        {t.transaction_type.toUpperCase()} • E{' '}
                        {t.amount.toFixed(2)}
                      </div>
                      <div className='text-xs text-secondary'>
                        Party: {t.party_id}
                      </div>
                    </div>
                    <div className='text-right'>
                      <div
                        className={`text-xs font-medium ${
                          t.status?.toLowerCase() === 'successful'
                            ? 'text-green-600'
                            : t.status?.toLowerCase() === 'pending'
                            ? 'text-pending'
                            : 'text-red-600'
                        }`}
                      >
                        {t.status}
                      </div>
                      <div className='text-xs text-secondary'>
                        {formatDate(t.created_at)}
                      </div>
                      {t.status && t.status.toLowerCase() === 'pending' && (
                        <div className='mt-2'>
                          <Button
                            variant='ghost'
                            onClick={() => checkTxnStatus(t.transaction_id)}
                            className='text-sm'
                          >
                            Check Status
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div className='pt-2'>
                  <Button
                    variant='outline'
                    onClick={() => navigate('/distributor/cico/history')}
                    style={{ color: 'var(--accent-hover-color)' }}
                  >
                    View Full History
                  </Button>
                </div>
              </div>
            ) : (
              <div className='py-4 text-secondary'>No recent transactions</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full-width fixed banner for latest status message */}
      {latestStatusId && statusMessages[latestStatusId] && (
        <div className='fixed left-0 right-0 top-16 z-50 px-4'>
          <div className='w-full bg-white/95 text-gray-800 shadow-md py-3'>
            <div className='max-w-[1200px] mx-auto px-4 flex items-start gap-4'>
              <div className='flex-1'>
                <div className='font-medium'>
                  {statusMessages[latestStatusId].status === 'loading'
                    ? 'Checking status…'
                    : statusMessages[latestStatusId].status}
                </div>
              </div>
              <div>
                <button
                  className='text-sm text-gray-500 hover:text-gray-700'
                  onClick={() => {
                    setStatusMessages((s) => {
                      const copy = { ...s }
                      delete copy[latestStatusId]
                      return copy
                    })
                    setLatestStatusId(null)
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Profile

import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { X, Eye } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@/lib/AuthContext'
import { AUTH_URL } from '../api/config'

interface Transaction {
  id: string
  type: 'Cash-In' | 'Cash-Out'
  amount: number
  wallet: string
  customerPhone: string
  timestamp: string
  status: 'Success' | 'Failed' | 'Pending'
  commission: number
}

const TransactionHistory = () => {
  const { sessionToken } = useAuth()
  const [filter, setFilter] = useState({
    search: '',
    type: 'all',
    status: 'all',
    wallet: 'all',
  })
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null)

  // Mock transaction data
  const MOCK_TRANSACTIONS: Transaction[] = [
    {
      id: 'TXN20241127001',
      type: 'Cash-In',
      amount: 500.0,
      wallet: 'FNB',
      customerPhone: '+268 7612 3456',
      timestamp: '2024-11-27 14:30:00',
      status: 'Success',
      commission: 12.5,
    },
    {
      id: 'TXN20241127002',
      type: 'Cash-Out',
      amount: 1200.0,
      wallet: 'MOMO',
      customerPhone: '+268 7698 7654',
      timestamp: '2024-11-27 14:15:00',
      status: 'Success',
      commission: 24.0,
    },
    {
      id: 'TXN20241127003',
      type: 'Cash-In',
      amount: 300.0,
      wallet: 'Unayo',
      customerPhone: '+268 7634 5678',
      timestamp: '2024-11-27 13:45:00',
      status: 'Success',
      commission: 7.5,
    },
    {
      id: 'TXN20241127004',
      type: 'Cash-Out',
      amount: 800.0,
      wallet: 'Delta Pay',
      customerPhone: '+268 7656 7890',
      timestamp: '2024-11-27 12:30:00',
      status: 'Failed',
      commission: 0.0,
    },
    {
      id: 'TXN20241127005',
      type: 'Cash-In',
      amount: 1500.0,
      wallet: 'FNB',
      customerPhone: '+268 7623 4567',
      timestamp: '2024-11-27 11:20:00',
      status: 'Success',
      commission: 37.5,
    },
  ]

  // Replace the static transactions array with state
  const [transactions, setTransactions] =
    useState<Transaction[]>(MOCK_TRANSACTIONS)

  // Helper to normalize API transaction to our Transaction shape
  const mapApiTxnToTransaction = (txn: any): Transaction => {
    const id = txn.transaction_id ?? txn.id ?? 'N/A'
    const rawTs =
      txn.created_at ?? txn.timestamp ?? txn.completed_at ?? txn.time
    const timestamp =
      typeof rawTs === 'number'
        ? new Date(rawTs * 1000).toISOString()
        : rawTs ?? new Date().toISOString()

    const txnTypeRaw = (txn.transaction_type ?? txn.type ?? '').toString()
    const type =
      txnTypeRaw.toLowerCase().includes('in') ||
      txnTypeRaw.toLowerCase().includes('cash_in')
        ? 'Cash-In'
        : 'Cash-Out'

    const statusRaw = (txn.status ?? 'pending').toString()
    const status =
      statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1).toLowerCase()

    const amount = Number(txn.amount ?? txn.value ?? 0)
    const commission = Number(txn.commission ?? txn.fee ?? 0)
    const wallet = txn.party_id ?? txn.wallet ?? txn.provider ?? 'Unknown'
    const customerPhone =
      txn.customer_phone ?? txn.party_phone ?? txn.customerPhone ?? '-'

    return {
      id,
      type,
      amount,
      wallet,
      customerPhone,
      timestamp,
      status: (['Success', 'Failed', 'Pending'].includes(status)
        ? status
        : 'Pending') as 'Success' | 'Failed' | 'Pending',
      commission,
    }
  }

  useEffect(() => {
    let mounted = true
    if (!sessionToken) return
    const headers = {
      Authorization: `Bearer ${sessionToken ?? ''}`,
      'Content-Type': 'application/json',
    }

    axios
      .get(`${AUTH_URL}/v1/cico/agents/me/transactions?page=1&limit=50`, {
        headers,
      })
      .then((resp) => {
        if (!mounted) return
        const payload = resp?.data?.data ?? resp?.data ?? []
        if (Array.isArray(payload)) {
          const mapped = payload.map(mapApiTxnToTransaction)
          setTransactions(mapped)
        } else {
          // If payload is an object with list under a key, attempt common keys
          const list =
            payload.transactions ?? payload.data ?? payload.items ?? []
          if (Array.isArray(list)) {
            setTransactions(list.map(mapApiTxnToTransaction))
          }
        }
      })
      .catch((err) => {
        console.error('TransactionHistory fetch error', err)
        // keep existing/mock transactions as fallback
      })

    return () => {
      mounted = false
    }
  }, [sessionToken])

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.id.toLowerCase().includes(filter.search.toLowerCase()) ||
      transaction.customerPhone.includes(filter.search)
    const matchesType =
      filter.type === 'all' || transaction.type === filter.type
    const matchesStatus =
      filter.status === 'all' || transaction.status === filter.status
    const matchesWallet =
      filter.wallet === 'all' || transaction.wallet === filter.wallet

    return matchesSearch && matchesType && matchesStatus && matchesWallet
  })

  const formatCurrency = (amount: number) => `E ${amount.toFixed(2)}`

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return 'text-green-600 bg-green-100'
      case 'Failed':
        return 'text-red-600 bg-red-100'
      case 'Pending':
        return 'text-pending bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'Cash-In' ? 'text-blue-600' : 'text-purple-600'
  }

  const totalCommission = filteredTransactions
    .filter((t) => t.status === 'Success')
    .reduce((sum, t) => sum + t.commission, 0)

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Layout title='Transaction History' showBack serviceType='cico'>
      <div className='space-y-6'>
        {/* summary stats removed */}

        {/* Filters */}
        <Card className='shadow-lg bg-stat border-outline'>
          <CardHeader className='pb-4'>
            <CardTitle className='text-lg'>Filter Transactions</CardTitle>
            <CardDescription>
              Filter and search through your transaction history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='search'>Search</Label>
                <Input
                  id='search'
                  placeholder='Transaction ID or phone...'
                  value={filter.search}
                  onChange={(e) =>
                    setFilter({ ...filter, search: e.target.value })
                  }
                  className='border-gray-300'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='type'>Type</Label>
                <select
                  id='type'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  value={filter.type}
                  onChange={(e) =>
                    setFilter({ ...filter, type: e.target.value })
                  }
                >
                  <option value='all'>All Types</option>
                  <option value='Cash-In'>Cash-In</option>
                  <option value='Cash-Out'>Cash-Out</option>
                </select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='status'>Status</Label>
                <select
                  id='status'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  value={filter.status}
                  onChange={(e) =>
                    setFilter({ ...filter, status: e.target.value })
                  }
                >
                  <option value='all'>All Status</option>
                  <option value='Success'>Success</option>
                  <option value='Failed'>Failed</option>
                  <option value='Pending'>Pending</option>
                </select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='wallet'>Wallet</Label>
                <select
                  id='wallet'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  value={filter.wallet}
                  onChange={(e) =>
                    setFilter({ ...filter, wallet: e.target.value })
                  }
                >
                  <option value='all'>All Wallets</option>
                  <option value='FNB'>FNB</option>
                  <option value='Unayo'>Unayo</option>
                  <option value='Delta Pay'>Delta Pay</option>
                  <option value='MOMO'>MOMO</option>
                </select>
              </div>
              <div className='space-y-2'>
                <Label>&nbsp;</Label>
                <Button
                  variant='outline'
                  onClick={() =>
                    setFilter({
                      search: '',
                      type: 'all',
                      status: 'all',
                      wallet: 'all',
                    })
                  }
                  className='w-full border-gray-300'
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction List */}
        <Card className='shadow-lg bg-stat border-outline'>
          <CardHeader className='pb-4'>
            <CardTitle className='text-lg'>Transaction List</CardTitle>
            <CardDescription>
              Showing {filteredTransactions.length} of {transactions.length}{' '}
              transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className='bg-stat rounded-lg p-4 hover:opacity-90 transition-colors cursor-pointer'
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  {/* Mobile Layout */}
                  <div className='block lg:hidden'>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center space-x-2'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            transaction.status
                          )}`}
                        >
                          {transaction.status}
                        </span>
                        <span
                          className={`text-sm font-medium ${getTypeColor(
                            transaction.type
                          )}`}
                        >
                          {transaction.type}
                        </span>
                      </div>
                      <Eye className='h-4 w-4 text-gray-400' />
                    </div>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='font-medium text-sm text-gray-600'>
                          {transaction.wallet}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {formatTime(transaction.timestamp)}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='font-semibold text-lg'>
                          {formatCurrency(transaction.amount)}
                        </p>
                        {transaction.commission > 0 && (
                          <p className='text-xs text-green-600'>
                            +{formatCurrency(transaction.commission)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className='hidden lg:block'>
                    <div className='flex items-center justify-between mb-3'>
                      <div className='flex items-center space-x-3'>
                        <span className='font-mono font-medium text-sm'>
                          {transaction.id}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            transaction.status
                          )}`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                      <div className='text-right'>
                        <p className='font-semibold text-lg'>
                          {formatCurrency(transaction.amount)}
                        </p>
                        {transaction.commission > 0 && (
                          <p className='text-sm text-green-600'>
                            +{formatCurrency(transaction.commission)} commission
                          </p>
                        )}
                      </div>
                    </div>

                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                      <div>
                        <p className='text-gray-500'>Type</p>
                        <p className='font-medium'>{transaction.type}</p>
                      </div>
                      <div>
                        <p className='text-gray-500'>Wallet</p>
                        <p className='font-medium'>{transaction.wallet}</p>
                      </div>
                      <div>
                        <p className='text-gray-500'>Customer</p>
                        <p className='font-medium'>
                          {transaction.customerPhone}
                        </p>
                      </div>
                      <div>
                        <p className='text-gray-500'>Time</p>
                        <p className='font-medium'>
                          {new Date(transaction.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredTransactions.length === 0 && (
                <div className='text-center py-8'>
                  <p className='text-gray-500'>
                    No transactions found matching your filters
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className='fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl'>
              <h3 className='text-lg font-semibold'>Transaction Details</h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className='p-1 hover:bg-gray-100 rounded-full transition-colors'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <div className='p-6 space-y-4'>
              <div className='text-center pb-4 border-b border-gray-100'>
                <p className='text-2xl font-bold mb-1'>
                  {formatCurrency(selectedTransaction.amount)}
                </p>
                <div className='flex items-center justify-center space-x-2'>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      selectedTransaction.status
                    )}`}
                  >
                    {selectedTransaction.status}
                  </span>
                  <span
                    className={`text-sm font-medium ${getTypeColor(
                      selectedTransaction.type
                    )}`}
                  >
                    {selectedTransaction.type}
                  </span>
                </div>
              </div>

              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Transaction ID</span>
                  <span className='font-mono text-sm font-medium'>
                    {selectedTransaction.id}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-gray-500'>Wallet</span>
                  <span className='font-medium'>
                    {selectedTransaction.wallet}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-gray-500'>Customer Phone</span>
                  <span className='font-medium'>
                    {selectedTransaction.customerPhone}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-gray-500'>Date & Time</span>
                  <span className='font-medium'>
                    {new Date(selectedTransaction.timestamp).toLocaleString()}
                  </span>
                </div>

                {selectedTransaction.commission > 0 && (
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Commission</span>
                    <span className='font-medium text-green-600'>
                      +{formatCurrency(selectedTransaction.commission)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default TransactionHistory

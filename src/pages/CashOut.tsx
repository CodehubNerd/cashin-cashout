import Layout from '../components/Layout'

import { useNavigate } from 'react-router-dom'
import axios from 'axios'
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
import { useToast } from '@/lib/use-toast'
import { ArrowLeft } from 'lucide-react'
import React from 'react'
import { WalletProvider, walletProviders } from '@/lib/wallets'
import { useAuth } from '@/lib/AuthContext'
import { AUTH_URL } from '../api/config'

interface FormData {
  msidn: string
  pin: string
  voucherNumber: string
  withdrawAmount: string
}

interface CustomerData {
  name: string
  phone: string
  balance: number
  kycStatus: string
}

interface CustomerInfoBody {
  given_name?: string
  family_name?: string
  sub?: number
}

interface UnayoCashOutResponse {
  response: {
    Body: {
      AmountRedeemed: number
      AmountUnredeemed: number
      CcgTenantSCode: string
      DestNodTrhLineId: string
      InstanceId: string
      NodReqInId: string
      OriginMimControlId: string
      QRCode: string | null
      SrcNodTrhLineId: string
      UniqueTransactionId: string
      VoucherCode: string | null
    }
    Trailer: {
      StatusCode: number
      StatusDesc: string
      DetailedDesc: string
      Elapsed: number
    }
  }
}

const saveTxnReason = (
  transactionId: string | null | undefined,
  reason: string | null | undefined
) => {
  // store mapping txnId -> reason in localStorage so profile/history can show it
  if (!transactionId || !reason) return
  try {
    const key = 'txnReasons'
    const raw = localStorage.getItem(key) ?? '{}'
    const map = JSON.parse(raw) as Record<string, string>
    map[transactionId] = reason
    localStorage.setItem(key, JSON.stringify(map))
  } catch (e) {
    // ignore localStorage errors
    console.error('saveTxnReason error', e)
  }
}

const CashOut: React.FC = () => {
  const { sessionToken, agent, updateAgent } = useAuth()
  const [step, setStep] = React.useState<
    'method' | 'transaction' | 'kyc' | 'processing' | 'complete'
  >('method')
  const [selectedWallet, setSelectedWallet] =
    React.useState<WalletProvider | null>(null)
  const [selectedMethod, setSelectedMethod] = React.useState<
    'normal' | 'voucher' | null
  >(null)
  const [customerData, setCustomerData] = React.useState<CustomerData | null>(
    null
  )
  const [customerInfo, setCustomerInfo] =
    React.useState<CustomerInfoBody | null>(null)
  const [agentBalance, setAgentBalance] = React.useState<number>(0)
  const [formData, setFormData] = React.useState<FormData>({
    msidn: '',
    pin: '',
    voucherNumber: '',
    withdrawAmount: '',
  })
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [lastTransactionId, setLastTransactionId] = React.useState<
    string | null
  >(null)
  // saved reason for last transaction (populated from localStorage txnReasons map)
  const [txnReason, setTxnReason] = React.useState<string | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  // load saved reason for lastTransactionId from localStorage
  React.useEffect(() => {
    if (!lastTransactionId) {
      setTxnReason(null)
      return
    }
    try {
      const raw = localStorage.getItem('txnReasons') ?? '{}'
      const map = JSON.parse(raw) as Record<string, string>
      setTxnReason(map[lastTransactionId] ?? null)
    } catch (e) {
      setTxnReason(null)
    }
  }, [lastTransactionId])

  // On mount, check URL for pre-selected wallet and set agent balance from logged-in agent
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const walletName = params.get('wallet')
    const wallet = walletProviders.find((w) => w.name === walletName)
    if (wallet) {
      setSelectedWallet(wallet)
      // Use available_balance for agent balance when available
      const realAvailable =
        typeof agent?.available_balance === 'number'
          ? agent.available_balance
          : typeof agent?.current_balance === 'number'
          ? agent.current_balance
          : Math.floor(Math.random() * 10000) + 2000
      setAgentBalance(realAvailable)

      // Skip method selection if wallet only supports one method
      if (wallet.supportedMethods?.length === 1) {
        setSelectedMethod(wallet.supportedMethods[0])
        setStep('transaction')
      }
    } else {
      navigate('/selection')
    }
  }, [navigate, agent])

  // Keep local balance in sync with profile (use available_balance)
  React.useEffect(() => {
    if (typeof agent?.available_balance === 'number') {
      setAgentBalance(agent.available_balance)
    } else if (typeof agent?.current_balance === 'number') {
      // fallback to current if available not provided
      setAgentBalance(agent.current_balance)
    }
  }, [agent?.available_balance, agent?.current_balance])

  const handleMethodSelection = (method: 'normal' | 'voucher') => {
    setSelectedMethod(method)
    setStep('transaction')
  }

  const formatPhoneForApi = (input: string) => {
    const digits = (input || '').replace(/\D/g, '')
    if (!digits) return ''
    if (digits.startsWith('268')) return digits
    if (digits.startsWith('0')) return `268${digits.slice(1)}`
    return `268${digits}`
  }

  const handleKYCLookup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.msidn || !formData.withdrawAmount) {
      toast({
        title: 'Missing Information',
        description: 'Please enter phone number and amount',
        variant: 'destructive',
      })
      return
    }

    const amount = parseFloat(formData.withdrawAmount)
    if (amount <= 0 || amount > agentBalance) {
      toast({
        title: 'Invalid Amount',
        description:
          amount > agentBalance
            ? 'Insufficient agent balance'
            : 'Please enter a valid amount',
        variant: 'destructive',
      })
      return
    }

    const apiPhone = formatPhoneForApi(formData.msidn)
    if (!apiPhone) {
      toast({
        title: 'Invalid Phone',
        description: 'Unable to format phone number',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    setCustomerInfo(null)

    try {
      const res = await axios.post(
        `${AUTH_URL}/v1/cico/agents/customer-info`,
        { phone_number: apiPhone },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken ?? ''}`,
          },
        }
      )

      const data = res.data
      if (data?.success && data?.data?.body) {
        const body = data.data.body as CustomerInfoBody
        setCustomerInfo(body)
        setCustomerData({
          name:
            `${body.given_name ?? ''} ${body.family_name ?? ''}`.trim() ||
            'Unknown',
          phone: apiPhone,
          balance: 0,
          kycStatus: 'Verified',
        })
        setIsLoading(false)
        setStep('kyc')
      } else {
        throw new Error(
          data?.error || data?.message || 'Customer lookup failed'
        )
      }
    } catch (error: any) {
      console.error('Customer lookup failed:', error)
      const serverData = error?.response?.data
      let description = error?.message || 'Unable to retrieve customer info'

      if (serverData) {
        if (typeof serverData.error === 'string') {
          description = serverData.error
        } else if (typeof serverData.message === 'string') {
          description = serverData.message
        } else if (serverData.details) {
          description = serverData.details
        }
      }

      toast({
        title: 'Lookup Failed',
        description,
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  const handleKYCConfirm = async () => {
    // After confirming and sending PIN request we call the cash-out endpoint
    if (!customerData || !formData.withdrawAmount) {
      toast({
        title: 'Missing Data',
        description: 'Customer or amount missing',
        variant: 'destructive',
      })
      return
    }

    setStep('processing')
    setIsLoading(true)
    toast({
      title: 'PIN Request Sent',
      description: 'Customer will receive PIN prompt on their device',
    })

    try {
      // Call backend cash-out endpoint
      const payload = {
        amount: parseFloat(formData.withdrawAmount).toFixed(2),
        party_id: customerData.phone,
        description: 'Cash withdrawal for customer',
      }

      const res = await axios.post(
        `${AUTH_URL}/v1/cico/agents/cash-out/with-status?timeout=120`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken ?? ''}`,
          },
        }
      )

      const resp = res.data

      // NEW: when server returns success:false but includes data, capture reason if present
      if (!resp?.success && resp?.data) {
        const txId = resp.data.transaction_id ?? resp.data.transactionId ?? null
        const reason =
          resp.data?.momo_response?.body?.reason ??
          resp.data?.reason ??
          resp.message ??
          null
        if (txId && reason) {
          console.log('Transaction failed:', { txId, reason }) // 👈 log it

          saveTxnReason(txId, String(reason))
          // keep local state in sync so UI/toasts show reason immediately
          setTxnReason(String(reason))

          // SHOW reason immediately via toast for agent visibility (include txId)
          toast({
            title: 'Transaction Failed',
            description: String(reason),
            variant: 'destructive',
          })

          // Persist shown txn id and stop further processing to avoid generic thrown error
          setLastTransactionId(txId)
          setIsLoading(false)
          setStep('transaction')
          return
        }
      }

      if (resp?.success && resp?.data) {
        const txId = resp.data.transaction_id

        // Prefer server provided available_balance, then balance_after, then fallback compute
        const serverAvailable =
          typeof resp.data.available_balance === 'number'
            ? resp.data.available_balance
            : typeof resp.data.balance_after === 'number'
            ? resp.data.balance_after
            : undefined

        const amount = parseFloat(formData.withdrawAmount)
        const newAvailable =
          typeof serverAvailable === 'number'
            ? serverAvailable
            : Math.max(0, (agent?.available_balance ?? agentBalance) - amount)

        setLastTransactionId(txId ?? null)
        setAgentBalance(newAvailable)

        // if server still returned a reason even on "success", persist & surface it
        const maybeReason =
          resp.data?.reason ?? resp.data?.momo_response?.body?.reason ?? null
        if (txId && maybeReason) {
          saveTxnReason(txId, String(maybeReason))
          setTxnReason(String(maybeReason))
        }

        if (agent && updateAgent) {
          const updatedAgent = {
            ...agent,
            // update both balances if possible; prefer server values when provided
            current_balance:
              typeof resp.data.current_balance === 'number'
                ? resp.data.current_balance
                : typeof resp.data.balance_after === 'number'
                ? resp.data.balance_after
                : (agent.current_balance ?? agentBalance) - amount,
            available_balance: newAvailable,
          }
          updateAgent(updatedAgent)
        }
        setStep('complete')
        toast({
          title: 'Transaction Successful',
          description: `Cash-out of E ${formData.withdrawAmount} completed${
            maybeReason ? ` — Reason: ${maybeReason}` : ''
          }`,
        })
      } else {
        // throw to enter catch block and show toast as before
        throw new Error(resp?.message || 'Cash-out failed')
      }
    } catch (error: any) {
      console.error('Cash-out failed:', error)

      const serverData = error?.response?.data
      let description =
        error?.message || 'Unable to process cash-out transaction'

      // Prefer explicit error fields returned by server
      if (serverData) {
        if (typeof serverData.error === 'string') {
          description = serverData.error
        } else if (typeof serverData.message === 'string') {
          description = serverData.message
        } else if (serverData.response?.Trailer?.DetailedDesc) {
          description = serverData.response.Trailer.DetailedDesc
        }

        // Append useful context if available
        const parts: string[] = []
        if (serverData.code) parts.push(`Code: ${serverData.code}`)
        if (typeof serverData.current_balance !== 'undefined')
          parts.push(`Current: E ${serverData.current_balance}`)
        if (typeof serverData.required_amount !== 'undefined')
          parts.push(`Required: E ${serverData.required_amount}`)
        if (parts.length) description += ` (${parts.join(', ')})`
      }

      // Attempt to persist reason if available on error.response.data (fallback)
      const txId =
        serverData?.data?.transaction_id ?? serverData?.transaction_id ?? null
      const reason =
        serverData?.data?.momo_response?.body?.reason ??
        serverData?.data?.reason ??
        serverData?.message ??
        null
      if (txId && reason) {
        saveTxnReason(txId, String(reason))
        // update view state as well
        setTxnReason(String(reason))
        toast({
          title: 'Transaction Failed',
          description: String(reason),
          variant: 'destructive',
        })
      }

      toast({
        title: 'Transaction Failed',
        description,
        variant: 'destructive',
      })
      setStep('transaction')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDirectTransaction = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedWallet) return

    // Only handle Unayo transactions
    if (selectedWallet.name !== 'Unayo') {
      toast({
        title: 'Unsupported Wallet',
        description: 'This implementation only supports Unayo',
        variant: 'destructive',
      })
      return
    }

    // Validation - Unayo requires voucher number and amount for cashout
    if (selectedMethod === 'voucher') {
      if (!formData.voucherNumber || !formData.withdrawAmount) {
        toast({
          title: 'Missing Information',
          description: 'Please enter voucher number and amount',
          variant: 'destructive',
        })
        return
      }
    } else {
      if (!formData.msidn || !formData.withdrawAmount) {
        toast({
          title: 'Missing Information',
          description: 'Please enter required fields',
          variant: 'destructive',
        })
        return
      }

      if (selectedWallet.requiresPin && !formData.pin) {
        toast({
          title: 'Missing Information',
          description: 'PIN is required',
          variant: 'destructive',
        })
        return
      }
    }

    const amount = parseFloat(formData.withdrawAmount)
    if (amount <= 0 || amount > agentBalance) {
      toast({
        title: 'Invalid Amount',
        description:
          amount > agentBalance
            ? 'Insufficient agent balance'
            : 'Please enter a valid amount',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    setStep('processing')

    try {
      const response = await axios.post<UnayoCashOutResponse>(
        'https://payment.centurionbd.com/api/v1/unayo/redeem/cashout',
        {
          meta: {
            voucher_code: formData.voucherNumber,
            amount: formData.withdrawAmount,
          },
        },
        {
          headers: {
            'x-api-key':
              'c99fa7686268044376e345fe10b74b77592c5bf1dbe2476d1457ce64f1aff0a2',
            'Content-Type': 'application/json',
          },
        }
      )

      console.log('Cash out response data', response.data)

      if (
        response.status === 200 &&
        response.data.response.Trailer.StatusCode === 0
      ) {
        const newBalance = agentBalance - amount
        setStep('complete')
        setAgentBalance(newBalance)
        setLastTransactionId(
          response.data.response.Body.UniqueTransactionId ?? null
        )
        if (agent && updateAgent) {
          // Update both current and available balances for consistency (available used for validation)
          updateAgent({
            ...agent,
            current_balance:
              typeof response.data.response.Body?.AmountUnredeemed === 'number'
                ? // if API returns an updated current balance in a different field, prefer server values
                  agent.current_balance
                : newBalance,
            available_balance: newBalance,
          })
        }
        toast({
          title: 'Transaction Successful',
          description: `Cash-out of E ${formData.withdrawAmount} completed`,
        })
      } else {
        const txId = response.data.response.Body.UniqueTransactionId ?? null
        const reason =
          response.data.response.Trailer.DetailedDesc ?? 'Transaction failed'
        if (txId && reason) {
          saveTxnReason(txId, String(reason))
          // update view state so UI immediately reflects saved reason
          setTxnReason(String(reason))
          // SHOW reason immediately via toast for agent visibility
          toast({
            title: 'Transaction Failed',
            description: String(reason),
            variant: 'destructive',
          })
        }
        throw new Error(
          response.data.response.Trailer.DetailedDesc || 'Transaction failed'
        )
      }
    } catch (error: any) {
      console.error('Unayo Cash-out failed:', error)

      const serverData = error?.response?.data
      let description =
        error?.message || 'Unable to process cash-out transaction'

      if (serverData) {
        // Unayo sometimes returns nested response.Trailer.DetailedDesc
        if (serverData.response?.Trailer?.DetailedDesc) {
          description = serverData.response.Trailer.DetailedDesc
        } else if (typeof serverData.error === 'string') {
          description = serverData.error
        } else if (typeof serverData.message === 'string') {
          description = serverData.message
        }

        const parts: string[] = []
        // Unayo may embed code or body fields differently
        if (serverData.code) parts.push(`Code: ${serverData.code}`)
        if (serverData.response?.Body?.AmountRedeemed !== undefined)
          parts.push(`Redeemed: E ${serverData.response.Body.AmountRedeemed}`)
        if (typeof serverData.current_balance !== 'undefined')
          parts.push(`Current: E ${serverData.current_balance}`)
        if (parts.length) description += ` (${parts.join(', ')})`
      }

      const txId = serverData?.response?.Body?.UniqueTransactionId ?? null
      const reason =
        serverData?.response?.Trailer?.DetailedDesc ?? 'Transaction failed'
      if (txId && reason) {
        saveTxnReason(txId, String(reason))
        // update view state so UI immediately reflects saved reason
        setTxnReason(String(reason))
        toast({
          title: 'Transaction Failed',
          description: String(reason),
          variant: 'destructive',
        })
      }

      toast({
        title: 'Transaction Failed',
        description,
        variant: 'destructive',
      })
      setStep('transaction')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: string | number | undefined): string => {
    // treat undefined/null as zero to avoid TS errors when optional fields are passed
    if (amount === undefined || amount === null) return 'E 0.00'
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return isNaN(num) ? 'E 0.00' : `E ${num.toFixed(2)}`
  }

  // Method Selection Step
  if (
    step === 'method' &&
    selectedWallet?.supportedMethods &&
    selectedWallet.supportedMethods.length > 1
  ) {
    return (
      <Layout
        title={`${selectedWallet?.name} - Select Method`}
        showBack
        serviceType='cico'
      >
        <div className='max-w-lg mx-auto px-4'>
          <Card className='shadow-lg border-surface bg-surface text-brand'>
            <CardHeader className='pb-4'>
              <CardTitle className='text-lg'>
                Select Transaction Method
              </CardTitle>
              <CardDescription className='text-sm'>
                Choose how you want to process this transaction
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Button
                onClick={() => handleMethodSelection('normal')}
                className='w-full h-12 text-left justify-start'
              >
                <div>
                  <div className='font-medium'>Normal Transaction</div>
                  <div className='text-xs opacity-90'>Phone number + PIN</div>
                </div>
              </Button>
              <Button
                onClick={() => handleMethodSelection('voucher')}
                variant='outline'
                className='w-full h-12 border-gray-300 text-left justify-start'
              >
                <div>
                  <div className='font-medium'>Voucher Transaction</div>
                  <div className='text-xs text-gray-600'>Voucher code only</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  // KYC Confirmation Step (for MOMO)
  if (step === 'kyc' && customerData) {
    return (
      <Layout title='Confirm Customer Details' showBack serviceType='cico'>
        <div className='max-w-lg mx-auto px-4'>
          <Card className='shadow-lg border-surface bg-surface text-brand'>
            <CardHeader className='pb-4'>
              <CardTitle className='text-lg'>Customer Verification</CardTitle>
              <CardDescription className='text-sm'>
                Confirm customer details before processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='rounded-lg p-4'>
                  <div className='grid grid-cols-2 gap-3 text-sm'>
                    {/* Show API-returned body fields when available */}
                    <div>
                      <p className='text-gray-400'>Given Name</p>
                      <p className='font-semibold'>
                        {customerInfo?.given_name ?? customerData.name}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-400'>Family Name</p>
                      <p className='font-medium'>
                        {customerInfo?.family_name ?? ''}
                      </p>
                    </div>

                    <div>
                      <p className='text-gray-400'>Phone Number</p>
                      <p className='font-medium'>{customerData.phone}</p>
                    </div>

                    <div>
                      <p className='text-sm text-gray-400 mb-1'>
                        Transaction Amount
                      </p>
                      <p className='font-medium text-blue-600'>
                        {formatCurrency(formData.withdrawAmount)}
                      </p>
                    </div>

                    {/* Show logged-in agent details */}
                    {agent && (
                      <div className='col-span-2'>
                        <p className='text-gray-400'>Agent</p>
                        <p className='font-semibold'>
                          {agent.full_name ?? agent.username}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleKYCConfirm}
                  className='w-full h-12 button'
                  variant={'outline'}
                >
                  Confirm & Send PIN Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  // Processing Step
  if (step === 'processing') {
    return (
      <Layout title='Processing Transaction' serviceType='cico'>
        <div className='max-w-lg mx-auto px-4'>
          <Card className='shadow-lg border-surface bg-surface text-brand'>
            <CardContent className='pt-8 pb-8 text-center'>
              <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
              <h2 className='text-lg font-bold text-gray-400 mb-2'>
                {selectedWallet?.requiresKYC
                  ? 'Waiting for Customer PIN'
                  : 'Processing Transaction'}
              </h2>
              <p className='text-sm text-gray-500'>
                {selectedWallet?.requiresKYC
                  ? 'Customer will enter PIN on their device...'
                  : 'Please wait while we process the transaction...'}
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  // Complete Step
  if (step === 'complete') {
    return (
      <Layout title='Transaction Complete' serviceType='cico'>
        <div className='max-w-lg mx-auto px-4'>
          <Card className='shadow-lg border-surface bg-surface text-brand'>
            <CardContent className='pt-8 pb-6'>
              <div className='text-center mb-6'>
                <div className='w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <span className='text-white text-2xl'>✓</span>
                </div>
                <h2 className='text-xl font-bold mb-2'>
                  Transaction Successful!
                </h2>
                <p className='text-sm text-gray-400'>
                  Cash-out of {formatCurrency(formData.withdrawAmount)}{' '}
                  completed
                </p>
              </div>

              <div className='rounded-lg p-4 mb-6'>
                <div className='grid grid-cols-2 gap-3 text-sm'>
                  <div>
                    <p className='text-gray-400'>Transaction ID</p>
                    <p className='font-mono font-semibold text-xs'>
                      {lastTransactionId ??
                        `TXN${Date.now().toString().slice(-8)}`}
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-400'>Your Balance</p>
                    <p className='font-semibold'>
                      {formatCurrency(agentBalance)}
                    </p>
                  </div>
                  {/* Show persisted reason if available (e.g. "NOT_ENOUGH_FUNDS") */}
                  {txnReason && (
                    <div className='col-span-2'>
                      <p className='text-gray-400'>Reason</p>
                      <p className='font-semibold text-red-600'>{txnReason}</p>
                    </div>
                  )}
                  {customerData && (
                    <div className='col-span-2'>
                      <p className='text-gray-400'>Customer</p>
                      <p className='font-semibold'>{customerData.name}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className='space-y-2'>
                <Button
                  onClick={() => navigate('/selection')}
                  className='w-full button'
                  variant={'outline'}
                >
                  New Transaction
                </Button>
                <Button
                  variant='outline'
                  onClick={() => navigate('/')}
                  className='w-full border-gray-300'
                >
                  <ArrowLeft className='w-4 h-4 mr-2' />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  // Main Transaction Form
  return (
    <Layout
      title={`${selectedWallet?.name} - ${
        selectedMethod === 'voucher' ? 'Voucher' : 'Cash-Out'
      }`}
      showBack
    >
      <div className='max-w-lg mx-auto px-4 h-full overflow-y-auto'>
        <Card className='shadow-lg border-surface bg-surface text-brand border-outline'>
          <CardHeader className='pb-4'>
            <CardTitle className='text-lg'>
              {selectedMethod === 'voucher'
                ? 'Voucher Cash-Out'
                : 'Cash-Out Transaction'}
            </CardTitle>
            <CardDescription className='text-sm'>
              {selectedMethod === 'voucher'
                ? 'Enter voucher details'
                : 'Enter customer details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={
                selectedWallet?.requiresKYC
                  ? handleKYCLookup
                  : handleDirectTransaction
              }
              className='space-y-4'
            >
              {/* Agent Balance */}
              <div className='bg-blue-50 rounded-lg p-3'>
                <p className='text-xs text-gray-600 mb-1'>Available Balance</p>
                <p className='text-lg font-bold text-blue-600'>
                  {formatCurrency(agentBalance)}
                </p>
                <div className='text-xs text-gray-500 mt-1'>
                  Current {formatCurrency(agent?.current_balance)} • Holds{' '}
                  {formatCurrency(agent?.holds_balance)}
                </div>
              </div>

              {/* Form Fields */}
              {selectedMethod !== 'voucher' && (
                <div className='space-y-2'>
                  <Label htmlFor='msidn' className='text-sm'>
                    Customer Phone
                  </Label>
                  <Input
                    id='msidn'
                    type='tel'
                    placeholder='76123456'
                    value={formData.msidn}
                    onChange={(e) =>
                      setFormData({ ...formData, msidn: e.target.value })
                    }
                    className='border-gray-300 h-10'
                    required
                  />
                </div>
              )}

              {selectedWallet?.requiresPin && selectedMethod !== 'voucher' && (
                <div className='space-y-2'>
                  <Label htmlFor='pin' className='text-sm'>
                    Customer PIN
                  </Label>
                  <Input
                    id='pin'
                    type='password'
                    placeholder='••••'
                    maxLength={4}
                    value={formData.pin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pin: e.target.value.replace(/\D/g, ''),
                      })
                    }
                    className='border-gray-300 h-10'
                    required
                  />
                </div>
              )}

              {selectedMethod === 'voucher' && (
                <div className='space-y-2'>
                  <Label htmlFor='voucherNumber' className='text-sm'>
                    Voucher Number
                  </Label>
                  <Input
                    id='voucherNumber'
                    type='text'
                    placeholder='Enter voucher number'
                    value={formData.voucherNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        voucherNumber: e.target.value,
                      })
                    }
                    className='border-gray-300 h-10'
                    required
                  />
                </div>
              )}

              <div className='space-y-2'>
                <Label htmlFor='withdrawAmount' className='text-sm'>
                  Amount (SZL)
                </Label>
                <Input
                  id='withdrawAmount'
                  type='number'
                  placeholder='0.00'
                  step='0.01'
                  min='1'
                  max={agentBalance}
                  value={formData.withdrawAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      withdrawAmount: e.target.value,
                    })
                  }
                  className='border-gray-300 h-10'
                  required
                />
              </div>

              {/* Quick Amounts */}
              <div className='grid grid-cols-4 gap-2'>
                {selectedWallet?.quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setFormData({
                        ...formData,
                        withdrawAmount: amount.toString(),
                      })
                    }
                    className='border-gray-300 h-8 text-xs'
                    disabled={amount > agentBalance}
                  >
                    E{amount}
                  </Button>
                ))}
              </div>

              <Button
                type='submit'
                className='w-full button h-10'
                disabled={isLoading}
                variant={'outline'}
              >
                {isLoading
                  ? 'Loading...'
                  : selectedWallet?.requiresKYC
                  ? 'Verify Customer'
                  : 'Process Transaction'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default CashOut

import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import UndoIcon from '@mui/icons-material/Undo'
import axios from 'axios'
import { useAuth } from '../../context/appstate/UserAuthContext'
import { API_URL } from '../../api/Config'
import { walletProviders } from '../../lib/wallets'
import Header from '../../components/Header'
import { imagesrc } from '../../constants'

const Cashout = () => {
  const { sessionToken, agent, updateAgent } = useAuth()
  const [step, setStep] = useState('method')
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [agentBalance, setAgentBalance] = useState(0)
  const [formData, setFormData] = useState({
    msidn: '',
    amount: '',
    voucherNumber: '',
    pin: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [lastTransactionId, setLastTransactionId] = useState(null)

  const [customerData, setCustomerData] = useState(null)
  const [customerInfo, setCustomerInfo] = useState(null)
  const [snackOpen, setSnackOpen] = useState(false)
  const [snackMsg, setSnackMsg] = useState('')
  const [snackSeverity, setSnackSeverity] = useState('error')
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const [walletName, setWalletName] = useState(
    () => params.wallet || location.state?.wallet || null
  )

  const handleSnackClose = () => setSnackOpen(false)

  // On mount - resolve wallet from multiple sources
  useEffect(() => {
    const paramWallet = params.wallet || null
    const stateWallet = location.state?.wallet || null
    const queryWallet = new URLSearchParams(location.search).get('wallet')

    const resolved = paramWallet || stateWallet || queryWallet || null
    if (resolved && resolved !== walletName) setWalletName(resolved)

    // Only redirect when no wallet is available from any source
    if (!resolved) {
      navigate('/cico')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.wallet, location.state, location.search])

  useEffect(() => {
    const wallet = walletProviders.find((w) => w.name === walletName)
    if (wallet) {
      setSelectedWallet(wallet)
      const balance = agent?.current_balance ?? Math.floor(Math.random() * 5000)
      setAgentBalance(balance)
      if (wallet.supportedMethods?.length === 1) {
        setSelectedMethod(wallet.supportedMethods[0])
        setStep('transaction')
      }
    }
  }, [walletName, agent])

  // fetch fresh agent profile to get latest balances
  const fetchProfile = useCallback(async () => {
    if (!sessionToken) return
    // If agent already has a numeric current_balance (provided by Profile),
    // avoid calling the /v1/cico/agents/me endpoint again.
    if (typeof agent?.current_balance === 'number') {
      return
    }
    setLoadingProfile(true)
    try {
      const resp = await axios.get(`${API_URL}/v1/cico/agents/me`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      })
      const data = resp.data?.data
      if (data) {
        // prefer server value; fall back to agent.current_balance if server doesn't provide it
        const newBal =
          typeof data.current_balance === 'number'
            ? data.current_balance
            : agent?.current_balance ?? 0
        setAgentBalance(newBal)
        if (agent && updateAgent) updateAgent({ ...agent, ...data })
      }
    } catch (err) {
      // ignore, keep current
    } finally {
      setLoadingProfile(false)
    }
  }, [sessionToken, agent, updateAgent])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Keep local balance synced
  useEffect(() => {
    if (typeof agent?.current_balance === 'number') {
      setAgentBalance(agent.current_balance)
    }
  }, [agent?.current_balance])

  const formatCurrency = (amount) => {
    const num = parseFloat(amount)
    return isNaN(num) ? 'E 0.00' : `E ${num.toFixed(2)}`
  }

  const formatPhoneForApi = (msidn) => {
    if (!msidn) return msidn
    let digits = String(msidn).replace(/\D/g, '')
    digits = digits.replace(/^0+/, '')
    if (digits.startsWith('268')) return digits
    return `268${digits}`
  }

  // ADD: helper to extract detailed error info (incl. momo reason)
  const buildServerErrorMessage = (payload) => {
    // payload can be response (axios resp), err.response?.data, or plain object
    const p = payload ?? {}
    // try various likely shapes
    const top = p.data ?? p // if p is axios response, p.data; if it's already body, use itself
    const serverError = top?.error ?? top?.message ?? 'Transaction failed'
    const code = top?.code ?? p?.code
    // look for nested momo reason
    const momoReason =
      top?.data?.momo_response?.body?.reason ??
      top?.momo_response?.body?.reason ??
      top?.data?.momo_response?.body?.status ??
      top?.momo_response?.body?.status
    let msg = serverError
    if (momoReason) msg = `${msg} (${momoReason})`
    if (code) msg = `${msg} (${code})`
    return msg
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedWallet) return
    if (!formData.amount) {
      setSnackMsg('Enter amount')
      setSnackSeverity('warning')
      setSnackOpen(true)
      return
    }
    if (!formData.msidn) {
      setSnackMsg('Enter customer phone')
      setSnackSeverity('warning')
      setSnackOpen(true)
      return
    }

    setIsLoading(true)
    try {
      const formattedPhone = formatPhoneForApi(formData.msidn)

      const resp = await axios.post(
        `${API_URL}/v1/cico/agents/customer-info`,
        { phone_number: formattedPhone },
        { headers: { Authorization: `Bearer ${sessionToken ?? ''}` } }
      )

      if (resp?.data?.success && resp.data.data) {
        const body = resp.data.data.body ?? {}
        const given = body.given_name ?? ''
        const family = body.family_name ?? ''
        const displayName =
          given || family ? `${given} ${family}`.trim() : formattedPhone

        setCustomerData({
          phone: formattedPhone,
          rawPhone: formData.msidn,
          name: displayName,
        })
        setCustomerInfo(body)
        setStep('verify')
      } else {
        const serverError =
          resp?.data?.error ??
          resp?.data?.message ??
          'Customer not found or unavailable'
        const serverCode = resp?.data?.code
        setSnackMsg(serverCode ? `${serverError} (${serverCode})` : serverError)
        setSnackSeverity('error')
        setSnackOpen(true)
      }
    } catch (err) {
      console.warn('Customer info lookup failed:', err)
      const serverErrBody = err.response?.data
      // use helper to build improved message
      const serverMsg = buildServerErrorMessage(
        err.response ?? serverErrBody ?? err
      )
      setSnackMsg(serverMsg)
      setSnackSeverity('error')
      setSnackOpen(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKYCConfirm = async () => {
    if (!selectedWallet) return

    if (!formData.amount) {
      setSnackMsg('Enter amount')
      setSnackSeverity('warning')
      setSnackOpen(true)
      return
    }

    // switch UI to processing / pending approval
    setStep('processing')
    setIsLoading(true)

    try {
      const phoneRaw =
        customerData?.rawPhone ?? formData.msidn ?? customerData?.phone

      const partyId = formatPhoneForApi(phoneRaw)

      const amountStr = Number(formData.amount).toFixed(2)

      const response = await axios.post(
        `${API_URL}/v1/cico/agents/cash-out/with-status?timeout=120`,
        {
          amount: amountStr,
          party_id: partyId,
          description: 'Cash withdrawal for customer',
        },
        { headers: { Authorization: `Bearer ${sessionToken ?? ''}` } }
      )

      if (response.data?.success) {
        const newBalance = agentBalance - Number(formData.amount)

        if (agent && updateAgent) {
          updateAgent({ ...agent, current_balance: newBalance })
        }

        setAgentBalance(newBalance)
        setLastTransactionId(response.data.data?.transaction_id ?? null)
        setStep('complete')
      } else {
        // build improved server message including momo reason when available
        const finalMsg = buildServerErrorMessage(response)
        setSnackMsg(finalMsg)
        setSnackSeverity('error')
        setSnackOpen(true)
        // revert to verify so agent can retry
        setStep('verify')
      }
    } catch (err) {
      console.error('Transaction failed:', err)
      const serverErrBody = err.response?.data ?? err
      const finalMsg = buildServerErrorMessage(
        err.response ?? serverErrBody ?? err
      )
      setSnackMsg(finalMsg)
      setSnackSeverity('error')
      setSnackOpen(true)
      // revert to verify so agent can retry
      setStep('verify')
    } finally {
      setIsLoading(false)
    }
  }

  // show a processing / awaiting-approval screen while waiting for /with-status
  if (isLoading && step === 'processing') {
    return (
      <>
        <Header />
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='70vh'
          p={2}
        >
          <Card sx={{ textAlign: 'center', p: 3, maxWidth: 520 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant='h6' fontWeight='bold' gutterBottom>
              Awaiting for approval
            </Typography>
            <Typography variant='body2' color='textSecondary'>
              Please approved the transaction on your device...
            </Typography>
            {/* optional small back/cancel action */}
            <Box mt={3}>
              <Button
                variant='outlined'
                onClick={() => {
                  // allow user to return to verify screen while keeping request in background
                  setStep('verify')
                  setIsLoading(false)
                }}
              >
                Back
              </Button>
            </Box>
          </Card>
        </Box>
      </>
    )
  }

  if (step === 'complete') {
    return (
      <>
        <Header />
        <Box
          maxWidth={500}
          mx='auto'
          p={2}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Box
              component='img'
              src={imagesrc.success}
              alt='success'
              sx={{ width: 96, mx: 'auto', mb: 2 }}
            />
            <Typography variant='h5' fontWeight='bold' gutterBottom>
              Transaction Successful!
            </Typography>
            <Typography variant='body2' color='textSecondary' mb={2}>
              Cash-in of {formatCurrency(formData.amount)} completed
              successfully.
            </Typography>
            <Typography variant='body2' sx={{ mt: 2 }}>
              Transaction ID: <strong>{lastTransactionId ?? 'N/A'}</strong>
            </Typography>
            <Typography variant='body2' sx={{ mt: 1 }}>
              Balance: <strong>{formatCurrency(agentBalance)}</strong>
            </Typography>

            <Box mt={4}>
              <Button
                variant='contained'
                fullWidth
                onClick={() => navigate('/distributor/cico')}
              >
                New Transaction
              </Button>
              <Button
                startIcon={<ArrowBack />}
                variant='outlined'
                fullWidth
                sx={{ mt: 1 }}
                onClick={() => navigate('/services')}
              >
                Back to Dashboard
              </Button>
            </Box>
          </Card>
        </Box>

        <Snackbar
          open={snackOpen}
          autoHideDuration={5000}
          onClose={handleSnackClose}
        >
          <Alert
            onClose={handleSnackClose}
            severity={snackSeverity}
            sx={{ width: '100%' }}
          >
            {snackMsg}
          </Alert>
        </Snackbar>
      </>
    )
  }

  return (
    <>
      <Header />
      <Box
        maxWidth={500}
        mx='auto'
        p={2}
        sx={{
          pt: { xs: 9, sm: 10 },
          borderRadius: 2,
          border: 'none',
          overflow: 'hidden',
        }}
      >
        <Card
          sx={{
            pt: { xs: 9, sm: 10 },
            borderRadius: 2,
            border: 'none',
            overflow: 'hidden',
          }}
        >
          {step !== 'verify' && (
            <CardHeader
              title={
                <Typography variant='h6' fontWeight='bold'>
                  CashIn Transaction
                </Typography>
              }
            />
          )}
          <CardContent>
            {step !== 'verify' && (
              <Box mb={2}>
                <Box
                  sx={{
                    bgcolor: '#e1e1e1',
                    borderRadius: 1.5,
                    p: 2,
                  }}
                >
                  <Typography
                    variant='caption'
                    sx={{ mb: 0.5, display: 'block', color: 'rgba(0,0,0,0.7)' }}
                  >
                    Available Balance
                  </Typography>

                  <Typography
                    variant='h6'
                    fontWeight={700}
                    sx={{ color: 'rgba(0,0,0,0.85)' }}
                  >
                    {formatCurrency(agentBalance)}
                  </Typography>

                  <Typography
                    variant='caption'
                    sx={{ mt: 1, display: 'block', color: 'rgba(0,0,0,0.7)' }}
                  >
                    Current {formatCurrency(agent?.current_balance)} • Holds{' '}
                    {formatCurrency(agent?.holds_balance)}
                  </Typography>
                </Box>
              </Box>
            )}

            {step === 'verify' ? (
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant='h5' fontWeight='bold'>
                    Customer verification
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'success.main',
                    }}
                  ></Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ borderRadius: 1, p: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 3,
                      }}
                    >
                      <Box>
                        <Typography variant='caption' sx={{ color: '#B0BEC5' }}>
                          Given Name
                        </Typography>
                        <Typography variant='h2' fontWeight={600}>
                          {customerInfo?.given_name ?? customerData?.name ?? ''}
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant='caption' sx={{ color: '#B0BEC5' }}>
                          Family Name
                        </Typography>
                        <Typography variant='h2' fontWeight={500}>
                          {customerInfo?.family_name ?? ''}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 3,
                      }}
                    >
                      <Box>
                        <Typography variant='caption' sx={{ color: '#B0BEC5' }}>
                          Phone Number
                        </Typography>
                        <Typography variant='h2' fontWeight={500}>
                          {customerData?.phone}
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant='caption' sx={{ color: '#B0BEC5' }}>
                          Amount
                        </Typography>
                        <Typography
                          variant='h2'
                          fontWeight={600}
                          sx={{ color: 'primary.main' }}
                        >
                          {formatCurrency(formData.amount)}
                        </Typography>
                      </Box>
                    </Box>

                    {agent && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant='caption' sx={{ color: '#B0BEC5' }}>
                          Agent
                        </Typography>
                        <Typography variant='h2' fontWeight={600}>
                          {agent.full_name ?? agent.username}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                <Button
                  variant='outlined'
                  fullWidth
                  onClick={handleKYCConfirm}
                  disabled={isLoading}
                  sx={{ height: 48 }}
                >
                  {isLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    'Confirm & Send PIN Request'
                  )}
                </Button>
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                {selectedMethod !== 'voucher' && (
                  <Box mb={2}>
                    <TextField
                      label='Customer Phone'
                      variant='outlined'
                      fullWidth
                      value={formData.msidn}
                      onChange={(e) =>
                        setFormData({ ...formData, msidn: e.target.value })
                      }
                    />
                  </Box>
                )}

                {selectedMethod === 'voucher' && (
                  <Box mb={2}>
                    <TextField
                      label='Voucher Number'
                      variant='outlined'
                      fullWidth
                      value={formData.voucherNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          voucherNumber: e.target.value,
                        })
                      }
                    />
                  </Box>
                )}

                <Box mb={2}>
                  <TextField
                    label='Amount (SZL)'
                    type='number'
                    variant='outlined'
                    fullWidth
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </Box>

                <Grid container spacing={1} mb={2}>
                  {selectedWallet?.quickAmounts?.map((amt) => (
                    <Grid item xs={3} key={amt}>
                      <Button
                        variant='outlined'
                        fullWidth
                        onClick={() =>
                          setFormData({ ...formData, amount: amt.toString() })
                        }
                        sx={{
                          border: '1px solid #B0BEC5',
                          color: '#B0BEC5',
                          backgroundColor: 'transparent',
                          '&:hover': {
                            border: '1px solid #B0BEC5',
                            backgroundColor: 'rgba(176,190,197,0.04)',
                          },
                        }}
                      >
                        E{amt}
                      </Button>
                    </Grid>
                  ))}
                </Grid>

                <Button
                  variant='contained'
                  color='primary'
                  size='large'
                  fullWidth
                  type='submit'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={22} color='inherit' />
                  ) : (
                    'Verify Customer'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </Box>
      <Box
        component='div'
        sx={{
          position: 'fixed',
          top: { xs: '56px', sm: '64px' },
          left: 16,
          pointerEvents: 'auto',
        }}
      >
        <Button
          variant='outlined'
          startIcon={<UndoIcon />}
          onClick={() =>
            window.history.length > 1 ? navigate(-1) : navigate('/services')
          }
          sx={{ minWidth: 120, borderRadius: 1 }}
        >
          Back
        </Button>
      </Box>

      <Snackbar
        open={snackOpen}
        autoHideDuration={5000}
        onClose={handleSnackClose}
      >
        <Alert
          onClose={handleSnackClose}
          severity={snackSeverity}
          sx={{ width: '100%' }}
        >
          {snackMsg}
        </Alert>
      </Snackbar>
    </>
  )
}

export default Cashout

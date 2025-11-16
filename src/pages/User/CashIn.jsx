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
import VerifiedIcon from '@mui/icons-material/Verified'
import axios from 'axios'
import { useAuth } from '../../context/appstate/UserAuthContext'
import { API_URL } from '../../api/Config'
import { walletProviders } from '../../lib/wallets'
import Header from '../../components/Header'
import UndoIcon from '@mui/icons-material/Undo'
import { imagesrc } from '../../constants'

const CashIn = () => {
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
  const [snackOpen, setSnackOpen] = useState(false)
  const [snackMsg, setSnackMsg] = useState('')
  const [snackSeverity, setSnackSeverity] = useState('error')
  const [customerData, setCustomerData] = useState(null)
  const [customerInfo, setCustomerInfo] = useState(null)
  const [otp, setOtp] = useState('')
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
  }, [params.wallet, location.state, location.search, navigate, walletName])

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

  // fetch fresh profile to populate balances
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
      // ignore
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

  // On form submit: verify customer and show verification UI
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
      const resp = await axios.post(
        `${API_URL}/v1/customers/verify`,
        { phone: formData.msidn },
        { headers: { Authorization: `Bearer ${sessionToken ?? ''}` } }
      )

      if (resp?.data) {
        setCustomerData({
          phone: resp.data.phone ?? formData.msidn,
          name: resp.data.name ?? resp.data.displayName ?? formData.msidn,
        })
        setCustomerInfo(resp.data.body ?? resp.data)
      } else {
        setCustomerData({ phone: formData.msidn, name: formData.msidn })
        setCustomerInfo(null)
      }

      setStep('verify')
    } catch (err) {
      console.warn('Customer verify failed, showing fallback UI:', err)
      setCustomerData({ phone: formData.msidn, name: formData.msidn })
      setCustomerInfo(null)
      setStep('verify')
    } finally {
      setIsLoading(false)
    }
  }

  // helper: derive agent phone (from login)
  const getAgentPhone = () => {
    if (!agent) return null
    return (
      agent.phone_number || agent.msidn || agent.phone || agent.username || null
    )
  }

  // When agent presses Confirm in verify step -> request OTP for the agent's own number
  const handleRequestOtp = async () => {
    if (!agent) {
      setSnackMsg('Agent not available')
      setSnackSeverity('error')
      setSnackOpen(true)
      return
    }
    const agentPhone = getAgentPhone()
    if (!agentPhone) {
      setSnackMsg('Agent phone not available')
      setSnackSeverity('error')
      setSnackOpen(true)
      return
    }

    setIsLoading(true)
    try {
      await axios.post(`${API_URL}/v1/cico/agents/auth/request-otp`, {
        phone_number: agentPhone,
      })
      // show OTP input UI
      setStep('otp')
      setSnackMsg('OTP sent to agent phone')
      setSnackSeverity('info')
      setSnackOpen(true)
    } catch (err) {
      console.error('Failed to request OTP:', err)
      const body = err.response?.data
      const message =
        body?.message ?? body?.error ?? 'Failed to request OTP for agent'
      setSnackMsg(message)
      setSnackSeverity('error')
      setSnackOpen(true)
    } finally {
      setIsLoading(false)
    }
  }

  // called when agent enters OTP - verifies and then performs final cash-in with status
  const handleVerifyOtpAndPerformCashIn = async () => {
    if (!agent) {
      setSnackMsg('Agent not available')
      setSnackSeverity('error')
      setSnackOpen(true)
      return
    }
    const agentPhone = getAgentPhone()
    if (!otp) {
      setSnackMsg('Enter OTP')
      setSnackSeverity('warning')
      setSnackOpen(true)
      return
    }

    setIsLoading(true)
    try {
      // verify OTP first
      const verifyResp = await axios.post(
        `${API_URL}/v1/cico/agents/auth/verify-otp`,
        {
          phone_number: agentPhone,
          otp_code: otp,
        }
      )

      if (!verifyResp?.data?.success) {
        const serverError =
          verifyResp?.data?.message ?? 'OTP verification failed'
        setSnackMsg(serverError)
        setSnackSeverity('error')
        setSnackOpen(true)
        setIsLoading(false)
        return
      }

      // on OTP success -> perform the same cash-in with-status call (requires auth token)
      setStep('processing')

      const response = await axios.post(
        `${API_URL}/v1/cico/agents/cash-in/with-status?timeout=5`,
        {
          amount: parseFloat(formData.amount).toFixed(2),
          party_id: formData.msidn,
          description: 'Cash deposit for customer',
        },
        { headers: { Authorization: `Bearer ${sessionToken ?? ''}` } }
      )

      if (response.data?.success) {
        const newBalance = agentBalance + parseFloat(formData.amount || '0')
        setAgentBalance(newBalance)
        if (agent && updateAgent)
          updateAgent({ ...agent, current_balance: newBalance })
        setStep('complete')
        setLastTransactionId(response.data.data?.transaction_id ?? null)
      } else {
        const serverError =
          response?.data?.error ??
          response?.data?.message ??
          'Transaction failed'
        const serverCode = response?.data?.code
        setSnackMsg(serverCode ? `${serverError} (${serverCode})` : serverError)
        setSnackSeverity('error')
        setSnackOpen(true)
        setStep('verify')
      }
    } catch (err) {
      console.error('OTP verify or transaction failed:', err)
      const serverErrBody = err.response?.data
      const serverError =
        serverErrBody?.error ??
        serverErrBody?.message ??
        err.message ??
        'Unable to complete transaction'
      const serverCode = serverErrBody?.code
      setSnackMsg(serverCode ? `${serverError} (${serverCode})` : serverError)
      setSnackSeverity('error')
      setSnackOpen(true)
      setStep('verify')
    } finally {
      setIsLoading(false)
    }
  }

  // Loading spinner
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
              Awaiting operator response
            </Typography>
            <Typography variant='body2' color='textSecondary'>
              The cashin request was sent and is being processed.
            </Typography>
          </Card>
        </Box>
      </>
    )
  }

  // Complete screen
  if (step === 'complete') {
    return (
      <>
        <Header />
        <Box
          maxWidth={500}
          mx='auto'
          p={2}
          sx={{
            borderRadius: 3, // soft rounded corners
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

        {/* Snackbar for errors / messages */}
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

  // Transaction form
  return (
    <>
      <Header />
      <Box
        maxWidth={500}
        mx='auto'
        p={2}
        sx={{
          // add top padding to clear the fixed back button and provide visual gap
          pt: { xs: 9, sm: 10 },

          borderRadius: 2, // soft rounded corners
          border: 'none',
          overflow: 'hidden',
        }}
      >
        <Card
          sx={{
            // add top padding to clear the fixed back button and provide visual gap
            pt: { xs: 3, sm: 10 },

            borderRadius: 2, // soft rounded corners
            border: 'none',
            overflow: 'hidden',
          }}
        >
          {step !== 'verify' && (
            <CardHeader
              title={<Typography variant='h2'>CashIn Transaction</Typography>}
            />
          )}
          <CardContent>
            {step !== 'verify' && step !== 'otp' && (
              <Box mb={2}>
                <Box
                  sx={{
                    bgcolor: '#e1e1e1', // sky blue background
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
                {/* Verification header + KYC status */}
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
                    {/* Row: Given Name — Family Name */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 3,
                      }}
                    >
                      {/* Left */}
                      <Box>
                        <Typography variant='caption' sx={{ color: '#B0BEC5' }}>
                          Given Name
                        </Typography>
                        <Typography variant='h2' fontWeight={600}>
                          {customerInfo?.given_name ?? customerData?.name ?? ''}
                        </Typography>
                      </Box>

                      {/* Right */}
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant='caption' sx={{ color: '#B0BEC5' }}>
                          Family Name
                        </Typography>
                        <Typography variant='h2' fontWeight={500}>
                          {customerInfo?.family_name ?? ''}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Row: Phone Number — Amount */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 3,
                      }}
                    >
                      {/* Left */}
                      <Box>
                        <Typography variant='caption' sx={{ color: '#B0BEC5' }}>
                          Phone Number
                        </Typography>
                        <Typography variant='h2' fontWeight={500}>
                          {customerData?.phone}
                        </Typography>
                      </Box>

                      {/* Right */}
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

                    {/* KYC Status */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant='caption' sx={{ color: '#B0BEC5' }}>
                        KYC Status
                      </Typography>
                      <Box sx={{ position: 'relative', mt: 0.5 }}>
                        <Typography
                          variant='h6'
                          component='span'
                          sx={{
                            display: 'inline-block',
                            fontWeight: 600,
                            pr: 4,
                          }}
                        >
                          Verified
                        </Typography>
                        <VerifiedIcon
                          fontSize='small'
                          sx={{
                            position: 'absolute',
                            top: -6,
                            right: 0,
                            color: 'success.main',
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Agent section (full width) */}
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
                  onClick={handleRequestOtp}
                  disabled={isLoading}
                  sx={{ height: 48 }}
                >
                  {isLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    'Confirm & Send OTP Request'
                  )}
                </Button>
              </Box>
            ) : step === 'otp' ? (
              <Box>
                <Typography variant='h6' mb={1}>
                  Enter OTP sent to agent phone
                </Typography>
                <TextField
                  label='OTP'
                  variant='outlined'
                  fullWidth
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant='contained'
                  fullWidth
                  onClick={handleVerifyOtpAndPerformCashIn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    'Verify OTP & Complete'
                  )}
                </Button>
                <Button
                  variant='outlined'
                  fullWidth
                  sx={{ mt: 1 }}
                  onClick={() => {
                    setStep('verify')
                    setOtp('')
                  }}
                >
                  Back
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

      {/* Fixed back button top-left, just below header */}
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

      {/* Snackbar for errors / messages */}
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

export default CashIn

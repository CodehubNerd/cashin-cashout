import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../../api/Config'
import { useUserAuth } from '../../context/appstate/UserAuthContext'
import { imagesrc } from '../../constants'

const Login = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { login, user } = useUserAuth()

  // if user already authenticated, redirect to home
  useEffect(() => {
    if (user) {
      navigate('/home')
    }
  }, [user, navigate])

  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  const handleSnackbarClose = () => setOpen(false)

  const handleSendOtp = async () => {
    setLoading(true)
    try {
      await axios.post(`${API_URL}/v1/cico/agents/auth/request-otp`, {
        phone_number: phone,
      })
      setStep('otp')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
      setOpen(true)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setLoading(true)
    try {
      const response = await axios.post(
        `${API_URL}/v1/cico/agents/auth/verify-otp`,
        {
          phone_number: phone,
          otp_code: otp,
        }
      )

      // avoid shadowing the context 'user' variable
      const { agent, session_token } = response.data.data
      login(agent, session_token)
      navigate('/home')
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP')
      setOpen(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      display='flex'
      justifyContent='center'
      alignItems='center'
      minHeight='100vh'
      bgcolor={theme.palette.background.default}
      p={2}
    >
      <Paper elevation={3} sx={{ p: 4, width: 350, textAlign: 'center' }}>
        <Box
          component='img'
          src={imagesrc.logo}
          alt='Logo'
          sx={{ width: 170, height: 'auto', mx: 'auto', mb: 2 }}
        />

        {step === 'phone' ? (
          <Typography variant='body1' color='text.secondary' mb={3}>
            Enter your phone number to get started
          </Typography>
        ) : (
          <Typography variant='body1' color='text.secondary' mb={3}>
            Enter the 6-digit code sent to your phone
          </Typography>
        )}

        {step === 'phone' ? (
          <>
            <TextField
              fullWidth
              label='Phone Number'
              variant='outlined'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              margin='normal'
            />
            <Button
              fullWidth
              size='large'
              variant='contained'
              sx={{ mt: 2 }}
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </>
        ) : (
          <>
            <TextField
              fullWidth
              label='Enter OTP'
              variant='outlined'
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              margin='normal'
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant='outlined'
                size='medium'
                sx={{ flex: 1 }}
                onClick={() => setStep('phone')}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                variant='contained'
                size='medium'
                sx={{ flex: 1 }}
                onClick={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
            </Box>
          </>
        )}

        <Snackbar
          open={open}
          autoHideDuration={5000}
          onClose={handleSnackbarClose}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity='error'
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  )
}

export default Login

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Avatar,
  Button,
  Divider,
  IconButton,
  Snackbar,
  Chip,
  CircularProgress,
} from '@mui/material'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Header } from '../../components'
import { useNavigate } from 'react-router-dom'
import { imagesrc } from '../../constants'
import { walletConfig } from '../../lib/wallets'
import axios from 'axios'
import { useAuth } from '../../context/appstate/UserAuthContext'
import { API_URL } from '../../api/Config'

const sampleTransactionsInit = []

const getWalletIcon = (walletName) => {
  if (!walletName) return imagesrc.empty || ''
  const key = walletName.toString().trim().toLowerCase()
  const found =
    walletConfig.find((w) => w.name.toLowerCase() === key) ||
    walletConfig.find((w) => key.includes(w.name.toLowerCase()))
  if (found && found.icon) return found.icon
  return imagesrc[key] || imagesrc.empty || ''
}

const Profile = () => {
  const [transactions, setTransactions] = useState(sampleTransactionsInit)
  const [snack, setSnack] = useState({ open: false, message: '' })
  const [showDaily, setShowDaily] = useState(false)
  const navigate = useNavigate()
  const { sessionToken } = useAuth()
  const [profile, setProfile] = useState(null)
  const [dailySummary, setDailySummary] = useState(null)
  const [loadingTransactions, setLoadingTransactions] = useState(false)

  const handleCheckStatus = (id) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'Pending' ? 'Completed' : t.status }
          : t
      )
    )
    setSnack({ open: true, message: `${id} updated` })
  }

  const closeSnack = () => setSnack({ open: false, message: '' })

  useEffect(() => {
    if (!sessionToken) return

    axios
      .get(`${API_URL}/v1/cico/agents/me`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      })
      .then((resp) => {
        const d = resp.data?.data
        if (d) setProfile(d)
      })
      .catch(() => {})

    axios
      .get(`${API_URL}/v1/cico/agents/me/summary/daily`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      })
      .then((resp) => {
        if (resp.data?.data) setDailySummary(resp.data.data)
      })
      .catch(() => {})

    setLoadingTransactions(true)
    axios
      .get(`${API_URL}/v1/cico/agents/me/transactions?page=1&limit=5`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      })
      .then((resp) => {
        const data = resp.data?.data ?? []
        if (data.length) {
          const mapped = data.map((t) => ({
            id: t.transaction_id,
            type: t.transaction_type === 'cash_in' ? 'Cashin' : 'Cashout',
            number: t.party_id ?? '',
            wallet: t.transaction_type === 'cash_in' ? 'Bank' : 'Momo',
            status:
              t.status === 'successful'
                ? 'Completed'
                : t.status === 'pending'
                ? 'Pending'
                : 'Failed',
            datetime: t.created_at
              ? new Date(t.created_at * 1000).toLocaleString()
              : '',
            amount: Number(t.amount) ?? 0,
          }))
          setTransactions(mapped)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTransactions(false))
  }, [sessionToken])

  return (
    <>
      <Header />

      <Box sx={{ maxWidth: 1100, mx: 'auto', p: 2 }}>
        <Card sx={{ mb: 2, borderRadius: 2, p: 2, border: 'none' }}>
          <CardContent>
            <Box mb={2}>
              <Typography fontWeight={700}>Balances</Typography>

              <Typography variant='caption' color='text.secondary'>
                Available
              </Typography>
              <Typography fontSize={28} fontWeight={700} mb={1}>
                E{' '}
                {(
                  (profile?.available_balance ?? profile?.current_balance) ||
                  0
                ).toFixed(2)}
              </Typography>

              <Typography variant='body2' color='text.secondary'>
                Current: E {(profile?.current_balance ?? 0).toFixed(2)} • Holds:
                E {(profile?.holds_balance ?? 0).toFixed(2)}
              </Typography>

              <Typography variant='body2' color='text.secondary' mt={1}>
                Limit: E {(profile?.fund_limit ?? 0).toFixed(2)}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box
              display='flex'
              flexWrap='wrap'
              justifyContent='space-between'
              rowGap={2}
            >
              <Box width='48%'>
                <Typography variant='caption' color='text.secondary'>
                  Total TXNS
                </Typography>
                <Typography fontWeight={700}>
                  {profile?.total_transactions_count ?? '-'}
                </Typography>
              </Box>

              <Box width='48%'>
                <Typography variant='caption' color='text.secondary'>
                  Last Login
                </Typography>
                <Typography fontWeight={700}>
                  {profile?.last_login_at
                    ? new Date(profile.last_login_at * 1000).toLocaleString()
                    : '-'}
                </Typography>
              </Box>

              <Box width='48%'>
                <Typography variant='caption' color='text.secondary'>
                  Active
                </Typography>
                <Typography fontWeight={700}>
                  {profile?.is_active ? 'Yes' : 'No'}
                </Typography>
              </Box>

              <Box width='48%'>
                <Typography variant='caption' color='text.secondary'>
                  Suspended
                </Typography>
                <Typography fontWeight={700}>
                  {profile?.is_suspended ? 'Yes' : 'No'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 2, borderRadius: 2, border: 'none' }}>
          <CardHeader
            title={<Typography fontWeight={700}>Daily Summary</Typography>}
            action={
              <IconButton
                size='small'
                aria-label={showDaily ? 'collapse-daily' : 'expand-daily'}
                onClick={() => setShowDaily((s) => !s)}
                sx={{ color: '#FFFFFF' }}
              >
                {showDaily ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            }
          />

          {showDaily && (
            <CardContent>
              <Box display='flex' flexWrap='wrap' rowGap={2}>
                <Box width='50%'>
                  <Typography variant='caption' color='text.secondary'>
                    Total TXNS
                  </Typography>
                  <Typography fontWeight={700}>
                    {dailySummary?.total_transactions ?? '-'}
                  </Typography>
                </Box>

                <Box width='50%'>
                  <Typography variant='caption' color='text.secondary'>
                    Successful
                  </Typography>
                  <Typography fontWeight={700}>
                    {dailySummary?.successful_transactions ?? '-'}
                  </Typography>
                </Box>

                <Box width='50%'>
                  <Typography variant='caption' color='text.secondary'>
                    Failed
                  </Typography>
                  <Typography fontWeight={700}>
                    {dailySummary?.failed_transactions ?? '-'}
                  </Typography>
                </Box>

                <Box width='50%'>
                  <Typography variant='caption' color='text.secondary'>
                    Avg Amount
                  </Typography>
                  <Typography fontWeight={700}>
                    E{' '}
                    {(dailySummary?.average_transaction_amount ?? 0).toFixed(2)}
                  </Typography>
                </Box>

                <Box width='100%' mt={1}>
                  <Typography variant='caption' color='text.secondary'>
                    Current Balance
                  </Typography>
                  <Typography fontWeight={700}>
                    E{' '}
                    {(
                      dailySummary?.current_balance ??
                      profile?.current_balance ??
                      0
                    ).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          )}
        </Card>

        <Card sx={{ borderRadius: 2, border: 'none' }}>
          <CardHeader
            title={
              <Typography fontWeight={700}>Recent Transactions</Typography>
            }
            subheader={<Typography variant='caption'>Latest 5</Typography>}
            action={
              <Button size='small' onClick={() => navigate('/history')}>
                View All
              </Button>
            }
          />

          <CardContent>
            {loadingTransactions ? (
              <Box display='flex' justifyContent='center' py={4}>
                <CircularProgress aria-label='loading-recent-transactions' />
              </Box>
            ) : transactions.length === 0 ? (
              <Box
                display='flex'
                flexDirection='column'
                alignItems='center'
                justifyContent='center'
                py={4}
              >
                <img
                  src={imagesrc.empty}
                  alt='no-transactions'
                  style={{ width: 160, maxWidth: '60%' }}
                />
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ mt: 1 }}
                >
                  Past transactions will show up here
                </Typography>
              </Box>
            ) : (
              transactions.slice(0, 5).map((t, idx) => (
                <Box key={t.id}>
                  <Box
                    display='flex'
                    justifyContent='space-between'
                    alignItems='flex-start'
                    py={1.5}
                  >
                    <Box display='flex' gap={1.5}>
                      <Avatar
                        src={getWalletIcon(t.wallet)}
                        alt={t.wallet}
                        sx={{ width: 40, height: 40, bgcolor: 'transparent' }}
                      >
                        {t.type?.[0]}
                      </Avatar>

                      <Box>
                        <Typography fontWeight={700}>{t.type}</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {t.number}
                        </Typography>
                      </Box>
                    </Box>

                    <Box textAlign='center'>
                      <Chip
                        size='small'
                        clickable
                        onClick={() => handleCheckStatus(t.id)}
                        variant='outlined'
                        label='Check Status'
                        sx={{
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          ml: 3.5,
                        }}
                        aria-label={`check-status-${t.id}`}
                      />

                      <Box
                        display='flex'
                        alignItems='center'
                        justifyContent='center'
                        gap={0.5}
                        mt={0.5}
                      >
                        <Typography
                          variant='caption'
                          sx={{
                            color:
                              t.status === 'Completed'
                                ? '#2E7D32'
                                : t.status === 'Pending'
                                ? '#FFD700'
                                : '#D32F2F',
                            fontWeight: 600,
                          }}
                        >
                          {t.status}
                        </Typography>
                      </Box>
                    </Box>

                    <Box textAlign='right'>
                      <Typography fontWeight={700}>
                        E {t.amount.toFixed(2)}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {t.datetime}
                      </Typography>
                    </Box>
                  </Box>

                  {idx < transactions.length - 1 && <Divider />}
                </Box>
              ))
            )}
          </CardContent>
        </Card>

        <Snackbar
          open={snack.open}
          message={snack.message}
          autoHideDuration={3500}
          onClose={closeSnack}
        />
      </Box>
    </>
  )
}

export default Profile

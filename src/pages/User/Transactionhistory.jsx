import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Snackbar,
  Avatar,
  Divider,
  Chip,
  CircularProgress,
  IconButton,
} from '@mui/material'

import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { Header } from '../../components'
import { imagesrc } from '../../constants'
import { walletConfig } from '../../lib/wallets'
import axios from 'axios'
import { useAuth } from '../../context/appstate/UserAuthContext'
import { API_URL } from '../../api/Config'

// Initial state
const initial = []

// Return wallet icon
const getWalletIcon = (walletName) => {
  if (!walletName) return imagesrc.empty || ''
  const s = String(walletName).toLowerCase().trim()

  if (s.includes('momo')) return imagesrc.momo
  if (s.includes('deltapay')) return imagesrc.delta
  if (s.includes('unayo')) return imagesrc.unayo
  if (s.includes('insta')) return imagesrc.instacash
  if (s.includes('bank')) return imagesrc.delta

  return imagesrc.empty || ''
}

// Normalize wallet name
const normalizeWalletName = (walletName) => {
  if (!walletName) return 'Unknown'
  const s = String(walletName).toLowerCase().trim()

  if (s.includes('momo')) return 'Momo'
  if (s.includes('bank')) return 'Bank'
  if (s.includes('delta')) return 'deltapay'
  if (s.includes('unayo')) return 'unayo'
  if (s.includes('insta')) return 'instacash'

  return walletName
}

const Transactionhistory = () => {
  const [rows, setRows] = useState(initial)
  const [walletFilter, setWalletFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const { sessionToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [snack, setSnack] = useState({ open: false, message: '' })

  const handleCheck = (id) => {
    if (!sessionToken) {
      setSnack({ open: true, message: 'Not authenticated' })
      return
    }
    setLoading(true)
    axios
      .get(`${API_URL}/v1/cico/agents/transactions/${id}`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      })
      .then((resp) => {
        const statusMap = {
          pending: 'Pending',
          successful: 'Completed',
          failed: 'Failed',
        }
        const newStatus = statusMap[resp.data?.data?.status] ?? 'Unknown'
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        )
        setSnack({ open: true, message: `${id} updated to ${newStatus}` })
      })
      .catch(() => {
        setSnack({ open: true, message: 'Unable to fetch status' })
      })
      .finally(() => setLoading(false))
  }

  // Fetch transactions
  useEffect(() => {
    if (!sessionToken) return
    setLoading(true)
    axios
      .get(`${API_URL}/v1/cico/agents/me/transactions?page=1&limit=50`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      })
      .then((resp) => {
        const data = resp.data?.data ?? []
        const mapped = data.map((t) => ({
          id: t.transaction_id,
          type: t.transaction_type === 'cash_in' ? 'Cashin' : 'Cashout',
          number: t.party_id ?? '',
          wallet:
            t.wallet ||
            t.wallet_provider ||
            t.provider ||
            t.provider_id ||
            (t.transaction_type === 'cash_in' ? 'Bank' : 'Momo'),
          status:
            t.status === 'successful'
              ? 'Completed'
              : t.status === 'pending'
              ? 'Pending'
              : 'Failed',
          timestamp: t.created_at ? t.created_at * 1000 : null,
          datetime: t.created_at
            ? new Date(t.created_at * 1000).toLocaleString()
            : '',
          amount: Number(t.amount) ?? 0,
        }))
        setRows(mapped)
      })
      .finally(() => setLoading(false))
  }, [sessionToken])

  const walletOptions = Array.from(
    new Set(rows.map((r) => normalizeWalletName(r.wallet)))
  )

  // Apply filters
  const filteredRows = rows.filter((r) => {
    if (
      walletFilter !== 'All' &&
      normalizeWalletName(r.wallet).toLowerCase() !== walletFilter.toLowerCase()
    )
      return false
    if (typeFilter !== 'All' && r.type !== typeFilter) return false
    if (fromDate && r.timestamp < new Date(fromDate).getTime()) return false

    if (toDate) {
      const toTs = new Date(toDate).getTime() + 86399999
      if (r.timestamp > toTs) return false
    }
    return true
  })

  const clearFilters = () => {
    setWalletFilter('All')
    setTypeFilter('All')
    setFromDate('')
    setToDate('')
  }

  return (
    <>
      <Header />

      <Box sx={{ maxWidth: 1100, mx: 'auto', p: 2 }}>
        <Card sx={{ borderRadius: 2, mb: 2, border: 'none' }}>
          <CardHeader
            title={<Typography fontWeight={700}>Filters</Typography>}
            action={
              <IconButton onClick={() => setShowFilters((p) => !p)}>
                {showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            }
          />
          {showFilters && (
            <CardContent>
              <Box display='flex' flexWrap='wrap' gap={2}>
                <FormControl size='small' sx={{ minWidth: 160 }}>
                  <InputLabel>Wallet</InputLabel>
                  <Select
                    value={walletFilter}
                    label='Wallet'
                    onChange={(e) => setWalletFilter(e.target.value)}
                  >
                    <MenuItem value='All'>All</MenuItem>
                    {walletOptions.map((w) => (
                      <MenuItem key={w} value={w}>
                        {w}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size='small' sx={{ minWidth: 140 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={typeFilter}
                    label='Type'
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <MenuItem value='All'>All</MenuItem>
                    <MenuItem value='Cashin'>Cashin</MenuItem>
                    <MenuItem value='Cashout'>Cashout</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  size='small'
                  label='From'
                  type='date'
                  InputLabelProps={{ shrink: true }}
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />

                <TextField
                  size='small'
                  label='To'
                  type='date'
                  InputLabelProps={{ shrink: true }}
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />

                <Button size='small' onClick={clearFilters}>
                  Clear
                </Button>
              </Box>
            </CardContent>
          )}
        </Card>

        {/* TRANSACTIONS LIST */}
        <Card sx={{ borderRadius: 2, border: 'none' }}>
          <CardHeader
            title={
              <Typography fontWeight={700}>Transaction History</Typography>
            }
            subheader={'All transactions'}
          />

          <CardContent>
            {loading ? (
              <Box display='flex' justifyContent='center' py={6}>
                <CircularProgress />
              </Box>
            ) : filteredRows.length === 0 ? (
              <Box textAlign='center' py={4}>
                <Typography variant='caption' color='text.secondary'>
                  No transactions found
                </Typography>
              </Box>
            ) : (
              filteredRows.map((r, idx) => (
                <Box key={r.id}>
                  <Box
                    display='flex'
                    justifyContent='space-between'
                    alignItems='flex-start'
                    py={1.5}
                  >
                    {/* Left Section */}
                    <Box display='flex' gap={1.5}>
                      <Avatar
                        src={getWalletIcon(r.wallet)}
                        sx={{ width: 40, height: 40 }}
                      />
                      <Box>
                        <Typography fontWeight={700}>{r.type}</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {r.number}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Middle */}
                    <Box textAlign='center'>
                      <Chip
                        size='small'
                        variant='outlined'
                        label='Check Status'
                        clickable
                        onClick={() => handleCheck(r.id)}
                      />
                      <Typography
                        mt={0.5}
                        variant='caption'
                        fontWeight={600}
                        sx={{
                          color:
                            r.status === 'Completed'
                              ? '#2E7D32'
                              : r.status === 'Pending'
                              ? '#FFD700'
                              : '#D32F2F',
                        }}
                      >
                        {r.status}
                      </Typography>
                    </Box>

                    {/* Right */}
                    <Box textAlign='right'>
                      <Typography fontWeight={700}>
                        E {r.amount.toFixed(2)}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {r.datetime}
                      </Typography>
                    </Box>
                  </Box>

                  {idx < rows.length - 1 && <Divider />}
                </Box>
              ))
            )}
          </CardContent>
        </Card>

        <Snackbar
          open={snack.open}
          message={snack.message}
          autoHideDuration={4000}
          onClose={() => setSnack({ open: false, message: '' })}
        />
      </Box>
    </>
  )
}

export default Transactionhistory

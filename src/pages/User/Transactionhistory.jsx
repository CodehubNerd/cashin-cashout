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
  Pagination,
} from '@mui/material'

import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { Header } from '../../components'
import { imagesrc } from '../../constants'
import { walletConfig } from '../../lib/wallets'
import axios from 'axios'
import { useAuth } from '../../context/appstate/UserAuthContext'
import { API_URL } from '../../api/Config'
import { useLocation, useParams } from 'react-router-dom' // added

// Initial state
const initial = []

// Return wallet icon
const getWalletIcon = (walletName) => {
  if (!walletName) return imagesrc.empty || ''
  const key = walletName.toString().trim().toLowerCase()

  // try to find matching wallet from walletConfig first (exact match or contains)
  const found =
    walletConfig.find((w) => w.name.toLowerCase() === key) ||
    walletConfig.find((w) => key.includes(w.name.toLowerCase()))

  if (found && found.icon) return found.icon

  // fallback to imagesrc lookup by key, then empty
  return imagesrc[key] || imagesrc.empty || ''
}

// Normalize wallet name
const normalizeWalletName = (walletName) => {
  if (!walletName) return 'Unknown'
  const s = String(walletName).toLowerCase().trim()

  if (s.includes('momo')) return 'momo'
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
  const [page, setPage] = useState(1)
  const rowsPerPage = 6

  const { sessionToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [snack, setSnack] = useState({ open: false, message: '', isStatus: false })

  // new: read wallet from route params or detect in path segments
  const { wallet: walletParam } = useParams()
  const location = useLocation()
  const walletFromPath = React.useMemo(() => {
    // prefer explicit param
    if (walletParam) return walletParam
    // otherwise search path segments for a wallet name present in walletConfig
    const segs = (location.pathname || '').split('/').map((s) => s.toLowerCase())
    const found = walletConfig.find((w) =>
      segs.includes(w.name.toLowerCase())
    )
    return found?.name ?? null
  }, [walletParam, location.pathname])

  const handleCheck = (id) => {
    if (!sessionToken) {
      setSnack({ open: true, message: 'Not authenticated', isStatus: false })
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
        setSnack({ open: true, message: newStatus, isStatus: true })
      })
      .catch(() => {
        setSnack({ open: true, message: 'Unable to fetch status', isStatus: false })
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
        const mapped = data.map((t) => {
          // try all likely provider fields
          const candidateFields = [
            t.wallet,
            t.wallet_provider,
            t.provider,
            t.provider_id,
            t.providerName,
            t.provider_name,
          ].filter(Boolean).map((v) => v.toString().toLowerCase())

          // try to match walletConfig by any candidate field
          const matchedProvider =
            walletConfig.find((w) =>
              candidateFields.some((f) => f.includes(w.name.toLowerCase()))
            ) || null

          // resolved wallet name: prefer matchedProvider -> first non-empty candidate -> url path -> fallback by type
          const resolvedWallet =
            (matchedProvider && matchedProvider.name) ||
            (candidateFields[0] ? candidateFields[0] : null) ||
            walletFromPath ||
            (t.transaction_type === 'cash_in' ? 'Bank' : 'Momo')

          return {
            id: t.transaction_id,
            type: t.transaction_type === 'cash_in' ? 'Cashin' : 'Cashout',
            number: t.party_id ?? '',
            wallet: resolvedWallet,
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
          }
        })
        setRows(mapped)
      })
      .finally(() => setLoading(false))
  }, [sessionToken, walletFromPath]) // include walletFromPath so list updates when route param changes

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

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage))
  const paginatedRows = filteredRows.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  )

  useEffect(() => {
    setPage(1)
  }, [walletFilter, typeFilter, fromDate, toDate, rows.length])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

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
                {showFilters ? (
                  <ExpandLessIcon sx={{ color: '#FFFFFF' }} />
                ) : (
                  <ExpandMoreIcon sx={{ color: '#FFFFFF' }} />
                )}
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
              paginatedRows.map((r, idx) => (
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

                  {idx < paginatedRows.length - 1 && <Divider />}
                </Box>
              ))
            )}
            {filteredRows.length > rowsPerPage && (
              <Box display='flex' justifyContent='center' mt={3}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color='primary'
                />
              </Box>
            )}
          </CardContent>
        </Card>

        <Snackbar
          open={snack.open}
          message={
            <Typography sx={{ color: '#000000' }}>
              {snack.isStatus ? (
                <>
                  Current status of the transaction is{' '}
                  <Box component='span' fontWeight={700} color='#000000'>
                    {snack.message}
                  </Box>
                </>
              ) : (
                snack.message
              )}
            </Typography>
          }
          autoHideDuration={4000}
          onClose={() =>
            setSnack({ open: false, message: '', isStatus: false })
          }
          ContentProps={{
            sx: { backgroundColor: '#FFFFFF' },
          }}
        />
      </Box>
    </>
  )
}

export default Transactionhistory

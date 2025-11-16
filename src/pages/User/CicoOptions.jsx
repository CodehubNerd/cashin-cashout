import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Button,
  Box,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import { transactionTypes, walletConfig } from '../../lib/wallets'
import { imagesrc } from '../../constants'
import { Header } from '../../components'

const CicoOptions = () => {
  const navigate = useNavigate()

  const handleWalletClick = (type, wallet) => {
    if (!wallet.enabled) return

    // Build route and append wallet name as a path segment so direct URL visits work
    const base = type?.route?.startsWith('/')
      ? type.route.replace(/\/$/, '')
      : `/${type?.route || ''}`
    const routeWithWallet = `${base}/${encodeURIComponent(wallet.name)}`

    // navigate with URL param (also keep state for backward compatibility if desired)
    navigate(routeWithWallet, { state: { wallet: wallet.name } })
  }

  return (
    <>
      <Header />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Typography variant='h1' fontWeight='bold' gutterBottom>
            Start A Transaction
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Select whether you want to process a cash-in or cash-out transaction
          </Typography>
        </div>

        {/* FLEXBOX CARDS */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          {transactionTypes.map((type) => (
            <Box
              key={type.type}
              sx={{
                flex: '1 1 100%',
                maxWidth: { md: 460 },
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  boxShadow: 3,
                  borderRadius: 2,
                  border: 'none',
                  backgroundColor: 'background.paper',
                  transition: '0.2s',
                  '&:hover': { boxShadow: 6 },
                }}
              >
                <CardHeader
                  title={
                    <Typography
                      variant='h6'
                      fontWeight='bold'
                      sx={{ textAlign: 'center' }}
                    >
                      {type.title}
                    </Typography>
                  }
                  subheader={
                    <Typography
                      variant='body2'
                      sx={{ textAlign: 'center', color: 'text.secondary' }}
                    >
                      {type.description}
                    </Typography>
                  }
                />

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant='caption'
                    display='block'
                    sx={{ textAlign: 'center', marginBottom: '8px' }}
                    color='text.secondary'
                  >
                    Choose A Wallet:
                  </Typography>

                  {/* WALLET BUTTONS (flexbox grid replacement) */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 2,
                      justifyContent: 'space-between',
                    }}
                  >
                    {walletConfig.map((wallet) => (
                      <Box
                        key={wallet.name}
                        sx={{
                          flex: '1 1 calc(50% - 8px)',
                          maxWidth: '50%',
                          display: 'flex',
                        }}
                      >
                        <Button
                          fullWidth
                          onClick={() => handleWalletClick(type, wallet)}
                          disabled={!wallet.enabled}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 2,
                            border: '1px solid',
                            borderColor: '#B0BEC5',
                            borderRadius: 1,
                            textTransform: 'none',
                            backgroundColor: wallet.enabled
                              ? 'background.paper'
                              : 'action.disabledBackground',
                            '&:hover': wallet.enabled
                              ? { borderColor: 'primary.light' }
                              : {},
                            whiteSpace: 'normal',
                          }}
                        >
                          <img
                            src={
                              wallet.icon ||
                              imagesrc[wallet.name?.toLowerCase()] ||
                              imagesrc.empty
                            }
                            alt={`${wallet.name} logo`}
                            style={{
                              width: 50,
                              height: 50,
                              marginBottom: 8,
                              objectFit: 'cover',
                              borderRadius: '50%',
                              backgroundColor: '#fff',
                              border: '1px solid rgba(0,0,0,0.08)',
                              opacity: wallet.enabled ? 1 : 0.5,
                            }}
                          />

                          <Typography
                            variant='body2'
                            fontWeight='medium'
                            sx={{
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                              textAlign: 'center',
                            }}
                          >
                            {wallet.name}
                          </Typography>
                        </Button>
                      </Box>
                    ))}
                  </Box>
                </CardContent>

                <CardActions />
              </Card>
            </Box>
          ))}
        </Box>
      </div>
    </>
  )
}

export default CicoOptions

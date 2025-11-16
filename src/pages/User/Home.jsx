import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Divider,
  Collapse,
  IconButton,
} from '@mui/material'
import RoundaboutRightOutlinedIcon from '@mui/icons-material/RoundaboutRightOutlined'
import ImportExportOutlinedIcon from '@mui/icons-material/ImportExportOutlined'
import {
  ArrowUpward,
  Description,
  ExpandMore,
  ExpandLess,
  CheckCircleOutline,
  History,
  AttachMoney,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../components'

const Home = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()

  const [showCicoFeatures, setShowCicoFeatures] = useState(false)
  const [showDaasFeatures, setShowDaasFeatures] = useState(false)

  return (
    <>
      <Header />

      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#062b55',
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: 2,
          mt: -3,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 1100, textAlign: 'center' }}>
          <Typography variant='h6' fontWeight='bold'>
            Choose Your Service
          </Typography>
          <Typography variant='body2' color='grey.300' mb={4}>
            Select the service you want to access
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 4,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* ====== CICO Card ====== */}
            <Card
              sx={{
                flex: 1,
                maxWidth: 450,
                bgcolor: '#0b3b6d',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <CardContent>
                <ImportExportOutlinedIcon
                  sx={{
                    fontSize: 30,
                    color: '#FCFBF4',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    p: 1,
                    mb: 1,
                  }}
                />
                <Typography variant='h6' fontWeight='bold'>
                  CICO Transactions
                </Typography>
                <Typography variant='body2' color='grey.300' mb={2}>
                  Cash In Cash Out Transaction Processing
                </Typography>

                {/* Desktop view: show all features */}
                {!isMobile && (
                  <Box textAlign='left' sx={{ mx: 4 }}>
                    <Typography variant='body2' sx={{ mb: 1 }}>
                      • Mobile money transactions
                    </Typography>
                    <Typography variant='body2' sx={{ mb: 1 }}>
                      • Cash-in and cash-out operations
                    </Typography>
                    <Typography variant='body2'>
                      • Transaction history and reporting
                    </Typography>
                  </Box>
                )}

                {isMobile && (
                  <Box sx={{ width: '95%', px: 2 }}>
                    {/* Full-width dropdown button with side padding */}
                    <Button
                      onClick={() => setShowCicoFeatures((prev) => !prev)}
                      variant='outlined'
                      fullWidth
                      sx={{
                        color: 'white',
                        borderColor: 'white',
                        mt: 2,
                        mb: 1,
                        textTransform: 'none',
                        borderRadius: 1.5,
                        px: 2,
                      }}
                      endIcon={
                        showCicoFeatures ? <ExpandLess /> : <ExpandMore />
                      }
                    >
                      View Features
                    </Button>

                    {/* Expandable section - padded and full width */}
                    <Collapse in={showCicoFeatures}>
                      <Box
                        textAlign='left'
                        sx={{
                          width: '100%',
                          mt: 1,
                          bgcolor: 'rgba(255,255,255,0.05)',
                          p: 1,
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        <Typography
                          variant='body2'
                          sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                        >
                          <CheckCircleOutline sx={{ fontSize: 18, mr: 1 }} />{' '}
                          Mobile money transactions
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                        >
                          <AttachMoney sx={{ fontSize: 18, mr: 1 }} /> Cash-in
                          and cash-out operations
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          <History sx={{ fontSize: 18, mr: 1 }} /> Transaction
                          history and reporting
                        </Typography>
                      </Box>
                    </Collapse>
                  </Box>
                )}
              </CardContent>

              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  variant='contained'
                  size='medium'
                  sx={{ flex: 1 }}
                  onClick={() => navigate('/cico')}
                >
                  Access CICO Services
                </Button>
              </CardActions>
            </Card>

            {/* ====== DAAS Card ====== */}
            <Card
              sx={{
                flex: 1,
                maxWidth: 450,
                bgcolor: '#0b3b6d',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <CardContent>
                <RoundaboutRightOutlinedIcon
                  sx={{
                    fontSize: 30,
                    color: '#FCFBF4',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    p: 1,
                    mb: 1,
                  }}
                />
                <Typography variant='h6' fontWeight='bold'>
                  DAAS Services
                </Typography>
                <Typography variant='body2' color='grey.300' mb={2}>
                  Distributor Agent Administration System
                </Typography>

                {!isMobile && (
                  <Box textAlign='left' sx={{ mx: 4 }}>
                    <Typography variant='body2' sx={{ mb: 1 }}>
                      • Performance tracking and metrics
                    </Typography>
                    <Typography variant='body2' sx={{ mb: 1 }}>
                      • Commission management
                    </Typography>
                    <Typography variant='body2'>
                      • Service event submissions
                    </Typography>
                  </Box>
                )}
                {isMobile && (
                  <Box sx={{ width: '95%', px: 2 }}>
                    {/* Full-width dropdown button with side padding */}
                    <Button
                      onClick={() => setShowCicoFeatures((prev) => !prev)}
                      variant='outlined'
                      fullWidth
                      sx={{
                        color: 'white',
                        borderColor: 'white',
                        mt: 2,
                        mb: 1,
                        textTransform: 'none',
                        borderRadius: 1.5,
                        px: 2,
                      }}
                      endIcon={
                        showCicoFeatures ? <ExpandLess /> : <ExpandMore />
                      }
                    >
                      View Features
                    </Button>

                    {/* Expandable section - padded and full width */}
                    <Collapse in={showCicoFeatures}>
                      <Box
                        textAlign='left'
                        sx={{
                          width: '100%',
                          mt: 1,
                          bgcolor: 'rgba(255,255,255,0.05)',
                          p: 1,
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        <Typography
                          variant='body2'
                          sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                        >
                          <CheckCircleOutline sx={{ fontSize: 18, mr: 1 }} />{' '}
                          Mobile money transactions
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                        >
                          <AttachMoney sx={{ fontSize: 18, mr: 1 }} /> Cash-in
                          and cash-out operations
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          <History sx={{ fontSize: 18, mr: 1 }} /> Transaction
                          history and reporting
                        </Typography>
                      </Box>
                    </Collapse>
                  </Box>
                )}
              </CardContent>

              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  variant='contained'
                  sx={{
                    bgcolor: 'rgba(255,213,0,0.3)',
                    color: 'grey.600',
                    fontWeight: 'bold',
                    width: isMobile ? '90%' : 250,
                    cursor: 'not-allowed',
                  }}
                >
                  Access DAAS Services
                </Button>
              </CardActions>
            </Card>
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default Home

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  useTheme,
  useMediaQuery,
  Tooltip,
  Snackbar,
  Button,
} from '@mui/material'

import MenuIcon from '@mui/icons-material/Menu'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import HistoryIcon from '@mui/icons-material/History'
import LogoutIcon from '@mui/icons-material/Logout'

import { useUserAuth } from '../context/appstate/UserAuthContext'
import { imagesrc } from '../constants'

const Header = () => {
  const navigate = useNavigate()
  const { logout } = useUserAuth()
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))

  // Left menu (small devices)
  const [anchorLeft, setAnchorLeft] = useState(null)
  const openLeft = Boolean(anchorLeft)

  // Logout snackbar
  const [openLogoutSnackbar, setOpenLogoutSnackbar] = useState(false)

  const handleLeftMenuOpen = (e) => setAnchorLeft(e.currentTarget)
  const handleLeftMenuClose = () => setAnchorLeft(null)

  const handleLogout = () => setOpenLogoutSnackbar(true)

  const handleCloseLogout = (_, reason) => {
    if (reason === 'clickaway') return
    setOpenLogoutSnackbar(false)
  }

  const handleConfirmLogout = () => {
    setOpenLogoutSnackbar(false)
    logout()
    navigate('/')
  }

  return (
    <AppBar
      position='static'
      elevation={0}
      sx={{
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        boxShadow: 'none',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 4,
        }}
      >
        {/* Small screens menu icon */}
        {isSmall ? (
          <>
            <IconButton
              edge='start'
              onClick={handleLeftMenuOpen}
              aria-label='menu'
              sx={{ color: '#FFFFFF' }}
            >
              <MenuIcon />
            </IconButton>

            {/* Small-screen menu */}
            <Menu
              anchorEl={anchorLeft}
              open={openLeft}
              onClose={handleLeftMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              PaperProps={{
                sx: {
                  bgcolor: theme.palette.background.default,
                  color: '#FFFFFF',
                },
              }}
            >
              {/* Profile */}
              <MenuItem
                onClick={() => {
                  handleLeftMenuClose()
                  navigate('/profile')
                }}
                sx={{ color: '#FFFFFF' }}
              >
                <ListItemIcon sx={{ color: '#FFFFFF' }}>
                  <AccountCircleIcon fontSize='small' />
                </ListItemIcon>
                Profile
              </MenuItem>

              {/* History */}
              <MenuItem
                onClick={() => {
                  handleLeftMenuClose()
                  navigate('/history')
                }}
                sx={{ color: '#FFFFFF' }}
              >
                <ListItemIcon sx={{ color: '#FFFFFF' }}>
                  <HistoryIcon fontSize='small' />
                </ListItemIcon>
                Transactions History
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box
            display='flex'
            alignItems='center'
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/home')}
          >
            <Box
              component='img'
              src={imagesrc.logo}
              alt='logo'
              sx={{ height: 36, mr: 1 }}
            />
          </Box>
        )}

        {/* Center logo for mobile */}
        {isSmall && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <Box
              component='img'
              src={imagesrc.logo}
              alt='logo'
              sx={{ height: 36, pointerEvents: 'auto' }}
              onClick={() => navigate('/home')}
            />
          </Box>
        )}

        {/* Right actions */}
        <Box display='flex' alignItems='center' gap={2}>
          {isSmall ? (
            <Tooltip title='Logout'>
              <IconButton onClick={handleLogout} sx={{ color: '#FFFFFF' }}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              {/* Profile link (text) instead of avatar */}
              <Typography
                variant='body1'
                onClick={() => navigate('/profile')}
                sx={{
                  cursor: 'pointer',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Profile
              </Typography>

              {/* Transaction History text made white */}
              <Typography
                variant='body1'
                onClick={() => navigate('/history')}
                sx={{
                  cursor: 'pointer',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Transaction History
              </Typography>

              <Tooltip title='Logout'>
                <IconButton onClick={handleLogout} sx={{ color: '#FFFFFF' }}>
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Toolbar>

      {/* Logout snackbar */}
      <Snackbar
        open={openLogoutSnackbar}
        onClose={handleCloseLogout}
        autoHideDuration={8000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message='Are you sure you want to logout?'
        action={
          <>
            <Button color='inherit' size='small' onClick={handleCloseLogout}>
              Cancel
            </Button>
            <Button color='inherit' size='small' onClick={handleConfirmLogout}>
              Logout
            </Button>
          </>
        }
      />
    </AppBar>
  )
}

export default Header

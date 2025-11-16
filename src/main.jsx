import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, CssBaseline } from '@mui/material'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { theme } from './theme/theme.js'
import GlobalContextProvider from './context/GlobalContexProvider'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <GlobalContextProvider>
          <App />
        </GlobalContextProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
)

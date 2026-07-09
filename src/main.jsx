import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { AppProvider } from './context/AppContext'
import { ToastProvider } from './context/ToastContext'
import { ToastListener } from './components/ui/ToastListener'
import './styles/globals.css'
import App from './App.jsx'

registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <AppProvider>
        <ToastListener />
        <App />
      </AppProvider>
    </ToastProvider>
  </StrictMode>,
)

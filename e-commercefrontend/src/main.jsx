import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import CsrfProvider from './public/CsrfProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CsrfProvider>
      <App />
    </CsrfProvider>
  </StrictMode>,
)

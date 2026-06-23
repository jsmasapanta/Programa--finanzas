import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        gutter={10}
        toastOptions={{
          duration: 3500,
          style: {
            background: 'rgba(14,18,32,0.96)',
            color: '#E4E8F4',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '14px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            fontWeight: 500,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
            padding: '12px 16px',
          },
          success: { iconTheme: { primary: '#2EE086', secondary: 'rgba(14,18,32,0.96)' } },
          error:   { iconTheme: { primary: '#FF4D72', secondary: 'rgba(14,18,32,0.96)' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)

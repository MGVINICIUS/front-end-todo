import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from '@/Login'
import { ThemeProvider } from '@/components/theme-provider'
import Register from './Register'
import { AuthGuard } from '@/components/auth-guard'
import { Toaster } from 'sonner'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <Toaster richColors duration={3000} position='top-right' />
      <BrowserRouter>
        <Routes>
          <Route
            path='/'
            element={
              <AuthGuard requireAuth>
                <App />
              </AuthGuard>
            }
          />
          <Route
            path='/login'
            element={
              <AuthGuard>
                <Login />
              </AuthGuard>
            }
          />
          <Route
            path='/register'
            element={
              <AuthGuard>
                <Register />
              </AuthGuard>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)

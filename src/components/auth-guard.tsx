import { Navigate } from 'react-router-dom'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = false }: AuthGuardProps) {
  // Replace this with your actual auth check
  const isAuthenticated = !!localStorage.getItem('token')

  if (requireAuth && !isAuthenticated) {
    return <Navigate to='/login' replace />
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to='/' replace />
  }

  return <>{children}</>
}

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { SuccessToast } from './success-toast'

interface SignOutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function SignOutButton({ variant = 'default', size = 'default' }: SignOutButtonProps) {
  const navigate = useNavigate()

  const handleSignOut = () => {
    // Clear authentication
    localStorage.removeItem('token')

    // Show success toast
    toast.custom(() => <SuccessToast message='Successfully signed out!' />)

    // Navigate to login
    navigate('/login')
  }

  return (
    <Button variant={variant} size={size} onClick={handleSignOut} className='gap-2'>
      <LogOut className='h-4 w-4' />
      Sign out
    </Button>
  )
}

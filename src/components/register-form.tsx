import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { SuccessToast } from '@/components/success-toast'
import { Eye, EyeOff } from 'lucide-react'

// Define the validation schema
const registerSchema = z
  .object({
    username: z.string().min(2, 'Username must be at least 2 characters'),
    email: z.string()
      .min(5, 'Email must be at least 5 characters')
      .max(254, 'Email must be less than 254 characters')
      .email('Please enter a valid email address')
      .trim()
      .refine(email => !email.includes(' '), 'Email cannot contain spaces'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// Infer the type from the schema
type RegisterFormData = z.infer<typeof registerSchema>

// Add these type definitions at the top of the file
type ApiErrorResponse = {
  message: string
}

export function RegisterForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)
      setServerError(null)

      const apiUrl = `${import.meta.env.VITE_API_URL}/auth/register`

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      })

      const responseData = (await response.json()) as ApiErrorResponse

      if (!response.ok) {
        throw new Error(responseData.message || 'Registration failed')
      }

      // Add success toast
      toast.custom(() => <SuccessToast message='Account successfully created!' />)

      navigate('/login')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>Create an Account</CardTitle>
          <CardDescription>Enter your details below to create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              void handleSubmit(onSubmit)(e)
            }}
          >
            <div className='flex flex-col gap-6'>
              {serverError && (
                <div className='bg-destructive/15 text-destructive text-sm p-3 rounded-md'>
                  {serverError}
                </div>
              )}
              <div className='grid gap-2'>
                <Label htmlFor='username'>Username</Label>
                <Input id='username' {...register('username')} placeholder='username' />
                {errors.username && (
                  <p className='text-sm text-destructive'>{errors.username.message}</p>
                )}
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='email'>Email</Label>
                <Input id='email' {...register('email')} placeholder='m@example.com' />
                {errors.email && <p className='text-sm text-destructive'>{errors.email.message}</p>}
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='password'>Password</Label>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    className='transition-all duration-200 ease-in-out'
                    {...register('password')}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent hover:scale-110 transition-all duration-200'
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <div className='relative w-4 h-4'>
                      <EyeOff
                        className={`h-4 w-4 absolute transition-all duration-200 ${
                          showPassword ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
                        }`}
                      />
                      <Eye
                        className={`h-4 w-4 absolute transition-all duration-200 ${
                          showPassword ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'
                        }`}
                      />
                    </div>
                  </Button>
                </div>
                {errors.password && (
                  <p className='text-sm text-destructive'>{errors.password.message}</p>
                )}
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='confirmPassword'>Confirm Password</Label>
                <div className='relative'>
                  <Input
                    id='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    className='transition-all duration-200 ease-in-out'
                    {...register('confirmPassword')}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent hover:scale-110 transition-all duration-200'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    <div className='relative w-4 h-4'>
                      <EyeOff
                        className={`h-4 w-4 absolute transition-all duration-200 ${
                          showConfirmPassword ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
                        }`}
                      />
                      <Eye
                        className={`h-4 w-4 absolute transition-all duration-200 ${
                          showConfirmPassword ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'
                        }`}
                      />
                    </div>
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className='text-sm text-destructive'>{errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>
            <div className='mt-4 text-center text-sm'>
              Already have an account?{' '}
              <Link to='/login' className='underline underline-offset-4'>
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

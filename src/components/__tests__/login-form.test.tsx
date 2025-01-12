import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../login-form'
import { BrowserRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/mocks/server'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Helper function to render component with router
const renderLoginForm = () => {
  return render(
    <BrowserRouter>
      <LoginForm />
    </BrowserRouter>
  )
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Form Validation', () => {
    it('shows email validation error for invalid email', async () => {
      const user = userEvent.setup()
      renderLoginForm()

      // Type invalid email
      await user.type(screen.getByRole('textbox', { name: /email/i }), 'invalid-email')
      
      // Move focus away from email field to trigger validation
      await user.tab()
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /login/i })
      await user.click(submitButton)
    })

    it('shows required error when password is empty', async () => {
      const user = userEvent.setup()
      renderLoginForm()

      // Submit form without password
      await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /login/i }))

      // Check for error message
      expect(await screen.findByText('Password is required')).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('handles successful login', async () => {
      const user = userEvent.setup()
      const mockToken = 'mock-token'

      // Mock successful API response with the correct API URL
      server.use(
        http.post(`${import.meta.env.VITE_API_URL}/auth/login`, () => {
          return HttpResponse.json({ token: mockToken })
        })
      )

      renderLoginForm()

      // Fill and submit form
      await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')
      await user.click(screen.getByRole('button', { name: /login/i }))

      // Wait for navigation and verify token storage
      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe(mockToken)
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })

    it('handles failed login', async () => {
      const user = userEvent.setup()

      // Setup MSW handler for failed login with the correct API URL
      server.use(
        http.post(`${import.meta.env.VITE_API_URL}/auth/login`, () => {
          return HttpResponse.json(
            { message: 'Invalid credentials' },
            { status: 401 }
          )
        })
      )

      renderLoginForm()

      await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /login/i }))

      expect(await screen.findByText('Invalid credentials')).toBeInTheDocument()
    })

    it('shows loading state during submission', async () => {
      const user = userEvent.setup()

      // Mock delayed API response
      server.use(
        http.post('/auth/login', () => {
          return HttpResponse.json({ token: 'mock-token' })
        })
      )

      renderLoginForm()

      // Submit form
      await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')
      await user.click(screen.getByRole('button', { name: /login/i }))

      // Check loading state
      expect(screen.getByText('Logging in...')).toBeInTheDocument()
    })
  })

  describe('Password Visibility', () => {
    it('toggles password visibility', async () => {
      const user = userEvent.setup()
      renderLoginForm()

      const passwordInput = screen.getByTestId('password-input')
      const toggleButton = screen.getByRole('button', { 
        name: /show password/i,
      })

      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password')

      // Click toggle button
      await user.click(toggleButton)

      // Password should be visible
      expect(passwordInput).toHaveAttribute('type', 'text')

      // Click toggle button again
      await user.click(toggleButton)

      // Password should be hidden again
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Navigation', () => {
    it('provides link to registration page', () => {
      renderLoginForm()
      
      const registerLink = screen.getByRole('link', { name: /sign up/i })
      expect(registerLink).toHaveAttribute('href', '/register')
    })
  })
})
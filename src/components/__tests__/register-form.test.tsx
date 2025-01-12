import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterForm } from '../register-form'
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

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    custom: vi.fn(),
  },
}))

// Helper function to render component with router
const renderRegisterForm = () => {
  return render(
    <BrowserRouter>
      <RegisterForm />
    </BrowserRouter>
  )
}

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Form Validation', () => {
    it('shows validation errors for invalid inputs', async () => {
      const user = userEvent.setup()
      renderRegisterForm()

      // Submit empty form
      await user.click(screen.getByRole('button', { name: /create account/i }))

      // Check for validation errors
      expect(await screen.findByText('Username must be at least 2 characters')).toBeInTheDocument()
      expect(await screen.findByText('Email must be at least 5 characters')).toBeInTheDocument()
      expect(await screen.findByText('Password must be at least 6 characters')).toBeInTheDocument()
    })

    it('shows password complexity validation error', async () => {
      const user = userEvent.setup()
      renderRegisterForm()

      // Using getElementById for more reliable selection
      const passwordInput = document.getElementById('password')
      if (!passwordInput) throw new Error('Password input not found')
      
      await user.type(passwordInput, 'simple')
      await user.click(screen.getByRole('button', { name: /create account/i }))

      expect(await screen.findByText(/Password must contain at least one uppercase letter/)).toBeInTheDocument()
    })

    it('shows password matching error', async () => {
      const user = userEvent.setup()
      renderRegisterForm()

      // Enter different passwords
      await user.type(screen.getByLabelText(/^password$/i), 'ValidPass1')
      await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPass1')
      
      // Submit form to trigger validation
      await user.click(screen.getByRole('button', { name: /create account/i }))

      expect(await screen.findByText("Passwords don't match")).toBeInTheDocument()
    })
  })

  describe('Password Visibility', () => {
    it('toggles both password fields visibility', async () => {
      const user = userEvent.setup()
      renderRegisterForm()

      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const toggleButtons = screen.getAllByRole('button', { name: /show password/i })

      // Initially passwords should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(confirmPasswordInput).toHaveAttribute('type', 'password')

      // Toggle password visibility
      await user.click(toggleButtons[0])
      expect(passwordInput).toHaveAttribute('type', 'text')

      // Toggle confirm password visibility
      await user.click(toggleButtons[1])
      expect(confirmPasswordInput).toHaveAttribute('type', 'text')
    })
  })

  describe('Form Submission', () => {
    it('handles successful registration', async () => {
      const user = userEvent.setup()

      server.use(
        http.post(`${import.meta.env.VITE_API_URL}/auth/register`, () => {
          return HttpResponse.json({ message: 'Registration successful' })
        })
      )

      renderRegisterForm()

      // Fill form with valid data
      await user.type(screen.getByLabelText(/username/i), 'testuser')
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'ValidPass1')
      await user.type(screen.getByLabelText(/confirm password/i), 'ValidPass1')
      await user.click(screen.getByRole('button', { name: /create account/i }))

      // Verify navigation to login page
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login')
      })
    })

    it('handles registration failure', async () => {
      const user = userEvent.setup()

      server.use(
        http.post(`${import.meta.env.VITE_API_URL}/auth/register`, () => {
          return HttpResponse.json(
            { message: 'Email already exists' },
            { status: 400 }
          )
        })
      )

      renderRegisterForm()

      // Fill and submit form
      await user.type(screen.getByLabelText(/username/i), 'testuser')
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'ValidPass1')
      await user.type(screen.getByLabelText(/confirm password/i), 'ValidPass1')
      await user.click(screen.getByRole('button', { name: /create account/i }))

      expect(await screen.findByText('Email already exists')).toBeInTheDocument()
    })

    it('shows loading state during submission', async () => {
      const user = userEvent.setup()

      server.use(
        http.post(`${import.meta.env.VITE_API_URL}/auth/register`, async () => {
          await new Promise(resolve => setTimeout(resolve, 100))
          return HttpResponse.json({ message: 'Success' })
        })
      )

      renderRegisterForm()

      // Fill and submit form
      await user.type(screen.getByLabelText(/username/i), 'testuser')
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'ValidPass1')
      await user.type(screen.getByLabelText(/confirm password/i), 'ValidPass1')
      await user.click(screen.getByRole('button', { name: /create account/i }))

      expect(screen.getByText('Creating Account...')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('provides link to login page', () => {
      renderRegisterForm()
      
      const loginLink = screen.getByRole('link', { name: /login/i })
      expect(loginLink).toHaveAttribute('href', '/login')
    })
  })
}) 
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import Todo from '../Todo'
import { TodoProvider } from '@/contexts/TodoContext'
import { todoApi } from '@/services/todoApi'
import { toast } from 'sonner'

// Mock dependencies
vi.mock('@/services/todoApi')
vi.mock('sonner')

// Mock data
const mockTasks = [
  {
    id: '1',
    title: 'Test Task 1',
    description: 'Test Description 1',
    completed: false,
    dueDate: '2024-03-20T10:00:00.000Z',
  },
  {
    id: '2',
    title: 'Test Task 2',
    description: 'Test Description 2',
    completed: true,
    dueDate: '2024-03-21T11:00:00.000Z',
  },
]

// Helper function to render component with context
const renderTodo = () => {
  return render(
    <TodoProvider>
      <Todo />
    </TodoProvider>
  )
}

describe('Todo Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock implementations
    vi.mocked(todoApi.getTodos).mockResolvedValue(mockTasks)
    vi.mocked(todoApi.createTodo).mockImplementation(async (newTask) => ({
      id: '3',
      ...newTask,
      completed: false,
      time: '10:00 AM',
    }))
  })

  describe('Initial Rendering', () => {
    it('shows loading state initially', () => {
      renderTodo()
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('displays tasks after loading', async () => {
      renderTodo()
      await waitFor(() => {
        expect(screen.getByText('Test Task 1')).toBeInTheDocument()
        expect(screen.getByText('Test Description 1')).toBeInTheDocument()
        // Check for due date
        expect(screen.getByText(/Mar 20, 2024/)).toBeInTheDocument()
      })
    })

    it('shows empty state when no tasks exist', async () => {
      vi.mocked(todoApi.getTodos).mockResolvedValueOnce([])
      renderTodo()
      await waitFor(() => {
        expect(screen.getByText(/No tasks yet/)).toBeInTheDocument()
        expect(screen.getByText(/Add your first task using the button above/)).toBeInTheDocument()
      })
    })

    it('shows error state when API fails', async () => {
      vi.mocked(todoApi.getTodos).mockRejectedValueOnce(new Error('API Error'))
      renderTodo()
      await waitFor(() => {
        expect(screen.getByText('Failed to fetch tasks')).toBeInTheDocument()
        expect(screen.getByText(/Try adding your first task/)).toBeInTheDocument()
      })
    })
  })

  describe('Task Operations', () => {
    it('can add a new task', async () => {
      const user = userEvent.setup()
      renderTodo()

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Test Task 1')).toBeInTheDocument()
      })

      // Find and click the Add Task button
      const addButton = screen.getByRole('button', { name: /add new task/i })
      await user.click(addButton)

      // Wait for dialog to appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Fill form fields using correct placeholders
      await user.type(screen.getByPlaceholderText('Enter your task'), 'New Task')
      await user.type(screen.getByPlaceholderText('Enter task description'), 'New Description')
      
      // Find and click the Create Task button
      const saveButton = screen.getByRole('button', { name: /create task/i })
      await user.click(saveButton)

      // Verify API call and toast
      expect(todoApi.createTodo).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Task',
        description: 'New Description',
      }))
      expect(toast.custom).toHaveBeenCalled()
    })

    it('can toggle task completion', async () => {
      const user = userEvent.setup()
      renderTodo()

      await waitFor(() => {
        expect(screen.getByText('Test Task 1')).toBeInTheDocument()
      })

      // Find and click the toggle button (Circle icon for incomplete task)
      const toggleButton = screen.getAllByRole('button')[1] // First task's toggle
      await user.click(toggleButton)

      // Verify API call
      expect(todoApi.updateTodo).toHaveBeenCalledWith('1', { completed: true })
      expect(toast.custom).toHaveBeenCalled()
    })

    it('can delete a task', async () => {
      const user = userEvent.setup()
      renderTodo()

      await waitFor(() => {
        expect(screen.getByText('Test Task 1')).toBeInTheDocument()
      })

      // Find the more button by its icon role
      const moreButtons = screen.getAllByRole('button', { 
        name: /more/i, 
        hidden: true  // Include hidden elements since the button is opacity-0 by default
      })
      await user.click(moreButtons[0])

      // Click Remove Task in dropdown
      const removeButton = screen.getByRole('menuitem', { name: /remove task/i })
      await user.click(removeButton)

      // Verify API call
      expect(todoApi.deleteTodo).toHaveBeenCalledWith('1')
      expect(toast.custom).toHaveBeenCalled()
    })

    it('can edit a task', async () => {
      const user = userEvent.setup()
      renderTodo()

      await waitFor(() => {
        expect(screen.getByText('Test Task 1')).toBeInTheDocument()
      })

      // Find the more button by its icon role
      const moreButtons = screen.getAllByRole('button', { 
        name: /more/i, 
        hidden: true 
      })
      await user.click(moreButtons[0])

      // Click Edit Task in dropdown
      const editButton = screen.getByRole('menuitem', { name: /edit task/i })
      await user.click(editButton)

      // Update task in dialog
      const titleInput = screen.getByDisplayValue('Test Task 1')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Task')
      
      // Save changes
      await user.click(screen.getByRole('button', { name: /save/i }))

      // Verify API call
      expect(todoApi.updateTodo).toHaveBeenCalledWith('1', expect.objectContaining({
        title: 'Updated Task'
      }))
      expect(toast.custom).toHaveBeenCalled()
    })
  })
})
import { createContext, useContext, useReducer, ReactNode } from 'react'
import { Task, ListData } from '@/types/todo'

// Define the shape of our todo state
interface TodoState {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  listData: ListData
  selectedTask: Task | null
  editDialogOpen: boolean
}

interface TodoProviderProps {
  children: ReactNode
  initialState?: TodoState
}

// Define all possible actions that can be dispatched
type TodoAction =
  | { type: 'FETCH_TODOS_START' }                    // Start loading todos
  | { type: 'FETCH_TODOS_SUCCESS'; payload: Task[] } // Successfully fetched todos
  | { type: 'FETCH_TODOS_ERROR'; payload: string }   // Error fetching todos
  | { type: 'ADD_TODO'; payload: Task }              // Add a new todo
  | { type: 'UPDATE_TODO'; payload: Task }           // Update existing todo
  | { type: 'DELETE_TODO'; payload: string }         // Delete todo by id
  | { type: 'SET_SELECTED_TASK'; payload: Task | null } // Set task for editing
  | { type: 'TOGGLE_EDIT_DIALOG'; payload: boolean }    // Toggle edit dialog

// Initial state for the todo context
const initialState: TodoState = {
  tasks: [],
  isLoading: false,
  error: null,
  listData: {
    title: "Today's Tasks",
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    progress: {
      completed: 0,
      total: 0
    }
  },
  selectedTask: null,
  editDialogOpen: false
}

// Reducer function to handle all state updates
const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    // Handle loading state when fetching todos
    case 'FETCH_TODOS_START':
      return { ...state, isLoading: true, error: null }

    // Handle successful todo fetch
    case 'FETCH_TODOS_SUCCESS':
      return {
        ...state,
        tasks: action.payload,
        isLoading: false,
        error: null,
        listData: {
          ...state.listData,
          progress: {
            completed: action.payload.filter(t => t.completed).length,
            total: action.payload.length
          }
        }
      }

    // Handle error in fetching todos
    case 'FETCH_TODOS_ERROR':
      return { ...state, isLoading: false, error: action.payload }

    // Handle adding a new todo
    case 'ADD_TODO': {
      const newTasks = [...state.tasks, action.payload]
      return {
        ...state,
        tasks: newTasks,
        listData: {
          ...state.listData,
          progress: {
            completed: newTasks.filter(t => t.completed).length,
            total: newTasks.length
          }
        }
      } }

    // Handle updating an existing todo
    case 'UPDATE_TODO': {
      const updatedTasks = state.tasks.map(t => 
        t.id === action.payload.id ? action.payload : t
      )
      return {
        ...state,
        tasks: updatedTasks,
        listData: {
          ...state.listData,
          progress: {
            completed: updatedTasks.filter(t => t.completed).length,
            total: updatedTasks.length
          }
        }
      } }

    // Handle deleting a todo
    case 'DELETE_TODO': {
      const remainingTasks = state.tasks.filter(t => t.id !== action.payload)
      return {
        ...state,
        tasks: remainingTasks,
        listData: {
          ...state.listData,
          progress: {
            completed: remainingTasks.filter(t => t.completed).length,
            total: remainingTasks.length
          }
        }
      } }

    // Handle selecting a task for editing
    case 'SET_SELECTED_TASK':
      return { ...state, selectedTask: action.payload }

    // Handle toggling the edit dialog
    case 'TOGGLE_EDIT_DIALOG':
      return { ...state, editDialogOpen: action.payload }

    // Return current state for unknown actions
    default:
      return state
  }
}

// Create the context with type information
const TodoContext = createContext<{
  state: TodoState
  dispatch: React.Dispatch<TodoAction>
} | null>(null)

// Provider component that wraps the app
export function TodoProvider({ children, initialState }: TodoProviderProps) {
  // Initialize the reducer with initial state
  const [state, dispatch] = useReducer(todoReducer, initialState || {
    tasks: [],
    isLoading: true,
    error: null,
    listData: {
      title: 'Today',
      date: new Date().toLocaleDateString(),
      progress: { completed: 0, total: 0 }
    },
    selectedTask: null,
    editDialogOpen: false
  })

  return (
    <TodoContext.Provider value={{ state, dispatch }}>
      {children}
    </TodoContext.Provider>
  )
}

// Custom hook for accessing todo context
export const useTodo = () => {
  const context = useContext(TodoContext)
  if (!context) {
    throw new Error('useTodo must be used within a TodoProvider')
  }
  return context
} 
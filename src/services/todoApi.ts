import axios, { AxiosError } from 'axios'
import { Task, NewTask } from '@/types/todo'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add logging to request interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    // Check token expiration
    const [, payload] = token.split('.')
    const decodedPayload = JSON.parse(atob(payload))

    // If token is expired, remove it and redirect to login
    if (decodedPayload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      return Promise.reject('Token expired')
    }

    const cleanToken = token.replace(/^bearer\s+/i, '').trim()
    config.headers['Authorization'] = `Bearer ${cleanToken}`
  } else {
    console.warn('No token found in localStorage')
  }
  return config
})

// Simplified response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// Helper function for time formatting
const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

interface APITodo {
  uuid: string
  title: string
  description: string
  completed: boolean
  dueDate: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  userUuid: string
}

export const todoApi = {
  async getTodos(): Promise<Task[]> {
    try {
      const response = await axiosInstance.get('/todos')
      return (response.data.todos || []).map((todo: APITodo) => ({
        id: todo.uuid,
        title: todo.title,
        description: todo.description || '',
        completed: todo.completed || false,
        dueDate: todo.dueDate,
        time: formatTime(todo.dueDate),
      }))
    } catch (error) {
      console.error('Failed to fetch todos:', error)
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response?.data) // Debug error response
        console.error('Status:', error.response?.status)
      }
      return []
    }
  },

  async createTodo(newTask: NewTask) {
    const todoData = {
      title: newTask.title,
      description: newTask.description || '',
      dueDate: new Date(newTask.dueDate).toISOString(),
    }

    const response = await axiosInstance.post('/todos', todoData)
    const todo = response.data.todo

    return {
      id: todo.uuid,
      title: todo.title,
      description: todo.description || '',
      completed: todo.completed || false,
      dueDate: todo.dueDate,
      time: formatTime(todo.dueDate),
    }
  },

  async updateTodo(id: string, updates: Partial<Task>) {
    const response = await axiosInstance.put(`/todos/${id}`, updates)
    return {
      id: response.data.uuid,
      title: response.data.title,
      description: response.data.description || '',
      completed: response.data.completed || false,
      dueDate: response.data.dueDate,
      time: formatTime(response.data.dueDate),
    }
  },

  async deleteTodo(id: string) {
    await axiosInstance.delete(`/todos/${id}`)
  },
}

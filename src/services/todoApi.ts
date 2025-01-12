import axios, { AxiosError } from 'axios';
import { Task, NewTask } from '@/types/todo';

// Debug the environment variable
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Log the final base URL
console.log('Final API_BASE_URL:', API_BASE_URL);

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Test backend connectivity
const testBackendConnection = async () => {
    try {
        console.log('Testing backend connection...');
        const response = await axios.get('http://localhost:8000/health');
        console.log('Backend health check response:', response.data);
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('Connection test failed:', {
                url: error.config?.url,
                status: error.response?.status,
                data: error.response?.data
            });
        }
    }
};

// Call health check immediately
testBackendConnection();

// Add request debugging
axiosInstance.interceptors.request.use((config) => {
    // Debug token
    const token = localStorage.getItem('token');
    console.log('Raw token from storage:', token);
    
    if (token) {
        // Remove any existing 'bearer' or 'Bearer' prefix
        const cleanToken = token.replace(/^bearer\s+/i, '').trim();
        
        // Set the Authorization header with proper casing
        config.headers['Authorization'] = `Bearer ${cleanToken}`;
        
        // Debug the final header
        console.log('Raw Authorization header:', config.headers['Authorization']);
        console.log('Headers:', {
            ...config.headers,
            Authorization: config.headers['Authorization']
        });
    } else {
        console.warn('No token found in storage');
    }

    console.log('Full request URL:', `${config.baseURL}${config.url}`);
    console.log('Complete request config:', {
        method: config.method,
        headers: config.headers,
        data: config.data,
        url: config.url,
        baseURL: config.baseURL
    });
    
    return config;
});

// Handle unauthorized responses with more detailed error logging
axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        console.error('Response error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers,
            requestHeaders: error.config?.headers,
            url: error.config?.url,
            method: error.config?.method
        });
        
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('Unauthorized request - redirecting to login');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

interface APITodo {
    uuid: string;
    title: string;
    description: string;
    completed: boolean;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    userUuid: string;
}

export const todoApi = {
    async getTodos(): Promise<Task[]> {
        try {
            const response = await axiosInstance.get('/todos');
            console.log('Raw API response:', response.data);

            // Access the nested todos array
            const todosData = response.data.todos || [];
            console.log('Todos array:', todosData);

            // Map API response to our Task interface
            const todos = todosData.map((todo: APITodo) => ({
                id: todo.uuid,
                title: todo.title,
                description: todo.description || '',
                completed: todo.completed || false,
                dueDate: todo.dueDate,
                time: new Date(todo.dueDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            }));

            console.log('Mapped todos:', todos);
            return todos;
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Failed to fetch todos:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    url: error.config?.url
                });
            }
            return [];
        }
    },

    async createTodo(newTask: NewTask) {
        try {
            // Format the date properly
            const formattedDate = new Date(newTask.dueDate).toISOString();
            
            // Prepare the data with properly formatted date
            const todoData = {
                title: newTask.title,
                description: newTask.description || '',
                dueDate: formattedDate
            };

            console.log('Sending todo data to API:', todoData);

            const response = await axiosInstance.post('/todos', todoData);
            
            // Add more detailed response logging
            console.log('Raw API Response:', response);
            console.log('Response status:', response.status);
            console.log('Response data:', response.data);

            // Check if response has the expected structure
            if (!response.data || !response.data.todo) {
                console.error('Invalid response structure:', response.data);
                throw new Error('Invalid server response structure');
            }

            const createdTodoData = response.data.todo;
            
            // Log the transformed data
            console.log('Transformed todo data:', createdTodoData);

            return {
                id: createdTodoData.uuid,
                title: createdTodoData.title,
                description: createdTodoData.description || '',
                completed: createdTodoData.completed || false,
                dueDate: createdTodoData.dueDate,
                time: new Date(createdTodoData.dueDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };
        } catch (error) {
            // Enhanced error logging
            console.error('Failed to create todo:', error);
            if (error instanceof AxiosError) {
                console.error('API Error details:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    headers: error.response?.headers,
                    requestConfig: {
                        url: error.config?.url,
                        method: error.config?.method,
                        data: error.config?.data,
                        headers: error.config?.headers
                    }
                });
            }
            throw error;
        }
    },

    async updateTodo(id: string, updates: Partial<Task>) {
        try {
            const response = await axiosInstance.put(`/todos/${id}`, updates);
            return {
                id: response.data.uuid,
                title: response.data.title,
                description: response.data.description || '',
                completed: response.data.completed || false,
                dueDate: response.data.dueDate,
                priority: response.data.priority || 'medium',
                isUrgent: response.data.priority === 'high',
                time: new Date(response.data.dueDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Failed to update todo:', error.response?.data);
            }
            throw error;
        }
    },

    async deleteTodo(id: string) {
        try {
            await axiosInstance.delete(`/todos/${id}`);
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Failed to delete todo:', error.response?.data);
            }
            throw error;
        }
    }
}; 
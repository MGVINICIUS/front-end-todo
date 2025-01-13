# Todo Application

A modern, full-stack Todo application built with React, TypeScript, and Vite. Manage your tasks with features like due dates, descriptions, and real-time updates.

## Features

- ✨ Create, read, update, and delete todos
- 🔒 Secure authentication system
- ⏰ Task scheduling with due dates and times
- 📝 Detailed task descriptions
- 🎯 Task completion tracking
- 🔄 Real-time updates
- 📱 Responsive design

## Tech Stack

- **Frontend:**

  - React
  - TypeScript
  - Vite
  - Axios for API calls
  - TailwindCSS for styling
  - Shadcn/UI for components
  - Vitest for testing
  - Eslint for linting
  - Prettier for code formatting
  - React-hook-form for form handling
  - Zod for data validation
  - React-router-dom for navigation

- **Authentication:**
  - JWT (Token-based authentication)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- API server running (default: localhost:8000)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/MGVINICIUS/front-end-todo.git
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

4. Start the development server:

```bash
pnpm run dev
```

## API Documentation

### Endpoints

- `GET /todos` - Fetch all todos
- `POST /todos` - Create a new todo
- `PUT /todos/:id` - Update a todo
- `DELETE /todos/:id` - Delete a todo

### Todo Object Structure

```typescript
interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  dueDate: string
  time: string
}
```

## Environment Variables

| Variable     | Description  | Default                      |
| ------------ | ------------ | ---------------------------- |
| VITE_API_URL | API base URL | http://localhost:8000/api/v1 |

## Development

This project uses Vite with HMR (Hot Module Replacement) and includes ESLint configuration.

### Available Commands


#### Building
```bash
# Build the application
pnpm build
```

#### Testing
```bash
# Run tests in watch mode
pnpm test
```

#### Code Formatting
```bash
# Check code formatting
pnpm format

# Fix code formatting issues
pnpm format:fix
```

### ESLint Configuration

For production applications, enable type-aware lint rules:

1. Configure parserOptions:

```js
export default tseslint.config({
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

2. Install and configure eslint-plugin-react:

```js
import react from 'eslint-plugin-react'

export default tseslint.config({
  settings: { react: { version: '18.3' } },
  plugins: {
    react,
  },
  rules: {
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

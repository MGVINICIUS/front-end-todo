import { render as rtlRender } from '@testing-library/react'
import { TodoProvider } from '@/contexts/TodoContext'
import { ReactElement } from 'react'

function render(ui: ReactElement, { ...options } = {}) {
  return rtlRender(ui, {
    wrapper: ({ children }) => <TodoProvider>{children}</TodoProvider>,
    ...options,
  })
}

export * from '@testing-library/react'
export { render } 
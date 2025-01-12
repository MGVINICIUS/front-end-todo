import { http, HttpResponse } from 'msw'

const API_URL = 'http://localhost:8000/api/v1'

export const handlers = [
  http.get(`${API_URL}/todos`, () => {
    return HttpResponse.json({
      todos: [
        {
          uuid: '1',
          title: 'Test Task 1',
          description: 'Test Description 1',
          completed: false,
          dueDate: '2024-03-20T10:00:00.000Z',
          createdAt: '2024-03-20T10:00:00.000Z',
          updatedAt: '2024-03-20T10:00:00.000Z',
          deletedAt: null,
          userUuid: 'user-1',
        },
      ],
    })
  }),
] 
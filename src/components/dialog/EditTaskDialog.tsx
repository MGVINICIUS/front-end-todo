'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Task } from '@/types/todo'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const MAX_DATE = new Date(2038, 0, 19, 3, 14, 7)

const taskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .default(''),
  dueDate: z.string()
    .refine(
      (date) => !date || new Date(date) <= MAX_DATE,
      'Date cannot be later than January 19, 2038 03:14:07'
    )
    .optional()
    .default('')
})

type FormData = z.infer<typeof taskSchema>

interface EditTaskDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditTask: (taskId: string, updatedTask: Partial<Task>) => void
}

export function EditTaskDialog({ task, open, onOpenChange, onEditTask }: EditTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
    },
  })

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)

      const updatedTask = {
        title: data.title.trim(),
        description: data.description?.trim() || '',
        dueDate: data.dueDate || new Date().toISOString(),
      }

      await onEditTask(task.id, updatedTask)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to edit task:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update task')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
            <DialogDescription>Make changes to your task here.</DialogDescription>
          </DialogHeader>
          <div className='flex flex-col gap-6 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='title'>Task</Label>
              <Input
                id='title'
                {...register('title', { required: true })}
                placeholder='Enter your task'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                {...register('description')}
                placeholder='Enter task description'
                className='resize-none'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='dueDate'>Due Date</Label>
              <Input
                id='dueDate'
                type='datetime-local'
                {...register('dueDate', {
                  validate: (value) => {
                    if (!value) return true
                    const date = new Date(value)
                    return date <= MAX_DATE || 'Date cannot be later than January 19, 2038 03:14:07'
                  },
                })}
                className={errors.dueDate ? 'border-red-500' : ''}
              />
              {errors.dueDate && <p className='text-sm text-red-500'>{errors.dueDate.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

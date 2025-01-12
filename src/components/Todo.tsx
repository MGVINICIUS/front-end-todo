import { cn } from "@/lib/utils";
import {
    CheckCircle2,
    Circle,
    Clock,
    MoreHorizontal,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { AddTaskDialog } from "@/components/dialog/Dialog";
import { todoApi } from '@/services/todoApi';
import { toast } from 'sonner';
import { SuccessToast } from '@/components/success-toast';
import { Task, NewTask } from '@/types/todo';
import { EditTaskDialog } from "@/components/dialog/EditTaskDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTodo } from '@/contexts/TodoContext'

export default function Todo() {
    // Get state and dispatch from TodoContext
    const { state, dispatch } = useTodo()
    
    // Local state for managing the edit dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    // Fetch tasks on component mount
    useEffect(() => {
        const fetchTasks = async () => {
            dispatch({ type: 'FETCH_TODOS_START' })
            try {
                const data = await todoApi.getTodos()
                dispatch({ type: 'FETCH_TODOS_SUCCESS', payload: data })
            } catch (error) {
                console.error('Failed to fetch tasks:', error)
                dispatch({ 
                    type: 'FETCH_TODOS_ERROR', 
                    payload: 'Failed to fetch tasks' 
                })
                toast.error('Failed to fetch tasks')
            }
        }
        fetchTasks()
    }, [dispatch])

    // Handler for adding new tasks
    const handleAddTask = async (newTask: NewTask) => {
        try {
            // Create task in the backend
            const createdTask = await todoApi.createTodo(newTask);
            
            // Update local state with the new task
            dispatch({ type: 'ADD_TODO', payload: createdTask });
            
            // Show success message
            toast.custom(() => (
                <SuccessToast message="Task added successfully" />
            ));
        } catch (error) {
            console.error('Failed to add task:', error);
            toast.error('Failed to add task');
        }
    };

    // Handler for toggling task completion status
    const toggleTaskCompletion = async (taskId: string) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;

        // Optimistic update - Update UI before API call
        dispatch({ type: 'UPDATE_TODO', payload: { ...task, completed: !task.completed } });

        try {
            // Update in the backend
            await todoApi.updateTodo(taskId, { completed: !task.completed });
            toast.custom(() => (
                <SuccessToast message="Task updated successfully" />
            ));
        } catch (error) {
            // Revert optimistic update on failure
            dispatch({ type: 'UPDATE_TODO', payload: task });
            toast.error('Failed to update task');
            console.error('Update error:', error);
        }
    };

    // Handler for deleting tasks
    const handleDeleteTask = async (id: string) => {
        try {
            // Delete from backend
            await todoApi.deleteTodo(id)
            // Update local state
            dispatch({ type: 'DELETE_TODO', payload: id })
            // Show success message
            toast.custom(() => (
                <SuccessToast message="Task deleted successfully!" />
            ))
        } catch (error) {
            console.error('Failed to delete task:', error)
            toast.error('Failed to delete task')
        }
    };

    // Handler for editing tasks
    const handleEditTask = async (taskId: string, updatedTask: Partial<Task>) => {
        // Find the current task
        const currentTask = state.tasks.find(t => t.id === taskId);
        if (!currentTask) return;

        // Optimistic update
        dispatch({ type: 'UPDATE_TODO', payload: { ...currentTask, ...updatedTask } });

        try {
            // Update in the backend
            await todoApi.updateTodo(taskId, updatedTask);
            toast.custom(() => (
                <SuccessToast message="Task updated successfully" />
            ));
        } catch (error) {
            // Revert optimistic update on failure
            dispatch({ type: 'UPDATE_TODO', payload: currentTask });
            toast.error('Failed to update task');
            console.error('Update error:', error);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Add Task Dialog Component */}
            <AddTaskDialog onAddTask={handleAddTask} />

            {/* Conditional Rendering based on state */}
            {state.isLoading ? (
                // Loading State
                <div className="flex justify-center items-center flex-1">
                    Loading...
                </div>
            ) : state.error ? (
                // Error State
                <div className="flex flex-col items-center justify-center flex-1">
                    <p className="text-red-500 mb-4">{state.error}</p>
                    <p className="text-muted-foreground">
                        Try adding your first task using the button above
                    </p>
                </div>
            ) : state.tasks.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center flex-1">
                    <p className="text-muted-foreground">
                        No tasks yet. Add your first task using the button above
                    </p>
                </div>
            ) : (
                // Tasks List
                <div className="flex-1">
                    {/* Header with List Info */}
                    <div className="p-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
                        <div>
                            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                                {state.listData.title}
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {state.listData.date}
                            </p>
                        </div>
                        {/* Progress Counter */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                {state.listData.progress.completed}/{state.listData.progress.total} done
                            </span>
                        </div>
                    </div>

                    {/* Scrollable Task List */}
                    <ScrollArea className="h-[calc(100vh-14rem)]">
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {/* Map through tasks */}
                            {state.tasks.map((task) => (
                                <div key={task.id} className="p-3 flex items-center gap-3 group">
                                    {/* Task Completion Toggle Button */}
                                    <button 
                                        type="button" 
                                        className="flex-none"
                                        onClick={() => toggleTaskCompletion(task.id)}
                                    >
                                        {task.completed ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
                                        )}
                                    </button>

                                    {/* Task Details */}
                                    <div className="flex-1 min-w-0">
                                        {/* Task Title */}
                                        <div className="flex items-center gap-2">
                                            <p className={cn(
                                                "text-sm",
                                                task.completed 
                                                    ? "text-zinc-400 dark:text-zinc-500 line-through"
                                                    : "text-zinc-900 dark:text-zinc-100"
                                            )}>
                                                {task.title}
                                            </p>
                                        </div>

                                        {/* Task Description (if exists) */}
                                        {task.description && (
                                            <p className={cn(
                                                "text-xs mt-0.5",
                                                task.completed
                                                    ? "text-zinc-400 dark:text-zinc-500 line-through"
                                                    : "text-zinc-500 dark:text-zinc-400"
                                            )}>
                                                {task.description}
                                            </p>
                                        )}

                                        {/* Due Date (for incomplete tasks) */}
                                        {!task.completed && (
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                                    <span className="text-xs text-zinc-500">
                                                        {new Date(task.dueDate).toLocaleString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            hour12: true
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Task Actions Dropdown (for incomplete tasks) */}
                                    {!task.completed && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                                {/* Edit Task Option */}
                                                <DropdownMenuItem
                                                    className="focus:bg-zinc-100 dark:focus:bg-zinc-800"
                                                    onSelect={(e) => {
                                                        e.preventDefault();
                                                        setSelectedTask(task);
                                                        setEditDialogOpen(true);
                                                    }}
                                                >
                                                    Edit Task
                                                </DropdownMenuItem>
                                                
                                                {/* Delete Task Option */}
                                                <DropdownMenuItem 
                                                    className="text-rose-500 focus:text-rose-500 focus:bg-zinc-100 dark:focus:bg-zinc-800"
                                                    onClick={() => handleDeleteTask(task.id)}
                                                >
                                                    Remove Task
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}

            {/* Edit Task Dialog */}
            {selectedTask && (
                <EditTaskDialog
                    task={selectedTask}
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    onEditTask={handleEditTask}
                />
            )}
        </div>
    );
}

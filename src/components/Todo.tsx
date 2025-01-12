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
import { Task, NewTask, ListData } from '@/types/todo';
import { EditTaskDialog } from "@/components/dialog/EditTaskDialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Todo() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [listData, setListData] = useState<ListData>({
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
    });
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Fetch initial data
    useEffect(() => {
        fetchTasks();
    }, []);

    // Update progress whenever tasks change
    useEffect(() => {
        setListData(prev => ({
            ...prev,
            progress: {
                completed: tasks.filter(t => t.completed).length,
                total: tasks.length
            }
        }));
    }, [tasks]);

    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            const data = await todoApi.getTodos();
            console.log('Fetched tasks:', data);
            setTasks(data);
        } catch (error) {
            setError('Failed to fetch tasks');
            toast.error('Failed to fetch tasks');
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTask = async (newTask: NewTask) => {
        try {
            const createdTask = await todoApi.createTodo(newTask);
            console.log('Created task:', createdTask);
            
            // Update local state with the new task
            setTasks(prevTasks => [...prevTasks, createdTask]);
            
            toast.custom(() => (
                <SuccessToast message="Task added successfully" />
            ));
            
            // Removed fetchTasks() call since it's redundant
        } catch (error) {
            console.error('Failed to add task:', error);
            toast.error('Failed to add task');
        }
    };

    const toggleTaskCompletion = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        // Optimistic update
        setTasks(tasks.map(t => 
            t.id === taskId ? { ...t, completed: !t.completed } : t
        ));

        try {
            await todoApi.updateTodo(taskId, { completed: !task.completed });
            toast.custom(() => (
                <SuccessToast message="Task updated successfully" />
            ));
            // Removed fetchTasks() since optimistic update is sufficient
        } catch (error) {
            // Revert on failure
            setTasks(tasks);
            toast.error('Failed to update task');
            console.error('Update error:', error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        // Optimistic delete
        setTasks(tasks.filter(t => t.id !== taskId));
        
        try {
            await todoApi.deleteTodo(taskId);
            toast.custom(() => (
                <SuccessToast message="Task deleted successfully" />
            ));
            // Refresh the list to ensure sync with server
            await fetchTasks();
        } catch (error) {
            // Revert on failure
            setTasks(tasks);
            toast.error('Failed to delete task');
            console.error('Delete error:', error);
        }
    };

    const handleEditTask = async (taskId: string, updatedTask: Partial<Task>) => {
        // Find the current task
        const currentTask = tasks.find(t => t.id === taskId);
        if (!currentTask) return;

        // Optimistic update
        setTasks(tasks.map(t => 
            t.id === taskId ? { ...t, ...updatedTask } : t
        ));

        try {
            await todoApi.updateTodo(taskId, updatedTask);
            toast.custom(() => (
                <SuccessToast message="Task updated successfully" />
            ));
            // Refresh the list to ensure sync with server
            await fetchTasks();
        } catch (error) {
            // Revert on failure
            setTasks(tasks);
            toast.error('Failed to update task');
            console.error('Update error:', error);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <AddTaskDialog onAddTask={handleAddTask} />
            {isLoading ? (
                <div className="flex justify-center items-center flex-1">
                    Loading...
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center flex-1">
                    <p className="text-red-500 mb-4">{error}</p>
                    <p className="text-muted-foreground">
                        Try adding your first task using the button above
                    </p>
                </div>
            ) : tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1">
                    <p className="text-muted-foreground">
                        No tasks yet. Add your first task using the button above
                    </p>
                </div>
            ) : (
                <div className="flex-1">
                    <div className="p-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
                        <div>
                            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                                {listData.title}
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {listData.date}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                {listData.progress.completed}/{listData.progress.total} done
                            </span>
                        </div>
                    </div>

                    <ScrollArea className="h-[calc(100vh-12rem)]">
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {tasks.map((task) => (
                                <div key={task.id} className="p-3 flex items-center gap-3 group">
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
                                    <div className="flex-1 min-w-0">
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

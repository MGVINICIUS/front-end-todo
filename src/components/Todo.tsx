import { cn } from "@/lib/utils";
import {
    CheckCircle2,
    Circle,
    Clock,
    Flag,
    MoreHorizontal,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AddTaskDialog } from "@/components/dialog/Dialog";

// Define types for our data
type Priority = 'low' | 'medium' | 'high';

interface Task {
    id: string;
    title: string;
    completed: boolean;
    time: string;
    priority?: Priority;
    isUrgent?: boolean;
}

interface ListData {
    title: string;
    date: string;
    progress: {
        completed: number;
        total: number;
    };
    tasks: Task[];
}

// Mock data
const mockData: ListData = {
    title: "Today's Tasks",
    date: "June 12, 2024",
    progress: {
        completed: 5,
        total: 8
    },
    tasks: [
        {
            id: "1",
            title: "Review design system updates",
            completed: true,
            time: "2:00 PM"
        },
        {
            id: "2",
            title: "Prepare presentation deck",
            completed: false,
            time: "3:30 PM",
            priority: "high",
            isUrgent: true
        },
        {
            id: "3",
            title: "Update API documentation",
            completed: false,
            time: "4:00 PM",
            priority: "medium"
        },
        {
            id: "4",
            title: "Review weekly analytics",
            completed: false,
            time: "5:00 PM",
            priority: "low"
        }
    ]
};

// Helper function to get priority styling
const getPriorityStyles = (priority: Priority) => {
    const styles = {
        low: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
        medium: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
        high: "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400"
    };
    return styles[priority];
};

export default function Todo() {
    const [tasks, setTasks] = useState<Task[]>(mockData.tasks);

    const toggleTaskCompletion = (taskId: string) => {
        setTasks(tasks.map(task => 
            task.id === taskId 
                ? { ...task, completed: !task.completed }
                : task
        ));
    };

    const handleAddTask = (newTask: Task) => {
        setTasks(prevTasks => [...prevTasks, newTask]);
    };

    return (
        <div className={cn("w-full px-24 h-screen")}>
            <div className="p-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
                <div>
                    <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {mockData.title}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {mockData.date}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {mockData.progress.completed}/{mockData.progress.total} done
                    </span>
                </div>
            </div>

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
                                {task.isUrgent && <Flag className="w-3.5 h-3.5 text-rose-500" />}
                            </div>
                            {!task.completed && task.priority && (
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                        <span className="text-xs text-zinc-500">{task.time}</span>
                                    </div>
                                    <span className={cn(
                                        "text-xs px-1.5 py-0.5 rounded-md font-medium",
                                        getPriorityStyles(task.priority)
                                    )}>
                                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                    </span>
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
                                    <DropdownMenuItem className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 focus:text-zinc-900 dark:focus:text-zinc-100 focus:bg-zinc-100 dark:focus:bg-zinc-800">
                                        Edit Task
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-rose-500 focus:text-rose-500 focus:bg-zinc-100 dark:focus:bg-zinc-800">
                                        Remove Task
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
                <AddTaskDialog onAddTask={handleAddTask} />
            </div>
        </div>
    );
}

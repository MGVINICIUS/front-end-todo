"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import React from 'react';

type Priority = 'low' | 'medium' | 'high';

interface Task {
    id: string;
    title: string;
    completed: boolean;
    time: string;
    priority?: Priority;
    isUrgent?: boolean;
}

export function AddTaskDialog({ onAddTask }: { onAddTask: (task: Task) => void }) {
    const [title, setTitle] = React.useState('');
    const [time, setTime] = React.useState('');
    const [priority, setPriority] = React.useState<Priority>('low');
    const [open, setOpen] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title.trim()) return;

        const newTask: Task = {
            id: crypto.randomUUID(),
            title: title.trim(),
            completed: false,
            time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            priority: priority,
            isUrgent: priority === 'high'
        };

        onAddTask(newTask);
        setTitle('');
        setTime('');
        setPriority('low');
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add new task
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add new task</DialogTitle>
                        <DialogDescription>
                            Create a new task to add to your list.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Task</Label>
                            <Input 
                                id="title" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter your task"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="time">Time</Label>
                            <Input 
                                id="time" 
                                type="time"
                                value={time} 
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select 
                                value={priority} 
                                onValueChange={(value: Priority) => setPriority(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">
                                        <span className="flex items-center">
                                            <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                                            Low
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="medium">
                                        <span className="flex items-center">
                                            <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                                            Medium
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="high">
                                        <span className="flex items-center">
                                            <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                                            High
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="w-full">
                            Add task
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { NewTask } from '@/types/todo';
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormData = {
    title: string;
    description: string;
    dueDate: string;
};

const MAX_DATE = new Date(2038, 0, 19, 3, 14, 7);

export function AddTaskDialog({ onAddTask }: { onAddTask: (task: NewTask) => void }) {
    const [open, setOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        if (isSubmitting) return;
        
        try {
            setIsSubmitting(true);
            
            const newTask: NewTask = {
                title: data.title.trim(),
                description: data.description?.trim() || '',
                dueDate: data.dueDate || new Date().toISOString(),
            };
            
            console.log('Submitting task:', newTask);
            await onAddTask(newTask);
            reset();
            setOpen(false);
        } catch (error) {
            console.error('Failed to add task:', error);
            toast.error(error instanceof Error ? error.message : "Failed to create task");
        } finally {
            setIsSubmitting(false);
        }
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
                <form onSubmit={handleSubmit(onSubmit)}>
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
                                {...register("title", { required: true })}
                                placeholder="Enter your task"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea 
                                id="description"
                                {...register("description")}
                                placeholder="Enter task description"
                                className="resize-none"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input 
                                id="dueDate"
                                type="datetime-local"
                                {...register("dueDate", {
                                    validate: (value) => {
                                        if (!value) return true;
                                        const date = new Date(value);
                                        return date <= MAX_DATE || 
                                            "Date cannot be later than January 19, 2038 03:14:07";
                                    }
                                })}
                                className={errors.dueDate ? "border-red-500" : ""}
                            />
                            {errors.dueDate && (
                                <p className="text-sm text-red-500">
                                    {errors.dueDate.message}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Task'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 
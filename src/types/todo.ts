export interface ListData {
    title: string;
    date: string;
    progress: {
        completed: number;
        total: number;
    };
}

export interface Task {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    dueDate: string;
    time?: string; // Optional time display string for UI
}

export interface NewTask {
    title: string;
    description: string;
    dueDate: string | Date;
} 
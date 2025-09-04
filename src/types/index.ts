export interface User {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    createdAt?: string;
}

export interface Task {
    taskId: number;
    taskName: string;
    taskDescription: string;
    taskStatus: TaskStatus; // Changed from 'status' to 'taskStatus' to match backend
    userId?: number;
    completionTime?: string | null;
    startTime?: string;
    createdAt: string;
    updatedAt: string;
    user?: User; // Optional user object
}

export enum TaskStatus {
    TODO = 'TODO',
    ONGOING = 'ONGOING', // Changed from 'IN_PROGRESS' to 'ONGOING' to match backend
    COMPLETED = 'COMPLETED'
}

export interface AuthResponse {
    token: string;
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
}

export interface ApiResponse<T = any> {
    data?: T;
    error?: string;
    message?: string;
}
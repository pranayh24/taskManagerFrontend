import {type AuthResponse, type Task, TaskStatus, type User } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://manage-tasks-5a8676d50ead.herokuapp.com/api";

class ApiService {
    private token: string | null = localStorage.getItem('token');

    private getHeaders(includeAuth = true): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (includeAuth && this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        return headers;
    }

    setToken(token: string) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    async register(firstName: string, lastName: string, email: string, password: string) {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: this.getHeaders(false),
            body: JSON.stringify({ firstName, lastName, email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }

        return response.json();
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(false),
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }

        const data = await response.json();
        this.setToken(data.token);
        return data;
    }

    async getProfile(userId: number): Promise<User> {
        const response = await fetch(`${API_BASE_URL}/auth/profile/${userId}`, {
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        return response.json();
    }

    async getTasks(): Promise<Task[]> {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }

        return response.json();
    }

    async createTask(taskName: string, taskDescription: string): Promise<Task> {
        console.log('Creating task:', { taskName, taskDescription }); // Debug log

        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ taskName, taskDescription }),
        });

        console.log('Create task response:', response.status, response.statusText); // Debug log

        if (!response.ok) {
            let errorMessage = 'Failed to create task';
            try {
                const error = await response.json();
                console.error('Create task error response:', error); // Debug log
                errorMessage = error.error || error.message || errorMessage;
            } catch (jsonError) {
                // If response is not valid JSON, use the response text or status
                try {
                    const errorText = await response.text();
                    console.error('Create task error text:', errorText); // Debug log
                    errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
                } catch (textError) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
            }
            throw new Error(errorMessage);
        }

        try {
            // Clone the response to read it multiple times
            const responseClone = response.clone();
            const responseText = await responseClone.text();
            console.log('Create task raw response length:', responseText.length); // Debug log

            // Parse the JSON manually to handle potential circular references
            const rawData = JSON.parse(responseText);
            console.log('Create task parsed raw data:', rawData); // Debug log

            // Extract only the necessary task data to avoid circular references
            const sanitizedTask: Task = {
                taskId: rawData.taskId,
                taskName: rawData.taskName,
                taskDescription: rawData.taskDescription,
                taskStatus: rawData.taskStatus,
                userId: rawData.user?.userId,
                completionTime: rawData.completionTime,
                startTime: rawData.startTime,
                createdAt: rawData.createdAt,
                updatedAt: rawData.updatedAt
            };

            console.log('Create task sanitized result:', sanitizedTask); // Debug log
            return sanitizedTask;
        } catch (jsonError) {
            console.error('Create task JSON parsing error:', jsonError); // Debug log
            // Try to extract the response text for better error reporting
            try {
                const responseClone2 = response.clone();
                const errorText = await responseClone2.text();
                console.error('Raw response causing parse error:', errorText.substring(0, 500) + '...'); // First 500 chars
            } catch (e) {
                // Ignore secondary error
            }
            throw new Error('Invalid response format from server');
        }
    }

    async updateTask(taskId: number, taskName: string, taskDescription: string): Promise<Task> {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({ taskName, taskDescription }),
        });

        if (!response.ok) {
            let errorMessage = 'Failed to update task';
            try {
                const error = await response.json();
                errorMessage = error.error || error.message || errorMessage;
            } catch (jsonError) {
                try {
                    const errorText = await response.text();
                    errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
                } catch (textError) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
            }
            throw new Error(errorMessage);
        }

        try {
            return await response.json();
        } catch (jsonError) {
            throw new Error('Invalid response format from server');
        }
    }

    async updateTaskStatus(taskId: number, status: TaskStatus): Promise<Task> {
        console.log('Updating task status:', { taskId, status }); // Debug log
        console.log('API_BASE_URL:', API_BASE_URL); // Debug log
        console.log('Headers:', this.getHeaders()); // Debug log

        try {
            const url = `${API_BASE_URL}/tasks/${taskId}/status`;
            const requestBody = JSON.stringify({ status });

            console.log('Making PATCH request to:', url); // Debug log
            console.log('Request body:', requestBody); // Debug log

            // First, try the dedicated status endpoint
            let response = await fetch(url, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: requestBody,
            });

            console.log('Status update response (PATCH /status):', response.status, response.statusText); // Debug log

            // If that fails with 404, try the main task endpoint with PATCH
            if (!response.ok && response.status === 404) {
                console.log('Trying PATCH on main endpoint'); // Debug log
                response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                    method: 'PATCH',
                    headers: this.getHeaders(),
                    body: JSON.stringify({ status }),
                });
                console.log('Status update response (PATCH /tasks/{id}):', response.status, response.statusText); // Debug log
            }

            // If PATCH fails, try PUT on main endpoint
            if (!response.ok && (response.status === 404 || response.status === 405)) {
                console.log('Trying PUT on main endpoint'); // Debug log
                response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: this.getHeaders(),
                    body: JSON.stringify({ status }),
                });
                console.log('Status update response (PUT /tasks/{id}):', response.status, response.statusText); // Debug log
            }

            if (!response.ok) {
                let errorMessage = 'Failed to update task status';
                try {
                    const errorText = await response.text();
                    console.error('Status update error text:', errorText); // Debug log
                    errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
                } catch (textError) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            // Handle successful response
            try {
                const responseText = await response.text();
                console.log('Status update raw response:', responseText); // Debug log

                if (!responseText) {
                    // If empty response, just return a basic task object with updated status
                    console.log('Empty response, creating basic task object');
                    return {
                        taskId,
                        taskName: '',
                        taskDescription: '',
                        taskStatus: status,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    } as Task;
                }

                const result = JSON.parse(responseText);
                console.log('Status update parsed result:', result); // Debug log

                // Handle potential circular references like in createTask
                const sanitizedTask: Task = {
                    taskId: result.taskId || taskId,
                    taskName: result.taskName || '',
                    taskDescription: result.taskDescription || '',
                    taskStatus: result.taskStatus || status,
                    userId: result.user?.userId,
                    completionTime: result.completionTime,
                    startTime: result.startTime,
                    createdAt: result.createdAt,
                    updatedAt: result.updatedAt
                };

                return sanitizedTask;
            } catch (jsonError) {
                console.error('Status update JSON parsing error:', jsonError); // Debug log
                // If JSON parsing fails, return a basic task object with updated status
                return {
                    taskId,
                    taskName: '',
                    taskDescription: '',
                    taskStatus: status,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                } as Task;
            }
        } catch (networkError) {
            console.error('Network error during status update:', networkError); // Debug log
            console.error('Error details:', {
                name: networkError.name,
                message: networkError.message,
                stack: networkError.stack
            }); // Debug log

            // Since other endpoints work, try a simpler approach: update via the main tasks endpoint
            console.log('Attempting fallback: updating entire task via PUT'); // Debug log

            try {
                // Get the current task data first
                const tasksResponse = await fetch(`${API_BASE_URL}/tasks`, {
                    headers: this.getHeaders(),
                });

                if (tasksResponse.ok) {
                    const tasks = await tasksResponse.json();
                    const currentTask = tasks.find((t: any) => t.taskId === taskId);

                    if (currentTask) {
                        console.log('Found current task, updating with PUT:', currentTask); // Debug log

                        const updateResponse = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                            method: 'PUT',
                            headers: this.getHeaders(),
                            body: JSON.stringify({
                                taskName: currentTask.taskName,
                                taskDescription: currentTask.taskDescription,
                                taskStatus: status
                            }),
                        });

                        if (updateResponse.ok) {
                            console.log('PUT update successful'); // Debug log
                            return {
                                ...currentTask,
                                taskStatus: status,
                                updatedAt: new Date().toISOString()
                            };
                        }
                    }
                }
            } catch (fallbackError) {
                console.error('Fallback update also failed:', fallbackError); // Debug log
            }

            // Check if it's a CORS or network connectivity issue
            if (networkError instanceof TypeError && networkError.message.includes('Failed to fetch')) {
                throw new Error('Network error: Unable to reach server. Please check if the backend is running and CORS is configured.');
            }

            throw new Error(`Network error: ${networkError.message}`);
        }
    }

    async deleteTask(taskId: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
    }
}

export const apiService = new ApiService();
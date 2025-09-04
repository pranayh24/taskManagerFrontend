import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, CheckSquare } from 'lucide-react';
import {type Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const TaskList: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | undefined>();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
    const { user, logout } = useAuth();

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        filterTasks();
    }, [tasks, searchTerm, statusFilter]);

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const tasksData = await apiService.getTasks();
            setTasks(tasksData);
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
        } finally {
            setIsLoading(false);
        }
    };

    const filterTasks = () => {
        let filtered = tasks;

        if (searchTerm) {
            filtered = filtered.filter(task =>
                task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.taskDescription.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(task => task.taskStatus === statusFilter); // Fixed: changed from task.status to task.taskStatus
        }

        setFilteredTasks(filtered);
    };

    const handleCreateTask = async (taskName: string, taskDescription: string) => {
        try {
            const newTask = await apiService.createTask(taskName, taskDescription);
            setTasks(prev => [newTask, ...prev]);
            setError('');
        } catch (err) {
            console.error('Failed to create task:', err);
            setError(err instanceof Error ? err.message : 'Failed to create task');
            throw err; // Re-throw so TaskModal can handle it
        }
    };

    const handleUpdateTask = async (taskName: string, taskDescription: string) => {
        if (!editingTask) return;

        try {
            const updatedTask = await apiService.updateTask(editingTask.taskId, taskName, taskDescription);
            setTasks(prev => prev.map(task => task.taskId === updatedTask.taskId ? updatedTask : task));
            setEditingTask(undefined);
            setError('');
        } catch (err) {
            console.error('Failed to update task:', err);
            setError(err instanceof Error ? err.message : 'Failed to update task');
            throw err; // Re-throw so TaskModal can handle it
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        try {
            await apiService.deleteTask(taskId);
            setTasks(prev => prev.filter(task => task.taskId !== taskId));
            setError('');
        } catch (err) {
            console.error('Failed to delete task:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete task');
        }
    };

    const handleStatusChange = async (taskId: number, status: TaskStatus) => {
        try {
            const updatedTask = await apiService.updateTaskStatus(taskId, status);
            setTasks(prev => prev.map(task => task.taskId === updatedTask.taskId ? updatedTask : task));
            setError('');
        } catch (err) {
            console.error('Failed to update task status:', err);
            setError(err instanceof Error ? err.message : 'Failed to update task status');
        }
    };

    const openCreateModal = () => {
        setEditingTask(undefined);
        setShowModal(true);
    };

    const openEditModal = (task: Task) => {
        setEditingTask(task);
        setShowModal(true);
    };

    const getTaskStats = () => {
        const total = tasks.length;
        const completed = tasks.filter(task => task.taskStatus === TaskStatus.COMPLETED).length;
        const inProgress = tasks.filter(task => task.taskStatus === TaskStatus.ONGOING).length; // Changed from IN_PROGRESS to ONGOING and task.status to task.taskStatus
        return { total, completed, inProgress };
    };

    const stats = getTaskStats();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-slate-300">Loading your tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Header */}
            <div className="bg-slate-800 border-b border-slate-700">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                                <CheckSquare className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">TaskFlow</h1>
                                <p className="text-slate-400 text-sm">Welcome back, {user?.firstName}!</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="max-w-6xl mx-auto px-6 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                        <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
                        <div className="text-slate-400 text-sm">Total Tasks</div>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                        <div className="text-3xl font-bold text-blue-400 mb-1">{stats.inProgress}</div>
                        <div className="text-slate-400 text-sm">In Progress</div>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                        <div className="text-3xl font-bold text-green-400 mb-1">{stats.completed}</div>
                        <div className="text-slate-400 text-sm">Completed</div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        />
                    </div>

                    <div className="flex gap-3">
                        <div className="relative">
                            <Filter className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'ALL')}
                                className="pl-10 pr-8 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors appearance-none"
                            >
                                <option value="ALL">All Tasks</option>
                                <option value={TaskStatus.TODO}>To Do</option>
                                <option value={TaskStatus.ONGOING}>In Progress</option>
                                <option value={TaskStatus.COMPLETED}>Completed</option>
                            </select>
                        </div>

                        <button
                            onClick={openCreateModal}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Plus className="h-5 w-5" />
                            New Task
                        </button>
                    </div>
                </div>

                {/* Tasks Grid */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {filteredTasks.length === 0 ? (
                    <div className="text-center py-16">
                        <CheckSquare className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-400 mb-2">
                            {searchTerm || statusFilter !== 'ALL' ? 'No matching tasks' : 'No tasks yet'}
                        </h3>
                        <p className="text-slate-500 mb-6">
                            {searchTerm || statusFilter !== 'ALL'
                                ? 'Try adjusting your search or filter criteria'
                                : 'Create your first task to get started'
                            }
                        </p>
                        {!searchTerm && statusFilter === 'ALL' && (
                            <button
                                onClick={openCreateModal}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                Create First Task
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTasks.map((task) => (
                            <TaskCard
                                key={task.taskId}
                                task={task}
                                onEdit={openEditModal}
                                onDelete={handleDeleteTask}
                                onStatusChange={handleStatusChange}
                            />
                        ))}
                    </div>
                )}
            </div>

            <TaskModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                task={editingTask}
                onSave={editingTask ? handleUpdateTask : handleCreateTask}
            />
        </div>
    );
};
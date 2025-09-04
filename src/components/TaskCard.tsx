import React, { useState } from 'react';
import { MoreHorizontal, Edit2, Trash2, Play, Pause, CheckCircle } from 'lucide-react';
import {type Task, TaskStatus } from '../types';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (taskId: number) => void;
    onStatusChange: (taskId: number, status: TaskStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
    const [showMenu, setShowMenu] = useState(false);

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.TODO:
                return 'bg-slate-600 text-slate-300';
            case TaskStatus.ONGOING: // Changed from IN_PROGRESS to ONGOING
                return 'bg-blue-600 text-blue-100';
            case TaskStatus.COMPLETED:
                return 'bg-green-600 text-green-100';
            default:
                return 'bg-slate-600 text-slate-300';
        }
    };

    const getStatusText = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.TODO:
                return 'To Do';
            case TaskStatus.ONGOING: // Changed from IN_PROGRESS to ONGOING
                return 'In Progress';
            case TaskStatus.COMPLETED:
                return 'Completed';
            default:
                return 'Unknown';
        }
    };

    const getNextStatus = (currentStatus: TaskStatus): TaskStatus => {
        switch (currentStatus) {
            case TaskStatus.TODO:
                return TaskStatus.ONGOING; // Changed from IN_PROGRESS to ONGOING
            case TaskStatus.ONGOING: // Changed from IN_PROGRESS to ONGOING
                return TaskStatus.COMPLETED;
            case TaskStatus.COMPLETED:
                return TaskStatus.TODO;
            default:
                return TaskStatus.TODO;
        }
    };

    const getStatusIcon = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.TODO:
                return <Play className="h-4 w-4" />;
            case TaskStatus.ONGOING: // Changed from IN_PROGRESS to ONGOING
                return <Pause className="h-4 w-4" />;
            case TaskStatus.COMPLETED:
                return <CheckCircle className="h-4 w-4" />;
            default:
                return <Play className="h-4 w-4" />;
        }
    };

    const handleStatusToggle = () => {
        const nextStatus = getNextStatus(task.taskStatus); // Changed from task.status to task.taskStatus
        onStatusChange(task.taskId, nextStatus);
    };

    return (
        <div className={`bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all duration-200 ${
            task.taskStatus === TaskStatus.COMPLETED ? 'opacity-75' : ''
        }`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${
                        task.taskStatus === TaskStatus.COMPLETED ? 'text-slate-400 line-through' : 'text-white'
                    } mb-2`}>
                        {task.taskName}
                    </h3>
                    {task.taskDescription && (
                        <p className="text-slate-300 text-sm leading-relaxed">
                            {task.taskDescription}
                        </p>
                    )}
                </div>

                <div className="relative ml-4">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                    >
                        <MoreHorizontal className="h-5 w-5" />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-8 bg-slate-700 border border-slate-600 rounded-lg shadow-lg py-2 z-10">
                            <button
                                onClick={() => {
                                    onEdit(task);
                                    setShowMenu(false);
                                }}
                                className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-600 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <Edit2 className="h-4 w-4" />
                                Edit
                            </button>
                            <button
                                onClick={() => {
                                    onDelete(task.taskId);
                                    setShowMenu(false);
                                }}
                                className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-600 hover:text-red-300 transition-colors flex items-center gap-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.taskStatus)}`}>
                    {getStatusText(task.taskStatus)}
                </span>

                <button
                    onClick={handleStatusToggle}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors text-sm font-medium"
                >
                    {getStatusIcon(task.taskStatus)}
                    {task.taskStatus === TaskStatus.COMPLETED ? 'Reset' : 'Progress'}
                </button>
            </div>

            <div className="mt-4 text-xs text-slate-500">
                Created: {new Date(task.createdAt).toLocaleDateString()}
            </div>
        </div>
    );
};
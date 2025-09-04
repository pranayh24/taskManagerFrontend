import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type {Task} from '../types';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task?: Task;
    onSave: (taskName: string, taskDescription: string) => Promise<void>;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, onSave }) => {
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (task) {
            setTaskName(task.taskName);
            setTaskDescription(task.taskDescription);
        } else {
            setTaskName('');
            setTaskDescription('');
        }
    }, [task]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskName.trim()) return;

        setIsLoading(true);
        try {
            await onSave(taskName.trim(), taskDescription.trim());
            onClose();
        } catch (error) {
            console.error('Failed to save task:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <h3 className="text-xl font-semibold text-white">
                        {task ? 'Edit Task' : 'Create New Task'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="taskName" className="block text-sm font-medium text-slate-300 mb-2">
                            Task Name
                        </label>
                        <input
                            type="text"
                            id="taskName"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                            placeholder="Enter task name"
                            required
                            autoFocus
                        />
                    </div>

                    <div>
                        <label htmlFor="taskDescription" className="block text-sm font-medium text-slate-300 mb-2">
                            Description
                        </label>
                        <textarea
                            id="taskDescription"
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
                            placeholder="Enter task description (optional)"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !taskName.trim()}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                task ? 'Update Task' : 'Create Task'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
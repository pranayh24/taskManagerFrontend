import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/AuthForm';
import { TaskList } from './components/TaskList';

const AppContent: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-slate-300">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <AuthForm
                mode={authMode}
                onToggleMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            />
        );
    }

    return <TaskList />;
};

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
import React, { useState, useCallback } from 'react';

export const ToastContext = React.createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        const toast = { id, message, type };
        
        setToasts(prev => [...prev, toast]);
        
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
        
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, removeToast }}>
            {children}
            <div className="fixed bottom-6 right-6 space-y-3 z-50">
                {toasts.map(toast => (
                    <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function Toast({ toast, onClose }) {
    const bgColor = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600',
        warning: 'bg-yellow-600'
    }[toast.type] || 'bg-blue-600';

    const icon = {
        success: 'check_circle',
        error: 'error',
        info: 'info',
        warning: 'warning'
    }[toast.type] || 'info';

    return (
        <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-sm`}>
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            <span className="text-sm font-semibold flex-1">{toast.message}</span>
            <button 
                onClick={onClose}
                className="text-white hover:opacity-75 transition-opacity"
            >
                <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
        </div>
    );
}

export function useToast() {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

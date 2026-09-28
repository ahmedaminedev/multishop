
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationCircleIcon, XMarkIcon } from './IconComponents';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void;
    removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            removeToast(id);
        }, 3000);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
                {toasts.map(toast => (
                    <div 
                        key={toast.id} 
                        className={`flex items-center p-4 rounded-lg shadow-lg border-l-4 bg-white dark:bg-gray-800 min-w-[300px] animate-slideIn transition-all duration-300 ${
                            toast.type === 'success' ? 'border-green-500' : 
                            toast.type === 'error' ? 'border-red-500' : 
                            toast.type === 'warning' ? 'border-yellow-500' : 
                            'border-blue-500'
                        }`}
                    >
                        <div className="flex-shrink-0 mr-3">
                            {toast.type === 'success' && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
                            {toast.type === 'error' && <XCircleIcon className="w-6 h-6 text-red-500" />}
                            {toast.type === 'info' && <ExclamationCircleIcon className="w-6 h-6 text-blue-500" />}
                            {toast.type === 'warning' && <ExclamationCircleIcon className="w-6 h-6 text-yellow-500" />}
                        </div>
                        <div className="flex-grow text-sm font-medium text-gray-800 dark:text-white">
                            {toast.message}
                        </div>
                        <button onClick={() => removeToast(toast.id)} className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slideIn { animation: slideIn 0.3s ease-out forwards; }
            `}</style>
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

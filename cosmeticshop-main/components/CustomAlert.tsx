
import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationCircleIcon, XMarkIcon } from './IconComponents';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface CustomAlertProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: AlertType;
    showCancelButton?: boolean;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info',
    showCancelButton = false,
    confirmText = 'OK',
    cancelText = 'Annuler',
    onConfirm
}) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        else onClose();
    };

    const iconMap = {
        success: <CheckCircleIcon className="w-16 h-16 text-green-500" />,
        error: <XCircleIcon className="w-16 h-16 text-red-500" />,
        warning: <ExclamationCircleIcon className="w-16 h-16 text-yellow-500" />,
        info: <ExclamationCircleIcon className="w-16 h-16 text-blue-500" />
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm md:max-w-md p-6 transform transition-all scale-100 animate-bounceIn text-center relative border border-gray-100 dark:border-gray-700">
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>

                <div className="flex justify-center mb-4">
                    {iconMap[type]}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                    {message}
                </p>

                <div className="flex justify-center gap-4">
                    {showCancelButton && (
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-lg font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={handleConfirm}
                        className={`px-6 py-2.5 rounded-lg font-semibold text-white shadow-lg transition-transform active:scale-95 ${
                            type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                            type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' :
                            type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                            'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes bounceIn {
                    0% { opacity: 0; transform: scale(0.3); }
                    50% { opacity: 1; transform: scale(1.05); }
                    70% { transform: scale(0.9); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .animate-bounceIn {
                    animation: bounceIn 0.4s cubic-bezier(0.215, 0.610, 0.355, 1.000);
                }
            `}</style>
        </div>
    );
};

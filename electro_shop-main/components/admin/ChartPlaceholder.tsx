import React from 'react';

interface ChartPlaceholderProps {
    title: string;
    type?: 'bar' | 'pie';
}

export const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({ title, type = 'bar' }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-96 flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
            <div className="flex-grow flex items-center justify-center text-gray-400 dark:text-gray-500">
                <div className="w-full h-full flex items-end gap-2 border-l border-b border-gray-200 dark:border-gray-700 p-2">
                    {type === 'bar' ? (
                        <>
                            <div className="w-1/6 h-[30%] bg-gray-200 dark:bg-gray-700 rounded-t-sm animate-pulse"></div>
                            <div className="w-1/6 h-[50%] bg-gray-200 dark:bg-gray-700 rounded-t-sm animate-pulse" style={{ animationDelay: '100ms' }}></div>
                            <div className="w-1/6 h-[75%] bg-red-200 dark:bg-red-900/50 rounded-t-sm animate-pulse" style={{ animationDelay: '200ms' }}></div>
                            <div className="w-1/6 h-[40%] bg-gray-200 dark:bg-gray-700 rounded-t-sm animate-pulse" style={{ animationDelay: '300ms' }}></div>
                            <div className="w-1/6 h-[60%] bg-gray-200 dark:bg-gray-700 rounded-t-sm animate-pulse" style={{ animationDelay: '400ms' }}></div>
                            <div className="w-1/6 h-[80%] bg-red-200 dark:bg-red-900/50 rounded-t-sm animate-pulse" style={{ animationDelay: '500ms' }}></div>
                        </>
                    ) : (
                         <div className="w-48 h-48 border-8 border-gray-200 dark:border-gray-700 border-t-8 border-red-400 dark:border-t-red-700 rounded-full animate-spin"></div>
                    )}
                </div>
            </div>
        </div>
    );
};

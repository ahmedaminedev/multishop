import React from 'react';
import type { ContactMessage } from '../../types';

interface ViewMessagesPageProps {
    messages: ContactMessage[];
}

export const ViewMessagesPage: React.FC<ViewMessagesPageProps> = ({ messages }) => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Boîte de Réception</h1>
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                 <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {messages.map(message => (
                        <li key={message.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-start gap-4 cursor-pointer">
                            <div className="flex-shrink-0">
                                <span className={`block w-3 h-3 rounded-full mt-1.5 ${message.read ? 'bg-gray-300' : 'bg-red-500'}`}></span>
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-baseline">
                                    <p className={`font-semibold ${message.read ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>{message.name}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">{message.date}</p>
                                </div>
                                 <p className={`text-sm ${message.read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>{message.subject}</p>
                                <p className={`text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-1`}>{message.message}</p>
                            </div>
                        </li>
                    ))}
                 </ul>
            </div>
        </div>
    );
};


import React from 'react';
import type { ContactMessage } from '../../types';
import { InboxIcon } from '../IconComponents';

interface ViewMessagesPageProps {
    messages: ContactMessage[];
}

export const ViewMessagesPage: React.FC<ViewMessagesPageProps> = ({ messages }) => {
    return (
        <div className="p-6 bg-gray-100 dark:bg-black min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
            <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-wider italic">Transmissions <span className="text-black dark:text-brand-neon">Entrantes</span></h1>
                    <p className="text-xs text-gray-500 font-mono mt-1">Inbox Support</p>
                </div>
                <div className="bg-white dark:bg-[#1f2833] px-4 py-2 border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                    <InboxIcon className="w-4 h-4 text-black dark:text-brand-neon" />
                    <span className="text-xs font-bold uppercase">{messages.length} Messages</span>
                </div>
            </div>

             <div className="bg-white dark:bg-[#1f2833] border border-gray-200 dark:border-gray-700 rounded-sm shadow-sm dark:shadow-none">
                 <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                    {messages.map(message => (
                        <li key={message.id} className="p-5 hover:bg-gray-50 dark:hover:bg-black/30 transition-colors cursor-pointer group">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <div className={`w-3 h-3 rounded-full ${message.read ? 'bg-gray-400 dark:bg-gray-600' : 'bg-green-500 dark:bg-brand-neon dark:shadow-[0_0_8px_#ccff00]'}`}></div>
                                </div>
                                <div className="flex-grow">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                                        <p className={`font-bold text-sm uppercase tracking-wide ${message.read ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}>{message.name}</p>
                                        <p className="text-[10px] font-mono text-gray-500">{message.date}</p>
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 mb-2">{message.email}</p>
                                    <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${message.read ? 'text-gray-500' : 'text-black dark:text-brand-neon'}`}>{message.subject}</p>
                                    <div className="p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 text-sm font-mono text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {message.message}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                    {messages.length === 0 && (
                        <li className="p-10 text-center text-gray-500 font-mono text-sm">
                            Aucun message dans la boîte de réception.
                        </li>
                    )}
                 </ul>
            </div>
        </div>
    );
};

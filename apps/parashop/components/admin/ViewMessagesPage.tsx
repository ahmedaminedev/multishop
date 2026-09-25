
import React from 'react';
import type { ContactMessage } from '../../types';
import { InboxIcon, UserIcon, ClockIcon, MailIcon, SparklesIcon } from '../IconComponents';

interface ViewMessagesPageProps {
    messages: ContactMessage[];
}

export const ViewMessagesPage: React.FC<ViewMessagesPageProps> = ({ messages }) => {
    return (
        <div className="p-8 bg-slate-50/50 dark:bg-brand-dark min-h-screen">
            <div className="mb-12">
                <h1 className="text-4xl font-serif font-black text-slate-900 dark:text-white uppercase tracking-tight">Conseils <span className="text-brand-primary italic">Patients</span></h1>
                <p className="text-slate-400 font-medium mt-2">Consultations et demandes d'expertise en attente</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {messages.map(message => (
                    <div key={message.id} className={`bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 border shadow-sm transition-all hover:shadow-xl ${message.read ? 'border-slate-100 opacity-75' : 'border-brand-primary/20 bg-brand-light/5'}`}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-8 border-b border-slate-50 dark:border-white/5">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-lg"><UserIcon className="w-7 h-7"/></div>
                                <div>
                                    <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">{message.name}</h3>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase"><MailIcon className="w-3.5 h-3.5"/> {message.email}</span>
                                        <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase"><ClockIcon className="w-3.5 h-3.5"/> {message.date}</span>
                                    </div>
                                </div>
                            </div>
                            {!message.read && (
                                <span className="px-5 py-2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full flex items-center gap-2 animate-pulse">
                                    <SparklesIcon className="w-3 h-3"/> Urgent / Nouveau
                                </span>
                            )}
                        </div>
                        
                        <div className="space-y-4">
                            <p className="text-sm font-black text-brand-primary uppercase tracking-widest">{message.subject}</p>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic">"{message.message}"</p>
                        </div>

                        <div className="mt-10 flex justify-end gap-4">
                            <button className="px-8 py-3 bg-slate-50 dark:bg-gray-700 text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-xl hover:text-rose-500 transition-all">Archiver</button>
                            <button className="px-8 py-3 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all">Répondre au patient</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

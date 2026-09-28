
import React, { useState, useEffect, useRef } from 'react';
import { WhatsAppIcon, XMarkIcon, PaperAirplaneIcon, ArrowLongLeftIcon } from './IconComponents';
import type { User } from '../types';
import { socket } from '../utils/socket';
import { api } from '../utils/api';

interface Message {
    sender: 'client' | 'admin';
    content: string;
    type: 'text' | 'image' | 'video';
    timestamp: string;
}

// L'icône spécifique de l'image (4 petits carrés)
const TacticalDotsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <rect x="7" y="7" width="4" height="4" />
        <rect x="13" y="7" width="4" height="4" />
        <rect x="7" y="13" width="4" height="4" />
        <rect x="13" y="13" width="4" height="4" />
    </svg>
);

type WidgetState = 'closed' | 'choice' | 'chat';

export const SupportWidget: React.FC<{ user: User | null }> = ({ user }) => {
    const [view, setView] = useState<WidgetState>('closed');
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isAdminOnline, setIsAdminOnline] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user && view === 'chat') {
            socket.connect();
            socket.emit('join_room', user.id);
            socket.on('receive_message', (msg: Message) => setMessages(prev => [...prev, msg]));
            socket.on('admin_status', (status: { online: boolean }) => setIsAdminOnline(status.online));
            
            api.getChatHistory(user.id.toString()).then(data => {
                if (data?.messages) setMessages(data.messages);
            });

            return () => {
                socket.off('receive_message');
                socket.off('admin_status');
                socket.disconnect();
            };
        }
    }, [user, view]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, view]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;
        socket.emit('send_message', { userId: user.id, sender: 'client', content: newMessage, type: 'text', userName: user.firstName });
        setNewMessage('');
    };

    const formatFullDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
            
            {/* 1. MENU DE CHOIX (WhatsApp ou Chat) */}
            {view === 'choice' && (
                <div className="mb-6 w-[320px] bg-white dark:bg-brand-black backdrop-blur-xl border-2 border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-fadeInUp">
                    <div className="p-6 bg-gray-50 dark:bg-brand-gray border-b border-gray-100 dark:border-gray-800 text-center">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase italic tracking-widest">Support Clients</h3>
                        <p className="text-[10px] text-gray-500 font-mono mt-1">CHOISISSEZ VOTRE CANAL</p>
                    </div>
                    <div className="p-4 space-y-3">
                        <a 
                            href="https://wa.me/21655263522" 
                            target="_blank" 
                            className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-[#25D366] transition-all rounded-xl"
                        >
                            <div className="w-10 h-10 bg-[#25D366] text-white flex items-center justify-center rounded-lg">
                                <WhatsAppIcon className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-gray-900 dark:text-white uppercase">WhatsApp Direct</p>
                                <p className="text-[10px] text-[#25D366] font-bold">Réponse rapide</p>
                            </div>
                        </a>

                        <button 
                            onClick={() => setView('chat')}
                            className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-brand-neon transition-all rounded-xl"
                        >
                            <div className="w-10 h-10 bg-brand-neon text-black flex items-center justify-center rounded-lg">
                                <TacticalDotsIcon className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-gray-900 dark:text-white uppercase">Live Chat HQ</p>
                                <p className="text-[10px] text-brand-neon font-bold">Agents en ligne</p>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* 2. TERMINAL DE CHAT */}
            {view === 'chat' && (
                <div className="mb-6 w-[380px] bg-white dark:bg-brand-black border-2 border-brand-neon shadow-2xl flex flex-col h-[550px] animate-fadeIn rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="p-5 bg-gray-50 dark:bg-brand-gray border-b border-brand-neon flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setView('choice')} className="p-1 text-gray-500 hover:text-brand-neon transition-colors mr-1">
                                <ArrowLongLeftIcon className="w-5 h-5" />
                            </button>
                            <div className="relative">
                                <div className={`w-3 h-3 rounded-full ${isAdminOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            </div>
                            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase italic">Live Support</h3>
                        </div>
                        <button onClick={() => setView('closed')} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar bg-white dark:bg-transparent">
                        {messages.map((msg, i) => {
                            const isClient = msg.sender === 'client';
                            return (
                                <div key={i} className={`flex flex-col ${isClient ? 'items-end' : 'items-start'} animate-fadeInUp`}>
                                    <div className={`max-w-[85%] p-4 text-xs font-medium border ${isClient ? 'bg-brand-neon text-black border-brand-neon slant shadow-sm' : 'bg-gray-100 dark:bg-brand-gray text-gray-900 dark:text-white border-gray-200 dark:border-gray-800'}`}>
                                        <p className={isClient ? 'slant-reverse' : ''}>{msg.content}</p>
                                    </div>
                                    <span className="mt-2 text-[8px] font-mono text-gray-400 uppercase italic">
                                        {formatFullDate(msg.timestamp)}
                                    </span>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-5 bg-gray-50 dark:bg-brand-gray border-t border-gray-100 dark:border-gray-800">
                        {user ? (
                            <div className="flex gap-3 bg-white dark:bg-black/50 border border-gray-200 dark:border-gray-700 p-2 focus-within:border-brand-neon transition-colors rounded-lg">
                                <input 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="VOTRE MESSAGE..."
                                    className="flex-grow bg-transparent border-none text-gray-900 dark:text-white text-[10px] font-mono p-2 focus:ring-0 outline-none"
                                />
                                <button type="submit" className="bg-brand-neon text-black p-3 hover:bg-black hover:text-brand-neon transition-all slant">
                                    <PaperAirplaneIcon className="w-4 h-4 slant-reverse -rotate-45" />
                                </button>
                            </div>
                        ) : (
                            <p className="text-[10px] text-center text-gray-400 uppercase py-2">Connexion requise</p>
                        )}
                    </form>
                </div>
            )}

            {/* 3. LE BOUTON CARRÉ (Trigger de l'image) */}
            <button 
                onClick={() => setView(view === 'closed' ? 'choice' : 'closed')}
                className={`w-16 h-16 flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 group relative ${view !== 'closed' ? 'bg-white text-black rounded-full border-2 border-brand-neon' : 'bg-brand-neon text-black border-4 border-black rounded-none'}`}
                aria-label="Ouvrir le support"
            >
                {view === 'closed' ? (
                    <div className="relative flex flex-col items-center justify-center">
                        <TacticalDotsIcon className="w-8 h-8" />
                        {/* Notification Dot (Simulé) */}
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-white border-2 border-black rounded-full animate-pulse"></span>
                    </div>
                ) : (
                    <XMarkIcon className="w-8 h-8" />
                )}
            </button>
        </div>
    );
};

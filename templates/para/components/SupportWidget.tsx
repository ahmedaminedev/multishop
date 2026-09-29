
import React, { useState, useEffect, useRef } from 'react';
import { WhatsAppIcon, XMarkIcon, PaperAirplaneIcon, ArrowLongLeftIcon } from './IconComponents';
import type { User } from '../types';
import { socket } from '../utils/socket';
import { api } from '../utils/api';

const MedicalIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
);

type WidgetState = 'closed' | 'choice' | 'chat';

export const SupportWidget: React.FC<{ user: User | null }> = ({ user }) => {
    const [view, setView] = useState<WidgetState>('closed');
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isAdminOnline, setIsAdminOnline] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user && view === 'chat') {
            socket.connect();
            socket.emit('join_room', user.id);
            socket.on('receive_message', (msg: any) => setMessages(prev => [...prev, msg]));
            socket.on('admin_status', (status: { online: boolean }) => setIsAdminOnline(status.online));
            api.getChatHistory(user.id.toString()).then(data => data?.messages && setMessages(data.messages));
            return () => { socket.off('receive_message'); socket.off('admin_status'); socket.disconnect(); };
        }
    }, [user, view]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, view]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;
        socket.emit('send_message', { userId: user.id, sender: 'client', content: newMessage, type: 'text', userName: user.firstName });
        setNewMessage('');
    };

    // Formateur de date intelligent pour les messages
    const formatMessageDate = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        
        if (isToday) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        return date.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'short', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
            {/* BOITE DE CHOIX COMPACTE */}
            {view === 'choice' && (
                <div className="mb-4 w-[320px] bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden animate-fadeIn">
                    <div className="p-6 bg-brand-primary text-white text-center">
                        <h3 className="text-lg font-serif font-bold uppercase tracking-tight">Besoin d'aide ?</h3>
                        <p className="text-[10px] opacity-80 mt-1 font-black uppercase tracking-widest">Nos experts vous répondent</p>
                    </div>
                    <div className="p-4 space-y-3">
                        <a href="https://wa.me/21655263522" target="_blank" className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 hover:bg-green-50 rounded-2xl group transition-all">
                            <div className="w-10 h-10 bg-green-500 text-white flex items-center justify-center rounded-xl shadow-lg"><WhatsAppIcon className="w-5 h-5" /></div>
                            <div className="text-left"><p className="text-xs font-bold text-gray-900 dark:text-white">Ligne WhatsApp</p><p className="text-[9px] text-green-600 font-black uppercase tracking-tighter">Direct</p></div>
                        </a>
                        <button onClick={() => setView('chat')} className="w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 hover:bg-brand-light rounded-2xl group transition-all">
                            <div className="w-10 h-10 bg-brand-primary text-white flex items-center justify-center rounded-xl shadow-lg"><MedicalIcon className="w-5 h-5" /></div>
                            <div className="text-left"><p className="text-xs font-bold text-gray-900 dark:text-white">Chat interne</p><p className="text-[9px] text-brand-primary font-black uppercase tracking-tighter">Expert en ligne</p></div>
                        </button>
                    </div>
                </div>
            )}

            {/* FENÊTRE DE CHAT OPTIMISÉE (360x500) */}
            {view === 'chat' && (
                <div className="mb-4 w-[360px] bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col h-[500px] overflow-hidden animate-fadeIn">
                    <div className="p-5 bg-brand-primary text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setView('choice')} className="p-2 hover:bg-white/20 rounded-lg transition-colors"><ArrowLongLeftIcon className="w-4 h-4" /></button>
                            <div className="relative">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black text-xs">PN</div>
                                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-brand-primary ${isAdminOnline ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-tight">Support Pharma</p>
                                <p className="text-[8px] opacity-70 font-black uppercase tracking-widest">{isAdminOnline ? 'Connecté' : 'Réponse rapide'}</p>
                            </div>
                        </div>
                        <button onClick={() => setView('closed')} className="p-2 hover:bg-white/20 rounded-lg transition-colors"><XMarkIcon className="w-5 h-5" /></button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/30 dark:bg-transparent">
                        {messages.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Début du protocole de discussion</p>
                            </div>
                        )}
                        {messages.map((msg, i) => {
                            const isClient = msg.sender === 'client';
                            return (
                                <div key={i} className={`flex w-full ${isClient ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-4 text-xs rounded-2xl shadow-sm ${isClient ? 'bg-brand-primary text-white rounded-br-none' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none'}`}>
                                        <p className="leading-relaxed font-medium">{msg.content}</p>
                                        <p className="text-[7px] opacity-60 mt-2 font-black uppercase tracking-widest text-right">
                                            {formatMessageDate(msg.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="p-4 border-t dark:border-white/5 bg-white dark:bg-gray-800">
                        {user ? (
                            <div className="flex gap-2 bg-gray-50 dark:bg-brand-dark p-2 rounded-xl border border-gray-100 dark:border-white/5 focus-within:border-brand-primary transition-all">
                                <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Posez votre question..." className="flex-grow bg-transparent border-none text-xs p-2 focus:ring-0 placeholder:text-gray-400 font-medium" />
                                <button type="submit" className="bg-brand-primary text-white p-2.5 rounded-lg hover:bg-brand-primaryHover transition-all active:scale-90"><PaperAirplaneIcon className="w-4 h-4 -rotate-45" /></button>
                            </div>
                        ) : (
                            <p className="text-[9px] text-center text-gray-400 font-black uppercase tracking-widest py-1">Veuillez vous connecter pour écrire</p>
                        )}
                    </form>
                </div>
            )}

            {/* BOUTON DÉCLENCHEUR - Alignement fixe */}
            <button 
                onClick={() => setView(view === 'closed' ? 'choice' : 'closed')}
                className={`w-16 h-16 flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-105 active:scale-95 relative ${view !== 'closed' ? 'bg-white text-brand-dark rounded-full rotate-90 shadow-brand-primary/10' : 'bg-brand-primary text-white rounded-3xl'}`}
            >
                {view === 'closed' ? (
                    <div className="relative">
                        <MedicalIcon className="w-8 h-8" />
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-secondary rounded-full animate-ping border-[3px] border-brand-primary"></span>
                    </div>
                ) : <XMarkIcon className="w-7 h-7" />}
            </button>
        </div>
    );
};

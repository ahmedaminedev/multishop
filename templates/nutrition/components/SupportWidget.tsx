import React, { useState, useEffect, useRef } from 'react';
import { WhatsAppIcon, XMarkIcon, PaperAirplaneIcon, ArrowLongLeftIcon } from './IconComponents';
import type { User } from '../types';
import { socket } from '../utils/socket';
import { api } from '../utils/api';
import { Headphones, MessageSquare, Sparkles } from 'lucide-react';

interface Message {
    sender: 'client' | 'admin';
    content: string;
    type: 'text' | 'image' | 'video';
    timestamp: string;
}

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
        <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[100] flex flex-col items-end font-sans">
            
            {/* 1. MENU DE CHOIX (WhatsApp ou Chat) */}
            {view === 'choice' && (
                <div className="mb-4 w-[330px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 transition-all">
                    
                    {/* Header */}
                    <div className="relative p-5 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800 text-center">
                        <button 
                            onClick={() => setView('closed')}
                            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Fermer"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                        
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#84cc16]/10 text-[#4d7c0f] text-[10px] font-black uppercase tracking-wider mb-2">
                            <span className="w-2 h-2 rounded-full bg-[#84cc16] animate-pulse"></span>
                            <span>Conseillers En Ligne</span>
                        </div>

                        <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            Support Clients
                        </h3>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                            CHOISISSEZ VOTRE CANAL
                        </p>
                    </div>

                    {/* Channels List */}
                    <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
                        
                        {/* WhatsApp Direct */}
                        <a 
                            href="https://wa.me/21655263522" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3.5 p-3.5 bg-slate-50 hover:bg-[#25D366]/5 dark:bg-slate-800/50 dark:hover:bg-[#25D366]/10 border border-slate-200/80 dark:border-slate-800 hover:border-[#25D366] transition-all rounded-2xl cursor-pointer"
                        >
                            <div className="w-11 h-11 bg-[#25D366] text-white flex items-center justify-center rounded-xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
                                <WhatsAppIcon className="w-6 h-6" />
                            </div>
                            <div className="text-left flex-grow min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                        WhatsApp Direct
                                    </p>
                                    <span className="text-[10px] font-bold text-[#25D366] bg-[#25D366]/10 px-2 py-0.5 rounded-full">
                                        24/7
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                    Réponse rapide
                                </p>
                            </div>
                        </a>

                        {/* Live Chat HQ */}
                        <button 
                            type="button"
                            onClick={() => setView('chat')}
                            className="w-full group flex items-center gap-3.5 p-3.5 bg-slate-50 hover:bg-[#84cc16]/10 dark:bg-slate-800/50 dark:hover:bg-[#84cc16]/10 border border-slate-200/80 dark:border-slate-800 hover:border-[#84cc16] transition-all rounded-2xl cursor-pointer text-left"
                        >
                            <div className="w-11 h-11 bg-slate-900 dark:bg-slate-800 text-[#84cc16] border border-[#84cc16]/30 flex items-center justify-center rounded-xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
                                <MessageSquare className="w-5 h-5 stroke-[2.2]" />
                            </div>
                            <div className="text-left flex-grow min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                        Live Chat HQ
                                    </p>
                                    <span className="w-2 h-2 rounded-full bg-[#84cc16] animate-pulse"></span>
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                    Agents en ligne
                                </p>
                            </div>
                        </button>

                    </div>

                    {/* Footer hint */}
                    <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Équipe Fitness Shop Tunisie
                        </span>
                    </div>
                </div>
            )}

            {/* 2. TERMINAL DE CHAT */}
            {view === 'chat' && (
                <div className="mb-4 w-[360px] sm:w-[380px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-[520px] rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
                    
                    {/* Header */}
                    <div className="p-4 bg-slate-900 text-white border-b border-slate-800 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setView('choice')} 
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                                aria-label="Retour au choix du canal"
                            >
                                <ArrowLongLeftIcon className="w-5 h-5" />
                            </button>
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-[#84cc16]/20 border border-[#84cc16] flex items-center justify-center text-[#84cc16]">
                                    <Headphones className="w-4 h-4" />
                                </div>
                                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 ${isAdminOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                            </div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-tight text-white leading-tight">
                                    Live Support
                                </h3>
                                <p className="text-[10px] text-slate-400 font-medium">
                                    {isAdminOnline ? 'Agent disponible' : 'Messagerie active'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setView('closed')} 
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                            aria-label="Fermer"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/40">
                        {messages.length === 0 && (
                            <div className="text-center py-10 px-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#84cc16]/10 text-[#4d7c0f] flex items-center justify-center mx-auto mb-3">
                                    <Sparkles className="w-6 h-6 stroke-[2]" />
                                </div>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                                    Bienvenue sur le Live Chat Fitness Shop
                                </h4>
                                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed max-w-[240px] mx-auto">
                                    Posez vos questions sur les haltères, bancs, délais de livraison et conseils d'entraînement.
                                </p>
                            </div>
                        )}

                        {messages.map((msg, i) => {
                            const isClient = msg.sender === 'client';
                            return (
                                <div key={i} className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] px-4 py-2.5 text-xs font-medium rounded-2xl shadow-2xs ${
                                        isClient 
                                            ? 'bg-slate-900 text-white rounded-br-xs border border-slate-800' 
                                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/80 rounded-bl-xs'
                                    }`}>
                                        <p className="leading-relaxed">{msg.content}</p>
                                    </div>
                                    <span className="mt-1 text-[9px] font-medium text-slate-400 uppercase tracking-wider px-1">
                                        {formatFullDate(msg.timestamp)}
                                    </span>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Bar */}
                    <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
                        {user ? (
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-1.5 focus-within:border-[#84cc16] focus-within:bg-white dark:focus-within:bg-slate-900 transition-all rounded-2xl">
                                <input 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Écrivez votre message..."
                                    className="flex-grow bg-transparent border-none text-slate-900 dark:text-white text-xs px-2.5 py-1.5 focus:ring-0 outline-none placeholder:text-slate-400"
                                />
                                <button 
                                    type="submit" 
                                    className="w-9 h-9 rounded-xl bg-[#84cc16] hover:bg-[#72b012] text-slate-950 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
                                    aria-label="Envoyer"
                                >
                                    <PaperAirplaneIcon className="w-4 h-4 -rotate-45" />
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-2 px-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                                    Veuillez <a href="#/login" className="text-[#4d7c0f] dark:text-[#84cc16] font-bold underline">vous connecter</a> pour démarrer le chat.
                                </p>
                            </div>
                        )}
                    </form>
                </div>
            )}

            {/* 3. BOUTON FLOTTANT CONCIERGE & SUPPORT */}
            <button 
                type="button"
                onClick={() => setView(view === 'closed' ? 'choice' : 'closed')}
                className={`relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer ${
                    view !== 'closed' 
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700' 
                        : 'bg-slate-900 text-white border-2 border-[#84cc16] shadow-[#84cc16]/20'
                }`}
                aria-label="Ouvrir le support client"
            >
                {view === 'closed' ? (
                    <div className="relative flex flex-col items-center justify-center">
                        <Headphones className="w-6 h-6 sm:w-7 sm:h-7 text-[#84cc16] group-hover:scale-110 transition-transform" />
                        
                        {/* Live Online Pulse Indicator */}
                        <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#84cc16] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#84cc16] border-2 border-slate-900"></span>
                        </span>
                    </div>
                ) : (
                    <XMarkIcon className="w-6 h-6 text-slate-700 dark:text-slate-200" />
                )}
            </button>
        </div>
    );
};

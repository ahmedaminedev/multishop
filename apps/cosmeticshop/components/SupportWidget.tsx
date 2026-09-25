
import React, { useState, useEffect, useRef } from 'react';
import { WhatsAppIcon, XMarkIcon, PhotoIcon, SearchIcon, PaperAirplaneIcon, UserIcon, CustomerSupportIcon } from './IconComponents';
import type { User } from '../types';
import { socket } from '../utils/socket';
import { api } from '../utils/api';
import { MediaViewerModal } from './MediaViewerModal';

interface SupportWidgetProps {
    user: User | null;
}

const ChatIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-2.281m-5.518 5.518a2.126 2.126 0 00-2.282-.476 2.125 2.125 0 00-1.53 2.105v4.286c0 1.136.847 2.1 1.98 2.193.34.027.68.052 1.02.072M6.825 19.475l-3 3V19.38c-.34-.02-.68-.045-1.02-.072a2.125 2.125 0 01-1.98-2.193V9.38c0-1.136.847-2.1 1.98-2.193 1.354-.109 2.694-.163 4.02-.163 1.98 0 3.9.115 5.685.345" />
    </svg>
);

interface Message {
    sender: 'client' | 'admin';
    content: string;
    type: 'text' | 'image' | 'video';
    timestamp: string;
}

export const SupportWidget: React.FC<SupportWidgetProps> = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [chatMode, setChatMode] = useState<'menu' | 'live'>('menu');
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isAdminOnline, setIsAdminOnline] = useState(false);
    const [previewMedia, setPreviewMedia] = useState<{src: string, type: 'image' | 'video'} | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user && user.role === 'CUSTOMER') {
            socket.connect();
            socket.emit('join_room', user.id);
            socket.emit('check_admin_status');

            socket.on('receive_message', (msg: any) => {
                setMessages(prev => [...prev, msg]);
            });

            socket.on('admin_status', (status: { online: boolean }) => {
                setIsAdminOnline(status.online);
            });

            api.getChatHistory(user.id.toString())
                .then(data => {
                    if (data && data.messages) {
                        setMessages(data.messages);
                    }
                })
                .catch(err => console.error("Failed to load chat history", err));

            return () => {
                socket.off('receive_message');
                socket.off('admin_status');
                socket.disconnect();
            };
        }
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, chatMode, isOpen]);

    const handleWhatsAppClick = () => {
        window.open('https://wa.me/21655263522', '_blank');
        setIsOpen(false);
    };

    const handleLiveChatClick = () => {
        setChatMode('live');
    };

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!newMessage.trim()) || !user) return;

        const messageData = {
            userId: user.id,
            userEmail: user.email,
            userName: `${user.firstName} ${user.lastName}`,
            sender: 'client',
            content: newMessage,
            type: 'text'
        };

        socket.emit('send_message', messageData);
        setNewMessage('');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && user) {
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) { 
                alert("Le fichier est trop volumineux (Max 5MB)");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                const fileType = file.type.startsWith('video/') ? 'video' : 'image';

                const messageData = {
                    userId: user.id,
                    userEmail: user.email,
                    userName: `${user.firstName} ${user.lastName}`,
                    sender: 'client',
                    content: base64,
                    type: fileType
                };
                socket.emit('send_message', messageData);
            };
            reader.readAsDataURL(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleMainButtonClick = () => {
        if (!user) {
            // Visitor -> WhatsApp direct
            handleWhatsAppClick();
        } else {
            // Customer -> Toggle Menu
            setIsOpen(!isOpen);
            if (!isOpen) setChatMode('menu'); 
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
            {/* Chat Window */}
            {isOpen && user && (
                <div className="mb-6 bg-white dark:bg-gray-900 w-[350px] sm:w-[380px] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 dark:border-gray-700 overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right animate-fadeInUp ring-1 ring-black/5" style={{ height: '600px', maxHeight: '80vh' }}>
                    
                    {/* Header Moderne */}
                    <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-5 relative overflow-hidden">
                        {/* Decorative Circles */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"></div>

                        <div className="flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/10">
                                    <ChatIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight text-white font-serif tracking-wide">Cosmetics Assistant</h3>
                                    {chatMode === 'live' && (
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className={`w-2 h-2 rounded-full ${isAdminOnline ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-gray-400'}`}></span>
                                            <p className="text-[10px] text-white/90 font-medium uppercase tracking-wider">
                                                {isAdminOnline ? 'En ligne' : 'Absent'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)} 
                                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors text-white backdrop-blur-sm"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-grow bg-[#FDFBF9] dark:bg-gray-900 flex flex-col overflow-hidden relative">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                        {chatMode === 'menu' ? (
                            <div className="p-6 flex flex-col justify-center h-full gap-4 relative z-10">
                                <div className="text-center mb-6">
                                    <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-white dark:from-gray-800 dark:to-gray-700 rounded-full mx-auto flex items-center justify-center mb-4 shadow-inner">
                                        <CustomerSupportIcon className="w-10 h-10 text-rose-500" />
                                    </div>
                                    <h4 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-2">Bonjour, {user.firstName}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Comment pouvons-nous vous aider aujourd'hui ?</p>
                                </div>
                                
                                <button onClick={handleLiveChatClick} className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-rose-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 p-3 rounded-xl relative z-10">
                                        <ChatIcon className="w-6 h-6" />
                                    </div>
                                    <div className="text-left relative z-10">
                                        <p className="font-bold text-gray-800 dark:text-white">Discuter avec nous</p>
                                        <p className="text-xs text-gray-500">Réponse en direct</p>
                                    </div>
                                </button>

                                <button onClick={handleWhatsAppClick} className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="bg-green-100 dark:bg-green-900/30 text-green-600 p-3 rounded-xl relative z-10">
                                        <WhatsAppIcon className="w-6 h-6" />
                                    </div>
                                    <div className="text-left relative z-10">
                                        <p className="font-bold text-gray-800 dark:text-white">WhatsApp</p>
                                        <p className="text-xs text-gray-500">Si vous êtes pressé</p>
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex-grow overflow-y-auto p-4 space-y-6 custom-scrollbar relative z-10">
                                    {!isAdminOnline && (
                                        <div className="mx-auto max-w-[90%] bg-white dark:bg-gray-800 border border-rose-100 dark:border-gray-700 p-4 rounded-2xl shadow-sm text-center">
                                            <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-1">Service Fermé</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Nos conseillers sont absents. Laissez un message, nous vous répondrons par email dès notre retour.</p>
                                        </div>
                                    )}
                                    
                                    {/* Date separator example */}
                                    <div className="flex justify-center">
                                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full uppercase tracking-wider">Aujourd'hui</span>
                                    </div>

                                    {messages.map((msg, idx) => {
                                        const isClient = msg.sender === 'client';
                                        return (
                                            <div key={idx} className={`flex ${isClient ? 'justify-end' : 'justify-start'} group items-end gap-2`}>
                                                
                                                {/* Admin Avatar */}
                                                {!isClient && (
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 flex-shrink-0 border-2 border-white dark:border-gray-800 shadow-sm">
                                                        <CustomerSupportIcon className="w-4 h-4" />
                                                    </div>
                                                )}

                                                <div className={`max-w-[75%] space-y-1`}>
                                                    <div className={`p-3.5 shadow-sm text-sm leading-relaxed ${
                                                        isClient 
                                                        ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-2xl rounded-tr-none' 
                                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-none'
                                                    }`}>
                                                        {msg.type === 'image' ? (
                                                            <div className="relative group cursor-pointer overflow-hidden rounded-lg" onClick={() => setPreviewMedia({src: msg.content, type: 'image'})}>
                                                                <img src={msg.content} alt="Envoi" className="max-w-full transition-transform duration-500 group-hover:scale-105" />
                                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                                                    <SearchIcon className="w-5 h-5 text-white drop-shadow-md" />
                                                                </div>
                                                            </div>
                                                        ) : msg.type === 'video' ? (
                                                            <div className="relative group cursor-pointer overflow-hidden rounded-lg" onClick={() => setPreviewMedia({src: msg.content, type: 'video'})}>
                                                                <video src={msg.content} className="max-w-full" />
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                                    <div className="bg-white/90 rounded-full p-2 shadow-lg">
                                                                        <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                                        )}
                                                    </div>
                                                    <p className={`text-[9px] font-medium opacity-60 ${isClient ? 'text-right text-gray-500' : 'text-left text-gray-400'}`}>
                                                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 relative z-20">
                                    <form onSubmit={handleSendMessage} className="flex items-end gap-2 bg-gray-50 dark:bg-gray-900 rounded-[1.5rem] p-2 border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-rose-100 dark:focus-within:ring-rose-900 transition-all">
                                        <button 
                                            type="button" 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-2.5 text-gray-400 hover:text-rose-500 transition-colors rounded-full hover:bg-white dark:hover:bg-gray-800"
                                            title="Joindre un fichier"
                                        >
                                            <PhotoIcon className="w-5 h-5" />
                                        </button>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            accept="image/*,video/*"
                                            onChange={handleFileUpload}
                                        />
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if(e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                            placeholder="Écrivez votre message..."
                                            rows={1}
                                            className="flex-grow bg-transparent border-none py-3 px-2 text-sm focus:ring-0 text-gray-800 dark:text-white placeholder-gray-400 resize-none max-h-24 custom-scrollbar"
                                        />
                                        <button 
                                            type="submit" 
                                            disabled={!newMessage.trim()}
                                            className="p-2.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95"
                                        >
                                            <PaperAirplaneIcon className="w-5 h-5 transform -rotate-45 translate-x-0.5" />
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Main Floating Button */}
            <button
                onClick={handleMainButtonClick}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(225,29,72,0.4)] transition-all duration-300 hover:scale-110 active:scale-95 z-50 ${
                    user 
                    ? (isOpen ? 'bg-gray-800 rotate-90 border-4 border-gray-700' : 'bg-gradient-to-br from-rose-500 to-pink-600 border-4 border-white dark:border-gray-800') 
                    : 'bg-green-500 hover:bg-green-600 border-4 border-white dark:border-gray-800'
                } text-white`}
                aria-label={user ? "Ouvrir le support" : "Contacter sur WhatsApp"}
            >
                {isOpen ? (
                    <XMarkIcon className="w-6 h-6 md:w-8 md:h-8" />
                ) : !user ? (
                    <WhatsAppIcon className="w-6 h-6 md:w-8 md:h-8" />
                ) : (
                    <div className="relative">
                        <ChatIcon className="w-6 h-6 md:w-7 md:h-7" />
                        {isAdminOnline && (
                            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full animate-bounce"></span>
                        )}
                    </div>
                )}
            </button>

            {/* Media Viewer Modal */}
            {previewMedia && (
                <MediaViewerModal 
                    src={previewMedia.src} 
                    type={previewMedia.type} 
                    onClose={() => setPreviewMedia(null)} 
                />
            )}
        </div>
    );
};

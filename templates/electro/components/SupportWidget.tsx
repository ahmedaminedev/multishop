
import React, { useState, useEffect, useRef } from 'react';
import { WhatsAppIcon, XMarkIcon, PhotoIcon, SearchIcon } from './IconComponents';
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

const PaperAirplaneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
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
                <div className="mb-4 bg-white dark:bg-gray-800 w-80 sm:w-96 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right animate-fadeInUp" style={{ height: '500px', maxHeight: '80vh' }}>
                    
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-3">
                            <ChatIcon className="w-6 h-6" />
                            <div>
                                <h3 className="font-bold text-lg leading-tight">Support Client</h3>
                                {chatMode === 'live' && (
                                    <p className="text-xs opacity-90 flex items-center gap-1.5 mt-0.5">
                                        <span className={`w-2 h-2 rounded-full ${isAdminOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></span>
                                        {isAdminOnline ? 'Conseiller en ligne' : 'Conseiller absent'}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-grow bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden relative">
                        {chatMode === 'menu' ? (
                            <div className="p-6 flex flex-col justify-center h-full gap-4">
                                <p className="text-center text-gray-600 dark:text-gray-300 mb-2 font-medium">Comment souhaitez-vous nous contacter ?</p>
                                
                                <button onClick={handleWhatsAppClick} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-green-100 hover:border-green-500 group">
                                    <div className="bg-green-500 text-white p-3 rounded-full group-hover:scale-110 transition-transform shadow-green-200 shadow-md">
                                        <WhatsAppIcon className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-800 dark:text-white text-lg">WhatsApp</p>
                                        <p className="text-xs text-gray-500">Réponse rapide via l'app</p>
                                    </div>
                                </button>

                                <button onClick={handleLiveChatClick} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-blue-100 hover:border-blue-500 group">
                                    <div className="bg-blue-500 text-white p-3 rounded-full group-hover:scale-110 transition-transform shadow-blue-200 shadow-md">
                                        <ChatIcon className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-800 dark:text-white text-lg">Live Chat</p>
                                        <p className="text-xs text-gray-500">Discussion instantanée</p>
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                    {!isAdminOnline && (
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 p-3 rounded-lg text-sm text-center shadow-sm">
                                            <strong>Note :</strong> Nos conseillers sont actuellement indisponibles. Laissez un message, nous vous répondrons dès leur retour.
                                        </div>
                                    )}
                                    
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm ${
                                                msg.sender === 'client' 
                                                ? 'bg-red-600 text-white rounded-br-none' 
                                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none'
                                            }`}>
                                                {msg.type === 'image' ? (
                                                    <div className="relative group cursor-pointer" onClick={() => setPreviewMedia({src: msg.content, type: 'image'})}>
                                                        <img src={msg.content} alt="Envoi" className="max-w-full rounded-lg border border-white/20 transition-opacity group-hover:opacity-90" />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                                                            <SearchIcon className="w-6 h-6 text-white drop-shadow-md" />
                                                        </div>
                                                    </div>
                                                ) : msg.type === 'video' ? (
                                                    <div className="relative group cursor-pointer" onClick={() => setPreviewMedia({src: msg.content, type: 'video'})}>
                                                        <video src={msg.content} className="max-w-full rounded-lg border border-white/20" />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg group-hover:bg-black/10 transition-colors">
                                                            <div className="bg-white/80 rounded-full p-2">
                                                                <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                                )}
                                                <p className={`text-[10px] mt-1 text-right opacity-70 ${msg.sender === 'client' ? 'text-white' : 'text-gray-500'}`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex items-center gap-2">
                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                        title="Envoyer une image ou vidéo"
                                    >
                                        <PhotoIcon className="w-6 h-6" />
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*,video/*"
                                        onChange={handleFileUpload}
                                    />
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Votre message..."
                                        className="flex-grow bg-gray-100 dark:bg-gray-700 border-none rounded-full py-2.5 px-4 text-sm focus:ring-2 focus:ring-red-500 transition-shadow"
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={!newMessage.trim()}
                                        className="p-2.5 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95"
                                    >
                                        <PaperAirplaneIcon className="w-5 h-5 transform rotate-[-45deg] translate-x-[-1px] translate-y-[1px]" />
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* FAB */}
            <button
                onClick={handleMainButtonClick}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl ${
                    user 
                    ? (isOpen ? 'bg-gray-700 rotate-90' : 'bg-red-600 hover:bg-red-700') 
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
                aria-label={user ? "Ouvrir le support" : "Contacter sur WhatsApp"}
            >
                {isOpen ? (
                    <XMarkIcon className="w-8 h-8" />
                ) : !user ? (
                    <WhatsAppIcon className="w-8 h-8" />
                ) : (
                    <div className="relative">
                        <ChatIcon className="w-8 h-8" />
                        {isAdminOnline && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-red-600 rounded-full"></span>
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

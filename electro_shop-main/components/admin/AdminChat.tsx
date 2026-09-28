
import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../../utils/socket';
import { api } from '../../utils/api';
import { UserIcon, SearchIcon, PhotoIcon } from '../IconComponents';
import { MediaViewerModal } from '../MediaViewerModal';

// Icon helper for PaperAirplane
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

interface ChatSession {
    _id: string;
    userId: string;
    userEmail: string;
    userName: string;
    lastUpdated: string;
    messages: Message[];
}

export const AdminChat: React.FC = () => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isOnline, setIsOnline] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [previewMedia, setPreviewMedia] = useState<{src: string, type: 'image' | 'video'} | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Init Socket & Status
        socket.connect();
        toggleOnlineStatus(true); // Auto online on mount
        loadChats();

        // Listeners
        socket.on('refresh_chats', (data: { userId: string, lastMessage: Message }) => {
            loadChats();
            if (selectedSessionId === data.userId) {
                setMessages(prev => [...prev, data.lastMessage]);
            }
        });

        return () => {
            toggleOnlineStatus(false);
            socket.off('refresh_chats');
            socket.disconnect();
        };
    }, [selectedSessionId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadChats = async () => {
        try {
            const data = await api.getAllChats();
            setSessions(data);
        } catch (e) {
            console.error("Failed to load chats", e);
        }
    };

    const toggleOnlineStatus = (status: boolean) => {
        setIsOnline(status);
        if (status) {
            socket.emit('admin_join');
        } else {
            socket.emit('admin_leave');
        }
    };

    const handleSelectSession = async (session: ChatSession) => {
        setSelectedSessionId(session.userId);
        try {
            const chatData = await api.getChatHistory(session.userId);
            setMessages(chatData.messages || []);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !selectedSessionId) return;

        const messageData = {
            userId: selectedSessionId,
            sender: 'admin',
            content: newMessage,
            type: 'text'
        };

        socket.emit('send_message', messageData);
        // Suppression de l'update optimiste pour éviter le doublon
        // Le message sera ajouté via le listener 'refresh_chats'
        setNewMessage('');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && selectedSessionId) {
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
                    userId: selectedSessionId,
                    sender: 'admin',
                    content: base64,
                    type: fileType
                };
                socket.emit('send_message', messageData);
                // Suppression de l'update optimiste pour éviter le doublon
            };
            reader.readAsDataURL(file);
        }
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const filteredSessions = sessions.filter(s => 
        (s.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border dark:border-gray-700">
            {/* Header */}
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Messagerie Client</h2>
                <button 
                    onClick={() => toggleOnlineStatus(!isOnline)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm ${isOnline ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                >
                    <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {isOnline ? 'En ligne' : 'Hors ligne'}
                </button>
            </div>

            <div className="flex flex-grow overflow-hidden">
                {/* Sidebar List */}
                <div className="w-1/3 border-r dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
                    <div className="p-4 border-b dark:border-gray-700">
                        <div className="relative">
                            <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input 
                                type="text" 
                                placeholder="Rechercher..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {filteredSessions.map(session => (
                            <div 
                                key={session._id}
                                onClick={() => handleSelectSession(session)}
                                className={`p-4 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedSessionId === session.userId ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-l-red-600' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-gray-800 dark:text-gray-100 truncate">{session.userName || 'Utilisateur inconnu'}</h4>
                                    <span className="text-xs text-gray-500">{new Date(session.lastUpdated).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{session.userEmail}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                                    {session.messages[session.messages.length - 1]?.type === 'image' ? '📷 Image' : 
                                     session.messages[session.messages.length - 1]?.type === 'video' ? '🎥 Vidéo' : 
                                     session.messages[session.messages.length - 1]?.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="w-2/3 flex flex-col bg-gray-50 dark:bg-gray-900">
                    {selectedSessionId ? (
                        <>
                            {/* Active Chat Header */}
                            <div className="p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600">
                                    <UserIcon className="w-6 h-6"/>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 dark:text-white">
                                        {sessions.find(s => s.userId === selectedSessionId)?.userName}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {sessions.find(s => s.userId === selectedSessionId)?.userEmail}
                                    </p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-grow overflow-y-auto p-6 space-y-4">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm text-sm ${
                                            msg.sender === 'admin' 
                                            ? 'bg-blue-600 text-white rounded-br-none' 
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
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            )}
                                            <div className="flex justify-end items-center gap-1 mt-1">
                                                <span className={`text-[10px] opacity-70 ${msg.sender === 'admin' ? 'text-white' : 'text-gray-500'}`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
                                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
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
                                        placeholder="Écrivez votre réponse..."
                                        className="flex-grow bg-gray-100 dark:bg-gray-700 border-none rounded-full py-3 px-5 text-sm focus:ring-2 focus:ring-blue-500 transition-shadow"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
                                    >
                                        <PaperAirplaneIcon className="w-5 h-5 transform rotate-[-45deg] translate-x-[-1px] translate-y-[1px]" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                <PaperAirplaneIcon className="w-12 h-12 transform rotate-[-45deg] text-gray-300 dark:text-gray-600" />
                            </div>
                            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Sélectionnez une conversation</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">pour commencer à discuter avec un client</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal pour zoomer sur les images/vidéos */}
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

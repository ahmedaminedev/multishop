
import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../../utils/socket';
import { api } from '../../utils/api';
import { 
    UserIcon, 
    SearchIcon, 
    PhotoIcon, 
    PaperAirplaneIcon, 
    ClockIcon, 
    CheckCircleIcon, 
    Bars3Icon, 
    PaperClipIcon, 
    FaceSmileIcon, 
    EllipsisHorizontalIcon,
    CheckDoubleIcon,
    XMarkIcon,
    ArrowLongLeftIcon,
    // Fixed: ChatBubbleLeftRightIcon was missing in imports
    ChatBubbleLeftRightIcon
} from '../IconComponents';
import { MediaViewerModal } from '../MediaViewerModal';

interface Message {
    sender: 'client' | 'admin';
    content: string;
    type: 'text' | 'image' | 'video';
    timestamp: string;
    read?: boolean;
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
    const [showSidebarMobile, setShowSidebarMobile] = useState(true);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        socket.connect();
        toggleOnlineStatus(true);
        loadChats();

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
        setShowSidebarMobile(false);
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
        setNewMessage('');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && selectedSessionId) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                const fileType = file.type.startsWith('video/') ? 'video' : 'image';
                socket.emit('send_message', {
                    userId: selectedSessionId,
                    sender: 'admin',
                    content: base64,
                    type: fileType
                });
            };
            reader.readAsDataURL(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const filteredSessions = sessions.filter(s => 
        (s.userName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeSession = sessions.find(s => s.userId === selectedSessionId);

    return (
        <div className="flex h-full w-full bg-white dark:bg-brand-dark font-sans overflow-hidden transition-all duration-500">
            
            {/* --- LISTE DES PATIENTS (LEFT) --- */}
            <div className={`
                ${showSidebarMobile ? 'flex' : 'hidden'} md:flex 
                w-full md:w-80 lg:w-96 flex-col border-r border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-black/10 transition-all
            `}>
                <div className="p-8 border-b border-slate-100 dark:border-white/5">
                    <h2 className="text-xl font-serif font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">
                        Support <span className="text-brand-primary italic">Live</span>
                    </h2>
                    <div className="relative group">
                        <SearchIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input 
                            type="text" 
                            placeholder="CHERCHER UN PATIENT..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                    {filteredSessions.map(session => {
                        const isActive = selectedSessionId === session.userId;
                        const lastMsg = session.messages[session.messages.length - 1];
                        return (
                            <button 
                                key={session._id}
                                onClick={() => handleSelectSession(session)}
                                className={`w-full p-4 rounded-2xl text-left transition-all group flex items-center gap-4 border ${isActive ? 'bg-white dark:bg-brand-primary/10 border-brand-primary/30 shadow-lg scale-[1.02]' : 'bg-transparent border-transparent hover:bg-white/50 dark:hover:bg-white/5'}`}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-xl bg-brand-light dark:bg-gray-800 flex items-center justify-center text-brand-primary font-serif font-black text-lg shadow-sm">
                                        {session.userName?.charAt(0) || '?'}
                                    </div>
                                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-4 border-white dark:border-brand-dark"></span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase truncate">{session.userName || 'Patient'}</p>
                                    <p className="text-[9px] text-slate-400 truncate font-medium mt-1">
                                        {lastMsg?.type === 'text' ? lastMsg.content : '📷 Image reçue'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-slate-300 uppercase">
                                        {new Date(session.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* --- ZONE DE CHAT (RIGHT) --- */}
            <div className={`flex-1 flex flex-col relative bg-white dark:bg-brand-dark ${!showSidebarMobile ? 'flex' : 'hidden md:flex'}`}>
                {selectedSessionId && activeSession ? (
                    <>
                        {/* Header Chat */}
                        <div className="h-20 px-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white/80 dark:bg-brand-dark/80 backdrop-blur-xl z-20">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setShowSidebarMobile(true)} className="md:hidden p-2 text-slate-400"><ArrowLongLeftIcon className="w-5 h-5"/></button>
                                <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-lg">
                                    <UserIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-serif font-bold text-slate-900 dark:text-white uppercase leading-none">{activeSession.userName}</h3>
                                    <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Consultation Active
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400 hover:text-brand-primary transition-all"><ClockIcon className="w-5 h-5"/></button>
                                <button className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400 hover:text-rose-500 transition-all"><EllipsisHorizontalIcon className="w-5 h-5"/></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-6 bg-slate-50/30 dark:bg-black/20 custom-scrollbar">
                            {messages.map((msg, idx) => {
                                const isAdmin = msg.sender === 'admin';
                                return (
                                    <div key={idx} className={`flex w-full ${isAdmin ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                                        <div className={`max-w-[70%] flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                                            <div className={`
                                                p-5 text-sm font-medium shadow-sm transition-all
                                                ${isAdmin 
                                                    ? 'bg-brand-primary text-white rounded-[2rem] rounded-br-none shadow-brand-primary/20' 
                                                    : 'bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-200 rounded-[2rem] rounded-bl-none border border-slate-100 dark:border-white/5'
                                                }
                                            `}>
                                                {msg.type === 'image' ? (
                                                    <div className="cursor-pointer overflow-hidden rounded-xl" onClick={() => setPreviewMedia({src: msg.content, type: 'image'})}>
                                                        <img src={msg.content} alt="Media" className="max-w-xs object-cover" />
                                                    </div>
                                                ) : (
                                                    <p className="leading-relaxed">{msg.content}</p>
                                                )}
                                            </div>
                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-2 px-2">
                                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Footer */}
                        <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-brand-dark">
                            <form 
                                onSubmit={handleSendMessage} 
                                className="max-w-4xl mx-auto flex items-center gap-4 bg-slate-50 dark:bg-black/40 p-2 rounded-3xl border border-slate-200 dark:border-white/10 transition-all focus-within:ring-4 focus-within:ring-brand-primary/5 focus-within:border-brand-primary/30"
                            >
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3 text-slate-400 hover:text-brand-primary transition-colors"
                                >
                                    <PaperClipIcon className="w-5 h-5" />
                                </button>
                                <input 
                                    type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload}
                                />
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="VOTRE RÉPONSE EXPERTE..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-300 py-3"
                                />
                                <button 
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="w-12 h-12 bg-brand-primary text-white rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all flex items-center justify-center disabled:opacity-50 disabled:shadow-none"
                                >
                                    <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-24 h-24 bg-brand-light dark:bg-white/5 rounded-full flex items-center justify-center text-brand-primary mb-8 animate-pulse">
                            <ChatBubbleLeftRightIcon className="w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-serif font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Canal de Conseil Sécurisé</h2>
                        <p className="text-slate-400 font-medium max-w-sm">Veuillez sélectionner une session pour débuter le protocole d'assistance en temps réel.</p>
                    </div>
                )}
            </div>

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

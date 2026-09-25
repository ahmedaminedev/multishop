
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
    CheckDoubleIcon
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
    const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all'); // Visual filter
    
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
            const maxSize = 5 * 1024 * 1024;
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
            };
            reader.readAsDataURL(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const filteredSessions = sessions.filter(s => 
        (s.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeSession = sessions.find(s => s.userId === selectedSessionId);

    const getInitials = (name: string) => (name || '?').charAt(0).toUpperCase();

    return (
        <div className="flex h-full w-full bg-gray-50 dark:bg-[#050505] font-sans overflow-hidden text-gray-900 dark:text-white transition-colors duration-300">
            
            {/* --- SIDEBAR --- */}
            <div className={`
                ${showSidebarMobile ? 'flex' : 'hidden'} md:flex 
                w-full md:w-[350px] lg:w-[380px] border-r border-gray-200 dark:border-gray-800 flex-col bg-white dark:bg-[#0a0a0a] z-20 shadow-xl
            `}>
                {/* Header */}
                <div className="h-20 px-6 flex flex-col justify-center border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] sticky top-0 z-10 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-xl font-black uppercase italic tracking-wider flex items-center gap-2">
                            Live <span className="text-black dark:text-brand-neon">Ops</span>
                        </h2>
                        <div className="flex gap-2">
                            <button onClick={() => setActiveFilter('all')} className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 border transition-colors ${activeFilter === 'all' ? 'bg-black dark:bg-brand-neon text-white dark:text-black border-black dark:border-brand-neon' : 'bg-transparent text-gray-500 border-gray-300 dark:border-gray-700 hover:text-black dark:hover:text-white'}`}>Tous</button>
                            <button onClick={() => setActiveFilter('unread')} className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 border transition-colors ${activeFilter === 'unread' ? 'bg-black dark:bg-brand-neon text-white dark:text-black border-black dark:border-brand-neon' : 'bg-transparent text-gray-500 border-gray-300 dark:border-gray-700 hover:text-black dark:hover:text-white'}`}>Non lus</button>
                        </div>
                    </div>
                </div>
                
                {/* Search */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="relative group">
                        <SearchIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-brand-neon transition-colors"/>
                        <input 
                            type="text" 
                            placeholder="RECHERCHER..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider focus:outline-none focus:border-black dark:focus:border-brand-neon transition-colors"
                        />
                    </div>
                </div>

                {/* Session List */}
                <div className="flex-grow overflow-y-auto custom-scrollbar px-0 space-y-0">
                    {filteredSessions.map(session => {
                        const lastMsg = session.messages[session.messages.length - 1];
                        const isActive = selectedSessionId === session.userId;
                        const timeString = new Date(session.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

                        return (
                            <div 
                                key={session._id}
                                onClick={() => handleSelectSession(session)}
                                className={`
                                    group relative p-4 cursor-pointer transition-all duration-200 border-b border-gray-100 dark:border-gray-800
                                    ${isActive ? 'bg-gray-100 dark:bg-[#1f2833] border-l-4 border-l-black dark:border-l-brand-neon' : 'hover:bg-gray-50 dark:hover:bg-[#111] border-l-4 border-l-transparent'}
                                `}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="relative">
                                        <div className={`w-10 h-10 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-xs uppercase`}>
                                            {getInitials(session.userName)}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className={`text-xs font-bold uppercase tracking-wide truncate ${isActive ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white'}`}>
                                                {session.userName || 'INCONNU'}
                                            </h4>
                                            <span className="text-[10px] font-mono text-gray-500 dark:text-gray-600">
                                                {timeString}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 truncate font-mono">
                                            {lastMsg?.sender === 'admin' ? 'Vous: ' : ''}
                                            <span className={`${lastMsg?.sender === 'client' && !lastMsg.read ? 'text-black dark:text-brand-neon font-bold' : ''}`}>
                                                {lastMsg?.type === 'image' ? '[IMAGE]' : lastMsg?.type === 'video' ? '[VIDÉO]' : lastMsg?.content}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- MAIN CHAT AREA --- */}
            <div className={`flex-1 flex flex-col relative bg-gray-50 dark:bg-[#050505] ${!showSidebarMobile && 'block'} ${showSidebarMobile && 'hidden md:flex'}`}>
                
                {selectedSessionId && activeSession ? (
                    <>
                        {/* Header */}
                        <div className="h-20 px-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-[#050505] sticky top-0 z-30 transition-colors">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setShowSidebarMobile(true)} className="md:hidden p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white">
                                    <Bars3Icon className="w-6 h-6" />
                                </button>

                                <div className="w-10 h-10 bg-gray-100 dark:bg-[#1f2833] border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-white font-bold text-sm">
                                    {getInitials(activeSession.userName)}
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 dark:text-white uppercase text-sm tracking-widest leading-none mb-1">
                                        {activeSession.userName}
                                    </h3>
                                    <p className="text-[10px] font-mono text-gray-500 uppercase">
                                        ID: {activeSession.userId.substring(0,8)}...
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> ACTIF
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 bg-gray-50 dark:bg-[#050505]">
                            <div className="flex justify-center my-4">
                                <span className="bg-gray-200 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 text-gray-500 text-[10px] font-bold px-3 py-1 uppercase tracking-wider">Aujourd'hui</span>
                            </div>

                            {messages.map((msg, idx) => {
                                const isAdmin = msg.sender === 'admin';
                                
                                return (
                                    <div key={idx} className={`flex w-full ${isAdmin ? 'justify-end' : 'justify-start'} group animate-fadeIn`}>
                                        <div className={`flex flex-col max-w-[75%] ${isAdmin ? 'items-end' : 'items-start'}`}>
                                            <div 
                                                className={`
                                                    relative px-4 py-3 text-sm shadow-sm transition-all border
                                                    ${isAdmin 
                                                        ? 'bg-black dark:bg-brand-neon text-white dark:text-black font-bold border-black dark:border-brand-neon skew-x-[-6deg]' 
                                                        : 'bg-white dark:bg-[#1f2833] text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 skew-x-[6deg]'
                                                    }
                                                    ${msg.type !== 'text' ? 'p-1 bg-transparent border-none skew-x-0' : ''}
                                                `}
                                            >
                                                <div className={isAdmin ? 'skew-x-[6deg]' : 'skew-x-[-6deg]'}>
                                                    {msg.type === 'image' ? (
                                                        <div className="cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700" onClick={() => setPreviewMedia({src: msg.content, type: 'image'})}>
                                                            <img src={msg.content} alt="Media" className="max-w-xs max-h-64 object-cover" />
                                                        </div>
                                                    ) : msg.type === 'video' ? (
                                                        <div className="cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700" onClick={() => setPreviewMedia({src: msg.content, type: 'video'})}>
                                                            <video src={msg.content} className="max-w-xs max-h-64 object-cover" />
                                                        </div>
                                                    ) : (
                                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Meta Info */}
                                            <div className={`flex items-center gap-1.5 mt-1.5 px-1 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <span className="text-[9px] text-gray-500 font-mono">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-[#080808] border-t border-gray-200 dark:border-gray-800 z-20">
                            <form 
                                onSubmit={handleSendMessage} 
                                className="max-w-4xl mx-auto flex items-end gap-3 bg-gray-50 dark:bg-[#111] p-2 border border-gray-300 dark:border-gray-700 transition-all"
                            >
                                <div className="flex gap-1 ml-2 mb-1">
                                    <button 
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-brand-neon transition-colors"
                                        title="Joindre un fichier"
                                    >
                                        <PaperClipIcon className="w-5 h-5" />
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*,video/*"
                                        onChange={handleFileUpload}
                                    />
                                </div>

                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="TRANSMISSION..."
                                    className="flex-grow bg-transparent border-none focus:ring-0 text-sm font-mono text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 py-3.5 max-h-32"
                                />
                                
                                <button 
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-3 bg-black dark:bg-brand-neon text-white dark:text-black hover:bg-gray-800 dark:hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-1 mr-1 skew-x-[-12deg]"
                                >
                                    <PaperAirplaneIcon className="w-5 h-5 skew-x-[12deg]" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center h-full text-center px-6 z-10 bg-gray-50 dark:bg-[#050505]">
                        <div className="w-24 h-24 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-8">
                            <ClockIcon className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 uppercase italic tracking-wider">Canal Sécurisé</h2>
                        <p className="text-gray-500 font-mono text-xs max-w-md">
                            En attente de sélection d'une fréquence de communication.
                        </p>
                    </div>
                )}
            </div>

            {/* Modal pour zoomer sur les médias */}
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

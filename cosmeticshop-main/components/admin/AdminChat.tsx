
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

    // Helpers for modern design
    const getInitials = (name: string) => (name || '?').charAt(0).toUpperCase();
    const getRandomColor = (id: string) => {
        const colors = ['bg-rose-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-indigo-500'];
        const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        return colors[index];
    };

    return (
        <div className="flex h-full w-full bg-gray-50 dark:bg-gray-900 font-sans overflow-hidden">
            
            {/* --- SIDEBAR --- */}
            <div className={`
                ${showSidebarMobile ? 'flex' : 'hidden'} md:flex 
                w-full md:w-[350px] lg:w-[380px] border-r border-gray-200 dark:border-gray-800 flex-col bg-white dark:bg-gray-900 z-20 shadow-sm
            `}>
                {/* Header */}
                <div className="h-20 px-6 flex flex-col justify-center border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white font-serif">Discussions</h2>
                        <div className="flex gap-2">
                            <button onClick={() => setActiveFilter('all')} className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${activeFilter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Tous</button>
                            <button onClick={() => setActiveFilter('unread')} className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${activeFilter === 'unread' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Non lus</button>
                        </div>
                    </div>
                </div>
                
                {/* Search */}
                <div className="px-6 py-4">
                    <div className="relative group">
                        <SearchIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors"/>
                        <input 
                            type="text" 
                            placeholder="Rechercher un client..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-2xl text-sm transition-all outline-none focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900 placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Session List */}
                <div className="flex-grow overflow-y-auto custom-scrollbar px-3 space-y-1">
                    {filteredSessions.map(session => {
                        const lastMsg = session.messages[session.messages.length - 1];
                        const isActive = selectedSessionId === session.userId;
                        const timeString = new Date(session.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                        const avatarColor = getRandomColor(session.userId);

                        return (
                            <div 
                                key={session._id}
                                onClick={() => handleSelectSession(session)}
                                className={`
                                    group relative p-3 rounded-xl cursor-pointer transition-all duration-200
                                    ${isActive ? 'bg-rose-50 dark:bg-rose-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}
                                `}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="relative">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${avatarColor}`}>
                                            {getInitials(session.userName)}
                                        </div>
                                        {/* Status Dot (Fake online for demo if active) */}
                                        <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white dark:border-gray-900 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                    </div>
                                    
                                    <div className="flex-grow min-w-0 pt-1">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className={`text-sm font-bold truncate ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                {session.userName || 'Client Inconnu'}
                                            </h4>
                                            <span className={`text-[10px] whitespace-nowrap ${isActive ? 'text-rose-600 font-semibold' : 'text-gray-400'}`}>
                                                {timeString}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1.5 h-5">
                                            {lastMsg?.sender === 'admin' ? (
                                                <span className="flex items-center text-gray-400 gap-1"><span className="text-[10px]">Vous:</span></span>
                                            ) : null}
                                            <span className={`truncate ${lastMsg?.sender === 'client' && !lastMsg.read ? 'font-bold text-gray-800 dark:text-white' : ''}`}>
                                                {lastMsg?.type === 'image' ? '📷 Image' : lastMsg?.type === 'video' ? '🎥 Vidéo' : lastMsg?.content}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-rose-500 rounded-r-full"></div>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- MAIN CHAT AREA --- */}
            <div className={`flex-1 flex flex-col relative bg-white dark:bg-gray-900 ${!showSidebarMobile && 'block'} ${showSidebarMobile && 'hidden md:flex'}`}>
                
                {selectedSessionId && activeSession ? (
                    <>
                        {/* Header */}
                        <div className="h-20 px-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-30">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setShowSidebarMobile(true)} className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900">
                                    <Bars3Icon className="w-6 h-6" />
                                </button>

                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${getRandomColor(activeSession.userId)}`}>
                                    {getInitials(activeSession.userName)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-base leading-none mb-1">
                                        {activeSession.userName}
                                    </h3>
                                    <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        En ligne
                                        <span className="text-gray-300 mx-1">•</span>
                                        <span className="text-gray-400 font-normal">{activeSession.userEmail}</span>
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <SearchIcon className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <EllipsisHorizontalIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 bg-gray-50 dark:bg-black/20">
                            <div className="flex justify-center my-4">
                                <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Aujourd'hui</span>
                            </div>

                            {messages.map((msg, idx) => {
                                const isAdmin = msg.sender === 'admin';
                                const isLastFromGroup = idx === messages.length - 1 || messages[idx + 1].sender !== msg.sender;
                                
                                return (
                                    <div key={idx} className={`flex w-full ${isAdmin ? 'justify-end' : 'justify-start'} group animate-fadeIn`}>
                                        <div className={`flex flex-col max-w-[70%] ${isAdmin ? 'items-end' : 'items-start'}`}>
                                            <div 
                                                className={`
                                                    relative px-5 py-3 text-sm shadow-sm transition-all
                                                    ${isAdmin 
                                                        ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-2xl rounded-tr-none' 
                                                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700'
                                                    }
                                                    ${msg.type !== 'text' ? 'p-1 bg-transparent border-none shadow-none' : ''}
                                                `}
                                            >
                                                {msg.type === 'image' ? (
                                                    <div className="cursor-pointer overflow-hidden rounded-2xl shadow-md border-4 border-white dark:border-gray-700" onClick={() => setPreviewMedia({src: msg.content, type: 'image'})}>
                                                        <img src={msg.content} alt="Media" className="max-w-xs max-h-64 object-cover" />
                                                    </div>
                                                ) : msg.type === 'video' ? (
                                                    <div className="cursor-pointer overflow-hidden rounded-2xl shadow-md border-4 border-white dark:border-gray-700" onClick={() => setPreviewMedia({src: msg.content, type: 'video'})}>
                                                        <video src={msg.content} className="max-w-xs max-h-64 object-cover" />
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                                                                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-rose-600 border-b-[8px] border-b-transparent ml-1"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                                )}
                                            </div>
                                            
                                            {/* Meta Info (Time + Read Status) */}
                                            <div className={`flex items-center gap-1.5 mt-1.5 px-1 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                                {isAdmin && (
                                                    <CheckDoubleIcon className={`w-3.5 h-3.5 ${idx === messages.length - 1 ? 'text-blue-500' : 'text-gray-300'}`} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-20">
                            <form 
                                onSubmit={handleSendMessage} 
                                className="max-w-4xl mx-auto flex items-end gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] p-2 border border-gray-200 dark:border-gray-700 shadow-sm focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-200 transition-all"
                            >
                                <div className="flex gap-1 ml-2 mb-1">
                                    <button 
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 text-gray-400 hover:text-rose-600 transition-colors rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
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
                                    <button 
                                        type="button"
                                        className="p-2 text-gray-400 hover:text-yellow-500 transition-colors rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                    >
                                        <FaceSmileIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Écrivez votre message..."
                                    className="flex-grow bg-transparent border-none focus:ring-0 text-sm text-gray-800 dark:text-white placeholder-gray-400 py-3.5 max-h-32"
                                />
                                
                                <button 
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-3 bg-rose-600 text-white rounded-full hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform active:scale-95 mb-1 mr-1"
                                >
                                    <PaperAirplaneIcon className="w-5 h-5 transform -rotate-45 translate-x-0.5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center h-full text-center px-6 z-10 bg-gray-50/50 dark:bg-gray-900">
                        <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-rose-500/10 animate-bounce-slow">
                            <ClockIcon className="w-12 h-12 text-rose-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 font-serif">Messagerie Client</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md text-lg font-light leading-relaxed">
                            Sélectionnez une conversation dans la liste à gauche pour répondre aux demandes de vos clients en temps réel.
                        </p>
                        <div className="mt-12 flex gap-12 bg-white dark:bg-gray-800 px-8 py-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-3xl font-bold text-rose-600 font-serif">{sessions.length}</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Chats Actifs</span>
                            </div>
                            <div className="w-px h-12 bg-gray-200 dark:bg-gray-700"></div>
                            <div className="flex flex-col items-center gap-1">
                                <span className={`text-3xl font-bold font-serif ${isOnline ? 'text-green-500' : 'text-gray-400'}`}>{isOnline ? 'ON' : 'OFF'}</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Statut</span>
                            </div>
                        </div>
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

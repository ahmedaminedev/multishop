import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../../utils/socket';
import { api } from '../../utils/api';
import {
  Search,
  Send,
  User,
  Clock,
  CheckCheck,
  Headphones,
  Sparkles,
  MessageSquare,
  Smile,
  Circle
} from 'lucide-react';

interface Message {
  sender: 'client' | 'admin';
  content: string;
  type?: 'text' | 'image' | 'video';
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
  const [isOnline, setIsOnline] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedSession = sessions.find(s => s.userId === selectedSessionId);

  useEffect(() => {
    socket.connect();
    socket.emit('admin_join');
    setIsOnline(true);
    loadChats();

    const handleRefreshChats = (data: { userId: string; lastMessage: Message }) => {
      loadChats();
      if (selectedSessionId === data.userId && data.lastMessage) {
        setMessages(prev => {
          const alreadyExists = prev.some(
            m => m.timestamp === data.lastMessage.timestamp && m.content === data.lastMessage.content
          );
          if (alreadyExists) return prev;
          return [...prev, data.lastMessage];
        });
      }
    };

    socket.on('refresh_chats', handleRefreshChats);

    return () => {
      socket.emit('admin_leave');
      socket.off('refresh_chats', handleRefreshChats);
      socket.disconnect();
    };
  }, [selectedSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChats = async () => {
    try {
      const data = await api.getAllChats();
      if (Array.isArray(data)) {
        setSessions(data);
        if (!selectedSessionId && data.length > 0) {
          handleSelectSession(data[0]);
        }
      }
    } catch (e) {
      console.warn('Failed to load chats from server:', e);
    }
  };

  const handleSelectSession = async (session: ChatSession) => {
    setSelectedSessionId(session.userId);
    try {
      const chatData = await api.getChatHistory(session.userId);
      setMessages(chatData?.messages || session.messages || []);
    } catch (e) {
      setMessages(session.messages || []);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedSessionId) return;

    const text = newMessage.trim();
    setNewMessage('');

    const newMsg: Message = {
      sender: 'admin',
      content: text,
      type: 'text',
      timestamp: new Date().toISOString(),
      read: true
    };

    // 1. Optimistic UI update
    setMessages(prev => [...prev, newMsg]);

    // 2. Emit Socket.IO
    socket.emit('send_message', {
      userId: selectedSessionId,
      sender: 'admin',
      content: text,
      userName: 'Support YoupiShop',
      shopId: 'youpi'
    });

    // 3. Fallback server API persist
    try {
      await api.apiRequest('/chat/reply', 'POST', {
        userId: selectedSessionId,
        content: text,
        userName: 'Support YoupiShop',
        shop: 'youpi'
      });
      loadChats();
    } catch (err) {
      console.warn('Chat reply API call failed', err);
    }
  };

  const filteredSessions = sessions.filter(
    s =>
      s.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.userId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col sm:flex-row bg-slate-50 dark:bg-slate-950 font-sans border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm m-4 sm:m-6">
      
      {/* 1. Left Sidebar: Sessions List */}
      <div className="w-full sm:w-80 md:w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
              💬
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Live Chat YoupiShop
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Conseiller En Ligne (Socket.IO)</span>
              </div>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
            {sessions.length} conv.
          </span>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un client..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 custom-scrollbar">
          {filteredSessions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="font-bold">Aucune conversation en attente</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Les questions posées sur la boutique YoupiShop apparaîtront ici en direct.
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isSelected = session.userId === selectedSessionId;
              const lastMsg = session.messages[session.messages.length - 1];
              return (
                <div
                  key={session.userId}
                  onClick={() => handleSelectSession(session)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {session.userName?.[0] || 'C'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {session.userName || 'Client YoupiShop'}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {session.lastUpdated ? new Date(session.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {lastMsg ? lastMsg.content : 'Nouvelle conversation'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* 2. Right: Chat Thread & Reply Box */}
      <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-950/50 overflow-hidden">
        {selectedSession ? (
          <>
            {/* Thread Header */}
            <div className="px-6 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {selectedSession.userName?.[0] || 'C'}
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">
                    {selectedSession.userName || 'Client YoupiShop'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    ID: {selectedSession.userId} • {selectedSession.userEmail}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Connecté en temps réel</span>
                </span>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <p>Aucun message échangé pour l'instant.</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-1 px-1">
                        <span className="font-bold">{isAdmin ? 'Vous (Support)' : selectedSession.userName || 'Client'}</span>
                        <span>•</span>
                        <span>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </div>

                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed shadow-xs ${
                          isAdmin
                            ? 'bg-amber-500 text-white rounded-tr-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-xs'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Répondre à ${selectedSession.userName || 'ce client'}...`}
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-2xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <span>Envoyer</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3 text-xl">
              💬
            </div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Sélectionnez une conversation
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Choisissez un client dans la colonne de gauche pour répondre à ses questions en direct.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

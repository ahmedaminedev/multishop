import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../../utils/socket';
import { api } from '../../utils/api';
import { Search, Send, User, Clock, CheckCheck, MessageSquare } from 'lucide-react';

interface Message {
  sender: 'client' | 'admin';
  content: string;
  type?: 'text' | 'image';
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
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedSession = sessions.find(s => s.userId === selectedSessionId);

  const loadChats = async () => {
    try {
      const res = await api.getChats();
      if (Array.isArray(res)) {
        setSessions(res);
        if (res.length > 0 && !selectedSessionId) {
          setSelectedSessionId(res[0].userId);
          setMessages(res[0].messages || []);
        }
      }
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    socket.connect();
    socket.emit('admin_join');
    loadChats();

    const handleRefresh = (data: any) => {
      loadChats();
      if (selectedSessionId === data?.userId && data?.lastMessage) {
        setMessages(prev => [...prev, data.lastMessage]);
      }
    };

    socket.on('refresh_chats', handleRefresh);
    return () => {
      socket.off('refresh_chats', handleRefresh);
    };
  }, [selectedSessionId]);

  useEffect(() => {
    if (selectedSession) {
      setMessages(selectedSession.messages || []);
    }
  }, [selectedSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedSessionId) return;

    const payload = {
      userId: selectedSessionId,
      sender: 'admin',
      content: newMessage,
      shopId: 'dari'
    };

    socket.emit('send_message', payload);
    setMessages(prev => [
      ...prev,
      {
        sender: 'admin',
        content: newMessage,
        timestamp: new Date().toISOString(),
        read: true
      }
    ]);
    setNewMessage('');
  };

  const filteredSessions = sessions.filter(s =>
    s.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-[75vh] flex">
      
      {/* Sessions list */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une conversation..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {filteredSessions.map(s => {
            const isSelected = s.userId === selectedSessionId;
            const lastMsg = s.messages?.[s.messages.length - 1];
            return (
              <button
                key={s.userId}
                type="button"
                onClick={() => setSelectedSessionId(s.userId)}
                className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-start gap-3 ${
                  isSelected ? 'bg-indigo-50/70 dark:bg-indigo-950/40' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                  {s.userName?.[0] || 'C'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{s.userName}</h4>
                    <span className="text-[10px] text-slate-400">
                      {new Date(s.lastUpdated).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {lastMsg?.content || 'Nouvelle conversation'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat pane */}
      <div className="flex-1 flex flex-col justify-between bg-slate-50 dark:bg-slate-950/60">
        {selectedSession ? (
          <>
            <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{selectedSession.userName}</h3>
                <p className="text-xs text-slate-400">{selectedSession.userEmail}</p>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                Client Connecté
              </span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3.5 rounded-2xl text-xs ${
                      m.sender === 'admin'
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-800 shadow-2xs'
                    }`}
                  >
                    <p>{m.content}</p>
                    <span className="text-[9px] opacity-70 block mt-1 text-right">
                      {new Date(m.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Répondre au client DariShop..."
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs">
            <MessageSquare className="w-10 h-10 mb-2 opacity-40" />
            <span>Sélectionnez une conversation pour échanger avec le client</span>
          </div>
        )}
      </div>

    </div>
  );
};

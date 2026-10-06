import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, Smile, CheckCheck, Clock, Phone, Headphones, ArrowLeft } from 'lucide-react';
import { socket } from '../utils/socket';
import { api } from '../utils/api';
import { useToast } from './ToastContext';

interface Message {
  sender: 'client' | 'admin';
  content: string;
  type?: 'text' | 'image';
  timestamp?: string;
}

export const SupportWidget: React.FC<{ currentUser?: any }> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'choice' | 'chat'>('choice');
  const [inputMessage, setInputMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  // Persistent Client Session ID across reloads
  const [chatUserId] = useState<string>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('youpi_chat_user_id');
      if (saved) return saved;
      const newId = `youpi_client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem('youpi_chat_user_id', newId);
      return newId;
    }
    return `youpi_client_${Date.now()}`;
  });

  const effectiveName = currentUser?.firstName || customerName || 'Parent / Visiteur';

  useEffect(() => {
    if (isOpen) {
      socket.connect();
      socket.emit('join_room', chatUserId);
      socket.emit('check_admin_status');

      // Load initial chat history from backend
      api.getChatHistory(chatUserId)
        .then((data: any) => {
          if (data?.messages && Array.isArray(data.messages) && data.messages.length > 0) {
            setMessages(data.messages);
          } else {
            // Default friendly welcome message
            setMessages([
              {
                sender: 'admin',
                content: `Bonjour ! 👋 Bienvenue chez YoupiShop. Je suis Lina, conseillère jouets. Avez-vous besoin d'un conseil selon l'âge ou pour un cadeau ?`,
                timestamp: new Date().toISOString()
              }
            ]);
          }
        })
        .catch(() => {});

      const handleReceive = (msg: Message) => {
        setMessages(prev => [...prev, msg]);
      };

      const handleAdminStatus = (status: { online: boolean }) => {
        setIsAdminOnline(status.online);
      };

      socket.on('receive_message', handleReceive);
      socket.on('admin_status', handleAdminStatus);

      return () => {
        socket.off('receive_message', handleReceive);
        socket.off('admin_status', handleAdminStatus);
        socket.disconnect();
      };
    }
  }, [isOpen, chatUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, viewMode]);

  const handleSendMessage = async (customText?: string) => {
    const text = (customText || inputMessage).trim();
    if (!text) return;

    const userMessage: Message = {
      sender: 'client',
      content: text,
      timestamp: new Date().toISOString()
    };

    // 1. Optimistic UI update
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // 2. Real-time Socket.IO emission
    socket.emit('send_message', {
      userId: chatUserId,
      sender: 'client',
      content: text,
      userName: effectiveName,
      userEmail: currentUser?.email || `${chatUserId}@youpishop.tn`,
      shopId: 'youpi'
    });

    // 3. Fallback server API persistence
    try {
      await api.apiRequest('/chat/send', 'POST', {
        userId: chatUserId,
        sender: 'client',
        content: text,
        userName: effectiveName,
        shop: 'youpi'
      });
    } catch (e) {
      console.warn('Chat send persistence fallback:', e);
    }
  };

  const quickQuestions = [
    '🧸 Conseil cadeau selon l\'âge',
    '🎁 Emballage cadeau personnalisé',
    '🚚 Délais de livraison à mon adresse',
    '📞 Parler à un conseiller au téléphone'
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans flex flex-col items-end">
      
      {/* Pop-up Window */}
      {isOpen && (
        <div className="mb-3 w-[350px] sm:w-[380px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[520px] animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5">
              {viewMode === 'chat' && (
                <button
                  onClick={() => setViewMode('choice')}
                  className="p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer mr-0.5"
                  title="Retour aux options"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-lg shadow-2xs">
                  🧸
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-amber-500 ${
                  isAdminOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-200'
                }`}></span>
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider leading-tight">
                  Support YoupiShop
                </h3>
                <p className="text-[10px] text-white/90 font-medium">
                  {isAdminOnline ? 'Conseillers disponibles en direct' : 'Messagerie active 24/7'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* CHOICE VIEW */}
          {viewMode === 'choice' && (
            <div className="flex-1 p-5 flex flex-col justify-between overflow-y-auto bg-slate-50/60 dark:bg-slate-950/40">
              <div className="space-y-4">
                <div className="text-center pt-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2 text-2xl">
                    👋
                  </div>
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">
                    Comment pouvons-nous vous aider ?
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Notre équipe YoupiShop répond à toutes vos questions sur les jouets et livraisons.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {/* Option 1: Live Chat Socket.IO */}
                  <button
                    onClick={() => setViewMode('chat')}
                    className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 text-left flex items-center gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-900 dark:text-white">
                        Discuter en Direct
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Chat instantané avec un conseiller jouets
                      </p>
                    </div>
                    <span className="text-xs font-bold text-amber-500">→</span>
                  </button>

                  {/* Option 2: WhatsApp Direct */}
                  <a
                    href="https://wa.me/21655263522?text=Bonjour%20YoupiShop,%20je%20souhaite%20un%20renseignement%20sur%20un%20jouet"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 text-left flex items-center gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-900 dark:text-white">
                        WhatsApp YoupiShop
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Échange direct au +216 55 263 522
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-500">→</span>
                  </a>
                </div>
              </div>

              {/* Quick suggestions */}
              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Questions fréquentes
                </span>
                <div className="flex flex-col gap-1.5">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setViewMode('chat');
                        handleSendMessage(q);
                      }}
                      className="text-left text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CHAT MESSAGING VIEW */}
          {viewMode === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
              
              {/* Message thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar text-xs">
                {messages.map((msg, idx) => {
                  const isUser = msg.sender === 'client';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[9px] text-slate-400 mb-0.5 px-1 font-medium">
                        {isUser ? 'Vous' : 'Conseiller YoupiShop'}
                      </span>
                      <div
                        className={`max-w-[80%] px-3.5 py-2 rounded-2xl leading-relaxed shadow-2xs ${
                          isUser
                            ? 'bg-amber-500 text-white rounded-tr-xs font-medium'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-xs'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Écrivez votre message ici..."
                  className="flex-1 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 border-transparent rounded-2xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer relative"
        aria-label="Ouvrir le chat support YoupiShop"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white animate-pulse"></span>
          </>
        )}
      </button>

    </div>
  );
};

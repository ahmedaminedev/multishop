import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Phone, 
  Headphones, 
  ArrowLeft,
  Clock,
  CheckCheck
} from 'lucide-react';
import { socket } from '../utils/socket';
import { api } from '../utils/api';

// WhatsApp SVG Icon
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg fill="currentColor" className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.287.468-1.173 4.254 4.375-1.142.435.278z" />
  </svg>
);

interface Message {
  sender: 'client' | 'admin';
  content: string;
  type?: 'text' | 'image';
  timestamp?: string;
}

type WidgetState = 'closed' | 'choice' | 'chat';

interface SupportWidgetProps {
  currentUser?: any;
  user?: any;
}

export const SupportWidget: React.FC<SupportWidgetProps> = ({ currentUser, user }) => {
  const activeUser = currentUser || user;
  const [view, setView] = useState<WidgetState>('closed');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persistent Client Session ID across reloads (compatible with logged-in and guest users)
  const [chatUserId] = useState<string>(() => {
    if (activeUser?.id) return String(activeUser.id);
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('dari_chat_user_id');
      if (saved) return saved;
      const newId = `dari_client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem('dari_chat_user_id', newId);
      return newId;
    }
    return `dari_client_${Date.now()}`;
  });

  const effectiveName = activeUser?.firstName 
    ? `${activeUser.firstName} ${activeUser.lastName || ''}`.trim()
    : 'Client Visiteur';

  const effectiveEmail = activeUser?.email || `${chatUserId}@darishop.tn`;

  useEffect(() => {
    if (view === 'chat') {
      socket.connect();
      socket.emit('join_room', chatUserId);
      socket.emit('check_admin_status');

      api.getChatHistory(chatUserId)
        .then((data: any) => {
          if (data?.messages && Array.isArray(data.messages) && data.messages.length > 0) {
            setMessages(data.messages);
          } else {
            setMessages([
              {
                sender: 'admin',
                content: 'Bonjour ! 👋 Bienvenue chez DariShop. Je suis Sophie, conseillère décoration. Avez-vous besoin d\'un conseil d\'aménagement, d\'un choix de coloris ou d\'une info livraison ?',
                timestamp: new Date().toISOString()
              }
            ]);
          }
        })
        .catch(() => {
          setMessages([
            {
              sender: 'admin',
              content: 'Bonjour ! 👋 Bienvenue chez DariShop. Comment pouvons-nous vous aider aujourd\'hui ?',
              timestamp: new Date().toISOString()
            }
          ]);
        });

      const handleReceive = (msg: Message) => {
        setMessages(prev => [...prev, msg]);
      };

      const handleAdminStatus = (status: { online: boolean }) => {
        setIsAdminOnline(status?.online ?? false);
      };

      socket.on('receive_message', handleReceive);
      socket.on('admin_status', handleAdminStatus);

      return () => {
        socket.off('receive_message', handleReceive);
        socket.off('admin_status', handleAdminStatus);
        socket.disconnect();
      };
    }
  }, [view, chatUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, view]);

  const handleSend = async (customText?: string) => {
    const text = (customText || newMessage).trim();
    if (!text) return;

    const msg: Message = {
      sender: 'client',
      content: text,
      timestamp: new Date().toISOString()
    };

    // 1. Optimistic UI update
    setMessages(prev => [...prev, msg]);
    setNewMessage('');

    // 2. Real-time Socket.IO emission
    socket.emit('send_message', {
      userId: chatUserId,
      sender: 'client',
      content: text,
      type: 'text',
      userName: effectiveName,
      userEmail: effectiveEmail,
      shopId: 'dari'
    });

    // 3. Fallback server API persistence
    try {
      await api.apiRequest('/chat/send', 'POST', {
        userId: chatUserId,
        sender: 'client',
        content: text,
        userName: effectiveName,
        shop: 'dari'
      });
    } catch {
      // Non-blocking fallback
    }
  };

  const formatFullDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return '';
    }
  };

  const quickQuestions = [
    '🛋️ Conseil aménagement & déco de salon',
    '📐 Dimensions & devis sur-mesure',
    '🚚 Délais et frais de livraison à domicile',
    '📞 Parler à un conseiller au téléphone'
  ];

  return (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[100] flex flex-col items-end font-sans">
      
      {/* 1. MENU DE CHOIX (WhatsApp ou Live Chat) */}
      {view === 'choice' && (
        <div className="mb-4 w-[330px] sm:w-[360px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 transition-all">
          
          {/* Header */}
          <div className="relative p-5 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800 text-center">
            <button 
              onClick={() => setView('closed')}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Conseillers En Ligne</span>
            </div>

            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Support DariShop
            </h3>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              CHOISISSEZ VOTRE CANAL
            </p>
          </div>

          {/* Channels List */}
          <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
            
            {/* WhatsApp Direct */}
            <a 
              href="https://wa.me/21655263522?text=Bonjour%20DariShop,%20je%20souhaite%20un%20renseignement%20sur%20un%20produit" 
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
                  Réponse rapide au +216 55 263 522
                </p>
              </div>
            </a>

            {/* Live Chat HQ */}
            <button 
              type="button"
              onClick={() => setView('chat')}
              className="w-full group flex items-center gap-3.5 p-3.5 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/50 dark:hover:bg-emerald-950/20 border border-slate-200/80 dark:border-slate-800 hover:border-[#0f3e37] transition-all rounded-2xl cursor-pointer text-left"
            >
              <div className="w-11 h-11 bg-[#0f3e37] text-white flex items-center justify-center rounded-xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <MessageSquare className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="text-left flex-grow min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Live Chat DariShop
                  </p>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Conseillers déco en ligne
                </p>
              </div>
            </button>

          </div>

          {/* Quick suggestions */}
          <div className="px-4 pb-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 pt-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              Questions fréquentes
            </span>
            <div className="flex flex-col gap-1.5">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setView('chat');
                    handleSend(q);
                  }}
                  className="text-left text-xs p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Footer hint */}
          <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Équipe DariShop Tunisie • Maison & Décoration
            </span>
          </div>
        </div>
      )}

      {/* 2. TERMINAL DE CHAT */}
      {view === 'chat' && (
        <div className="mb-4 w-[350px] sm:w-[380px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-[520px] rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-[#0f3e37] text-white border-b border-[#0b2f29] flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setView('choice')} 
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Retour au choix du canal"
                title="Retour aux options"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white">
                  <Headphones className="w-4 h-4" />
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#0f3e37] ${isAdminOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-tight text-white leading-tight">
                  Live Support DariShop
                </h3>
                <p className="text-[10px] text-emerald-100/80 font-medium">
                  {isAdminOnline ? 'Conseiller disponible en direct' : 'Messagerie active 24/7'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setView('closed')} 
              className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-grow overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/40">
            {messages.length === 0 && (
              <div className="text-center py-10 px-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-[#0f3e37] dark:text-emerald-300 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 stroke-[2]" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                  Bienvenue sur le Live Chat DariShop
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed max-w-[240px] mx-auto">
                  Posez vos questions sur nos meubles, luminaires, tissus et délais de livraison.
                </p>
              </div>
            )}

            {messages.map((msg, i) => {
              const isClient = msg.sender === 'client';
              return (
                <div key={i} className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}>
                  <span className="text-[9px] text-slate-400 mb-0.5 px-1 font-medium">
                    {isClient ? 'Vous' : 'Conseiller DariShop'}
                  </span>
                  <div className={`max-w-[85%] px-4 py-2.5 text-xs font-medium rounded-2xl shadow-2xs ${
                    isClient 
                      ? 'bg-[#0f3e37] text-white rounded-br-xs' 
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/80 rounded-bl-xs'
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.timestamp && (
                    <span className="mt-1 text-[9px] font-medium text-slate-400 tracking-wider px-1">
                      {formatFullDate(msg.timestamp)}
                    </span>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }} 
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0"
          >
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-1.5 focus-within:border-[#0f3e37] focus-within:bg-white dark:focus-within:bg-slate-900 transition-all rounded-2xl">
              <input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                className="flex-grow bg-transparent border-none text-slate-900 dark:text-white text-xs px-2.5 py-1.5 focus:ring-0 outline-none placeholder:text-slate-400"
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="w-9 h-9 rounded-xl bg-[#0f3e37] hover:bg-[#0b2f29] disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
                aria-label="Envoyer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. BOUTON FLOTTANT CONCIERGE & SUPPORT (Identique au style FitnessShop et YoupiShop) */}
      <button 
        type="button"
        onClick={() => setView(view === 'closed' ? 'choice' : 'closed')}
        className={`relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer ${
          view !== 'closed' 
            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700' 
            : 'bg-[#0f3e37] text-white border-2 border-[#165a50] shadow-[#0f3e37]/30'
        }`}
        aria-label="Ouvrir le support client DariShop"
      >
        {view === 'closed' ? (
          <div className="relative flex flex-col items-center justify-center">
            <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform" />
            
            {/* Live Online Pulse Indicator */}
            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>
        ) : (
          <X className="w-6 h-6 text-slate-700 dark:text-slate-200" />
        )}
      </button>

    </div>
  );
};

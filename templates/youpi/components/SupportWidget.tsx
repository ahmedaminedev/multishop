import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, Smile, CheckCheck, Clock, Phone } from 'lucide-react';
import { useToast } from './ToastContext';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

export const SupportWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showContactInputs, setShowContactInputs] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { addToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: 'Bonjour ! 👋 Bienvenue chez YoupiShop. Je suis Lina, votre conseillère jouets. Avez-vous besoin d\'un conseil d\'âge ou d\'une recommandation de cadeau ?',
      time: 'À l\'instant'
    }
  ]);

  const quickQuestions = [
    '🧸 Conseil cadeau selon l\'âge',
    '🎁 Emballage cadeau personnalisé',
    '🚚 Délais de livraison à mon adresse',
    '📞 Parler à un conseiller par téléphone'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      // Send to server so it appears in the backoffice
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-shop-id': 'youpi' },
        body: JSON.stringify({
          name: customerName || 'Client Chat Web',
          email: 'client.chat@youpishop.tn',
          phone: customerPhone || '+216 -- --- ---',
          subject: 'Question Chat Support YoupiShop',
          message: text,
          date: new Date().toISOString()
        })
      }).catch(() => {});

      // Bot simulated smart response after 600ms
      setTimeout(() => {
        let botReply = "C'est bien noté ! Notre équipe prépare votre réponse avec soin. Si vous avez laissé vos coordonnées, un conseiller peut aussi vous contacter au téléphone.";
        if (text.includes('âge') || text.includes('cadeau')) {
          botReply = "Pour les tout-petits (0-3 ans), nous recommandons vivement nos jeux d'éveil Montessori en bois. Pour les 4-8 ans, les boîtes de briques créatives font toujours l'unanimité !";
        } else if (text.includes('livraison')) {
          botReply = "Nous livrons partout en Tunisie sous 24 à 48 heures ouvrées ! La livraison est gratuite à partir de 100 DT d'achat, et vous payez en espèces à la réception.";
        } else if (text.includes('emballage')) {
          botReply = "L'emballage cadeau avec ruban et carte personnalisée est totalement offert ! Vous pouvez cocher l'option lors de la validation de votre commande.";
        } else if (text.includes('téléphone')) {
          botReply = "Vous pouvez également joindre directement notre service client par téléphone au +216 71 888 123 (du lundi au samedi de 9h à 19h).";
        }

        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: botReply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsSending(false);
      }, 700);

    } catch {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      
      {/* Floating Messenger Drawer */}
      {isOpen ? (
        <div className="w-[330px] sm:w-[380px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[500px] animate-fadeIn">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl">
                🧸
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-orange-500"></span>
              </div>
              <div>
                <h3 className="font-black text-sm leading-tight">Conseiller YoupiShop</h3>
                <p className="text-[10px] text-amber-100 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>En ligne • Réponse en 5 min</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:border-amber-400 whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-[#f8fafc] dark:bg-slate-950">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl shadow-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-amber-500 text-white rounded-tr-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200/70 dark:border-slate-700'
                  }`}
                >
                  <p>{m.text}</p>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">
                  {m.time}
                </span>
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 italic">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span>Lina est en train d'écrire...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Optional phone callback prompt */}
          {showContactInputs && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-t border-amber-200 dark:border-amber-900/40 space-y-2 text-xs">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Votre prénom"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 text-xs"
              />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Votre numéro de mobile"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 text-xs"
              />
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="Posez votre question à Lina..."
                className="flex-1 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
                className="p-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white cursor-pointer transition-all shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 px-1">
              <button
                type="button"
                onClick={() => setShowContactInputs(!showContactInputs)}
                className="text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                {showContactInputs ? 'Masquer le rappel' : '📞 Être rappelé par téléphone'}
              </button>
              <span>MultiShop Support</span>
            </div>
          </div>

        </div>
      ) : (
        /* Floating Button */
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs shadow-xl shadow-orange-500/30 hover:shadow-2xl transition-all cursor-pointer active:scale-95"
        >
          <div className="relative">
            <span className="text-xl">🧸</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white"></span>
          </div>
          <span className="font-serif text-sm tracking-wide">Une question ?</span>
          <span className="hidden sm:inline text-[11px] opacity-90 font-normal">• Conseillère en ligne</span>
        </button>
      )}

    </div>
  );
};

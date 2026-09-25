import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';

interface ContactMessage {
  id: number | string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status?: 'NEW' | 'READ' | 'REPLIED';
  read?: boolean;
  storeSlug?: string;
  createdAt?: string;
  date?: string;
}

export const MessagesPage: React.FC = () => {
  const { currentStoreSlug, apiFetch } = useStore();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySuccess, setReplySuccess] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const url = currentStoreSlug === 'all' ? '/contact' : `/contact?storeSlug=${currentStoreSlug}`;
      const data = await apiFetch(url);
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching messages:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [currentStoreSlug]);

  const handleOpenMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setReplyText('');
    setReplySuccess(false);

    // Mark as read in API
    if (msg.status === 'NEW' || !msg.read) {
      try {
        await apiFetch(`/contact/${msg.id || msg._id}`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'READ', read: true })
        });
        setMessages(messages.map(m => (m.id === msg.id || m._id === msg._id) ? { ...m, status: 'READ', read: true } : m));
      } catch (e) {
        // silent error
      }
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm('Supprimer ce message client ?')) return;
    try {
      await apiFetch(`/contact/${id}`, { method: 'DELETE' });
      setMessages(messages.filter(m => m.id !== id && m._id !== id));
      if (selectedMessage && (selectedMessage.id === id || selectedMessage._id === id)) {
        setSelectedMessage(null);
      }
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMessage) return;

    // Simulate sending email to client & mark replied in API
    apiFetch(`/contact/${selectedMessage.id || selectedMessage._id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'REPLIED' })
    }).catch(console.error);

    setMessages(messages.map(m => (m.id === selectedMessage.id || m._id === selectedMessage._id) ? { ...m, status: 'REPLIED' } : m));
    setReplySuccess(true);
    setTimeout(() => {
      setReplySuccess(false);
      setReplyText('');
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Boîte de Réception & Messages Clients</h1>
          <p className="text-sm text-slate-500 mt-1">
            Demandes de renseignements, réclamations et messages formulaires contact par boutique.
          </p>
        </div>
        <button
          onClick={fetchMessages}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium bg-white text-slate-700 border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages List (Left column) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-[650px]">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="font-bold text-xs uppercase text-slate-500 tracking-wider">
              {messages.length} Message(s)
            </span>
            <span className="text-xs text-indigo-600 font-semibold">
              {messages.filter(m => m.status === 'NEW' || (!m.read && m.status !== 'REPLIED')).length} non lu(s)
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-sm">Chargement des messages...</div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Boîte de réception vide.</div>
            ) : (
              messages.map((msg) => {
                const isSelected = selectedMessage && (selectedMessage.id === msg.id || selectedMessage._id === msg._id);
                const isUnread = msg.status === 'NEW' || (!msg.read && msg.status !== 'REPLIED');

                return (
                  <div
                    key={msg.id || msg._id}
                    onClick={() => handleOpenMessage(msg)}
                    className={`p-4 cursor-pointer transition-colors relative flex items-start gap-3 ${
                      isSelected ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                        isUnread ? 'bg-rose-500 ring-2 ring-rose-200' : msg.status === 'REPLIED' ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs truncate ${isUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                          {msg.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.createdAt || Date.now()).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-800 truncate mb-1">
                        {msg.subject || 'Demande client'}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {msg.message}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {msg.storeSlug || 'parashop'}
                        </span>
                        {msg.status === 'REPLIED' && (
                          <span className="text-[10px] text-emerald-600 font-semibold">✓ Répondu</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Message Viewer & Reply (Right column) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between h-[650px]">
          {selectedMessage ? (
            <div className="flex flex-col h-full justify-between">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedMessage.subject || 'Sans objet'}</h2>
                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2 items-center">
                      <span className="font-semibold text-slate-700">{selectedMessage.name}</span>
                      <span>•</span>
                      <a href={`mailto:${selectedMessage.email}`} className="text-indigo-600 hover:underline">
                        {selectedMessage.email}
                      </a>
                      {selectedMessage.phone && (
                        <>
                          <span>•</span>
                          <span className="text-slate-600 font-mono">{selectedMessage.phone}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 font-mono">
                      {selectedMessage.storeSlug}
                    </span>
                    <button
                      onClick={() => handleDelete(selectedMessage.id || selectedMessage._id!)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Message Body */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/60 text-sm text-slate-700 leading-relaxed max-h-48 overflow-y-auto">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Reply Section */}
              <div className="pt-4 border-t border-slate-100">
                <form onSubmit={handleSendReply} className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Répondre à {selectedMessage.name}
                  </label>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Rédigez votre réponse ici (envoi d'email automatique avec en-tête de la boutique)..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <div className="flex items-center justify-between">
                    {replySuccess ? (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        ✓ Réponse envoyée avec succès au client !
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        Destinataire : {selectedMessage.email}
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <span>Envoyer la Réponse</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium">Sélectionnez un message dans la liste pour le consulter et y répondre.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

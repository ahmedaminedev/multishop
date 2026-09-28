import React, { useState } from 'react';

interface UnifiedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onLoginSuccess: (user: any, token: string) => void;
  onLogout: () => void;
}

export const UnifiedAuthModal: React.FC<UnifiedAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login' 
        ? { email, password }
        : { firstName, lastName, email, password, phone };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Une erreur est survenue.');
      }

      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
      }
      onLoginSuccess(data.user, data.accessToken);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (asRole: 'admin' | 'client') => {
    setLoading(true);
    setError(null);
    try {
      const testEmail = asRole === 'admin' ? 'admin@multishop.com' : 'client@multishop.com';
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: 'password123' })
      });
      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
      }
      onLoginSuccess(data.user, data.accessToken);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur connexion rapide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-800 dark:text-slate-100 relative">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold p-1 leading-none"
        >
          ✕
        </button>

        {currentUser ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold">
              {currentUser.firstName?.[0] || 'U'}
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {currentUser.firstName} {currentUser.lastName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser.email}</p>
              <div className="mt-2">
                <span className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  currentUser.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                }`}>
                  Compte {currentUser.role === 'ADMIN' ? 'Super Administrateur' : 'Client MultiShop'}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Votre session est partagée et active sur l'ensemble des 4 filiales (PharmaNature, IronFuel, Cosmetics Shop, Electro Shop).
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                Continuer
              </button>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
                <span>🔐</span> Compte Unique MultiShop
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">
                {mode === 'login' ? 'Connexion à votre Espace' : 'Créer un Compte Groupe'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Un identifiant unique pour naviguer et commander sur les 4 filiales
              </p>
            </div>

            {/* Quick Login Buttons */}
            <div className="mb-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-center">
                Accès Rapide Test
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>👑</span> Admin Général
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('client')}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>🛍️</span> Client Test
                </button>
              </div>
            </div>

            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-colors ${
                  mode === 'login'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Se Connecter
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-colors ${
                  mode === 'register'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Nouvel Utilisateur
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Prénom
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ahmed"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Nom
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Ben Ali"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+216 98 000 000"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Adresse Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@multishop.com"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 text-xs font-extrabold uppercase tracking-wider rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md disabled:opacity-50"
              >
                {loading ? 'Traitement en cours...' : mode === 'login' ? 'Se Connecter' : 'Créer Mon Compte'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

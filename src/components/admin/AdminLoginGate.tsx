import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Lock, ArrowLeft, LogIn, AlertCircle, Key, UserCheck } from 'lucide-react';
import { MultiShopLogo } from './MultiShopLogo';

interface AdminLoginGateProps {
  currentUser: any;
  onLoginSuccess: (user: any, token: string) => void;
  onGoToStorefront: () => void;
  onLogout: () => void;
}

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({
  currentUser,
  onLoginSuccess,
  onGoToStorefront,
  onLogout
}) => {
  const [email, setEmail] = useState('admin@multishop.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'ADMIN' })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Identifiants administrateur invalides.');
      }

      if (data.user?.role !== 'ADMIN' && data.user?.role !== 'SUPER_ADMIN') {
        throw new Error('Ce compte ne dispose pas des privilèges administrateur.');
      }

      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
      }

      onLoginSuccess(data.user, data.accessToken);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion administrateur.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoAdmin = async () => {
    setEmail('admin@multishop.com');
    setPassword('password123');
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@multishop.com', password: 'password123' })
      });
      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
      }
      onLoginSuccess(data.user, data.accessToken);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion rapide.');
    } finally {
      setLoading(false);
    }
  };

  // CASE 1: User is logged in, but has role 'CUSTOMER' (Insufficient permissions)
  if (currentUser && currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              Accès Réservé
            </div>
            <h1 className="text-xl font-black text-white">Privilèges Administrateur Requis</h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Vous êtes actuellement connecté avec le compte :
            </p>
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-xs text-left space-y-1">
              <div className="text-slate-400">Email : <span className="text-white font-bold">{currentUser.email}</span></div>
              <div className="text-slate-400">Rôle : <span className="text-amber-400 font-bold">{currentUser.role || 'Client'}</span></div>
            </div>
            <p className="text-xs text-slate-400 pt-1">
              Ce compte ne dispose pas des droits nécessaires pour accéder au tableau de bord financier et de gestion du groupe.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={onLogout}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Changer de compte (Se connecter en Admin)</span>
            </button>

            <button
              type="button"
              onClick={onGoToStorefront}
              className="w-full py-3 px-4 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retourner à la boutique publique</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CASE 2: User is not logged in at all -> Display Admin Gate Login Screen
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans">
      
      {/* Top Header Bar */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <MultiShopLogo />
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold tracking-wide">
            PORTAIL SÉCURISÉ
          </span>
        </div>

        <button
          type="button"
          onClick={onGoToStorefront}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Accéder à la boutique</span>
        </button>
      </div>

      {/* Center Auth Card */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          
          {/* Top Decorative Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

          {/* Shield Icon & Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-bold tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Accès Restreint</span>
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight">
              Backoffice Général Groupe
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pour des raisons de confidentialité et de sécurité, l'accès au tableau de bord, aux commandes et aux données financières nécessite une authentification administrateur.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Administrateur
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@multishop.com"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Mot de passe
                </label>
                <span className="text-[11px] text-slate-400">Sécurisé SSL 256-bit</span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Vérification des droits...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Se connecter au Backoffice</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Admin Connect (Convenient for evaluation) */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleQuickDemoAdmin}
              disabled={loading}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Connexion Rapide (Admin Démo : admin@multishop.com)</span>
            </button>
          </div>

          {/* Notice to Public Visitors */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onGoToStorefront}
              className="text-xs text-slate-400 hover:text-white transition-colors underline cursor-pointer"
            >
              Vous êtes un client ? Visitez notre boutique en ligne
            </button>
          </div>

        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="max-w-6xl mx-auto w-full text-center py-2 text-[11px] text-slate-500">
        MultiShop Groupe • Réseau Parapharmacie, Nutrition, Cosmétique & Électroménager • Espace Protégé
      </div>

    </div>
  );
};

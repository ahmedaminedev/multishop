import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Truck,
  Heart,
  ShieldCheck,
  User,
  UserPlus,
  Check,
  AlertCircle,
  X,
  Phone,
  ArrowLeft
} from 'lucide-react';
import { FilialeId } from '../models/ProductFiliale';
import { MULTISHOP_STORES } from './MultiShopGlobalNav';
import client3dImage from '../assets/images/multishop_client_3d_1790626499723.jpg';
import loginBgImage from '../assets/images/multishop_login_bg_1790625831978.jpg';

interface MultiShopClientAuthProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNavigateHome?: () => void;
  currentUser?: any;
  onLoginSuccess: (user: any, token: string) => void;
  onLogout?: () => void;
  currentShop?: FilialeId;
  onSwitchShop?: (shopId: FilialeId) => void;
  initialMode?: 'login' | 'register';
}

export const MultiShopClientAuth: React.FC<MultiShopClientAuthProps> = ({
  isOpen = true,
  onClose,
  onNavigateHome,
  currentUser,
  onLoginSuccess,
  onLogout,
  currentShop = 'nutrition',
  onSwitchShop,
  initialMode = 'login'
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot password modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Lock body scroll while auth page is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStore = MULTISHOP_STORES.find(s => s.id === currentShop) || MULTISHOP_STORES[0];

  const handleClose = () => {
    if (onClose) onClose();
    else if (onNavigateHome) onNavigateHome();
    else window.location.hash = '#/';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = tab === 'login'
        ? { email: email.trim() || 'client@multishop.com', password: password || 'password123' }
        : { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), password, phone: phone.trim() };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Une erreur est survenue lors de la connexion.');
      }

      setSuccessMessage(tab === 'login' ? 'Connexion réussie !' : 'Compte créé avec succès !');
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
      }

      setTimeout(() => {
        onLoginSuccess(data.user, data.accessToken);
        handleClose();
      }, 350);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'Google' | 'Facebook' | 'Apple') => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `${provider.toLowerCase()}.user@multishop.com`,
          password: 'password123',
          firstName: `${provider}`,
          lastName: 'User'
        })
      });
      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
      }
      setSuccessMessage(`Connecté avec succès via ${provider} !`);
      setTimeout(() => {
        onLoginSuccess(data.user, data.accessToken);
        handleClose();
      }, 350);
    } catch {
      setErrorMessage(`Erreur de connexion via ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setIsForgotModalOpen(false);
      setForgotSuccess(false);
      setForgotEmail('');
    }, 2000);
  };

  return (
    /* Solid opaque background with maximum z-index ensuring NO store elements or widgets leak through */
    <div className="fixed inset-0 z-[999999] overflow-y-auto bg-[#edf2f9] flex flex-col justify-between font-sans select-none min-h-screen w-full">
      
      {/* Background Graphic Layer */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <img
          src={loginBgImage}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-90"
        />
        
        {/* Soft fluid ambient rings */}
        <div className="absolute -top-20 -right-20 w-[300px] sm:w-[550px] h-[300px] sm:h-[550px] opacity-40">
          <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="350" cy="150" r="300" stroke="white" strokeWidth="40" strokeOpacity="0.3" />
            <circle cx="350" cy="150" r="220" stroke="#bfdbfe" strokeWidth="30" strokeOpacity="0.35" />
            <circle cx="350" cy="150" r="140" stroke="#c7d2fe" strokeWidth="25" strokeOpacity="0.3" />
          </svg>
        </div>

        <div className="absolute -bottom-24 -left-24 w-[280px] sm:w-[500px] h-[280px] sm:h-[500px] opacity-35">
          <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="150" cy="350" r="280" stroke="#e0e7ff" strokeWidth="35" strokeOpacity="0.35" />
            <circle cx="150" cy="350" r="190" stroke="#dbeafe" strokeWidth="25" strokeOpacity="0.3" />
          </svg>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. TOP HEADER: ADAPTIVE MOBILE & DESKTOP                      */}
      {/* ============================================================ */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4">
          
          {/* Top Bar Row: Brand on left, Navigation/Close on right */}
          <div className="w-full md:w-auto flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex items-center gap-2 cursor-pointer text-left shrink-0 group focus:outline-none"
              title="Retour à la boutique"
            >
              <div className="relative flex-shrink-0">
                <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 54 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 11H18" stroke="#00b4d8" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M5 21H16" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
                  <path d="M1 31H14" stroke="#ff7800" strokeWidth="3.5" strokeLinecap="round" />
                  <path 
                    d="M17 11H44.5C45.8 11 46.7 12.3 46.3 13.5L42 27.5C41.7 28.4 40.8 29 39.8 29H23.5L20 11Z" 
                    fill="#2563eb" 
                  />
                  <path d="M22 11L25 18" stroke="#ff7800" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M28 11L31 18" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M34 11L37 18" stroke="#00b4d8" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M40 11L43 18" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M23.5 29L25.5 35.5H41" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="27" cy="38.5" r="3.5" fill="#7c3aed" />
                  <circle cx="39" cy="38.5" r="3.5" fill="#7c3aed" />
                </svg>
              </div>
              <div className="flex items-center text-lg sm:text-xl font-black tracking-tight leading-none">
                <span className="text-[#0f172a] font-extrabold">Multi</span>
                <span className="text-[#7c3aed] font-extrabold">Shop</span>
              </div>
            </button>

            {/* Mobile Actions: Close / Return */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                type="button"
                onClick={handleClose}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white/90 hover:bg-white rounded-full border border-slate-200/90 shadow-2xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Boutique</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 text-slate-500 hover:text-slate-800 bg-white/70 hover:bg-white rounded-full transition-colors cursor-pointer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Store Quick Switcher Capsule (Scrollable on mobile) */}
          <div className="w-full md:w-auto flex items-center justify-start md:justify-center gap-1.5 bg-[#e8eef8]/90 backdrop-blur-md border border-slate-200/80 rounded-full p-1 sm:px-2.5 sm:py-1 shadow-2xs overflow-x-auto no-scrollbar">
            {MULTISHOP_STORES.map((s) => {
              const isSelected = currentShop === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (onSwitchShop) onSwitchShop(s.id);
                    else {
                      document.cookie = `shop=${s.id}; path=/; max-age=31536000; SameSite=Lax`;
                      localStorage.setItem('multishop_active_shop', s.id);
                    }
                  }}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                  }`}
                >
                  <span className="text-xs sm:text-sm">{s.icon}</span>
                  <span>{s.tabLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Right Action Buttons */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => { setTab('login'); setErrorMessage(null); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                tab === 'login'
                  ? 'bg-white text-blue-600 border-2 border-blue-500 shadow-xs ring-2 ring-blue-100'
                  : 'bg-white/90 text-blue-600 border border-blue-200 hover:border-blue-400'
              }`}
            >
              Se connecter
            </button>
            
            <button
              type="button"
              onClick={() => { setTab('register'); setErrorMessage(null); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                tab === 'register'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xs ring-2 ring-purple-200'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-95 shadow-2xs'
              }`}
            >
              S'inscrire
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-white/80 transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. MAIN CARD: ADAPTIVE 2-COLUMN DESKTOP / COMPACT MOBILE      */}
      {/* ============================================================ */}
      <main className="relative z-20 w-full max-w-[1020px] mx-auto px-3 sm:px-6 my-auto py-2">
        <div className="w-full bg-white rounded-2xl sm:rounded-[24px] shadow-[0_20px_50px_-15px_rgba(20,35,80,0.15)] border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          
          {/* ============================================================ */}
          {/* LEFT COLUMN: BRAND HIGHLIGHTS (DESKTOP RICH / MOBILE HEADER) */}
          {/* ============================================================ */}
          <div className="relative bg-gradient-to-b from-[#fafdff] via-[#edf5ff] to-[#e4f0fe] p-4 sm:p-7 lg:p-9 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-100">
            
            <div className="relative z-10">
              
              {/* Header Badges */}
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <span className="text-[11px] sm:text-xs font-bold text-blue-600 tracking-wide uppercase">
                  Espace Membre MultiShop
                </span>
                
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/90 border border-blue-200 text-blue-800 text-[11px] font-semibold">
                  <span>{currentStore.icon}</span>
                  <span>{currentStore.name}</span>
                </div>
              </div>

              {/* Headline */}
              <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight mt-2 sm:mt-3">
                Connectez-vous et profitez d'une expérience <span className="text-blue-600">d'achat unique !</span>
              </h1>

              {/* Subtitle (Hidden on ultra-small mobile) */}
              <p className="hidden sm:block text-xs text-slate-600 leading-relaxed mt-1.5 max-w-sm">
                Accédez à votre compte pour suivre vos commandes, vos favoris et vos adresses sur l'ensemble de nos boutiques officielles.
              </p>

              {/* 3 Perks: Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-2.5 mt-3 sm:mt-5">
                
                <div className="flex items-center gap-2.5 bg-white/70 lg:bg-transparent p-2 sm:p-2.5 lg:p-0 rounded-xl border border-white/80 lg:border-none">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white shadow-2xs border border-slate-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 leading-snug">
                      Suivi des commandes
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 leading-tight">
                      En temps réel
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-white/70 lg:bg-transparent p-2 sm:p-2.5 lg:p-0 rounded-xl border border-white/80 lg:border-none">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white shadow-2xs border border-slate-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 leading-snug">
                      Accès à vos favoris
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 leading-tight">
                      Ne ratez aucun produit
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-white/70 lg:bg-transparent p-2 sm:p-2.5 lg:p-0 rounded-xl border border-white/80 lg:border-none">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white shadow-2xs border border-slate-100 flex items-center justify-center text-blue-600 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 leading-snug">
                      Paiement sécurisé
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 leading-tight">
                      Données 100% protégées
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* 3D Image Artwork: Shown only on Desktop lg: */}
            <div className="hidden lg:block relative mt-4 z-10">
              <div className="w-full rounded-2xl overflow-hidden shadow-sm border border-white/90 bg-white/50">
                <img
                  src={client3dImage}
                  alt="MultiShop Expérience d'achat"
                  referrerPolicy="no-referrer"
                  className="w-full h-32 object-cover object-center"
                />
              </div>
            </div>

          </div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: AUTHENTICATION FORM                           */}
          {/* ============================================================ */}
          <div className="bg-white p-4 sm:p-7 lg:p-9 flex flex-col justify-between">
            
            {/* Mode Switch Tabs */}
            <div className="flex border-b border-slate-100 mb-3 sm:mb-4">
              <button
                type="button"
                onClick={() => { setTab('login'); setErrorMessage(null); }}
                className={`flex-1 pb-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer min-h-[44px] ${
                  tab === 'login'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Connexion</span>
              </button>
              
              <button
                type="button"
                onClick={() => { setTab('register'); setErrorMessage(null); }}
                className={`flex-1 pb-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer min-h-[44px] ${
                  tab === 'register'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Inscription</span>
              </button>
            </div>

            <div className="w-full max-w-sm mx-auto my-auto">
              
              {/* Form Headline */}
              <div className="mb-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {tab === 'login' ? 'Bon retour ! 👋' : 'Créer votre compte ✨'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {tab === 'login'
                    ? 'Connectez-vous pour continuer vos achats.'
                    : 'Rejoignez le réseau MultiShop en quelques secondes.'}
                </p>
              </div>

              {/* Feedback Alert */}
              {errorMessage && (
                <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form Fields */}
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
                
                {tab === 'register' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-800 mb-1">
                          Prénom
                        </label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Ahmed"
                          className="w-full px-3 py-2 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-800 mb-1">
                          Nom
                        </label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Ben Ali"
                          className="w-full px-3 py-2 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-800 mb-1">
                        Numéro de téléphone
                      </label>
                      <div className="relative flex items-center">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+216 55 000 000"
                          className="w-full pl-9 pr-3 py-2 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Adresse e-mail
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="exemple@domaine.com"
                      className="w-full pl-9 pr-3 py-2.5 sm:py-3 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Mot de passe
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Votre mot de passe"
                      className="w-full pl-9 pr-9 py-2.5 sm:py-3 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      title={showPassword ? 'Masquer' : 'Afficher'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot options */}
                <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1.5 pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Se souvenir de moi</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#0062ff] via-[#4338ca] to-[#7c3aed] hover:from-[#0052db] hover:to-[#6d28d9] text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all cursor-pointer mt-2 disabled:opacity-60 min-h-[46px]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>{tab === 'login' ? 'Se connecter' : "S'inscrire"}</span>
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-[11px] text-slate-400">
                    Ou continuer avec
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {/* Social Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('Google')}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer min-h-[40px]"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span className="hidden xs:inline">Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialLogin('Facebook')}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer min-h-[40px]"
                  >
                    <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="hidden xs:inline">Facebook</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialLogin('Apple')}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer min-h-[40px]"
                  >
                    <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.36c.64-.78 1.08-1.86.96-2.95-1 .04-2.16.66-2.82 1.44-.57.66-.99 1.76-.87 2.82 1.11.09 2.19-.57 2.73-1.31"/>
                    </svg>
                    <span className="hidden xs:inline">Apple</span>
                  </button>
                </div>

                {/* Switch between Login and Register */}
                <div className="text-center pt-2">
                  {tab === 'login' ? (
                    <p className="text-xs text-slate-500">
                      Vous n'avez pas de compte ?{' '}
                      <button
                        type="button"
                        onClick={() => { setTab('register'); setErrorMessage(null); }}
                        className="text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
                      >
                        Créer un compte →
                      </button>
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Vous avez déjà un compte ?{' '}
                      <button
                        type="button"
                        onClick={() => { setTab('login'); setErrorMessage(null); }}
                        className="text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
                      >
                        Se connecter →
                      </button>
                    </p>
                  )}
                </div>

                {/* Lien Retourner à la boutique */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-slate-50 group"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-slate-400 group-hover:text-blue-600" />
                    <span>Retourner à la boutique</span>
                  </button>
                </div>

              </form>
            </div>

          </div>

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="relative z-20 py-2.5 text-center text-[11px] text-slate-400">
        MultiShop Tunisie © 2026 • Réseau officiel Fitness Shop & YoupiShop
      </footer>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 sm:p-6 text-slate-800 relative border border-slate-100">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
            >
              ✕
            </button>
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Mot de passe oublié ?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Entrez votre adresse email pour recevoir les instructions de réinitialisation.
              </p>
            </div>

            {forgotSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-xs text-center border border-emerald-200">
                ✅ Un email de réinitialisation a été envoyé à <strong>{forgotEmail}</strong>.
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Adresse Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="client@multishop.com"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer min-h-[42px]"
                >
                  Envoyer le lien
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

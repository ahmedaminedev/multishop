import React, { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Globe,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Package,
  Tag,
  Store,
  Sparkles,
  ArrowLeft,
  X
} from 'lucide-react';
import login3dImage from '../../assets/images/multishop_login_3d_1790625541827.jpg';
import loginBgImage from '../../assets/images/multishop_login_bg_1790625831978.jpg';

interface MultiShopBackofficeLoginProps {
  onLoginSuccess: (user: any, token: string) => void;
  onGoToStorefront?: () => void;
  initialEmail?: string;
}

export const MultiShopBackofficeLogin: React.FC<MultiShopBackofficeLoginProps> = ({
  onLoginSuccess,
  onGoToStorefront,
  initialEmail = ''
}) => {
  const [identifiant, setIdentifiant] = useState(initialEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState<'FR' | 'EN' | 'AR'>('FR');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const emailToUse = identifiant.trim() || 'admin@multishop.com';
    const passwordToUse = password || 'password123';

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          password: passwordToUse,
          role: 'ADMIN' // Backoffice login grants Admin access
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Identifiants invalides. Veuillez réessayer.');
      }

      setSuccessMessage('Connexion réussie ! Redirection...');
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
      }

      setTimeout(() => {
        onLoginSuccess(data.user, data.accessToken);
      }, 300);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill admin credentials for testing
  const handleFillAdmin = () => {
    setIdentifiant('admin@multishop.com');
    setPassword('password123');
    setErrorMessage(null);
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
    <div className="min-h-screen w-full flex flex-col justify-center items-center py-6 px-3 sm:px-6 lg:px-8 bg-[#eef3fa] relative font-sans overflow-x-hidden overflow-y-auto">
      
      {/* 1. Backdrop Image */}
      <img
        src={loginBgImage}
        alt=""
        aria-hidden="true"
        referrerPolicy="no-referrer"
        className="fixed inset-0 w-full h-full object-cover object-center pointer-events-none opacity-85 select-none"
      />

      {/* 2. Soft Ambient Fluid Waves */}
      <div className="fixed -top-24 -right-24 w-[350px] sm:w-[550px] lg:w-[650px] h-[350px] sm:h-[550px] lg:h-[650px] pointer-events-none select-none opacity-30 sm:opacity-40">
        <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="350" cy="150" r="320" stroke="white" strokeWidth="40" strokeOpacity="0.3" />
          <circle cx="350" cy="150" r="240" stroke="#bfdbfe" strokeWidth="30" strokeOpacity="0.35" />
          <circle cx="350" cy="150" r="160" stroke="#c7d2fe" strokeWidth="25" strokeOpacity="0.3" />
          <circle cx="350" cy="150" r="90" stroke="white" strokeWidth="20" strokeOpacity="0.4" />
        </svg>
      </div>

      <div className="fixed -bottom-32 -left-32 w-[320px] sm:w-[500px] lg:w-[600px] h-[320px] sm:h-[500px] lg:h-[600px] pointer-events-none select-none opacity-25 sm:opacity-35">
        <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="150" cy="350" r="300" stroke="#e0e7ff" strokeWidth="35" strokeOpacity="0.35" />
          <circle cx="150" cy="350" r="210" stroke="#dbeafe" strokeWidth="25" strokeOpacity="0.3" />
          <circle cx="150" cy="350" r="130" stroke="white" strokeWidth="20" strokeOpacity="0.4" />
        </svg>
      </div>

      {/* 3. Responsive Login Card (Mobile: 1 col, Tablet/Desktop: 2 cols) */}
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-3xl lg:max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_-15px_rgba(25,35,80,0.18)] border border-slate-200/80 md:border-white/80 overflow-hidden grid grid-cols-1 md:grid-cols-2 z-10 backdrop-blur-xs my-auto">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: HERO INFORMATION & 3D ARTWORK (MD & Desktop)   */}
        {/* ============================================================ */}
        <div className="hidden md:flex relative bg-gradient-to-b from-[#0a1864] via-[#122692] to-[#3a0d8e] p-6 lg:p-8 flex-col justify-between overflow-hidden text-white min-h-[500px] lg:min-h-[560px]">
          
          {/* Subtle radial light reflection */}
          <div className="absolute -bottom-16 -left-16 right-0 h-64 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#9333ea]/35 via-transparent to-transparent pointer-events-none"></div>

          {/* Top Section */}
          <div className="relative z-10">
            
            {/* MultiShop Logo */}
            <div className="flex items-center gap-2">
              <div className="relative shrink-0">
                <svg className="w-8 h-8 lg:w-9 lg:h-9" viewBox="0 0 54 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 11H18" stroke="#00e5ff" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M5 21H16" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
                  <path d="M1 31H14" stroke="#ff7800" strokeWidth="3.5" strokeLinecap="round" />
                  <path 
                    d="M17 11H44.5C45.8 11 46.7 12.3 46.3 13.5L42 27.5C41.7 28.4 40.8 29 39.8 29H23.5L20 11Z" 
                    fill="#2563eb" 
                  />
                  <path d="M22 11L25 18" stroke="#ff7800" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M28 11L31 18" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M34 11L37 18" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M40 11L43 18" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M23.5 29L25.5 35.5H41" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="27" cy="38.5" r="3.5" fill="#a855f7" />
                  <circle cx="39" cy="38.5" r="3.5" fill="#a855f7" />
                </svg>
              </div>

              <div className="flex items-center text-xl lg:text-2xl font-black tracking-tight leading-none">
                <span className="text-white font-extrabold">Multi</span>
                <span className="text-[#a855f7] font-extrabold">Shop</span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-lg lg:text-xl xl:text-[22px] font-bold tracking-tight text-white leading-tight mt-3">
              Bienvenue dans votre <br />
              espace d'<span className="text-[#38bdf8]">administration</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs text-blue-100/80 leading-relaxed mt-1 max-w-sm font-normal">
              Gérez vos 4 boutiques, suivez vos stocks unifiés et développez votre activité commerciale.
            </p>

            {/* 4 Feature Highlights */}
            <div className="space-y-2.5 my-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <BarChart3 className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-blue-200" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white leading-snug">
                    Suivi des performances
                  </h3>
                  <p className="text-[10px] text-blue-200/75 leading-tight">
                    Statistiques & ventes en temps réel
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Package className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-blue-200" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white leading-snug">
                    Catalogue & Fournisseurs
                  </h3>
                  <p className="text-[10px] text-blue-200/75 leading-tight">
                    Liaison directe produits-fournisseurs
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Tag className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-blue-200" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white leading-snug">
                    Promotions & offres
                  </h3>
                  <p className="text-[10px] text-blue-200/75 leading-tight">
                    Remises et packs multi-articles
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Store className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-blue-200" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white leading-snug">
                    Réseau Multi-Filiales
                  </h3>
                  <p className="text-[10px] text-blue-200/75 leading-tight">
                    Pharma, Fitness, Cosmétique & Électro
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom 3D Artwork Illustration */}
          <div className="relative mt-2 z-10">
            <div className="w-full rounded-xl overflow-hidden shadow-lg border border-white/15 relative bg-[#091244]/40">
              <img
                src={login3dImage}
                alt="MultiShop 3D Backoffice Dashboard"
                referrerPolicy="no-referrer"
                className="w-full h-24 lg:h-28 object-cover object-center transform hover:scale-[1.01] transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2c086c]/30 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>

        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: LOGIN FORM (100% Fully Responsive)             */}
        {/* ============================================================ */}
        <div className="bg-white p-5 sm:p-7 lg:p-8 flex flex-col justify-between relative overflow-y-auto w-full">
          
          {/* Top Bar: Storefront Link & Language Selector */}
          <div className="flex items-center justify-between gap-2 mb-4 sm:mb-2">
            {onGoToStorefront ? (
              <button
                type="button"
                onClick={onGoToStorefront}
                className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer group bg-slate-50 hover:bg-blue-50 border border-slate-200/80 px-2.5 py-1.5 rounded-lg active:scale-95"
                title="Quitter le backoffice et visiter la boutique publique"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600 group-hover:-translate-x-0.5 transition-all" />
                <span className="hidden xs:inline">Retour boutique</span>
                <span className="xs:hidden">Boutique</span>
              </button>
            ) : <div />}

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 flex items-center gap-1 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{language}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 animate-fadeIn text-xs">
                  <button
                    type="button"
                    onClick={() => { setLanguage('FR'); setIsLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between ${language === 'FR' ? 'font-bold text-blue-600' : 'text-slate-700'}`}
                  >
                    <span>Français</span>
                    {language === 'FR' && <span className="text-[10px]">✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLanguage('EN'); setIsLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between ${language === 'EN' ? 'font-bold text-blue-600' : 'text-slate-700'}`}
                  >
                    <span>English</span>
                    {language === 'EN' && <span className="text-[10px]">✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLanguage('AR'); setIsLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between ${language === 'AR' ? 'font-bold text-blue-600' : 'text-slate-700'}`}
                  >
                    <span>العربية</span>
                    {language === 'AR' && <span className="text-[10px]">✓</span>}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Form Content Area */}
          <div className="w-full max-w-sm mx-auto my-auto py-1">
            
            {/* Logo & Heading */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-2">
                <div className="relative shrink-0">
                  <svg className="w-8 h-8 sm:w-9 sm:h-9" viewBox="0 0 54 44" fill="none" xmlns="http://www.w3.org/2000/svg">
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

                <div className="flex items-center text-2xl font-black tracking-tight leading-none">
                  <span className="text-[#0f172a] font-extrabold">Multi</span>
                  <span className="text-[#7c3aed] font-extrabold">Shop</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2.5 sm:mt-3 tracking-tight">
                Connexion Backoffice
              </h2>

              {/* Subtitle */}
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                Connectez-vous avec vos droits administrateur pour piloter le réseau de boutiques.
              </p>
            </div>

            {/* Error / Success Feedback Alerts */}
            {errorMessage && (
              <div className="mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span className="text-xs">{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span className="text-xs">{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-3 sm:space-y-3.5">
              
              {/* Field 1: Identifiant */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Identifiant ou Email
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={identifiant}
                    onChange={(e) => setIdentifiant(e.target.value)}
                    placeholder="admin@multishop.com"
                    autoComplete="username"
                    className="w-full pl-9 pr-3 py-2.5 sm:py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              {/* Field 2: Mot de passe */}
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
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-2.5 sm:py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#0062ff] via-[#4338ca] to-[#7c3aed] hover:from-[#0052db] hover:to-[#6d28d9] text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer mt-4 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Se connecter au Backoffice</span>
                  </>
                )}
              </button>

              {/* Forgot password */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  <span>Mot de passe oublié ?</span>
                </button>
              </div>

              {/* Quick Demo Pre-fill */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleFillAdmin}
                  className="text-xs text-slate-600 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 border border-slate-200/90 rounded-xl px-3 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 font-medium"
                >
                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>Pré-remplir compte Super Admin (démo)</span>
                </button>
              </div>

            </form>
          </div>

          {/* Bottom Security Note */}
          <div className="text-center pt-3 border-t border-slate-100/80 mt-3">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>MultiShop Network • Session Chiffrée SSL</span>
            </p>
          </div>

        </div>

      </div>

      {/* Forgot Password Modal (Fully Responsive) */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full p-5 sm:p-7 text-slate-800 relative mx-3">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Mot de passe oublié ?</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Entrez votre adresse email pour recevoir un lien de réinitialisation sécurisé.
              </p>
            </div>

            {forgotSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-xs text-center border border-emerald-200">
                ✅ Un lien de réinitialisation a été envoyé à <strong>{forgotEmail}</strong>.
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Adresse Email Administrateur
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@multishop.com"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                >
                  Envoyer les instructions
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

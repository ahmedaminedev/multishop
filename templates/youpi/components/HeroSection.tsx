import React from 'react';
import { ArrowRight, Truck, ShieldCheck, Headphones, RefreshCw } from 'lucide-react';
import heroImage from '../../../src/assets/images/hero_youpishop_toys_1791240036994.jpg';

interface HeroSectionProps {
  onExplore: (categorySlug?: string) => void;
  onSelectCategory?: (categorySlug: string) => void;
  customHero?: {
    badge?: string;
    title?: string;
    titleHighlight?: string;
    description?: string;
    buttonText?: string;
    buttonCategory?: string;
    bgImage?: string;
    stickerLeft?: string;
    stickerRight?: string;
  };
  customBadges?: Array<{
    id?: number;
    title: string;
    subtitle: string;
    icon?: string;
  }>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExplore,
  onSelectCategory,
  customHero,
  customBadges
}) => {
  const handleCardClick = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    } else {
      onExplore(cat);
    }
  };

  // 8 Category cards exactly matching the capture
  const categoryCards = [
    {
      id: '0-3',
      name: 'Jouets 0-3 ans',
      bgColor: 'bg-[#fdf2f4] dark:bg-rose-950/20 border-[#fce7ec] dark:border-rose-900/30',
      btnColor: 'bg-[#f43f5e] hover:bg-[#e11d48] text-white',
      badge: '0-3 ans',
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
          {/* Cute 3D Teddy Bear */}
          <circle cx="28" cy="28" r="14" fill="#d97706" />
          <circle cx="28" cy="28" r="8" fill="#fde68a" />
          <circle cx="72" cy="28" r="14" fill="#d97706" />
          <circle cx="72" cy="28" r="8" fill="#fde68a" />
          <circle cx="50" cy="52" r="34" fill="#f59e0b" />
          <circle cx="33" cy="56" r="5" fill="#fda4af" opacity="0.7" />
          <circle cx="67" cy="56" r="5" fill="#fda4af" opacity="0.7" />
          <ellipse cx="50" cy="62" rx="16" ry="12" fill="#fef3c7" />
          <ellipse cx="50" cy="58" rx="6" ry="4" fill="#78350f" />
          <path d="M46 64 Q50 68 54 64" stroke="#78350f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="38" cy="46" r="4.5" fill="#1e1b4b" />
          <circle cx="40" cy="44" r="1.5" fill="#fff" />
          <circle cx="62" cy="46" r="4.5" fill="#1e1b4b" />
          <circle cx="64" cy="44" r="1.5" fill="#fff" />
          {/* Ribbon */}
          <path d="M44 82 L34 88 L38 78 Z" fill="#ef4444" />
          <path d="M56 82 L66 88 L62 78 Z" fill="#ef4444" />
          <circle cx="50" cy="80" r="4" fill="#dc2626" />
        </svg>
      )
    },
    {
      id: '3-6',
      name: 'Jouets 3-6 ans',
      bgColor: 'bg-[#fefce8] dark:bg-amber-950/20 border-[#fef08a]/60 dark:border-amber-900/30',
      btnColor: 'bg-[#eab308] hover:bg-[#ca8a04] text-slate-900',
      badge: '3-6 ans',
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
          {/* Cute Yellow Toy Car with Red Roof & Wheels */}
          <rect x="20" y="45" width="60" height="26" rx="8" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
          <path d="M28 45 Q36 24 56 24 Q72 24 76 45 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
          <rect x="36" y="28" width="16" height="14" rx="3" fill="#bae6fd" opacity="0.9" />
          <rect x="56" y="28" width="14" height="14" rx="3" fill="#bae6fd" opacity="0.9" />
          {/* Headlights */}
          <circle cx="23" cy="55" r="4" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
          {/* Wheels */}
          <circle cx="32" cy="71" r="11" fill="#1e293b" />
          <circle cx="32" cy="71" r="5" fill="#94a3b8" />
          <circle cx="68" cy="71" r="11" fill="#1e293b" />
          <circle cx="68" cy="71" r="5" fill="#94a3b8" />
        </svg>
      )
    },
    {
      id: '6-12',
      name: 'Jouets 6-12 ans',
      bgColor: 'bg-[#eff6ff] dark:bg-blue-950/20 border-[#dbeafe] dark:border-blue-900/30',
      btnColor: 'bg-[#3b82f6] hover:bg-[#2563eb] text-white',
      badge: '6-12 ans',
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
          {/* Blue & White Gamepad Controller */}
          <path d="M22 42 C16 48 14 74 24 78 C32 82 40 68 46 64 L54 64 C60 68 68 82 76 78 C86 74 84 48 78 42 C72 36 28 36 22 42 Z" fill="#ffffff" stroke="#3b82f6" strokeWidth="3" />
          {/* D-Pad */}
          <rect x="27" y="47" width="5" height="14" rx="1.5" fill="#3b82f6" />
          <rect x="22.5" y="51.5" width="14" height="5" rx="1.5" fill="#3b82f6" />
          {/* Action Buttons */}
          <circle cx="70" cy="50" r="3" fill="#ef4444" />
          <circle cx="76" cy="54" r="3" fill="#10b981" />
          <circle cx="64" cy="54" r="3" fill="#f59e0b" />
          <circle cx="70" cy="58" r="3" fill="#3b82f6" />
          {/* Thumbsticks */}
          <circle cx="39" cy="62" r="5" fill="#94a3b8" />
          <circle cx="61" cy="62" r="5" fill="#94a3b8" />
        </svg>
      )
    },
    {
      id: 'Jeux de société',
      name: 'Jeux de société',
      bgColor: 'bg-[#faf5ff] dark:bg-purple-950/20 border-[#f3e8ff] dark:border-purple-900/30',
      btnColor: 'bg-[#a855f7] hover:bg-[#9333ea] text-white',
      badge: 'Famille',
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
          {/* 3D Chessboard & Pieces */}
          <path d="M15 50 L50 30 L85 50 L50 70 Z" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="2" />
          <path d="M15 50 L15 58 L50 78 L85 58 L85 50 L50 70 Z" fill="#6d28d9" />
          {/* Grid lines */}
          <path d="M32 40 L67 60 M50 30 L50 70 M67 40 L32 60" stroke="#ede9fe" strokeWidth="1.5" />
          {/* Chess King / Pawn piece */}
          <path d="M47 38 L53 38 L52 48 L48 48 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
          <circle cx="50" cy="35" r="3" fill="#facc15" />
          <path d="M63 48 L69 48 L68 58 L64 58 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
          <circle cx="66" cy="45" r="3" fill="#ef4444" />
        </svg>
      )
    },
    {
      id: 'Puzzles',
      name: 'Puzzles',
      bgColor: 'bg-[#f0fdf4] dark:bg-emerald-950/20 border-[#dcfce7] dark:border-emerald-900/30',
      btnColor: 'bg-[#10b981] hover:bg-[#059669] text-white',
      badge: 'Logique',
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
          {/* Colorful Jigsaw Puzzle Interlocking Pieces */}
          <rect x="25" y="25" width="24" height="24" rx="4" fill="#3b82f6" />
          <circle cx="37" cy="25" r="5" fill="#3b82f6" />
          <rect x="51" y="25" width="24" height="24" rx="4" fill="#ef4444" />
          <circle cx="63" cy="49" r="5" fill="#ef4444" />
          <rect x="25" y="51" width="24" height="24" rx="4" fill="#10b981" />
          <circle cx="49" cy="63" r="5" fill="#10b981" />
          <rect x="51" y="51" width="24" height="24" rx="4" fill="#facc15" />
          <circle cx="51" cy="37" r="5" fill="#facc15" />
        </svg>
      )
    },
    {
      id: 'Éducatifs',
      name: 'Éducatifs',
      bgColor: 'bg-[#fff7ed] dark:bg-orange-950/20 border-[#ffedd5] dark:border-orange-900/30',
      btnColor: 'bg-[#f97316] hover:bg-[#ea580c] text-white',
      badge: 'Montessori',
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
          {/* Wooden Abacus & Beads */}
          <rect x="20" y="30" width="8" height="48" rx="2" fill="#b45309" />
          <rect x="72" y="30" width="8" height="48" rx="2" fill="#b45309" />
          <rect x="20" y="28" width="60" height="6" rx="2" fill="#78350f" />
          <rect x="20" y="74" width="60" height="6" rx="2" fill="#78350f" />
          {/* Wires */}
          <line x1="28" y1="40" x2="72" y2="40" stroke="#94a3b8" strokeWidth="2" />
          <line x1="28" y1="52" x2="72" y2="52" stroke="#94a3b8" strokeWidth="2" />
          <line x1="28" y1="64" x2="72" y2="64" stroke="#94a3b8" strokeWidth="2" />
          {/* Beads */}
          <circle cx="36" cy="40" r="4.5" fill="#ef4444" />
          <circle cx="45" cy="40" r="4.5" fill="#ef4444" />
          <circle cx="62" cy="40" r="4.5" fill="#ef4444" />
          <circle cx="36" cy="52" r="4.5" fill="#3b82f6" />
          <circle cx="54" cy="52" r="4.5" fill="#3b82f6" />
          <circle cx="63" cy="52" r="4.5" fill="#3b82f6" />
          <circle cx="42" cy="64" r="4.5" fill="#10b981" />
          <circle cx="51" cy="64" r="4.5" fill="#10b981" />
        </svg>
      )
    },
    {
      id: 'Extérieurs',
      name: 'Extérieurs',
      bgColor: 'bg-[#ecfeff] dark:bg-cyan-950/20 border-[#cffafe] dark:border-cyan-900/30',
      btnColor: 'bg-[#06b6d4] hover:bg-[#0891b2] text-white',
      badge: 'Plein air',
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
          {/* Kids Bicycle */}
          <circle cx="30" cy="65" r="14" stroke="#0284c7" strokeWidth="4" fill="none" />
          <circle cx="30" cy="65" r="4" fill="#0284c7" />
          <circle cx="70" cy="65" r="14" stroke="#0284c7" strokeWidth="4" fill="none" />
          <circle cx="70" cy="65" r="4" fill="#0284c7" />
          <path d="M30 65 L48 65 L60 48 L70 65 M48 65 L44 46 L38 46 M60 48 L54 36 L64 36" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          {/* Saddle */}
          <rect x="36" y="44" width="12" height="4" rx="2" fill="#1e293b" />
          {/* Handlebar */}
          <line x1="52" y1="36" x2="60" y2="36" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'Marques',
      name: 'Marques',
      bgColor: 'bg-[#fff1f2] dark:bg-rose-950/20 border-[#ffe4e6] dark:border-rose-900/30',
      btnColor: 'bg-[#a855f7] hover:bg-[#9333ea] text-white',
      badge: 'Officielles',
      icon: (
        <div className="flex flex-col items-center justify-center gap-1 w-16 h-16 select-none">
          <span className="text-[11px] font-black bg-[#ef4444] text-white px-2 py-0.5 rounded-sm shadow-xs uppercase tracking-tight">LEGO</span>
          <span className="text-[10px] font-black text-[#e11d48] italic tracking-tight font-serif">Barbie</span>
          <span className="text-[9px] font-bold text-[#0284c7] tracking-tight">playmobil</span>
        </div>
      )
    }
  ];

  return (
    <div className="w-full bg-[#f8fafc] dark:bg-slate-950 selection:bg-amber-400 selection:text-slate-900">
      
      {/* 1. HERO BANNER WITH VIBRANT CURVED ACCENTS & PLAYFUL DOODLES */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        
        {/* Playful Top & Bottom Wave Decor matching screenshot */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400 opacity-90"></div>

        {/* Decorative corner waves */}
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none"></div>
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-amber-400/25 blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-20 right-1/4 w-64 h-64 rounded-full bg-rose-400/20 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Heading, Doodles, CTA Button */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              
              {/* Hand-Drawn Doodle & Sparkling Title */}
              <div className="relative inline-block">
                
                {/* Floating Blue Star Doodle */}
                <span className="absolute -top-4 -left-6 text-2xl text-blue-500 animate-bounce duration-1000 select-none">
                  ⭐
                </span>
                
                {/* Cute Rocket Doodle with trail */}
                <div className="hidden sm:block absolute -top-8 -right-12 select-none transform rotate-12 hover:scale-110 transition-transform">
                  <span className="text-3xl">🚀</span>
                </div>

                {/* "✨ Le bonheur ✨" in stylish cursive/script */}
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <span className="text-amber-500 text-lg">✨</span>
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0284c7] font-serif italic tracking-wide">
                    {customHero?.title || 'Le bonheur'}
                  </span>
                  <span className="text-amber-500 text-lg">✨</span>
                </div>

                {/* "commence ici !" with high contrast vibrant typography */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] mt-1 font-sans">
                  <span className="text-slate-900 dark:text-white">
                    {customHero ? '' : 'commence '}
                  </span>
                  <span className="text-[#e11d48]">
                    {customHero?.titleHighlight || 'commence ici !'}
                  </span>
                </h1>
              </div>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
                {customHero?.description || 'Des milliers de jouets pour faire rêver vos enfants, à tous les âges !'}
              </p>

              {/* Yellow Pill CTA Button: "Découvrir la collection ➔" */}
              <div className="pt-2 flex justify-center lg:justify-start">
                <button
                  type="button"
                  onClick={() => onExplore(customHero?.buttonCategory || 'catalog')}
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#facc15] hover:bg-[#eab308] text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer select-none"
                >
                  <span>{customHero?.buttonText || 'Découvrir la collection'}</span>
                  <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-900 group-hover:translate-x-1 transition-transform shadow-xs">
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </span>
                </button>
              </div>

            </div>

            {/* Right Column: Wide Hero Photo of Smiling Children with Toys & Teepee */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-amber-50 dark:bg-slate-800">
                <img
                  src={customHero?.bgImage || heroImage}
                  alt="Enfants heureux jouant avec les jouets YoupiShop"
                  className="w-full h-72 sm:h-96 lg:h-[420px] object-cover object-center transform hover:scale-102 transition-transform duration-700"
                />
                
                {/* Subtle soft gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none"></div>

                {/* Right Stamp/Badge: "Jouer Grandir Rêver ♡" */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 select-none pointer-events-none">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#fef08a]/95 dark:bg-amber-900/90 border-4 border-dashed border-[#ca8a04] dark:border-amber-400 p-2 flex flex-col items-center justify-center text-center shadow-lg rotate-12 transform hover:rotate-0 transition-transform">
                    <span className="text-[12px] sm:text-[13px] font-black text-amber-950 dark:text-amber-100 font-serif leading-tight">
                      {customHero?.stickerLeft || 'Jouer'}
                    </span>
                    <span className="text-[11px] sm:text-[12px] font-extrabold text-amber-900 dark:text-amber-200 leading-tight">
                      Grandir
                    </span>
                    <span className="text-[12px] sm:text-[13px] font-black text-[#e11d48] font-serif leading-tight flex items-center justify-center gap-0.5">
                      {customHero?.stickerRight || 'Rêver'} <span>♡</span>
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </section>

      {/* 2. REASSURANCE TRUST BADGES (4 items with clean card style matching screenshot) */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 py-6 sm:py-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* 1. Livraison rapide */}
            <div className="flex items-center gap-3.5 p-3 sm:p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-amber-300 transition-colors">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                  {customBadges?.[0]?.title || 'Livraison rapide ✨'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {customBadges?.[0]?.subtitle || '24/48h partout en Tunisie'}
                </p>
              </div>
            </div>

            {/* 2. Paiement sécurisé */}
            <div className="flex items-center gap-3.5 p-3 sm:p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-emerald-300 transition-colors">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                  {customBadges?.[1]?.title || 'Paiement sécurisé ✨'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {customBadges?.[1]?.subtitle || '100% fiable à la livraison'}
                </p>
              </div>
            </div>

            {/* 3. Service client */}
            <div className="flex items-center gap-3.5 p-3 sm:p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-blue-300 transition-colors">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                  {customBadges?.[2]?.title || 'Service client ✨'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {customBadges?.[2]?.subtitle || 'À votre écoute 7j/7'}
                </p>
              </div>
            </div>

            {/* 4. Retour facile */}
            <div className="flex items-center gap-3.5 p-3 sm:p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-rose-300 transition-colors">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <RefreshCw className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                  {customBadges?.[3]?.title || 'Retour facile ✨'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {customBadges?.[3]?.subtitle || 'Sous 14 jours'}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. 8 PASTEL CATEGORY CARDS (Exact match to capture screenshot) */}
      <section className="py-8 sm:py-10 bg-[#f8fafc] dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {categoryCards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`group relative rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-between text-center transition-all duration-300 border hover:shadow-lg hover:-translate-y-1 cursor-pointer select-none ${card.bgColor}`}
              >
                {/* 3D Toy Icon */}
                <div className="h-16 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>

                {/* Card Label and Small Arrow Button */}
                <div className="w-full mt-3 flex items-center justify-between gap-1 pt-2 border-t border-black/5 dark:border-white/5">
                  <span className="text-[11px] sm:text-xs font-black text-slate-800 dark:text-slate-200 truncate text-left">
                    {card.name}
                  </span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-0.5 ${card.btnColor}`}>
                    <ArrowRight className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. BOTTOM PLAYFUL CURVED RIBBON BANNER (Exact match to capture screenshot) */}
      <section className="relative overflow-hidden bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white py-4 sm:py-5 select-none shadow-md">
        
        {/* Playful Floating Cartoon Assets in the Ribbon */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Left: Smiling Cartoon Sun with sunglasses/smile ☀️ */}
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl animate-pulse">☀️</span>
            <span className="text-2xl sm:text-3xl hidden md:inline">🌈</span>
          </div>

          {/* Center Message: "Parce que chaque enfant mérite son moment de bonheur ! ♡" */}
          <div className="flex-1 text-center">
            <p className="text-sm sm:text-base md:text-lg font-bold font-serif italic text-white tracking-wide drop-shadow-xs">
              Parce que chaque enfant mérite son moment de <span className="text-[#fde047] font-extrabold not-italic">bonheur !</span> ♡
            </p>
          </div>

          {/* Right: Cute rocket & stars 🚀 ⭐ */}
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">⭐</span>
            <span className="text-2xl sm:text-3xl">🚀</span>
          </div>

        </div>
      </section>

    </div>
  );
};

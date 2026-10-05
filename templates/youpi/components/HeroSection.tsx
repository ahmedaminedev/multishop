import React from 'react';
import { ArrowRight, Sparkles, Gift, ShieldCheck, HeartHandshake } from 'lucide-react';
import heroImage from '../../../src/assets/images/hero_youpishop_toys_1791240036994.jpg';

interface HeroSectionProps {
  onExplore: (categorySlug?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExplore }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 py-10 sm:py-16">
      
      {/* Decorative Pastel Background Blobs */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-amber-200/30 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-rose-200/30 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Boutique de Jouets & Éveil pour Enfants</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-[1.15] font-serif tracking-tight">
              L'univers du <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500">jeu</span>, du rire et du rêve
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Des jeux d'éveil sensoriels Montessori aux briques de construction créatives et jeux de société familiaux. Offrez des cadeaux qui éveillent l'intelligence et le sourire de vos enfants.
            </p>

            {/* Quick Age Buttons */}
            <div className="pt-2">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
                Trouver un cadeau par âge :
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                {[
                  { label: '0 - 12 mois', category: 'eveil-bebe' },
                  { label: '1 - 3 ans', category: 'eveil-bebe' },
                  { label: '3 - 6 ans', category: 'construction-lego' },
                  { label: '6 - 10 ans', category: 'jeux-de-societe' },
                  { label: '10 ans & +', category: 'jeux-de-societe' }
                ].map((age, i) => (
                  <button
                    key={i}
                    onClick={() => onExplore(age.category)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs hover:shadow-sm transition-all cursor-pointer"
                  >
                    {age.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-3">
              <button
                type="button"
                onClick={() => onExplore()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 hover:shadow-xl transition-all cursor-pointer active:scale-95"
              >
                <span>Découvrir la collection</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onExplore('construction-lego')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all cursor-pointer"
              >
                <Gift className="w-4 h-4 text-amber-500" />
                <span>Nouveautés 2026</span>
              </button>
            </div>

            {/* Trust points */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 text-left">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Norme CE & EN-71</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Paquet cadeau offert</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Satisfait ou échangé</span>
              </div>
            </div>

          </div>

          {/* Right Image Showcase Column */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 group">
              <img
                src={heroImage}
                alt="Univers des Jouets YoupiShop"
                className="w-full h-[320px] sm:h-[420px] lg:h-[480px] object-cover object-center group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-6 sm:p-8">
                <div className="text-white space-y-1">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-500">
                    Sélection Coup de Cœur
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold font-serif">
                    Jouets en bois durables & Jeux d'apprentissage
                  </h3>
                  <p className="text-xs text-slate-200">
                    Plus de 250 références disponibles en stock immédiat pour vos fêtes et anniversaires.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
};

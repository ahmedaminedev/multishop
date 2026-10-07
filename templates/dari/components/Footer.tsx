import React from 'react';
import { Logo } from './Logo';
import { Phone, Mail, MapPin, ShieldCheck, Truck, CreditCard, Sparkles } from 'lucide-react';
import type { LogoConfig } from '../types';

interface FooterProps {
  onNavigate?: (view: 'home' | 'catalog' | 'packs' | 'blog' | 'stores') => void;
  logoConfig?: LogoConfig;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate = () => {}, logoConfig }) => {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      
      {/* Upper Footer: Value Props */}
      <div className="border-b border-slate-800/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Livraison & Montage Soignés</h4>
              <p className="text-slate-400">Équipes formées au transport de mobilier délicat</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Garantie Qualité 2 Ans</h4>
              <p className="text-slate-400">Sélection rigoureuse de bois nobles et tissus antitache</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Paiement 100% Flexible</h4>
              <p className="text-slate-400">À la livraison en espèces ou en ligne sécurisé</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Logo logoConfig={logoConfig} variant="footer" className="text-white" />
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              DariShop est l'univers maison & décoration haut de gamme du Groupe MultiShop en Tunisie. Mobilier design, luminaires d'ambiance et art de vivre pour sublimer chaque espace.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>Showroom Principal : Les Berges du Lac 2, Tunis</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Service Clientèle : +216 71 860 110 / +216 55 263 522</span>
              </p>
            </div>
          </div>

          {/* Univers Déco */}
          <div>
            <h4 className="font-black text-xs uppercase tracking-wider text-white mb-3">
              Univers Déco
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><button onClick={() => onNavigate('catalog')} className="hover:text-white cursor-pointer">Canapés & Fauteuils</button></li>
              <li><button onClick={() => onNavigate('catalog')} className="hover:text-white cursor-pointer">Tables Basses & Repas</button></li>
              <li><button onClick={() => onNavigate('catalog')} className="hover:text-white cursor-pointer">Luminaires & Suspensions</button></li>
              <li><button onClick={() => onNavigate('catalog')} className="hover:text-white cursor-pointer">Miroirs en Arche</button></li>
              <li><button onClick={() => onNavigate('catalog')} className="hover:text-white cursor-pointer">Tapis Berbères Tissés</button></li>
            </ul>
          </div>

          {/* Nos Services */}
          <div>
            <h4 className="font-black text-xs uppercase tracking-wider text-white mb-3">
              Nos Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><button onClick={() => onNavigate('packs')} className="hover:text-white cursor-pointer">Packs Pièces Complètes</button></li>
              <li><button onClick={() => onNavigate('stores')} className="hover:text-white cursor-pointer">Nos 3 Showrooms</button></li>
              <li><button onClick={() => onNavigate('blog')} className="hover:text-white cursor-pointer">Conseils d'Architecte</button></li>
              <li><span className="hover:text-white cursor-pointer">Demande de Nuancier</span></li>
              <li><span className="hover:text-white cursor-pointer">Devis Professionnels & Hôtels</span></li>
            </ul>
          </div>

          {/* Groupe MultiShop */}
          <div>
            <h4 className="font-black text-xs uppercase tracking-wider text-white mb-3">
              Réseau MultiShop
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><span className="text-slate-300 font-semibold">🏠 DariShop (Maison & Déco)</span></li>
              <li><span className="hover:text-white cursor-pointer">⚡ Fitness Shop (Sport & Muscu)</span></li>
              <li><span className="hover:text-white cursor-pointer">🧸 YoupiShop (Jeux & Enfants)</span></li>
              <li className="pt-2 text-[10px] text-slate-500">Compte Client Unique (SSO)</li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 DariShop • Filiale du Groupe MultiShop Tunisie. Tous droits réservés.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Conditions Générales</span>
            <span>Mentions Légales</span>
            <span>Protection des Données</span>
          </div>
        </div>
      </div>

    </footer>
  );
};

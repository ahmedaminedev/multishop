import React, { useState } from 'react';
import { Logo } from './Logo';
import { Truck, Gift, ShieldCheck, Banknote, RefreshCw, Mail, Phone, MapPin, Heart, Send } from 'lucide-react';
import { useToast } from './ToastContext';

interface FooterProps {
  onNavigate: (view: 'home' | 'catalog' | 'packs' | 'blog' | 'stores') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { addToast } = useToast();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setIsSubscribed(true);
    addToast('Merci pour votre inscription ! Votre code -10% vous attend.', 'success');
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800 transition-colors">
      
      {/* 1. Reassurance Strip */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 text-center sm:text-left">
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase text-slate-200">Livraison 24/48h</h4>
              <p className="text-[11px] text-slate-400">Partout en Tunisie, offerte dès 100 DT</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase text-slate-200">Paquet Cadeau Offert</h4>
              <p className="text-[11px] text-slate-400">Emballage soigné + carte message</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase text-slate-200">Normes CE & EN-71</h4>
              <p className="text-[11px] text-slate-400">100% sécurisés & sans BPA</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase text-slate-200">Paiement à la livraison</h4>
              <p className="text-[11px] text-slate-400">En espèces après contrôle</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 col-span-2 md:col-span-1">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase text-slate-200">Échange 14 Jours</h4>
              <p className="text-[11px] text-slate-400">En magasin ou par coursier</p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Main Footer Columns */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Col 1: Brand presentation */}
        <div className="lg:col-span-4 space-y-4">
          <Logo showTagline={false} />
          <p className="text-xs text-slate-400 leading-relaxed font-normal">
            YoupiShop est le spécialiste des jouets éducatifs, jeux d'éveil sensoriels et univers ludiques pour les enfants de 0 à 12 ans en Tunisie. Filiale officielle du réseau MultiShop.
          </p>
          <div className="space-y-2 text-xs text-slate-300 pt-2">
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Service client : +216 71 888 123 (9h - 19h)</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span>contact@youpishop.tn</span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Tunis City Géant & Mall of Sousse</span>
            </p>
          </div>
        </div>

        {/* Col 2: Categories */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">
            Nos Univers Jouets
          </h3>
          <ul className="space-y-2 text-xs text-slate-400 font-medium">
            <li>
              <button onClick={() => onNavigate('catalog')} className="hover:text-white transition-colors cursor-pointer">
                👶 Éveil & Bébé (0-3 ans Montessori)
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('catalog')} className="hover:text-white transition-colors cursor-pointer">
                🧱 Briques de Construction & Lego
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('catalog')} className="hover:text-white transition-colors cursor-pointer">
                🎲 Jeux de Société & Stratégie Famille
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('catalog')} className="hover:text-white transition-colors cursor-pointer">
                🛴 Plein Air, Trottinettes & Draisiennes
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('catalog')} className="hover:text-white transition-colors cursor-pointer">
                🎨 Loisirs Créatifs & Pâte à Modeler
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Customer Care & Services */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">
            Services & Aide
          </h3>
          <ul className="space-y-2 text-xs text-slate-400 font-medium">
            <li>
              <button onClick={() => onNavigate('blog')} className="hover:text-white transition-colors cursor-pointer">
                Guide des âges
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('packs')} className="hover:text-white transition-colors cursor-pointer">
                Coffrets Anniversaire
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('stores')} className="hover:text-white transition-colors cursor-pointer">
                Nos 2 Magasins
              </button>
            </li>
            <li>
              <a href="#chat" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }} className="hover:text-white transition-colors cursor-pointer">
                Conseiller en direct
              </a>
            </li>
            <li>
              <span className="text-slate-500">Mentions Légales & CGV</span>
            </li>
          </ul>
        </div>

        {/* Col 4: Newsletter */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">
            Offre Anniversaire
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Inscrivez-vous et recevez un code promo de <strong>-10%</strong> pour le prochain anniversaire de votre enfant.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="space-y-2">
            <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Votre adresse email..."
                className="bg-transparent border-none text-xs text-white placeholder-slate-500 px-3 py-1.5 focus:outline-none flex-1"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 rounded-lg text-white font-bold text-xs uppercase cursor-pointer transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            {isSubscribed && (
              <span className="text-[11px] text-emerald-400 font-bold block">
                ✅ Merci ! Code promo : YOUPI10
              </span>
            )}
          </form>
          <p className="text-[10px] text-slate-500">
            Zéro spam. Désabonnement en un clic à tout moment.
          </p>
        </div>

      </div>

      {/* 3. Bottom Legal & Network Banner */}
      <div className="border-t border-slate-800 py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <p>
          © 2026 YoupiShop. Tous droits réservés. Filiale du réseau <strong>MultiShop</strong> Tunisie.
        </p>
        <div className="flex items-center gap-3 text-slate-400 text-xs">
          <span>🌿 PharmaShop</span>
          <span>•</span>
          <span>🏋️‍♂️ Fitness Shop</span>
          <span>•</span>
          <span>💄 Cosmetics Shop</span>
          <span>•</span>
          <span>🔌 Electro Shop</span>
          <span>•</span>
          <span className="font-bold text-amber-400">🧸 YoupiShop</span>
        </div>
      </div>

    </footer>
  );
};

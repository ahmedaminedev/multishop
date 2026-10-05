import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Store,
  Mail,
  Users,
  BarChart3,
  Settings,
  TrendingUp,
  MapPin,
  Phone,
  CheckCircle2,
  Shield,
  CreditCard,
  EyeOff,
  Eye,
  Wrench,
  ShieldAlert,
  Check,
  RefreshCw,
  Globe,
  Layout,
  Laptop,
  AlertTriangle
} from 'lucide-react';
import { SidebarMenuItem } from './SidebarNav';
import {
  getCachedSiteVisibility,
  fetchSiteVisibility,
  saveSiteVisibility,
  SiteVisibilityMap,
  SiteVisibilityItem,
  VisibilityScope,
  VisibilityMode
} from '../../utils/siteVisibility';

interface GlobalOtherViewsProps {
  currentMenu: SidebarMenuItem;
  stats: any;
  activeShop?: string;
  onSelectShop?: (shop: string) => void;
}

interface ShopTab {
  id: string;
  label: string;
  icon: string;
}

/* ========================================================================= */
/* 1. PROMOTIONS SUB-VIEW                                                    */
/* ========================================================================= */
interface PromotionsSubViewProps {
  filterShop: string;
  onFilterShopChange: (shopId: string) => void;
  shopTabs: ShopTab[];
}

const PromotionsSubView: React.FC<PromotionsSubViewProps> = ({
  filterShop,
  onFilterShopChange,
  shopTabs
}) => {
  const allPromos = [
    { id: '1', title: 'Offre de Bienvenue Printemps', desc: '-15% sur la première commande avec le code SPRING15', scope: 'all', code: 'SPRING15', uses: 24, exp: '31 Déc 2026', badge: 'ACTIVE', badgeColor: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { id: '2', title: 'Pack Puissance & Tech', desc: 'Livraison express gratuite dès 150 DT d\'achats combinés.', scope: 'nutrition', code: 'POWERTECH', uses: 12, exp: '15 Nov 2026', badge: 'FLASH SALE', badgeColor: 'text-amber-600 bg-amber-50 border-amber-200' },
    { id: '3', title: 'Duo Beauté & Soin Visage', desc: '1 Masque régénérant offert pour 2 crèmes achetées.', scope: 'cosmetic', code: 'GLOW50', uses: 38, exp: '20 Oct 2026', badge: 'OFFRE BEAUTÉ', badgeColor: 'text-rose-600 bg-rose-50 border-rose-200' },
    { id: '4', title: 'Remise Tech Électro', desc: '-10% sur tout le rayon petit électroménager cuisine.', scope: 'electro', code: 'ELECTRO10', uses: 19, exp: '01 Déc 2026', badge: 'TECH DEAL', badgeColor: 'text-blue-600 bg-blue-50 border-blue-200' },
    { id: '5', title: 'Immunité & Phytothérapie', desc: '-20% sur la gamme compléments alimentaires Bio.', scope: 'para', code: 'PHYTO20', uses: 45, exp: '30 Nov 2026', badge: 'SANTÉ BIO', badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  ];

  const filteredPromos = allPromos.filter(p => filterShop === 'all' || p.scope === 'all' || p.scope === filterShop);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            CAMPAGNES & PROMOTIONS <span className="text-blue-600">GROUPE</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Gérez les offres spéciales, remises flash et codes promos pour les 4 boutiques
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 overflow-x-auto no-scrollbar">
          {shopTabs.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => onFilterShopChange(st.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterShop === st.id ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <span>{st.icon}</span>
              <span>{st.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPromos.map((promo) => (
          <div key={promo.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${promo.badgeColor}`}>
                  {promo.badge}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-400 capitalize">
                  {promo.scope === 'all' ? 'Toutes boutiques' : promo.scope}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{promo.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{promo.desc}</p>
            </div>
            <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 flex justify-between items-center">
              <span>Code : <strong className="text-blue-600 font-mono">{promo.code}</strong></span>
              <span>{promo.uses} utilisations</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 2. STORES SUB-VIEW                                                        */
/* ========================================================================= */
interface StoresSubViewProps {
  filterShop: string;
  onFilterShopChange: (shopId: string) => void;
  shopTabs: ShopTab[];
}

const StoresSubView: React.FC<StoresSubViewProps> = ({
  filterShop,
  onFilterShopChange,
  shopTabs
}) => {
  const storesList = [
    { name: 'MultiShop Flagship Tunis Centre', address: 'Avenue Habib Bourguiba, Tunis', phone: '+216 71 100 200', branches: ['PharmaShop', 'Cosmetics', 'Electro'], scope: ['para', 'cosmetic', 'electro'] },
    { name: 'MultiShop Megastore Sousse', address: 'Boulevard 14 Janvier, Sousse', phone: '+216 73 200 300', branches: ['Fitness Shop', 'Electro'], scope: ['nutrition', 'electro'] },
    { name: 'MultiShop Point de Vente Sfax', address: 'Route de Téniour, Sfax', phone: '+216 74 300 400', branches: ['PharmaShop', 'Cosmetics'], scope: ['para', 'cosmetic'] },
    { name: 'MultiShop Nabeul Cap Bon', address: 'Avenue Habib Thameur, Nabeul', phone: '+216 72 400 500', branches: ['Toutes Filiales'], scope: ['para', 'nutrition', 'cosmetic', 'electro'] }
  ];

  const filteredStores = storesList.filter(st => filterShop === 'all' || st.scope.includes(filterShop));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            RÉSEAU DES MAGASINS <span className="text-blue-600">EN TUNISIE</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Points de vente physiques, retrait click & collect et stocks régionaux
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 overflow-x-auto no-scrollbar">
          {shopTabs.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => onFilterShopChange(st.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterShop === st.id ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <span>{st.icon}</span>
              <span>{st.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredStores.map((store, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{store.name}</h3>
                <p className="text-xs text-slate-500">{store.address}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {store.branches.map((b, bi) => (
                <span key={bi} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                  {b}
                </span>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {store.phone}</span>
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Ouvert 8h30 - 19h30</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 3. MESSAGES SUB-VIEW                                                      */
/* ========================================================================= */
interface MessagesSubViewProps {
  filterShop: string;
  onFilterShopChange: (shopId: string) => void;
  shopTabs: ShopTab[];
}

const MessagesSubView: React.FC<MessagesSubViewProps> = ({
  filterShop,
  onFilterShopChange,
  shopTabs
}) => {
  const allMessages = [
    { id: '1', author: 'Mehdi Ben Salah', email: 'mehdi.bensalah@gmail.com', shop: '⚡ Fitness Shop', shopKey: 'nutrition', text: 'Bonjour, quel est le délai de livraison pour la Whey Isolate sur Sousse ?', time: 'Il y a 2h' },
    { id: '2', author: 'Sonia Triki', email: 'sonia.triki@yahoo.fr', shop: '💄 Cosmetics', shopKey: 'cosmetic', text: 'Le sérum à l\'acide hyaluronique convient-il aux peaux très sensibles ?', time: 'Hier' },
    { id: '3', author: 'Khaled Mansouri', email: 'khaled.m@gmail.com', shop: '🔌 Electro', shopKey: 'electro', text: 'La machine à café expresso est-elle garantie 2 ans avec facture ?', time: 'Il y a 2 jours' },
    { id: '4', author: 'Amina Cherif', email: 'amina.cherif@outlook.com', shop: '🌿 PharmaShop', shopKey: 'para', text: 'Est-il possible de préparer une commande click & collect pour cet après-midi ?', time: 'Il y a 3 jours' }
  ];

  const filteredMessages = allMessages.filter(m => filterShop === 'all' || m.shopKey === filterShop);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            MESSAGERIE & SUPPORT <span className="text-blue-600">CLIENTS</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Boîte de réception centralisée des formulaires de contact et questions produits
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 overflow-x-auto no-scrollbar">
          {shopTabs.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => onFilterShopChange(st.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterShop === st.id ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <span>{st.icon}</span>
              <span>{st.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-6 space-y-4">
        {filteredMessages.map((msg) => (
          <div key={msg.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-start hover:bg-slate-100/60 transition-colors">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{msg.author}</span>
                <span className="text-[10px] text-slate-400">({msg.email})</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  {msg.shop}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">"{msg.text}"</p>
            </div>
            <span className="text-[10px] text-slate-400 shrink-0">{msg.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 4. USERS SUB-VIEW                                                         */
/* ========================================================================= */
const UsersSubView: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
          GESTION DES COMPTES <span className="text-blue-600">UTILISATEURS</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Accès unique SSO pour tous les clients et administrateurs du groupe
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Utilisateur</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Rôle</th>
              <th className="py-3 px-4">Filiale principale</th>
              <th className="py-3 px-4 text-right">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-3 px-4 font-bold text-slate-900">Admin MultiShop</td>
              <td className="py-3 px-4 text-slate-600">admin@multishop.tn</td>
              <td className="py-3 px-4"><span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold text-[10px]">Super Admin</span></td>
              <td className="py-3 px-4 text-slate-600">Toutes filiales</td>
              <td className="py-3 px-4 text-right"><span className="text-emerald-600 font-bold">Actif</span></td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-bold text-slate-900">Responsable Pharma</td>
              <td className="py-3 px-4 text-slate-600">pharma@multishop.tn</td>
              <td className="py-3 px-4"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold text-[10px]">Gestionnaire</span></td>
              <td className="py-3 px-4 text-slate-600">PharmaShop</td>
              <td className="py-3 px-4 text-right"><span className="text-emerald-600 font-bold">Actif</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 5. REPORTS SUB-VIEW                                                       */
/* ========================================================================= */
interface ReportsSubViewProps {
  stats: any;
}

const ReportsSubView: React.FC<ReportsSubViewProps> = ({ stats }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
          RAPPORTS & ANALYTICS <span className="text-blue-600">GROUPE</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Répartition des revenus consolidés par boutique et indicateurs clés
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 uppercase">Part de CA par Filiale</h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">🔌 Electro Shop (3 931 DT)</span>
                <span className="font-bold text-blue-600">87.2%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '87.2%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">⚡ Fitness Shop (289 DT)</span>
                <span className="font-bold text-amber-600">6.4%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '6.4%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">💄 Cosmetics Shop (289 DT)</span>
                <span className="font-bold text-rose-600">6.4%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '6.4%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">🌿 PharmaShop (0 DT)</span>
                <span className="font-bold text-emerald-600">0%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '1%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 uppercase">Performance Moyenne Panier</h3>
          <div className="p-4 bg-blue-50 rounded-xl space-y-1">
            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Panier Moyen Groupe</p>
            <p className="text-2xl font-black text-slate-900">901.8 DT</p>
            <p className="text-[11px] text-slate-500">Calculé sur l'ensemble des 5 commandes finalisées</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 6. SETTINGS SUB-VIEW (Site Visibility & Availability)                    */
/* ========================================================================= */
const STORE_ITEMS = [
  { id: 'para', name: 'PharmaShop', icon: '🌿', tagline: 'Santé, Phytothérapie & Soins Bio', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { id: 'nutrition', name: 'Fitness Shop', icon: '🏋️‍♂️', tagline: 'Équipements de Musculation & Fitness', color: 'text-lime-700 bg-lime-50 border-lime-200' },
  { id: 'cosmetic', name: 'Cosmetics Shop', icon: '💄', tagline: 'Soins, Beauté & Parfumerie Luxe', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  { id: 'electro', name: 'Electro Shop', icon: '🔌', tagline: 'High-Tech & Électroménager', color: 'text-blue-700 bg-blue-50 border-blue-200' },
];

const SettingsSubView: React.FC = () => {
  const [siteVisibility, setSiteVisibility] = useState<SiteVisibilityMap>(getCachedSiteVisibility);
  const [isSavingVisibility, setIsSavingVisibility] = useState(false);
  const [visibilitySuccessMsg, setVisibilitySuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchSiteVisibility().then((data) => {
      if (isMounted) setSiteVisibility(data);
    });

    const handleVis = (e: any) => {
      if (isMounted && e.detail) setSiteVisibility(e.detail);
    };

    window.addEventListener('site-visibility-changed', handleVis);
    return () => {
      isMounted = false;
      window.removeEventListener('site-visibility-changed', handleVis);
    };
  }, []);

  const handleUpdateSiteConfig = (siteId: string, partial: Partial<SiteVisibilityItem>) => {
    const current = siteVisibility[siteId] || {
      siteId,
      is_hidden: false,
      scope: 'frontoffice',
      mode: 'cacher_tout',
      maintenance_message: `Boutique ${siteId} temporairement en maintenance.`
    };

    const updated: SiteVisibilityMap = {
      ...siteVisibility,
      [siteId]: {
        ...current,
        ...partial
      }
    };

    setSiteVisibility(updated);

    // Defer broadcast and server save to next tick to avoid setState in render conflict
    setTimeout(() => {
      saveSiteVisibility(updated);
    }, 0);
  };

  const handleSaveAllVisibility = async () => {
    setIsSavingVisibility(true);
    setVisibilitySuccessMsg(null);
    try {
      await saveSiteVisibility(siteVisibility);
      setVisibilitySuccessMsg('Visibilité des boutiques mise à jour avec succès et synchronisée sur tout le réseau MultiShop !');
      setTimeout(() => setVisibilitySuccessMsg(null), 3000);
    } catch {
      // error handled
    } finally {
      setIsSavingVisibility(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl pb-10">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
          PARAMÈTRES DU SYSTÈME & <span className="text-blue-600">GESTION DES SITES</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Contrôlez la visibilité, le masquage ou le passage en maintenance de chaque boutique sur le front-office et/ou le back-office
        </p>
      </div>

      {/* FEEDBACK SUCCESS ALERT */}
      {visibilitySuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{visibilitySuccessMsg}</span>
        </div>
      )}

      {/* SECTION VISIBILITÉ & DISPONIBILITÉ DES SITES */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌐</span>
              <h3 className="font-black text-base text-slate-900 uppercase tracking-tight">
                Visibilité & Disponibilité des Boutiques du Réseau
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cochez <em>"Cacher le site"</em> pour définir précisément où et comment masquer chaque filiale (Front-office, Back-office, ou les deux; Cacher tout ou Maintenance).
            </p>
          </div>

          <button
            type="button"
            disabled={isSavingVisibility}
            onClick={handleSaveAllVisibility}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2 self-start sm:self-auto shrink-0"
          >
            {isSavingVisibility ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>{isSavingVisibility ? 'Enregistrement...' : 'Enregistrer la Visibilité'}</span>
          </button>
        </div>

        {/* Sites List */}
        <div className="grid grid-cols-1 gap-5">
          {STORE_ITEMS.map((store) => {
            const config = siteVisibility[store.id] || {
              siteId: store.id,
              is_hidden: false,
              scope: 'frontoffice',
              mode: 'cacher_tout',
              maintenance_message: `Boutique ${store.name} temporairement en maintenance.`
            };

            const isHidden = Boolean(config.is_hidden);

            return (
              <div
                key={store.id}
                className={`rounded-2xl border-2 transition-all p-5 ${
                  isHidden
                    ? config.mode === 'maintenance'
                      ? 'bg-amber-50/40 border-amber-300'
                      : 'bg-red-50/30 border-red-300'
                    : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Store Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs shrink-0">
                      {store.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-slate-900">{store.name}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500 font-semibold">
                          ID: {store.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{store.tagline}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {!isHidden ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>En Ligne (Visible Partout)</span>
                      </span>
                    ) : config.mode === 'maintenance' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-amber-600" />
                        <span>Mode Maintenance ({config.scope === 'les_deux' ? 'Front & Back' : config.scope})</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1.5">
                        <EyeOff className="w-3.5 h-3.5 text-red-600" />
                        <span>Masqué Totalement ({config.scope === 'les_deux' ? 'Front & Back' : config.scope})</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Checkbox: Cacher le site */}
                <div className="pt-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isHidden}
                      onChange={(e) => handleUpdateSiteConfig(store.id, { is_hidden: e.target.checked })}
                      className="w-5 h-5 rounded-lg text-red-600 focus:ring-red-500 cursor-pointer border-slate-300"
                    />
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        Cacher le site / Restreindre la visibilité
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Activez cette case pour masquer cette boutique ou la basculer en mode maintenance technique
                      </p>
                    </div>
                  </label>

                  {/* WHEN CHECKED: REVEAL SCOPE & MODE OPTIONS */}
                  {isHidden && (
                    <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-4 animate-fadeIn pl-2 sm:pl-7">
                      
                      {/* 1. Scope: Back-office, Front-office ou Les deux */}
                      <div>
                        <label className="block text-slate-800 font-bold text-xs mb-2">
                          1. Périmètre d'application (Où cacher ?) :
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {[
                            { id: 'frontoffice' as VisibilityScope, label: 'Front-Office (Clients)', desc: 'Masquer de la barre de navigation publique et de la vitrine client', icon: Laptop },
                            { id: 'backoffice' as VisibilityScope, label: 'Back-Office (Admin)', desc: 'Masquer des sélecteurs de boutiques de l\'administration', icon: Layout },
                            { id: 'les_deux' as VisibilityScope, label: 'Les Deux (Front & Back)', desc: 'Masquer totalement sur toute la plateforme', icon: Globe },
                          ].map((sc) => {
                            const isSelected = config.scope === sc.id;
                            const ScIcon = sc.icon;
                            return (
                              <label
                                key={sc.id}
                                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                                  isSelected
                                    ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-1.5 font-bold text-xs">
                                    <ScIcon className="w-3.5 h-3.5 text-blue-600" />
                                    <span>{sc.label}</span>
                                  </div>
                                  <input
                                    type="radio"
                                    name={`scope_${store.id}`}
                                    value={sc.id}
                                    checked={isSelected}
                                    onChange={() => handleUpdateSiteConfig(store.id, { scope: sc.id })}
                                    className="text-blue-600 focus:ring-blue-500"
                                  />
                                </div>
                                <p className="text-[10px] text-slate-500 leading-snug">{sc.desc}</p>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. Mode: Cacher tout ou Maintenance */}
                      <div>
                        <label className="block text-slate-800 font-bold text-xs mb-2">
                          2. Mode de restriction :
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {[
                            { 
                              id: 'cacher_tout' as VisibilityMode, 
                              label: 'Cacher tout (Disparition totale)', 
                              desc: 'Le site disparaît complètement de la barre de navigation. Les visiteurs sont redirigés vers une autre boutique active.',
                              badge: 'Disparition de la Nav Bar',
                              color: 'text-red-700 bg-red-50 border-red-200' 
                            },
                            { 
                              id: 'maintenance' as VisibilityMode, 
                              label: 'Maintenance (Page dédiée)', 
                              desc: 'Le site affiche une page professionnelle de maintenance technique informant les visiteurs du réapprovisionnement.',
                              badge: 'Écran de Maintenance',
                              color: 'text-amber-700 bg-amber-50 border-amber-200' 
                            }
                          ].map((md) => {
                            const isSelected = config.mode === md.id;
                            return (
                              <label
                                key={md.id}
                                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                                  isSelected
                                    ? md.id === 'maintenance'
                                      ? 'bg-amber-50/80 border-amber-500 text-amber-950 shadow-xs'
                                      : 'bg-red-50/80 border-red-500 text-red-950 shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-black text-xs">{md.label}</span>
                                  <input
                                    type="radio"
                                    name={`mode_${store.id}`}
                                    value={md.id}
                                    checked={isSelected}
                                    onChange={() => handleUpdateSiteConfig(store.id, { mode: md.id })}
                                    className="text-slate-900 focus:ring-slate-500"
                                  />
                                </div>
                                <p className="text-[10px] text-slate-500 leading-snug">{md.desc}</p>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* 3. Maintenance Message Input (if mode === 'maintenance') */}
                      {config.mode === 'maintenance' && (
                        <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1.5 animate-fadeIn">
                          <label className="block text-slate-800 font-bold text-xs flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-amber-600" />
                            <span>Message de maintenance affiché aux clients :</span>
                          </label>
                          <textarea
                            rows={2}
                            value={config.maintenance_message || ''}
                            onChange={(e) => handleUpdateSiteConfig(store.id, { maintenance_message: e.target.value })}
                            placeholder="Message d'information pour les clients..."
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      )}

                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Save Reminder */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            💡 Les modifications s'appliquent immédiatement à la navigation publique et à la console d'administration.
          </p>
          <button
            type="button"
            disabled={isSavingVisibility}
            onClick={handleSaveAllVisibility}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            {isSavingVisibility ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>Enregistrer la Visibilité</span>
          </button>
        </div>
      </div>

      {/* SECTION PARAMÈTRES GÉNÉRAUX CLASSIQUES */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight pb-3 border-b border-slate-100">
          Paramètres Financiers & Réseau
        </h3>

        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <p className="font-bold text-slate-900 text-xs">Devise Principale du Groupe</p>
            <p className="text-[11px] text-slate-400">Dinar Tunisien (DT / TND)</p>
          </div>
          <span className="px-3 py-1 bg-slate-100 text-slate-700 font-mono font-bold rounded-lg text-xs">DT</span>
        </div>

        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <p className="font-bold text-slate-900 text-xs">Taux de TVA par Défaut</p>
            <p className="text-[11px] text-slate-400">Appliquée aux produits des filiales</p>
          </div>
          <span className="px-3 py-1 bg-slate-100 text-slate-700 font-mono font-bold rounded-lg text-xs">19 %</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-900 text-xs">Mode Multi-Boutiques Actif</p>
            <p className="text-[11px] text-slate-400">Synchronisation en temps réel des stocks et commandes</p>
          </div>
          <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Activé
          </span>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* MAIN EXPORT: GlobalOtherViews                                            */
/* ========================================================================= */
export const GlobalOtherViews: React.FC<GlobalOtherViewsProps> = ({
  currentMenu,
  stats,
  activeShop = 'all',
  onSelectShop
}) => {
  const [filterShop, setFilterShop] = useState(activeShop);

  useEffect(() => {
    setFilterShop(activeShop);
  }, [activeShop]);

  const handleFilterShopChange = (s: string) => {
    setFilterShop(s);
    if (onSelectShop) onSelectShop(s);
  };

  const shopTabs: ShopTab[] = [
    { id: 'all', label: 'Toutes', icon: '🌐' },
    { id: 'para', label: 'Pharma', icon: '🌿' },
    { id: 'nutrition', label: 'Nutrition', icon: '⚡' },
    { id: 'cosmetic', label: 'Cosmetic', icon: '💄' },
    { id: 'electro', label: 'Electro', icon: '🔌' },
  ];

  if (currentMenu === 'promotions') {
    return (
      <PromotionsSubView
        filterShop={filterShop}
        onFilterShopChange={handleFilterShopChange}
        shopTabs={shopTabs}
      />
    );
  }

  if (currentMenu === 'stores') {
    return (
      <StoresSubView
        filterShop={filterShop}
        onFilterShopChange={handleFilterShopChange}
        shopTabs={shopTabs}
      />
    );
  }

  if (currentMenu === 'messages') {
    return (
      <MessagesSubView
        filterShop={filterShop}
        onFilterShopChange={handleFilterShopChange}
        shopTabs={shopTabs}
      />
    );
  }

  if (currentMenu === 'users') {
    return <UsersSubView />;
  }

  if (currentMenu === 'reports') {
    return <ReportsSubView stats={stats} />;
  }

  return <SettingsSubView />;
};

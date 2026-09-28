import React from 'react';
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
  CreditCard
} from 'lucide-react';
import { SidebarMenuItem } from './SidebarNav';

interface GlobalOtherViewsProps {
  currentMenu: SidebarMenuItem;
  stats: any;
}

export const GlobalOtherViews: React.FC<GlobalOtherViewsProps> = ({ currentMenu, stats }) => {
  if (currentMenu === 'promotions') {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            CAMPAGNES & PROMOTIONS <span className="text-blue-600">GROUPE</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Gérez les offres spéciales, remises flash et codes promos pour les 4 boutiques
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ACTIVE
              </span>
              <span className="text-xs text-slate-400">Toutes filiales</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Offre de Bienvenue Printemps</h3>
            <p className="text-xs text-slate-500">-15% sur la première commande avec le code <strong className="text-blue-600">SPRING15</strong></p>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
              <span>Utilisations : 24</span>
              <span>Expiration : 31 Déc 2026</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                FLASH SALE
              </span>
              <span className="text-xs text-slate-400">⚡ IronFuel & 🔌 Electro</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Pack Puissance & Tech</h3>
            <p className="text-xs text-slate-500">Livraison express gratuite dès 150 DT d'achats combinés.</p>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
              <span>Statut : En cours</span>
              <span>Actif sur web & mobile</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentMenu === 'stores') {
    const storesList = [
      { name: 'MultiShop Flagship Tunis Centre', address: 'Avenue Habib Bourguiba, Tunis', phone: '+216 71 100 200', branches: ['PharmaNature', 'Cosmetics', 'Electro'] },
      { name: 'MultiShop Megastore Sousse', address: 'Boulevard 14 Janvier, Sousse', phone: '+216 73 200 300', branches: ['IronFuel Nutrition', 'Electro'] },
      { name: 'MultiShop Point de Vente Sfax', address: 'Route de Téniour, Sfax', phone: '+216 74 300 400', branches: ['PharmaNature', 'Cosmetics'] },
      { name: 'MultiShop Nabeul Cap Bon', address: 'Avenue Habib Thameur, Nabeul', phone: '+216 72 400 500', branches: ['Toutes Filiales'] }
    ];

    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            RÉSEAU DES MAGASINS <span className="text-blue-600">EN TUNISIE</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Points de vente physiques, retrait click & collect et stocks régionaux
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {storesList.map((store, i) => (
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
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {store.phone}</span>
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Ouvert</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentMenu === 'messages') {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            MESSAGERIE & SUPPORT <span className="text-blue-600">CLIENTS</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Boîte de réception centralisée des formulaires de contact et questions produits
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">Mehdi Ben Salah</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">⚡ IronFuel</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">"Bonjour, quel est le délai de livraison pour la Whey Isolate sur Sousse ?"</p>
            </div>
            <span className="text-[10px] text-slate-400">Il y a 2h</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">Sonia Triki</span>
                <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">💄 Cosmetics</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">"Le sérum à l'acide hyaluronique convient-il aux peaux très sensibles ?"</p>
            </div>
            <span className="text-[10px] text-slate-400">Hier</span>
          </div>
        </div>
      </div>
    );
  }

  if (currentMenu === 'users') {
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
                <td className="py-3 px-4 text-slate-600">PharmaNature</td>
                <td className="py-3 px-4 text-right"><span className="text-emerald-600 font-bold">Actif</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (currentMenu === 'reports') {
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
                  <span className="font-semibold text-slate-700">⚡ IronFuel Nutrition (289 DT)</span>
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
                  <span className="font-semibold text-slate-700">🌿 PharmaNature (0 DT)</span>
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
  }

  // Settings
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
          PARAMÈTRES DU SYSTÈME <span className="text-blue-600">MULTISHOP</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Configuration générale du réseau, devises et passerelles de paiement
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4 max-w-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <p className="font-bold text-slate-900 text-xs">Devise Principale</p>
            <p className="text-[11px] text-slate-400">Dinar Tunisien (DT / TND)</p>
          </div>
          <span className="px-3 py-1 bg-slate-100 text-slate-700 font-mono font-bold rounded-lg text-xs">DT</span>
        </div>

        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <p className="font-bold text-slate-900 text-xs">TVA par Défaut</p>
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

import React from 'react';
import { Wrench, Phone, Mail, Clock, ArrowRight, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { FilialeId } from '../models/ProductFiliale';
import { MULTISHOP_STORES } from './MultiShopGlobalNav';
import { 
  getCachedSiteVisibility, 
  isSiteHiddenInFrontOffice, 
  isSiteInMaintenanceInFrontOffice,
  SiteVisibilityMap 
} from '../utils/siteVisibility';

interface ShopMaintenanceScreenProps {
  currentShop: FilialeId;
  onSwitchShop: (shopId: FilialeId) => void;
  siteVisibility?: SiteVisibilityMap;
}

export const ShopMaintenanceScreen: React.FC<ShopMaintenanceScreenProps> = ({
  currentShop,
  onSwitchShop,
  siteVisibility
}) => {
  const visMap = siteVisibility || getCachedSiteVisibility();
  const currentConfig = visMap[currentShop];
  const currentStore = MULTISHOP_STORES.find(s => s.id === currentShop) || MULTISHOP_STORES[0];

  const maintenanceMessage = currentConfig?.maintenance_message || 
    `La boutique ${currentStore.name} fait l'objet d'une intervention technique programmée afin d'améliorer la disponibilité des stocks et vos services.`;

  // Find other shops that are online and not in maintenance
  const otherActiveShops = MULTISHOP_STORES.filter(s => 
    s.id !== currentShop && 
    !isSiteHiddenInFrontOffice(s.id, visMap) &&
    !isSiteInMaintenanceInFrontOffice(s.id, visMap)
  );

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6 animate-fadeIn">
        
        {/* Top Icon & Badge */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-700 flex items-center justify-center text-4xl shadow-inner">
              {currentStore.icon}
            </div>
            <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-amber-500 text-white shadow-md">
              <Wrench className="w-4 h-4 animate-bounce" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Maintenance Technique Temporaire
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {currentStore.name} revient très vite !
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Réseau MultiShop Groupe Tunisie
            </p>
          </div>
        </div>

        {/* Custom Message Card */}
        <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
          <p className="font-semibold text-amber-950 dark:text-amber-200">
            {maintenanceMessage}
          </p>
          <div className="mt-3 pt-3 border-t border-amber-200/80 dark:border-amber-900/60 flex items-center justify-center gap-2 text-xs text-amber-800 dark:text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Nos équipes techniques finalisent les mises à jour nécessaires.</span>
          </div>
        </div>

        {/* Other Active Stores in Network */}
        {otherActiveShops.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              En attendant, visitez nos autres boutiques ouvertes :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {otherActiveShops.map((shop) => (
                <button
                  key={shop.id}
                  type="button"
                  onClick={() => onSwitchShop(shop.id)}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-slate-800/60 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all text-left group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{shop.icon}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="font-black text-xs text-slate-900 dark:text-white mt-1.5">
                    {shop.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {shop.badge}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Support & Action */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              +216 55 263 522
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              support@multishop.tn
            </span>
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser la page</span>
          </button>
        </div>

      </div>
    </div>
  );
};

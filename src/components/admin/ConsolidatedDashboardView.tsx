import React, { useState, useEffect, useMemo } from 'react';
import {
  RotateCw,
  ExternalLink,
  Store as StoreIcon,
  Package,
  Clock,
  Tag,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  ShoppingCart,
  Layers,
  Sparkles,
  BarChart3,
  SlidersHorizontal
} from 'lucide-react';
import { BackofficeTab } from './TopHeader';
import {
  getCachedSiteVisibility,
  saveSiteVisibility,
  SiteVisibilityMap
} from '../../utils/siteVisibility';

interface ConsolidatedDashboardViewProps {
  stats: any;
  onRefresh?: () => void;
  onSelectFilialeTab: (tab: BackofficeTab) => void;
  allProducts: any[];
  allOrders: any[];
  onNavigateToMenu?: (menu: any) => void;
  siteVisibility?: SiteVisibilityMap;
}

export const ConsolidatedDashboardView: React.FC<ConsolidatedDashboardViewProps> = ({
  stats,
  onRefresh,
  onSelectFilialeTab,
  allProducts = [],
  allOrders = [],
  onNavigateToMenu,
  siteVisibility: initialVisibility
}) => {
  // Live visibility map state
  const [visibility, setVisibility] = useState<SiteVisibilityMap>(initialVisibility || getCachedSiteVisibility);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<string | null>(null);
  
  // Toggle between "Sites actifs uniquement" (default) or "Tout le groupe"
  const [filterMode, setFilterMode] = useState<'active_only' | 'all_sites'>('active_only');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync visibility changes in real time
  useEffect(() => {
    if (initialVisibility) setVisibility(initialVisibility);
  }, [initialVisibility]);

  useEffect(() => {
    const handleVis = (e: any) => {
      if (e.detail) setVisibility(e.detail);
    };
    window.addEventListener('site-visibility-changed', handleVis);
    return () => window.removeEventListener('site-visibility-changed', handleVis);
  }, []);

  // 100% Dynamic Database Calculations
  // Compute sub-site metrics directly from stats OR dynamically from loaded collections
  const filialesComputed = useMemo(() => {
    const filialeKeys = ['nutrition', 'youpi'];
    return filialeKeys.map((key) => {
      const isNutrition = key === 'nutrition';
      const name = isNutrition ? 'Fitness Shop' : 'YoupiShop';
      const subtitle = isNutrition ? 'Matériel Musculation & Fitness' : "Jeux d'Enfants & Jouets d'Éveil";
      const icon = isNutrition ? '🏋️‍♂️' : '🧸';
      const enumType = isNutrition ? 'produit_myshops_nutrition' : 'produit_myshops_youpi';

      // Live stats from server payload
      const serverFStats = stats?.filiales?.[key];

      // Dynamic fallback calculated directly from raw live records if server payload is loading
      const filialeOrders = allOrders.filter(o => o.filialeKey === key);
      const validOrders = filialeOrders.filter(o => o.status !== 'Annulée' && o.status !== 'annulé');
      const computedRevenue = validOrders.reduce((sum, o) => sum + (Number(o.total || o.totalAmount) || 0), 0);
      const filialeProds = allProducts.filter(p => p.filialeKey === key);
      const pendingOrders = filialeOrders.filter(o => ['En attente', 'en_attente', 'Expédiée', 'confirmé'].includes(o.status)).length;
      const lowStockProds = filialeProds.filter(p => (Number(p.quantité_enstock ?? p.quantity) || 0) <= 5).length;
      const catalogVal = filialeProds.reduce((sum, p) => sum + ((Number(p.price) || 0) * (Number(p.quantité_enstock ?? p.quantity) || 0)), 0);

      const revenue = serverFStats?.revenue !== undefined ? serverFStats.revenue : computedRevenue;
      const orders = serverFStats?.ordersCount !== undefined ? serverFStats.ordersCount : filialeOrders.length;
      const articles = serverFStats?.productsCount !== undefined ? serverFStats.productsCount : filialeProds.length;
      const pending = serverFStats?.pendingOrdersCount !== undefined ? serverFStats.pendingOrdersCount : pendingOrders;
      const lowStock = serverFStats?.lowStockCount !== undefined ? serverFStats.lowStockCount : lowStockProds;
      const valStock = serverFStats?.catalogValue !== undefined ? serverFStats.catalogValue : catalogVal;
      const panierMoyen = orders > 0 ? Math.round((revenue / (validOrders.length || 1)) * 10) / 10 : 0;

      const isHidden = Boolean(visibility[key]?.is_hidden);

      return {
        key: key as BackofficeTab,
        name,
        subtitle,
        enumType,
        icon,
        revenue,
        orders,
        articles,
        pending,
        lowStock,
        valStock,
        panierMoyen,
        isHidden,
        badgeColor: isNutrition ? 'bg-lime-50 text-lime-700 border-lime-200' : 'bg-amber-50 text-amber-700 border-amber-200',
        iconBg: isNutrition ? 'bg-lime-50 text-lime-600' : 'bg-amber-50 text-amber-600',
        statColor: isNutrition ? 'text-lime-600' : 'text-amber-600'
      };
    });
  }, [stats, allProducts, allOrders, visibility]);

  // Hidden vs Active sites detection
  const hiddenFiliales = filialesComputed.filter(f => f.isHidden);
  const activeFiliales = filialesComputed.filter(f => !f.isHidden);
  const isAnyHidden = hiddenFiliales.length > 0;

  // Global Totals calculation respecting site visibility
  const dynamicTotals = useMemo(() => {
    // If filterMode === 'active_only', sum ONLY visible/active sites!
    // If filterMode === 'all_sites', sum all sites regardless of visibility
    const targetFiliales = filterMode === 'active_only' ? activeFiliales : filialesComputed;

    const totalRevenue = targetFiliales.reduce((sum, f) => sum + f.revenue, 0);
    const totalOrders = targetFiliales.reduce((sum, f) => sum + f.orders, 0);
    const totalProducts = targetFiliales.reduce((sum, f) => sum + f.articles, 0);
    const pendingOrders = targetFiliales.reduce((sum, f) => sum + f.pending, 0);
    const totalStockVal = targetFiliales.reduce((sum, f) => sum + f.valStock, 0);
    const averageBasket = totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 10) / 10 : 0;

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      pendingOrders,
      totalStockVal,
      averageBasket
    };
  }, [filialesComputed, activeFiliales, filterMode]);

  // Quick visibility toggle handler
  const handleToggleSubsiteVisibility = async (siteKey: string) => {
    setIsUpdatingVisibility(siteKey);
    try {
      const current = visibility[siteKey] || { siteId: siteKey, is_hidden: false, scope: 'frontoffice', mode: 'cacher_tout' };
      const updatedItem = {
        ...current,
        is_hidden: !current.is_hidden
      };
      const updatedMap = {
        ...visibility,
        [siteKey]: updatedItem
      };
      setVisibility(updatedMap);
      await saveSiteVisibility(updatedMap);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Erreur mise à jour visibilité:', err);
    } finally {
      setIsUpdatingVisibility(null);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) await onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full font-sans">
      
      {/* 1. Header with Title & Live Sync Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              TABLEAU DE BORD CONSOLIDÉ{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                GROUPE MULTISHOP
              </span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 uppercase tracking-wider">
              100% Temps Réel
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Surveillance des flux de ventes, commandes clients et catalogue consolidé de toutes les filiales
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Données base synchronisées</span>
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-60"
            title="Rafraîchir les statistiques en temps réel"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* 2. Visibility Filter Mode Banner (Requirement 2 & 3) */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Impact Visibilité & Consolidation
            </span>
            {isAnyHidden ? (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                {hiddenFiliales.length} sous-site masqué ({hiddenFiliales.map(h => h.name).join(', ')})
              </span>
            ) : (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                2 / 2 sous-sites en ligne (Consolidation intégrale)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 font-normal">
            {filterMode === 'active_only' && isAnyHidden
              ? `Les totaux ci-dessous excluent automatiquement les données du sous-site masqué (${hiddenFiliales.map(h => h.name).join(', ')}).`
              : 'Les totaux ci-dessous calculent la somme dynamique de toutes les filiales actives du réseau.'}
          </p>
        </div>

        {/* Toggle Mode Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setFilterMode('active_only')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterMode === 'active_only'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            Sites actifs ({activeFiliales.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('all_sites')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterMode === 'all_sites'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            Tout le groupe (2)
          </button>
        </div>
      </div>

      {/* 3. 4 Main Consolidated Metric Cards (100% Database Derived) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: CA CONSOLIDÉ GROUPE */}
        <div className="bg-gradient-to-br from-white via-white to-emerald-50/40 border border-emerald-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              <span>💰</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              {filterMode === 'active_only' && isAnyHidden ? 'Sites Actifs' : 'Consolidé'}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              CA CONSOLIDÉ GROUPE
            </p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {dynamicTotals.totalRevenue.toLocaleString('fr-FR')} DT
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Panier moyen :</span>
            <span className="font-bold text-slate-700">{dynamicTotals.averageBasket} DT</span>
          </div>
        </div>

        {/* Card 2: COMMANDES TOTALES */}
        <div className="bg-gradient-to-br from-white via-white to-blue-50/40 border border-blue-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              <span>📦</span>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
              {targetOrdersLabel(dynamicTotals.totalOrders)}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              COMMANDES TOTALES
            </p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {dynamicTotals.totalOrders}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>En attente :</span>
            <span className="font-bold text-amber-600">{dynamicTotals.pendingOrders} commande(s)</span>
          </div>
        </div>

        {/* Card 3: ARTICLES EN CATALOGUE */}
        <div className="bg-gradient-to-br from-white via-white to-purple-50/40 border border-purple-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-purple-500 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              <span>🏷️</span>
            </div>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
              Catalogue
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              ARTICLES EN CATALOGUE
            </p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {dynamicTotals.totalProducts}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Valeur stock :</span>
            <span className="font-bold text-slate-700">{dynamicTotals.totalStockVal.toLocaleString('fr-FR')} DT</span>
          </div>
        </div>

        {/* Card 4: COMMANDES EN COURS */}
        <div className="bg-gradient-to-br from-white via-white to-amber-50/40 border border-amber-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              <span>⏳</span>
            </div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
              À Traiter
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              COMMANDES EN COURS
            </p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {dynamicTotals.pendingOrders}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Priorité :</span>
            <span className="font-bold text-emerald-600">Expédition 24/48h</span>
          </div>
        </div>

      </div>

      {/* 4. Section: ÉTAT ET PERFORMANCE DES FILIALES (With Live Visibility Switchers) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <StoreIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-tight">
                ÉTAT ET PERFORMANCE DES FILIALES
              </h2>
              <p className="text-[11px] text-slate-500 font-normal">
                Données individuelles 100% synchronisées avec actions de visibilité instantanées
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Boutiques actives :</span>
            <span className="font-bold text-blue-600">{activeFiliales.length} / {filialesComputed.length}</span>
          </div>
        </div>

        {/* Filiales Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filialesComputed.map((filiale) => (
            <div
              key={filiale.key}
              className={`bg-white border rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                filiale.isHidden 
                  ? 'border-amber-200/90 bg-amber-50/20 ring-1 ring-amber-300/40' 
                  : 'border-slate-100 hover:border-blue-200'
              }`}
            >
              <div>
                {/* Header card with status and visibility button */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${filiale.iconBg} flex items-center justify-center text-2xl shadow-2xs`}>
                      {filiale.icon}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                        {filiale.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {filiale.subtitle}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border shrink-0 ${filiale.badgeColor}`}>
                    {filiale.enumType}
                  </span>
                </div>

                {/* Status indicator row */}
                <div className="flex items-center justify-between gap-2 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${filiale.isHidden ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                    <span className={`text-xs font-bold ${filiale.isHidden ? 'text-amber-800' : 'text-emerald-700'}`}>
                      {filiale.isHidden ? 'Masqué (Exclu des totaux)' : 'Actif en ligne (Inclus au CA)'}
                    </span>
                  </div>

                  {/* Quick toggle visibility button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSubsiteVisibility(filiale.key);
                    }}
                    disabled={isUpdatingVisibility === filiale.key}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-2xs ${
                      filiale.isHidden
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                    }`}
                    title={filiale.isHidden ? 'Réactiver ce sous-site pour inclure son CA' : 'Masquer ce sous-site et exclure son CA'}
                  >
                    {filiale.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{filiale.isHidden ? 'Réactiver' : 'Masquer'}</span>
                  </button>
                </div>

                {/* Detailed real-time KPI grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Chiffre d'Affaires</span>
                    <span className={`text-sm font-black mt-0.5 block ${filiale.statColor}`}>
                      {filiale.revenue.toLocaleString('fr-FR')} DT
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Commandes</span>
                    <span className="text-sm font-black text-slate-800 mt-0.5 block">
                      {filiale.orders}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Catalogue</span>
                    <span className="text-sm font-black text-slate-800 mt-0.5 block">
                      {filiale.articles} articles
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Panier Moyen</span>
                    <span className="text-sm font-black text-slate-800 mt-0.5 block">
                      {filiale.panierMoyen} DT
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">À Traiter</span>
                    <span className="text-sm font-black text-amber-600 mt-0.5 block">
                      {filiale.pending} en attente
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Stock Faible</span>
                    <span className={`text-sm font-black mt-0.5 block ${filiale.lowStock > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {filiale.lowStock} référence(s)
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onSelectFilialeTab(filiale.key)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                >
                  <span>Ouvrir l'administration dédiée</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <span className="text-[11px] text-slate-400">
                  Val. Stock : <strong>{filiale.valStock.toLocaleString('fr-FR')} DT</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Quick Overview Tables (Orders & Catalog) — 100% Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* Recent Orders Overview */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                  Dernières Commandes Centralisées
                </h3>
                <p className="text-[11px] text-slate-400">Flux d'achats en temps réel toutes filiales confondues</p>
              </div>
              {onNavigateToMenu && (
                <button
                  type="button"
                  onClick={() => onNavigateToMenu('orders')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
                >
                  Tout voir →
                </button>
              )}
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs min-w-[420px]">
                <thead>
                  <tr className="text-slate-400 font-semibold text-[10px] uppercase border-b border-slate-100">
                    <th className="pb-2">Réf</th>
                    <th className="pb-2">Filiale</th>
                    <th className="pb-2">Client</th>
                    <th className="pb-2">Montant</th>
                    <th className="pb-2 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {allOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                        Aucune commande enregistrée pour le moment.
                      </td>
                    </tr>
                  ) : (
                    allOrders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 font-mono font-bold text-slate-800">{order.id}</td>
                        <td className="py-2.5">
                          <span className="font-medium text-slate-700 text-[11px]">
                            {order.filialeKey === 'nutrition' && '🏋️‍♂️ Fitness Shop'}
                            {order.filialeKey === 'youpi' && '🧸 YoupiShop'}
                            {!['nutrition', 'youpi'].includes(order.filialeKey) && '🏋️‍♂️ Fitness Shop'}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-700 font-medium truncate max-w-[120px]">
                          {order.customerName}
                        </td>
                        <td className="py-2.5 font-black text-slate-900">
                          {Number(order.total || order.totalAmount || 0)} DT
                        </td>
                        <td className="py-2.5 text-right">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            order.status === 'Livrée' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            order.status === 'Expédiée' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            order.status === 'Annulée' ? 'bg-red-50 text-red-700 border border-red-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Catalog Overview */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                  Aperçu Produits Multi-Filiales
                </h3>
                <p className="text-[11px] text-slate-400">Stock temps réel et publication en boutique</p>
              </div>
              {onNavigateToMenu && (
                <button
                  type="button"
                  onClick={() => onNavigateToMenu('products')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
                >
                  Gérer catalogue →
                </button>
              )}
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs min-w-[420px]">
                <thead>
                  <tr className="text-slate-400 font-semibold text-[10px] uppercase border-b border-slate-100">
                    <th className="pb-2">Produit</th>
                    <th className="pb-2">Filiale</th>
                    <th className="pb-2">Prix</th>
                    <th className="pb-2 text-right">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {allProducts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                        Aucun produit enregistré.
                      </td>
                    </tr>
                  ) : (
                    allProducts.slice(0, 5).map((prod) => (
                      <tr key={`${prod.filialeKey}-${prod.id}`} className="hover:bg-slate-50/50">
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <img src={prod.imageUrl} alt="" className="w-7 h-7 rounded object-cover bg-slate-100 border border-slate-200" />
                            <span className="font-semibold text-slate-800 line-clamp-1 max-w-[150px]">{prod.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 font-medium text-slate-600 text-[11px]">{prod.filialeName || prod.filialeKey}</td>
                        <td className="py-2.5 font-bold text-slate-900">{prod.price} DT</td>
                        <td className="py-2.5 text-right">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            (prod.quantité_enstock ?? prod.quantity ?? 0) > 5 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {prod.quantité_enstock ?? prod.quantity ?? 0} en stock
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

function targetOrdersLabel(count: number) {
  if (count === 0) return '0 Commande';
  if (count === 1) return '1 Commande';
  return `${count} Commandes`;
}

import React, { useState, useEffect } from 'react';
import type { Advertisements, Product, Category, Pack, YoupiHomeConfig, LogoConfig } from '../../types';
import { useToast } from '../ToastContext';
import { api } from '../../utils/api';
import {
  Sparkles,
  Sliders,
  Layout,
  Eye,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Monitor,
  Tablet,
  Smartphone,
  Save,
  Gift,
  Tag,
  Palette,
  Truck,
  ShieldCheck,
  Headphones,
  RotateCcw,
  Baby
} from 'lucide-react';
import { Header } from '../Header';
import { HeroSection } from '../HeroSection';
import { ProductGridSection } from '../ProductGridSection';
import { Footer } from '../Footer';

interface ManageHomePageProps {
  initialAds?: Advertisements;
  onSave?: (newAds: Advertisements) => void;
  allProducts: Product[];
  allPacks?: Pack[];
  allCategories?: Category[];
}

export const ManageHomePage: React.FC<ManageHomePageProps> = ({
  initialAds,
  onSave,
  allProducts = [],
  allCategories = []
}) => {
  const { addToast } = useToast();

  const defaultLogoConfig: LogoConfig = {
    logoUrl: '',
    navbarHeight: 46,
    footerHeight: 52,
    textPrimary: 'YOUPI',
    textSecondary: 'SHOP',
    tagline: 'LE ROYAUME DES JOUETS'
  };

  const defaultYoupiHome: YoupiHomeConfig = {
    hero: {
      badge: "LE ROYAUME DES JOUETS & DU SOURIRE",
      title: "FAIRE BRILLER LES YEUX",
      titleHighlight: "DE VOS ENFANTS",
      description: "Des milliers de jouets d'éveil, jeux de société et briques de construction livrés rapidement chez vous partout en Tunisie.",
      buttonText: "Explorer le catalogue",
      buttonCategory: "all",
      bgImage: "/src/assets/images/hero_youpishop_toys_1791240036994.jpg",
      stickerLeft: "🧸 Éveil Montessori",
      stickerRight: "🎁 Emballage Cadeau Offert"
    },
    promoBanner: {
      tag: "OFFRE SPÉCIALE ENFANCE",
      title: "JUSQU'À",
      discountHighlight: "-25%",
      description: "SUR LES COFFRETS DE CONSTRUCTION & JEUX EN BOIS NATUREL",
      buttonText: "Voir les réductions",
      categoryTarget: "Construction & Lego",
      bgImage: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=1200"
    },
    bestsellersTitle: "Nos Bestsellers Coups de Cœur",
    bestsellersKicker: "LES JOUETS LES PLUS DEMANDÉS",
    ageCategoriesTitle: "Trouver le Jouet Idéal selon l'Âge",
    ageCategoriesKicker: "PAR TRANCHE D'ÂGE",
    trustBadges: [
      { id: 1, title: "Livraison 24/48h", subtitle: "Partout en Tunisie", icon: "truck" },
      { id: 2, title: "Normes CE & EN-71", subtitle: "Sécurité 100% garantie", icon: "shield" },
      { id: 3, title: "Emballage Cadeau", subtitle: "Totalement offert", icon: "gift" },
      { id: 4, title: "Conseillers Jouets", subtitle: "À votre écoute 6j/7", icon: "support" }
    ]
  };

  const [adsConfig, setAdsConfig] = useState<Advertisements>(() => ({
    ...initialAds,
    logoConfig: { ...defaultLogoConfig, ...(initialAds?.logoConfig || {}) },
    youpiHome: {
      ...defaultYoupiHome,
      ...(initialAds?.youpiHome || {}),
      hero: { ...defaultYoupiHome.hero, ...(initialAds?.youpiHome?.hero || {}) },
      promoBanner: { ...defaultYoupiHome.promoBanner, ...(initialAds?.youpiHome?.promoBanner || {}) },
      trustBadges: initialAds?.youpiHome?.trustBadges || defaultYoupiHome.trustBadges
    }
  }));

  const [activeTab, setActiveTab] = useState<'hero' | 'promo' | 'bestsellers' | 'badges' | 'logo'>('hero');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Sync if initialAds updates from server
  useEffect(() => {
    if (initialAds && !isDirty) {
      setAdsConfig(prev => ({
        ...prev,
        ...initialAds,
        logoConfig: { ...defaultLogoConfig, ...(initialAds.logoConfig || {}) },
        youpiHome: {
          ...defaultYoupiHome,
          ...(initialAds.youpiHome || {}),
          hero: { ...defaultYoupiHome.hero, ...(initialAds.youpiHome?.hero || {}) },
          promoBanner: { ...defaultYoupiHome.promoBanner, ...(initialAds.youpiHome?.promoBanner || {}) }
        }
      }));
    }
  }, [initialAds]);

  const updateHomeHero = (field: string, value: any) => {
    setAdsConfig(prev => ({
      ...prev,
      youpiHome: {
        ...prev.youpiHome,
        hero: {
          ...prev.youpiHome.hero,
          [field]: value
        }
      }
    }));
    setIsDirty(true);
  };

  const updateHomePromo = (field: string, value: any) => {
    setAdsConfig(prev => ({
      ...prev,
      youpiHome: {
        ...prev.youpiHome,
        promoBanner: {
          ...prev.youpiHome.promoBanner,
          [field]: value
        }
      }
    }));
    setIsDirty(true);
  };

  const updateHomeGeneral = (field: string, value: any) => {
    setAdsConfig(prev => ({
      ...prev,
      youpiHome: {
        ...prev.youpiHome,
        [field]: value
      }
    }));
    setIsDirty(true);
  };

  const updateTrustBadge = (index: number, field: string, value: string) => {
    const updated = [...(adsConfig.youpiHome?.trustBadges || defaultYoupiHome.trustBadges)];
    updated[index] = { ...updated[index], [field]: value };
    setAdsConfig(prev => ({
      ...prev,
      youpiHome: {
        ...prev.youpiHome,
        trustBadges: updated
      }
    }));
    setIsDirty(true);
  };

  const updateLogoConfig = (field: string, value: any) => {
    setAdsConfig(prev => ({
      ...prev,
      logoConfig: {
        ...prev.logoConfig,
        [field]: value
      }
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateAdvertisements(adsConfig);
      if (onSave) onSave(adsConfig);
      setIsDirty(false);
      addToast('Mise en page et publicités YoupiShop enregistrées avec succès !', 'success');
    } catch (e) {
      if (onSave) onSave(adsConfig);
      setIsDirty(false);
      addToast('Configuration sauvegardée localement.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  const youpiHome = adsConfig.youpiHome || defaultYoupiHome;

  return (
    <div className={`flex flex-col bg-slate-100 dark:bg-slate-950 font-sans ${isFullscreen ? 'fixed inset-0 z-50 overflow-hidden' : 'h-[calc(100vh-60px)] min-h-[750px]'}`}>
      
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 shadow-xs z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            🎨
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <span>Éditeur Visuel Accueil & Ads</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                YoupiShop
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">
              Contrôlez les bannières, le hero, les badges et visualisez en direct le sous-site
            </p>
          </div>
        </div>

        {/* Center: Viewport Switcher */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setViewportMode('desktop')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewportMode === 'desktop'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Bureau</span>
          </button>
          <button
            type="button"
            onClick={() => setViewportMode('tablet')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewportMode === 'tablet'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablette</span>
          </button>
          <button
            type="button"
            onClick={() => setViewportMode('mobile')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewportMode === 'mobile'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-white font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer ${
              isDirty
                ? 'bg-amber-500 hover:bg-amber-600 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Enregistrement...' : isDirty ? 'Sauvegarder *' : 'Enregistré'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Left Editor Controls + Right Live Frontoffice Preview */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Control Panel */}
        <div className="w-80 sm:w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden">
          
          {/* Tabs */}
          <div className="flex overflow-x-auto p-2 border-b border-slate-100 dark:border-slate-800 gap-1 bg-slate-50/50 dark:bg-slate-900/50">
            {[
              { id: 'hero', label: 'Hero Banner', icon: '🚀' },
              { id: 'promo', label: 'Bannière Promo', icon: '🏷️' },
              { id: 'bestsellers', label: 'Sections', icon: '🧸' },
              { id: 'badges', label: 'Réassurance', icon: '🛡️' },
              { id: 'logo', label: 'Identité', icon: '🎨' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Form Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar text-xs">
            
            {/* 1. HERO BANNER TAB */}
            {activeTab === 'hero' && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl">
                  <p className="font-bold text-amber-900 dark:text-amber-300">
                    Bannière Principale YoupiShop
                  </p>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-400">
                    Le premier composant visuel vu par les parents et enfants
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Badge Supérieur
                  </label>
                  <input
                    type="text"
                    value={youpiHome.hero?.badge || ''}
                    onChange={(e) => updateHomeHero('badge', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Titre Principal (Ligne 1)
                  </label>
                  <input
                    type="text"
                    value={youpiHome.hero?.title || ''}
                    onChange={(e) => updateHomeHero('title', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Mot / Phrase Mis en Valeur (Ligne 2)
                  </label>
                  <input
                    type="text"
                    value={youpiHome.hero?.titleHighlight || ''}
                    onChange={(e) => updateHomeHero('titleHighlight', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-amber-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Description & Promesse
                  </label>
                  <textarea
                    rows={3}
                    value={youpiHome.hero?.description || ''}
                    onChange={(e) => updateHomeHero('description', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Bouton CTA
                    </label>
                    <input
                      type="text"
                      value={youpiHome.hero?.buttonText || ''}
                      onChange={(e) => updateHomeHero('buttonText', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Catégorie Cible
                    </label>
                    <select
                      value={youpiHome.hero?.buttonCategory || 'all'}
                      onChange={(e) => updateHomeHero('buttonCategory', e.target.value)}
                      className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                    >
                      <option value="all">Tout le catalogue</option>
                      {allCategories.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Image d'Arrière-Plan Hero (URL)
                  </label>
                  <input
                    type="text"
                    value={youpiHome.hero?.bgImage || ''}
                    onChange={(e) => updateHomeHero('bgImage', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Sticker Flottant Gauche
                    </label>
                    <input
                      type="text"
                      value={youpiHome.hero?.stickerLeft || ''}
                      onChange={(e) => updateHomeHero('stickerLeft', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Sticker Flottant Droite
                    </label>
                    <input
                      type="text"
                      value={youpiHome.hero?.stickerRight || ''}
                      onChange={(e) => updateHomeHero('stickerRight', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. PROMO BANNER TAB */}
            {activeTab === 'promo' && (
              <div className="space-y-4">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl">
                  <p className="font-bold text-rose-900 dark:text-rose-300">
                    Bannière Promotionnelle & Destockage
                  </p>
                  <p className="text-[11px] text-rose-700/80 dark:text-rose-400">
                    Mettez en avant une promotion saisonnière ou une catégorie phare
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Tag Promotionnel
                  </label>
                  <input
                    type="text"
                    value={youpiHome.promoBanner?.tag || ''}
                    onChange={(e) => updateHomePromo('tag', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Titre
                    </label>
                    <input
                      type="text"
                      value={youpiHome.promoBanner?.title || ''}
                      onChange={(e) => updateHomePromo('title', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Remise / Pourcentage
                    </label>
                    <input
                      type="text"
                      value={youpiHome.promoBanner?.discountHighlight || ''}
                      onChange={(e) => updateHomePromo('discountHighlight', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-rose-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Texte Descriptif
                  </label>
                  <textarea
                    rows={2}
                    value={youpiHome.promoBanner?.description || ''}
                    onChange={(e) => updateHomePromo('description', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Image Bannière (URL)
                  </label>
                  <input
                    type="text"
                    value={youpiHome.promoBanner?.bgImage || ''}
                    onChange={(e) => updateHomePromo('bgImage', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>
            )}

            {/* 3. SECTIONS HEADERS TAB */}
            {activeTab === 'bestsellers' && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl">
                  <p className="font-bold text-blue-900 dark:text-blue-300">
                    Titres & Sous-titres des Sections Accueil
                  </p>
                  <p className="text-[11px] text-blue-700/80 dark:text-blue-400">
                    Personnalisez le libellé des blocs jouets vedettes
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Kicker Bestsellers
                  </label>
                  <input
                    type="text"
                    value={youpiHome.bestsellersKicker || ''}
                    onChange={(e) => updateHomeGeneral('bestsellersKicker', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold uppercase text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Titre Bestsellers
                  </label>
                  <input
                    type="text"
                    value={youpiHome.bestsellersTitle || ''}
                    onChange={(e) => updateHomeGeneral('bestsellersTitle', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-sm"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Kicker Âges
                  </label>
                  <input
                    type="text"
                    value={youpiHome.ageCategoriesKicker || ''}
                    onChange={(e) => updateHomeGeneral('ageCategoriesKicker', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold uppercase text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Titre Âges
                  </label>
                  <input
                    type="text"
                    value={youpiHome.ageCategoriesTitle || ''}
                    onChange={(e) => updateHomeGeneral('ageCategoriesTitle', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-sm"
                  />
                </div>
              </div>
            )}

            {/* 4. TRUST BADGES TAB */}
            {activeTab === 'badges' && (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-2xl">
                  <p className="font-bold text-emerald-900 dark:text-emerald-300">
                    4 Badges de Réassurance YoupiShop
                  </p>
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400">
                    Livraison, Normes CE, Emballage cadeau, Support
                  </p>
                </div>

                {(youpiHome.trustBadges || []).map((badge, idx) => (
                  <div key={badge.id || idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="text-[10px] font-black uppercase text-amber-600 block">
                      Badge #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={badge.title}
                      onChange={(e) => updateTrustBadge(idx, 'title', e.target.value)}
                      placeholder="Titre (ex: Livraison 24/48h)"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                    />
                    <input
                      type="text"
                      value={badge.subtitle}
                      onChange={(e) => updateTrustBadge(idx, 'subtitle', e.target.value)}
                      placeholder="Sous-titre (ex: Partout en Tunisie)"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 5. LOGO & BRANDING TAB */}
            {activeTab === 'logo' && (
              <div className="space-y-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 rounded-2xl">
                  <p className="font-bold text-purple-900 dark:text-purple-300">
                    Identité & Logo YoupiShop
                  </p>
                  <p className="text-[11px] text-purple-700/80 dark:text-purple-400">
                    Hauteur du logo, typographie et visuel
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    URL du Logo personnalisé
                  </label>
                  <input
                    type="text"
                    value={adsConfig.logoConfig?.logoUrl || ''}
                    onChange={(e) => updateLogoConfig('logoUrl', e.target.value)}
                    placeholder="https://.../logo.png"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Hauteur Navbar (px)
                    </label>
                    <input
                      type="number"
                      value={adsConfig.logoConfig?.navbarHeight || 46}
                      onChange={(e) => updateLogoConfig('navbarHeight', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Hauteur Footer (px)
                    </label>
                    <input
                      type="number"
                      value={adsConfig.logoConfig?.footerHeight || 52}
                      onChange={(e) => updateLogoConfig('footerHeight', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Quick status bar */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">
              {isDirty ? '● Modifications non enregistrées' : '✓ Synchronisé avec le backend'}
            </span>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="text-amber-600 font-bold hover:underline"
            >
              Enregistrer
            </button>
          </div>
        </div>

        {/* Right Live Sub-site Frontoffice Preview (Exact Frontoffice Rendered Live) */}
        <div className="flex-1 bg-slate-200 dark:bg-slate-950 flex flex-col items-center justify-start p-4 sm:p-6 overflow-y-auto custom-scrollbar">
          
          <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-500 font-medium max-w-5xl">
            <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <Eye className="w-4 h-4 text-emerald-500" />
              <span>Aperçu interactif direct du sous-site YoupiShop</span>
            </span>
            <span className="text-[11px] bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-300 dark:border-slate-700 shadow-2xs">
              Mode: {viewportMode.toUpperCase()}
            </span>
          </div>

          {/* Device Frame */}
          <div
            className={`transition-all duration-300 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-300 dark:border-slate-800 flex flex-col ${
              viewportMode === 'desktop'
                ? 'w-full max-w-5xl min-h-[900px]'
                : viewportMode === 'tablet'
                ? 'w-[768px] min-h-[800px]'
                : 'w-[375px] min-h-[700px]'
            }`}
          >
            {/* Mock browser bar */}
            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              </div>
              <div className="flex-1 max-w-md mx-auto bg-white dark:bg-slate-900 rounded-md py-0.5 px-3 text-[10px] font-mono text-slate-400 text-center truncate">
                https://multishop.tn/#/store/youpi
              </div>
            </div>

            {/* Rendered Live Front-Office Preview */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 pointer-events-auto">
              {/* Header */}
              <Header
                onNavigate={() => {}}
                currentView="home"
                searchQuery=""
                onSearchChange={() => {}}
                onSelectCategory={() => {}}
                currentUser={null}
              />

              {/* Live Hero Section reflecting current state */}
              <HeroSection
                onExplore={() => {}}
                onSelectCategory={() => {}}
                customHero={youpiHome.hero}
                customBadges={youpiHome.trustBadges}
              />

              {/* Live Catalog / Bestsellers */}
              <div className="p-4 sm:p-6">
                <div className="text-center mb-6">
                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-500 block mb-1">
                    {youpiHome.bestsellersKicker}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {youpiHome.bestsellersTitle}
                  </h2>
                </div>

                <ProductGridSection
                  products={allProducts.slice(0, 8)}
                  selectedCategory="all"
                  onSelectCategory={() => {}}
                  onSelectProduct={() => {}}
                  searchQuery=""
                />
              </div>

              {/* Promo Banner Preview */}
              {youpiHome.promoBanner && (
                <div className="mx-6 my-8 p-8 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl relative overflow-hidden">
                  <div className="relative z-10 max-w-lg">
                    <span className="px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs uppercase tracking-wider">
                      {youpiHome.promoBanner.tag}
                    </span>
                    <h3 className="text-3xl font-black mt-3 leading-tight">
                      {youpiHome.promoBanner.title}{' '}
                      <span className="text-amber-200 underline">
                        {youpiHome.promoBanner.discountHighlight}
                      </span>
                    </h3>
                    <p className="text-white/90 text-sm mt-2 font-medium">
                      {youpiHome.promoBanner.description}
                    </p>
                    <button className="mt-5 px-6 py-2.5 rounded-2xl bg-white text-slate-900 font-black text-xs uppercase tracking-wider shadow-md hover:bg-slate-50 transition-colors">
                      {youpiHome.promoBanner.buttonText}
                    </button>
                  </div>
                </div>
              )}

              {/* Footer */}
              <Footer onNavigate={() => {}} />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Advertisements, Product, Category, Pack, LogoConfig, DariHomeConfig } from '../../types';
import { useToast } from '../ToastContext';
import { api } from '../../utils/api';
import { Logo } from '../Logo';
import { Header } from '../Header';
import { HeroSection } from '../HeroSection';
import { ProductCard } from '../ProductCard';
import { Footer } from '../Footer';
import {
  Sparkles,
  Sliders,
  Layout,
  ArrowRight,
  Eye,
  CheckCircle2,
  RotateCcw,
  Maximize2,
  Minimize2,
  Monitor,
  Tablet,
  Smartphone,
  Save,
  Home,
  Tag,
  ShieldCheck,
  Truck,
  CreditCard,
  Image as ImageIcon
} from 'lucide-react';

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
    navbarHeight: 44,
    footerHeight: 50,
    textPrimary: 'Dari',
    textSecondary: 'Shop',
    tagline: 'Maison & Décoration'
  };

  const defaultDariHome: DariHomeConfig = {
    hero: {
      badge: 'Votre maison, notre inspiration',
      title: 'Aménagez votre intérieur',
      titleHighlight: 'avec style',
      description: 'Mobilier, décoration, rangements et plus encore...\npour une maison qui vous ressemble.',
      buttonText: 'Découvrir la collection',
      buttonCategory: 'all',
      bgImage: '/uploads/darishop_hero_livingroom.jpg',
      stickerLeft: '🏠 Mobilier Haut de Gamme',
      stickerRight: '✨ Livraison Soignée à Domicile'
    },
    promoBanner: {
      tag: 'OFFRE SPÉCIALE DÉCO',
      title: "JUSQU'À",
      discountHighlight: '-30%',
      description: 'SUR LES CANAPÉS, FAUTEUILS DESIGN ET LUMINAIRES D\'AMBIANCE',
      buttonText: 'Voir les offres déco',
      categoryTarget: 'Mobilier & Salons',
      bgImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200'
    },
    bestsellersTitle: 'Nos Incontournables Coups de Cœur',
    bestsellersKicker: 'LES PIÈCES LES PLUS PLÉBISCITÉES',
    trustBadges: [
      { id: 1, title: 'Produits de qualité', subtitle: 'Sélectionnés avec soin', icon: 'shield' },
      { id: 2, title: 'Service client', subtitle: 'À votre écoute 7j/7', icon: 'headphones' },
      { id: 3, title: 'Paiement à la livraison', subtitle: 'Plus de sécurité', icon: 'credit-card' },
      { id: 4, title: 'Une maison plus belle', subtitle: 'à petit prix', icon: 'sprout' }
    ]
  };

  const [adsConfig, setAdsConfig] = useState<Advertisements>(() => ({
    ...initialAds,
    logoConfig: { ...defaultLogoConfig, ...(initialAds?.logoConfig || {}) },
    dariHome: {
      ...defaultDariHome,
      ...(initialAds?.dariHome || {}),
      hero: { ...defaultDariHome.hero, ...(initialAds?.dariHome?.hero || {}) },
      promoBanner: { ...defaultDariHome.promoBanner, ...(initialAds?.dariHome?.promoBanner || {}) },
      trustBadges: initialAds?.dariHome?.trustBadges || defaultDariHome.trustBadges
    }
  }));

  const [activeTab, setActiveTab] = useState<'logo' | 'hero' | 'promo' | 'bestsellers' | 'badges'>('logo');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (initialAds && !isDirty) {
      setAdsConfig(prev => ({
        ...prev,
        ...initialAds,
        logoConfig: { ...defaultLogoConfig, ...(initialAds.logoConfig || {}) },
        dariHome: {
          ...defaultDariHome,
          ...(initialAds.dariHome || {}),
          hero: { ...defaultDariHome.hero, ...(initialAds.dariHome?.hero || {}) },
          promoBanner: { ...defaultDariHome.promoBanner, ...(initialAds.dariHome?.promoBanner || {}) }
        }
      }));
    }
  }, [initialAds]);

  const updateLogo = (field: string, val: any) => {
    setAdsConfig(prev => ({
      ...prev,
      logoConfig: {
        ...(prev.logoConfig || defaultLogoConfig),
        [field]: val
      }
    }));
    setIsDirty(true);
  };

  const updateHero = (field: string, val: any) => {
    setAdsConfig(prev => ({
      ...prev,
      dariHome: {
        ...(prev.dariHome || defaultDariHome),
        hero: {
          ...((prev.dariHome || defaultDariHome).hero),
          [field]: val
        }
      }
    }));
    setIsDirty(true);
  };

  const updatePromo = (field: string, val: any) => {
    setAdsConfig(prev => ({
      ...prev,
      dariHome: {
        ...(prev.dariHome || defaultDariHome),
        promoBanner: {
          ...((prev.dariHome || defaultDariHome).promoBanner),
          [field]: val
        }
      }
    }));
    setIsDirty(true);
  };

  const updateBestsellers = (field: string, val: any) => {
    setAdsConfig(prev => ({
      ...prev,
      dariHome: {
        ...(prev.dariHome || defaultDariHome),
        [field]: val
      }
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateAdvertisements(adsConfig);
      if (adsConfig.logoConfig) {
        localStorage.setItem('multishop_dari_logo', JSON.stringify(adsConfig.logoConfig));
      }
      if (onSave) onSave(adsConfig);
      window.dispatchEvent(new CustomEvent('dari-ads-updated', { detail: adsConfig }));
      setIsDirty(false);
      addToast('Modifications de DariShop enregistrées et synchronisées avec succès ! 🏠', 'success');
    } catch (e) {
      console.error(e);
      addToast('Erreur lors de l\'enregistrement sur le serveur.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const currentLogo = adsConfig.logoConfig || defaultLogoConfig;
  const currentHome = adsConfig.dariHome || defaultDariHome;

  const previewItems = useMemo(() => {
    if (allProducts && allProducts.length > 0) return allProducts.slice(0, 4);
    return [];
  }, [allProducts]);

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-[200] bg-slate-900 p-4 sm:p-6 overflow-y-auto' : ''}`}>
      
      {/* 1. TOP HEADER & VIEWPORT BAR */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏠</span>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight font-serif">
              CONTRÔLE TOTAL ACCUEIL & VITRINE : <span className="text-indigo-600">DARISHOP</span>
            </h2>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Live Responsive Editor
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Personnalisez le logo, la bannière Hero, l'offre promotionnelle et visualisez le rendu exact en différentes tailles d'écran.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Responsive Viewport Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewportMode('desktop')}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                viewportMode === 'desktop'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Affichage Écran Ordinateur (100%)"
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Bureau</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('tablet')}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                viewportMode === 'tablet'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Affichage Tablette (768px)"
            >
              <Tablet className="w-4 h-4" />
              <span className="hidden sm:inline">Tablette</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('mobile')}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                viewportMode === 'mobile'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Affichage Mobile (390px)"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(f => !f)}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title={isFullscreen ? 'Quitter le plein écran (Échap)' : 'Aperçu Plein Écran'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Enregistrement...' : 'Enregistrer Accueil'}</span>
          </button>
        </div>
      </div>

      {/* 2. EDITOR TABS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
          {[
            { id: 'logo', label: '1. Modification Logo', icon: Sliders },
            { id: 'hero', label: '2. Bannière Hero', icon: Layout },
            { id: 'promo', label: '3. Offre Promo Déco', icon: Tag },
            { id: 'bestsellers', label: '4. Titres Coups de Cœur', icon: Sparkles },
            { id: 'badges', label: '5. Réassurance & Badges', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Logo Modification (like in FitnessShop) */}
        {activeTab === 'logo' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fadeIn">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Texte Principal du Logo</label>
              <input
                type="text"
                value={currentLogo.textPrimary || ''}
                onChange={(e) => updateLogo('textPrimary', e.target.value)}
                placeholder="Ex: DARI"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Texte Secondaire / Badge</label>
              <input
                type="text"
                value={currentLogo.textSecondary || ''}
                onChange={(e) => updateLogo('textSecondary', e.target.value)}
                placeholder="Ex: SHOP"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Slogan / Tagline sous le logo</label>
              <input
                type="text"
                value={currentLogo.tagline || ''}
                onChange={(e) => updateLogo('tagline', e.target.value)}
                placeholder="Ex: MAISON & DÉCORATION D'INTÉRIEUR"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Hauteur Logo dans la Barre de Navigation ({currentLogo.navbarHeight || 44}px)
              </label>
              <input
                type="range"
                min="32"
                max="72"
                value={currentLogo.navbarHeight || 44}
                onChange={(e) => updateLogo('navbarHeight', Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Hauteur Logo dans le Pied de Page ({currentLogo.footerHeight || 50}px)
              </label>
              <input
                type="range"
                min="32"
                max="80"
                value={currentLogo.footerHeight || 50}
                onChange={(e) => updateLogo('footerHeight', Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Image Logo Personnalisée (URL)</label>
              <input
                type="text"
                value={currentLogo.logoUrl || ''}
                onChange={(e) => updateLogo('logoUrl', e.target.value)}
                placeholder="Laisser vide pour utiliser le logo emblème svg"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Hero Banner */}
        {activeTab === 'hero' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fadeIn">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Badge / Kicker Supérieur</label>
              <input
                type="text"
                value={currentHome.hero?.badge || ''}
                onChange={(e) => updateHero('badge', e.target.value)}
                placeholder="Ex: NOUVELLE COLLECTION MAISON 2026"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Titre Principal</label>
              <input
                type="text"
                value={currentHome.hero?.title || ''}
                onChange={(e) => updateHero('title', e.target.value)}
                placeholder="Ex: SUBLIMEZ VOTRE"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Surlignage Dégradé du Titre</label>
              <input
                type="text"
                value={currentHome.hero?.titleHighlight || ''}
                onChange={(e) => updateHero('titleHighlight', e.target.value)}
                placeholder="Ex: INTÉRIEUR"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description Hero</label>
              <textarea
                rows={2}
                value={currentHome.hero?.description || ''}
                onChange={(e) => updateHero('description', e.target.value)}
                placeholder="Description poétique et percutante..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Image d'Arrière-Plan Hero (URL)</label>
              <input
                type="text"
                value={currentHome.hero?.bgImage || ''}
                onChange={(e) => updateHero('bgImage', e.target.value)}
                placeholder="URL de l'image de fond..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Texte Bouton d'Action</label>
              <input
                type="text"
                value={currentHome.hero?.buttonText || ''}
                onChange={(e) => updateHero('buttonText', e.target.value)}
                placeholder="Ex: Explorer la collection"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Badge Flottant Gauche</label>
              <input
                type="text"
                value={currentHome.hero?.stickerLeft || ''}
                onChange={(e) => updateHero('stickerLeft', e.target.value)}
                placeholder="Ex: 🏠 Mobilier Haut de Gamme"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Badge Flottant Droite</label>
              <input
                type="text"
                value={currentHome.hero?.stickerRight || ''}
                onChange={(e) => updateHero('stickerRight', e.target.value)}
                placeholder="Ex: ✨ Livraison Soignée"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Promo Banner */}
        {activeTab === 'promo' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fadeIn">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tag Promo</label>
              <input
                type="text"
                value={currentHome.promoBanner?.tag || ''}
                onChange={(e) => updatePromo('tag', e.target.value)}
                placeholder="Ex: OFFRE SPÉCIALE DÉCO"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Titre</label>
              <input
                type="text"
                value={currentHome.promoBanner?.title || ''}
                onChange={(e) => updatePromo('title', e.target.value)}
                placeholder="Ex: JUSQU'À"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Remise en évidence</label>
              <input
                type="text"
                value={currentHome.promoBanner?.discountHighlight || ''}
                onChange={(e) => updatePromo('discountHighlight', e.target.value)}
                placeholder="Ex: -30%"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-amber-500"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description de la remise</label>
              <textarea
                rows={2}
                value={currentHome.promoBanner?.description || ''}
                onChange={(e) => updatePromo('description', e.target.value)}
                placeholder="Description des articles concernés..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Image Promo (URL)</label>
              <input
                type="text"
                value={currentHome.promoBanner?.bgImage || ''}
                onChange={(e) => updatePromo('bgImage', e.target.value)}
                placeholder="URL image bannière..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
              />
            </div>
          </div>
        )}

        {/* Tab 4: Bestsellers */}
        {activeTab === 'bestsellers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kicker Supérieur de la Section</label>
              <input
                type="text"
                value={currentHome.bestsellersKicker || ''}
                onChange={(e) => updateBestsellers('bestsellersKicker', e.target.value)}
                placeholder="Ex: LES PIÈCES LES PLUS PLÉBISCITÉES"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Titre Principal de la Section</label>
              <input
                type="text"
                value={currentHome.bestsellersTitle || ''}
                onChange={(e) => updateBestsellers('bestsellersTitle', e.target.value)}
                placeholder="Ex: Nos Incontournables Coups de Cœur"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>
          </div>
        )}

        {/* Tab 5: Badges */}
        {activeTab === 'badges' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
            {(currentHome.trustBadges || defaultDariHome.trustBadges).map((b, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">Badge #{idx + 1}</span>
                <input
                  type="text"
                  value={b.title}
                  onChange={(e) => {
                    const newBadges = [...(currentHome.trustBadges || defaultDariHome.trustBadges)];
                    newBadges[idx] = { ...newBadges[idx], title: e.target.value };
                    setAdsConfig(prev => ({
                      ...prev,
                      dariHome: {
                        ...(prev.dariHome || defaultDariHome),
                        trustBadges: newBadges
                      }
                    }));
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
                <input
                  type="text"
                  value={b.subtitle}
                  onChange={(e) => {
                    const newBadges = [...(currentHome.trustBadges || defaultDariHome.trustBadges)];
                    newBadges[idx] = { ...newBadges[idx], subtitle: e.target.value };
                    setAdsConfig(prev => ({
                      ...prev,
                      dariHome: {
                        ...(prev.dariHome || defaultDariHome),
                        trustBadges: newBadges
                      }
                    }));
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-500"
                />
              </div>
            ))}
          </div>
        )}

      </div>

      {/* 3. LIVE RESPONSIVE PREVIEW CONTAINER (EXACT SAME AS FRONTOFFICE) */}
      <div className="bg-slate-200 dark:bg-slate-950/80 p-4 sm:p-8 rounded-3xl border border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center">
        
        <div className="w-full flex items-center justify-between pb-3 text-xs text-slate-500 font-bold max-w-7xl">
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-indigo-600" />
            <span>Aperçu en Direct ({viewportMode === 'desktop' ? 'Plein Écran Bureau' : viewportMode === 'tablet' ? 'Format Tablette (768px)' : 'Format Smartphone (390px)'})</span>
          </span>
          <span className="text-[11px] font-semibold">Miroir 100% Fidèle au Front-Office</span>
        </div>

        {/* Scaled Viewport Frame */}
        <div
          className={`w-full transition-all duration-300 rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-slate-950 border-4 border-slate-300 dark:border-slate-800 ${
            viewportMode === 'mobile'
              ? 'max-w-[390px]'
              : viewportMode === 'tablet'
              ? 'max-w-[768px]'
              : 'w-full max-w-7xl'
          }`}
        >
          {/* Header */}
          <Header
            onNavigate={() => {}}
            currentView="home"
            searchQuery=""
            onSearchChange={() => {}}
            categories={allCategories}
            logoConfig={currentLogo}
          />

          {/* Hero Section */}
          <HeroSection
            onExplore={() => {}}
            customHero={currentHome.hero}
            customBadges={currentHome.trustBadges}
          />

          {/* Bestsellers Section Heading */}
          <div className="pt-8 text-center max-w-7xl mx-auto px-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#b87333] block mb-1">
              {currentHome.bestsellersKicker}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0f3e37] dark:text-white">
              {currentHome.bestsellersTitle}
            </h2>
          </div>

          {/* Bestsellers Product Grid Preview */}
          <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {previewItems.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                />
              ))}
            </div>
          </div>

          {/* Promo Banner Preview */}
          {currentHome.promoBanner && (
            <div className="py-8 bg-slate-50 dark:bg-slate-900/60 px-4 sm:px-8">
              <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-500/20">
                <div className="space-y-3 max-w-xl">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                    {currentHome.promoBanner.tag}
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-black leading-tight font-serif">
                    {currentHome.promoBanner.title}{' '}
                    <span className="text-amber-400 italic">
                      {currentHome.promoBanner.discountHighlight}
                    </span>
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm font-normal">
                    {currentHome.promoBanner.description}
                  </p>
                  <button
                    type="button"
                    className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-indigo-700 cursor-pointer"
                  >
                    {currentHome.promoBanner.buttonText}
                  </button>
                </div>
                {currentHome.promoBanner.bgImage && (
                  <div className="w-full md:w-80 h-48 rounded-2xl overflow-hidden shadow-md shrink-0">
                    <img
                      src={currentHome.promoBanner.bgImage}
                      alt="Promo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Preview */}
          <Footer logoConfig={currentLogo} />

        </div>

      </div>

    </div>
  );
};

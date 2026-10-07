import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Advertisements, Product, Category, Pack, LogoConfig, DariHomeConfig } from '../../types';
import { useToast } from '../ToastContext';
import { api } from '../../utils/api';
import { Logo } from '../Logo';
import { Header } from '../Header';
import { HeroSection } from '../HeroSection';
import { ProductCard } from '../ProductCard';
import { Footer } from '../Footer';
import { LogoBackgroundRemoverModal } from './LogoBackgroundRemoverModal';
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
  Image as ImageIcon,
  Upload,
  Wand2,
  MoveHorizontal,
  Loader2,
  GripVertical,
  Check
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
    tagline: 'Maison & Décoration',
    navbarOffset: 0,
    navbarPosition: 'left'
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

  // Drag-to-position Logo states
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const dragStartX = useRef(0);
  const dragStartOffset = useRef(0);

  // Logo upload & background remover states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [isBgRemoverOpen, setIsBgRemoverOpen] = useState(false);

  // Interactive Drag listener for navbar logo positioning
  const handleLogoDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if ('preventDefault' in e) e.preventDefault();
    e.stopPropagation();
    setIsDraggingLogo(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    dragStartX.current = clientX;
    dragStartOffset.current = adsConfig.logoConfig?.navbarOffset || 0;
  };

  useEffect(() => {
    if (!isDraggingLogo) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const delta = clientX - dragStartX.current;
      const newOffset = Math.max(0, Math.min(1000, Math.round(dragStartOffset.current + delta)));
      
      setAdsConfig(prev => ({
        ...prev,
        logoConfig: {
          ...(prev.logoConfig || defaultLogoConfig),
          navbarOffset: newOffset,
          navbarPosition: 'custom'
        }
      }));
      setIsDirty(true);
    };

    const handleEnd = () => {
      setIsDraggingLogo(false);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDraggingLogo]);

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

  // Handle Logo file upload from PC
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    setUploadError(null);
    setUploadSuccessMsg(null);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        setIsUploading(false);
        return;
      }

      try {
        const res = await api.uploadLogo(dataUrl, {
          navbarHeight: adsConfig.logoConfig?.navbarHeight || 44,
          footerHeight: adsConfig.logoConfig?.footerHeight || 50,
          navbarOffset: adsConfig.logoConfig?.navbarOffset || 0
        });

        if (res && res.url) {
          updateLogo('logoUrl', res.url);
          setUploadSuccessMsg(`Logo importé avec succès depuis votre PC et stocké sur le serveur (${res.url})`);
          addToast("Logo importé avec succès depuis votre PC !", "success");
        } else {
          updateLogo('logoUrl', dataUrl);
          setUploadSuccessMsg("Logo appliqué avec succès !");
          addToast("Logo appliqué avec succès !", "success");
        }
      } catch (err: any) {
        console.error("Erreur téléversement backend:", err);
        updateLogo('logoUrl', dataUrl);
        setUploadSuccessMsg("Image appliquée localement. Cliquez sur Enregistrer pour synchroniser.");
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setUploadError("Impossible de lire le fichier sélectionné.");
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleResetLogo = async () => {
    setIsUploading(true);
    try {
      await api.resetLogo();
    } catch {
      // non-fatal
    } finally {
      setIsUploading(false);
      updateLogo('logoUrl', '');
      setUploadSuccessMsg("Logo réinitialisé avec succès vers l'emblème vectoriel officiel.");
      setUploadError(null);
      addToast("Logo réinitialisé vers l'emblème vectoriel officiel !", "info");
    }
  };

  const handleSaveTransparentLogo = async (transparentDataUrl: string) => {
    setIsUploading(true);
    try {
      const res = await api.uploadLogo(transparentDataUrl, {
        navbarHeight: adsConfig.logoConfig?.navbarHeight || 44,
        footerHeight: adsConfig.logoConfig?.footerHeight || 50,
        navbarOffset: adsConfig.logoConfig?.navbarOffset || 0
      });
      if (res && res.url) {
        updateLogo('logoUrl', res.url);
        setUploadSuccessMsg("Arrière-plan supprimé avec succès ! Logo transparent sauvegardé.");
        addToast("Logo transparent sauvegardé sur le serveur !", "success");
      } else {
        updateLogo('logoUrl', transparentDataUrl);
        setUploadSuccessMsg("Arrière-plan supprimé et logo transparent appliqué !");
      }
    } catch (err) {
      console.error("Erreur sauvegarde logo transparent:", err);
      updateLogo('logoUrl', transparentDataUrl);
      setUploadSuccessMsg("Arrière-plan supprimé en local. Pensez à enregistrer.");
    } finally {
      setIsUploading(false);
    }
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
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              CONTRÔLE TOTAL ACCUEIL & LOGO : <span className="text-[#0f3e37] dark:text-emerald-400">DARISHOP</span>
            </h2>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Responsive Editor
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Importez votre logo depuis le PC, ajustez sa position libre dans la barre de navigation et configurez l'accueil en temps réel.
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
                  ? 'bg-white dark:bg-slate-900 text-[#0f3e37] dark:text-emerald-400 shadow-xs'
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
                  ? 'bg-white dark:bg-slate-900 text-[#0f3e37] dark:text-emerald-400 shadow-xs'
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
                  ? 'bg-white dark:bg-slate-900 text-[#0f3e37] dark:text-emerald-400 shadow-xs'
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
            className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
              isDirty
                ? 'bg-[#0f3e37] hover:bg-[#0b2f29] text-white shadow-[#0f3e37]/30 animate-pulse'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Enregistrement...' : isDirty ? 'Enregistrer & Déployer' : 'Accueil Enregistré'}</span>
          </button>
        </div>
      </div>

      {/* 2. EDITOR TABS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
          {[
            { id: 'logo', label: '1. Logo, Import PC & Position', icon: Sliders },
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
                    ? 'bg-[#0f3e37] text-white shadow-md shadow-[#0f3e37]/20'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Logo Modification (Matching exact fitnessShop process) */}
        {activeTab === 'logo' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Top row: Logo Live Preview Box */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Aperçu en Direct du Logo
              </label>
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-3 text-center">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5 w-full flex items-center justify-center min-h-[90px]">
                  <Logo logoConfig={currentLogo} variant="navbar" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                    {currentLogo.logoUrl ? "Image personnalisée chargée" : "Logo vectoriel officiel DariShop"}
                  </span>
                  {currentLogo.logoUrl && (
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="text-[10px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer underline"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Réinitialiser vers le logo par défaut</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Step A: Upload File from PC (Matching FitnessShop) */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#0f3e37] dark:text-emerald-400" />
                    <span>Importer l'image de logo via le PC</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Sélectionnez un fichier image sur votre ordinateur. Il sera instantanément stocké dans le backend sur <code>/uploads/</code>.
                  </p>
                </div>
                {currentLogo.logoUrl && (
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold">
                    Fichier actif
                  </span>
                )}
              </div>

              {/* Upload Dropzone */}
              <div className={`relative border-2 border-dashed ${isUploading ? 'border-[#0f3e37] bg-emerald-500/5' : 'border-slate-300 dark:border-slate-700 hover:border-[#0f3e37] bg-white dark:bg-slate-900'} rounded-2xl p-5 text-center cursor-pointer transition-all`}>
                <input 
                  type="file" 
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleLogoFileUpload}
                  disabled={isUploading}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10 disabled:cursor-not-allowed" 
                />
                <div className="flex flex-col items-center gap-1.5 text-slate-600 dark:text-slate-400 pointer-events-none">
                  {isUploading ? (
                    <>
                      <Loader2 className="w-7 h-7 text-[#0f3e37] dark:text-emerald-400 animate-spin" />
                      <span className="text-xs font-black text-[#0f3e37] dark:text-emerald-400">
                        Téléversement et stockage dans le backend en cours...
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-[#0f3e37] dark:text-emerald-400 mb-1">
                        <Upload className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">
                        Cliquez pour sélectionner un fichier image sur votre PC
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Formats acceptés : PNG, SVG, WEBP, JPG (Max 5 Mo)
                      </span>
                    </>
                  )}
                </div>
              </div>

              {uploadSuccessMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{uploadSuccessMsg}</span>
                </div>
              )}

              {uploadError && (
                <p className="text-xs text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
                  {uploadError}
                </p>
              )}

              {/* Action Background Remover Tool (Matching FitnessShop) */}
              <div className="pt-1 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsBgRemoverOpen(true)}
                  disabled={!currentLogo.logoUrl}
                  className="w-full sm:w-auto py-2.5 px-4 bg-gradient-to-r from-emerald-500/15 to-emerald-500/25 hover:from-emerald-500/25 hover:to-emerald-500/40 text-slate-900 dark:text-white border-2 border-[#0f3e37] rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer group disabled:opacity-40"
                  title="Supprimer les fonds blancs ou colorés pour rendre le logo transparent"
                >
                  <Wand2 className="w-4 h-4 text-emerald-700 dark:text-emerald-300 group-hover:rotate-12 transition-transform" />
                  <span>🪄 Enlever l'Arrière-Plan (Rendre Transparent)</span>
                </button>

                <span className="text-[11px] text-slate-500">
                  Détecte automatiquement les fonds blancs/noirs et élimine les bordures pour un rendu propre dans la barre.
                </span>
              </div>
            </div>

            {/* Step B: Glisser Librement dans la Navbar (Matching FitnessShop) */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                    <MoveHorizontal className="w-4 h-4 text-[#0f3e37] dark:text-emerald-400" />
                    <span>Glisser librement le logo dans la Navbar</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Déplacez librement le logo sur l'axe horizontal. La position est enregistrée et appliquée au front-office.
                  </p>
                </div>
                <span className="px-3 py-1 bg-[#0f3e37] text-white font-mono font-black text-xs rounded-xl shadow-xs">
                  {currentLogo.navbarOffset || 0} px
                </span>
              </div>

              {/* Quick Presets Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => updateLogo('navbarOffset', 0)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    (currentLogo.navbarOffset || 0) === 0
                      ? 'bg-[#0f3e37] text-white border-[#0f3e37] shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  ◀ Gauche (0px)
                </button>
                <button
                  type="button"
                  onClick={() => updateLogo('navbarOffset', 350)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    (currentLogo.navbarOffset || 0) === 350
                      ? 'bg-[#0f3e37] text-white border-[#0f3e37] shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  ⏺ Centre (+350px)
                </button>
                <button
                  type="button"
                  onClick={() => updateLogo('navbarOffset', 700)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    (currentLogo.navbarOffset || 0) === 700
                      ? 'bg-[#0f3e37] text-white border-[#0f3e37] shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  ▶ Droite (+700px)
                </button>
              </div>

              {/* Slider for precision */}
              <div className="space-y-1">
                <input 
                  type="range"
                  min="0"
                  max="1000"
                  value={currentLogo.navbarOffset || 0}
                  onChange={(e) => updateLogo('navbarOffset', Number(e.target.value))}
                  className="w-full accent-[#0f3e37] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0 px (Aligné à gauche)</span>
                  <span>500 px (Milieu)</span>
                  <span>1000 px (Extrémité droite)</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200 font-medium">
                <GripVertical className="w-4 h-4 text-[#0f3e37] dark:text-emerald-400 shrink-0" />
                <span>
                  💡 <strong>Glissement interactif à la souris :</strong> Vous pouvez aussi cliquer et glisser directement le logo avec la souris dans l'aperçu de la barre de navigation ci-dessous !
                </span>
              </div>
            </div>

            {/* Step C: Height dimensions and Typography */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>Hauteur Logo Navbar</span>
                  <span className="font-mono text-[#0f3e37] dark:text-emerald-400 font-black">{currentLogo.navbarHeight || 44} px</span>
                </label>
                <input
                  type="range"
                  min="24"
                  max="100"
                  value={currentLogo.navbarHeight || 44}
                  onChange={(e) => updateLogo('navbarHeight', Number(e.target.value))}
                  className="w-full accent-[#0f3e37] cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>Hauteur Logo Footer</span>
                  <span className="font-mono text-[#0f3e37] dark:text-emerald-400 font-black">{currentLogo.footerHeight || 50} px</span>
                </label>
                <input
                  type="range"
                  min="24"
                  max="120"
                  value={currentLogo.footerHeight || 50}
                  onChange={(e) => updateLogo('footerHeight', Number(e.target.value))}
                  className="w-full accent-[#0f3e37] cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">URL directe d'image (facultatif)</label>
                <input
                  type="text"
                  value={currentLogo.logoUrl || ''}
                  onChange={(e) => updateLogo('logoUrl', e.target.value)}
                  placeholder="Ex: /uploads/logo_dari.png"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-[#0f3e37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Texte Principal du Logo</label>
                <input
                  type="text"
                  value={currentLogo.textPrimary || ''}
                  onChange={(e) => updateLogo('textPrimary', e.target.value)}
                  placeholder="Ex: Dari"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-[#0f3e37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Texte Secondaire / Badge</label>
                <input
                  type="text"
                  value={currentLogo.textSecondary || ''}
                  onChange={(e) => updateLogo('textSecondary', e.target.value)}
                  placeholder="Ex: Shop"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-[#0f3e37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Slogan / Tagline sous le logo</label>
                <input
                  type="text"
                  value={currentLogo.tagline || ''}
                  onChange={(e) => updateLogo('tagline', e.target.value)}
                  placeholder="Ex: Maison & Décoration"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-[#0f3e37]"
                />
              </div>

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
                placeholder="Ex: Votre maison, notre inspiration"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Titre Principal</label>
              <input
                type="text"
                value={currentHome.hero?.title || ''}
                onChange={(e) => updateHero('title', e.target.value)}
                placeholder="Ex: Aménagez votre intérieur"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Surlignage Dégradé du Titre</label>
              <input
                type="text"
                value={currentHome.hero?.titleHighlight || ''}
                onChange={(e) => updateHero('titleHighlight', e.target.value)}
                placeholder="Ex: avec style"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-[#b87333]"
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
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Texte du Bouton</label>
              <input
                type="text"
                value={currentHome.hero?.buttonText || ''}
                onChange={(e) => updateHero('buttonText', e.target.value)}
                placeholder="Ex: Découvrir la collection"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>

            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Image Hero Fond (URL)</label>
              <input
                type="text"
                value={currentHome.hero?.bgImage || ''}
                onChange={(e) => updateHero('bgImage', e.target.value)}
                placeholder="URL image de fond..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Promo */}
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
                <span className="text-[10px] font-black uppercase text-[#0f3e37] dark:text-emerald-400">Badge #{idx + 1}</span>
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

      {/* 3. LIVE RESPONSIVE PREVIEW CONTAINER (WITH INTERACTIVE DRAGGABLE LOGO) */}
      <div className="bg-slate-200 dark:bg-slate-950/80 p-4 sm:p-8 rounded-3xl border border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center">
        
        <div className="w-full flex items-center justify-between pb-3 text-xs text-slate-500 font-bold max-w-7xl">
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-[#0f3e37] dark:text-emerald-400" />
            <span>Aperçu en Direct ({viewportMode === 'desktop' ? 'Plein Écran Bureau' : viewportMode === 'tablet' ? 'Format Tablette (768px)' : 'Format Smartphone (390px)'})</span>
          </span>
          <span className="text-[11px] font-semibold">Miroir 100% Fidèle • Logo Déplaçable Librement</span>
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
          {/* Draggable Helper Top Strip */}
          <div className="px-4 py-2 bg-[#0f3e37] text-white text-xs font-bold flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <MoveHorizontal className="w-4 h-4 text-emerald-300 animate-pulse" />
              <span>Glissez directement le logo dans la barre pour fixer sa position ({currentLogo.navbarOffset || 0}px)</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-emerald-200">
              Offset: {currentLogo.navbarOffset || 0}px
            </span>
          </div>

          {/* Interactive Header with Draggable Logo */}
          <Header
            onNavigate={() => {}}
            currentView="home"
            searchQuery=""
            onSearchChange={() => {}}
            categories={allCategories}
            logoConfig={currentLogo}
            isDraggableLogo={true}
            onLogoDragStart={handleLogoDragStart}
            isDraggingLogo={isDraggingLogo}
            onLogoClick={() => setActiveTab('logo')}
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
              {previewItems.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelectProduct={() => {}}
                  onViewFullDetail={() => {}}
                />
              ))}
            </div>
          </div>

          {/* Footer Preview */}
          <Footer logoConfig={currentLogo} />
        </div>

      </div>

      {/* 4. BACKGROUND REMOVER MODAL */}
      <LogoBackgroundRemoverModal
        isOpen={isBgRemoverOpen}
        onClose={() => setIsBgRemoverOpen(false)}
        imageUrl={currentLogo.logoUrl || ''}
        onSaveTransparentLogo={handleSaveTransparentLogo}
      />

    </div>
  );
};

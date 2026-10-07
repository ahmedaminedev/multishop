import React, { useState } from 'react';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Headphones, 
  CreditCard, 
  Sprout, 
  Home,
  Sofa,
  Bed,
  Utensils,
  Coffee,
  Lamp,
  Package
} from 'lucide-react';

interface HeroSectionProps {
  onExplore: (categorySlug?: string) => void;
  onSelectCategory?: (categorySlug: string) => void;
  customHero?: {
    badge?: string;
    title?: string;
    titleHighlight?: string;
    description?: string;
    buttonText?: string;
    buttonCategory?: string;
    bgImage?: string;
    stickerLeft?: string;
    stickerRight?: string;
  };
  customBadges?: Array<{
    id?: number;
    title: string;
    subtitle: string;
    icon?: string;
  }>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExplore,
  onSelectCategory,
  customHero,
  customBadges
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const handleCategoryClick = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    } else {
      onExplore(cat);
    }
  };

  // Exact default values matching user's capture
  const defaultHero = {
    badge: 'Votre maison, notre inspiration',
    title: 'Aménagez votre intérieur',
    titleHighlight: 'avec style',
    description: 'Mobilier, décoration, rangements et plus encore...\npour une maison qui vous ressemble.',
    buttonText: 'Découvrir la collection',
    buttonCategory: 'all',
    bgImage: '/uploads/darishop_hero_livingroom.jpg'
  };

  const hero = { ...defaultHero, ...(customHero || {}) };

  const defaultBadges = [
    { 
      id: 1, 
      title: 'Produits de qualité', 
      subtitle: 'Sélectionnés avec soin', 
      icon: 'shield' 
    },
    { 
      id: 2, 
      title: 'Service client', 
      subtitle: 'À votre écoute 7j/7', 
      icon: 'headphones' 
    },
    { 
      id: 3, 
      title: 'Paiement à la livraison', 
      subtitle: 'Plus de sécurité', 
      icon: 'credit-card' 
    },
    { 
      id: 4, 
      title: 'Une maison plus belle', 
      subtitle: 'à petit prix', 
      icon: 'sprout' 
    }
  ];

  const badges = customBadges && customBadges.length > 0 ? customBadges : defaultBadges;

  // Exact 7 Main Categories from user's capture
  const mainCategories = [
    {
      id: 'salon',
      title: 'Salon',
      subtitle: 'Confort & élégance',
      icon: Sofa,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800'
    },
    {
      id: 'chambre',
      title: 'Chambre',
      subtitle: 'Un espace pour rêver',
      icon: Bed,
      image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=800'
    },
    {
      id: 'salle-a-manger',
      title: 'Salle à manger',
      subtitle: 'Partagez de bons moments',
      icon: Utensils,
      image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=800'
    },
    {
      id: 'cuisine',
      title: 'Cuisine',
      subtitle: 'Pratique & moderne',
      icon: Coffee,
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800'
    },
    {
      id: 'decoration',
      title: 'Décoration',
      subtitle: 'Les détails qui changent tout',
      icon: Lamp,
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800'
    },
    {
      id: 'rangement',
      title: 'Rangement',
      subtitle: 'Tout à sa place',
      icon: Package,
      image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800'
    },
    {
      id: 'jardin-exterieur',
      title: 'Jardin & Extérieur',
      subtitle: 'Profitez de chaque instant',
      icon: Sprout,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800'
    }
  ];

  const renderBadgeIcon = (iconName?: string) => {
    switch (iconName) {
      case 'headphones':
      case 'support':
        return <Headphones className="w-8 h-8 text-[#0f3e37] stroke-[1.5]" />;
      case 'credit-card':
      case 'card':
        return <CreditCard className="w-8 h-8 text-[#0f3e37] stroke-[1.5]" />;
      case 'sprout':
      case 'plant':
        return <Sprout className="w-8 h-8 text-[#0f3e37] stroke-[1.5]" />;
      default:
        return <ShieldCheck className="w-8 h-8 text-[#0f3e37] stroke-[1.5]" />;
    }
  };

  return (
    <div className="w-full bg-white select-none">
      
      {/* 1. HERO SLIDER BANNER (Exact layout from capture) */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="relative rounded-[28px] overflow-hidden bg-[#e8ded1] min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] flex items-center shadow-xs">
          
          {/* Background Photo on Right */}
          <div className="absolute inset-0 flex items-center justify-end">
            <img 
              src={hero.bgImage || '/uploads/darishop_hero_livingroom.jpg'} 
              alt="Décoration d'intérieur DariShop"
              className="w-full h-full object-cover object-center lg:object-right"
            />
            {/* Soft Warm Gradient Mask to blend text on the left */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#e8ded1] via-[#e8ded1]/90 to-transparent w-full lg:w-[60%]"></div>
          </div>

          {/* Left Text Content */}
          <div className="relative z-10 max-w-xl px-6 sm:px-12 lg:px-16 py-10">
            
            {/* Pill Badge with House Icon */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-xs text-slate-800 text-xs font-semibold shadow-2xs mb-5">
              <Home className="w-3.5 h-3.5 text-[#0f3e37]" />
              <span>{hero.badge}</span>
            </div>

            {/* Main Title: 2 lines */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0f3e37] tracking-tight leading-[1.15]">
              {hero.title}
              <span className="block text-[#b87333] font-black mt-1">
                {hero.titleHighlight}
              </span>
            </h1>

            {/* Subtitle description */}
            <p className="mt-4 text-slate-700 text-sm sm:text-base font-normal leading-relaxed whitespace-pre-line">
              {hero.description}
            </p>

            {/* Action CTA Button */}
            <div className="mt-7">
              <button
                type="button"
                onClick={() => handleCategoryClick(hero.buttonCategory || 'all')}
                className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-[#0f3e37] hover:bg-[#0b2f29] text-white font-bold text-xs sm:text-sm tracking-normal inline-flex items-center gap-2.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <span>{hero.buttonText}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Slider Prev / Next Controls */}
          <button
            type="button"
            onClick={() => setActiveSlide((prev) => (prev === 0 ? 3 : prev - 1))}
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md cursor-pointer transition-transform active:scale-90"
            title="Précédent"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2]" />
          </button>

          <button
            type="button"
            onClick={() => setActiveSlide((prev) => (prev === 3 ? 0 : prev + 1))}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md cursor-pointer transition-transform active:scale-90"
            title="Suivant"
          >
            <ChevronRight className="w-5 h-5 stroke-[2]" />
          </button>

          {/* Pagination dots at bottom center */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {[0, 1, 2, 3].map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlide(idx)}
                className={`transition-all rounded-full cursor-pointer ${
                  activeSlide === idx
                    ? 'w-6 h-2 bg-[#0f3e37]'
                    : 'w-2 h-2 bg-white/80 hover:bg-white'
                }`}
                title={`Diapositive ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </div>

      {/* 2. REASSURANCE BAR (4 Badges with vertical dividers) */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 border-b border-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-slate-200">
          {badges.map((b, idx) => (
            <div key={b.id || idx} className="flex items-center gap-4 px-2 lg:px-6">
              <div className="shrink-0">
                {renderBadgeIcon(b.icon)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  {b.title}
                </h4>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  {b.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. NOS CATÉGORIES PRINCIPALES (7 Cards matching exact capture) */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Nos catégories principales
          </h2>
          <button
            type="button"
            onClick={() => handleCategoryClick('all')}
            className="text-xs sm:text-sm font-semibold text-[#b87333] hover:text-[#9e5f27] inline-flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            <span>Voir toutes les catégories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* 7 Horizontal Photo Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {mainCategories.map((cat) => {
            const IconComp = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.title)}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[3/4] lg:aspect-[4/5] bg-slate-100 cursor-pointer shadow-2xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
              >
                {/* Photo */}
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Bottom dark translucent overlay badge */}
                <div className="absolute inset-x-2 bottom-2 p-2 rounded-xl bg-black/60 backdrop-blur-md text-white flex items-center justify-between gap-1.5 shadow-sm border border-white/10">
                  <div className="flex items-center gap-2 min-w-0">
                    <IconComp className="w-4 h-4 text-white/90 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold leading-tight truncate">
                        {cat.title}
                      </p>
                      <p className="text-[10px] text-white/70 font-normal leading-tight truncate hidden sm:block">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-white/20 group-hover:bg-[#b87333] flex items-center justify-center shrink-0 transition-colors">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};

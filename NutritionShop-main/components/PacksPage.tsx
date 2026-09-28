import React, { useEffect, useMemo } from 'react';
import type { Pack, Product, Category } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { CartIcon, SparklesIcon } from './IconComponents';
import { useCart } from './CartContext';

interface PacksPageProps {
    onNavigateHome: () => void;
    onNavigateToCategory: (categoryName: string) => void;
    packs: Pack[];
    allProducts: Product[];
    allPacks: Pack[];
    onNavigateToPacks: () => void;
    onNavigateToPackDetail: (packId: number) => void;
    categories: Category[];
}

const isPackAvailable = (pack: Pack, allProducts: Product[]): boolean => {
    for (const productId of pack.includedProductIds) {
        const product = allProducts.find(p => p.id === productId);
        if (!product || product.quantity === 0) return false;
    }
    return true;
};

const PackCard: React.FC<{ pack: Pack; allProducts: Product[]; onNavigateToPackDetail: (packId: number) => void; }> = ({ pack, allProducts, onNavigateToPackDetail }) => {
    const { addToCart, openCart } = useCart();
    const isAvailable = useMemo(() => isPackAvailable(pack, allProducts), [pack, allProducts]);
    const savingsPercent = Math.round(((pack.oldPrice - pack.price) / pack.oldPrice) * 100);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isAvailable) return;
        addToCart(pack);
        openCart();
    };
    
    return (
        <div 
            onClick={() => onNavigateToPackDetail(pack.id)}
            className="group relative bg-white dark:bg-[#0f0f0f] border-2 border-gray-100 dark:border-gray-800 hover:border-brand-neon transition-all duration-500 flex flex-col h-full overflow-hidden cursor-pointer shadow-sm hover:shadow-[0_0_40px_rgba(204,255,0,0.15)]"
        >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>

            <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-black/40">
                <img 
                    src={pack.imageUrl} 
                    alt={pack.name} 
                    className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${!isAvailable ? 'grayscale opacity-40' : ''}`}
                />
                
                {/* Visual Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 dark:from-brand-black via-transparent to-transparent opacity-80"></div>
                
                {/* Tactical Badges */}
                <div className="absolute top-4 left-0 flex flex-col gap-2 z-10">
                    <div className="bg-brand-neon text-black text-[10px] font-black px-4 py-1 slant shadow-lg">
                        <span className="slant-reverse block">-{savingsPercent}% OPTIMISATION</span>
                    </div>
                    <div className="bg-black dark:bg-white text-white dark:text-black text-[10px] font-black px-4 py-1 slant shadow-lg">
                        <span className="slant-reverse block">STACK ÉLITE</span>
                    </div>
                </div>

                {!isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/60">
                        <span className="border-2 border-brand-alert text-brand-alert px-8 py-3 font-black uppercase slant bg-black/40 backdrop-blur-sm"><span className="slant-reverse block italic">SIGNAL PERDU</span></span>
                    </div>
                )}
            </div>

            <div className="p-8 flex flex-col flex-grow relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-brand-neon rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] font-mono">Mission Protocol</span>
                    </div>
                </div>

                <h3 className="font-serif font-black text-2xl italic leading-tight mb-4 text-gray-900 dark:text-white group-hover:text-brand-neon transition-colors uppercase tracking-tighter">
                    {pack.name}
                </h3>

                <p className="text-gray-500 dark:text-gray-400 text-xs font-mono mb-6 line-clamp-2 uppercase leading-relaxed border-l border-brand-neon pl-4">
                    {pack.description}
                </p>

                <div className="mt-auto">
                    <div className="flex flex-wrap gap-2 mb-8">
                        {pack.includedItems.slice(0, 3).map((item, idx) => (
                            <span key={idx} className="text-[9px] font-black text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-800 px-2 py-1 uppercase tracking-tighter bg-gray-50 dark:bg-transparent slant">
                                <span className="slant-reverse block">{item}</span>
                            </span>
                        ))}
                    </div>

                    <div className="flex items-end justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 line-through font-bold mb-1 font-mono">{pack.oldPrice.toFixed(3)} DT</span>
                            <span className="text-3xl font-black text-gray-900 dark:text-white font-mono leading-none tracking-tighter">
                                {pack.price.toFixed(3)} <span className="text-xs text-brand-neon">TND</span>
                            </span>
                        </div>
                        <button 
                            onClick={handleAddToCart}
                            disabled={!isAvailable}
                            className="w-14 h-14 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-brand-neon hover:text-black transition-all slant disabled:opacity-30 shadow-xl"
                        >
                            <span className="slant-reverse block"><CartIcon className="w-6 h-6" /></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const PacksPage: React.FC<PacksPageProps> = ({ onNavigateHome, packs, allProducts, onNavigateToPackDetail }) => {
    useEffect(() => {
        document.title = `PROTOCOL STACKS - Coffrets Elite IronFuel`;
        window.scrollTo(0,0);
    }, []);

    return (
        <div className="bg-gray-50 dark:bg-brand-black min-h-screen font-sans selection:bg-brand-neon selection:text-black transition-colors duration-300">
            {/* Section Header Tactique */}
            <div className="relative h-[500px] flex items-center justify-center overflow-hidden border-b-4 border-black dark:border-brand-neon">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center filter grayscale contrast-125 opacity-20 scale-110"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-brand-black via-transparent to-transparent"></div>
                
                {/* HUD Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(204,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(204,255,0,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]"></div>

                <div className="relative z-10 text-center px-6 max-w-5xl">
                    <div className="mb-8 inline-flex items-center gap-3 border border-brand-neon/30 bg-brand-neon/5 px-6 py-2 rounded-none slant">
                        <span className="slant-reverse flex items-center gap-2">
                             <SparklesIcon className="w-4 h-4 text-brand-neon animate-pulse" />
                             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 dark:text-brand-neon">Bundle Command Center</span>
                        </span>
                    </div>
                    
                    <h1 className="text-6xl md:text-9xl font-serif font-black italic text-gray-900 dark:text-white uppercase leading-[0.8] tracking-tighter mb-10 drop-shadow-2xl">
                        ELITE <br/> <span className="text-brand-neon">PROTOCOLS</span>
                    </h1>
                    
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-mono uppercase tracking-widest max-w-2xl mx-auto leading-relaxed border-l-4 border-brand-neon pl-8 text-left md:text-center md:border-l-0 md:pl-0">
                        Combinaisons synergiques de ressources critiques. Optimisez chaque déploiement vers vos objectifs de performance.
                    </p>
                </div>
            </div>

            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="mb-16">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Protocol Stacks' }]} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {packs.map(pack => (
                        <div key={pack.id} className="animate-fadeIn">
                            <PackCard 
                                pack={pack} 
                                allProducts={allProducts} 
                                onNavigateToPackDetail={onNavigateToPackDetail} 
                            />
                        </div>
                    ))}
                </div>

                {/* Footer Section: Custom Protocol */}
                <div className="mt-40 p-12 md:p-24 bg-white dark:bg-[#0a0a0a] border-2 border-gray-200 dark:border-gray-800 text-center relative overflow-hidden shadow-2xl rounded-none">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-gray-900 dark:text-white transform rotate-12 scale-150">
                        <CartIcon className="w-64 h-64 fill-current"/>
                    </div>
                    
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-serif font-black italic text-gray-900 dark:text-white uppercase mb-8 tracking-tighter leading-tight">Besoin d'un protocole <span className="text-brand-neon underline">sur-mesure</span> ?</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-mono uppercase tracking-widest mb-12 text-sm leading-loose">Nos analystes tactiques peuvent composer une stack adaptée à vos paramètres physiologiques spécifiques.</p>
                        
                        <a href="#/contact" className="group relative inline-flex items-center justify-center px-12 py-6 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.3em] text-sm slant hover:bg-brand-neon hover:text-black dark:hover:bg-brand-neon transition-all shadow-[0_0_30px_rgba(0,0,0,0.2)]">
                            <span className="slant-reverse block flex items-center gap-3">
                                Établir une liaison Support
                                <SparklesIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
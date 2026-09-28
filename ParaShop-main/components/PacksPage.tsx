
import React, { useEffect, useMemo } from 'react';
import type { Pack, Product, Category } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { CartIcon, SparklesIcon, CheckCircleIcon } from './IconComponents';
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

const PackCard: React.FC<{ pack: Pack; onNavigateToPackDetail: (packId: number) => void; }> = ({ pack, onNavigateToPackDetail }) => {
    const { addToCart, openCart } = useCart();
    const savingsPercent = Math.round(((pack.oldPrice - pack.price) / pack.oldPrice) * 100);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToCart(pack);
        openCart();
    };
    
    return (
        <div 
            onClick={() => onNavigateToPackDetail(pack.id)}
            className="group bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700/50 hover:border-brand-primary transition-all duration-500 overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl"
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 dark:bg-gray-900">
                <img 
                    src={pack.imageUrl} 
                    alt={pack.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute top-5 left-5 bg-brand-primary text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg">
                    RITUEL BIEN-ÊTRE
                </div>
            </div>

            <div className="p-8">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em]">Cure Certifiée</span>
                </div>
                <h3 className="font-serif font-bold text-2xl text-gray-900 dark:text-white mb-4 leading-tight">
                    {pack.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 line-clamp-2 italic">
                    {pack.description}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-700">
                    <div>
                        <span className="block text-xs text-gray-400 line-through font-medium">{pack.oldPrice.toFixed(3)} DT</span>
                        <span className="text-2xl font-black text-brand-primary">
                            {pack.price.toFixed(3)} <span className="text-xs">DT</span>
                        </span>
                    </div>
                    <button 
                        onClick={handleAddToCart}
                        className="w-12 h-12 bg-brand-light text-brand-primary rounded-2xl flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                    >
                        <CartIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const PacksPage: React.FC<PacksPageProps> = ({ onNavigateHome, packs, onNavigateToPackDetail }) => {
    useEffect(() => {
        document.title = "Nos Rituels de Soin - PharmaNature";
        window.scrollTo(0,0);
    }, []);

    return (
        <div className="bg-brand-bg dark:bg-brand-dark min-h-screen pb-24">
            <div className="relative h-[450px] flex items-center justify-center overflow-hidden bg-brand-light">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?q=80&w=1600')] bg-cover bg-center opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-bg"></div>

                <div className="relative z-10 text-center px-6">
                    <h1 className="text-5xl md:text-7xl font-serif font-black text-gray-900 dark:text-white mb-6">
                        Rituels <span className="text-brand-primary">Naturels</span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium">
                        Des synergies d'actifs conçues par nos pharmaciens pour répondre à vos besoins fondamentaux.
                    </p>
                </div>
            </div>

            <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 -mt-16 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {packs.map(pack => (
                        <PackCard key={pack.id} pack={pack} onNavigateToPackDetail={onNavigateToPackDetail} />
                    ))}
                </div>
            </div>
        </div>
    );
};

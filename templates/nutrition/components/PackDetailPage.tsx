import React, { useState, useMemo, useEffect } from 'react';
import type { Product, Pack } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { useCart } from './CartContext';
import { PlusIcon, MinusIcon, StarIcon, CheckCircleIcon, HeartIcon, SparklesIcon, CartIcon } from './IconComponents';
import { ReviewsSection } from './ReviewsSection';
import { useFavorites } from './FavoritesContext';

interface PackDetailPageProps {
    pack: Pack;
    allProducts: Product[];
    allPacks: Pack[];
    onNavigateHome: () => void;
    onNavigateToProductDetail: (productId: number | string) => void;
    onNavigateToPackDetail: (packId: number | string) => void;
    onNavigateToPacks: () => void;
}

const getPackContents = (pack: Pack, allProducts: Product[], allPacks: Pack[]): Product[] => {
    let contents: Product[] = [];
    
    pack.includedProductIds.forEach(productId => {
        const product = allProducts.find(p => p.id === productId);
        if (product) contents.push(product);
    });

    if (pack.includedPackIds) {
        pack.includedPackIds.forEach(subPackId => {
            const subPack = allPacks.find(p => p.id === subPackId);
            if (subPack) {
                const subPackContents = getPackContents(subPack, allProducts, allPacks);
                contents = [...contents, ...subPackContents];
            }
        });
    }
    return contents;
};

export const PackDetailPage: React.FC<PackDetailPageProps> = ({ pack, allProducts, allPacks, onNavigateHome, onNavigateToProductDetail, onNavigateToPacks }) => {
    const [quantity, setQuantity] = useState(1);
    const { addToCart, openCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();
    const isFav = isFavorite(pack.id);
    
    const savings = pack.oldPrice - pack.price;
    const savingsPercent = Math.round((savings / pack.oldPrice) * 100);
    const packContents = useMemo(() => getPackContents(pack, allProducts, allPacks), [pack, allProducts, allPacks]);

    const isAvailable = useMemo(() => {
        for (const product of packContents) {
            if (product.quantity === 0) return false;
        }
        return true;
    }, [packContents]);

    useEffect(() => {
        document.title = `${pack.name} | PROTOCOL BRIEFING - IronFuel`;
        window.scrollTo(0, 0);
    }, [pack]);

    const handleAddToCart = () => {
        if (!isAvailable) return;
        addToCart(pack, quantity);
        openCart();
    };

    return (
        <div className="bg-white dark:bg-[#050505] min-h-screen font-sans pb-32 transition-colors duration-300">
            {/* Tactical Header Overlay */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-brand-neon/5 to-transparent pointer-events-none"></div>

            {/* Navigation & Breadcrumb */}
            <div className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md sticky top-20 z-40">
                <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Stacks', onClick: onNavigateToPacks }, { name: pack.name }]} />
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-brand-neon animate-pulse' : 'bg-brand-alert'}`}></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{isAvailable ? 'Opérationnel' : 'Rupture Logistique'}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-[1800px] mx-auto px-6 md:px-12 pt-16 lg:pt-24 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 xl:gap-32">
                    
                    {/* --- GAUCHE : VISUEL TACTIQUE --- */}
                    <div className="w-full lg:w-1/2">
                        <div className="lg:sticky lg:top-40 space-y-12">
                            <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-black border-2 border-gray-100 dark:border-gray-800 group">
                                {/* Carbon Fiber Texture Overlay */}
                                <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] z-10 pointer-events-none"></div>
                                
                                <img 
                                    src={pack.imageUrl} 
                                    alt={pack.name} 
                                    className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105" 
                                />
                                
                                {/* Badge Remise Style Industriel */}
                                <div className="absolute top-8 left-0 z-20">
                                    <div className="bg-brand-neon text-black px-6 py-2 font-black italic uppercase text-xl shadow-[0_10px_20px_rgba(204,255,0,0.3)] slant">
                                        <span className="slant-reverse block">-{savingsPercent}% IMPACT</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => toggleFavorite(pack.id)} 
                                    className={`absolute top-8 right-8 z-20 w-14 h-14 flex items-center justify-center border-2 transition-all ${isFav ? 'bg-brand-alert border-brand-alert text-white shadow-lg' : 'bg-white/10 dark:bg-black/40 border-white/20 text-white hover:border-brand-neon hover:text-brand-neon'}`}
                                >
                                    <HeartIcon className="w-7 h-7" solid={isFav} />
                                </button>

                                {/* Scanner Line Animation */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-brand-neon/40 shadow-[0_0_15px_#ccff00] animate-marquee z-20"></div>
                            </div>
                            
                            {/* Technical Guarantees Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-[#0a0a0a] p-6 border border-gray-100 dark:border-gray-800 flex items-center gap-5 group hover:border-brand-neon transition-colors">
                                    <div className="w-12 h-12 bg-black dark:bg-brand-gray border border-gray-800 flex items-center justify-center text-brand-neon slant">
                                        <CheckCircleIcon className="w-6 h-6 slant-reverse" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Qualité</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tighter">Puretée Certifiée Labo</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#0a0a0a] p-6 border border-gray-100 dark:border-gray-800 flex items-center gap-5 group hover:border-brand-neon transition-colors">
                                    <div className="w-12 h-12 bg-black dark:bg-brand-gray border border-gray-800 flex items-center justify-center text-brand-neon slant">
                                        <SparklesIcon className="w-6 h-6 slant-reverse" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Logistique</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tighter">Expédition Prioritaire HQ</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- DROITE : BRIEFING TECHNIQUE --- */}
                    <div className="w-full lg:w-1/2 flex flex-col pt-4 lg:pt-0">
                        <div className="mb-12">
                            <span className="inline-flex items-center gap-2 bg-brand-neon/10 border border-brand-neon/30 text-brand-neon font-black tracking-[0.3em] text-[10px] uppercase px-4 py-1 mb-6 slant">
                                <span className="slant-reverse">Protocol Configuration Alpha-7</span>
                            </span>
                            
                            <h1 className="text-5xl lg:text-7xl font-serif font-black italic text-gray-900 dark:text-white leading-[0.85] uppercase tracking-tighter mb-8">
                                {pack.name}
                            </h1>

                            <div className="flex items-center gap-6 mb-10 pb-10 border-b border-gray-100 dark:border-gray-800">
                                <div className="flex gap-1">
                                    {[1,2,3,4,5].map(i => <StarIcon key={i} className="w-5 h-5 text-brand-neon" />)}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 border-l border-gray-300 dark:border-gray-700 pl-6">Validation Athlètes Elite</span>
                            </div>

                            <div className="bg-gray-50 dark:bg-[#111] p-8 border-l-4 border-brand-neon relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <SparklesIcon className="w-24 h-24" />
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 font-mono text-sm leading-relaxed uppercase tracking-wide relative z-10">
                                    {pack.description}
                                </p>
                            </div>
                        </div>

                        {/* Inventory Checklist */}
                        <div className="mb-16">
                            <h3 className="font-serif font-black italic text-3xl text-gray-900 dark:text-white mb-8 uppercase tracking-tighter">Inventaire de Mission</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {packContents.map((product) => (
                                    <div 
                                        key={product.id} 
                                        onClick={() => onNavigateToProductDetail(product.id)}
                                        className="group cursor-pointer flex items-center justify-between p-5 bg-white dark:bg-[#0f0f0f] border-2 border-gray-100 dark:border-gray-800 hover:border-brand-neon transition-all"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-20 h-20 bg-gray-50 dark:bg-black p-2 flex-shrink-0 border border-gray-100 dark:border-gray-800 overflow-hidden">
                                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{product.brand}</p>
                                                <p className="font-serif font-black text-lg text-gray-900 dark:text-white uppercase leading-none group-hover:text-brand-neon transition-colors tracking-tighter">{product.name}</p>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 group-hover:bg-brand-neon group-hover:text-black group-hover:border-brand-neon transition-all">
                                            <PlusIcon className="w-4 h-4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Deployment / CTA Block */}
                        <div className="mt-auto bg-gray-900 dark:bg-brand-gray p-10 relative overflow-hidden shadow-2xl">
                            {/* Glow effect */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-neon opacity-[0.03] rounded-full blur-[80px] pointer-events-none"></div>
                            
                            <div className="flex flex-col sm:flex-row justify-between items-end gap-8 mb-10 relative z-10">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2">Valeur Cumulée des Unités</p>
                                    <p className="text-xl text-gray-400 line-through font-mono font-bold decoration-brand-alert decoration-2">{pack.oldPrice.toFixed(3)} DT</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-neon mb-2">Investissement Pack</p>
                                    <p className="text-5xl font-black text-white font-mono tracking-tighter leading-none">
                                        {pack.price.toFixed(3)} <span className="text-lg text-gray-400">TND</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                                <div className="flex items-center bg-black/50 border border-gray-700 p-1 h-16 sm:w-40 justify-between">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-brand-neon transition-colors" disabled={quantity <= 1}><MinusIcon className="w-4 h-4" /></button>
                                    <span className="font-black text-xl text-white font-mono">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)} className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-brand-neon transition-colors"><PlusIcon className="w-4 h-4" /></button>
                                </div>
                                
                                <button 
                                    onClick={handleAddToCart}
                                    disabled={!isAvailable}
                                    className="flex-1 bg-brand-neon text-black font-black uppercase tracking-[0.2em] text-sm h-16 slant hover:bg-white transition-all shadow-[0_0_30px_rgba(204,255,0,0.4)] disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                                >
                                    <span className="slant-reverse block flex items-center justify-center gap-3">
                                        {isAvailable ? 'DÉPLOYER AU SET' : 'UNITÉ INDISPONIBLE'}
                                        {isAvailable && <CartIcon className="w-5 h-5" />}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Reports Section */}
                <div className="mt-32">
                    <ReviewsSection targetId={pack.id} targetType="pack" />
                </div>
            </div>
        </div>
    );
};

import React, { useState, useMemo, useEffect } from 'react';
import type { Product } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { useCart } from './CartContext';
import { useFavorites } from './FavoritesContext';
import { PlusIcon, MinusIcon, HeartIcon, SparklesIcon, CheckCircleIcon } from './IconComponents';
import { ReviewsSection } from './ReviewsSection';
import { ProductGallery } from './ProductGallery';
import { SEO } from './SEO';
import { ProductCarousel } from './ProductCarousel';

export const ProductDetailPage: React.FC<{
    product: Product;
    allProducts: Product[];
    onNavigateHome: () => void;
    onNavigateToProductDetail: (productId: number | string) => void;
    onPreview: (product: Product) => void;
}> = ({ product, allProducts, onNavigateHome, onNavigateToProductDetail, onPreview }) => {
    const [quantity, setQuantity] = useState(1);
    const { addToCart, openCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();
    
    const isFav = isFavorite(product.id as number);
    const isOutOfStock = product.quantity === 0;

    useEffect(() => { window.scrollTo(0,0); }, [product]);

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        addToCart({ ...product }, quantity);
        openCart();
    };

    const similarProducts = useMemo(() => 
        allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 8),
    [allProducts, product]);

    return (
        <div className="min-h-screen bg-white dark:bg-brand-dark transition-colors duration-300">
            <SEO title={product.name} description={product.description} image={product.imageUrl} type="product" />

            <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-12">
                <div className="mb-12">
                    <Breadcrumb items={[{ name: 'ACCUEIL', onClick: onNavigateHome }, { name: product.category.toUpperCase() }, { name: product.name.toUpperCase() }]} />
                </div>

                {/* GRILLE PRINCIPALE : Galerie + Infos Achat */}
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 mb-16">
                    {/* Galerie */}
                    <div className="w-full lg:w-1/2">
                        <div className="bg-slate-50 dark:bg-gray-900 rounded-[3rem] p-6 border border-slate-100 dark:border-white/5 flex items-center justify-center min-h-[500px]">
                            <ProductGallery images={product.images || [product.imageUrl]} productName={product.name} />
                        </div>
                    </div>

                    {/* Infos Achat */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center">
                        <div className="mb-10">
                            <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] bg-brand-primary/10 px-4 py-1.5 rounded-full inline-block mb-6">{product.brand}</span>
                            <h1 className="text-4xl lg:text-7xl font-serif font-black text-slate-900 dark:text-white leading-tight mb-8 tracking-tighter uppercase">{product.name}</h1>
                            
                            <div className="flex items-baseline gap-4">
                                <span className="text-6xl font-black text-brand-primary tracking-tighter">{product.price.toFixed(3)} <span className="text-lg font-bold text-slate-400">DT</span></span>
                                {product.oldPrice && <span className="text-xl text-slate-300 line-through font-medium">{product.oldPrice.toFixed(3)}</span>}
                            </div>
                        </div>

                        <div className="bg-brand-light/30 dark:bg-white/5 rounded-[2.5rem] p-10 border border-brand-primary/10 mb-10">
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="flex items-center bg-white dark:bg-brand-dark rounded-2xl border border-slate-100 dark:border-white/5 p-2 h-16 shadow-sm">
                                    <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-12 h-full flex items-center justify-center text-slate-300 hover:text-brand-primary font-bold text-xl">−</button>
                                    <span className="w-12 text-center font-black text-lg">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q+1)} className="w-12 h-full flex items-center justify-center text-slate-300 hover:text-brand-primary font-bold text-xl">+</button>
                                </div>
                                <button 
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock}
                                    className="flex-grow bg-brand-primary text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all flex items-center justify-center gap-3 disabled:bg-slate-200"
                                >
                                    <span>{isOutOfStock ? 'RUPTURE DE STOCK' : 'AJOUTER AU PANIER'}</span>
                                </button>
                                <button onClick={() => toggleFavorite(product.id)} className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-all ${isFav ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-white border-slate-100 text-slate-300 dark:text-slate-500 hover:text-rose-500'}`}>
                                    <HeartIcon className="w-6 h-6" solid={isFav} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ZONE PLEINE LARGEUR : Analyse & Conseils */}
                <div className="space-y-16">
                    {/* PROPRIÉTÉS */}
                    <div className="w-full">
                        <div className="flex items-center gap-4 mb-10">
                            <h3 className="text-sm font-black uppercase tracking-[0.4em] text-slate-400">FICHE TECHNIQUE & ANALYSE</h3>
                            <div className="h-px flex-grow bg-slate-100 dark:bg-white/5"></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {product.specifications?.map((s, i) => (
                                <div key={i} className="p-8 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2rem] hover:shadow-lg transition-all">
                                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-3">{s.name}</p>
                                    <p className="text-lg font-bold text-slate-800 dark:text-white uppercase">{s.value}</p>
                                </div>
                            ))}
                            <div className="p-8 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/20 rounded-[2rem] flex flex-col justify-center">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">CERTIFICATION</p>
                                <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 uppercase">LABORATOIRE AGRÉÉ</p>
                            </div>
                        </div>
                    </div>

                    {/* CONSEILS - Design Adaptatif (Fini le fond noir forcé en mode jour) */}
                    <div className="relative w-full p-12 lg:p-16 bg-slate-50 dark:bg-gray-900 rounded-[4rem] border-l-[12px] border-brand-primary overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 p-12 opacity-5 text-brand-primary">
                            <CheckCircleIcon className="w-64 h-64" />
                        </div>
                        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                            <div className="flex-shrink-0">
                                <div className="w-20 h-20 bg-brand-primary text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-brand-primary/20">
                                    <SparklesIcon className="w-10 h-10" />
                                </div>
                            </div>
                            
                            <div className="flex-grow">
                                <h4 className="text-2xl lg:text-3xl font-serif font-black uppercase italic mb-6 tracking-wide text-brand-primary">L'Avis de nos Docteurs en Pharmacie</h4>
                                <p className="text-xl lg:text-2xl font-medium leading-relaxed italic text-slate-600 dark:text-slate-300 max-w-5xl">
                                    "Ce protocole a été sélectionné pour sa haute biodisponibilité. Pour une efficacité maximale, nous préconisons une cure continue de 3 mois. Appliquez le soin matin et soir sur une zone parfaitement nettoyée pour favoriser la pénétration des actifs."
                                </p>
                            </div>

                            <div className="flex-shrink-0 flex flex-col items-center lg:items-end border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/10 pt-8 lg:pt-0 lg:pl-12">
                                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white dark:border-brand-primary shadow-xl mb-4 grayscale hover:grayscale-0 transition-all duration-500">
                                     <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200" className="object-cover w-full h-full" alt="Expert PharmaNature" />
                                </div>
                                <span className="text-[11px] font-black text-brand-primary uppercase tracking-[0.3em] mb-1">Dr. S. PharmaNature</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Expert en Dermo-cosmétique</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Suggestions & Reviews */}
                <div className="mt-32">
                    <ReviewsSection targetId={product.id} targetType="product" />
                </div>

                <div className="mt-32">
                    <div className="text-center mb-16">
                        <span className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">PROTOCOLES COMPLÉMENTAIRES</span>
                        <h2 className="text-4xl md:text-6xl font-serif font-black text-gray-900 dark:text-white tracking-tighter uppercase">COMPLÉTEZ VOTRE <span className="text-brand-primary italic">RITUEL</span></h2>
                    </div>
                    <ProductCarousel title="" products={similarProducts} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail} />
                </div>
            </div>
        </div>
    );
};

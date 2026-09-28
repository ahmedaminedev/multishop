import React, { useState, useEffect, useMemo } from 'react';
import type { Product } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { ProductCard } from './ProductCard';
import { Squares2X2Icon, Bars3Icon, ChevronDownIcon, CartIcon } from './IconComponents';
import { ProductListItem } from './ProductListItem';
import { useCart } from './CartContext';

interface PromotionsPageProps {
    onNavigateHome: () => void;
    onNavigateToCategory: (categoryName: string) => void;
    onPreview: (product: Product) => void;
    products: Product[];
    onNavigateToProductDetail: (productId: number) => void;
}

const CountdownTimer: React.FC = () => {
    const calculateTimeLeft = () => {
        const difference = +new Date("2024-12-31") - +new Date();
        let timeLeft: { [key: string]: number } = {};

        if (difference > 0) {
            timeLeft = {
                jours: Math.floor(difference / (1000 * 60 * 60 * 24)),
                heures: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                secondes: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    const timerComponents = Object.keys(timeLeft).map(interval => {
        if (!timeLeft[interval] && timeLeft[interval] !== 0) {
            return null;
        }
        return (
            <div key={interval} className="flex flex-col items-center">
                <span className="text-2xl md:text-3xl font-bold">{String(timeLeft[interval]).padStart(2, '0')}</span>
                <span className="text-xs uppercase">{interval}</span>
            </div>
        );
    });

    return (
        <div className="flex items-center justify-center space-x-4 md:space-x-6 text-gray-800 dark:text-gray-200">
            {timerComponents.length ? timerComponents : <span>L'offre a expiré !</span>}
        </div>
    );
};

const DealOfTheDay: React.FC<{ product: Product; onPreview: (product: Product) => void; onNavigateToProductDetail: (productId: number) => void; }> = ({ product, onPreview, onNavigateToProductDetail }) => {
    const { addToCart, openCart } = useCart();
    
    const handleAddToCart = () => {
        addToCart(product);
        openCart();
    };

    return (
        <section className="my-12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row items-center p-6 sm:p-8">
                <div className="w-full lg:w-2/5 mb-6 lg:mb-0">
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToProductDetail(product.id); }}>
                        <img src={product.imageUrl} alt={product.name} className="w-full max-w-sm mx-auto object-contain rounded-lg transition-transform duration-500 hover:scale-105" />
                    </a>
                </div>
                <div className="w-full lg:w-3/5 text-center lg:text-left lg:pl-12">
                    <h2 className="text-xl font-bold text-red-600 uppercase tracking-wider">Offre du jour</h2>
                    <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white my-3">
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToProductDetail(product.id); }} className="hover:text-red-600 transition-colors">
                            {product.name}
                        </a>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">{product.description}</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
                        <div className="flex items-baseline gap-2">
                             {product.oldPrice && <p className="text-2xl text-gray-400 line-through">{product.oldPrice.toFixed(0)} DT</p>}
                            <p className="text-4xl font-bold text-red-600">{product.price.toFixed(0)} DT</p>
                        </div>
                        {product.discount && <span className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-md">ÉCONOMISEZ {product.discount}%</span>}
                    </div>
                    <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-center font-semibold text-gray-700 dark:text-gray-200 mb-3">L'offre se termine dans :</p>
                        <CountdownTimer />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                         <button onClick={handleAddToCart} className="bg-red-600 text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 text-lg">
                            <CartIcon className="w-6 h-6" />
                            <span>Ajouter au panier</span>
                        </button>
                        <button onClick={() => onPreview(product)} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-4 px-8 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            Aperçu rapide
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};


export const PromotionsPage: React.FC<PromotionsPageProps> = ({ onNavigateHome, onPreview, products: allProducts, onNavigateToProductDetail }) => {
    const promotionProducts = useMemo(() => allProducts.filter(p => p.promo || p.discount), [allProducts]);
    const [sortOrder, setSortOrder] = useState('discount-desc');
    const [viewMode, setViewMode] = useState('grid');
    
    useEffect(() => {
        document.title = `Promotions - Electro Shop`;
    }, []);

    const displayedProducts = useMemo(() => {
        const sorted = [...promotionProducts];
        
        sorted.sort((a, b) => {
            switch (sortOrder) {
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'discount-desc':
                    return (b.discount || 0) - (a.discount || 0);
                default:
                    return 0;
            }
        });
        
        return sorted;
    }, [promotionProducts, sortOrder]);

    const gridClasses = useMemo(() => {
        switch (viewMode) {
            case 'grid': return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
            case 'list': return 'grid-cols-1';
            default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
        }
    }, [viewMode]);

    const dealOfTheDayProduct = useMemo(() => {
        return [...promotionProducts].sort((a, b) => (b.discount || 0) - (a.discount || 0))[0] || allProducts[0];
    }, [promotionProducts, allProducts]);

    return (
        <div className="bg-gray-100 dark:bg-gray-950">
             <div className="relative bg-gray-800 py-24 sm:py-32">
                 <img src="https://picsum.photos/seed/promo-header/1920/1080" alt="Promotions background" className="absolute inset-0 h-full w-full object-cover brightness-50"/>
                 <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">Promotions Imbattables</h1>
                        <p className="mt-6 text-lg leading-8 text-gray-300">
                           Profitez de nos meilleures offres sur une large sélection de produits. Des prix incroyables pour une durée limitée !
                        </p>
                    </div>
                 </div>
            </div>
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Promotions' }]} />
                </div>
                
                <DealOfTheDay product={dealOfTheDayProduct} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail} />

                <main>
                    <div className="flex justify-between items-center mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                                <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`} aria-label="Grid view"><Squares2X2Icon className="w-5 h-5"/></button>
                                <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`} aria-label="List view"><Bars3Icon className="w-5 h-5"/></button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <select 
                                    value={sortOrder} 
                                    onChange={(e) => setSortOrder(e.target.value)} 
                                    className="appearance-none rounded-md border border-gray-300 dark:border-gray-600 py-2 pl-3 pr-10 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    <option value="discount-desc">Trier par: Plus grande remise</option>
                                    <option value="price-asc">Trier par: Prix: faible à élevé</option>
                                    <option value="price-desc">Trier par: Prix: élevé à faible</option>
                                </select>
                                <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none" />
                            </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">Affichage des {displayedProducts.length} articles</span>
                        </div>
                    </div>
                    
                    {displayedProducts.length > 0 ? (
                        viewMode === 'list' ? (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                                {displayedProducts.map(product => (
                                    <ProductListItem key={product.id} product={product} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail} />
                                ))}
                            </div>
                        ) : (
                            <div className={`grid ${gridClasses} gap-6`}>
                                {displayedProducts.map(product => (
                                    <ProductCard key={product.id} product={product} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail} />
                                ))}
                            </div>
                        )
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-lg text-gray-600 dark:text-gray-400">Aucun produit en promotion pour le moment.</p>
                            <p className="text-sm text-gray-500 mt-2">Revenez bientôt pour découvrir nos prochaines offres !</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
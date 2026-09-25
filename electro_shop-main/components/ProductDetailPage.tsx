
import React, { useState, useMemo, useEffect } from 'react';
import type { Product } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { useCart } from './CartContext';
import { useFavorites } from './FavoritesContext';
import { PlusIcon, MinusIcon, CartIcon, HeartIcon, DeliveryTruckIcon, GuaranteeIcon, SecurePaymentIcon } from './IconComponents';
import { ProductCarousel } from './ProductCarousel';
import { ProductGallery } from './ProductGallery';

interface ProductDetailPageProps {
    product: Product;
    allProducts: Product[];
    onNavigateHome: () => void;
    onNavigateToProductDetail: (productId: number | string) => void;
    onPreview: (product: Product) => void;
}

const StarRating: React.FC<{ rating: number; reviewCount: number }> = ({ rating, reviewCount }) => (
    <div className="flex items-center gap-2">
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
        <a href="#reviews" className="text-sm text-gray-500 dark:text-gray-400 hover:underline">({reviewCount} avis)</a>
    </div>
);

type Tab = 'description' | 'specs' | 'reviews';

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, allProducts, onNavigateHome, onNavigateToProductDetail, onPreview }) => {
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<Tab>('description');
    const { addToCart, openCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();
    const isFav = isFavorite(product.id as number);
    const isOutOfStock = product.quantity === 0;

    // Backward compatibility: use array if present, else fallback to single url
    const productImages = useMemo(() => {
        if (product.images && product.images.length > 0) return product.images;
        return product.imageUrl ? [product.imageUrl] : [];
    }, [product]);

    const similarProducts = useMemo(() => 
        allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 10),
    [allProducts, product]);

    useEffect(() => {
        document.title = `${product.name} | Electro Shop`;
        window.scrollTo(0,0);
    }, [product]);

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        addToCart(product, quantity);
        openCart();
    };

    const reviews = [
        { id: 1, author: "Karim G.", rating: 5, text: "Excellent produit, conforme à la description. Livraison rapide et service client au top. Je recommande vivement !", date: "2023-10-15" },
        { id: 2, author: "Amina B.S.", rating: 4, text: "Très bon rapport qualité-prix. L'appareil fonctionne parfaitement. Seul petit bémol, le câble d'alimentation est un peu court.", date: "2023-10-12" },
        { id: 3, author: "Mehdi T.", rating: 5, text: "Super achat ! Le design est moderne et il s'intègre parfaitement dans ma cuisine. Facile à utiliser.", date: "2023-10-10" },
    ];

    return (
        <div className="bg-gray-100 dark:bg-gray-950">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: product.category }, { name: product.name }]} />

                <main className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* Left: Professional Gallery */}
                        <div className="h-full">
                            <ProductGallery images={productImages} productName={product.name} />
                        </div>

                        {/* Right: Product Info & Actions */}
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wider">{product.brand.toUpperCase()}</p>
                            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mt-1">{product.name}</h1>
                            <div className="mt-3">
                                <StarRating rating={4} reviewCount={reviews.length} />
                            </div>

                            <div className="mt-6 flex items-baseline gap-3">
                                <p className="text-4xl font-bold text-red-600">{product.price.toFixed(3).replace('.',',')} DT</p>
                                {product.oldPrice && (
                                    <p className="text-2xl text-gray-400 line-through">{product.oldPrice.toFixed(3).replace('.',',')} DT</p>
                                )}
                            </div>

                            <div className="mt-4 flex items-center">
                                {isOutOfStock ? (
                                    <>
                                        <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                                        <span className="font-semibold text-red-700 dark:text-red-400">Épuisé</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                        <span className="font-semibold text-green-700 dark:text-green-400">En stock</span>
                                    </>
                                )}
                            </div>
                            
                            <p className="mt-6 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{product.description?.substring(0, 150)}...</p>

                            <div className="mt-8 flex items-center gap-6">
                                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-l-full transition-colors" aria-label="Diminuer"><MinusIcon className="w-5 h-5" /></button>
                                    <span className="w-12 text-center text-lg font-bold">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-r-full transition-colors" aria-label="Augmenter"><PlusIcon className="w-5 h-5" /></button>
                                </div>
                                <button onClick={handleAddToCart} disabled={isOutOfStock} className="flex-1 bg-red-600 text-white font-bold py-3.5 px-6 rounded-full flex items-center justify-center space-x-2 transition-all duration-300 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg">
                                    <CartIcon className="w-6 h-6" />
                                    <span>{isOutOfStock ? 'Épuisé' : 'Ajouter au panier'}</span>
                                </button>
                                <button onClick={() => toggleFavorite(product.id as number)} className={`p-3.5 rounded-full transition-colors shadow-md ${isFav ? 'bg-red-100 text-red-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-100 hover:text-red-500'}`}>
                                    <HeartIcon className="w-6 h-6" solid={isFav} />
                                </button>
                            </div>

                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><DeliveryTruckIcon className="w-6 h-6 text-red-500"/> <span>Livraison rapide</span></div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><GuaranteeIcon className="w-6 h-6 text-red-500"/> <span>Garantie officielle</span></div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><SecurePaymentIcon className="w-6 h-6 text-red-500"/> <span>Paiement sécurisé</span></div>
                            </div>
                        </div>
                    </div>
                </main>

                <section className="mt-12">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <TabButton title="Description" isActive={activeTab === 'description'} onClick={() => setActiveTab('description')} />
                            <TabButton title="Fiche Technique" isActive={activeTab === 'specs'} onClick={() => setActiveTab('specs')} />
                            <TabButton title="Avis Clients" isActive={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} />
                        </nav>
                    </div>

                    <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8">
                        {activeTab === 'description' && <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"><p>{product.description || "Aucune description détaillée disponible."}</p></div>}
                        {activeTab === 'specs' && (
                            <div className="animate-fadeIn">
                                {(product.specifications && product.specifications.length > 0) ? (
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <dl className="grid grid-cols-1 md:grid-cols-2">
                                            {product.specifications.map((spec, index) => (
                                                <React.Fragment key={index}>
                                                    <dt className={`px-6 py-4 font-medium text-gray-600 dark:text-gray-300 ${index % 2 !== 0 ? 'bg-gray-50 dark:bg-gray-700/50' : 'bg-white dark:bg-gray-800'}`}>
                                                        {spec.name}
                                                    </dt>
                                                    <dd className={`px-6 py-4 text-gray-800 dark:text-gray-100 font-semibold md:border-l md:border-dotted md:border-gray-300 dark:md:border-gray-600 ${index % 2 !== 0 ? 'bg-gray-50 dark:bg-gray-700/50' : 'bg-white dark:bg-gray-800'}`}>
                                                        {spec.value}
                                                    </dd>
                                                </React.Fragment>
                                            ))}
                                        </dl>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">Aucune fiche technique disponible pour ce produit.</p>
                                )}
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div id="reviews" className="space-y-6">
                                {reviews.map(review => (
                                     <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                                        <div className="flex items-center mb-2">
                                            <StarRating rating={review.rating} reviewCount={0} />
                                            <p className="ml-4 font-bold text-gray-800 dark:text-gray-100">{review.author}</p>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300">{review.text}</p>
                                        <p className="text-xs text-gray-400 mt-2">{review.date}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
                
                {similarProducts.length > 0 && (
                     <ProductCarousel 
                        title="Produits similaires"
                        products={similarProducts}
                        onPreview={onPreview}
                        onNavigateToProductDetail={onNavigateToProductDetail}
                    />
                )}
            </div>
        </div>
    );
};

const TabButton: React.FC<{title: string, isActive: boolean, onClick: () => void}> = ({ title, isActive, onClick}) => (
    <button
        onClick={onClick}
        className={`${
            isActive
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
    >
        {title}
    </button>
);


import React, { useState, useMemo, useEffect } from 'react';
import type { Product, Pack } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { useCart } from './CartContext';
import { PlusIcon, MinusIcon, CartIcon, ChevronRightIcon } from './IconComponents';
import { SpecificationSlider } from './SpecificationSlider';

interface PackDetailPageProps {
    pack: Pack;
    allProducts: Product[];
    allPacks: Pack[];
    onNavigateHome: () => void;
    onNavigateToProductDetail: (productId: number | string) => void;
    onNavigateToPackDetail: (packId: number | string) => void;
    onNavigateToPacks: () => void;
}

type Tab = 'description' | 'specs' | 'reviews';

// Recursive function to get all products from a pack and its sub-packs
const getPackContents = (pack: Pack, allProducts: Product[], allPacks: Pack[], topLevelPackName?: string): { product: Product, sourcePackName: string }[] => {
    let contents: { product: Product, sourcePackName: string }[] = [];
    const currentPackName = topLevelPackName || pack.name;

    // Add direct products from the current pack
    pack.includedProductIds.forEach(productId => {
        const product = allProducts.find(p => p.id === productId);
        if (product) {
            contents.push({ product, sourcePackName: pack.name });
        }
    });

    // Recursively add products from sub-packs
    if (pack.includedPackIds) {
        pack.includedPackIds.forEach(subPackId => {
            const subPack = allPacks.find(p => p.id === subPackId);
            if (subPack) {
                const subPackContents = getPackContents(subPack, allProducts, allPacks, currentPackName);
                contents = [...contents, ...subPackContents];
            }
        });
    }

    return contents;
};

export const PackDetailPage: React.FC<PackDetailPageProps> = ({ pack, allProducts, allPacks, onNavigateHome, onNavigateToProductDetail, onNavigateToPackDetail, onNavigateToPacks }) => {
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<Tab>('description');
    const { addToCart, openCart } = useCart();
    
    const savings = pack.oldPrice - pack.price;

    const packContents = useMemo(() => getPackContents(pack, allProducts, allPacks), [pack, allProducts, allPacks]);

    const isAvailable = useMemo(() => {
        const productIds = new Set(packContents.map(item => item.product.id));
        for (const productId of productIds) {
            const product = allProducts.find(p => p.id === productId);
            if (!product || product.quantity === 0) {
                return false;
            }
        }
        return true;
    }, [packContents, allProducts]);

    // SEO: Dynamic Title & Meta
    useEffect(() => {
        document.title = `${pack.name} | Pack Promo | Electro Shop`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', `Profitez du ${pack.name} et économisez ${savings.toFixed(0)} DT. Livraison rapide partout en Tunisie.`);
        }
    }, [pack, savings]);

    // SEO: JSON-LD for Pack (Treated as Product)
    const jsonLd = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": pack.name,
        "image": pack.imageUrl,
        "description": pack.description,
        "sku": `PACK-${pack.id}`,
        "offers": {
            "@type": "Offer",
            "url": window.location.href,
            "priceCurrency": "TND",
            "price": pack.price,
            "availability": isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition"
        }
    };

    const handleAddToCart = () => {
        if (!isAvailable) return;
        addToCart(pack, quantity);
        openCart();
    };
    
    const uniqueProductsInPack = useMemo(() => {
        const seen = new Set();
        return packContents.filter(item => {
            const duplicate = seen.has(item.product.id);
            seen.add(item.product.id);
            return !duplicate;
        }).map(item => item.product);
    }, [packContents]);
    
    const isComplexPack = (pack.includedPackIds?.length || 0) > 0;

    const directProducts = useMemo(() => {
        if (!isComplexPack) return [];
        return pack.includedProductIds
            .map(id => allProducts.find(p => p.id === id))
            .filter((p): p is Product => Boolean(p));
    }, [isComplexPack, pack.includedProductIds, allProducts]);

    const subPacksData = useMemo(() => {
        if (!isComplexPack) return [];
        return (pack.includedPackIds || [])
            .map(id => {
                const subPack = allPacks.find(p => p.id === id);
                if (!subPack) return null;
                const subPackProducts = getPackContents(subPack, allProducts, allPacks).map(item => item.product);
                return { subPack, products: subPackProducts };
            })
            .filter((data): data is { subPack: Pack, products: Product[] } => Boolean(data));
    }, [isComplexPack, pack.includedPackIds, allPacks, allProducts]);

    return (
        <div className="bg-gray-100 dark:bg-gray-950">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Les packs', onClick: onNavigateToPacks }, { name: pack.name }]} />

                <main className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* Left: Image */}
                        <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4">
                            <img src={pack.imageUrl} alt={pack.name} className="max-h-[500px] object-contain" />
                        </div>

                        {/* Right: Pack Info & Actions */}
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mt-1">{pack.name}</h1>
                            
                            <div className="mt-6 flex items-baseline gap-3">
                                <p className="text-4xl font-bold text-red-600">{pack.price.toFixed(3).replace('.',',')} DT</p>
                                <p className="text-2xl text-gray-400 line-through">{pack.oldPrice.toFixed(3).replace('.',',')} DT</p>
                            </div>
                            <div className="mt-2">
                                <span className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-md inline-block">ÉCONOMISEZ {savings.toFixed(3).replace('.',',')} DT</span>
                            </div>

                            <div className="mt-4 flex items-center">
                                {isAvailable ? (
                                     <>
                                        <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                        <span className="font-semibold text-green-700 dark:text-green-400">Disponible</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                                        <span className="font-semibold text-red-700 dark:text-red-400">Indisponible (certains articles sont épuisés)</span>
                                    </>
                                )}
                            </div>
                            
                            <div className="mt-8 flex items-center gap-6">
                                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-full">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-full" aria-label="Diminuer la quantité"><MinusIcon className="w-5 h-5" /></button>
                                    <span className="w-12 text-center text-lg font-bold">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-full" aria-label="Augmenter la quantité"><PlusIcon className="w-5 h-5" /></button>
                                </div>
                                <button onClick={handleAddToCart} disabled={!isAvailable} className="flex-1 bg-red-600 text-white font-bold py-3.5 px-6 rounded-full flex items-center justify-center space-x-2 transition-all duration-300 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    <CartIcon className="w-6 h-6" />
                                    <span>{isAvailable ? 'Ajouter le pack' : 'Indisponible'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                <section className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8">
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Contenu Complet du Pack</h2>
                     <div className="space-y-4">
                        {packContents.map(({ product, sourcePackName }, index) => (
                             <a 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); onNavigateToProductDetail(product.id); }}
                                key={`${product.id}-${index}`} 
                                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border dark:border-gray-700"
                            >
                                <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-contain rounded-md bg-white" loading="lazy" />
                                <div className="flex-grow">
                                    <p className="font-semibold text-gray-800 dark:text-gray-100">{product.name}</p>
                                    {sourcePackName !== pack.name && <p className="text-xs text-gray-500 dark:text-gray-400">via le pack: {sourcePackName}</p>}
                                </div>
                                <ChevronRightIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            </a>
                        ))}
                     </div>
                </section>

                <section className="mt-12">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <TabButton title="Description" isActive={activeTab === 'description'} onClick={() => setActiveTab('description')} />
                            <TabButton title="Fiche Technique" isActive={activeTab === 'specs'} onClick={() => setActiveTab('specs')} />
                            <TabButton title="Avis Clients" isActive={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} />
                        </nav>
                    </div>

                    <div className="mt-8">
                        {activeTab === 'description' && <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8 prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"><p>{pack.description || "Aucune description détaillée disponible."}</p></div>}
                        {activeTab === 'specs' && (
                            <div className="space-y-8 animate-fadeIn">
                                {isComplexPack ? (
                                    <>
                                        {directProducts.length > 0 && (
                                            <SpecificationSlider products={directProducts} title="Produits Inclus Directement" />
                                        )}
                                        {subPacksData.map(({ subPack, products }) => (
                                            <SpecificationSlider key={subPack.id} products={products} title={`Contenu du Pack: ${subPack.name}`} />
                                        ))}
                                    </>
                                ) : (
                                    <SpecificationSlider products={uniqueProductsInPack} />
                                )}
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8">
                                <p className="text-gray-600 dark:text-gray-300">Les avis pour les produits individuels sont disponibles sur leurs pages respectives.</p>
                            </div>
                        )}
                    </div>
                </section>
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

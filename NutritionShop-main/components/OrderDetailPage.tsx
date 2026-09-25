
import React, { useState } from 'react';
import type { Order, Product } from '../types';
import { useCart } from './CartContext';
import { 
    ShoppingBagIcon, 
    DeliveryTruckIcon, 
    CheckCircleIcon, 
    CreditCardIcon, 
    LocationIcon, 
    PrinterIcon, 
    UserIcon, 
    ArrowLongLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    SparklesIcon
} from './IconComponents';
import { Invoice } from './Invoice';
import { Logo } from './Logo';

interface OrderDetailPageProps {
    order: Order;
    allProducts: Product[];
    onNavigateHome: () => void;
    onNavigateToOrderHistory: () => void;
    onNavigateToProductDetail: (productId: number) => void;
}

const OrderStatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
    const statusConfig = {
        'Livrée': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', icon: <CheckCircleIcon className="w-4 h-4"/> },
        'Expédiée': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: <DeliveryTruckIcon className="w-4 h-4"/> },
        'En attente': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', icon: <ShoppingBagIcon className="w-4 h-4"/> },
        'Annulée': { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400', icon: <UserIcon className="w-4 h-4"/> }
    };
    
    const config = statusConfig[status] || statusConfig['En attente'];

    return (
        <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${config.bg} ${config.text} border border-transparent shadow-sm`}>
            {config.icon} {status}
        </span>
    );
};

// --- COMPOSANT LIVRE RÉALISTE (Design Clair & Élégant) ---

const RealisticBook: React.FC<{ order: Order, onProductClick: (id: number) => void }> = ({ order, onProductClick }) => {
    // Sheet 0: Cover / Intro
    // Sheet 1...N: Products
    // Sheet Last: Back Cover
    
    const productPagesCount = order.items.length;
    const totalSheets = 1 + productPagesCount + 1; 
    const [flippedIndex, setFlippedIndex] = useState(0); 

    const handleNext = () => {
        if (flippedIndex < totalSheets) setFlippedIndex(prev => prev + 1);
    };

    const handlePrev = () => {
        if (flippedIndex > 0) setFlippedIndex(prev => prev - 1);
    };

    // Calculate Transform for Centering
    const getBookTransform = () => {
        if (flippedIndex === 0) return 'translateX(0%)'; // Center Cover
        if (flippedIndex === totalSheets) return 'translateX(100%)'; // Center Back Cover
        return 'translateX(50%)'; // Center Spread (Spine in middle)
    };

    // Helper pour générer le contenu des pages
    const renderPageContent = (sheetIndex: number, side: 'front' | 'back') => {
        
        // --- COUVERTURE (Sheet 0 - Front) - ELEGANT & MODERN & CLEAR ---
        if (sheetIndex === 0 && side === 'front') {
            return (
                <div className="w-full h-full relative overflow-hidden bg-white flex flex-col border-r border-gray-200 rounded-r-sm">
                    {/* Texture de fond subtile */}
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#ffe4e6 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    
                    {/* Formes organiques floues pour la touche moderne */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-rose-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                    <div className="absolute bottom-20 -left-20 w-72 h-72 bg-pink-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

                    {/* Cadre Fin Élégant */}
                    <div className="absolute inset-6 border border-rose-200/60 z-10 pointer-events-none"></div>

                    {/* Contenu */}
                    <div className="relative z-20 flex flex-col h-full justify-between p-10 text-center">
                        
                        <div className="mt-8 space-y-2">
                            <div className="flex justify-center mb-4">
                                <SparklesIcon className="w-5 h-5 text-rose-400" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Édition Personnelle</p>
                        </div>

                        <div className="space-y-6">
                            <h1 className="font-serif text-5xl text-gray-900 leading-tight">
                                Le <span className="italic text-rose-500">Carnet</span><br/>
                                de Beauté
                            </h1>
                            <div className="flex items-center justify-center gap-4">
                                <span className="h-px w-8 bg-rose-300"></span>
                                <span className="font-serif italic text-2xl text-gray-700">{order.customerName.split(' ')[0]}</span>
                                <span className="h-px w-8 bg-rose-300"></span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="grid grid-cols-2 gap-4 border-t border-rose-100 pt-6">
                                <div className="text-center border-r border-rose-50">
                                    <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Date</p>
                                    <p className="font-mono text-xs text-gray-600">{new Date(order.date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">N° Commande</p>
                                    <p className="font-mono text-xs text-gray-600">#{order.id.slice(-6)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // --- INTRO (Sheet 0 - Back) ---
        if (sheetIndex === 0 && side === 'back') {
            return (
                <div className="w-full h-full bg-[#fdfbf7] p-8 flex flex-col justify-center text-center relative">
                    <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-20"></div> {/* Spine shadow */}
                    
                    <div className="border-b-2 border-rose-100 pb-6 mb-6">
                        <h3 className="font-serif text-2xl text-gray-900 italic">Chère cliente,</h3>
                    </div>
                    
                    <p className="text-gray-600 text-sm leading-loose font-serif italic mb-8 px-4">
                        "La beauté commence au moment où vous décidez d'être vous-même."
                    </p>
                    
                    <p className="text-gray-500 text-xs font-sans leading-relaxed mb-8">
                        Nous avons préparé cette commande avec le plus grand soin. Voici le détail de vos trésors sélectionnés.
                    </p>

                    <div className="bg-white border border-gray-100 p-6 shadow-sm mx-4 relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#fdfbf7] px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Résumé</div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500 uppercase font-bold">Articles</span>
                            <span className="text-lg font-serif">{order.itemCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 uppercase font-bold">Total</span>
                            <span className="text-lg font-serif font-bold text-rose-600">{order.total.toFixed(3)} DT</span>
                        </div>
                    </div>
                </div>
            );
        }

        // --- PRODUITS (Sheet 1 to N) ---
        const productIndex = sheetIndex - 1;
        const product = order.items[productIndex];

        if (product && side === 'front') {
            // RECTO : Grande Image
            return (
                <div 
                    className="w-full h-full relative group cursor-pointer overflow-hidden bg-white" 
                    onClick={() => onProductClick(product.productId)}
                >
                    <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/5 to-transparent z-10"></div>
                    
                    <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover" 
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 text-white">
                        <p className="text-xs font-bold uppercase tracking-widest mb-2 text-rose-300">{product.brand}</p>
                        <h3 className="font-serif text-2xl leading-tight">{product.name}</h3>
                    </div>
                </div>
            );
        }

        if (product && side === 'back') {
            // VERSO : Détails
            return (
                <div className="w-full h-full bg-white p-8 flex flex-col relative" onClick={() => onProductClick(product.productId)}>
                    <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-20"></div> {/* Spine shadow */}
                    
                    <div className="flex-grow flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-[10px] font-bold bg-black text-white px-2 py-1 rounded">N°{productIndex + 1}</span>
                            {product.selectedColor && (
                                <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-1 rounded uppercase">{product.selectedColor}</span>
                            )}
                        </div>

                        <h3 className="font-serif text-2xl text-gray-900 mb-4 cursor-pointer hover:text-rose-600 transition-colors">
                            {product.name}
                        </h3>
                        
                        <p className="text-sm text-gray-500 font-light leading-relaxed mb-8 border-l-2 border-rose-500 pl-4">
                            Un excellent choix. Ce produit fait partie de nos meilleures ventes de la saison.
                        </p>

                        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Quantité</p>
                                <p className="text-xl font-mono text-gray-800">x{product.quantity}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Prix Unitaire</p>
                                <p className="text-xl font-serif font-bold text-gray-900">{product.price.toFixed(3)}</p>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase">Total Ligne</span>
                            <span className="text-2xl font-serif font-bold text-rose-600">{(product.price * product.quantity).toFixed(3)} DT</span>
                        </div>
                    </div>

                    <div className="text-center mt-auto pt-4">
                        <p className="text-[10px] text-gray-300 uppercase tracking-[0.2em]">Cosmetics Shop Collection</p>
                    </div>
                </div>
            );
        }

        // --- DERNIÈRE DE COUVERTURE (Last Sheet) ---
        if (sheetIndex === totalSheets - 1) {
            if (side === 'front') {
                return (
                    <div className="w-full h-full bg-[#f8f8f8] flex items-center justify-center p-8">
                        <div className="text-center opacity-30 grayscale">
                            <Logo />
                        </div>
                    </div>
                );
            }
            if (side === 'back') {
                return (
                    <div className="w-full h-full bg-white text-gray-900 p-10 flex flex-col items-center justify-center text-center relative overflow-hidden border-l border-gray-200 rounded-l-md">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e11d48_1px,transparent_1px)] [background-size:20px_20px]"></div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <SparklesIcon className="w-8 h-8 text-rose-500 animate-pulse" />
                            </div>
                            <h2 className="font-serif text-3xl mb-4 text-gray-900">À Bientôt</h2>
                            <p className="text-gray-500 text-sm mb-8 font-light max-w-xs mx-auto leading-relaxed">
                                Suivez-nous sur les réseaux sociaux pour découvrir nos nouveautés et conseils exclusifs.
                            </p>
                            <div className="w-12 h-px bg-rose-200 mx-auto mb-8"></div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">
                                www.cosmeticsshop.tn
                            </div>
                        </div>
                    </div>
                );
            }
        }

        return <div className="bg-white w-full h-full"></div>;
    };

    return (
        <div className="w-full flex flex-col items-center py-12 lg:py-20 bg-[#E5E7EB] dark:bg-gray-900 rounded-[2rem] relative overflow-hidden shadow-inner">
            <div className="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(#9ca3af_1px,transparent_1px)] [background-size:20px_20px]"></div>
            <div className="relative z-10 w-full max-w-6xl flex justify-center perspective-book h-[600px] md:h-[650px]">
                <div 
                    className="relative w-[300px] md:w-[420px] h-full transform-style-3d transition-transform duration-700 ease-in-out"
                    style={{ transform: getBookTransform() }}
                >
                    {Array.from({ length: totalSheets }).map((_, index) => {
                        let zIndex = totalSheets - index;
                        if (index < flippedIndex) zIndex = index;
                        const isFlipped = index < flippedIndex;
                        return (
                            <div 
                                key={index}
                                className={`absolute inset-0 w-full h-full transform-style-3d transition-all duration-700 ease-in-out origin-left bg-white`}
                                style={{ 
                                    zIndex: zIndex,
                                    transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                                    boxShadow: isFlipped ? '-2px 5px 15px rgba(0,0,0,0.1)' : '2px 5px 15px rgba(0,0,0,0.1)'
                                }}
                            >
                                <div className="absolute inset-0 backface-hidden z-20 bg-white overflow-hidden rounded-r-md">
                                    <div className={`absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/10 to-transparent z-30 pointer-events-none`}></div>
                                    {renderPageContent(index, 'front')}
                                </div>
                                <div className="absolute inset-0 backface-hidden rotate-y-180 z-20 bg-white overflow-hidden rounded-l-md">
                                    <div className={`absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/10 to-transparent z-30 pointer-events-none`}></div>
                                    {renderPageContent(index, 'back')}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="relative z-20 mt-10 flex gap-8 items-center bg-white/90 dark:bg-gray-800/90 backdrop-blur px-8 py-3 rounded-full shadow-xl border border-white/20">
                <button onClick={handlePrev} disabled={flippedIndex === 0} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors group">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-white group-hover:scale-110 transition-transform" />
                </button>
                <div className="flex flex-col items-center min-w-[120px]">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Page</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {flippedIndex === 0 ? "Couverture" : flippedIndex === totalSheets ? "Fin" : `${flippedIndex} / ${totalSheets - 1}`}
                    </span>
                </div>
                <button onClick={handleNext} disabled={flippedIndex === totalSheets} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors group">
                    <ChevronRightIcon className="w-6 h-6 text-gray-800 dark:text-white group-hover:scale-110 transition-transform" />
                </button>
            </div>
            <style>{`
                .perspective-book { perspective: 1500px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .origin-left { transform-origin: left center; }
            `}</style>
        </div>
    );
};

// --- NOUVEAU VERTICAL TIMELINE POUR LA SIDEBAR ---
const TrackingTimelineVertical: React.FC<{ status: Order['status'], date: string }> = ({ status, date }) => {
    const isValidated = true;
    const isShipped = status === 'Expédiée' || status === 'Livrée';
    const isDelivered = status === 'Livrée';

    const steps = [
        { label: 'Commande validée', sub: new Date(date).toLocaleDateString(), active: isValidated, done: isShipped },
        { label: 'Expédiée', sub: isShipped ? 'En transit' : 'En attente', active: isShipped, done: isDelivered },
        { label: 'Livrée', sub: isDelivered ? 'Livré' : '---', active: isDelivered, done: false }
    ];

    if (status === 'Annulée') return (
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-8 mb-8 text-center">
             <div className="inline-block px-6 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-full font-serif font-bold text-sm">
                 Commande Annulée
             </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-8 mb-8 relative overflow-hidden">
            <h3 className="font-serif font-bold text-lg mb-8 flex items-center gap-2 text-gray-900 dark:text-white">
                <DeliveryTruckIcon className="w-5 h-5 text-rose-500" />
                Suivi du colis
            </h3>
            
            <div className="relative pl-2">
                {/* Ligne Verticale Continue */}
                <div className="absolute top-2 bottom-10 left-[11px] w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                
                <div className="space-y-8">
                    {steps.map((step, index) => (
                        <div key={index} className="flex items-start gap-4 relative z-10">
                            {/* Dot */}
                            <div className={`
                                w-6 h-6 rounded-full border-[3px] flex-shrink-0 bg-white dark:bg-gray-800 transition-colors duration-500 z-10
                                ${step.active ? 'border-rose-500' : 'border-gray-300 dark:border-gray-600'}
                            `}>
                                {step.active && <div className="w-full h-full bg-rose-500 rounded-full border-2 border-white dark:border-gray-800"></div>}
                            </div>
                            
                            <div className="-mt-1">
                                <p className={`text-sm font-bold ${step.active ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                    {step.label}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                                    {step.sub}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ order, allProducts, onNavigateHome, onNavigateToOrderHistory, onNavigateToProductDetail }) => {
    const [isInvoiceVisible, setIsInvoiceVisible] = useState(false);
    const { addToCart, openCart } = useCart();

    const SHIPPING_COST = order.total >= 300 ? 0.000 : 7.000;
    const FISCAL_STAMP = 1.000;
    
    return (
        <div className="bg-[#F8F9FA] dark:bg-gray-950 min-h-screen font-sans pb-20">
            {/* Header Sticky */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/80">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <button onClick={onNavigateToOrderHistory} className="flex items-center gap-3 text-gray-500 hover:text-gray-900 transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors">
                            <ArrowLongLeftIcon className="w-5 h-5"/>
                        </div>
                        <span className="text-sm font-bold uppercase tracking-wider hidden sm:inline">Retour à la liste</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-gray-500 hidden sm:block">Commande du {new Date(order.date).toLocaleDateString('fr-FR')}</p>
                        <OrderStatusBadge status={order.status} />
                    </div>
                </div>
            </div>

            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col lg:flex-row gap-10">
                    
                    {/* Colonne Principale (Gauche) : HEADER + LIVRE */}
                    <div className="flex-grow space-y-8 animate-fadeIn">
                        
                        {/* En-tête Commande */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white mb-2">
                                    Commande <span className="text-rose-600">#{order.id}</span>
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Merci pour votre confiance, <span className="font-bold text-gray-900 dark:text-white">{order.customerName}</span>.
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsInvoiceVisible(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-bold hover:border-rose-500 hover:text-rose-500 transition-colors shadow-sm"
                            >
                                <PrinterIcon className="w-4 h-4" /> Facture
                            </button>
                        </div>

                        {/* LIVRE RÉALISTE (Monté ici, sans timeline au dessus) */}
                        <div className="mt-8 mb-12">
                            <div className="flex items-center justify-center mb-6">
                                <span className="bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1 rounded-full flex items-center gap-2">
                                    <SparklesIcon className="w-3 h-3" /> Lookbook de Commande
                                </span>
                            </div>
                            
                            <RealisticBook 
                                order={order} 
                                onProductClick={onNavigateToProductDetail} 
                            />
                        </div>

                    </div>

                    {/* Colonne Latérale (Droite) - Sticky : INFO + TIMELINE + RESUME */}
                    <aside className="w-full lg:w-[400px] flex-shrink-0 space-y-8">
                        
                        {/* 1. Info Client Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                            <h3 className="font-serif font-bold text-lg mb-6 flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-rose-500" /> Informations Client
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-full text-gray-400">
                                        <LocationIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Livraison</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{order.shippingAddress.street}</p>
                                        <p className="text-sm text-gray-500">{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-full text-gray-400">
                                        <CreditCardIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Paiement</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{order.paymentMethod}</p>
                                        <p className="text-sm text-green-600 font-medium">Payé</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Timeline Verticale (Insérée ici) */}
                        <TrackingTimelineVertical status={order.status} date={order.date} />

                        {/* 3. Résumé Financier */}
                        <div className="bg-gray-900 text-white rounded-[2rem] shadow-xl p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl pointer-events-none"></div>
                            
                            <h3 className="font-serif font-bold text-lg mb-6">Résumé</h3>
                            
                            <div className="space-y-3 text-sm border-b border-gray-700 pb-6 mb-6">
                                <div className="flex justify-between text-gray-300">
                                    <span>Sous-total</span>
                                    <span>{(order.total - SHIPPING_COST - FISCAL_STAMP).toFixed(3)} DT</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Livraison</span>
                                    <span>{SHIPPING_COST.toFixed(3)} DT</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Timbre Fiscal</span>
                                    <span>{FISCAL_STAMP.toFixed(3)} DT</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end">
                                <span className="text-lg font-bold">Total TTC</span>
                                <span className="text-3xl font-serif font-bold text-rose-400">{order.total.toFixed(3)} <span className="text-sm font-sans font-light text-gray-400">DT</span></span>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-xs text-gray-400">Besoin d'aide ? <a href="#/contact" className="text-rose-600 hover:underline">Contactez le support</a></p>
                        </div>

                    </aside>
                </div>
            </div>

            {isInvoiceVisible && (
                <Invoice order={order} onClose={() => setIsInvoiceVisible(false)} />
            )}
        </div>
    );
};


import React, { useMemo } from 'react';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';
import { XMarkIcon, PlusIcon, MinusIcon, TrashIcon, ShoppingBagIcon, DeliveryTruckIcon } from './IconComponents';
import type { Product } from '../types';
import { groupCartByShop } from '@/src/utils/multiShopCart';

interface CartItemRowProps {
    item: import('../types').CartItem;
}
interface CartSidebarProps {
    isLoggedIn: boolean;
    onNavigateToCheckout: () => void;
    onNavigateToLogin: () => void;
    allProducts: Product[];
}

const CartItemRow: React.FC<CartItemRowProps> = ({ item }) => {
    const { updateQuantity, removeFromCart } = useCart();
    const { addToast } = useToast();

    const handleRemove = (id: string) => {
        removeFromCart(id);
        addToast("Produit retiré du sac", "info");
    };

    return (
        <li className="flex items-start gap-4 py-4 animate-fadeIn">
            <div className="relative w-16 h-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-100 dark:border-gray-700 bg-white">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
            </div>
            <div className="flex-grow flex flex-col justify-between h-20 py-0.5">
                <div>
                    <div className="flex justify-between items-start">
                        <p className="font-serif font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100 line-clamp-1 leading-snug">{item.name}</p>
                        <button onClick={() => handleRemove(item.id)} className="text-gray-400 hover:text-rose-500 transition-colors ml-2 p-1" aria-label="Supprimer l'article">
                            <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    {item.selectedColor && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Nuance:</span>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.selectedColor}</span>
                        </div>
                    )}
                </div>
                
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-full h-7">
                        <button onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)} className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-rose-600 transition-colors" aria-label="Diminuer">
                            <MinusIcon className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold w-4 text-center">{item.quantity || 1}</span>
                        <button onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)} className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-rose-600 transition-colors" aria-label="Augmenter">
                            <PlusIcon className="w-3 h-3" />
                        </button>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{((item.price || 0) * (item.quantity || 1)).toFixed(3)} DT</p>
                </div>
            </div>
        </li>
    );
};

export const CartSidebar: React.FC<CartSidebarProps> = ({ isLoggedIn, onNavigateToCheckout, onNavigateToLogin, allProducts }) => {
    const { isCartOpen, closeCart, cartItems, cartTotal, itemCount, addToCart } = useCart();
    const { addToast } = useToast();
    
    const shopGroups = useMemo(() => groupCartByShop(cartItems), [cartItems]);
    const isMultiShop = shopGroups.length > 1;

    const handleCheckout = () => {
        closeCart();
        if (isLoggedIn) {
            onNavigateToCheckout();
        } else {
            addToast("Veuillez vous connecter pour valider votre panier.", "info");
            onNavigateToLogin();
        }
    };

    const suggestedProducts = useMemo(() => {
        if (cartItems.length === 0) return [];
        const cartProductIds = new Set(cartItems.map(item => {
            const parts = item.id.split('-');
            return parts[0] === 'product' ? parseInt(parts[1]) : -1; 
        }));

        return allProducts
            .filter(p => !cartProductIds.has(p.id) && p.price < 100 && p.quantity > 0)
            .sort(() => 0.5 - Math.random()) 
            .slice(0, 2);
    }, [cartItems, allProducts]);

    const handleAddSuggested = (product: Product) => {
        addToCart(product);
        addToast(`${product.name} ajouté au sac !`, "success");
    };

    const FREE_SHIPPING_THRESHOLD = 300;
    const amountLeftForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
    const progressPercentage = Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100);

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={closeCart}
                aria-hidden="true"
            ></div>
            
            <div 
                className={`fixed top-0 right-0 h-full w-full max-w-[460px] bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="cart-heading"
            >
                {/* Header */}
                <header className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                    <h2 id="cart-heading" className="text-lg font-serif font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Mon Sac <span className="text-xs font-sans font-normal text-gray-500">({itemCount} articles)</span>
                    </h2>
                    <button onClick={closeCart} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="Fermer le sac">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </header>

                {/* Multi-Shop Banner */}
                {isMultiShop && (
                    <div className="mx-6 mt-3 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                            <span className="font-serif font-bold tracking-tight">Panier Réseau MultiShop ({shopGroups.length} filiales)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {shopGroups.map(g => (
                                <span key={g.meta.id} className="text-sm">{g.meta.icon}</span>
                            ))}
                        </div>
                    </div>
                )}

                {cartItems.length > 0 ? (
                    <>
                        {/* Free Shipping Progress */}
                        <div className="px-6 py-3 bg-rose-50/50 dark:bg-gray-800/50 border-b border-rose-100 dark:border-gray-800">
                            <div className="flex items-center gap-2 mb-1.5 text-xs">
                                <DeliveryTruckIcon className={`w-4 h-4 ${amountLeftForFreeShipping === 0 ? 'text-green-500' : 'text-rose-500'}`} />
                                {amountLeftForFreeShipping > 0 ? (
                                    <span className="text-gray-700 dark:text-gray-300">
                                        Plus que <span className="font-bold text-rose-600">{amountLeftForFreeShipping.toFixed(3)} DT</span> pour la <span className="font-semibold">livraison offerte</span> !
                                    </span>
                                ) : (
                                    <span className="text-green-600 font-bold">Félicitations ! Vous avez la livraison offerte.</span>
                                )}
                            </div>
                            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${amountLeftForFreeShipping === 0 ? 'bg-green-500' : 'bg-rose-500'}`}
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Cart Items Grouped by Store */}
                        <div className="flex-grow overflow-y-auto px-5 py-3 space-y-4 custom-scrollbar">
                            {shopGroups.map(group => (
                                <div key={group.meta.id} className="rounded-xl border border-rose-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 overflow-hidden shadow-2xs">
                                    <div className="px-4 py-2 bg-rose-50/60 dark:bg-gray-800 border-b border-rose-100 dark:border-gray-700/60 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span>{group.meta.icon}</span>
                                            <span className="text-xs font-serif font-bold text-gray-900 dark:text-white">{group.meta.name}</span>
                                            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-300">
                                                {group.meta.badge}
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{group.subtotal.toFixed(3)} DT</span>
                                    </div>

                                    <ul className="divide-y divide-gray-100 dark:divide-gray-800 px-4">
                                        {group.items.map(item => (
                                            <CartItemRow key={item.id} item={item} />
                                        ))}
                                    </ul>
                                </div>
                            ))}

                            {/* Cross-sell */}
                            {suggestedProducts.length > 0 && (
                                <div className="mt-4 mb-2 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
                                    <h3 className="font-serif font-bold text-xs text-gray-900 dark:text-white mb-2.5">Complétez votre rituel beauté</h3>
                                    <div className="space-y-2">
                                        {suggestedProducts.map(product => (
                                            <div key={product.id} className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors">
                                                <img src={product.imageUrl} alt={product.name} className="w-10 h-10 object-contain rounded bg-white" />
                                                <div className="flex-grow min-w-0">
                                                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-200 truncate">{product.name}</p>
                                                    <p className="text-xs text-rose-600 font-bold">{product.price.toFixed(0)} DT</p>
                                                </div>
                                                <button onClick={() => handleAddSuggested(product)} className="text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-rose-500 hover:text-rose-600 text-gray-600 dark:text-gray-300 font-semibold py-1 px-2.5 rounded-full transition-colors shadow-2xs">
                                                    + Ajouter
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Footer */}
                        <footer className="p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg z-10">
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Total Panier ({itemCount} articles)</span>
                                <span className="font-serif font-bold text-xl text-gray-900 dark:text-white">{cartTotal.toFixed(3)} <span className="text-xs font-sans font-normal text-gray-500">DT</span></span>
                            </div>
                            <button 
                                onClick={handleCheckout}
                                className="w-full bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs py-3.5 rounded-full hover:bg-rose-600 dark:hover:bg-rose-500 dark:hover:text-white transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                            >
                                {isLoggedIn ? 'Valider mon sac MultiShop' : 'Se connecter pour commander'}
                            </button>
                        </footer>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 flex-grow">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <ShoppingBagIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                        </div>
                        <h3 className="text-lg font-serif font-bold text-gray-900 dark:text-white mb-2">Votre sac est vide</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs text-xs leading-relaxed">
                            Découvrez les soins d'exception et parfums dans toutes nos filiales MultiShop.
                        </p>
                        <button onClick={closeCart} className="bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs py-3 px-8 rounded-full hover:bg-rose-600 dark:hover:bg-rose-500 dark:hover:text-white transition-all duration-300 cursor-pointer">
                            Continuer mes achats
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

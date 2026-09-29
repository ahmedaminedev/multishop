
import React, { useMemo } from 'react';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';
import { XMarkIcon, PlusIcon, MinusIcon, TrashIcon, CartIcon } from './IconComponents';
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
        addToast("Produit retiré du panier", "info");
    };

    return (
        <li className="flex items-start gap-3.5 py-3">
            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-contain rounded-lg flex-shrink-0 border border-gray-200 dark:border-gray-700 bg-white p-1" />
            <div className="flex-grow min-w-0">
                <p className="font-semibold text-xs sm:text-sm text-gray-800 dark:text-gray-100 line-clamp-1 leading-tight">{item.name}</p>
                <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-bold my-0.5">{((item.price || 0) * (item.quantity || 1)).toFixed(3)} DT</p>
                <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-md w-fit mt-1.5">
                    <button onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)} className="px-2 py-0.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-md" aria-label="Diminuer la quantité">
                        <MinusIcon className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2.5 text-xs font-bold">{item.quantity || 1}</span>
                    <button onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)} className="px-2 py-0.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-md" aria-label="Augmenter la quantité">
                        <PlusIcon className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
            <button onClick={() => handleRemove(item.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors" aria-label="Supprimer l'article">
                <TrashIcon className="w-4 h-4" />
            </button>
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
        onNavigateToCheckout();
    };

    const suggestedProducts = useMemo(() => {
        if (cartItems.length === 0) return [];
        const cartProductIds = new Set(cartItems.map(item => {
            const parts = item.id.split('-');
            return parts[0] === 'product' ? parseInt(parts[1]) : -1; 
        }));

        return allProducts
            .filter(p => !cartProductIds.has(p.id) && p.price < 300 && p.quantity > 0)
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);
    }, [cartItems, allProducts]);

    const handleAddSuggested = (product: Product) => {
        addToCart(product);
        addToast(`${product.name} ajouté !`, "success");
    };

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={closeCart}
                aria-hidden="true"
            ></div>
            
            <div 
                className={`fixed top-0 right-0 h-full w-full max-w-[460px] bg-gray-50 dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-500 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="cart-heading"
            >
                <header className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
                    <h2 id="cart-heading" className="text-lg font-bold text-gray-800 dark:text-white">
                        Votre Panier MultiShop ({itemCount})
                    </h2>
                    <button onClick={closeCart} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white transition-colors" aria-label="Fermer le panier">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </header>

                {/* Multi-Shop Banner */}
                {isMultiShop && (
                    <div className="mx-4 mt-3 px-3.5 py-2 rounded-lg bg-blue-950 text-white flex items-center justify-between text-xs border border-blue-800">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                            <span className="font-semibold">Panier Réseau MultiShop ({shopGroups.length} filiales)</span>
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
                        <div className="flex-grow overflow-y-auto px-4 py-3 space-y-4">
                            {shopGroups.map(group => (
                                <div key={group.meta.id} className="bg-white dark:bg-gray-700/60 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden shadow-2xs">
                                    <div className="px-3.5 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span>{group.meta.icon}</span>
                                            <span className="text-xs font-bold text-gray-900 dark:text-white">{group.meta.name}</span>
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                                {group.meta.badge}
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{group.subtotal.toFixed(3)} DT</span>
                                    </div>
                                    <ul className="divide-y divide-gray-100 dark:divide-gray-600 px-3.5">
                                        {group.items.map(item => (
                                            <CartItemRow key={item.id} item={item} />
                                        ))}
                                    </ul>
                                </div>
                            ))}

                            {suggestedProducts.length > 0 && (
                                <div className="mt-4 mb-2">
                                    <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">Accessoires recommandés</h3>
                                    <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                                        {suggestedProducts.map(product => {
                                            const displayImage = (product.images && product.images.length > 0) ? product.images[0] : product.imageUrl;
                                            return (
                                                <div key={product.id} className="flex-shrink-0 w-28 bg-white dark:bg-gray-700 rounded-lg p-2 border border-gray-200 dark:border-gray-600 flex flex-col">
                                                    <img src={displayImage} alt={product.name} className="w-full h-16 object-contain mb-1" />
                                                    <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 line-clamp-1 mb-0.5">{product.name}</p>
                                                    <p className="text-[11px] font-bold text-red-600 mb-1.5">{product.price.toFixed(0)} DT</p>
                                                    <button onClick={() => handleAddSuggested(product)} className="mt-auto text-[10px] bg-gray-100 dark:bg-gray-600 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-800 dark:text-gray-200 hover:text-red-600 font-bold py-1 px-1.5 rounded transition-colors">
                                                        + Ajouter
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <footer className="p-4 sm:p-5 border-t border-gray-200 dark:border-gray-700 space-y-3 flex-shrink-0 bg-white dark:bg-gray-800">
                            <div className="flex justify-between font-bold text-base text-gray-800 dark:text-gray-100">
                                <span>Sous-total global</span>
                                <span>{cartTotal.toFixed(3)} DT</span>
                            </div>
                            <button 
                                onClick={handleCheckout}
                                className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 cursor-pointer shadow-md text-sm"
                            >
                                Valider mon panier MultiShop ({itemCount})
                            </button>
                            <button onClick={closeCart} className="w-full text-center text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors">
                                Continuer mes achats
                            </button>
                        </footer>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-5 flex-grow">
                        <CartIcon className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Votre panier est vide</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-xs text-xs">Parcourez nos rayons High-Tech et nos autres filiales MultiShop !</p>
                        <button onClick={closeCart} className="mt-5 bg-red-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-red-700 transition-colors duration-300 text-xs cursor-pointer">
                            Commencer mes achats
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};


import React, { useMemo } from 'react';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';
import { XMarkIcon, PlusIcon, MinusIcon, TrashIcon, ShoppingBagIcon, DeliveryTruckIcon } from './IconComponents';
import type { Product } from '../types';

interface CartItemRowProps {
    item: import('../types').CartItem;
}
interface CartSidebarProps {
    isLoggedIn: boolean;
    onNavigateToCheckout: () => void;
    onNavigateToLogin: () => void;
    allProducts: Product[]; // We need products for cross-selling
}

const CartItemRow: React.FC<CartItemRowProps> = ({ item }) => {
    const { updateQuantity, removeFromCart } = useCart();
    const { addToast } = useToast();

    const handleRemove = (id: string) => {
        removeFromCart(id);
        addToast("Produit retiré du sac", "info");
    };

    return (
        <li className="flex items-start gap-4 py-5 animate-fadeIn">
            <div className="relative w-20 h-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-100 dark:border-gray-700 bg-white">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
            </div>
            <div className="flex-grow flex flex-col justify-between h-24 py-1">
                <div>
                    <div className="flex justify-between items-start">
                        <p className="font-serif font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">{item.name}</p>
                        <button onClick={() => handleRemove(item.id)} className="text-gray-400 hover:text-rose-500 transition-colors ml-2 p-1" aria-label="Supprimer l'article">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="mt-1 flex flex-col gap-0.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Quantité: {item.quantity}</p>
                        {item.selectedColor && (
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Nuance:</span>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.selectedColor}</span>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-full h-8">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-rose-600 transition-colors" aria-label="Diminuer">
                            <MinusIcon className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-rose-600 transition-colors" aria-label="Augmenter">
                            <PlusIcon className="w-3 h-3" />
                        </button>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{(item.price * item.quantity).toFixed(3)} DT</p>
                </div>
            </div>
        </li>
    );
};

export const CartSidebar: React.FC<CartSidebarProps> = ({ isLoggedIn, onNavigateToCheckout, onNavigateToLogin, allProducts }) => {
    const { isCartOpen, closeCart, cartItems, cartTotal, itemCount, addToCart } = useCart();
    const { addToast } = useToast();
    
    // Gère la logique de validation
    const handleCheckout = () => {
        closeCart();
        if (isLoggedIn) {
            onNavigateToCheckout();
        } else {
            addToast("Veuillez vous connecter pour valider votre panier.", "info");
            onNavigateToLogin();
        }
    };

    // Cross-selling logic: Products under 100DT not in cart
    const suggestedProducts = useMemo(() => {
        if (cartItems.length === 0) return [];
        const cartProductIds = new Set(cartItems.map(item => {
            const parts = item.id.split('-');
            return parts[0] === 'product' ? parseInt(parts[1]) : -1; 
        }));

        return allProducts
            .filter(p => !cartProductIds.has(p.id) && p.price < 100 && p.quantity > 0)
            .sort(() => 0.5 - Math.random()) 
            .slice(0, 3);
    }, [cartItems, allProducts]);

    const handleAddSuggested = (product: Product) => {
        addToCart(product);
        addToast(`${product.name} ajouté au sac !`, "success");
    }

    // Logic for Free Shipping Progress
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
                className={`fixed top-0 right-0 h-full w-full max-w-[450px] bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="cart-heading"
            >
                {/* Header */}
                <header className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                    <h2 id="cart-heading" className="text-xl font-serif font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Mon Sac <span className="text-sm font-sans font-normal text-gray-500">({itemCount} articles)</span>
                    </h2>
                    <button onClick={closeCart} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="Fermer le sac">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>

                {cartItems.length > 0 ? (
                    <>
                        {/* Free Shipping Progress */}
                        <div className="px-6 py-4 bg-rose-50/50 dark:bg-gray-800/50 border-b border-rose-100 dark:border-gray-800">
                            <div className="flex items-center gap-2 mb-2 text-sm">
                                <DeliveryTruckIcon className={`w-5 h-5 ${amountLeftForFreeShipping === 0 ? 'text-green-500' : 'text-rose-500'}`} />
                                {amountLeftForFreeShipping > 0 ? (
                                    <span className="text-gray-700 dark:text-gray-300">
                                        Plus que <span className="font-bold text-rose-600">{amountLeftForFreeShipping.toFixed(3)} DT</span> pour la <span className="font-semibold">livraison gratuite</span> !
                                    </span>
                                ) : (
                                    <span className="text-green-600 font-bold">Félicitations ! Vous avez la livraison gratuite.</span>
                                )}
                            </div>
                            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${amountLeftForFreeShipping === 0 ? 'bg-green-500' : 'bg-rose-500'}`}
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-grow overflow-y-auto px-6 py-2 custom-scrollbar">
                            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                                {cartItems.map(item => (
                                    <CartItemRow key={item.id} item={item} />
                                ))}
                            </ul>

                            {/* Cross-sell */}
                            {suggestedProducts.length > 0 && (
                                <div className="mt-8 mb-6">
                                    <h3 className="font-serif font-bold text-sm text-gray-900 dark:text-white mb-4">Complétez votre look</h3>
                                    <div className="space-y-3">
                                        {suggestedProducts.map(product => (
                                            <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                                                <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-contain rounded bg-white" />
                                                <div className="flex-grow min-w-0">
                                                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-200 truncate">{product.name}</p>
                                                    <p className="text-xs text-rose-600 font-bold">{product.price.toFixed(0)} DT</p>
                                                </div>
                                                <button onClick={() => handleAddSuggested(product)} className="text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-rose-500 hover:text-rose-600 text-gray-600 dark:text-gray-300 font-semibold py-1.5 px-3 rounded-full transition-colors shadow-sm">
                                                    Ajouter
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Footer */}
                        <footer className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-10">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Sous-total</span>
                                <span className="font-serif font-bold text-2xl text-gray-900 dark:text-white">{cartTotal.toFixed(3)} <span className="text-sm font-sans font-normal text-gray-500">DT</span></span>
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 text-center">Taxes et frais de livraison calculés à l'étape suivante.</p>
                            <button 
                                onClick={handleCheckout}
                                className="w-full bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-sm py-4 rounded-full hover:bg-rose-600 dark:hover:bg-rose-500 dark:hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                {isLoggedIn ? 'Valider mon sac' : 'Se connecter pour commander'}
                            </button>
                        </footer>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 flex-grow">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                            <ShoppingBagIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">Votre sac est vide</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs text-sm leading-relaxed">
                            Il semblerait que vous n'ayez pas encore craqué pour nos produits. Découvrez nos nouveautés !
                        </p>
                        <button onClick={closeCart} className="bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs py-4 px-10 rounded-full hover:bg-rose-600 dark:hover:bg-rose-500 dark:hover:text-white transition-all duration-300">
                            Continuer mes achats
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

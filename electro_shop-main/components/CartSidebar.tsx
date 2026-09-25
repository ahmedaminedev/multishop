
import React, { useMemo } from 'react';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';
import { XMarkIcon, PlusIcon, MinusIcon, TrashIcon, CartIcon } from './IconComponents';
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
        addToast("Produit retiré du panier", "info");
    };

    return (
        <li className="flex items-start gap-4 py-4">
            <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-md flex-shrink-0 border border-gray-100 dark:border-gray-700" />
            <div className="flex-grow">
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 line-clamp-2 leading-tight">{item.name}</p>
                <p className="text-sm text-red-600 dark:text-red-500 font-bold my-1">{item.price.toFixed(3).replace('.', ',')} DT</p>
                <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-md w-fit mt-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-md" aria-label="Diminuer la quantité">
                        <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="px-3 text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-md" aria-label="Augmenter la quantité">
                        <PlusIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <button onClick={() => handleRemove(item.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors" aria-label="Supprimer l'article">
                <TrashIcon className="w-5 h-5" />
            </button>
        </li>
    );
};

export const CartSidebar: React.FC<CartSidebarProps> = ({ isLoggedIn, onNavigateToCheckout, onNavigateToLogin, allProducts }) => {
    const { isCartOpen, closeCart, cartItems, cartTotal, itemCount, addToCart } = useCart();
    const { addToast } = useToast();
    
    const handleCheckout = () => {
        closeCart();
        // We delegate the logic to the parent (App.tsx) which handles the redirect pending state
        onNavigateToCheckout();
    };

    // Cross-selling logic: Products under 300DT not in cart
    const suggestedProducts = useMemo(() => {
        if (cartItems.length === 0) return [];
        const cartProductIds = new Set(cartItems.map(item => {
            // Handle both product-X and pack-X IDs, though cross-selling mainly targets products
            const parts = item.id.split('-');
            return parts[0] === 'product' ? parseInt(parts[1]) : -1; 
        }));

        return allProducts
            .filter(p => !cartProductIds.has(p.id) && p.price < 300 && p.quantity > 0)
            .sort(() => 0.5 - Math.random()) // Shuffle
            .slice(0, 3);
    }, [cartItems, allProducts]);

    const handleAddSuggested = (product: Product) => {
        addToCart(product);
        addToast(`${product.name} ajouté !`, "success");
    }

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={closeCart}
                aria-hidden="true"
            ></div>
            
            <div 
                className={`fixed top-0 right-0 h-full w-full max-w-lg bg-gray-50 dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-500 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="cart-heading"
            >
                <header className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
                    <h2 id="cart-heading" className="text-xl font-bold text-gray-800 dark:text-white">Votre Panier ({itemCount})</h2>
                    <button onClick={closeCart} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white transition-colors" aria-label="Fermer le panier">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>

                {cartItems.length > 0 ? (
                    <>
                        <div className="flex-grow overflow-y-auto px-5">
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {cartItems.map(item => (
                                    <CartItemRow key={item.id} item={item} />
                                ))}
                            </ul>

                            {suggestedProducts.length > 0 && (
                                <div className="mt-6 mb-4">
                                    <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">Vous aimerez aussi</h3>
                                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                        {suggestedProducts.map(product => {
                                            const displayImage = (product.images && product.images.length > 0) ? product.images[0] : product.imageUrl;
                                            return (
                                                <div key={product.id} className="flex-shrink-0 w-32 bg-white dark:bg-gray-700 rounded-lg p-2 border border-gray-200 dark:border-gray-600 flex flex-col">
                                                    <img src={displayImage} alt={product.name} className="w-full h-24 object-contain mb-2" />
                                                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 mb-1">{product.name}</p>
                                                    <p className="text-xs font-bold text-red-600 mb-2">{product.price.toFixed(0)} DT</p>
                                                    <button onClick={() => handleAddSuggested(product)} className="mt-auto text-xs bg-gray-100 dark:bg-gray-600 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-800 dark:text-gray-200 hover:text-red-600 font-semibold py-1 px-2 rounded transition-colors">
                                                        Ajouter
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <footer className="p-5 border-t border-gray-200 dark:border-gray-700 space-y-4 flex-shrink-0 bg-white dark:bg-gray-800">
                            <div className="flex justify-between font-bold text-lg text-gray-800 dark:text-gray-100">
                                <span>Sous-total</span>
                                <span>{cartTotal.toFixed(3).replace('.', ',')} DT</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Taxes et frais de livraison calculés à l'étape suivante.</p>
                            <button 
                                onClick={handleCheckout}
                                className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300"
                            >
                                Valider mon panier
                            </button>
                            <button onClick={closeCart} className="w-full text-center text-sm font-semibold text-red-600 hover:underline">
                                Continuer mes achats
                            </button>
                        </footer>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-5 flex-grow">
                        <CartIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Votre panier est vide</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs">On dirait que vous n'avez encore rien ajouté. Parcourez nos produits pour trouver votre bonheur !</p>
                        <button onClick={closeCart} className="mt-6 bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-colors duration-300">
                            Commencer mes achats
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

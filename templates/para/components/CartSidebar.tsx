
import React, { useMemo } from 'react';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';
import { 
    XMarkIcon, 
    PlusIcon, 
    MinusIcon, 
    TrashIcon, 
    CartIcon, 
    CheckCircleIcon, 
    LockIcon
} from './IconComponents';
import { groupCartByShop } from '@/src/utils/multiShopCart';

export const CartSidebar: React.FC<{ isLoggedIn: boolean; onNavigateToCheckout: () => void; onNavigateToLogin: () => void; }> = ({ isLoggedIn, onNavigateToCheckout, onNavigateToLogin }) => {
    const { isCartOpen, closeCart, cartItems, cartTotal, itemCount, updateQuantity, removeFromCart } = useCart();
    const { addToast } = useToast();
    
    const FREE_SHIPPING_LIMIT = 120;
    const progress = Math.min(100, (cartTotal / FREE_SHIPPING_LIMIT) * 100);
    const remaining = Math.max(0, FREE_SHIPPING_LIMIT - cartTotal);

    const shopGroups = useMemo(() => groupCartByShop(cartItems), [cartItems]);
    const isMultiShop = shopGroups.length > 1;

    const handleCheckout = () => {
        closeCart();
        if (isLoggedIn) onNavigateToCheckout();
        else {
            addToast("Identification requise pour commander.", "info");
            onNavigateToLogin();
        }
    };

    return (
        <>
            {/* Overlay */}
            <div 
                className={`fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-[100] transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                onClick={closeCart}
            ></div>

            {/* Sidebar Design Purifié & Multi-Boutiques */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-[460px] bg-white dark:bg-slate-900 z-[101] transform transition-transform duration-500 ease-out flex flex-col shadow-2xl border-l border-slate-100 dark:border-slate-800 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* Header Minimaliste Pro */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-serif font-black text-slate-800 dark:text-white uppercase tracking-tight">
                            Mon <span className="text-brand-primary italic">Panier</span>
                        </h2>
                        <span className="bg-brand-primary/10 text-brand-primary text-xs font-black px-2.5 py-0.5 rounded-full">
                            {itemCount} {itemCount > 1 ? 'articles' : 'article'}
                        </span>
                    </div>
                    <button onClick={closeCart} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Multi-Shop Status Banner if customer selected items across several stores */}
                {isMultiShop && (
                    <div className="mx-5 mt-3.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-xs font-bold tracking-tight">Panier Global Réseau MultiShop</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-blue-200">
                            {shopGroups.length} filiales
                        </div>
                    </div>
                )}

                {/* Barre de Progression Livraison */}
                <div className="px-6 py-3 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/60 mt-2">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Livraison Express</span>
                        <span className="text-[10px] font-bold text-brand-primary uppercase">
                            {remaining > 0 ? `${remaining.toFixed(3)} DT restants pour la gratuité` : 'LIVRAISON OFFERTE'}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-primary transition-all duration-700" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                {/* Liste des Produits groupés par Boutique */}
                <div className="flex-grow overflow-y-auto px-5 py-3 space-y-5 custom-cart-scrollbar">
                    {cartItems.length > 0 ? (
                        shopGroups.map(group => (
                            <div 
                                key={group.meta.id} 
                                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs overflow-hidden"
                            >
                                {/* En-tête de la Boutique */}
                                <div className={`px-4 py-2.5 flex items-center justify-between border-b ${group.meta.borderColor} ${group.meta.bgColor}`}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-base">{group.meta.icon}</span>
                                        <span className={`text-xs font-black tracking-tight ${group.meta.textColor}`}>
                                            {group.meta.name}
                                        </span>
                                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-2xs">
                                            {group.meta.badge}
                                        </span>
                                    </div>
                                    <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                                        {group.subtotal.toFixed(3)} DT
                                    </span>
                                </div>

                                {/* Articles de cette boutique */}
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {group.items.map(item => (
                                        <div key={item.id} className="p-3.5 flex gap-3.5 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-xl p-1.5 flex-shrink-0 border border-slate-100 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                                            </div>

                                            <div className="flex-grow min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase leading-snug line-clamp-1">
                                                        {item.name}
                                                    </h3>
                                                    <button 
                                                        onClick={() => removeFromCart(item.id)} 
                                                        className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                                                        title="Supprimer"
                                                    >
                                                        <TrashIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                {item.selectedColor && (
                                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                        Option: <span className="font-semibold text-slate-600 dark:text-slate-300">{item.selectedColor}</span>
                                                    </p>
                                                )}

                                                <div className="flex justify-between items-center mt-2.5">
                                                    {/* Quantités */}
                                                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/60 dark:border-slate-700">
                                                        <button 
                                                            onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)} 
                                                            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-brand-primary"
                                                        >
                                                            <MinusIcon className="w-3 h-3"/>
                                                        </button>
                                                        <span className="w-6 text-center text-xs font-black text-slate-800 dark:text-white">
                                                            {item.quantity || 1}
                                                        </span>
                                                        <button 
                                                            onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)} 
                                                            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-brand-primary"
                                                        >
                                                            <PlusIcon className="w-3 h-3"/>
                                                        </button>
                                                    </div>

                                                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                                                        {((item.price || 0) * (item.quantity || 1)).toFixed(3)} DT
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-24">
                            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-300">
                                <CartIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Votre panier est vide</h3>
                            <p className="text-xs text-slate-400 font-medium max-w-xs">
                                Parcourez nos boutiques MultiShop et sélectionnez vos produits préférés.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Récapitulatif MultiShop */}
                {cartItems.length > 0 && (
                    <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
                        {/* Récapitulatif par boutique si commande multi-filiales */}
                        {isMultiShop && (
                            <div className="mb-3.5 pb-3 border-b border-slate-100 dark:border-slate-800 space-y-1">
                                {shopGroups.map(g => (
                                    <div key={g.meta.id} className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <span>{g.meta.icon}</span>
                                            <span>{g.meta.name} ({g.itemCount})</span>
                                        </span>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{g.subtotal.toFixed(3)} DT</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="space-y-1.5 mb-4">
                            <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                                <span>Sous-total articles</span>
                                <span className="font-bold text-slate-800 dark:text-white">{cartTotal.toFixed(3)} DT</span>
                            </div>
                            <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                                <span>Frais de livraison</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                    {remaining <= 0 ? 'Gratuit' : '7.000 DT'}
                                </span>
                            </div>
                            <div className="flex justify-between items-baseline pt-2 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-sm font-black uppercase text-slate-800 dark:text-white tracking-tight">
                                    Total Global
                                </span>
                                <span className="text-2xl font-serif font-black text-brand-primary tracking-tight">
                                    {(cartTotal + (remaining <= 0 ? 0 : 7)).toFixed(3)} <span className="text-xs font-sans font-bold">DT</span>
                                </span>
                            </div>
                        </div>

                        <button 
                            onClick={handleCheckout}
                            className="w-full py-3.5 px-5 bg-brand-primary hover:bg-brand-primaryHover text-white rounded-xl font-black text-sm tracking-wide transition-all shadow-md shadow-brand-primary/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <LockIcon className="w-4 h-4" />
                            <span>Commander ({itemCount} {itemCount > 1 ? 'articles' : 'article'})</span>
                        </button>
                        
                        <div className="mt-3 flex items-center justify-center gap-2 opacity-40">
                            <LockIcon className="w-3 h-3 text-slate-500" />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Paiement 100% Sécurisé & Certifié</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Styles pour le scrollbar du panier */}
            <style>{`
                .custom-cart-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-cart-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-cart-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-cart-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </>
    );
};

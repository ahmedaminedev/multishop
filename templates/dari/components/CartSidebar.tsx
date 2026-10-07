import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Home } from 'lucide-react';
import { useCart } from './CartContext';

interface CartSidebarProps {
  onProceedToCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ onProceedToCheckout }) => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  if (!isCartOpen) return null;

  const freeShippingThreshold = 200;
  const missingForFreeShipping = Math.max(0, freeShippingThreshold - totalPrice);

  return (
    <div className="fixed inset-0 z-[250] overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between text-slate-900 dark:text-white border-l border-slate-200 dark:border-slate-800 animate-slideLeft">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base sm:text-lg font-black font-serif">
                Mon Panier Mobilier ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free delivery info */}
          <div className="px-5 sm:px-6 py-2.5 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/40 text-xs">
            {missingForFreeShipping === 0 ? (
              <p className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <span>✨</span>
                <span>Livraison soignée et montage offerts sur votre commande !</span>
              </p>
            ) : (
              <p className="font-medium text-indigo-900 dark:text-indigo-300">
                Plus que <strong className="font-bold">{missingForFreeShipping} DT</strong> pour la livraison gratuite !
              </p>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mx-auto text-2xl">
                  🛋️
                </div>
                <h3 className="font-bold text-base">Votre panier déco est vide</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Découvrez nos canapés, luminaires et objets de décoration pour sublimer votre intérieur.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase cursor-pointer"
                >
                  Découvrir les collections
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl bg-white dark:bg-slate-900 p-0.5 border border-slate-200/60 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-bold text-xs sm:text-sm line-clamp-1 font-serif">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">
                        {item.product.brand}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        {(item.product.price * item.quantity).toLocaleString('fr-FR')} DT
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Sous-total articles</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{totalPrice.toLocaleString('fr-FR')} DT</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Livraison sécurisée</span>
                  <span className="font-bold text-emerald-600">
                    {missingForFreeShipping === 0 ? 'Offerte' : '15 DT'}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Total TTC</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {(totalPrice + (missingForFreeShipping === 0 ? 0 : 15)).toLocaleString('fr-FR')} DT
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <span>Passer la commande</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

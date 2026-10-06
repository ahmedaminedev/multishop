import React from 'react';
import { MultiShopClientAuth } from './MultiShopClientAuth';
import { FilialeId } from '../models/ProductFiliale';

interface UnifiedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onLoginSuccess: (user: any, token: string) => void;
  onLogout: () => void;
  currentShop?: FilialeId;
  onSwitchShop?: (shopId: FilialeId) => void;
}

export const UnifiedAuthModal: React.FC<UnifiedAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  currentShop = 'nutrition',
  onSwitchShop
}) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // If user is already logged in, show user account profile popup
  if (currentUser) {
    return (
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Profil utilisateur MultiShop"
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-800 relative border border-slate-100">
          <button
            onClick={onClose}
            type="button"
            aria-label="Fermer la fenêtre"
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold p-1 leading-none cursor-pointer"
          >
            ✕
          </button>

          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
              {currentUser.firstName?.[0] || 'U'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {currentUser.firstName} {currentUser.lastName}
              </h3>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
              <div className="mt-2">
                <span className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  currentUser.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Compte {currentUser.role === 'ADMIN' ? 'Super Administrateur' : 'Client MultiShop'}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Votre session est synchronisée et active sur l'ensemble du réseau (Fitness Shop & YoupiShop).
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-2.5">
              {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.location.search = '?mode=backoffice';
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-xs"
                >
                  Accéder au Backoffice Général
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Continuer mes achats
              </button>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Exact Client Authentication Screen
  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
      <MultiShopClientAuth
        initialMode="login"
        onClose={onClose}
        onNavigateHome={onClose}
        currentUser={currentUser}
        onLoginSuccess={(user, token) => {
          onLoginSuccess(user, token);
          onClose();
        }}
        onLogout={onLogout}
        currentShop={currentShop}
        onSwitchShop={onSwitchShop}
      />
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Clock, ShieldAlert, LogOut, RefreshCw, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { centralApiRequest } from '../services/apiClient';

interface SessionExpiryModalProps {
  currentUser: any;
  onLogout: () => void;
  onGoToLogin?: () => void;
}

export const SessionExpiryModal: React.FC<SessionExpiryModalProps> = ({
  currentUser,
  onLogout,
  onGoToLogin
}) => {
  // Modal visibility states
  const [showWarning, setShowWarning] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [isProlonging, setIsProlonging] = useState(false);
  const [prolongSuccess, setProlongSuccess] = useState(false);

  // Poll intervals
  const warningCountdownRef = useRef<NodeJS.Timeout | null>(null);
  const autoRedirectRef = useRef<NodeJS.Timeout | null>(null);

  // Check session status periodically (every 20s when logged in)
  useEffect(() => {
    if (!currentUser) {
      setShowWarning(false);
      setShowExpired(false);
      return;
    }

    let isMounted = true;
    let consecutiveUnauth = 0;

    const checkStatus = async () => {
      try {
        const res = await centralApiRequest('/auth/session-status', 'GET');
        if (!isMounted) return;

        if (!res || !res.authenticated) {
          consecutiveUnauth++;
          // Vérifier 2 fois consécutives avant de déclarer la session expirée
          // pour éviter tout faux positif pendant les navigations ou micro-latences réseau
          if (consecutiveUnauth >= 2) {
            handleTriggerExpired();
          }
          return;
        }

        consecutiveUnauth = 0;

        const refreshSecondsLeft = res.refreshSecondsLeft ?? 3600;

        // Seuil d'avertissement : dès qu'il reste 60 secondes ou moins
        if (refreshSecondsLeft <= 60 && refreshSecondsLeft > 0) {
          setSecondsRemaining(refreshSecondsLeft);
          setShowWarning(true);
        } else {
          setShowWarning(false);
        }
      } catch (err) {
        // En cas d'erreur de vérification réseau temporaire, ne pas déconnecter prématurément
      }
    };

    // Premier check après 5s puis intervalle régulier
    const initialTimer = setTimeout(checkStatus, 5000);
    const interval = setInterval(checkStatus, 15000);

    const handleSessionExpiredEvent = () => {
      setShowWarning(false);
      setShowExpired(true);
      onLogout();
      if (!autoRedirectRef.current) {
        autoRedirectRef.current = setTimeout(() => {
          handleRedirectToLogin();
        }, 6000);
      }
    };
    window.addEventListener('session-expired-event', handleSessionExpiredEvent);

    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
      clearInterval(interval);
      window.removeEventListener('session-expired-event', handleSessionExpiredEvent);
    };
  }, [currentUser]);

  // Compte à rebours actif dès que le warning s'affiche
  useEffect(() => {
    if (!showWarning) {
      if (warningCountdownRef.current) clearInterval(warningCountdownRef.current);
      return;
    }

    warningCountdownRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        // Règle stricte demandée par le client :
        // Si avant les 10 secondes le client ne répond pas (ou si le chrono atteint 10s ou 0s),
        // fermeture automatique et affichage de la fenêtre "Session expirée" + redirection vers login !
        if (prev <= 10) {
          if (warningCountdownRef.current) clearInterval(warningCountdownRef.current);
          handleTriggerExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (warningCountdownRef.current) clearInterval(warningCountdownRef.current);
    };
  }, [showWarning]);

  // Déclenchement de l'expiration
  const handleTriggerExpired = async () => {
    setShowWarning(false);
    setShowExpired(true);
    try {
      await centralApiRequest('/auth/logout', 'POST');
    } catch {}
    onLogout();

    // Redirection automatique vers login après 6 secondes
    autoRedirectRef.current = setTimeout(() => {
      handleRedirectToLogin();
    }, 6000);
  };

  const handleRedirectToLogin = () => {
    setShowExpired(false);
    if (autoRedirectRef.current) clearTimeout(autoRedirectRef.current);
    onLogout();
    if (onGoToLogin) {
      onGoToLogin();
    } else {
      window.location.hash = '#/login';
    }
  };

  // Clic sur "OUI" : Prolonger la session
  const handleProlong = async () => {
    setIsProlonging(true);
    try {
      const res = await centralApiRequest('/auth/prolong', 'POST');
      if (res && res.success) {
        setProlongSuccess(true);
        setTimeout(() => {
          setProlongSuccess(false);
          setShowWarning(false);
          setIsProlonging(false);
        }, 1200);
      } else {
        handleTriggerExpired();
      }
    } catch (err) {
      handleTriggerExpired();
    } finally {
      setIsProlonging(false);
    }
  };

  // Clic sur "NON" : Refuser et se déconnecter
  const handleRefuse = () => {
    handleTriggerExpired();
  };

  // -------------------------------------------------------------
  // FENÊTRE 1 : AVERTISSEMENT PROMPT ("Session va bientôt expirer")
  // -------------------------------------------------------------
  if (showWarning) {
    const progressPercent = Math.min(100, Math.max(0, (secondsRemaining / 60) * 100));

    return (
      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-amber-200 dark:border-amber-900/50 overflow-hidden transform animate-scaleUp">
          
          {/* Header Bar Accent */}
          <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">
            <div 
              className="h-full bg-white/40 transition-all duration-1000"
              style={{ width: `${100 - progressPercent}%` }}
            />
          </div>

          <div className="p-6 sm:p-7 text-center">
            {/* Animated Icon */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/60 dark:to-orange-950/60 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-md shadow-amber-500/10">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            {/* Titre */}
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              Votre session va bientôt expirer
            </h3>

            {/* Message */}
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
              Pour votre sécurité, votre session MultiShop est sur le point de s'achever.
              Souhaitez-vous prolonger votre session et rester connecté(e) ?
            </p>

            {/* Live Countdown Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-black tracking-wide mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>Temps restant : {secondsRemaining} seconde{secondsRemaining > 1 ? 's' : ''}</span>
            </div>

            {/* Actions Buttons */}
            {prolongSuccess ? (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2 text-sm font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Session prolongée avec succès !</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleProlong}
                  disabled={isProlonging}
                  className="w-full py-3 px-4 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-4 h-4 ${isProlonging ? 'animate-spin' : ''}`} />
                  <span>{isProlonging ? 'Prolongation...' : 'Oui, rester'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleRefuse}
                  disabled={isProlonging}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-slate-500" />
                  <span>Non, déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // FENÊTRE 2 : FENÊTRE MODERNE "SESSION EXPIRÉE"
  // -------------------------------------------------------------
  if (showExpired) {
    return (
      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform animate-scaleUp">
          
          {/* Header Accent */}
          <div className="h-2 w-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-600" />

          <div className="p-6 sm:p-8 text-center">
            {/* Modern Icon */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950/60 dark:to-pink-950/60 border border-red-200 dark:border-red-800/60 flex items-center justify-center text-red-600 dark:text-red-400 shadow-lg shadow-red-500/10">
              <ShieldAlert className="w-8 h-8" />
            </div>

            {/* Titre */}
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              Session expirée
            </h3>

            {/* Message explicatif clair */}
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Votre session sécurisée a expiré. Pour protéger vos données personnelles et vos commandes,
              veuillez vous reconnecter pour poursuivre votre navigation.
            </p>

            {/* Action principale : Reconnexion */}
            <button
              type="button"
              onClick={handleRedirectToLogin}
              className="w-full py-3.5 px-6 rounded-xl font-black text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Se reconnecter maintenant</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-[11px] text-slate-400 mt-4">
              Redirection automatique vers la page de connexion dans quelques secondes...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};


import React, { useState, useEffect } from 'react';
import { GoogleIcon, FacebookIcon, EyeIcon, EyeSlashIcon, UserIcon, MailIcon, LockIcon, XMarkIcon } from './IconComponents';
import { api } from '../utils/api';
import { useToast } from './ToastContext';

interface LoginPageProps {
    onNavigateHome: () => void;
    onLoginSuccess: () => void;
}

// Modal pour mot de passe oublié
const ForgotPasswordModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            
            if (response.ok) {
                addToast("Un lien de réinitialisation a été envoyé à votre adresse email.", "success");
                onClose();
            } else {
                throw new Error(data.message || "Erreur lors de l'envoi.");
            }
        } catch (error: any) {
            addToast(error.message, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <XMarkIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Mot de passe oublié ?</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Entrez votre adresse email ci-dessous. Nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><MailIcon className="w-5 h-5"/></span>
                        <input 
                            type="email" 
                            required 
                            placeholder="Votre email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-3 pl-12 pr-4 focus:ring-red-500 focus:border-red-500"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-red-600 text-white font-bold py-3 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400"
                    >
                        {isLoading ? 'Envoi...' : 'Envoyer le lien'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const InputField = ({ id, type, placeholder, icon: Icon, value, onChange }: { id: string; type: string; placeholder: string; icon: React.ElementType; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Icon className="w-5 h-5" />
            </span>
            <input
                id={id}
                type={isPassword && !passwordVisible ? 'password' : 'text'}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md py-3 pl-12 pr-12 text-sm focus:ring-2 focus:ring-red-500/50 focus:border-red-500 focus:shadow-lg focus:shadow-red-500/20 transition-all duration-300"
            />
            {isPassword && (
                <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    {passwordVisible ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
            )}
        </div>
    );
};

const SocialLoginButtons = ({ action }: { action: 'login' | 'register' }) => {
    const BACKEND_URL = ''; // Relative path handled by Proxy
    
    const handleSocialLogin = (provider: 'google' | 'facebook') => {
        window.location.href = `${BACKEND_URL}/api/auth/${provider}?action=${action}&role=client`;
    };

    return (
        <div className="w-full space-y-3">
            <button type="button" onClick={() => handleSocialLogin('google')} className="w-full h-11 flex items-center justify-center gap-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm font-semibold text-gray-700 dark:text-gray-200 text-sm active:scale-95 duration-200">
                <GoogleIcon className="w-5 h-5" />
                <span>Continuer avec Google</span>
            </button>
            <button type="button" onClick={() => handleSocialLogin('facebook')} className="w-full h-11 flex items-center justify-center gap-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm font-semibold text-gray-700 dark:text-gray-200 text-sm active:scale-95 duration-200">
                <FacebookIcon className="w-5 h-5 text-blue-600" />
                <span>Continuer avec Facebook</span>
            </button>
        </div>
    );
};

const SignInForm: React.FC<{ onLoginSuccess: () => void; onForgotPassword: () => void; idPrefix?: string }> = ({ onLoginSuccess, onForgotPassword, idPrefix = 'signin' }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email.trim() || !password.trim()) {
            addToast("Veuillez remplir tous les champs.", "warning");
            return;
        }

        setIsLoading(true);
        
        try {
            const data = await api.login({ email, password });
            // CORRECTION: Le backend renvoie 'accessToken', pas 'token'
            if (data && (data.accessToken || data.token)) {
                localStorage.setItem('token', data.accessToken || data.token);
                onLoginSuccess();
            } else {
                throw new Error("Jeton d'authentification manquant.");
            }
        } catch (error: any) {
            console.error('[LOGIN] Erreur :', error);
            addToast(error.message || "Erreur de connexion. Vérifiez vos identifiants.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="w-full space-y-4" onSubmit={handleSubmit}>
            <SocialLoginButtons action="login" />
            <div className="flex items-center py-2">
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-xs">ou</span>
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <InputField id={`${idPrefix}-email`} type="email" placeholder="Email" icon={MailIcon} value={email} onChange={e => setEmail(e.target.value)} />
            <InputField id={`${idPrefix}-password`} type="password" placeholder="Mot de passe" icon={LockIcon} value={password} onChange={e => setPassword(e.target.value)} />
            <a href="#" onClick={(e) => { e.preventDefault(); onForgotPassword(); }} className="block text-center text-sm text-gray-500 dark:text-gray-400 hover:underline my-4">Mot de passe oublié ?</a>
            <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full font-bold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full py-3 uppercase tracking-wider hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-[0.98] active:brightness-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {isLoading ? 'Connexion...' : 'Se Connecter'}
            </button>
        </form>
    );
};

const SignUpForm: React.FC<{ switchToLogin: () => void; idPrefix?: string }> = ({ switchToLogin, idPrefix = 'signup' }) => {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Le split permet de retirer le préfixe pour récupérer le nom du champ réel (ex: 'signup-email' -> 'email')
        const fieldName = e.target.id.replace(`${idPrefix}-`, '');
        setFormData({ ...formData, [fieldName]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
            addToast("Veuillez remplir tous les champs.", "warning");
            return;
        }

        setIsLoading(true);
        
        try {
            await api.register(formData);
            addToast("Inscription réussie ! Veuillez vous connecter.", "success");
            switchToLogin();
        } catch (error: any) {
            console.error('[REGISTER] Erreur :', error);
            addToast(error.message || "Erreur lors de la création du compte.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="w-full space-y-4" onSubmit={handleSubmit}>
            <SocialLoginButtons action="register" />
            <div className="flex items-center py-2">
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-xs">ou</span>
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="flex gap-2">
                <InputField id={`${idPrefix}-firstName`} type="text" placeholder="Prénom" icon={UserIcon} value={formData.firstName} onChange={handleChange} />
                <InputField id={`${idPrefix}-lastName`} type="text" placeholder="Nom" icon={UserIcon} value={formData.lastName} onChange={handleChange} />
            </div>
            <InputField id={`${idPrefix}-email`} type="email" placeholder="Email" icon={MailIcon} value={formData.email} onChange={handleChange} />
            <InputField id={`${idPrefix}-password`} type="password" placeholder="Mot de passe" icon={LockIcon} value={formData.password} onChange={handleChange} />
            <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full font-bold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full py-3 uppercase tracking-wider hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-[0.98] active:brightness-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {isLoading ? 'Inscription...' : 'S\'inscrire'}
            </button>
        </form>
    );
};

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateHome, onLoginSuccess }) => {
    const [isSignUpActive, setIsSignUpActive] = useState(false);
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        // Parse URL params for OAuth messages and Toasts
        const hash = window.location.hash;
        if (hash.includes('?')) {
            const urlParams = new URLSearchParams(hash.split('?')[1]);
            const error = urlParams.get('error');
            const success = urlParams.get('success');

            if (success === 'registered') {
                addToast("Inscription réussie ! Veuillez maintenant vous connecter pour accéder à votre espace.", "success");
                setIsSignUpActive(false); 
            }

            if (error === 'user_not_found') {
                addToast("Aucun compte trouvé avec cet email. Veuillez d'abord vous inscrire.", "error");
                setIsSignUpActive(true); 
            }

            if (error === 'user_exists') {
                addToast("Un compte existe déjà avec cet email. Veuillez vous connecter.", "info");
                setIsSignUpActive(false); 
            }

            if (error === 'auth_failed') {
                addToast("L'authentification a échoué. Veuillez réessayer.", "error");
            }

            // Clean URL (remove params)
            if (error || success) {
                const newHash = hash.split('?')[0];
                window.history.replaceState(null, '', window.location.pathname + newHash);
            }
        }
    }, [addToast]);

    return (
        <div className="relative py-16 sm:py-24 bg-cover bg-center font-sans" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=2768&auto=format&fit=crop')" }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                
                {/* Desktop View */}
                <div className="relative w-full max-w-3xl min-h-[620px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden hidden md:block">
                    <div className={`absolute top-0 left-0 h-full w-1/2 flex flex-col items-center justify-center p-8 text-center transition-all duration-700 ease-in-out transform opacity-0 z-10 bg-gradient-to-br from-stone-100 to-stone-200 dark:from-slate-800 dark:to-slate-900 ${isSignUpActive ? 'translate-x-full opacity-100 z-20' : ''}`}>
                        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Créer un compte</h1>
                        <SignUpForm switchToLogin={() => setIsSignUpActive(false)} idPrefix="desktop-signup" />
                    </div>
                    <div className={`absolute top-0 left-0 h-full w-1/2 flex flex-col items-center justify-center p-8 text-center transition-all duration-700 ease-in-out transform bg-gradient-to-br from-stone-100 to-stone-200 dark:from-slate-800 dark:to-slate-900 ${isSignUpActive ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100 z-20'}`}>
                        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Se connecter</h1>
                        <SignInForm onLoginSuccess={onLoginSuccess} onForgotPassword={() => setIsForgotModalOpen(true)} idPrefix="desktop-signin" />
                    </div>
                    <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 ${isSignUpActive ? '-translate-x-full' : 'translate-x-0'}`}>
                        <div className={`relative -left-full h-full w-[200%] transition-transform duration-700 ease-in-out transform ${isSignUpActive ? 'translate-x-1/2' : 'translate-x-0'}`}>
                            <div className="absolute top-0 h-full w-1/2 flex items-center justify-center text-center p-10 bg-gradient-to-br from-red-600 to-red-800 text-white">
                                <div>
                                    <h2 className="text-3xl font-bold mb-4">Content de vous revoir !</h2>
                                    <p className="mb-6 text-gray-200">Pour rester connecté, veuillez vous connecter avec vos informations personnelles.</p>
                                    <button onClick={() => setIsSignUpActive(false)} className="font-bold bg-transparent border-2 border-white rounded-full py-2 px-10 uppercase tracking-wider hover:bg-white hover:text-black transition-colors duration-300">Se connecter</button>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 h-full w-1/2 flex items-center justify-center text-center p-10 bg-gradient-to-br from-red-600 to-red-800 text-white">
                                <div>
                                    <h2 className="text-3xl font-bold mb-4">Nouveau ici ?</h2>
                                    <p className="mb-6 text-white/80">Créez votre compte et découvrez un monde de nouvelles opportunités !</p>
                                    <button onClick={() => setIsSignUpActive(true)} className="font-bold bg-white text-red-600 rounded-full py-3 px-10 uppercase tracking-wider shadow-lg transform hover:scale-105 transition-transform duration-300">S'inscrire</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile View */}
                <div className="w-full max-w-md bg-gradient-to-br from-stone-100 to-stone-200 dark:from-slate-800 dark:to-slate-900 backdrop-blur-sm p-8 rounded-2xl shadow-2xl md:hidden">
                    {!isSignUpActive ? (
                        <>
                            <h1 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">Se connecter</h1>
                            <SignInForm onLoginSuccess={onLoginSuccess} onForgotPassword={() => setIsForgotModalOpen(true)} idPrefix="mobile-signin" />
                            <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">Pas encore de compte ? <button onClick={() => setIsSignUpActive(true)} className="font-semibold text-red-600 hover:underline">S'inscrire</button></p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">Créer un compte</h1>
                            <SignUpForm switchToLogin={() => setIsSignUpActive(false)} idPrefix="mobile-signup" />
                            <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">Déjà un compte ? <button onClick={() => setIsSignUpActive(false)} className="font-semibold text-red-600 hover:underline">Se connecter</button></p>
                        </>
                    )}
                </div>
            </div>
            
            <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
        </div>
    );
};

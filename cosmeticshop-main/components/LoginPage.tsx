
import React, { useState, useEffect } from 'react';
import { GoogleIcon, FacebookIcon, EyeIcon, EyeSlashIcon, UserIcon, MailIcon, LockIcon, XMarkIcon, ArrowLongLeftIcon, SparklesIcon } from './IconComponents';
import { api } from '../utils/api';
import { useToast } from './ToastContext';

interface LoginPageProps {
    onNavigateHome: () => void;
    onLoginSuccess: () => void;
}

// --- MODAL MOT DE PASSE OUBLIÉ ---
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
            // Pour la sécurité, on affiche le même message que l'email existe ou non
            addToast("Si un compte est associé à cet email, vous recevrez un lien de réinitialisation.", "success");
            onClose();
        } catch (error: any) {
            addToast("Une erreur est survenue. Veuillez réessayer ultérieurement.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-rose-900/40 backdrop-blur-md transition-all duration-300">
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl p-8 border border-rose-100 dark:border-gray-700 transform scale-100 animate-fadeIn">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-rose-500 transition-colors bg-rose-50 dark:bg-gray-800 p-2 rounded-full">
                    <XMarkIcon className="w-5 h-5" />
                </button>
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                        <LockIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Mot de passe oublié ?</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-light">Entrez votre adresse e-mail pour recevoir les instructions de réinitialisation.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-rose-300 group-focus-within:text-rose-500 transition-colors">
                            <MailIcon className="w-5 h-5"/>
                        </div>
                        <input 
                            type="email" 
                            required 
                            placeholder="Votre adresse email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-rose-50/50 dark:bg-gray-800 border-none rounded-xl py-4 pl-12 pr-4 text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-200 transition-all shadow-inner"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-rose-400 to-rose-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-rose-200 dark:shadow-none hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-70 disabled:transform-none"
                    >
                        {isLoading ? 'Envoi en cours...' : 'Réinitialiser mon mot de passe'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- COMPOSANT INPUT STYLISÉ ---
const InputField = ({ id, type, placeholder, icon: Icon, value, onChange }: { id: string; type: string; placeholder: string; icon: React.ElementType; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-rose-500 transition-colors duration-300">
                <Icon className="w-5 h-5" />
            </div>
            <input
                id={id}
                type={isPassword && !passwordVisible ? 'password' : 'text'}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-12 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 dark:focus:ring-rose-900/30 transition-all duration-300 shadow-sm group-hover:border-rose-200"
            />
            {isPassword && (
                <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-rose-500 transition-colors cursor-pointer">
                    {passwordVisible ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
            )}
        </div>
    );
};

// --- BOUTONS SOCIAUX ---
const SocialLoginButtons = ({ action }: { action: 'login' | 'register' }) => {
    const BACKEND_URL = ''; 
    
    const handleSocialLogin = (provider: 'google' | 'facebook') => {
        window.location.href = `${BACKEND_URL}/api/auth/${provider}?action=${action}&role=client`;
    };

    return (
        <div className="flex gap-4 w-full">
            <button type="button" onClick={() => handleSocialLogin('google')} className="flex-1 h-14 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:border-rose-200 hover:bg-rose-50/50 dark:hover:bg-gray-700 transition-all shadow-sm group">
                <GoogleIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            </button>
            <button type="button" onClick={() => handleSocialLogin('facebook')} className="flex-1 h-14 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:border-blue-200 hover:bg-blue-50/50 dark:hover:bg-gray-700 transition-all shadow-sm group">
                <FacebookIcon className="w-6 h-6 text-[#1877F2] group-hover:scale-110 transition-transform duration-300" />
            </button>
        </div>
    );
};

// --- FORMULAIRE CONNEXION ---
const SignInForm: React.FC<{ onLoginSuccess: () => void; onForgotPassword: () => void; idPrefix?: string }> = ({ onLoginSuccess, onForgotPassword, idPrefix = 'signin' }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email.trim() || !password.trim()) {
            addToast("Merci de renseigner votre email et votre mot de passe.", "warning");
            return;
        }

        setIsLoading(true);
        try {
            const data = await api.login({ email, password });
            if (data && (data.accessToken || data.token)) {
                localStorage.setItem('token', data.accessToken || data.token);
                onLoginSuccess();
            } else {
                throw new Error("Echec de connexion");
            }
        } catch (error: any) {
            // SÉCURITÉ : Message générique pour ne pas indiquer si le mail existe ou si c'est le mot de passe
            addToast("Adresse e-mail ou mot de passe incorrect.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="w-full space-y-5 animate-fadeIn" onSubmit={handleSubmit} style={{ animationDelay: '0.1s' }}>
            <div className="space-y-4">
                <InputField id={`${idPrefix}-email`} type="email" placeholder="Adresse e-mail" icon={MailIcon} value={email} onChange={e => setEmail(e.target.value)} />
                <InputField id={`${idPrefix}-password`} type="password" placeholder="Mot de passe" icon={LockIcon} value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            
            <div className="flex justify-end">
                <button type="button" onClick={onForgotPassword} className="text-sm text-gray-500 hover:text-rose-500 transition-colors font-medium">
                    Mot de passe oublié ?
                </button>
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 uppercase tracking-wider text-xs ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {isLoading ? 'Connexion...' : 'Se Connecter'}
            </button>

            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-4 bg-white dark:bg-gray-900 text-gray-400 font-light">ou continuez avec</span></div>
            </div>

            <SocialLoginButtons action="login" />
        </form>
    );
};

// --- FORMULAIRE INSCRIPTION ---
const SignUpForm: React.FC<{ switchToLogin: () => void; idPrefix?: string }> = ({ switchToLogin, idPrefix = 'signup' }) => {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fieldName = e.target.id.replace(`${idPrefix}-`, '');
        setFormData({ ...formData, [fieldName]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
            addToast("Veuillez remplir tous les champs requis.", "warning");
            return;
        }
        setIsLoading(true);
        try {
            await api.register(formData);
            addToast("Compte créé avec succès ! Vous pouvez maintenant vous connecter.", "success");
            switchToLogin();
        } catch (error: any) {
            addToast("Impossible de créer le compte. Veuillez vérifier vos informations.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="w-full space-y-5 animate-fadeIn" onSubmit={handleSubmit} style={{ animationDelay: '0.1s' }}>
            <div className="flex gap-4">
                <InputField id={`${idPrefix}-firstName`} type="text" placeholder="Prénom" icon={UserIcon} value={formData.firstName} onChange={handleChange} />
                <InputField id={`${idPrefix}-lastName`} type="text" placeholder="Nom" icon={UserIcon} value={formData.lastName} onChange={handleChange} />
            </div>
            <InputField id={`${idPrefix}-email`} type="email" placeholder="Adresse e-mail" icon={MailIcon} value={formData.email} onChange={handleChange} />
            <InputField id={`${idPrefix}-password`} type="password" placeholder="Mot de passe" icon={LockIcon} value={formData.password} onChange={handleChange} />
            
            <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full bg-rose-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-rose-200 dark:shadow-none hover:shadow-xl hover:bg-rose-700 hover:scale-[1.02] transition-all duration-300 uppercase tracking-wider text-xs ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {isLoading ? 'Création...' : 'Rejoindre la communauté'}
            </button>

            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div>
                <div className="relative flex-center justify-center text-sm text-center"><span className="px-4 bg-white dark:bg-gray-900 text-gray-400 font-light">ou inscrivez-vous avec</span></div>
            </div>

            <SocialLoginButtons action="register" />
        </form>
    );
};

// --- PAGE PRINCIPALE ---
export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateHome, onLoginSuccess }) => {
    const [isSignUpActive, setIsSignUpActive] = useState(false);
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const { addToast } = useToast();

    // Check URL params
    useEffect(() => {
        const hash = window.location.hash;
        if (hash.includes('?')) {
            const urlParams = new URLSearchParams(hash.split('?')[1]);
            const error = urlParams.get('error');
            const success = urlParams.get('success');

            if (success === 'registered') {
                addToast("Compte créé avec succès. Veuillez vous connecter.", "success");
                setIsSignUpActive(false); 
            }
            if (error === 'user_exists') {
                addToast("Un compte existe déjà avec cette adresse email.", "info");
                setIsSignUpActive(false); 
            }
            if (error === 'auth_failed') {
                addToast("L'authentification a échoué. Veuillez réessayer.", "error");
            }
            
            // Clean URL
            if (error || success) {
                const newHash = hash.split('?')[0];
                window.history.replaceState(null, '', window.location.pathname + newHash);
            }
        }
    }, [addToast]);

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#FDF2F8] dark:bg-gray-950 p-4 lg:p-8 font-sans relative overflow-hidden">
            
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-rose-200/40 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-rose-300/20 rounded-full blur-[120px]"></div>
            </div>

            {/* Main Card Container */}
            <div className="relative bg-white dark:bg-gray-900 w-full max-w-5xl h-auto md:min-h-[650px] rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col md:flex-row overflow-hidden border border-white/50 dark:border-gray-800 z-10">
                
                {/* Mobile Header (Logo & Back) */}
                <div className="md:hidden p-6 flex justify-between items-center">
                    <button onClick={onNavigateHome} className="text-gray-500 hover:text-rose-600 transition-colors">
                        <ArrowLongLeftIcon className="w-6 h-6" />
                    </button>
                    <span className="font-serif font-bold text-xl text-gray-900 dark:text-white">Cosmetics Shop</span>
                </div>

                {/* Left Side: Image / Decoration (Visible on Desktop) */}
                <div className={`hidden md:flex w-1/2 relative transition-all duration-700 ease-in-out order-2 md:order-1 ${isSignUpActive ? 'translate-x-full' : ''}`}>
                    <div className="absolute inset-0">
                        <img 
                            src={isSignUpActive 
                                ? "https://images.unsplash.com/photo-1596462502278-27bfdd403cc2?q=80&w=1000&auto=format&fit=crop" 
                                : "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=1000&auto=format&fit=crop"
                            }
                            alt="Beauty Background" 
                            className="w-full h-full object-cover transition-opacity duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-rose-900/60 via-transparent to-transparent"></div>
                        <div className="absolute inset-0 bg-black/10"></div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 p-12 text-white z-10 w-full">
                        <div className="mb-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30">
                            <SparklesIcon className="w-4 h-4 text-rose-200" />
                            <span className="text-xs font-bold uppercase tracking-widest">L'excellence Beauté</span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-4 leading-tight drop-shadow-lg">
                            {isSignUpActive ? "Rejoignez le cercle." : "Révélez votre éclat."}
                        </h2>
                        <p className="text-lg text-white/90 font-light leading-relaxed max-w-sm drop-shadow-md">
                            {isSignUpActive 
                                ? "Créez votre compte et accédez à des offres exclusives, des conseils personnalisés et bien plus encore." 
                                : "Connectez-vous pour retrouver vos favoris, suivre vos commandes et découvrir nos nouveautés."
                            }
                        </p>
                    </div>
                </div>

                {/* Right Side: Forms */}
                <div className={`w-full md:w-1/2 p-8 lg:p-12 xl:p-16 flex flex-col justify-center transition-all duration-700 ease-in-out order-1 md:order-2 bg-white dark:bg-gray-900 ${isSignUpActive ? '-translate-x-full' : ''}`}>
                    
                    <div className="hidden md:flex justify-end mb-4">
                        <button 
                            onClick={onNavigateHome} 
                            className="group flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <span>Retour boutique</span>
                            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full group-hover:bg-rose-50 transition-colors">
                                <XMarkIcon className="w-4 h-4" />
                            </div>
                        </button>
                    </div>

                    <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
                        <div className="mb-10 text-center md:text-left">
                            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 dark:text-white mb-3">
                                {isSignUpActive ? 'Créer un compte' : 'Bon retour parmi nous'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                {isSignUpActive ? 'Entrez vos détails pour commencer' : 'Veuillez saisir vos coordonnées'}
                            </p>
                        </div>

                        {/* Forms Switcher */}
                        {isSignUpActive ? (
                            <SignUpForm switchToLogin={() => setIsSignUpActive(false)} idPrefix="signup" />
                        ) : (
                            <SignInForm onLoginSuccess={onLoginSuccess} onForgotPassword={() => setIsForgotModalOpen(true)} idPrefix="signin" />
                        )}

                        {/* Bottom Switcher Text */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {isSignUpActive ? "Vous avez déjà un compte ?" : "Pas encore de compte ?"}
                                <button 
                                    onClick={() => setIsSignUpActive(!isSignUpActive)} 
                                    className="ml-2 font-bold text-rose-600 hover:text-rose-700 underline decoration-2 underline-offset-4 decoration-rose-200 hover:decoration-rose-500 transition-all"
                                >
                                    {isSignUpActive ? "Se connecter" : "S'inscrire gratuitement"}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
        </div>
    );
};


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
            addToast("Si un compte est associé à cet email, vous recevrez un lien de réinitialisation.", "success");
            onClose();
        } catch (error: any) {
            addToast("Une erreur est survenue. Veuillez réessayer ultérieurement.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300">
            <div className="relative w-full max-w-md bg-[#121212] rounded-xl shadow-2xl p-8 border border-gray-800 transform scale-100 animate-fadeIn">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-neon to-transparent"></div>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                    <XMarkIcon className="w-6 h-6" />
                </button>
                <div className="text-center mb-8 mt-2">
                    <div className="w-16 h-16 bg-gray-800/50 border border-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-neon shadow-[0_0_15px_rgba(204,255,0,0.1)]">
                        <LockIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-white uppercase tracking-wider">Récupération</h2>
                    <p className="text-sm text-gray-400 mt-2 font-mono">Entrez votre email pour réinitialiser l'accès.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-brand-neon transition-colors">
                            <MailIcon className="w-5 h-5"/>
                        </div>
                        <input 
                            type="email" 
                            required 
                            placeholder="Votre adresse email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#1E1E1E] border border-gray-700 rounded-lg py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:border-brand-neon focus:ring-1 focus:ring-brand-neon/20 transition-all font-mono text-sm"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-white text-black font-black uppercase tracking-widest py-4 hover:bg-brand-neon transition-colors disabled:opacity-70 rounded-lg shadow-lg"
                    >
                        {isLoading ? 'ENVOI...' : 'RÉINITIALISER'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- COMPOSANT INPUT STYLISÉ (Style Plus Moderne/Clean) ---
const InputField = ({ id, type, placeholder, icon: Icon, value, onChange }: { id: string; type: string; placeholder: string; icon: React.ElementType; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-brand-neon transition-colors duration-300">
                <Icon className="w-5 h-5" />
            </div>
            <input
                id={id}
                type={isPassword && !passwordVisible ? 'password' : 'text'}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-lg py-4 pl-12 pr-12 text-sm placeholder-gray-500 focus:outline-none focus:border-brand-neon focus:bg-[#222] focus:ring-1 focus:ring-brand-neon/30 transition-all duration-300 font-sans"
            />
            {isPassword && (
                <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-600 hover:text-white transition-colors cursor-pointer">
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
            <button type="button" onClick={() => handleSocialLogin('google')} className="flex-1 h-12 flex items-center justify-center bg-white text-black font-bold uppercase text-xs tracking-wider hover:bg-gray-200 transition-all rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                <span className="flex items-center gap-2"><GoogleIcon className="w-4 h-4" /> Google</span>
            </button>
            <button type="button" onClick={() => handleSocialLogin('facebook')} className="flex-1 h-12 flex items-center justify-center bg-[#1877F2] text-white font-bold uppercase text-xs tracking-wider hover:bg-[#166fe5] transition-all rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                <span className="flex items-center gap-2"><FacebookIcon className="w-4 h-4 text-white" /> Facebook</span>
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
            addToast("Identifiants incorrects. Vérifiez votre email et mot de passe.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="w-full space-y-5 animate-fadeIn" onSubmit={handleSubmit} style={{ animationDelay: '0.1s' }}>
            <div className="space-y-4">
                <InputField id={`${idPrefix}-email`} type="email" placeholder="E-MAIL" icon={MailIcon} value={email} onChange={e => setEmail(e.target.value)} />
                <InputField id={`${idPrefix}-password`} type="password" placeholder="MOT DE PASSE" icon={LockIcon} value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            
            <div className="flex justify-between items-center px-1">
                <label className="flex items-center space-x-2 cursor-pointer group">
                    <input type="checkbox" className="form-checkbox h-4 w-4 text-brand-neon bg-gray-800 border-gray-600 rounded focus:ring-0 transition-colors group-hover:border-brand-neon" />
                    <span className="text-xs text-gray-400 group-hover:text-gray-300 uppercase font-bold tracking-wider transition-colors">Se souvenir</span>
                </label>
                <button type="button" onClick={onForgotPassword} className="text-xs text-gray-400 hover:text-brand-neon transition-colors font-bold uppercase tracking-wider underline decoration-gray-700 hover:decoration-brand-neon underline-offset-4">
                    Perdu ?
                </button>
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full bg-brand-neon text-black font-black py-4 shadow-[0_0_15px_rgba(204,255,0,0.3)] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-[0.2em] text-sm rounded-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {isLoading ? 'CONNEXION...' : 'ACCÉDER AU QG'}
            </button>

            <div className="relative py-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="px-4 bg-[#121212] text-gray-500 font-bold">OU VIA SOCIAL</span></div>
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
            addToast("Tous les champs sont requis pour rejoindre l'équipe.", "warning");
            return;
        }
        setIsLoading(true);
        try {
            await api.register(formData);
            addToast("Compte créé ! Connectez-vous pour commencer.", "success");
            switchToLogin();
        } catch (error: any) {
            addToast("Impossible de créer le compte. Vérifiez vos infos.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="w-full space-y-5 animate-fadeIn" onSubmit={handleSubmit} style={{ animationDelay: '0.1s' }}>
            <div className="flex gap-4">
                <InputField id={`${idPrefix}-firstName`} type="text" placeholder="PRÉNOM" icon={UserIcon} value={formData.firstName} onChange={handleChange} />
                <InputField id={`${idPrefix}-lastName`} type="text" placeholder="NOM" icon={UserIcon} value={formData.lastName} onChange={handleChange} />
            </div>
            <InputField id={`${idPrefix}-email`} type="email" placeholder="E-MAIL" icon={MailIcon} value={formData.email} onChange={handleChange} />
            <InputField id={`${idPrefix}-password`} type="password" placeholder="MOT DE PASSE" icon={LockIcon} value={formData.password} onChange={handleChange} />
            
            <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full bg-white text-black font-black py-4 shadow-lg hover:bg-brand-neon transition-all duration-300 uppercase tracking-[0.2em] text-sm rounded-lg transform hover:-translate-y-0.5 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {isLoading ? 'CRÉATION...' : 'REJOINDRE LA LÉGION'}
            </button>

            <div className="relative py-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="px-4 bg-[#121212] text-gray-500 font-bold">OU VIA SOCIAL</span></div>
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
                addToast("Bienvenue dans la team ! Connectez-vous maintenant.", "success");
                setIsSignUpActive(false); 
            }
            if (error === 'user_exists') {
                addToast("Un compte existe déjà avec cet email.", "info");
                setIsSignUpActive(false); 
            }
            
            if (error || success) {
                const newHash = hash.split('?')[0];
                window.history.replaceState(null, '', window.location.pathname + newHash);
            }
        }
        
        // Scroll to top when mounting
        window.scrollTo(0, 0);
    }, [addToast]);

    return (
        <div className="min-h-[85vh] w-full flex items-center justify-center bg-gray-50 dark:bg-[#050505] font-sans relative py-20 overflow-hidden">
            
            {/* Background Texture & Noise */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
            
            {/* Ambient Light */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-neon/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Main Card Container */}
            <div className="relative bg-[#121212] w-full max-w-5xl h-auto md:min-h-[650px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col md:flex-row overflow-hidden border border-gray-800 z-10 mx-4 md:mx-0 rounded-2xl">
                
                {/* Mobile Header (Logo & Back) */}
                <div className="md:hidden p-6 flex justify-between items-center border-b border-gray-800 bg-[#0b0c10]">
                    <button onClick={onNavigateHome} className="text-gray-400 hover:text-brand-neon transition-colors">
                        <ArrowLongLeftIcon className="w-6 h-6" />
                    </button>
                    <span className="font-serif font-bold text-xl text-white italic">IRON<span className="text-brand-neon">FUEL</span></span>
                </div>

                {/* Left Side: Image / Decoration (Desktop) */}
                <div className={`hidden md:flex w-1/2 relative transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] order-2 md:order-1 ${isSignUpActive ? 'translate-x-full' : ''}`}>
                    <div className="absolute inset-0 bg-black">
                        <img 
                            src={isSignUpActive 
                                ? "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1000&auto=format&fit=crop" // Weights / Gym
                                : "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop" // Athlete / Intensity
                            }
                            alt="Gym Background" 
                            className="w-full h-full object-cover opacity-60 grayscale mix-blend-luminosity transition-opacity duration-500"
                        />
                        {/* Overlay Gradients */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/30 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/80 to-transparent"></div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 p-12 text-white z-10 w-full">
                        <div className="mb-6 inline-flex items-center gap-2 border border-brand-neon/30 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full">
                            <SparklesIcon className="w-4 h-4 text-brand-neon" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-neon">Performance Pure</span>
                        </div>
                        <h2 className="text-5xl lg:text-6xl font-serif font-black italic uppercase mb-6 leading-[0.9] drop-shadow-lg">
                            {isSignUpActive ? "FORGEZ VOTRE\nLÉGENDE" : "RÉVÉLEZ VOTRE\nPUISSANCE"}
                        </h2>
                        <p className="text-gray-300 font-mono text-sm leading-relaxed max-w-sm border-l-2 border-brand-neon pl-4">
                            {isSignUpActive 
                                ? "Rejoignez l'élite. Accédez à des programmes exclusifs, suivez vos progrès et dominez vos objectifs." 
                                : "Votre corps est votre temple. Nous fournissons le carburant nécessaire pour atteindre l'excellence."
                            }
                        </p>
                    </div>
                </div>

                {/* Right Side: Forms */}
                <div className={`w-full md:w-1/2 p-8 lg:p-12 xl:p-16 flex flex-col justify-center transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] order-1 md:order-2 bg-[#121212] ${isSignUpActive ? '-translate-x-full' : ''}`}>
                    
                    <div className="hidden md:flex justify-end mb-8">
                        <button 
                            onClick={onNavigateHome} 
                            className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                        >
                            <span>Retour Boutique</span>
                            <div className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center group-hover:border-brand-neon group-hover:text-brand-neon transition-colors">
                                <XMarkIcon className="w-4 h-4" />
                            </div>
                        </button>
                    </div>

                    <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
                        <div className="mb-10 text-center md:text-left">
                            <h1 className="text-3xl lg:text-4xl font-serif font-black uppercase italic text-white mb-2">
                                {isSignUpActive ? 'Créer un Compte' : 'Connexion Membre'}
                            </h1>
                            <p className="text-gray-500 text-sm font-mono">
                                {isSignUpActive ? 'Commencez votre transformation.' : 'Accédez à votre espace athlète.'}
                            </p>
                        </div>

                        {/* Forms Switcher */}
                        {isSignUpActive ? (
                            <SignUpForm switchToLogin={() => setIsSignUpActive(false)} idPrefix="signup" />
                        ) : (
                            <SignInForm onLoginSuccess={onLoginSuccess} onForgotPassword={() => setIsForgotModalOpen(true)} idPrefix="signin" />
                        )}

                        {/* Bottom Switcher Text */}
                        <div className="mt-8 text-center pt-6 border-t border-gray-800">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">
                                {isSignUpActive ? "Déjà membre ?" : "Nouveau ici ?"}
                                <button 
                                    onClick={() => setIsSignUpActive(!isSignUpActive)} 
                                    className="ml-2 text-brand-neon hover:text-white hover:underline transition-colors"
                                >
                                    {isSignUpActive ? "CONNEXION" : "CRÉER UN COMPTE"}
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

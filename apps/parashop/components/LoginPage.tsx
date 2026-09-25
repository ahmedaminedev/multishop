
import React, { useState, useEffect } from 'react';
import { GoogleIcon, FacebookIcon, EyeIcon, EyeSlashIcon, UserIcon, MailIcon, LockIcon, XMarkIcon, ArrowLongLeftIcon, SparklesIcon } from './IconComponents';
import { api } from '../utils/api';
import { useToast } from './ToastContext';
import { SEO } from './SEO';

interface LoginPageProps {
    onNavigateHome: () => void;
    onLoginSuccess: () => void;
}

const InputField = ({ id, type, placeholder, icon: Icon, value, onChange }: any) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className="space-y-2">
            <label htmlFor={id} className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{placeholder}</label>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-primary transition-colors">
                    <Icon className="w-5 h-5" />
                </div>
                <input
                    id={id} 
                    type={isPassword && !passwordVisible ? 'password' : 'text'}
                    placeholder={placeholder} 
                    value={value} 
                    onChange={onChange}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white rounded-2xl py-4 pl-14 pr-12 text-sm font-bold placeholder-gray-300 focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all outline-none"
                    required
                />
                {isPassword && (
                    <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-400 hover:text-brand-primary">
                        {passwordVisible ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                )}
            </div>
        </div>
    );
};

const SocialButtons = () => {
    const handleSocialLogin = (provider: 'google' | 'facebook') => {
        window.location.href = `/api/auth/${provider}?action=login`;
    };

    return (
        <div className="space-y-4 w-full">
            <div className="relative flex items-center justify-center my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100 dark:border-white/5"></div>
                </div>
                <span className="relative px-4 bg-white dark:bg-brand-dark text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Ou continuer avec</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => handleSocialLogin('google')}
                    className="flex items-center justify-center gap-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 py-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all group shadow-sm"
                >
                    <GoogleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">Google</span>
                </button>
                <button 
                    onClick={() => handleSocialLogin('facebook')}
                    className="flex items-center justify-center gap-3 bg-[#1877F2] py-3.5 rounded-2xl hover:opacity-90 transition-all group shadow-lg shadow-[#1877F2]/20"
                >
                    <FacebookIcon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black text-white uppercase tracking-widest">Facebook</span>
                </button>
            </div>
        </div>
    );
};

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateHome, onLoginSuccess }) => {
    const [isSignUpActive, setIsSignUpActive] = useState(false);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    const handleAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isSignUpActive) {
                await api.register(formData);
                addToast("Inscription réussie !", "success");
                setIsSignUpActive(false);
            } else {
                const data = await api.login({ email: formData.email, password: formData.password });
                if (data.accessToken) {
                    localStorage.setItem('token', data.accessToken);
                    onLoginSuccess();
                    addToast("Connexion réussie.", "success");
                }
            }
        } catch (error: any) {
            addToast(error.message || "Échec de l'authentification", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#f0faf7] dark:bg-brand-dark font-sans p-4 md:p-10 relative overflow-hidden">
            <SEO title="Connexion" description="Accédez à votre espace PharmaNature." />
            
            {/* Soft Pattern Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#008b5e 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            
            <div className="relative w-full max-w-6xl bg-white dark:bg-brand-dark rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,139,94,0.1)] border border-brand-primary/5 overflow-hidden min-h-[750px] flex">
                
                {/* 1. LEFT SIDE: SIGN IN FORM */}
                <div className={`w-full md:w-1/2 p-10 md:p-20 flex flex-col justify-center transition-all duration-700 ${isSignUpActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <div className="max-w-md mx-auto w-full">
                        <div className="mb-10">
                            <button onClick={onNavigateHome} className="mb-8 text-brand-primary font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2 hover:translate-x-[-4px] transition-transform">
                                <ArrowLongLeftIcon className="w-4 h-4"/> Boutique
                            </button>
                            <h1 className="text-5xl font-serif font-black text-gray-900 dark:text-white mb-2 leading-none uppercase tracking-tighter">
                                <span className="text-brand-primary italic">Connexion</span>
                            </h1>
                            <p className="text-gray-400 font-medium text-sm">Bon retour dans votre espace.</p>
                        </div>

                        <form onSubmit={handleAction} className="space-y-6">
                            <InputField id="email_login" type="email" placeholder="Email" icon={MailIcon} value={formData.email} onChange={(e:any) => setFormData({...formData, email: e.target.value})} />
                            <InputField id="password_login" type="password" placeholder="Mot de passe" icon={LockIcon} value={formData.password} onChange={(e:any) => setFormData({...formData, password: e.target.value})} />
                            
                            <button type="submit" disabled={isLoading} className="w-full bg-brand-primary text-white font-black py-5 rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all uppercase tracking-[0.2em] text-[11px]">
                                {isLoading ? 'CHARGEMENT...' : "CONNEXION"}
                            </button>
                        </form>

                        <SocialButtons />

                        <div className="mt-10 text-center">
                            <button onClick={() => setIsSignUpActive(true)} className="text-gray-400 font-black text-[11px] uppercase tracking-widest border-b border-gray-100 hover:text-brand-primary hover:border-brand-primary transition-all pb-1">
                                Pas de compte ? Inscription
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. RIGHT SIDE: SIGN UP FORM */}
                <div className={`w-full md:w-1/2 p-10 md:p-20 flex flex-col justify-center transition-all duration-700 absolute right-0 top-0 bottom-0 ${!isSignUpActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <div className="max-w-md mx-auto w-full">
                        <div className="mb-10">
                            <h2 className="text-5xl font-serif font-black text-gray-900 dark:text-white mb-2 leading-none uppercase tracking-tighter">
                                <span className="text-brand-primary italic">Inscription</span>
                            </h2>
                            <p className="text-gray-400 font-medium text-sm">Rejoignez l'excellence PharmaNature.</p>
                        </div>

                        <form onSubmit={handleAction} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <InputField id="firstName" type="text" placeholder="Prénom" icon={UserIcon} value={formData.firstName} onChange={(e:any) => setFormData({...formData, firstName: e.target.value})} />
                                <InputField id="lastName" type="text" placeholder="Nom" icon={UserIcon} value={formData.lastName} onChange={(e:any) => setFormData({...formData, lastName: e.target.value})} />
                            </div>
                            <InputField id="email_reg" type="email" placeholder="Email" icon={MailIcon} value={formData.email} onChange={(e:any) => setFormData({...formData, email: e.target.value})} />
                            <InputField id="password_reg" type="password" placeholder="Mot de passe" icon={LockIcon} value={formData.password} onChange={(e:any) => setFormData({...formData, password: e.target.value})} />
                            
                            <button type="submit" disabled={isLoading} className="w-full bg-brand-primary text-white font-black py-5 rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all uppercase tracking-[0.2em] text-[11px]">
                                {isLoading ? 'CRÉATION...' : "INSCRIPTION"}
                            </button>
                        </form>

                        <SocialButtons />

                        <div className="mt-10 text-center">
                            <button onClick={() => setIsSignUpActive(false)} className="text-gray-400 font-black text-[11px] uppercase tracking-widest border-b border-gray-100 hover:text-brand-primary hover:border-brand-primary transition-all pb-1">
                                Déjà inscrit ? Connexion
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. SLIDING VISUAL PANEL (Desktop Only) */}
                <div 
                    className={`hidden md:block absolute top-0 bottom-0 w-1/2 z-30 transition-transform duration-700 ease-in-out will-change-transform bg-brand-primary ${isSignUpActive ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <div className="relative w-full h-full overflow-hidden">
                        <img 
                            src={isSignUpActive 
                                ? "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1000" 
                                : "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000"
                            }
                            alt="PharmaNature Experience" 
                            className="w-full h-full object-cover mix-blend-multiply opacity-60 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent"></div>
                        
                        <div className="absolute inset-0 flex flex-col justify-center p-16 text-white">
                            <div className="mb-6 inline-flex items-center gap-3 bg-white/20 backdrop-blur-md px-5 py-2 rounded-full border border-white/30 w-fit">
                                <SparklesIcon className="w-4 h-4 text-white" />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Laboratoire Certifié</span>
                            </div>
                            <h3 className="text-5xl font-serif font-black leading-[1.1] mb-8 drop-shadow-2xl">
                                {isSignUpActive 
                                    ? "Découvrez le futur de votre bien-être." 
                                    : "Votre santé mérite l'excellence scientifique."
                                }
                            </h3>
                            <div className="h-1 w-20 bg-brand-secondary rounded-full"></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};


import React, { useState, useEffect } from 'react';
import type { User, Address } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { UserIcon, LocationIcon, LockIcon, PencilIcon, TrashIcon, PlusIcon, SparklesIcon } from './IconComponents';

interface ProfilePageProps {
    user: User | null;
    onNavigateHome: () => void;
    onUpdateUser: (user: User) => void;
}

type ProfileTab = 'info' | 'address' | 'security';

const TabButton: React.FC<{ icon: React.ReactNode; label: string; tab: ProfileTab; activeTab: ProfileTab; onClick: (tab: ProfileTab) => void }> = 
({ icon, label, tab, activeTab, onClick }) => (
    <button 
        onClick={() => onClick(tab)} 
        className={`w-full flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-300 ${
            activeTab === tab 
            ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 font-bold scale-105' 
            : 'text-gray-500 dark:text-gray-400 hover:bg-brand-light dark:hover:bg-white/5'
        }`}
    >
        <span className={activeTab === tab ? 'text-white' : 'text-brand-primary'}>{icon}</span>
        <span className="uppercase text-xs tracking-widest">{label}</span>
    </button>
);

const InfoSection: React.FC<{ user: User, onUpdateUser: (user: User) => void }> = ({ user, onUpdateUser }) => {
    return (
        <div className="animate-fadeIn space-y-12">
            <div>
                <h3 className="text-3xl font-serif font-black text-gray-900 dark:text-white mb-2">Informations de <span className="text-brand-primary">Santé</span></h3>
                <p className="text-gray-400 font-medium italic">Vos données personnelles sécurisées par PharmaNature.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField label="Prénom" id="firstName" value={user.firstName} readOnly />
                <InputField label="Nom" id="lastName" value={user.lastName} readOnly />
                <InputField label="Adresse e-mail" id="email" value={user.email} readOnly />
                <InputField label="Numéro de téléphone" id="phone" value={user.phone} />
                <InputField label="Âge" id="age" type="number" value={user.age || ''} />
            </div>
             <div className="flex justify-end mt-12">
                <button className="bg-brand-primary text-white font-black py-4 px-12 rounded-2xl hover:bg-brand-primaryHover transition-all shadow-xl shadow-brand-primary/20 uppercase tracking-widest text-xs">Mettre à jour mon dossier</button>
            </div>
        </div>
    );
};

const AddressSection: React.FC<{ user: User, onUpdateUser: (user: User) => void }> = ({ user, onUpdateUser }) => {
    return (
        <div className="animate-fadeIn space-y-12">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-3xl font-serif font-black text-gray-900 dark:text-white mb-2">Adresses de <span className="text-brand-primary">Livraison</span></h3>
                    <p className="text-gray-400 font-medium italic">Gérez vos points de réception officiels.</p>
                </div>
                <button className="bg-brand-secondary text-white font-black text-[10px] py-4 px-8 rounded-2xl flex items-center gap-3 hover:opacity-90 transition-all uppercase tracking-widest shadow-lg shadow-brand-secondary/20">
                    <PlusIcon className="w-4 h-4" />
                    Nouvelle Adresse
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {user.addresses.map(addr => (
                <div key={addr.id} className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-brand-primary group-hover:scale-125 transition-transform"><LocationIcon className="w-20 h-20"/></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <p className="font-serif font-bold text-xl text-gray-900 dark:text-white">{addr.type} {addr.isDefault && <span className="text-[9px] font-black bg-brand-accent text-white px-2 py-0.5 rounded-full ml-3 uppercase tracking-tighter">Défaut</span>}</p>
                             <div className="flex gap-2">
                                <button className="text-gray-400 hover:text-brand-primary p-2 transition-colors"><PencilIcon className="w-5 h-5"/></button>
                                <button className="text-gray-400 hover:text-rose-500 p-2 transition-colors"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed uppercase text-xs tracking-widest">{addr.street}<br/>{addr.city}, {addr.postalCode}</p>
                    </div>
                </div>
            ))}
            </div>
        </div>
    );
};

const SecuritySection: React.FC = () => (
    <div className="animate-fadeIn space-y-12">
        <div>
            <h3 className="text-3xl font-serif font-black text-gray-900 dark:text-white mb-2">Sécurité du <span className="text-brand-primary">Compte</span></h3>
            <p className="text-gray-400 font-medium italic">Gérez vos accès et protections.</p>
        </div>
        <div className="max-w-md space-y-6">
             <InputField label="Ancien mot de passe" id="oldPassword" type="password" />
             <InputField label="Nouveau mot de passe" id="newPassword" type="password" />
             <InputField label="Confirmer le nouveau mot de passe" id="confirmPassword" type="password" />
        </div>
        <div className="flex justify-start mt-12">
            <button className="bg-brand-primary text-white font-black py-4 px-12 rounded-2xl hover:bg-brand-primaryHover transition-all shadow-xl shadow-brand-primary/20 uppercase tracking-widest text-xs">Actualiser les accès</button>
        </div>
    </div>
);

const InputField: React.FC<{ label: string; id: string; value?: string | number; type?: string; readOnly?: boolean }> = ({ label, id, value, type = "text", readOnly = false }) => (
    <div className="space-y-2">
        <label htmlFor={id} className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em]">{label}</label>
        <input type={type} id={id} name={id} defaultValue={value} readOnly={readOnly} className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary transition-all read-only:bg-gray-100 dark:read-only:bg-black/20" />
    </div>
);


export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onNavigateHome, onUpdateUser }) => {
    const [activeTab, setActiveTab] = useState<ProfileTab>('info');

    useEffect(() => {
        document.title = `Mon Dossier de Santé - PharmaNature`;
        window.scrollTo(0, 0);
    }, []);

    if (!user) return <div className="h-screen flex items-center justify-center text-brand-primary font-black uppercase tracking-widest">Connexion Recommandée...</div>;

    return (
        <div className="bg-white dark:bg-brand-dark min-h-screen pb-32">
            <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-12">
                <div className="mb-12">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Espace Patient' }]} />
                </div>
                
                <main className="bg-gray-50 dark:bg-white/5 rounded-[4rem] overflow-hidden border border-gray-100 dark:border-white/5">
                    <div className="flex flex-col lg:flex-row min-h-[650px]">
                        {/* Tabs Navigation */}
                        <aside className="w-full lg:w-1/4 p-10 lg:border-r border-gray-100 dark:border-white/5 bg-white/30 dark:bg-black/10">
                            <div className="mb-12 flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-brand-primary rounded-[2rem] flex items-center justify-center text-white mb-6 shadow-2xl shadow-brand-primary/30">
                                    <UserIcon className="w-12 h-12" />
                                </div>
                                <h2 className="text-2xl font-serif font-black text-gray-900 dark:text-white leading-tight">{user.firstName} <br/> <span className="text-brand-primary">{user.lastName}</span></h2>
                                <p className="text-[10px] text-gray-400 mt-2 font-black uppercase tracking-widest">Patient depuis {new Date().getFullYear()}</p>
                            </div>
                             <nav className="space-y-3">
                                <TabButton icon={<UserIcon className="w-5 h-5"/>} label="Mon Profil" tab="info" activeTab={activeTab} onClick={setActiveTab} />
                                <TabButton icon={<LocationIcon className="w-5 h-5"/>} label="Mes Adresses" tab="address" activeTab={activeTab} onClick={setActiveTab} />
                                <TabButton icon={<LockIcon className="w-5 h-5"/>} label="Sécurité" tab="security" activeTab={activeTab} onClick={setActiveTab} />
                            </nav>
                        </aside>

                        {/* Tab Content */}
                        <div className="flex-grow p-10 lg:p-20 bg-white dark:bg-transparent">
                            {renderContent()}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );

    function renderContent() {
        switch(activeTab) {
            case 'info': return <InfoSection user={user} onUpdateUser={onUpdateUser} />;
            case 'address': return <AddressSection user={user} onUpdateUser={onUpdateUser} />;
            case 'security': return <SecuritySection />;
            default: return null;
        }
    }
};

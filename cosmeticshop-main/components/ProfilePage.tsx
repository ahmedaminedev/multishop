
import React, { useState, useEffect } from 'react';
import type { User, Address } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { UserIcon, LocationIcon, LockIcon, PencilIcon, TrashIcon, PlusIcon } from './IconComponents';

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
        className={`w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors ${
            activeTab === tab 
            ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 font-semibold' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const InfoSection: React.FC<{ user: User, onUpdateUser: (user: User) => void }> = ({ user, onUpdateUser }) => {
    return (
        <div className="animate-fadeIn">
            <h3 className="text-2xl font-bold mb-6">Informations Personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Prénom" id="firstName" value={user.firstName} readOnly />
                <InputField label="Nom" id="lastName" value={user.lastName} readOnly />
                <InputField label="Adresse e-mail" id="email" value={user.email} readOnly />
                <InputField label="Numéro de téléphone" id="phone" value={user.phone} />
                <InputField label="Âge" id="age" type="number" value={user.age || ''} />
            </div>
             <div className="flex justify-end mt-8">
                <button className="bg-red-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Enregistrer les modifications</button>
            </div>
        </div>
    );
};

const AddressSection: React.FC<{ user: User, onUpdateUser: (user: User) => void }> = ({ user, onUpdateUser }) => {
    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Mes Adresses</h3>
                <button className="bg-green-600 text-white font-semibold text-sm py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors">
                    <PlusIcon className="w-5 h-5" />
                    Ajouter une nouvelle adresse
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user.addresses.map(addr => (
                <div key={addr.id} className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-lg border dark:border-gray-600">
                    <div className="flex justify-between items-start mb-3">
                        <p className="font-bold text-lg">{addr.type} {addr.isDefault && <span className="text-xs bg-yellow-400 text-gray-800 px-2 py-0.5 rounded-full ml-2 align-middle">Défaut</span>}</p>
                         <div className="flex gap-1">
                            <button className="text-blue-600 p-2 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full transition-colors"><PencilIcon className="w-5 h-5"/></button>
                            <button className="text-red-600 p-2 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{addr.street}<br/>{addr.city}, {addr.postalCode}</p>
                </div>
            ))}
            </div>
        </div>
    );
};

const SecuritySection: React.FC = () => (
    <div className="animate-fadeIn">
        <h3 className="text-2xl font-bold mb-6">Changer le mot de passe</h3>
        <div className="max-w-md space-y-4">
             <InputField label="Ancien mot de passe" id="oldPassword" type="password" />
             <InputField label="Nouveau mot de passe" id="newPassword" type="password" />
             <InputField label="Confirmer le nouveau mot de passe" id="confirmPassword" type="password" />
        </div>
        <div className="flex justify-start mt-8">
            <button className="bg-red-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Mettre à jour le mot de passe</button>
        </div>
    </div>
);

const InputField: React.FC<{ label: string; id: string; value?: string | number; type?: string; readOnly?: boolean }> = ({ label, id, value, type = "text", readOnly = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input type={type} id={id} name={id} defaultValue={value} readOnly={readOnly} className="w-full bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all read-only:bg-gray-100 dark:read-only:bg-gray-800 dark:read-only:border-gray-700" />
    </div>
);


export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onNavigateHome, onUpdateUser }) => {
    const [activeTab, setActiveTab] = useState<ProfileTab>('info');

    useEffect(() => {
        document.title = `Mon Profil - Electro Shop`;
        const style = document.createElement('style');
        style.innerHTML = `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-in-out;
        }
        `;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }, []);

    if (!user) {
        return <div>Chargement...</div>;
    }

    const renderContent = () => {
        switch(activeTab) {
            case 'info': return <InfoSection user={user} onUpdateUser={onUpdateUser} />;
            case 'address': return <AddressSection user={user} onUpdateUser={onUpdateUser} />;
            case 'security': return <SecuritySection />;
            default: return null;
        }
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-950 min-h-screen">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Mon Compte' }]} />
                </div>
                
                <main className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <div className="p-6 border-b dark:border-gray-700">
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Bonjour, {user.firstName} !</h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-300">Gérez vos informations, commandes et adresses ici.</p>
                    </div>
                    
                    <div className="flex flex-col md:flex-row">
                        {/* Tabs Navigation */}
                        <aside className="w-full md:w-1/4 lg:w-1/5 p-6 border-r dark:border-gray-700">
                             <nav className="space-y-2">
                                <TabButton icon={<UserIcon className="w-5 h-5"/>} label="Mon Compte" tab="info" activeTab={activeTab} onClick={setActiveTab} />
                                <TabButton icon={<LocationIcon className="w-5 h-5"/>} label="Mes Adresses" tab="address" activeTab={activeTab} onClick={setActiveTab} />
                                <TabButton icon={<LockIcon className="w-5 h-5"/>} label="Sécurité" tab="security" activeTab={activeTab} onClick={setActiveTab} />
                            </nav>
                        </aside>

                        {/* Tab Content */}
                        <div className="flex-grow p-8">
                            {renderContent()}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

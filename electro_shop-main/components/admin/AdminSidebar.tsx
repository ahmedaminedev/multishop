
import React, { useState } from 'react';
import { Logo } from '../Logo';
import { ChartPieIcon, ShoppingBagIcon, TagIcon, CubeIcon, UsersIcon, InboxIcon, WrenchIcon, ArrowLongLeftIcon, SparklesIcon, StorefrontIcon } from '../IconComponents';
import type { AdminPageName } from './AdminPage';
import { CustomAlert } from '../CustomAlert';

interface AdminSidebarProps {
    activePage: AdminPageName;
    setActivePage: (page: AdminPageName) => void;
    onNavigateHome: () => void;
    onLogout: () => void;
}

// Chat Icon
const ChatBubbleLeftRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-2.281m-5.518 5.518a2.126 2.126 0 00-2.282-.476 2.125 2.125 0 00-1.53 2.105v4.286c0 1.136.847 2.1 1.98 2.193.34.027.68.052 1.02.072M6.825 19.475l-3 3V19.38c-.34-.02-.68-.045-1.02-.072a2.125 2.125 0 01-1.98-2.193V9.38c0-1.136.847-2.1 1.98-2.193 1.354-.109 2.694-.163 4.02-.163 1.98 0 3.9.115 5.685.345" />
    </svg>
);

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <li>
        <a
            href="#"
            onClick={(e) => { e.preventDefault(); onClick(); }}
            className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                isActive 
                ? 'bg-red-600 text-white shadow-md' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
            <span className="w-6 h-6">{icon}</span>
            <span className="ml-4 font-semibold">{label}</span>
        </a>
    </li>
);

// Simple logout icon since we are using IconComponents
const ArrowLeftOnRectangleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
);

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activePage, setActivePage, onNavigateHome, onLogout }) => {
    const [isLogoutAlertOpen, setIsLogoutAlertOpen] = useState(false);

    const handleLogoutClick = () => {
        setIsLogoutAlertOpen(true);
    };

    const confirmLogout = () => {
        setIsLogoutAlertOpen(false);
        onLogout();
    };

    const navItems: { id: AdminPageName, label: string, icon: React.ReactNode }[] = [
        { id: 'dashboard', label: 'Dashboard', icon: <ChartPieIcon /> },
        { id: 'chat', label: 'Live Chat', icon: <ChatBubbleLeftRightIcon /> },
        { id: 'products', label: 'Produits', icon: <ShoppingBagIcon /> },
        { id: 'categories', label: 'Catégories', icon: <TagIcon /> },
        { id: 'packs', label: 'Packs', icon: <CubeIcon /> },
        { id: 'orders', label: 'Commandes', icon: <UsersIcon /> },
        { id: 'messages', label: 'Messages', icon: <InboxIcon /> },
        { id: 'promotions', label: 'Promotions', icon: <SparklesIcon /> },
        { id: 'stores', label: 'Magasins', icon: <StorefrontIcon /> },
        { id: 'ads', label: 'Publicités', icon: <WrenchIcon /> },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col flex-shrink-0">
            <div className="h-20 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
                <Logo />
            </div>
            <nav className="flex-1 px-4 py-6 overflow-y-auto">
                <ul className="space-y-2">
                    {navItems.map(item => (
                        <NavItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            isActive={activePage === item.id}
                            onClick={() => setActivePage(item.id)}
                        />
                    ))}
                </ul>
            </nav>
            <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
                 <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleLogoutClick(); }}
                    className="flex items-center p-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-semibold"
                >
                    <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                    <span className="ml-4">Déconnexion</span>
                </a>
                 <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); onNavigateHome(); }}
                    className="flex items-center p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <ArrowLongLeftIcon className="w-6 h-6" />
                    <span className="ml-4 font-semibold">Retour Boutique</span>
                </a>
            </div>

            {/* Popup CustomAlert pour confirmation de déconnexion */}
            <CustomAlert 
                isOpen={isLogoutAlertOpen}
                onClose={() => setIsLogoutAlertOpen(false)}
                title="Déconnexion"
                message="Êtes-vous sûr de vouloir vous déconnecter du tableau de bord ?"
                type="warning"
                showCancelButton={true}
                confirmText="Oui, déconnecter"
                onConfirm={confirmLogout}
            />
        </aside>
    );
};

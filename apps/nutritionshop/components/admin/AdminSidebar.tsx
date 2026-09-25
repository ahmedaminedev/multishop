import React, { useState } from 'react';
import { Logo } from '../Logo';
import { ChartPieIcon, ShoppingBagIcon, TagIcon, CubeIcon, UsersIcon, InboxIcon, HomeIcon, ArrowLongLeftIcon, SparklesIcon, StorefrontIcon } from '../IconComponents';
import type { AdminPageName } from './AdminPage';
import { CustomAlert } from '../CustomAlert';
import { ThemeToggle } from '../ThemeToggle';

interface AdminSidebarProps {
    activePage: AdminPageName;
    setActivePage: (page: AdminPageName) => void;
    onNavigateHome: () => void;
    onLogout: () => void;
}

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
            className={`
                group relative flex items-center px-4 py-3 my-1 transition-all duration-300 overflow-hidden
                ${isActive 
                    ? 'text-white dark:text-black bg-black dark:bg-brand-neon skew-x-[-12deg] translate-x-2 border-r-4 border-gray-400 dark:border-white shadow-md' 
                    : 'text-gray-600 dark:text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                }
            `}
        >
            <span className={`relative z-10 w-5 h-5 transition-transform duration-300 ${isActive ? 'skew-x-[12deg]' : 'group-hover:scale-110'}`}>
                {icon}
            </span>
            <span className={`relative z-10 ml-4 font-bold uppercase tracking-wider text-[10px] ${isActive ? 'skew-x-[12deg]' : ''}`}>
                {label}
            </span>
            {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/50 dark:via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
            )}
        </a>
    </li>
);

const ArrowLeftOnRectangleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
);

const TagIconSolid = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M5.25 2.25a3 3 0 00-3 3v4.318a3 3 0 00.879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 005.441-5.44c.766-1.16.346-2.632-.575-3.553l-9.58-9.581a3 3 0 00-2.122-.879H5.25zM6.375 7.5a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" clipRule="evenodd" />
    </svg>
);

const StarIconSolid = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
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
        { id: 'dashboard', label: 'Command Center', icon: <ChartPieIcon /> },
        { id: 'chat', label: 'Live Ops', icon: <ChatBubbleLeftRightIcon /> },
        { id: 'home', label: 'Front Office', icon: <HomeIcon /> },
        { id: 'offers', label: 'Offres & Deals', icon: <TagIconSolid /> },
        { id: 'products', label: 'Armurerie', icon: <ShoppingBagIcon /> }, 
        { id: 'categories', label: 'Catégories', icon: <TagIcon /> },
        { id: 'brands', label: 'Marques', icon: <StarIconSolid className="w-6 h-6"/> },
        { id: 'packs', label: 'Packs Elite', icon: <CubeIcon /> },
        { id: 'orders', label: 'Logistique', icon: <UsersIcon /> },
        { id: 'messages', label: 'Transmissions', icon: <InboxIcon /> },
        { id: 'promotions', label: 'Codes Promo', icon: <SparklesIcon /> },
        { id: 'stores', label: 'Bases / Magasins', icon: <StorefrontIcon /> },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-[#050505] border-r border-gray-300 dark:border-gray-800 flex flex-col flex-shrink-0 h-full z-50 relative overflow-hidden transition-colors duration-300">
            <div className="h-24 flex items-center justify-center border-b border-gray-300 dark:border-gray-800 bg-white dark:bg-[#050505] relative z-10 transition-colors">
                <Logo />
            </div>
            
            <div className="px-4 py-6 relative z-10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 dark:bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                    <p className="text-[10px] font-black text-gray-700 dark:text-gray-400 uppercase tracking-[0.25em]">Système Actif</p>
                </div>
                <div className="scale-75 origin-right">
                    <ThemeToggle />
                </div>
            </div>

            {/* --- SCROLLABLE AREA --- */}
            <nav className="flex-1 px-2 overflow-y-auto custom-scrollbar relative z-10 pb-10">
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

            <div className="p-4 border-t border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#080808] relative z-10 space-y-3 transition-colors flex-shrink-0">
                 <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleLogoutClick(); }}
                    className="flex items-center justify-center p-3 text-red-600 border border-red-200 dark:border-red-900/30 hover:bg-red-600 hover:text-white transition-all font-bold text-xs uppercase tracking-widest skew-x-[-10deg]"
                >
                    <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-2 skew-x-[10deg]" />
                    <span className="skew-x-[10deg]">Déconnexion</span>
                </a>
                 <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); onNavigateHome(); }}
                    className="flex items-center justify-center p-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-800 hover:bg-black dark:hover:border-brand-neon hover:text-white dark:hover:text-brand-neon dark:hover:bg-transparent transition-all font-bold text-xs uppercase tracking-widest skew-x-[-10deg]"
                >
                    <ArrowLongLeftIcon className="w-4 h-4 mr-2 skew-x-[10deg]" />
                    <span className="skew-x-[10deg]">Retour Site</span>
                </a>
            </div>

            <CustomAlert 
                isOpen={isLogoutAlertOpen}
                onClose={() => setIsLogoutAlertOpen(false)}
                title="Déconnexion"
                message="Voulez-vous vraiment quitter le centre de commande ?"
                type="warning"
                showCancelButton={true}
                confirmText="Oui, déconnecter"
                onConfirm={confirmLogout}
            />

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #ccff00; border-radius: 10px; }
            `}</style>
        </aside>
    );
};

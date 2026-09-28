
import React, { useState } from 'react';
import { Logo } from '../Logo';
import { 
    ChartPieIcon, 
    ShoppingBagIcon, 
    TagIcon, 
    CubeIcon, 
    UsersIcon, 
    InboxIcon, 
    HomeIcon, 
    SparklesIcon, 
    StorefrontIcon,
    AdjustmentsHorizontalIcon,
    ChatBubbleLeftRightIcon
} from '../IconComponents';
import type { AdminPageName } from './AdminPage';
import { CustomAlert } from '../CustomAlert';
import { ThemeToggle } from '../ThemeToggle';

interface AdminSidebarProps {
    activePage: AdminPageName;
    setActivePage: (page: AdminPageName) => void;
    onNavigateHome: () => void;
    onLogout: () => void;
}

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
                group relative flex items-center px-6 py-4 transition-all duration-500 rounded-2xl mb-2
                ${isActive 
                    ? 'text-white bg-brand-primary shadow-xl shadow-brand-primary/20 scale-[1.02]' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-brand-primary hover:bg-brand-light dark:hover:bg-white/5'
                }
            `}
        >
            <span className={`w-5 h-5 transition-transform duration-500 group-hover:scale-110 ${isActive ? 'text-white' : ''}`}>{icon}</span>
            <span className="ml-4 font-bold text-xs tracking-widest uppercase">{label}</span>
            {isActive && <span className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>}
        </a>
    </li>
);

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activePage, setActivePage, onNavigateHome, onLogout }) => {
    const [isLogoutAlertOpen, setIsLogoutAlertOpen] = useState(false);

    const navItems: { id: AdminPageName, label: string, icon: React.ReactNode }[] = [
        { id: 'dashboard', label: 'Analyse & Pilotage', icon: <ChartPieIcon /> },
        { id: 'chat', label: 'Support Live', icon: <ChatBubbleLeftRightIcon /> },
        { id: 'home', label: 'Design Boutique', icon: <HomeIcon /> },
        { id: 'offers', label: 'Design Offres', icon: <AdjustmentsHorizontalIcon /> },
        { id: 'products', label: 'Catalogue Officine', icon: <ShoppingBagIcon /> }, 
        { id: 'categories', label: 'Rayons Experts', icon: <TagIcon /> },
        { id: 'brands', label: 'Laboratoires', icon: <SparklesIcon /> },
        { id: 'packs', label: 'Rituels de Soin', icon: <CubeIcon /> },
        { id: 'orders', label: 'Dossiers Commandes', icon: <UsersIcon /> },
        { id: 'messages', label: 'Conseils Patients', icon: <InboxIcon /> },
        { id: 'promotions', label: 'Cures Privilèges', icon: <TagIcon /> },
        { id: 'stores', label: 'Nos Pharmacies', icon: <StorefrontIcon /> },
    ];

    return (
        <aside className="w-80 bg-white dark:bg-brand-dark border-r border-gray-100 dark:border-white/5 flex flex-col h-full z-50 transition-all duration-500">
            <div className="h-32 flex items-center justify-center border-b border-gray-50 dark:border-white/5 bg-slate-50/30 dark:bg-black/10">
                <Logo />
            </div>
            
            <div className="px-8 py-8 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Officine en ligne</span>
                </div>
                <ThemeToggle />
            </div>

            <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar pb-10">
                <ul className="space-y-1">
                    {navItems.map(item => (
                        <NavItem key={item.id} icon={item.icon} label={item.label} isActive={activePage === item.id} onClick={() => setActivePage(item.id)} />
                    ))}
                </ul>
            </nav>

            <div className="p-6 border-t border-gray-50 dark:border-white/5 space-y-3 bg-slate-50/30 dark:bg-black/10">
                 <button onClick={() => setIsLogoutAlertOpen(true)} className="w-full flex items-center justify-center p-4 text-rose-500 bg-white dark:bg-rose-900/10 rounded-2xl hover:bg-rose-500 hover:text-white transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm">
                    Terminer Session
                </button>
                 <button onClick={onNavigateHome} className="w-full flex items-center justify-center p-4 text-brand-primary bg-brand-light dark:bg-brand-primary/10 rounded-2xl hover:bg-brand-primary hover:text-white transition-all font-bold text-[10px] uppercase tracking-widest border border-brand-primary/10">
                    Boutique Front
                </button>
            </div>

            <CustomAlert 
                isOpen={isLogoutAlertOpen} onClose={() => setIsLogoutAlertOpen(false)} title="Session" message="Quitter l'espace de gestion PharmaNature ?" type="warning" showCancelButton={true} confirmText="Quitter" onConfirm={onLogout}
            />
        </aside>
    );
};

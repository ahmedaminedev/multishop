
import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { DashboardHomePage } from './DashboardHomePage';
import { ManageProductsPage } from './ManageProductsPage';
import { ManageCategoriesPage } from './ManageCategoriesPage';
import { ManagePacksPage } from './ManagePacksPage';
import { ViewOrdersPage } from './ViewOrdersPage';
import { ViewMessagesPage } from './ViewMessagesPage';
import { ManageHomePage } from './ManageHomePage';
import { ManagePromotionsPage } from './ManagePromotionsPage';
import { ManageStoresPage } from './ManageStoresPage';
import { AdminChat } from './AdminChat';
import { ManageOffersPage } from './ManageOffersPage'; 
import { ManageBrandsPage } from './ManageBrandsPage';
import type { Product, Category, Pack, Order, ContactMessage, Advertisements, Promotion, Store, Brand } from '../../types';

export type AdminPageName = 'dashboard' | 'chat' | 'products' | 'categories' | 'packs' | 'orders' | 'messages' | 'promotions' | 'home' | 'stores' | 'offers' | 'brands';

interface AdminPageProps {
    onNavigateHome: () => void;
    onLogout: () => void;
    productsData: Product[];
    setProductsData: React.Dispatch<React.SetStateAction<Product[]>>;
    categoriesData: Category[];
    setCategoriesData: React.Dispatch<React.SetStateAction<Category[]>>;
    packsData: Pack[];
    setPacksData: React.Dispatch<React.SetStateAction<Pack[]>>;
    ordersData: Order[];
    setOrdersData: React.Dispatch<React.SetStateAction<Order[]>>;
    messagesData: ContactMessage[];
    setMessagesData: React.Dispatch<React.SetStateAction<ContactMessage[]>>;
    advertisementsData: Advertisements;
    setAdvertisementsData: React.Dispatch<React.SetStateAction<Advertisements>>;
    promotionsData: Promotion[];
    setPromotionsData: React.Dispatch<React.SetStateAction<Promotion[]>>;
    storesData: Store[];
    setStoresData: React.Dispatch<React.SetStateAction<Store[]>>;
    brandsData: Brand[];
    setBrandsData: React.Dispatch<React.SetStateAction<Brand[]>>;
    hideSidebar?: boolean;
    forcedPage?: AdminPageName;
}

export const AdminPage: React.FC<AdminPageProps> = (props) => {
    const [activePage, setActivePage] = useState<AdminPageName>('dashboard');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const effectivePage = props.forcedPage || activePage;

    const renderActivePage = () => {
        switch (effectivePage) {
            case 'dashboard':
                return <DashboardHomePage orders={props.ordersData} products={props.productsData} messages={props.messagesData}/>;
            case 'chat':
                return <AdminChat />;
            case 'products':
                return <ManageProductsPage 
                            products={props.productsData} 
                            setProducts={props.setProductsData} 
                            categories={props.categoriesData}
                            brands={props.brandsData}
                        />;
            case 'categories':
                return <ManageCategoriesPage 
                            categories={props.categoriesData}
                            setCategories={props.setCategoriesData}
                        />;
            case 'brands':
                return <ManageBrandsPage 
                            brands={props.brandsData}
                            setBrands={props.setBrandsData}
                            categories={props.categoriesData}
                        />;
            case 'packs':
                return <ManagePacksPage 
                            packs={props.packsData}
                            setPacks={props.setPacksData}
                            allProducts={props.productsData}
                            allCategories={props.categoriesData}
                        />;
            case 'orders':
                return <ViewOrdersPage orders={props.ordersData} setOrders={props.setOrdersData} />;
            case 'messages':
                return <ViewMessagesPage messages={props.messagesData} />;
             case 'promotions':
                return <ManagePromotionsPage
                            promotions={props.promotionsData}
                            setPromotions={props.setPromotionsData}
                            allProducts={props.productsData}
                            allPacks={props.packsData}
                            allCategories={props.categoriesData}
                        />;
            case 'stores':
                return <ManageStoresPage 
                            stores={props.storesData}
                            setStores={props.setStoresData}
                        />;
            case 'home':
                return <ManageHomePage 
                            initialAds={props.advertisementsData}
                            onSave={props.setAdvertisementsData}
                            allProducts={props.productsData}
                            allPacks={props.packsData}
                            allCategories={props.categoriesData}
                        />;
            case 'offers': 
                return <ManageOffersPage allProducts={props.productsData} />;
            default:
                return <DashboardHomePage orders={props.ordersData} products={props.productsData} messages={props.messagesData}/>;
        }
    };

    // Determine if the current page is a visual editor that needs full height/width
    const isVisualEditor = effectivePage === 'home' || effectivePage === 'offers' || effectivePage === 'chat';

    return (
        <div className={`flex flex-col md:flex-row ${props.hideSidebar ? 'h-auto min-h-0 bg-transparent' : 'h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden'}`}>
            {!props.hideSidebar && (
                <>
                    {/* Mobile Top App Bar */}
                    <div className="md:hidden bg-white dark:bg-[#050505] border-b border-gray-200 dark:border-gray-800 px-3.5 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
                        <button
                            type="button"
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                            <span className="text-sm">☰</span>
                            <span className="uppercase text-[10px] tracking-wider">Menu</span>
                        </button>
                        <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                            Fitness Shop Console
                        </span>
                        <button
                            type="button"
                            onClick={props.onNavigateHome}
                            className="text-[11px] font-bold text-lime-600 dark:text-brand-neon hover:underline cursor-pointer"
                        >
                            Vitrine →
                        </button>
                    </div>

                    <AdminSidebar 
                        activePage={activePage} 
                        setActivePage={setActivePage} 
                        onNavigateHome={props.onNavigateHome} 
                        onLogout={props.onLogout}
                        isMobileOpen={isMobileSidebarOpen}
                        onCloseMobile={() => setIsMobileSidebarOpen(false)}
                    />
                </>
            )}
            
            <main className={`relative flex-1 flex flex-col min-w-0 ${props.hideSidebar ? 'p-0 overflow-visible' : (isVisualEditor ? 'p-0 overflow-hidden' : 'p-3 sm:p-6 lg:p-8 overflow-y-auto')}`}>
                {renderActivePage()}
            </main>
        </div>
    );
};

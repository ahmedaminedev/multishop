
import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { DashboardHomePage } from './DashboardHomePage';
import { ManageProductsPage } from './ManageProductsPage';
import { ManageCategoriesPage } from './ManageCategoriesPage';
import { ManagePacksPage } from './ManagePacksPage';
import { ViewOrdersPage } from './ViewOrdersPage';
import { ViewMessagesPage } from './ViewMessagesPage';
import { ManageAdsPage } from './ManageAdsPage';
import { ManagePromotionsPage } from './ManagePromotionsPage';
import { ManageStoresPage } from './ManageStoresPage';
import { AdminChat } from './AdminChat';
import type { Product, Category, Pack, Order, ContactMessage, Advertisements, Promotion, Store } from '../../types';

export type AdminPageName = 'dashboard' | 'chat' | 'products' | 'categories' | 'packs' | 'orders' | 'messages' | 'promotions' | 'ads' | 'stores';

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
}

export const AdminPage: React.FC<AdminPageProps> = (props) => {
    const [activePage, setActivePage] = useState<AdminPageName>('dashboard');

    const renderActivePage = () => {
        switch (activePage) {
            case 'dashboard':
                return <DashboardHomePage orders={props.ordersData} products={props.productsData} messages={props.messagesData}/>;
            case 'chat':
                return <AdminChat />;
            case 'products':
                return <ManageProductsPage 
                            products={props.productsData} 
                            setProducts={props.setProductsData} 
                            categories={props.categoriesData}
                        />;
            case 'categories':
                return <ManageCategoriesPage 
                            categories={props.categoriesData}
                            setCategories={props.setCategoriesData}
                        />;
            case 'packs':
                return <ManagePacksPage 
                            packs={props.packsData}
                            setPacks={props.setPacksData}
                            allProducts={props.productsData}
                            allCategories={props.categoriesData}
                        />;
            case 'orders':
                return <ViewOrdersPage orders={props.ordersData} />;
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
            case 'ads':
                return <ManageAdsPage 
                            initialAds={props.advertisementsData}
                            onSave={props.setAdvertisementsData}
                            allProducts={props.productsData}
                            allPacks={props.packsData}
                            allCategories={props.categoriesData}
                        />;
            default:
                return <DashboardHomePage orders={props.ordersData} products={props.productsData} messages={props.messagesData}/>;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            <AdminSidebar activePage={activePage} setActivePage={setActivePage} onNavigateHome={props.onNavigateHome} onLogout={props.onLogout} />
            <main className="flex-1 p-8 overflow-y-auto">
                {renderActivePage()}
            </main>
        </div>
    );
};

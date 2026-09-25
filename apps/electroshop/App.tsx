
import React, { useState, useEffect, Suspense } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import { ToastProvider, useToast } from './components/ToastContext';
import { CartProvider, useCart } from './components/CartContext';
import { FavoritesProvider } from './components/FavoritesContext';
import { CompareProvider } from './components/CompareContext';

import { TopBar } from './components/TopBar';
import { Header } from './components/Header';
import { NavBar } from './components/NavBar';
import { Footer } from './components/Footer';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { SupportWidget } from './components/SupportWidget';
import { CartSidebar } from './components/CartSidebar';
import { ProductPreviewModal } from './components/ProductPreviewModal';

// Utils & Data
import { api } from './utils/api';
import type { User, Product, Category, Pack, Order, CartItem, CustomerInfo } from './types';
import { initialAdvertisements } from './constants';

// --- LAZY LOADING DES PAGES ---
// Cela permet de ne charger le code JavaScript d'une page que lorsque l'utilisateur la visite
const HomePage = React.lazy(() => import('./components/HomePage').then(module => ({ default: module.HomePage })));
const LoginPage = React.lazy(() => import('./components/LoginPage').then(module => ({ default: module.LoginPage })));
const ResetPasswordPage = React.lazy(() => import('./components/ResetPasswordPage').then(module => ({ default: module.ResetPasswordPage })));
const ProfilePage = React.lazy(() => import('./components/ProfilePage').then(module => ({ default: module.ProfilePage })));
const ProductListPage = React.lazy(() => import('./components/ProductListPage').then(module => ({ default: module.ProductListPage })));
const ProductDetailPage = React.lazy(() => import('./components/ProductDetailPage').then(module => ({ default: module.ProductDetailPage })));
const PacksPage = React.lazy(() => import('./components/PacksPage').then(module => ({ default: module.PacksPage })));
const PackDetailPage = React.lazy(() => import('./components/PackDetailPage').then(module => ({ default: module.PackDetailPage })));
const PromotionsPage = React.lazy(() => import('./components/PromotionsPage').then(module => ({ default: module.PromotionsPage })));
const BlogPage = React.lazy(() => import('./components/BlogPage').then(module => ({ default: module.BlogPage })));
const BlogPostPage = React.lazy(() => import('./components/BlogPostPage').then(module => ({ default: module.BlogPostPage })));
const ContactPage = React.lazy(() => import('./components/ContactPage').then(module => ({ default: module.ContactPage })));
const CheckoutPage = React.lazy(() => import('./components/CheckoutPage').then(module => ({ default: module.CheckoutPage })));
const OrderHistoryPage = React.lazy(() => import('./components/OrderHistoryPage').then(module => ({ default: module.OrderHistoryPage })));
const OrderDetailPage = React.lazy(() => import('./components/OrderDetailPage').then(module => ({ default: module.OrderDetailPage })));
const StoresPage = React.lazy(() => import('./components/StoresPage').then(module => ({ default: module.StoresPage })));
const ComparePage = React.lazy(() => import('./components/ComparePage').then(module => ({ default: module.ComparePage })));
const FavoritesPage = React.lazy(() => import('./components/FavoritesPage').then(module => ({ default: module.FavoritesPage })));
const AdminPage = React.lazy(() => import('./components/admin/AdminPage').then(module => ({ default: module.AdminPage })));
const PrivacyPolicyPage = React.lazy(() => import('./components/PrivacyPolicyPage').then(module => ({ default: module.PrivacyPolicyPage })));
const DataDeletionPage = React.lazy(() => import('./components/DataDeletionPage').then(module => ({ default: module.DataDeletionPage })));

// Loading Component
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
    </div>
);

const AppContent: React.FC = () => {
    // Navigation State
    const [currentPage, setCurrentPage] = useState('home');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [selectedPackId, setSelectedPackId] = useState<number | null>(null);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [selectedBlogPostSlug, setSelectedBlogPostSlug] = useState<string | null>(null);
    const [resetToken, setResetToken] = useState<string | null>(null); 
    
    // Data State
    const [user, setUser] = useState<User | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [packs, setPacks] = useState<Pack[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [promotionsData, setPromotionsData] = useState<any[]>([]);
    const [advertisements, setAdvertisements] = useState(initialAdvertisements);
    
    // UI State
    const [isNavCollapsed, setIsNavCollapsed] = useState(false);
    const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
    const { addToast } = useToast();
    const { clearCart } = useCart(); 

    // Check URL for OAuth Tokens or Reset Tokens
    useEffect(() => {
        const checkUrlParams = async () => {
            const hash = window.location.hash;
            const search = window.location.search; 
            
            const params = new URLSearchParams(search || hash.split('?')[1]);

            if (hash.includes('accessToken=')) {
                const token = params.get('accessToken');
                if (token) {
                    localStorage.setItem('token', token);
                    window.history.replaceState(null, '', window.location.pathname);
                    await handleLoginSuccess();
                }
            }
            else if (hash.includes('reset-password')) {
                const token = params.get('token');
                if (token) {
                    setResetToken(token);
                    setCurrentPage('reset-password');
                }
            }
            else if (hash.includes('success=registered') || hash.includes('error=')) {
                setCurrentPage('login');
            }
            else if (params.get('payment') === 'success') {
                const orderId = params.get('orderId');
                clearCart();
                addToast("Paiement réussi ! Votre commande est confirmée.", "success");
                
                if(user) {
                    api.getMyOrders().then(setOrders);
                }
                
                if (orderId) {
                    setSelectedOrderId(orderId);
                    setCurrentPage('order-detail');
                } else {
                    setCurrentPage('order-history');
                }
                window.history.replaceState(null, '', window.location.pathname);
            }
            else if (params.get('payment') === 'cancelled') {
                addToast("Paiement annulé.", "error");
                setCurrentPage('checkout'); 
                window.history.replaceState(null, '', window.location.pathname);
            }
            else if (hash.includes('privacy-policy')) {
                setCurrentPage('privacy-policy');
            }
            else if (hash.includes('data-deletion')) {
                setCurrentPage('data-deletion');
            }
        };
        checkUrlParams();
    }, [user, clearCart, addToast]); 

    // Initial Data Loading
    useEffect(() => {
        const loadData = async () => {
            try {
                const [productsData, packsData, categoriesData, storesData, adsData] = await Promise.all([
                    api.getProducts(),
                    api.getPacks(),
                    api.getCategories(),
                    api.getStores(),
                    api.getAdvertisements()
                ]);
                
                setProducts(productsData);
                setPacks(packsData);
                setCategories(categoriesData);
                setStores(storesData);
                setAdvertisements({...initialAdvertisements, ...adsData}); 

                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const userData = await api.getMe();
                        if (userData) setUser(userData);
                    } catch (e) {
                        localStorage.removeItem('token');
                        setUser(null);
                    }
                }
            } catch (error) {
                console.error("Error loading initial data:", error);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (user) {
            api.getMyOrders().then(setOrders).catch(console.error);
        } else {
            setOrders([]);
        }
    }, [user]);

    // --- Navigation Handlers ---
    const navigateToHome = () => setCurrentPage('home');
    const navigateToCategory = (category: string) => { setSelectedCategory(category); setCurrentPage('product-list'); };
    const navigateToProductDetail = (id: number | string) => { setSelectedProductId(Number(id)); setCurrentPage('product-detail'); };
    const navigateToPackDetail = (id: number | string) => { setSelectedPackId(Number(id)); setCurrentPage('pack-detail'); };
    const navigateToPacks = () => setCurrentPage('packs');
    const navigateToPromotions = () => setCurrentPage('promotions');
    const navigateToBlog = () => setCurrentPage('blog');
    const navigateToBlogPost = (slug: string) => { setSelectedBlogPostSlug(slug); setCurrentPage('blog-post'); };
    const navigateToContact = () => setCurrentPage('contact');
    const navigateToLogin = () => setCurrentPage('login');
    const navigateToProfile = () => setCurrentPage('profile');
    const navigateToCheckout = () => setCurrentPage('checkout');
    const navigateToOrderHistory = () => setCurrentPage('order-history');
    const navigateToOrderDetail = (id: string) => { setSelectedOrderId(id); setCurrentPage('order-detail'); };
    const navigateToStores = () => setCurrentPage('stores');
    const navigateToCompare = () => setCurrentPage('compare');
    const navigateToFavorites = () => setCurrentPage('favorites');
    const navigateToAdmin = () => setCurrentPage('admin');
    const navigateToPrivacyPolicy = () => setCurrentPage('privacy-policy');
    const navigateToDataDeletion = () => setCurrentPage('data-deletion');

    const handleLoginSuccess = async () => {
        try {
            const userData = await api.getMe();
            setUser(userData);
            setCurrentPage('home');
            addToast(`Bienvenue ${userData.firstName} !`, "success");
        } catch (e) {
            console.error("Login data fetch error", e);
        }
    };

    const handleLogout = async () => {
        await api.logout();
        setUser(null);
        localStorage.removeItem('token');
        setCurrentPage('login'); 
        addToast("Vous avez été déconnecté avec succès.", "info");
    };

    const handleOrderComplete = async (cartItems: CartItem[], customerInfo: CustomerInfo, paymentId?: string) => {
        // Cette fonction est maintenant principalement utilisée pour le paiement à la livraison
        // Pour le paiement en ligne, la création se fait dans CheckoutPage avant la redirection
        const newOrder = {
            id: paymentId || `ES-${Date.now()}`,
            customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
            date: new Date().toISOString(),
            total: cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
            status: 'En attente',
            itemCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
            items: cartItems.map(item => ({
                productId: parseInt(item.id.split('-')[1]),
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                imageUrl: item.imageUrl
            })),
            shippingAddress: {
                type: 'Domicile',
                street: customerInfo.address,
                city: customerInfo.city,
                postalCode: customerInfo.postalCode,
                isDefault: true
            },
            paymentMethod: paymentId ? 'Carte Bancaire' : 'Paiement à la livraison'
        };

        try {
            await api.createOrder(newOrder);
            setOrders(prev => [newOrder as any, ...prev]);
            setCurrentPage('order-history');
            addToast("Commande enregistrée avec succès !", "success");
        } catch (error: any) {
            addToast(error.message || "Erreur lors de l'enregistrement de la commande.", "error");
        }
    };

    const renderPage = () => {
        // 1. Pages "Standalone" (sans layout standard)
        if (currentPage === 'admin' && user?.role === 'ADMIN') {
            return (
                <Suspense fallback={<PageLoader />}>
                    <AdminPage 
                        onNavigateHome={navigateToHome}
                        onLogout={handleLogout}
                        productsData={products} setProductsData={setProducts}
                        categoriesData={categories} setCategoriesData={setCategories}
                        packsData={packs} setPacksData={setPacks}
                        ordersData={orders} setOrdersData={setOrders} 
                        messagesData={[]} setMessagesData={() => {}} 
                        advertisementsData={advertisements} setAdvertisementsData={setAdvertisements}
                        promotionsData={promotionsData} setPromotionsData={setPromotionsData}
                        storesData={stores} setStoresData={setStores}
                    />
                </Suspense>
            );
        }

        if (currentPage === 'reset-password') {
            return (
                <Suspense fallback={<PageLoader />}>
                    <ResetPasswordPage onNavigateHome={navigateToHome} token={resetToken || ''} />
                </Suspense>
            );
        }

        // 2. Layout Standard
        return (
            <div className="flex flex-col min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
                <TopBar user={user} onNavigateToAdmin={navigateToAdmin} onNavigateToStores={navigateToStores} />
                <Header 
                    user={user}
                    onNavigateToLogin={navigateToLogin} 
                    isLoggedIn={!!user} 
                    onLogout={handleLogout}
                    onNavigateToFavorites={navigateToFavorites}
                    onNavigateToProfile={navigateToProfile}
                    onNavigateToOrderHistory={navigateToOrderHistory}
                    allProducts={products}
                    allPacks={packs}
                    allCategories={categories}
                    onNavigateToCategory={navigateToCategory}
                    onNavigateToProductDetail={navigateToProductDetail}
                    onNavigateToCompare={navigateToCompare}
                />
                <NavBar 
                    onNavigateHome={navigateToHome}
                    onNavigateToPacks={navigateToPacks}
                    onNavigateToPromotions={navigateToPromotions}
                    onNavigateToBlog={navigateToBlog}
                    onNavigateToNews={() => {}}
                    onNavigateToContact={navigateToContact}
                />
                
                <main className="flex-grow">
                    <Suspense fallback={<PageLoader />}>
                        {currentPage === 'home' && (
                            <HomePage 
                                onNavigate={navigateToCategory}
                                isNavCollapsed={isNavCollapsed}
                                onToggleNav={() => setIsNavCollapsed(!isNavCollapsed)}
                                onPreview={setPreviewProduct}
                                onNavigateToPacks={navigateToPacks}
                                products={products}
                                packs={packs}
                                advertisements={advertisements}
                                onNavigateToProductDetail={navigateToProductDetail}
                                categories={categories}
                                brands={[]} 
                            />
                        )}
                        {currentPage === 'product-list' && (
                            <ProductListPage 
                                categoryName={selectedCategory}
                                onNavigateHome={navigateToHome}
                                onNavigateToCategory={navigateToCategory}
                                isNavCollapsed={isNavCollapsed}
                                onToggleNav={() => setIsNavCollapsed(!isNavCollapsed)}
                                onPreview={setPreviewProduct}
                                onNavigateToPacks={navigateToPacks}
                                products={products}
                                onNavigateToProductDetail={navigateToProductDetail}
                                categories={categories}
                            />
                        )}
                        {currentPage === 'product-detail' && selectedProductId && (
                            <ProductDetailPage 
                                product={products.find(p => p.id === selectedProductId) || products[0]} 
                                allProducts={products}
                                onNavigateHome={navigateToHome}
                                onNavigateToProductDetail={navigateToProductDetail}
                                onPreview={setPreviewProduct}
                            />
                        )}
                        {currentPage === 'packs' && (
                            <PacksPage 
                                onNavigateHome={navigateToHome}
                                onNavigateToCategory={navigateToCategory}
                                isNavCollapsed={isNavCollapsed}
                                onToggleNav={() => setIsNavCollapsed(!isNavCollapsed)}
                                packs={packs}
                                allProducts={products}
                                allPacks={packs}
                                onNavigateToPacks={navigateToPacks}
                                onNavigateToPackDetail={navigateToPackDetail}
                                categories={categories}
                            />
                        )}
                        {currentPage === 'pack-detail' && selectedPackId && (
                            <PackDetailPage 
                                pack={packs.find(p => p.id === selectedPackId) || packs[0]}
                                allProducts={products}
                                allPacks={packs}
                                onNavigateHome={navigateToHome}
                                onNavigateToProductDetail={navigateToProductDetail}
                                onNavigateToPackDetail={navigateToPackDetail}
                                onNavigateToPacks={navigateToPacks}
                            />
                        )}
                        {currentPage === 'login' && (
                            <LoginPage 
                                onNavigateHome={navigateToHome} 
                                onLoginSuccess={handleLoginSuccess} 
                            />
                        )}
                        {currentPage === 'profile' && user && (
                            <ProfilePage 
                                user={user} 
                                onNavigateHome={navigateToHome} 
                                onUpdateUser={(updatedUser) => setUser(updatedUser)} 
                            />
                        )}
                        {currentPage === 'contact' && (
                            <ContactPage onNavigateHome={navigateToHome} stores={stores} />
                        )}
                        {currentPage === 'promotions' && (
                            <PromotionsPage 
                                onNavigateHome={navigateToHome} 
                                onNavigateToCategory={navigateToCategory}
                                onPreview={setPreviewProduct}
                                products={products}
                                onNavigateToProductDetail={navigateToProductDetail}
                            />
                        )}
                        {currentPage === 'blog' && (
                            <BlogPage onNavigateHome={navigateToHome} onSelectPost={navigateToBlogPost} />
                        )}
                        {currentPage === 'blog-post' && selectedBlogPostSlug && (
                            <BlogPostPage 
                                slug={selectedBlogPostSlug} 
                                onNavigateHome={navigateToHome} 
                                onNavigateToBlog={navigateToBlog} 
                            />
                        )}
                        {currentPage === 'checkout' && (
                            <CheckoutPage 
                                onNavigateHome={navigateToHome}
                                onOrderComplete={handleOrderComplete}
                                onNavigateToPaymentGateway={() => {}}
                                stores={stores}
                            />
                        )}
                        {currentPage === 'order-history' && (
                            <OrderHistoryPage 
                                orders={orders}
                                onNavigateHome={navigateToHome}
                                onNavigateToProfile={navigateToProfile}
                                onNavigateToOrderDetail={navigateToOrderDetail}
                            />
                        )}
                        {currentPage === 'order-detail' && selectedOrderId && (
                            <OrderDetailPage 
                                order={orders.find(o => o.id === selectedOrderId) || orders[0]}
                                allProducts={products}
                                onNavigateHome={navigateToHome}
                                onNavigateToOrderHistory={navigateToOrderHistory}
                                onNavigateToProductDetail={navigateToProductDetail}
                            />
                        )}
                        {currentPage === 'stores' && (
                            <StoresPage onNavigateHome={navigateToHome} stores={stores} />
                        )}
                        {currentPage === 'compare' && (
                            <ComparePage onNavigateHome={navigateToHome} />
                        )}
                        {currentPage === 'favorites' && (
                            <FavoritesPage 
                                onNavigateHome={navigateToHome} 
                                onPreview={setPreviewProduct}
                                allProducts={products}
                                onNavigateToProductDetail={navigateToProductDetail}
                            />
                        )}
                        {currentPage === 'privacy-policy' && <PrivacyPolicyPage onNavigateHome={navigateToHome} />}
                        {currentPage === 'data-deletion' && <DataDeletionPage onNavigateHome={navigateToHome} />}
                    </Suspense>
                </main>

                <Footer 
                    onNavigateToPrivacy={navigateToPrivacyPolicy}
                    onNavigateToDataDeletion={navigateToDataDeletion}
                />
                {(!user || user.role !== 'ADMIN') && <SupportWidget user={user} />}
                <ScrollToTopButton />
                <CartSidebar 
                    isLoggedIn={!!user} 
                    onNavigateToCheckout={navigateToCheckout} 
                    onNavigateToLogin={navigateToLogin}
                    allProducts={products}
                />
                <ProductPreviewModal product={previewProduct} onClose={() => setPreviewProduct(null)} />
            </div>
        );
    };

    return renderPage();
};

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <ToastProvider>
                <CartProvider>
                    <FavoritesProvider>
                        <CompareProvider>
                            <AppContent />
                        </CompareProvider>
                    </FavoritesProvider>
                </CartProvider>
            </ToastProvider>
        </ThemeProvider>
    );
};

export default App;

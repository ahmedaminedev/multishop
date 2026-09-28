
import React, { useState, useEffect, Suspense } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import { ToastProvider, useToast } from './components/ToastContext';
import { CartProvider, useCart } from './components/CartContext';
import { FavoritesProvider } from './components/FavoritesContext';
import { CompareProvider } from './components/CompareContext';

import { TopBar } from './components/TopBar';
import { Header } from './components/Header';
import { NavBar } from './components/NavBar';
import { CategoryBar } from './components/CategoryBar'; // Ajout
import { Footer } from './components/Footer';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { SupportWidget } from './components/SupportWidget';
import { CartSidebar } from './components/CartSidebar';
import { ProductPreviewModal } from './components/ProductPreviewModal';

// Utils & Data
import { api } from './utils/api';
import type { User, Product, Category, Pack, Order, CartItem, CustomerInfo, ContactMessage, Advertisements, Brand } from './types';

// Define empty skeleton locally to avoid using constants.ts
const emptyAdvertisements: Advertisements = {
    heroSlides: [],
    audioPromo: [],
    promoBanners: [
        {id: 101, title:'', subtitle:'', buttonText:'', image:'', linkType:'category', linkTarget:''}, 
        {id: 102, title:'', subtitle:'', buttonText:'', image:'', linkType:'category', linkTarget:''}
    ],
    smallPromoBanners: [],
    editorialCollage: [],
    shoppableVideos: [],
    trustBadges: [],
    newArrivals: { title: "", productIds: [] },
    summerSelection: { title: "", productIds: [] },
    virtualTryOn: { title: "", description: "", buttonText: "" },
    featuredGrid: { title: "", productIds: [], buttonText: "", buttonLink: "" }
};

// --- LAZY LOADING DES PAGES ---
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
        <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
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
    
    // Active Filters State (from URL)
    const [activeFilters, setActiveFilters] = useState({
        brand: '',
        minPrice: '',
        maxPrice: '',
        promo: false
    });

    // Data State
    const [user, setUser] = useState<User | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [packs, setPacks] = useState<Pack[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [adminMessages, setAdminMessages] = useState<ContactMessage[]>([]);
    const [promotionsData, setPromotionsData] = useState<any[]>([]);
    const [advertisements, setAdvertisements] = useState<Advertisements>(emptyAdvertisements);
    const [brands, setBrands] = useState<Brand[]>([]);
    
    // UI State
    const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
    const { addToast } = useToast();
    const { clearCart, identifyUser } = useCart(); // IMPORT identifyUser

    // Sync Cart with User when User state changes
    useEffect(() => {
        identifyUser(user);
    }, [user, identifyUser]);

    // Router Logic: Handle Hash Changes for Dynamic Links
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            const routeRaw = hash.replace(/^#\/?/, '');
            const [path, queryString] = routeRaw.split('?');
            const params = new URLSearchParams(queryString);

            if (params.get('error') === 'session_expired') {
                setUser(null);
                addToast("Votre session a expiré. Veuillez vous reconnecter.", "warning");
                window.history.replaceState(null, '', '#/login');
                setCurrentPage('login');
                return;
            }

            if (hash.includes('accessToken=') || hash.includes('reset-password') || hash.includes('success=') || params.get('payment')) {
                return;
            }

            if (path === '' || path === 'home') {
                setCurrentPage('home');
                window.scrollTo(0, 0);
            } else if (path === 'product-list') {
                const catParam = params.get('category');
                
                const brand = params.get('brand') || '';
                const minPrice = params.get('minPrice') || '';
                const maxPrice = params.get('maxPrice') || '';
                const promo = params.get('promo') === 'true';

                setActiveFilters({ brand, minPrice, maxPrice, promo });

                if (catParam) {
                    setSelectedCategory(decodeURIComponent(catParam));
                } else {
                    setSelectedCategory('product-list');
                }
                setCurrentPage('product-list');
                window.scrollTo(0, 0);
            } else if (path.startsWith('product/')) {
                const id = path.split('/')[1];
                if (id) {
                    setSelectedProductId(Number(id));
                    setCurrentPage('product-detail');
                    window.scrollTo(0, 0);
                }
            } else if (path === 'promotions') {
                setCurrentPage('promotions');
                window.scrollTo(0, 0);
            } else if (path === 'packs') {
                setCurrentPage('packs');
                window.scrollTo(0, 0);
            } else if (path.startsWith('pack/')) {
                const id = path.split('/')[1] || params.get('id');
                if (id) {
                    setSelectedPackId(Number(id));
                    setCurrentPage('pack-detail');
                    window.scrollTo(0, 0);
                }
            } else if (path === 'blog') {
                setCurrentPage('blog');
                window.scrollTo(0, 0);
            } else if (path === 'contact') {
                setCurrentPage('contact');
                window.scrollTo(0, 0);
            } else if (path === 'stores') {
                setCurrentPage('stores');
                window.scrollTo(0, 0);
            } else if (path === 'compare') {
                setCurrentPage('compare');
                window.scrollTo(0, 0);
            } else if (path === 'favorites') {
                setCurrentPage('favorites');
                window.scrollTo(0, 0);
            } else if (path === 'profile') {
                setCurrentPage('profile');
            } else if (path === 'order-history') {
                setCurrentPage('order-history');
            } else if (path === 'login') {
                if (user) {
                    window.location.hash = '#/';
                } else {
                    setCurrentPage('login');
                }
            } else if (path === 'privacy-policy') {
                setCurrentPage('privacy-policy');
            } else if (path === 'data-deletion') {
                setCurrentPage('data-deletion');
            } else if (path === 'checkout') {
                setCurrentPage('checkout');
                window.scrollTo(0, 0);
            } else if (path === 'admin') {
                if (user && user.role === 'ADMIN') {
                    setCurrentPage('admin');
                } else {
                    window.location.hash = '#/';
                }
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [user]);

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
                    window.history.replaceState(null, '', '#/'); // Clean URL
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
        };
        checkUrlParams();
    }, [user, clearCart, addToast]); 

    // Initial Data Loading
    useEffect(() => {
        const loadData = async () => {
            try {
                const [productsData, packsData, categoriesData, storesData, adsData, brandsData] = await Promise.all([
                    api.getProducts(),
                    api.getPacks(),
                    api.getCategories(),
                    api.getStores(),
                    api.getAdvertisements(),
                    api.getBrands() 
                ]);
                
                setProducts(productsData);
                setPacks(packsData);
                setCategories(categoriesData);
                setStores(storesData);
                setBrands(brandsData);
                if (adsData) setAdvertisements(adsData); 

                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const userData = await api.getMe();
                        if (userData) {
                            setUser(userData);
                        }
                    } catch (e) {
                        console.log("Session invalide ou expirée (Check initial)");
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

    // Authenticated User Data Loading
    useEffect(() => {
        const loadUserData = async () => {
            if (user) {
                try {
                    if (user.role === 'ADMIN') {
                        const [allOrders, allMessages, allPromos] = await Promise.all([
                            api.getAllOrders(),
                            api.getMessages(),
                            api.getPromotions()
                        ]);
                        setOrders(allOrders);
                        setAdminMessages(allMessages);
                        setPromotionsData(allPromos);
                    } else {
                        const myOrders = await api.getMyOrders();
                        setOrders(myOrders);
                    }
                } catch (err) {
                    console.error("Failed to load user-specific data", err);
                }
            } else {
                setOrders([]);
                setAdminMessages([]);
            }
        };
        loadUserData();
    }, [user]);

    // --- Navigation Handlers ---
    const navigateToHome = () => window.location.hash = '#/';
    const navigateToCategory = (category: string) => window.location.hash = `#/product-list?category=${encodeURIComponent(category)}`;
    const navigateToProductDetail = (id: number | string) => window.location.hash = `#/product/${id}`;
    const navigateToPackDetail = (id: number | string) => window.location.hash = `#/pack/${id}`;
    const navigateToPacks = () => window.location.hash = '#/packs';
    const navigateToPromotions = () => window.location.hash = '#/promotions';
    const navigateToBlog = () => window.location.hash = '#/blog';
    const navigateToBlogPost = (slug: string) => { setSelectedBlogPostSlug(slug); setCurrentPage('blog-post'); }; 
    const navigateToContact = () => window.location.hash = '#/contact';
    const navigateToLogin = () => window.location.hash = '#/login';
    const navigateToProfile = () => window.location.hash = '#/profile';
    const navigateToCheckout = () => window.location.hash = '#/checkout';
    const navigateToOrderHistory = () => window.location.hash = '#/order-history';
    const navigateToOrderDetail = (id: string) => { setSelectedOrderId(id); setCurrentPage('order-detail'); }; 
    const navigateToStores = () => window.location.hash = '#/stores';
    const navigateToCompare = () => window.location.hash = '#/compare';
    const navigateToFavorites = () => window.location.hash = '#/favorites';
    const navigateToAdmin = () => window.location.hash = '#/admin';
    const navigateToPrivacyPolicy = () => window.location.hash = '#/privacy-policy';
    const navigateToDataDeletion = () => window.location.hash = '#/data-deletion';

    const handleLoginSuccess = async () => {
        try {
            const userData = await api.getMe();
            setUser(userData);
            // Redirection après login réussi (soit home, soit retour panier si on venait de là, mais ici simple home)
            // Si on venait de 'valider mon sac' (checkout), on pourrait rediriger vers checkout.
            // Pour simplifier, on redirige vers Home, l'utilisateur recliquera sur le panier.
            navigateToHome();
            addToast(`Bienvenue ${userData.firstName} !`, "success");
        } catch (e) {
            console.error("Login data fetch error", e);
        }
    };

    const handleLogout = async () => {
        try {
            await api.logout();
        } catch(e) { console.log('Logout local fallback'); }
        
        setUser(null);
        localStorage.removeItem('token');
        navigateToLogin(); 
        addToast("Vous avez été déconnecté avec succès.", "info");
    };

    const handleOrderComplete = async (cartItems: CartItem[], customerInfo: CustomerInfo, paymentId?: string) => {
        const newOrder = {
            id: paymentId || `CS-${Date.now()}`,
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
            if (user) {
                api.getMyOrders().then(setOrders);
            }
            navigateToOrderHistory();
            addToast("Commande enregistrée avec succès !", "success");
        } catch (error: any) {
            addToast(error.message || "Erreur lors de l'enregistrement de la commande.", "error");
        }
    };

    const renderPage = () => {
        if (currentPage === 'admin') {
            if (user?.role === 'ADMIN') {
                return (
                    <Suspense fallback={<PageLoader />}>
                        <AdminPage 
                            onNavigateHome={navigateToHome}
                            onLogout={handleLogout}
                            productsData={products} setProductsData={setProducts}
                            categoriesData={categories} setCategoriesData={setCategories}
                            packsData={packs} setPacksData={setPacks}
                            ordersData={orders} setOrdersData={setOrders} 
                            messagesData={adminMessages} setMessagesData={setAdminMessages} 
                            advertisementsData={advertisements} setAdvertisementsData={setAdvertisements}
                            promotionsData={promotionsData} setPromotionsData={setPromotionsData}
                            storesData={stores} setStoresData={setStores}
                            brandsData={brands} setBrandsData={setBrands}
                        />
                    </Suspense>
                );
            } else {
                setTimeout(navigateToHome, 0); 
                return <PageLoader />;
            }
        }

        if (currentPage === 'reset-password') {
            return (
                <Suspense fallback={<PageLoader />}>
                    <ResetPasswordPage onNavigateHome={navigateToHome} token={resetToken || ''} />
                </Suspense>
            );
        }

        return (
            <div className="flex flex-col min-h-screen w-full overflow-x-hidden transition-colors duration-300 bg-rose-50/50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans">
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
                
                <CategoryBar categories={categories} onCategoryClick={navigateToCategory} />
                
                <main className="flex-grow">
                    <Suspense fallback={<PageLoader />}>
                        {currentPage === 'home' && (
                            <HomePage 
                                onNavigate={navigateToCategory}
                                onPreview={setPreviewProduct}
                                onNavigateToPacks={navigateToPacks}
                                products={products}
                                packs={packs}
                                advertisements={advertisements}
                                onNavigateToProductDetail={navigateToProductDetail}
                                categories={categories}
                                brands={brands}
                            />
                        )}
                        {currentPage === 'product-list' && (
                            <ProductListPage 
                                categoryName={selectedCategory}
                                onNavigateHome={navigateToHome}
                                onNavigateToCategory={navigateToCategory}
                                onPreview={setPreviewProduct}
                                onNavigateToPacks={navigateToPacks}
                                products={products}
                                onNavigateToProductDetail={navigateToProductDetail}
                                categories={categories}
                                activeFilters={activeFilters}
                            />
                        )}
                        {currentPage === 'product-detail' && selectedProductId && (
                            (() => {
                                const product = products.find(p => p.id === selectedProductId);
                                if (product) {
                                    return (
                                        <ProductDetailPage 
                                            product={product} 
                                            allProducts={products}
                                            onNavigateHome={navigateToHome}
                                            onNavigateToProductDetail={navigateToProductDetail}
                                            onPreview={setPreviewProduct}
                                        />
                                    );
                                }
                                return <PageLoader />;
                            })()
                        )}
                        {currentPage === 'packs' && (
                            <PacksPage 
                                onNavigateHome={navigateToHome}
                                onNavigateToCategory={navigateToCategory}
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

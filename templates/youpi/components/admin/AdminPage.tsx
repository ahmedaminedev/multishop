import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  Gift,
  Tag,
  Store,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  LogOut,
  ArrowLeft,
  X,
  Send,
  Sparkles,
  FolderTree,
  Baby,
  Clock,
  Check
} from 'lucide-react';
import { Product, Category, Pack, Order, ContactMessage, Promotion, Store as StoreType, Brand } from '../../types';
import { AdminSidebar } from './AdminSidebar';
import { ManageCategoriesPage } from './ManageCategoriesPage';
import { ManagePacksPage } from './ManagePacksPage';
import { ManageHomePage } from './ManageHomePage';
import { AdminChat } from './AdminChat';
import { SubsiteLiveFullscreenModal } from './SubsiteLiveFullscreenModal';

export type AdminPageName =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'messages'
  | 'packs'
  | 'promotions'
  | 'stores'
  | 'categories'
  | 'brands'
  | 'home'
  | 'chat';

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
  advertisementsData?: any;
  setAdvertisementsData?: React.Dispatch<React.SetStateAction<any>>;
  promotionsData: Promotion[];
  setPromotionsData: React.Dispatch<React.SetStateAction<Promotion[]>>;
  storesData: StoreType[];
  setStoresData: React.Dispatch<React.SetStateAction<StoreType[]>>;
  brandsData?: Brand[];
  setBrandsData?: React.Dispatch<React.SetStateAction<Brand[]>>;
  hideSidebar?: boolean;
  forcedPage?: AdminPageName;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  onNavigateHome,
  onLogout,
  productsData = [],
  setProductsData,
  categoriesData = [],
  setCategoriesData,
  packsData = [],
  setPacksData,
  ordersData = [],
  setOrdersData,
  messagesData = [],
  setMessagesData,
  advertisementsData,
  setAdvertisementsData = () => {},
  promotionsData = [],
  setPromotionsData,
  storesData = [],
  setStoresData,
  brandsData = [],
  setBrandsData = () => {},
  hideSidebar = false,
  forcedPage
}) => {
  const [activeTab, setActiveTab] = useState<AdminPageName>('dashboard');
  const [isSubsiteModalOpen, setIsSubsiteModalOpen] = useState(false);
  const effectiveTab = forcedPage || activeTab;

  // Search & Filter States
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState('all');

  // Product Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    brand: 'YoupiPlay',
    category: 'Éveil & Bébé',
    price: 49,
    oldPrice: 0,
    quantity: 20,
    trancheAge: '3 - 8 ans',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600'
  });

  // Selected Order for details modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Replying to customer message modal
  const [replyingMessage, setReplyingMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');

  // Promo Code Modal
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(15);

  // KPI Computations
  const totalRevenue = ordersData.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = ordersData.filter(o => o.status === 'en_attente' || o.status === 'confirmé').length;
  const unreadMessages = messagesData.filter(m => !m.read).length;

  // 1. Product Handlers
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      brand: 'YoupiPlay',
      category: categoriesData[0]?.name || 'Éveil & Bébé',
      price: 49,
      oldPrice: 0,
      quantity: 20,
      trancheAge: '3 - 8 ans',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600'
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({ ...prod });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name) return;

    if (editingProduct) {
      setProductsData(prev =>
        prev.map(p => (p.id === editingProduct.id ? ({ ...p, ...productForm } as Product) : p))
      );
    } else {
      const newProd: Product = {
        id: Date.now(),
        name: productForm.name || 'Nouveau Jouet',
        brand: productForm.brand || 'YoupiPlay',
        category: productForm.category || categoriesData[0]?.name || 'Éveil & Bébé',
        price: Number(productForm.price) || 29,
        oldPrice: Number(productForm.oldPrice) || 0,
        imageUrl: productForm.imageUrl || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600',
        images: [productForm.imageUrl || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600'],
        quantity: Number(productForm.quantity) || 15,
        trancheAge: productForm.trancheAge || '3 - 8 ans',
        description: productForm.description || '',
        promo: (Number(productForm.oldPrice) || 0) > (Number(productForm.price) || 0)
      };
      setProductsData(prev => [newProd, ...prev]);
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet article du catalogue YoupiShop ?')) {
      setProductsData(prev => prev.filter(p => p.id !== id));
    }
  };

  // 2. Orders Handlers
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrdersData(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // 3. Message Reply Handlers
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingMessage || !replyText.trim()) return;

    setMessagesData(prev =>
      prev.map(m =>
        m.id === replyingMessage.id ? { ...m, reply: replyText.trim(), read: true } : m
      )
    );
    setReplyingMessage(null);
    setReplyText('');
  };

  // 4. Promo Handlers
  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    const newPromo: Promotion = {
      id: `promo-${Date.now()}`,
      code: promoCode.trim().toUpperCase(),
      title: promoTitle.trim() || `Remise de ${promoDiscount}%`,
      discountPercentage: Number(promoDiscount) || 10,
      validUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]
    };
    setPromotionsData(prev => [newPromo, ...prev]);
    setIsPromoModalOpen(false);
    setPromoCode('');
    setPromoTitle('');
    setPromoDiscount(15);
  };

  // Filtered Products for Products Tab
  const filteredProducts = productsData.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchProduct.toLowerCase());
    const matchesCat =
      selectedProductCategory === 'all' ||
      p.category === selectedProductCategory ||
      p.parentCategory === selectedProductCategory;
    return matchesSearch && matchesCat;
  });

  const isFullEditor = effectiveTab === 'home';

  return (
    <div className={`flex ${hideSidebar ? 'h-auto min-h-0 bg-transparent' : 'h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden font-sans'}`}>
      
      {/* 1. Left Sidebar Navigation */}
      {!hideSidebar && (
        <AdminSidebar
          activePage={activeTab}
          setActivePage={setActiveTab}
          onNavigateHome={onNavigateHome}
          onLogout={onLogout}
          onOpenSubsiteModal={() => setIsSubsiteModalOpen(true)}
        />
      )}

      {/* 2. Main Content Routing */}
      <main className={`relative flex-1 flex flex-col min-w-0 ${hideSidebar ? 'p-0 overflow-visible' : isFullEditor ? 'p-0 overflow-hidden' : 'p-6 sm:p-8 overflow-y-auto'}`}>
        
        {/* TAB 1: CATEGORIES (Custom rich component matching FitnessShop + Youpi design) */}
        {effectiveTab === 'categories' && (
          <ManageCategoriesPage
            categories={categoriesData}
            setCategories={setCategoriesData}
          />
        )}

        {/* TAB 2: PACKS & BUNDLES (Custom rich component matching FitnessShop + Youpi design) */}
        {effectiveTab === 'packs' && (
          <ManagePacksPage
            packs={packsData}
            setPacks={setPacksData}
            allProducts={productsData}
            allCategories={categoriesData}
          />
        )}

        {/* TAB 3: PAGE ACCUEIL & ADS (Total visual control + live subsite preview) */}
        {effectiveTab === 'home' && (
          <ManageHomePage
            initialAds={advertisementsData}
            onSave={setAdvertisementsData}
            allProducts={productsData}
            allPacks={packsData}
            allCategories={categoriesData}
          />
        )}

        {/* TAB 4: LIVE CHAT (Socket.IO + backend persistent sessions) */}
        {effectiveTab === 'chat' && (
          <AdminChat />
        )}

        {/* TAB 5: DASHBOARD HOME */}
        {effectiveTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🧸</span>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full">
                    Tableau de Bord Filiale
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Performances <span className="text-amber-500">YoupiShop</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Vue d'ensemble de la boutique jouets, commandes et interactions clients
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSubsiteModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Sous-Site en Direct</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('home')}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Personnaliser l'Accueil</span>
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Ouvrir le Live Chat</span>
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase text-slate-400">Chiffre d'Affaires</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    💰
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {totalRevenue.toFixed(2)} DT
                </p>
                <p className="text-[11px] text-emerald-600 font-bold mt-1">
                  +18% ce mois-ci
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase text-slate-400">Commandes en cours</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    📦
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {pendingOrders}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  Sur {ordersData.length} commandes totales
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase text-slate-400">Catalogue Jouets</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                    🧸
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {productsData.length} articles
                </p>
                <p className="text-[11px] text-amber-600 font-bold mt-1">
                  {categoriesData.length} catégories actives
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase text-slate-400">Support & Chat</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    💬
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {unreadMessages} non lu(s)
                </p>
                <p className="text-[11px] text-emerald-600 font-bold mt-1">
                  Socket.IO Connecté
                </p>
              </div>
            </div>

            {/* Quick Actions & Recent Orders Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recent Orders */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Dernières Commandes
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-amber-600 hover:underline"
                  >
                    Voir tout
                  </button>
                </div>

                <div className="space-y-3">
                  {ordersData.slice(0, 4).map(o => (
                    <div
                      key={o.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">
                          {o.orderNumber || o.id} - {o.customer?.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {o.items?.length || 1} article(s) • {o.paymentMethod || 'Paiement à la livraison'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-amber-600 dark:text-amber-400">
                          {o.totalAmount?.toFixed(2)} DT
                        </p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Shortcuts */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                    Accès Rapide & Modules
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Gérez l'ensemble de votre écosystème e-commerce jouets
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActiveTab('categories')}
                      className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-left hover:bg-amber-100/50 transition-colors"
                    >
                      <FolderTree className="w-5 h-5 text-amber-600 mb-2" />
                      <p className="text-xs font-black text-slate-900 dark:text-white">Catégories & Âges</p>
                      <p className="text-[10px] text-slate-500">Ajout, modif, méga menu</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('packs')}
                      className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-left hover:bg-rose-100/50 transition-colors"
                    >
                      <Gift className="w-5 h-5 text-rose-600 mb-2" />
                      <p className="text-xs font-black text-slate-900 dark:text-white">Packs & Bundles</p>
                      <p className="text-[10px] text-slate-500">Lots & réductions</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('home')}
                      className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 text-left hover:bg-purple-100/50 transition-colors"
                    >
                      <Sparkles className="w-5 h-5 text-purple-600 mb-2" />
                      <p className="text-xs font-black text-slate-900 dark:text-white">Page Accueil & Ads</p>
                      <p className="text-[10px] text-slate-500">Bannières & aperçu direct</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('chat')}
                      className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-left hover:bg-blue-100/50 transition-colors"
                    >
                      <MessageSquare className="w-5 h-5 text-blue-600 mb-2" />
                      <p className="text-xs font-black text-slate-900 dark:text-white">Live Chat Direct</p>
                      <p className="text-[10px] text-slate-500">Messagerie instantanée</p>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Boutique YoupiShop active</span>
                  <button
                    onClick={onNavigateHome}
                    className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <span>Ouvrir la vitrine frontoffice</span>
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: PRODUCTS CATALOG */}
        {effectiveTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  Catalogue <span className="text-amber-500">Jouets & Jeux</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {productsData.length} articles répertoriés
                </p>
              </div>

              <button
                onClick={handleOpenCreateProduct}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Jouet</span>
              </button>
            </div>

            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  placeholder="Rechercher par nom, marque..."
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <select
                value={selectedProductCategory}
                onChange={(e) => setSelectedProductCategory(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
              >
                <option value="all">Toutes les catégories</option>
                {categoriesData.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[11px] text-slate-500 uppercase bg-slate-100/60 dark:bg-slate-800/60 font-black tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Aperçu</th>
                      <th className="px-6 py-4">Article</th>
                      <th className="px-6 py-4">Catégorie</th>
                      <th className="px-6 py-4">Âge</th>
                      <th className="px-6 py-4">Prix</th>
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredProducts.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="px-6 py-4">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-contain bg-slate-50 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700"
                          />
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                          <div className="text-sm font-black">{p.name}</div>
                          <span className="text-[11px] text-amber-600 font-bold">{p.brand || 'YoupiPlay'}</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                          {p.category}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {p.trancheAge || 'Tous âges'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black text-amber-600 text-sm">
                          {p.price.toFixed(2)} DT
                        </td>
                        <td className="px-6 py-4 text-xs font-bold">
                          <span className={p.quantity > 5 ? 'text-emerald-600' : 'text-rose-600'}>
                            {p.quantity} en stock
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ORDERS */}
        {effectiveTab === 'orders' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Commandes <span className="text-amber-500">Clients YoupiShop</span>
            </h1>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[11px] text-slate-500 uppercase bg-slate-100/60 dark:bg-slate-800/60 font-black">
                    <tr>
                      <th className="px-6 py-4">N° Commande</th>
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4">Articles</th>
                      <th className="px-6 py-4">Montant</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4 text-right">Détails</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {ordersData.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="px-6 py-4 font-mono font-bold text-xs">
                          {order.orderNumber || order.id}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                          <div>{order.customer?.name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{order.customer?.phone}</div>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {order.items?.length || 1} article(s)
                        </td>
                        <td className="px-6 py-4 font-black text-amber-600">
                          {order.totalAmount?.toFixed(2)} DT
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                            className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 border border-amber-200 text-amber-900"
                          >
                            <option value="en_attente">En attente</option>
                            <option value="confirmé">Confirmé</option>
                            <option value="expédié">Expédié</option>
                            <option value="livré">Livré</option>
                            <option value="annulé">Annulé</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold"
                          >
                            Voir détails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: MESSAGES */}
        {effectiveTab === 'messages' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Messages de <span className="text-amber-500">Contact</span>
            </h1>

            <div className="space-y-3">
              {messagesData.map(msg => (
                <div
                  key={msg.id}
                  className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{msg.name}</span>
                      <span className="text-xs text-slate-400 font-mono">{msg.email}</span>
                      {msg.read ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">Traité</span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">Nouveau</span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{msg.subject}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{msg.message}</p>
                    {msg.reply && (
                      <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 text-xs font-medium text-amber-900 dark:text-amber-300">
                        <span className="font-bold block">Réponse envoyée :</span>
                        {msg.reply}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setReplyingMessage(msg);
                      setReplyText(msg.reply || '');
                    }}
                    className="self-start px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs"
                  >
                    Répondre
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: PROMOTIONS */}
        {effectiveTab === 'promotions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                Codes <span className="text-amber-500">Promo & Réductions</span>
              </h1>
              <button
                onClick={() => setIsPromoModalOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-amber-500 text-white font-bold text-xs flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Code</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {promotionsData.map(promo => (
                <div
                  key={promo.id}
                  className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-amber-100 text-amber-900 font-mono font-black text-xs rounded-xl">
                      {promo.code}
                    </span>
                    <span className="text-base font-black text-rose-600">
                      -{promo.discountPercentage}%
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{promo.title}</p>
                  <p className="text-[11px] text-slate-400">Valide jusqu'au {promo.validUntil}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: STORES */}
        {effectiveTab === 'stores' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Boutiques <span className="text-amber-500">Physiques YoupiShop</span>
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {storesData.map(st => (
                <div
                  key={st.id}
                  className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
                >
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{st.name}</h3>
                  <p className="text-xs text-slate-500">{st.address}</p>
                  <p className="text-xs font-mono font-bold text-amber-600">{st.phone}</p>
                  <p className="text-[11px] text-slate-400">{st.hours}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {editingProduct ? 'Modifier le Jouet' : 'Nouveau Jouet'}
            </h3>
            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nom du Jouet</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                  className="w-full p-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Catégorie</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  >
                    {categoriesData.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tranche d'Âge</label>
                  <select
                    value={productForm.trancheAge}
                    onChange={(e) => setProductForm({ ...productForm, trancheAge: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  >
                    <option value="0 - 3 ans">0 - 3 ans</option>
                    <option value="3 - 6 ans">3 - 6 ans</option>
                    <option value="6 - 12 ans">6 - 12 ans</option>
                    <option value="12+ ans">12+ ans</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prix (DT)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ancien Prix</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.oldPrice}
                    onChange={(e) => setProductForm({ ...productForm, oldPrice: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock</label>
                  <input
                    type="number"
                    value={productForm.quantity}
                    onChange={(e) => setProductForm({ ...productForm, quantity: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">URL Image</label>
                <input
                  type="text"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-white font-bold rounded-xl"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promo Modal */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-black">Nouveau Code Promo</h3>
            <form onSubmit={handleSavePromo} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Code Promo (ex: YOUPI20)</label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  required
                  className="w-full p-2 bg-slate-50 border rounded-xl uppercase font-mono font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Remise (%)</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={promoDiscount}
                  onChange={(e) => setPromoDiscount(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setIsPromoModalOpen(false)} className="px-4 py-2 border rounded-xl">
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-white font-bold rounded-xl">
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Reply Modal */}
      {replyingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-black">Répondre à {replyingMessage.name}</h3>
            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border">
              "{replyingMessage.message}"
            </p>
            <form onSubmit={handleSendReply} className="space-y-3 text-xs">
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Votre réponse personnalisée..."
                required
                className="w-full p-3 bg-slate-50 border rounded-xl"
              />
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setReplyingMessage(null)} className="px-4 py-2 border rounded-xl">
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-white font-bold rounded-xl">
                  Envoyer Réponse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subsite Live Fullscreen Modal */}
      <SubsiteLiveFullscreenModal
        isOpen={isSubsiteModalOpen}
        onClose={() => setIsSubsiteModalOpen(false)}
        products={productsData}
        categories={categoriesData}
        packs={packsData}
        stores={storesData}
        advertisements={advertisementsData}
        onNavigateToStorefront={onNavigateHome}
      />

    </div>
  );
};

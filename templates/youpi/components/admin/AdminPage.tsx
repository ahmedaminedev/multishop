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
  Palette,
  Bot,
  User,
  Check,
  Clock
} from 'lucide-react';
import { Product, Category, Pack, Order, ContactMessage, Promotion, Store as StoreType, Brand } from '../../types';

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
  brandsData: Brand[];
  setBrandsData: React.Dispatch<React.SetStateAction<Brand[]>>;
  hideSidebar?: boolean;
  forcedPage?: AdminPageName;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  onNavigateHome,
  onLogout,
  productsData,
  setProductsData,
  categoriesData,
  setCategoriesData,
  packsData,
  setPacksData,
  ordersData,
  setOrdersData,
  messagesData,
  setMessagesData,
  advertisementsData,
  setAdvertisementsData,
  promotionsData,
  setPromotionsData,
  storesData,
  setStoresData,
  brandsData,
  setBrandsData,
  hideSidebar = false,
  forcedPage
}) => {
  const [activeTab, setActiveTab] = useState<AdminPageName>('dashboard');
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
    imageUrl: '/src/assets/images/category_youpi_eveil_1791240046354.jpg'
  });

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState('');

  // Brand Modal State
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [brandName, setBrandName] = useState('');

  // Pack Modal State
  const [isPackModalOpen, setIsPackModalOpen] = useState(false);
  const [packTitle, setPackTitle] = useState('');
  const [packPrice, setPackPrice] = useState(99);
  const [packOriginalPrice, setPackOriginalPrice] = useState(129);
  const [packDesc, setPackDesc] = useState('');

  // Promo Modal State
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(15);

  // Selected Order for details
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Replying to customer message
  const [replyingMessage, setReplyingMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');

  // Live Chat simulation state
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'client' | 'admin'; text: string; time: string; customerName: string }>>([
    { id: '1', sender: 'client', text: 'Bonjour, avez-vous la boîte de 850 briques Lego en stock ?', time: '14:20', customerName: 'Yassine M.' },
    { id: '2', sender: 'admin', text: 'Bonjour Yassine ! Oui, elle est disponible immédiatement avec livraison sous 24h.', time: '14:21', customerName: 'Support Youpi' },
    { id: '3', sender: 'client', text: 'Super, l\'emballage cadeau est-il gratuit ?', time: '14:23', customerName: 'Yassine M.' }
  ]);
  const [adminChatReply, setAdminChatReply] = useState('');

  // Homepage ads state
  const [heroTitle, setHeroTitle] = useState(advertisementsData?.hero?.title || "L'UNIVERS DU JEU & DU RÊVE");
  const [heroSubtitle, setHeroSubtitle] = useState(advertisementsData?.hero?.subtitle || 'Des jouets éducatifs, créatifs et durables pour émerveiller petits et grands.');
  const [heroBadge, setHeroBadge] = useState(advertisementsData?.hero?.badge || 'JOUETS & ÉVEIL ENFANT');
  const [promoBannerCode, setPromoBannerCode] = useState(advertisementsData?.promoBanner?.code || 'YOUPI20');
  const [promoBannerText, setPromoBannerText] = useState(advertisementsData?.promoBanner?.subtitle || "Sur tous les jeux d'éveil en bois et constructions Lego");
  const [adsSavedMsg, setAdsSavedMsg] = useState(false);

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
      category: 'Éveil & Bébé',
      price: 49,
      oldPrice: 0,
      quantity: 20,
      trancheAge: '3 - 8 ans',
      description: '',
      imageUrl: '/src/assets/images/category_youpi_eveil_1791240046354.jpg'
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
        category: productForm.category || 'Éveil & Bébé',
        price: Number(productForm.price) || 29,
        oldPrice: Number(productForm.oldPrice) || 0,
        imageUrl: productForm.imageUrl || '/src/assets/images/category_youpi_eveil_1791240046354.jpg',
        images: [productForm.imageUrl || '/src/assets/images/category_youpi_eveil_1791240046354.jpg'],
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
    if (window.confirm('Voulez-vous vraiment supprimer cet article ?')) {
      setProductsData(prev => prev.filter(p => p.id !== id));
    }
  };

  // 2. Category Handlers
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    if (editingCategory) {
      setCategoriesData(prev =>
        prev.map(c => (c.id === editingCategory.id ? { ...c, name: categoryName, image: categoryImage || c.image } : c))
      );
    } else {
      const newCat: Category = {
        id: Date.now(),
        name: categoryName,
        slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
        image: categoryImage || '/src/assets/images/category_youpi_eveil_1791240046354.jpg'
      };
      setCategoriesData(prev => [...prev, newCat]);
    }
    setIsCategoryModalOpen(false);
    setCategoryName('');
    setCategoryImage('');
  };

  const handleDeleteCategory = (id: number) => {
    if (window.confirm('Supprimer cette catégorie ?')) {
      setCategoriesData(prev => prev.filter(c => c.id !== id));
    }
  };

  // 3. Brand Handlers
  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    const newBrand: Brand = {
      id: Date.now(),
      name: brandName
    };
    setBrandsData(prev => [...prev, newBrand]);
    setBrandName('');
    setIsBrandModalOpen(false);
  };

  const handleDeleteBrand = (id: number) => {
    if (window.confirm('Supprimer cette marque ?')) {
      setBrandsData(prev => prev.filter(b => b.id !== id));
    }
  };

  // 4. Order status changer
  const handleUpdateOrderStatus = (orderId: string, newStatus: any) => {
    setOrdersData(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // 5. Message reply handler
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingMessage || !replyText.trim()) return;

    setMessagesData(prev =>
      prev.map(m =>
        m.id === replyingMessage.id ? { ...m, reply: replyText, read: true } : m
      )
    );
    setReplyingMessage(null);
    setReplyText('');
  };

  // 6. Live Chat response
  const handleSendAdminChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminChatReply.trim()) return;

    setChatMessages(prev => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'admin',
        text: adminChatReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        customerName: 'Support Youpi'
      }
    ]);
    setAdminChatReply('');
  };

  // 7. Save Homepage Ads
  const handleSaveAds = () => {
    if (setAdvertisementsData) {
      setAdvertisementsData((prev: any) => ({
        ...prev,
        hero: {
          ...prev?.hero,
          title: heroTitle,
          subtitle: heroSubtitle,
          badge: heroBadge
        },
        promoBanner: {
          ...prev?.promoBanner,
          code: promoBannerCode,
          subtitle: promoBannerText
        }
      }));
    }
    setAdsSavedMsg(true);
    setTimeout(() => setAdsSavedMsg(false), 3000);
  };

  const filteredProducts = productsData.filter(p => {
    const matchCat = selectedProductCategory === 'all' || p.category === selectedProductCategory;
    const matchSearch =
      !searchProduct ||
      p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchProduct.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      {!hideSidebar && (
        <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 border-r border-slate-800 shrink-0 select-none overflow-y-auto">
          <div className="space-y-6">
            
            {/* Header Brand */}
            <div className="flex items-center gap-3 px-2 pt-2">
              <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-md">
                🧸
              </div>
              <div>
                <h2 className="font-serif font-black text-lg leading-tight">YoupiShop</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                  Console Dédiée
                </span>
              </div>
            </div>

            {/* Menu List */}
            <nav className="space-y-1">
              {[
                { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
                { id: 'products', label: 'Catalogue & Stock', icon: Package, badge: productsData.length },
                { id: 'categories', label: 'Catégories Jouets', icon: FolderTree, badge: categoriesData.length },
                { id: 'brands', label: 'Marques Partenaires', icon: Tag, badge: brandsData.length },
                { id: 'orders', label: 'Commandes', icon: ShoppingCart, badge: pendingOrders },
                { id: 'packs', label: 'Coffrets & Packs', icon: Gift, badge: packsData.length },
                { id: 'home', label: "Page d'accueil & Ads", icon: Palette },
                { id: 'chat', label: 'Live Chat Support', icon: Bot },
                { id: 'messages', label: 'Messages Formulaire', icon: MessageSquare, badge: unreadMessages },
                { id: 'promotions', label: 'Codes Promo', icon: Tag },
                { id: 'stores', label: 'Nos Boutiques', icon: Store }
              ].map(item => {
                const Icon = item.icon;
                const isActive = effectiveTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-amber-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={onNavigateHome}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Visiter le Store YoupiShop</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-900/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col overflow-y-auto p-6 sm:p-8">
        
        {/* ========================================================================= */}
        {/* TAB 1: TABLEAU DE BORD                                                    */}
        {/* ========================================================================= */}
        {effectiveTab === 'dashboard' && (
          <div className="space-y-6 max-w-7xl w-full mx-auto animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black font-serif text-slate-900 dark:text-white">
                  Tableau de bord YoupiShop
                </h1>
                <p className="text-xs text-slate-500">
                  Performance commerciale et état du stock des univers jouets en temps réel.
                </p>
              </div>

              <button
                onClick={handleOpenCreateProduct}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Jouet</span>
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chiffre d'Affaires</span>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
                  {totalRevenue} DT
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold">Toutes commandes confirmées</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Commandes en cours</span>
                <div className="text-2xl font-black text-orange-600 mt-1 tabular-nums">
                  {ordersData.length}
                </div>
                <span className="text-[10px] text-orange-500 font-semibold">{pendingOrders} en attente de livraison</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Catalogue Jouets</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
                  {productsData.length}
                </div>
                <span className="text-[10px] text-slate-400">Références actives en boutique</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Messages Boîte Chat</span>
                <div className="text-2xl font-black text-rose-600 mt-1 tabular-nums">
                  {unreadMessages}
                </div>
                <span className="text-[10px] text-rose-500 font-semibold">Demandes clients à traiter</span>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black font-serif text-slate-900 dark:text-white">
                  Dernières Commandes YoupiShop
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-amber-600 hover:underline cursor-pointer"
                >
                  Voir toutes les commandes ({ordersData.length})
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">N° Commande</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Montant</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {ordersData.slice(0, 5).map(o => (
                      <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold">{o.orderNumber || o.id}</td>
                        <td className="py-3 px-4">{o.customer?.name} ({o.customer?.phone})</td>
                        <td className="py-3 px-4 font-black">{o.totalAmount || (o as any).total} DT</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            o.status === 'livré' || (o.status as any) === 'Livrée'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : o.status === 'expédié' || (o.status as any) === 'Expédiée'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedOrder(o);
                              setActiveTab('orders');
                            }}
                            className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-white font-bold transition-colors cursor-pointer"
                          >
                            Détails
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

        {/* ========================================================================= */}
        {/* TAB 2: GESTION DES PRODUITS & STOCKS                                      */}
        {/* ========================================================================= */}
        {effectiveTab === 'products' && (
          <div className="space-y-6 max-w-7xl w-full mx-auto animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black font-serif text-slate-900 dark:text-white">
                  Catalogue Jouets YoupiShop ({productsData.length})
                </h1>
                <p className="text-xs text-slate-500">
                  Création, édition des prix, stocks et spécifications des jeux et jouets.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenCreateProduct}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Jouet</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  placeholder="Rechercher par nom, marque, âge..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <select
                value={selectedProductCategory}
                onChange={(e) => setSelectedProductCategory(e.target.value)}
                className="w-full md:w-56 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <option value="all">Toutes les catégories</option>
                {categoriesData.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Article</th>
                      <th className="py-3 px-4">Catégorie</th>
                      <th className="py-3 px-4">Âge Recommandé</th>
                      <th className="py-3 px-4">Prix</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredProducts.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-10 h-10 object-contain rounded-xl bg-slate-50 dark:bg-slate-800 p-0.5 border border-slate-200/60 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{p.name}</p>
                              <span className="text-[10px] text-slate-400">{p.brand}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">
                          {p.category}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                            {p.trancheAge || '3 - 8 ans'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                          {p.price} DT
                          {p.oldPrice && (
                            <span className="text-[10px] text-slate-400 line-through ml-1 font-normal">
                              {p.oldPrice} DT
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.quantity > 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {p.quantity} en stock
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              title="Modifier"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

        {/* ========================================================================= */}
        {/* TAB 3: GESTION DES CATÉGORIES (MODULE CONTEXTUEL)                         */}
        {/* ========================================================================= */}
        {effectiveTab === 'categories' && (
          <div className="space-y-6 max-w-7xl w-full mx-auto animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black font-serif text-slate-900 dark:text-white">
                  Catégories & Univers Jouets ({categoriesData.length})
                </h1>
                <p className="text-xs text-slate-500">
                  Organisez les rayons de jeux d'éveil, briques, puzzles et jeux de société.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryName('');
                  setCategoryImage('');
                  setIsCategoryModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle Catégorie</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categoriesData.map(cat => {
                const count = productsData.filter(p => p.category === cat.name).length;
                return (
                  <div key={cat.id} className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src={cat.image || '/src/assets/images/category_youpi_eveil_1791240046354.jpg'} alt={cat.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-100 dark:border-slate-800 shrink-0" />
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">{cat.name}</h3>
                        <p className="text-xs text-amber-600 font-semibold">{count} produit(s) associé(s)</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryName(cat.name);
                          setCategoryImage(cat.image || '');
                          setIsCategoryModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-amber-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: GESTION DES MARQUES (MODULE CONTEXTUEL)                            */}
        {/* ========================================================================= */}
        {effectiveTab === 'brands' && (
          <div className="space-y-6 max-w-7xl w-full mx-auto animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black font-serif text-slate-900 dark:text-white">
                  Marques & Fabricants de Jouets ({brandsData.length})
                </h1>
                <p className="text-xs text-slate-500">
                  Gérez les marques partenaires référencées chez YoupiShop (Lego, Janod, Djeco, Playmobil, Asmodee...)
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setBrandName('');
                  setIsBrandModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une Marque</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {brandsData.map(b => {
                const count = productsData.filter(p => p.brand?.toLowerCase() === b.name?.toLowerCase()).length;
                return (
                  <div key={b.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{b.name}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">{count} référence(s)</p>
                    </div>
                    <button
                      onClick={() => handleDeleteBrand(b.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: GESTION DES COMMANDES                                              */}
        {/* ========================================================================= */}
        {effectiveTab === 'orders' && (
          <div className="space-y-6 max-w-7xl w-full mx-auto animate-fadeIn">
            <div>
              <h1 className="text-2xl font-black font-serif text-slate-900 dark:text-white">
                Commandes Clients YoupiShop ({ordersData.length})
              </h1>
              <p className="text-xs text-slate-500">
                Suivez les livraisons, adresses et paiements en espèces à la livraison.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Réf Commande</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Articles</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {ordersData.map(o => (
                      <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {o.orderNumber || o.id}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 dark:text-white">{o.customer?.name || (o as any).customerName}</p>
                          <p className="text-[10px] text-slate-400">{o.customer?.phone || (o as any).phone || o.customer?.email}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{o.date}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          {o.items?.length || 1} article(s)
                        </td>
                        <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                          {o.totalAmount || (o as any).total} DT
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                            className="text-[10px] font-bold px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
                          >
                            <option value="en_attente">En attente</option>
                            <option value="confirmé">Confirmé</option>
                            <option value="expédié">Expédiée</option>
                            <option value="livré">Livrée</option>
                            <option value="annulé">Annulée</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
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

        {/* ========================================================================= */}
        {/* TAB 6: PACKS & COFFRETS (MODULE CONTEXTUEL)                              */}
        {/* ========================================================================= */}
        {effectiveTab === 'packs' && (
          <div className="space-y-6 max-w-7xl w-full mx-auto animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black font-serif text-slate-900 dark:text-white">
                  Coffrets Cadeaux & Bundles YoupiShop ({packsData.length})
                </h1>
                <p className="text-xs text-slate-500">
                  Offrez des packs remisés regroupant plusieurs jouets complémentaires.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPackTitle('');
                  setPackPrice(119);
                  setPackOriginalPrice(149);
                  setPackDesc('');
                  setIsPackModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Coffret</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packsData.map(p => (
                <div key={p.id} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex gap-4 shadow-xs">
                  <img src={p.imageUrl} alt={p.title} className="w-24 h-24 object-contain rounded-2xl bg-slate-50 dark:bg-slate-800 p-1.5 border border-slate-100 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">{p.title}</h3>
                      <button
                        onClick={() => setPacksData(prev => prev.filter(pk => pk.id !== p.id))}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="font-black text-amber-600 text-lg">{p.price} DT</span>
                      <span className="text-xs text-slate-400 line-through">({p.originalPrice} DT)</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">-{p.discount}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: PAGE D'ACCUEIL & ADS (MODULE CONTEXTUEL)                          */}
        {/* ========================================================================= */}
        {effectiveTab === 'home' && (
          <div className="space-y-6 max-w-4xl w-full mx-auto animate-fadeIn">
            <div>
              <h1 className="text-2xl font-black font-serif text-slate-900 dark:text-white">
                Configuration de la Page d'accueil & Bannières
              </h1>
              <p className="text-xs text-slate-500">
                Personnalisez les messages promotionnels, le hero banner et les codes promo affichés aux visiteurs.
              </p>
            </div>

            {adsSavedMsg && (
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Bannières enregistrées avec succès !</span>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                1. Bannière Principale Hero Header
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Badge d'en-tête</label>
                  <input
                    type="text"
                    value={heroBadge}
                    onChange={(e) => setHeroBadge(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Titre Principal</label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Sous-titre / Descriptif</label>
                  <textarea
                    rows={2}
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 pt-3">
                2. Ruban Promotionnel & Code Promo
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Code Promo actif</label>
                  <input
                    type="text"
                    value={promoBannerCode}
                    onChange={(e) => setPromoBannerCode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 text-xs font-mono font-bold text-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Texte de l'offre</label>
                  <input
                    type="text"
                    value={promoBannerText}
                    onChange={(e) => setPromoBannerText(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveAds}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 cursor-pointer active:scale-95 transition-all"
                >
                  Enregistrer les bannières
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: LIVE CHAT SUPPORT (MODULE CONTEXTUEL)                              */}
        {/* ========================================================================= */}
        {effectiveTab === 'chat' && (
          <div className="space-y-6 max-w-4xl w-full mx-auto animate-fadeIn flex flex-col h-[calc(100vh-8rem)]">
            <div>
              <h1 className="text-2xl font-black font-serif text-slate-900 dark:text-white">
                Live Chat Support YoupiShop
              </h1>
              <p className="text-xs text-slate-500">
                Échangez en direct avec les parents et clients connectés sur la boutique en ligne.
              </p>
            </div>

            <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                    💬
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">Discussion Client Directe</h3>
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Canal Ouvert (YoupiShop)
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">ID Session #YOUPI-LIVE</span>
              </div>

              {/* Chat Message History */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/30">
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[75%] ${
                      msg.sender === 'admin' ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 font-semibold mb-0.5 px-1">
                      {msg.customerName} • {msg.time}
                    </span>
                    <div
                      className={`p-3 rounded-2xl text-xs font-medium ${
                        msg.sender === 'admin'
                          ? 'bg-amber-500 text-white rounded-tr-none'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendAdminChat} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
                <input
                  type="text"
                  value={adminChatReply}
                  onChange={(e) => setAdminChatReply(e.target.value)}
                  placeholder="Répondre au client en direct..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: MESSAGES DU FORMULAIRE DE CONTACT                                 */}
        {/* ========================================================================= */}
        {effectiveTab === 'messages' && (
          <div className="space-y-6 max-w-7xl w-full mx-auto animate-fadeIn">
            <div>
              <h1 className="text-2xl font-black font-serif text-slate-900 dark:text-white">
                Boîte de Messages YoupiShop ({messagesData.length})
              </h1>
              <p className="text-xs text-slate-500">
                Demandes de renseignements, conseils d'âge et réclamations clients.
              </p>
            </div>

            <div className="space-y-3">
              {messagesData.map(msg => (
                <div key={msg.id} className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{msg.name}</h4>
                        <span className="text-xs text-slate-400">({msg.email})</span>
                        {!msg.read && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Nouveau
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">{msg.subject}</p>
                    </div>
                    <span className="text-[10px] text-slate-400">{msg.date}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    "{msg.message}"
                  </p>

                  {msg.reply && (
                    <div className="text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-100">
                      <strong>Votre réponse :</strong> {msg.reply}
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => setReplyingMessage(msg)}
                      className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      {msg.reply ? 'Modifier la réponse' : 'Répondre'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 10: PROMOTIONS & CODES PROMO                                         */}
        {/* ========================================================================= */}
        {effectiveTab === 'promotions' && (
          <div className="space-y-6 max-w-7xl w-full mx-auto animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black font-serif text-slate-900 dark:text-white">
                  Codes Promotionnels & Offres ({promotionsData.length})
                </h1>
                <p className="text-xs text-slate-500">
                  Créez des remises exclusives applicables au panier d'achat.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPromoCode('');
                  setPromoTitle('');
                  setPromoDiscount(15);
                  setIsPromoModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Code Promo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {promotionsData.map(promo => (
                <div key={promo.id} className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-amber-600 font-mono text-base px-3 py-1 bg-amber-50 rounded-xl border border-amber-200 inline-block">
                      {promo.code}
                    </span>
                    <button
                      onClick={() => setPromotionsData(prev => prev.filter(p => p.id !== promo.id))}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{promo.title}</h4>
                  <p className="text-xs text-emerald-600 font-bold">-{promo.discountPercentage}% de réduction</p>
                  <p className="text-[10px] text-slate-400">Valable jusqu'au {promo.validUntil}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 11: POINTS DE VENTE / MAGASINS                                       */}
        {/* ========================================================================= */}
        {effectiveTab === 'stores' && (
          <div className="space-y-6 max-w-7xl w-full mx-auto animate-fadeIn">
            <div>
              <h1 className="text-2xl font-black font-serif text-slate-900 dark:text-white">
                Points de Vente YoupiShop ({storesData.length})
              </h1>
              <p className="text-xs text-slate-500">
                Emplacements physiques, horaires d'ouverture et contacts des boutiques partenaires.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {storesData.map(s => (
                <div key={s.id} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{s.name}</h3>
                  <p className="text-xs text-slate-500">{s.address}</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{s.phone}</p>
                  <p className="text-xs text-slate-400">{s.hours}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Product Creation / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-lg font-black font-serif text-slate-900 dark:text-white">
                {editingProduct ? 'Modifier le Jouet' : 'Nouveau Jouet YoupiShop'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nom de l'article *</label>
                <input
                  type="text"
                  required
                  value={productForm.name || ''}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Ex: Train en bois Montessori 70 pcs"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Marque</label>
                  <input
                    type="text"
                    value={productForm.brand || ''}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    placeholder="Lego, Janod, YoupiPlay..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Catégorie</label>
                  <select
                    value={productForm.category || 'Éveil & Bébé'}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
                  >
                    {categoriesData.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Prix (DT) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price || ''}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Prix Ancien</label>
                  <input
                    type="number"
                    value={productForm.oldPrice || ''}
                    onChange={(e) => setProductForm({ ...productForm, oldPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Stock *</label>
                  <input
                    type="number"
                    required
                    value={productForm.quantity || ''}
                    onChange={(e) => setProductForm({ ...productForm, quantity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tranche d'âge conseillée</label>
                <input
                  type="text"
                  value={productForm.trancheAge || ''}
                  onChange={(e) => setProductForm({ ...productForm, trancheAge: e.target.value })}
                  placeholder="Ex: 3 - 6 ans, Dès 12 mois..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">URL de l'image</label>
                <input
                  type="text"
                  value={productForm.imageUrl || ''}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  placeholder="/src/assets/images/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={productForm.description || ''}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Détails sur les bienfaits d'éveil, règles du jeu..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md shadow-orange-500/20"
                >
                  {editingProduct ? 'Enregistrer les modifications' : 'Créer l\'article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Creation / Edit Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-black font-serif text-slate-900 dark:text-white">
                {editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nom de la Catégorie *</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ex: Puzzles & Casse-têtes"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
                <input
                  type="text"
                  value={categoryImage}
                  onChange={(e) => setCategoryImage(e.target.value)}
                  placeholder="/src/assets/images/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brand Creation Modal */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-black font-serif text-slate-900 dark:text-white">
                Ajouter une Marque Partenaire
              </h3>
              <button onClick={() => setIsBrandModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nom de la marque *</label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Ex: Haba, VTech, Chicco..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase cursor-pointer"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pack Creation Modal */}
      {isPackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-black font-serif text-slate-900 dark:text-white">
                Créer un Pack / Coffret
              </h3>
              <button onClick={() => setIsPackModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!packTitle) return;
                const newPk: Pack = {
                  id: Date.now(),
                  title: packTitle,
                  price: packPrice,
                  originalPrice: packOriginalPrice,
                  discount: Math.round(((packOriginalPrice - packPrice) / packOriginalPrice) * 100),
                  imageUrl: '/src/assets/images/category_youpi_eveil_1791240046354.jpg',
                  description: packDesc || 'Pack exclusif YoupiShop.',
                  products: productsData.slice(0, 2)
                };
                setPacksData(prev => [...prev, newPk]);
                setIsPackModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Titre du Pack *</label>
                <input
                  type="text"
                  required
                  value={packTitle}
                  onChange={(e) => setPackTitle(e.target.value)}
                  placeholder="Ex: Pack Anniversaire 5 ans"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Prix Pack (DT)</label>
                  <input
                    type="number"
                    value={packPrice}
                    onChange={(e) => setPackPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Prix Initial (DT)</label>
                  <input
                    type="number"
                    value={packOriginalPrice}
                    onChange={(e) => setPackOriginalPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={packDesc}
                  onChange={(e) => setPackDesc(e.target.value)}
                  placeholder="Description du contenu du coffret..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPackModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase cursor-pointer"
                >
                  Créer le Pack
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Code Promo Creation Modal */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-black font-serif text-slate-900 dark:text-white">
                Nouveau Code Promo YoupiShop
              </h3>
              <button onClick={() => setIsPromoModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!promoCode) return;
                const newPr: Promotion = {
                  id: `promo-${Date.now()}`,
                  code: promoCode.toUpperCase(),
                  title: promoTitle || `Remise ${promoDiscount}%`,
                  discountPercentage: Number(promoDiscount) || 10,
                  validUntil: '2026-12-31'
                };
                setPromotionsData(prev => [...prev, newPr]);
                setIsPromoModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Code Promo (ex: JOUET15) *</label>
                <input
                  type="text"
                  required
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="EXEMPLE15"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Libellé de l'offre</label>
                <input
                  type="text"
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  placeholder="Remise fête des enfants"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pourcentage de Remise (%)</label>
                <input
                  type="number"
                  value={promoDiscount}
                  onChange={(e) => setPromoDiscount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase cursor-pointer"
                >
                  Créer le Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-black font-serif text-slate-900 dark:text-white">
                  Commande #{selectedOrder.orderNumber || selectedOrder.id}
                </h3>
                <span className="text-[10px] text-slate-400">Date : {selectedOrder.date}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white">
                  {selectedOrder.customer?.name || (selectedOrder as any).customerName}
                </p>
                <p className="text-slate-500">{selectedOrder.customer?.phone || (selectedOrder as any).phone}</p>
                <p className="text-slate-500">{selectedOrder.customer?.address || (selectedOrder as any).shippingAddress?.street}</p>
                <p className="text-[10px] text-amber-600 font-semibold mt-1">Paiement : {selectedOrder.paymentMethod || 'Espèces à la livraison'}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Articles commandés :</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <span className="text-[10px] text-slate-400">Qté: {item.quantity}</span>
                      </div>
                      <span className="font-black text-amber-600">{item.price} DT</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="font-bold text-sm">Total Commande :</span>
                <span className="text-xl font-black text-amber-600">{selectedOrder.totalAmount || (selectedOrder as any).total} DT</span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Message Modal */}
      {replyingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-black font-serif text-slate-900 dark:text-white">
                  Répondre à {replyingMessage.name}
                </h3>
                <span className="text-[10px] text-slate-400">{replyingMessage.email}</span>
              </div>
              <button onClick={() => setReplyingMessage(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400 text-[10px] uppercase font-bold">Message du client :</p>
                <p className="text-slate-700 dark:text-slate-300 mt-1 italic">"{replyingMessage.message}"</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Votre réponse :</label>
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Saisissez votre réponse pour le client..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyingMessage(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase cursor-pointer"
                >
                  Envoyer la réponse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

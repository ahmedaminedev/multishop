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
  Sparkles
} from 'lucide-react';
import { Product, Category, Pack, Order, ContactMessage, Promotion, Store as StoreType, Brand } from '../../types';

export type AdminPageName = 'dashboard' | 'products' | 'orders' | 'messages' | 'packs' | 'promotions' | 'stores';

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
  packsData,
  setPacksData,
  ordersData,
  setOrdersData,
  messagesData,
  setMessagesData,
  promotionsData,
  setPromotionsData,
  storesData,
  setStoresData,
  brandsData,
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

  // Selected Order for details
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Replying to customer message
  const [replyingMessage, setReplyingMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');

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

  const handleDeleteProduct = (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet article du catalogue YoupiShop ?')) {
      setProductsData(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name?.trim()) return;

    if (editingProduct) {
      // Update
      setProductsData(prev =>
        prev.map(p =>
          p.id === editingProduct.id
            ? ({ ...p, ...productForm } as Product)
            : p
        )
      );
    } else {
      // Create
      const newProd: Product = {
        id: Date.now(),
        name: productForm.name || '',
        brand: productForm.brand || 'YoupiPlay',
        category: productForm.category || 'Éveil & Bébé',
        price: Number(productForm.price) || 29,
        oldPrice: Number(productForm.oldPrice) || 0,
        quantity: Number(productForm.quantity) || 10,
        trancheAge: productForm.trancheAge || '3 - 8 ans',
        description: productForm.description || '',
        imageUrl: productForm.imageUrl || '/src/assets/images/category_youpi_eveil_1791240046354.jpg',
        images: [productForm.imageUrl || '/src/assets/images/category_youpi_eveil_1791240046354.jpg'],
        rating: 5,
        reviewsCount: 1
      };
      setProductsData(prev => [newProd, ...prev]);
    }
    setIsProductModalOpen(false);
  };

  // 2. Order Status Update
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrdersData(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // 3. Message Reply Handler
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingMessage || !replyText.trim()) return;
    setMessagesData(prev =>
      prev.map(m =>
        m.id === replyingMessage.id
          ? { ...m, read: true, reply: replyText }
          : m
      )
    );
    setReplyingMessage(null);
    setReplyText('');
  };

  // KPI Calculations
  const totalRevenue = ordersData.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const pendingOrders = ordersData.filter(o => o.status === 'en_attente').length;
  const unreadMessages = messagesData.filter(m => !m.read).length;

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
        <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 border-r border-slate-800 shrink-0 select-none">
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
                { id: 'products', label: 'Jouets & Stocks', icon: Package, badge: productsData.length },
                { id: 'orders', label: 'Commandes', icon: ShoppingCart, badge: pendingOrders },
                { id: 'messages', label: 'Messages Chat & Support', icon: MessageSquare, badge: unreadMessages },
                { id: 'packs', label: 'Coffrets & Packs', icon: Gift },
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
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Commandes en attente</span>
                <div className="text-2xl font-black text-orange-600 mt-1 tabular-nums">
                  {pendingOrders}
                </div>
                <span className="text-[10px] text-orange-500 font-semibold">À expédier en livraison express</span>
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
                        <td className="py-3 px-4 font-bold">{o.orderNumber}</td>
                        <td className="py-3 px-4">{o.customer?.name} ({o.customer?.phone})</td>
                        <td className="py-3 px-4 font-black">{o.totalAmount} DT</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            o.status === 'livré'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : o.status === 'expédié'
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
                <option value="Éveil & Bébé">Éveil & Bébé</option>
                <option value="Construction & Lego">Construction & Lego</option>
                <option value="Jeux de Société">Jeux de Société</option>
                <option value="Plein Air & Véhicules">Plein Air & Véhicules</option>
                <option value="Arts Créatifs">Arts Créatifs</option>
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
                        <td className="py-3 px-4 font-black tabular-nums">{p.price} DT</td>
                        <td className="py-3 px-4 font-bold">
                          <span className={p.quantity > 5 ? 'text-emerald-600' : 'text-rose-600'}>
                            {p.quantity} unités
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg cursor-pointer"
                              title="Modifier"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer"
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
        {/* TAB 3: COMMANDES CLIENTS                                                  */}
        {/* ========================================================================= */}
        {effectiveTab === 'orders' && (
          <div className="space-y-6 max-w-7xl w-full mx-auto animate-fadeIn">
            
            <div>
              <h1 className="text-2xl font-black font-serif text-slate-900 dark:text-white">
                Commandes Clients YoupiShop ({ordersData.length})
              </h1>
              <p className="text-xs text-slate-500">
                Gestion des expéditions et suivi des livraisons en espèces (COD).
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Commande</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Destinataire & Tél</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Statut de Livraison</th>
                      <th className="py-3 px-4 text-right">Changer Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {ordersData.map(o => (
                      <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {o.orderNumber}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{o.date}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{o.customer?.name}</p>
                          <p className="text-[10px] text-slate-400">{o.customer?.phone} • {o.customer?.address}</p>
                        </td>
                        <td className="py-3.5 px-4 font-black text-amber-600 dark:text-amber-400 tabular-nums">
                          {o.totalAmount} DT
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            o.status === 'livré'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.status === 'expédié'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
                          >
                            <option value="en_attente">⏳ En attente</option>
                            <option value="confirmé">✔️ Confirmé</option>
                            <option value="expédié">🚚 Expédié</option>
                            <option value="livré">✅ Livré</option>
                            <option value="annulé">❌ Annulé</option>
                          </select>
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
        {/* TAB 4: BOÎTE MESSAGERIE & CHAT CLIENT                                     */}
        {/* ========================================================================= */}
        {effectiveTab === 'messages' && (
          <div className="space-y-6 max-w-7xl w-full mx-auto animate-fadeIn">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black font-serif text-slate-900 dark:text-white">
                  Boîte de Messagerie & Support YoupiShop
                </h1>
                <p className="text-xs text-slate-500">
                  Questions et demandes clients issues de la boîte messagerie interactive.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                {unreadMessages} non lu{unreadMessages > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {messagesData.map(m => (
                <div
                  key={m.id}
                  className={`p-6 rounded-3xl border transition-all ${
                    m.read
                      ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                      : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{m.name}</h4>
                      <p className="text-[11px] text-slate-400">{m.email} {m.phone ? `• ${m.phone}` : ''}</p>
                    </div>
                    <span className="text-[10px] text-slate-400">{m.date?.split('T')[0]}</span>
                  </div>

                  <div className="space-y-1 my-3 bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl text-xs">
                    <p className="font-bold text-amber-600 dark:text-amber-400">{m.subject}</p>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{m.message}</p>
                  </div>

                  {m.reply && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 mb-3 border border-emerald-200">
                      <strong>Réponse envoyée :</strong> {m.reply}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400">
                      {m.read ? '✅ Lu' : '🔴 Nouveau message'}
                    </span>
                    <button
                      onClick={() => {
                        setReplyingMessage(m);
                        setReplyText('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Répondre</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Modal */}
            {replyingMessage && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-sm">Répondre à {replyingMessage.name}</h3>
                    <button onClick={() => setReplyingMessage(null)} className="text-slate-400 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                    <p className="italic">"{replyingMessage.message}"</p>
                  </div>

                  <form onSubmit={handleSendReply} className="space-y-3">
                    <textarea
                      rows={4}
                      required
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Saisissez votre réponse pour le client..."
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-amber-500"
                    />
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
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase cursor-pointer"
                      >
                        Envoyer la réponse
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PACKS & COFFRETS                                                   */}
        {/* ========================================================================= */}
        {effectiveTab === 'packs' && (
          <div className="space-y-6 max-w-7xl w-full mx-auto animate-fadeIn">
            <h1 className="text-2xl font-black font-serif text-slate-900 dark:text-white">
              Gestion des Coffrets & Bundles
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packsData.map(p => (
                <div key={p.id} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex gap-4">
                  <img src={p.imageUrl} alt={p.title} className="w-20 h-20 object-contain rounded-xl bg-slate-50 p-1 shrink-0" />
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm">{p.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                    <p className="font-black text-amber-600">{p.price} DT <span className="text-xs text-slate-400 line-through">({p.originalPrice} DT)</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: PROMOTIONS & CODES PROMO                                           */}
        {effectiveTab === 'promotions' && (
          <div className="space-y-6 max-w-7xl w-full mx-auto animate-fadeIn">
            <h1 className="text-2xl font-black font-serif text-slate-900 dark:text-white">
              Codes Promotionnels & Offres
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {promotionsData.map(promo => (
                <div key={promo.id} className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="font-black text-amber-600 font-mono text-base px-3 py-1 bg-amber-50 rounded-xl border border-amber-200 inline-block">
                    {promo.code}
                  </span>
                  <h4 className="font-bold text-sm">{promo.title}</h4>
                  <p className="text-xs text-emerald-600 font-bold">-{promo.discountPercentage}% de réduction</p>
                  <p className="text-[10px] text-slate-400">Valable jusqu'au {promo.validUntil}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: MAGASINS                                                           */}
        {effectiveTab === 'stores' && (
          <div className="space-y-6 max-w-7xl w-full mx-auto animate-fadeIn">
            <h1 className="text-2xl font-black font-serif text-slate-900 dark:text-white">
              Points de Vente YoupiShop
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {storesData.map(s => (
                <div key={s.id} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h3 className="font-bold text-base">{s.name}</h3>
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
                    <option value="Éveil & Bébé">Éveil & Bébé</option>
                    <option value="Construction & Lego">Construction & Lego</option>
                    <option value="Jeux de Société">Jeux de Société</option>
                    <option value="Plein Air & Véhicules">Plein Air & Véhicules</option>
                    <option value="Arts Créatifs">Arts Créatifs</option>
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

    </div>
  );
};

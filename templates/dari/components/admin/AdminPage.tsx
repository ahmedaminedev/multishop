import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  Boxes,
  Tag,
  Store,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Eye,
  LogOut,
  ArrowLeft,
  X,
  Send,
  FolderTree,
  Clock,
  Sparkles,
  Home
} from 'lucide-react';
import { Product, Category, Pack, Order, ContactMessage, Promotion, Store as StoreType, Brand } from '../../types';
import { api, apiRequest } from '../../utils/api';
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

  const [searchProduct, setSearchProduct] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    brand: 'Maison Dari',
    category: 'Mobilier & Salons',
    price: 890,
    oldPrice: 1050,
    quantity: 15,
    pieceMaison: 'Salon & Séjour',
    materiauPrincipal: 'Bois massif & Tissus nobles',
    styleDeco: 'Contemporain & Cosy',
    dimensions: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800'
  });

  const totalRevenue = ordersData.reduce((sum, o) => sum + (Number(o.total || o.totalAmount) || 0), 0);
  const pendingOrders = ordersData.filter(o => ['en_attente', 'confirmé', 'En attente'].includes(o.status)).length;
  const unreadMessages = messagesData.filter(m => !m.read).length;

  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      brand: 'Maison Dari',
      category: categoriesData[0]?.name || 'Mobilier & Salons',
      price: 890,
      oldPrice: 1050,
      quantity: 15,
      pieceMaison: 'Salon & Séjour',
      materiauPrincipal: 'Bois massif & Tissus nobles',
      styleDeco: 'Contemporain & Cosy',
      dimensions: '',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800'
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({ ...prod });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name) return;

    if (editingProduct) {
      try {
        await api.updateProduct(editingProduct.id, productForm);
      } catch {}
      setProductsData(prev =>
        prev.map(p => (p.id === editingProduct.id ? ({ ...p, ...productForm } as Product) : p))
      );
    } else {
      const newProd: Product = {
        id: Date.now(),
        name: productForm.name || 'Nouveau Meuble',
        brand: productForm.brand || 'Maison Dari',
        category: productForm.category || categoriesData[0]?.name || 'Mobilier & Salons',
        price: Number(productForm.price) || 450,
        oldPrice: Number(productForm.oldPrice) || 0,
        imageUrl: productForm.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800',
        images: [productForm.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800'],
        quantity: Number(productForm.quantity) || 10,
        pieceMaison: productForm.pieceMaison || 'Salon & Séjour',
        materiauPrincipal: productForm.materiauPrincipal || 'Bois massif',
        styleDeco: productForm.styleDeco || 'Contemporain',
        dimensions: productForm.dimensions || '',
        description: productForm.description || '',
        promo: (Number(productForm.oldPrice) || 0) > (Number(productForm.price) || 0)
      };
      try {
        const created = await api.createProduct(newProd);
        setProductsData(prev => [created || newProd, ...prev]);
      } catch {
        setProductsData(prev => [newProd, ...prev]);
      }
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Supprimer cet article de DariShop ?')) return;
    try {
      await api.deleteProduct(id);
    } catch {}
    setProductsData(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await apiRequest(`/orders/${orderId}`, 'PUT', { status: newStatus });
    } catch {}
    setOrdersData(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      
      {/* Sidebar: only rendered when not embedded inside GlobalMultiShopBackoffice */}
      {!hideSidebar && (
        <AdminSidebar
          activePage={activeTab}
          setActivePage={setActiveTab}
          onNavigateHome={onNavigateHome}
          onLogout={onLogout}
          onOpenSubsiteModal={() => setIsSubsiteModalOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top bar when standalone */}
        {!hideSidebar && (
          <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🏠</span>
              <div>
                <h1 className="font-black text-sm text-slate-900 dark:text-white uppercase font-serif">
                  Console Dédiée DariShop
                </h1>
                <p className="text-[11px] text-slate-500">Maison, Mobilier & Décoration d'Intérieur</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSubsiteModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-slate-200"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                <span>Aperçu Vitrine</span>
              </button>
            </div>
          </header>
        )}

        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          
          {/* TAB 1: DASHBOARD */}
          {effectiveTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* 4 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase">Chiffre d'Affaires DariShop</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {totalRevenue.toLocaleString('fr-FR')} DT
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold mt-2 block">Flux temps réel</span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase">Commandes Meubles</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {ordersData.length}
                  </p>
                  <span className="text-[10px] text-amber-500 font-bold mt-2 block">Dont {pendingOrders} en attente</span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase">Articles en Catalogue</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {productsData.length}
                  </p>
                  <span className="text-[10px] text-indigo-600 font-bold mt-2 block">Mobilier & Déco</span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase">Showrooms & Magasins</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {storesData.length || 3}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-2 block">Tunis Lac 2, Marsa, Sousse</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Actions Rapides pour DariShop
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('home')}
                    className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex flex-col items-center gap-2 hover:bg-indigo-100 cursor-pointer transition-colors"
                  >
                    <Home className="w-5 h-5 text-indigo-600" />
                    <span>Éditeur Accueil & Logo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('products')}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex flex-col items-center gap-2 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <Package className="w-5 h-5 text-blue-600" />
                    <span>Catalogue Mobilier</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('categories')}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex flex-col items-center gap-2 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <FolderTree className="w-5 h-5 text-emerald-600" />
                    <span>Rayons Déco</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('chat')}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex flex-col items-center gap-2 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <MessageSquare className="w-5 h-5 text-amber-500" />
                    <span>Live Chat Client</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB: MANAGE HOME PAGE (LIVE RESPONSIVE HOME & LOGO CONTROL) */}
          {effectiveTab === 'home' && (
            <ManageHomePage
              initialAds={advertisementsData}
              onSave={(newAds) => setAdvertisementsData(newAds)}
              allProducts={productsData}
              allPacks={packsData}
              allCategories={categoriesData}
            />
          )}

          {/* TAB: PRODUCTS */}
          {effectiveTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase font-serif">
                    Catalogue Mobilier & Décoration DariShop
                  </h2>
                  <p className="text-xs text-slate-500">Ajoutez, modifiez ou retirez des articles de la vitrine.</p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenCreateProduct}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau Meuble / Déco</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                  <input
                    type="text"
                    value={searchProduct}
                    onChange={e => setSearchProduct(e.target.value)}
                    placeholder="Filtrer les articles..."
                    className="w-full sm:w-72 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Article</th>
                        <th className="py-3 px-4">Rayon</th>
                        <th className="py-3 px-4">Pièce & Matière</th>
                        <th className="py-3 px-4">Prix</th>
                        <th className="py-3 px-4">Stock</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {productsData
                        .filter(p => !searchProduct || p.name.toLowerCase().includes(searchProduct.toLowerCase()))
                        .map(p => (
                          <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                              <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0" />
                              <span className="truncate max-w-xs">{p.name}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{p.category}</td>
                            <td className="py-3 px-4 text-slate-500">
                              <span>{p.pieceMaison || 'Salon'}</span>
                              <span className="block text-[10px] text-slate-400">{p.materiauPrincipal}</span>
                            </td>
                            <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">{p.price} DT</td>
                            <td className="py-3 px-4 text-slate-600">{p.quantity} en stock</td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer ml-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

          {/* TAB: CATEGORIES */}
          {effectiveTab === 'categories' && (
            <ManageCategoriesPage
              categories={categoriesData}
              setCategories={setCategoriesData}
            />
          )}

          {/* TAB: PACKS */}
          {effectiveTab === 'packs' && (
            <ManagePacksPage
              packs={packsData}
              setPacks={setPacksData}
            />
          )}

          {/* TAB: CHAT */}
          {effectiveTab === 'chat' && (
            <AdminChat />
          )}

          {/* TAB: ORDERS */}
          {effectiveTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase font-serif">
                Commandes DariShop ({ordersData.length})
              </h2>
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Commande</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Articles</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {ordersData.map((o) => (
                      <tr key={o.id}>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">#{o.id}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {o.customer?.name || `${o.customer?.firstName || ''} ${o.customer?.lastName || ''}`}
                          <span className="block text-[10px] text-slate-400">{o.customer?.phone}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{o.items?.length || 1} article(s)</td>
                        <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">{Number(o.total || o.totalAmount)} DT</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            o.status === 'Livrée' || o.status === 'livré' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(o.id, o.status === 'Livrée' ? 'En attente' : 'Livrée')}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[10px] cursor-pointer"
                          >
                            Changer Statut
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: MESSAGES */}
          {effectiveTab === 'messages' && (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase font-serif">
                Messages Clients DariShop ({messagesData.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {messagesData.map((m) => (
                  <div key={m.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{m.name}</h4>
                        <span className="text-[10px] text-slate-400">{m.email} • {m.phone}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{m.date}</span>
                    </div>
                    <p className="text-xs font-semibold text-indigo-600">{m.subject}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{m.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Product Edit / Create Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveProduct} className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white font-serif">
              {editingProduct ? 'Modifier l\'Article' : 'Nouveau Meuble / Déco'}
            </h3>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Nom du produit</label>
              <input
                type="text"
                required
                value={productForm.name}
                onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="Ex: Canapé 3 Places Scandinave Velours Côtelé"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Prix Vente (DT)</label>
                <input
                  type="number"
                  required
                  value={productForm.price}
                  onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Prix Barré (DT)</label>
                <input
                  type="number"
                  value={productForm.oldPrice}
                  onChange={e => setProductForm({ ...productForm, oldPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Pièce de la maison</label>
                <input
                  type="text"
                  value={productForm.pieceMaison}
                  onChange={e => setProductForm({ ...productForm, pieceMaison: e.target.value })}
                  placeholder="Ex: Salon & Séjour"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Matière principale</label>
                <input
                  type="text"
                  value={productForm.materiauPrincipal}
                  onChange={e => setProductForm({ ...productForm, materiauPrincipal: e.target.value })}
                  placeholder="Ex: Chêne massif & Velours"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Dimensions</label>
              <input
                type="text"
                value={productForm.dimensions}
                onChange={e => setProductForm({ ...productForm, dimensions: e.target.value })}
                placeholder="Ex: 220 x 95 x 82 cm"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                rows={3}
                value={productForm.description}
                onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="Description détaillée de la pièce..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Image URL</label>
              <input
                type="text"
                value={productForm.imageUrl}
                onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })}
                placeholder="URL de l'image..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer font-bold"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold cursor-pointer"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subsite Fullscreen Live Modal */}
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

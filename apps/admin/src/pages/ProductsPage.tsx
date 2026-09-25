import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';

export const ProductsPage: React.FC = () => {
  const { currentStoreSlug, apiFetch } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    oldPrice: '',
    category: '',
    subCategory: '',
    imageUrl: '',
    quantity: '50',
    description: '',
    promo: false
  });

  const fetchProductsAndCategories = async () => {
    try {
      setLoading(true);
      const urlProducts = currentStoreSlug === 'all' ? '/products' : `/products?storeSlug=${currentStoreSlug}`;
      const urlCategories = currentStoreSlug === 'all' ? '/categories' : `/categories?storeSlug=${currentStoreSlug}`;

      const [productsData, categoriesData] = await Promise.all([
        apiFetch(urlProducts),
        apiFetch(urlCategories).catch(() => [])
      ]);

      setProducts(Array.isArray(productsData) ? productsData : []);
      setDbCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, [currentStoreSlug]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        oldPrice: formData.oldPrice ? Number(formData.oldPrice) : undefined,
        quantity: Number(formData.quantity),
        storeSlug: currentStoreSlug !== 'all' ? currentStoreSlug : 'parashop'
      };

      if (editingProduct) {
        await apiFetch(`/products/${editingProduct.id || editingProduct._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch('/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      setShowAddModal(false);
      setEditingProduct(null);
      setFormData({ name: '', brand: '', price: '', oldPrice: '', category: '', subCategory: '', imageUrl: '', quantity: '50', description: '', promo: false });
      fetchProductsAndCategories();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce produit ?')) return;
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
      fetchProductsAndCategories();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchTerm ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Combine categories from DB and products to ensure everything is visible
  const categoryNames = [
    ...new Set([
      ...dbCategories.map(c => c.name),
      ...products.map(p => p.category).filter(Boolean)
    ])
  ];

  // Get available subcategories for selected category in form
  const selectedCatObj = dbCategories.find(c => c.name.toLowerCase() === (formData.category || '').toLowerCase());
  const availableSubCategories: string[] = selectedCatObj
    ? [
        ...(selectedCatObj.subCategories || []),
        ...(selectedCatObj.megaMenu ? selectedCatObj.megaMenu.flatMap((g: any) => g.items ? g.items.map((i: any) => i.name) : []) : [])
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Catalogue Produits</h1>
          <p className="text-sm text-slate-500 mt-1">
            {currentStoreSlug === 'all'
              ? 'Affichage de l\'ensemble des catalogues de toutes les boutiques.'
              : `Catalogue de la boutique ${currentStoreSlug.toUpperCase()} (${filteredProducts.length} articles).`}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({ name: '', brand: '', price: '', oldPrice: '', category: categories[0] || 'Général', imageUrl: '', quantity: '50', description: '', promo: false });
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau Produit
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom, marque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Toutes les catégories</option>
          {categoryNames.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Produit</th>
                <th className="px-5 py-3">Boutique</th>
                <th className="px-5 py-3">Catégorie</th>
                <th className="px-5 py-3">Prix</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    Chargement des articles...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    Aucun produit trouvé.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p._id || p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 flex items-center gap-3">
                      <img
                        src={p.imageUrl || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=80&q=80'}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        <div className="text-xs text-slate-400">{p.brand}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        {p.storeSlug || 'parashop'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-slate-600 bg-indigo-50/60 text-indigo-700 px-2 py-0.5 rounded font-medium">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-bold text-slate-900">{p.price} TND</div>
                      {p.oldPrice && (
                        <div className="text-xs text-slate-400 line-through">{p.oldPrice} TND</div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        (p.quantity || 0) > 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.quantity || 0} en stock
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setFormData({
                              name: p.name,
                              brand: p.brand || '',
                              price: String(p.price),
                              oldPrice: p.oldPrice ? String(p.oldPrice) : '',
                              category: p.category || '',
                              imageUrl: p.imageUrl || '',
                              quantity: String(p.quantity || 50),
                              description: p.description || '',
                              promo: Boolean(p.promo)
                            });
                            setShowAddModal(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                        >
                          Éditer
                        </button>
                        <button
                          onClick={() => handleDelete(p.id || p._id)}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingProduct ? 'Modifier le Produit' : 'Ajouter un Produit'}
            </h2>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nom du produit</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Marque</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Ex: Cerave, Optimum..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catégorie <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="categories-list"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, subCategory: '' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Choisir ou saisir une catégorie"
                  />
                  <datalist id="categories-list">
                    {categoryNames.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sous-catégorie
                  </label>
                  <input
                    type="text"
                    list="subcategories-list"
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder={availableSubCategories.length > 0 ? "Sélectionner ou saisir une sous-catégorie" : "Saisir une sous-catégorie optionnelle"}
                  />
                  <datalist id="subcategories-list">
                    {availableSubCategories.map(s => <option key={s} value={s} />)}
                  </datalist>
                  {availableSubCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <span className="text-[10px] text-slate-400 font-medium">Suggestions :</span>
                      {availableSubCategories.slice(0, 5).map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setFormData({ ...formData, subCategory: s })}
                          className="text-[10px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 px-1.5 py-0.5 rounded transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prix (TND)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ancien Prix (TND)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.oldPrice}
                    onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">URL Image principale</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantité en stock</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="promo-check"
                    checked={formData.promo}
                    onChange={(e) => setFormData({ ...formData, promo: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <label htmlFor="promo-check" className="text-xs font-semibold text-slate-700">En promotion</label>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

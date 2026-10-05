import React, { useState, useEffect } from 'react';
import type { Product, Category, Brand } from '../../types';
import { XMarkIcon, PlusIcon, TrashIcon } from '../IconComponents';
import { ImageInput } from '../ImageInput';
import { useToast } from '../ToastContext'; 

export const ProductFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (d: Omit<Product, 'id'>) => void;
    product: Product | null;
    categories: Category[];
    brands?: Brand[];
}> = ({ isOpen, onClose, onSave, product, categories, brands = [] }) => {
    const { addToast } = useToast();
    
    // Suppliers state
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [showQuickSupplier, setShowQuickSupplier] = useState(false);
    const [isSavingSupplier, setIsSavingSupplier] = useState(false);
    const [quickSupplier, setQuickSupplier] = useState({
        nom: '',
        telephone: '',
        localisation: '',
        type_vente: 'les_deux',
        lien: ''
    });

    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        oldPrice: 0,
        discount: 0,
        images: [] as string[],
        category: '',
        description: '',
        quantity: 0,
        quantité_enstock: 0,
        existe_dans_boutique: true,
        fournisseurId: '',
        fournisseurNom: ''
    });

    // Load suppliers on open
    useEffect(() => {
        if (isOpen) {
            fetch('/api/suppliers')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setSuppliers(data);
                })
                .catch(() => {});
        }
    }, [isOpen]);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                brand: product.brand || '',
                oldPrice: product.oldPrice || product.price || 0,
                discount: product.discount || 0,
                images: product.images || [],
                category: product.category || '',
                description: product.description || '',
                quantity: (product as any).quantité_enstock ?? product.quantity ?? 0,
                quantité_enstock: (product as any).quantité_enstock ?? product.quantity ?? 0,
                existe_dans_boutique: (product as any).existe_dans_boutique !== false,
                fournisseurId: (product as any).fournisseurId || '',
                fournisseurNom: (product as any).fournisseurNom || ''
            });
        } else {
            setFormData({
                name: '',
                brand: '',
                oldPrice: 0,
                discount: 0,
                images: [],
                category: '',
                description: '',
                quantity: 10,
                quantité_enstock: 10,
                existe_dans_boutique: true,
                fournisseurId: '',
                fournisseurNom: ''
            });
        }
        setShowQuickSupplier(false);
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const target = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: target.checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
        }
    };

    const handleCreateSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickSupplier.nom.trim()) {
            addToast("Le nom du fournisseur est obligatoire", "error");
            return;
        }
        setIsSavingSupplier(true);
        try {
            const res = await fetch('/api/suppliers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quickSupplier)
            });
            if (res.ok) {
                const created = await res.json();
                setSuppliers(prev => [created, ...prev]);
                setFormData(prev => ({
                    ...prev,
                    fournisseurId: created.id,
                    fournisseurNom: created.nom
                }));
                setShowQuickSupplier(false);
                setQuickSupplier({ nom: '', telephone: '', localisation: '', type_vente: 'les_deux', lien: '' });
                addToast(`Fournisseur "${created.nom}" associé au soin`, "success");
            } else {
                addToast("Erreur lors de la création du fournisseur", "error");
            }
        } catch {
            addToast("Erreur de connexion", "error");
        } finally {
            setIsSavingSupplier(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.category) return addToast("Champs requis manquants", "error");
        
        const matchedSup = suppliers.find(s => s.id === formData.fournisseurId);
        const supplierName = matchedSup ? matchedSup.nom : formData.fournisseurNom;

        onSave({
            ...formData,
            imageUrl: formData.images[0] || '',
            price: formData.oldPrice * (1 - (formData.discount / 100)),
            quantité_enstock: formData.quantité_enstock ?? formData.quantity ?? 0,
            quantity: formData.quantité_enstock ?? formData.quantity ?? 0,
            existe_dans_boutique: Boolean(formData.existe_dans_boutique),
            fournisseurNom: supplierName
        } as any);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-fadeIn">
            <div className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-serif font-black text-slate-900 uppercase tracking-tight">
                            {product ? 'Édition' : 'Enregistrement'} <span className="text-brand-primary italic">Soin</span>
                        </h2>
                        <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">Base de données pharmaceutique</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl shadow-sm transition-all text-slate-400 hover:text-brand-primary">
                        <XMarkIcon className="w-6 h-6"/>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar space-y-8 text-xs">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-5 space-y-6">
                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <ImageInput label="Galerie Officielle" images={formData.images} onChange={(imgs) => setFormData({...formData, images: imgs})} />
                            </div>
                        </div>
                        
                        <div className="lg:col-span-7 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-2">Appellation du soin *</label>
                                <input name="name" value={formData.name} onChange={handleChange} className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-900 focus:ring-2 focus:ring-brand-primary/20 transition-all placeholder-slate-300" placeholder="EX: SÉRUM VITAMINE C..." required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-2">Rayon Expert *</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 font-bold text-slate-900 focus:ring-2 focus:ring-brand-primary/20">
                                        <option value="">SÉLECTIONNER...</option>
                                        {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-2">Laboratoire</label>
                                    <input name="brand" value={formData.brand} onChange={handleChange} className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-900" placeholder="NOM DU LABO" />
                                </div>
                            </div>

                            {/* Section Fournisseur Associé */}
                            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/60 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-black text-[10px] uppercase tracking-wider text-emerald-900">
                                        Fournisseur / Laboratoire Référent
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setShowQuickSupplier(!showQuickSupplier)}
                                        className="text-[10px] font-bold text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-50 transition-colors"
                                    >
                                        {showQuickSupplier ? 'Fermer' : '+ Nouveau Fournisseur'}
                                    </button>
                                </div>

                                <select
                                    name="fournisseurId"
                                    value={formData.fournisseurId}
                                    onChange={(e) => {
                                        const fId = e.target.value;
                                        const sup = suppliers.find(s => s.id === fId);
                                        setFormData(prev => ({
                                            ...prev,
                                            fournisseurId: fId,
                                            fournisseurNom: sup ? sup.nom : ''
                                        }));
                                    }}
                                    className="w-full h-12 bg-white border border-emerald-200 rounded-xl px-4 font-bold text-slate-800"
                                >
                                    <option value="">-- Aucun fournisseur assigné (Laboratoire propre) --</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>
                                            🏢 {s.nom} ({s.localisation || 'Tunisie'})
                                        </option>
                                    ))}
                                </select>

                                {showQuickSupplier && (
                                    <div className="bg-white p-3.5 rounded-xl border border-emerald-300 space-y-2.5 animate-fadeIn">
                                        <div className="font-bold text-[11px] text-emerald-900">Ajout rapide de fournisseur</div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                placeholder="Nom du fournisseur *"
                                                value={quickSupplier.nom}
                                                onChange={e => setQuickSupplier({ ...quickSupplier, nom: e.target.value })}
                                                className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Téléphone / WhatsApp"
                                                value={quickSupplier.telephone}
                                                onChange={e => setQuickSupplier({ ...quickSupplier, telephone: e.target.value })}
                                                className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                placeholder="Ville / Localisation"
                                                value={quickSupplier.localisation}
                                                onChange={e => setQuickSupplier({ ...quickSupplier, localisation: e.target.value })}
                                                className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium"
                                            />
                                            <select
                                                value={quickSupplier.type_vente}
                                                onChange={e => setQuickSupplier({ ...quickSupplier, type_vente: e.target.value as any })}
                                                className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold"
                                            >
                                                <option value="engros">Grossiste</option>
                                                <option value="detail">Détaillant</option>
                                                <option value="les_deux">Les deux / Importateur</option>
                                            </select>
                                        </div>
                                        <div className="flex justify-end gap-2 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => setShowQuickSupplier(false)}
                                                className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg font-bold text-[10px]"
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                type="button"
                                                disabled={isSavingSupplier}
                                                onClick={handleCreateSupplier}
                                                className="px-4 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px]"
                                            >
                                                {isSavingSupplier ? 'Enregistrement...' : 'Créer & Associer'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-2">Prix Public (DT)</label>
                                    <input name="oldPrice" type="number" step="any" value={formData.oldPrice} onChange={handleChange} className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-900" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-2">Remise (%)</label>
                                    <input name="discount" type="number" value={formData.discount} onChange={handleChange} className="w-full h-14 bg-brand-primary/5 text-brand-primary border-none rounded-2xl px-6 font-black" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-2">Unités Stock</label>
                                    <input name="quantity" type="number" value={formData.quantity} onChange={(e) => {
                                        const v = parseFloat(e.target.value) || 0;
                                        setFormData(prev => ({ ...prev, quantity: v, quantité_enstock: v }));
                                    }} className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-900" />
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                <div>
                                    <span className="font-black text-xs text-slate-900 block uppercase tracking-wider">Publication en Boutique (existe_dans_boutique)</span>
                                    <span className="text-[11px] text-slate-500 font-medium">Visible et achetable en ligne sur PharmaShop</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="existe_dans_boutique"
                                        checked={Boolean(formData.existe_dans_boutique)}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                                </label>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-2">Protocole d'utilisation & Composition</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="DÉTAILLER LES ACTIFS ET BIENFAITS..." className="w-full bg-slate-50 border-none rounded-2xl p-6 h-36 font-medium text-slate-600 focus:ring-2 focus:ring-brand-primary/20 resize-none"></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-8 py-3.5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-900 transition-colors">
                            Annuler
                        </button>
                        <button type="submit" className="bg-brand-primary text-white font-black px-12 py-3.5 rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all uppercase tracking-widest text-[11px]">
                            Enregistrer le soin
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

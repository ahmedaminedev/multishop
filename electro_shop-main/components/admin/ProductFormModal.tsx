
import React, { useState, useEffect, useMemo } from 'react';
import type { Product, Category } from '../../types';
import { XMarkIcon, PlusIcon, TrashIcon, InformationCircleIcon, CartIcon, HeartIcon } from '../IconComponents';
import { ImageInput } from '../ImageInput';
import { useToast } from '../ToastContext'; 
import { ProductGallery } from '../ProductGallery';

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (productData: Omit<Product, 'id'>) => void;
    product: Product | null;
    categories: Category[];
}

type Specification = { name: string; value: string; };

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSave, product, categories }) => {
    const { addToast } = useToast();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        oldPrice: 0,
        discount: 0,
        images: [] as string[],
        category: '',
        description: '',
        quantity: 0,
        specifications: [] as Specification[],
    });
    
    const finalPrice = useMemo(() => {
        const basePrice = formData.oldPrice || 0;
        const discount = formData.discount || 0;
        if (basePrice > 0 && discount > 0) {
            const effectiveDiscount = Math.min(discount, 100);
            return basePrice * (1 - effectiveDiscount / 100);
        }
        return basePrice;
    }, [formData.oldPrice, formData.discount]);

    const isPromo = useMemo(() => (formData.discount || 0) > 0 && (formData.oldPrice || 0) > 0, [formData.discount, formData.oldPrice]);

    useEffect(() => {
        if (product) {
            const basePrice = product.oldPrice || product.price;
            // Handle backward compatibility: if images array is empty but imageUrl exists
            let initialImages = product.images || [];
            if (initialImages.length === 0 && product.imageUrl) {
                initialImages = [product.imageUrl];
            }

            setFormData({
                name: product.name,
                brand: product.brand,
                oldPrice: basePrice,
                discount: product.discount || 0,
                images: initialImages,
                category: product.category,
                description: product.description || '',
                quantity: product.quantity,
                specifications: product.specifications || [],
            });
        } else {
             setFormData({
                name: '', brand: '', oldPrice: 0, discount: 0, images: [],
                category: '', description: '', quantity: 0, specifications: [],
            });
        }
        setStep(1);
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let processedValue: string | number = value;
        if (type === 'number') {
            processedValue = parseFloat(value) || 0;
            if (name === 'discount') {
                processedValue = Math.max(0, processedValue);
            }
        }
        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleImagesChange = (newImages: string[]) => {
        setFormData(prev => ({ ...prev, images: newImages }));
    };
    
    const handleSpecChange = (index: number, field: 'name' | 'value', value: string) => {
        const newSpecs = [...formData.specifications];
        newSpecs[index] = { ...newSpecs[index], [field]: value };
        setFormData(prev => ({ ...prev, specifications: newSpecs }));
    };

    const addSpec = () => {
        setFormData(prev => ({...prev, specifications: [...prev.specifications, {name: '', value: ''}]}));
    };

    const removeSpec = (index: number) => {
        setFormData(prev => ({...prev, specifications: prev.specifications.filter((_, i) => i !== index)}));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            addToast("Le nom du produit est obligatoire.", "error");
            return false;
        }
        if (formData.oldPrice <= 0) {
            addToast("Le prix original doit être supérieur à 0.", "error");
            return false;
        }
        if (formData.quantity < 0) {
            addToast("La quantité ne peut pas être négative.", "error");
            return false;
        }
        if (!formData.category) {
            addToast("Veuillez sélectionner une catégorie.", "error");
            return false;
        }
        if (formData.images.length === 0) {
            addToast("Veuillez ajouter au moins une image pour le produit.", "error");
            return false;
        }
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        const productData: Omit<Product, 'id'> = {
            name: formData.name,
            brand: formData.brand,
            category: formData.category,
            description: formData.description,
            imageUrl: formData.images[0], // Set Main Image
            images: formData.images,
            quantity: formData.quantity,
            price: finalPrice,
            oldPrice: isPromo ? formData.oldPrice : undefined,
            discount: isPromo ? formData.discount : undefined,
            promo: isPromo,
            specifications: formData.specifications.filter(s => s.name.trim() && s.value.trim()),
        };
        onSave(productData);
        onClose();
    };
    
    if (!isOpen) return null;

    const allCategoryNames = categories.flatMap(c => 
        [c.name, ...(c.subCategories || []), ...(c.megaMenu?.flatMap(m => m.items.map(i => i.name)) || [])]
    );
    const uniqueCategoryNames = [...new Set(allCategoryNames)].sort();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Enlarged Modal Container to 95vw/90vh for better preview space */}
            <div className="relative w-[95vw] h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800 z-20">
                    <h2 id="modal-title" className="text-xl font-bold text-gray-900 dark:text-white">{product ? 'Modifier le produit' : 'Ajouter un produit'} (Étape {step}/2)</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="flex flex-col lg:flex-row h-full overflow-hidden">
                    {/* Left Side: Form (Narrower: 33% on LG, 25% on XL) */}
                    <div className="w-full lg:w-1/3 xl:w-1/4 overflow-y-auto border-b lg:border-b-0 lg:border-r dark:border-gray-700 p-6 bg-white dark:bg-gray-800 z-10 custom-scrollbar">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {step === 1 && (
                                <>
                                    <InputField name="name" label="Nom du produit" value={formData.name} onChange={handleChange} required />
                                    <div className="grid grid-cols-1 gap-4">
                                        <InputField name="brand" label="Marque" value={formData.brand} onChange={handleChange} required />
                                        <InputField name="category" label="Catégorie" value={formData.category} onChange={handleChange} as="select" options={uniqueCategoryNames} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField name="oldPrice" label="Prix Original" type="number" value={formData.oldPrice} onChange={handleChange} required />
                                        <InputField name="discount" label="Remise (%)" type="number" value={formData.discount} onChange={handleChange} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField name="price" label="Prix Final" value={finalPrice.toFixed(3)} readOnly />
                                        <InputField name="quantity" label="Stock" type="number" value={formData.quantity} onChange={handleChange} required />
                                    </div>
                                    
                                    {/* Dimension Alert */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 rounded">
                                        <div className="flex items-start">
                                            <InformationCircleIcon className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Cadre Fixe : 500px</p>
                                                <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">
                                                    L'image remplira automatiquement ce cadre.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <ImageInput label="Images" images={formData.images} onChange={handleImagesChange} required />
                                    
                                    <InputField name="description" label="Description" value={formData.description} onChange={handleChange} as="textarea" rows={4} />
                                </>
                            )}
                            {step === 2 && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">Caractéristiques</h3>
                                        <button type="button" onClick={addSpec} className="text-sm bg-green-100 text-green-700 font-semibold py-1 px-3 rounded-lg flex items-center gap-1 hover:bg-green-200">
                                            <PlusIcon className="w-4 h-4" /> Ajouter
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.specifications.map((spec, index) => (
                                            <div key={index} className="grid grid-cols-10 gap-2 items-center bg-gray-50 dark:bg-gray-700/30 p-2 rounded-md">
                                                <input type="text" placeholder="Attribut" value={spec.name} onChange={(e) => handleSpecChange(index, 'name', e.target.value)} className="col-span-4 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500" />
                                                <input type="text" placeholder="Valeur" value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} className="col-span-5 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500" />
                                                <button type="button" onClick={() => removeSpec(index)} className="col-span-1 text-red-500 hover:text-red-700 flex justify-center">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {formData.specifications.length === 0 && <p className="text-xs text-gray-500 text-center italic">Aucune caractéristique.</p>}
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end pt-6 gap-3 border-t dark:border-gray-700 mt-4">
                                {step === 1 && (
                                    <>
                                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">Annuler</button>
                                        <button type="button" onClick={() => setStep(2)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Suivant</button>
                                    </>
                                )}
                                {step === 2 && (
                                    <>
                                        <button type="button" onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">Précédent</button>
                                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Sauvegarder</button>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Right Side: Live Preview (Wider: 66% on LG, 75% on XL) */}
                    <div className="w-full lg:w-2/3 xl:w-3/4 bg-gray-100 dark:bg-gray-900 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
                        <div className="max-w-screen-2xl mx-auto h-full flex flex-col">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 lg:p-8 border border-gray-200 dark:border-gray-700 flex-grow">
                                <div className="flex items-center justify-between mb-6 border-b pb-4 dark:border-gray-700">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Aperçu en direct (Front Office)</h3>
                                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Mode Desktop</span>
                                </div>
                                
                                {/* Using MD:grid-cols-2 to force side-by-side on typical desktop modal width */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
                                    {/* Gallery Preview */}
                                    <div className="w-full">
                                        <ProductGallery 
                                            images={formData.images} 
                                            productName={formData.name || "Nom du produit"} 
                                        />
                                    </div>

                                    {/* Info Preview */}
                                    <div className="w-full">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wider">{(formData.brand || "MARQUE").toUpperCase()}</p>
                                        <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white mt-2 leading-tight">{formData.name || "Nom du produit"}</h1>
                                        
                                        <div className="mt-3 flex items-center gap-2">
                                            <div className="flex text-yellow-400 text-sm">★★★★☆</div>
                                            <span className="text-xs text-gray-500">(3 avis)</span>
                                        </div>

                                        <div className="mt-6 flex items-baseline gap-3 flex-wrap">
                                            <p className="text-4xl font-bold text-red-600">{finalPrice.toFixed(3).replace('.',',')} DT</p>
                                            {isPromo && (
                                                <p className="text-2xl text-gray-400 line-through font-medium">{(formData.oldPrice || 0).toFixed(3).replace('.',',')} DT</p>
                                            )}
                                        </div>

                                        <div className="mt-4 flex items-center">
                                            {formData.quantity === 0 ? (
                                                <>
                                                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                                                    <span className="font-semibold text-red-700 dark:text-red-400">Épuisé</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                                    <span className="font-semibold text-green-700 dark:text-green-400">En stock</span>
                                                </>
                                            )}
                                        </div>

                                        <p className="mt-6 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                            {formData.description ? formData.description : "Description du produit..."}
                                        </p>

                                        {/* Mock Interactive Elements */}
                                        <div className="mt-8 pt-6 border-t dark:border-gray-700 flex items-center gap-4 opacity-75 pointer-events-none grayscale-[0.3]">
                                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700">
                                                <button className="px-3 py-2 text-gray-500">-</button>
                                                <span className="px-2 font-bold text-gray-800 dark:text-white">1</span>
                                                <button className="px-3 py-2 text-gray-500">+</button>
                                            </div>
                                            <button className="flex-1 bg-red-600 text-white font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 shadow-lg">
                                                <CartIcon className="w-5 h-5" /> Ajouter au panier
                                            </button>
                                            <button className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                <HeartIcon className="w-6 h-6"/>
                                            </button>
                                        </div>
                                        
                                        <div className="mt-6 grid grid-cols-3 gap-2 opacity-60 pointer-events-none">
                                            <div className="bg-gray-50 dark:bg-gray-700/30 p-2 rounded text-center text-xs font-medium text-gray-600 dark:text-gray-400">Livraison rapide</div>
                                            <div className="bg-gray-50 dark:bg-gray-700/30 p-2 rounded text-center text-xs font-medium text-gray-600 dark:text-gray-400">Garantie officielle</div>
                                            <div className="bg-gray-50 dark:bg-gray-700/30 p-2 rounded text-center text-xs font-medium text-gray-600 dark:text-gray-400">Paiement sécurisé</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InputField = ({ name, label, value, onChange, type = 'text', as = 'input', options = [], required = false, readOnly = false }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        {as === 'input' && <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} readOnly={readOnly} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 read-only:bg-gray-200 dark:read-only:bg-gray-800 read-only:text-gray-500" />}
        {as === 'textarea' && <textarea id={name} name={name} value={value} onChange={onChange} rows={6} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500" />}
        {as === 'select' && (
            <select id={name} name={name} value={value} onChange={onChange} required={required} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500">
                <option value="">-- Sélectionnez --</option>
                {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        )}
    </div>
);

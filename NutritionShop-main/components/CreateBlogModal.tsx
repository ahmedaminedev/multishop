
import React, { useState } from 'react';
import { XMarkIcon, PencilIcon } from './IconComponents';
import { ImageInput } from './ImageInput';
import { useToast } from './ToastContext';

interface CreateBlogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (postData: any) => void;
}

export const CreateBlogModal: React.FC<CreateBlogModalProps> = ({ isOpen, onClose, onSave }) => {
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        excerpt: '',
        content: '',
        imageUrl: ''
    });

    const categories = ['Soins Visage', 'Maquillage', 'Parfums', 'Corps & Bain', 'Cheveux', 'Lifestyle', 'Conseils', 'Tutoriels'];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (val: string) => {
        setFormData(prev => ({ ...prev, imageUrl: val }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Manual validation
        if (!formData.title.trim()) {
            addToast("Le titre est obligatoire", "error");
            return;
        }
        if (!formData.imageUrl.trim()) {
            addToast("L'image de couverture est obligatoire", "error");
            return;
        }
        if (!formData.category) {
            addToast("Veuillez choisir une catégorie", "error");
            return;
        }
        if (!formData.content.trim()) {
            addToast("Le contenu de l'article est vide", "error");
            return;
        }

        onSave(formData);
        onClose();
        // Reset form
        setFormData({ title: '', category: '', excerpt: '', content: '', imageUrl: '' });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/80 dark:bg-black/80 backdrop-blur-md transition-all animate-fadeIn">
            <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-rose-100 dark:border-gray-800">
                
                {/* Header */}
                <div className="flex justify-between items-center p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Rédiger un article</h2>
                        <p className="text-sm text-gray-500 font-light mt-1">Partagez votre expertise et vos inspirations avec la communauté.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-gray-800 text-gray-400 hover:text-rose-500 transition-colors">
                        <XMarkIcon className="w-8 h-8" />
                    </button>
                </div>

                <form className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        
                        {/* Left Column: Visuals & Meta */}
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-rose-500">Image de couverture</label>
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-rose-300 transition-colors">
                                    {/* Removing 'required' from ImageInput component props to handle it manually */}
                                    <ImageInput label="" value={formData.imageUrl} onChange={handleImageChange} />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="group">
                                    <input 
                                        type="text" 
                                        name="title" 
                                        placeholder="Titre de votre article..." 
                                        value={formData.title} 
                                        onChange={handleChange}
                                        className="w-full bg-transparent text-2xl font-serif font-bold border-b border-gray-200 dark:border-gray-700 py-2 focus:outline-none focus:border-rose-500 transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Catégorie</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(cat => (
                                            <label key={cat} className={`cursor-pointer px-4 py-2 rounded-full text-sm border transition-all select-none ${formData.category === cat ? 'bg-rose-500 text-white border-rose-500 shadow-md' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-rose-300'}`}>
                                                <input 
                                                    type="radio" 
                                                    name="category" 
                                                    value={cat} 
                                                    checked={formData.category === cat} 
                                                    onChange={handleChange} 
                                                    className="hidden" 
                                                />
                                                {cat}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Accroche (Résumé)</label>
                                    <textarea 
                                        name="excerpt" 
                                        placeholder="Une brève introduction pour donner envie de lire..." 
                                        value={formData.excerpt} 
                                        onChange={handleChange}
                                        rows={3}
                                        maxLength={200}
                                        className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-none text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-rose-200 resize-none placeholder:text-gray-400"
                                    ></textarea>
                                    <p className="text-right text-xs text-gray-400 mt-1">{formData.excerpt.length}/200</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Content */}
                        <div className="flex flex-col h-full min-h-[400px]">
                            <label className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-4">Votre Histoire</label>
                            <textarea 
                                name="content" 
                                placeholder="Écrivez votre contenu ici..." 
                                value={formData.content} 
                                onChange={handleChange}
                                className="flex-grow w-full bg-white dark:bg-gray-900 border-none p-0 text-lg font-light leading-relaxed text-gray-800 dark:text-gray-200 focus:ring-0 resize-none placeholder:text-gray-300 dark:placeholder:text-gray-700 h-full"
                            ></textarea>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end gap-4 backdrop-blur-sm sticky bottom-0">
                    <button onClick={onClose} className="px-8 py-3 rounded-full text-gray-500 font-bold uppercase text-xs tracking-wider hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        Annuler
                    </button>
                    <button type="button" onClick={handleSubmit} className="px-8 py-3 rounded-full bg-rose-600 text-white font-bold uppercase text-xs tracking-wider shadow-lg shadow-rose-500/30 hover:bg-rose-700 hover:scale-105 transition-all flex items-center gap-2">
                        <PencilIcon className="w-4 h-4" />
                        Publier l'article
                    </button>
                </div>
            </div>
        </div>
    );
};

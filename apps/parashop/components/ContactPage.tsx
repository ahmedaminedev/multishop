
import React, { useState, useEffect } from 'react';
import { Breadcrumb } from './Breadcrumb';
import { PhoneIcon, MailIcon, MapPinIcon, CheckCircleIcon, PaperAirplaneIcon } from './IconComponents';
import { useToast } from './ToastContext';
import { api } from '../utils/api';
// Added missing Store import from types
import type { Store } from '../types';

// Fix: Define props interface for ContactPage to accept onNavigateHome and stores as used in App.tsx
interface ContactPageProps {
    onNavigateHome: () => void;
    stores: Store[];
}

// Fix: Updated component signature to use ContactPageProps
export const ContactPage: React.FC<ContactPageProps> = ({ onNavigateHome, stores }) => {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const { addToast } = useToast();

    useEffect(() => {
        document.title = "Conseil Pharmaceutique - PharmaNature";
        window.scrollTo(0,0);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.sendMessage(form);
            addToast("Transmission effectuée à nos pharmaciens.", "success");
            setForm({ name: '', email: '', subject: '', message: '' });
        } catch (e) {
            addToast("Erreur lors de l'envoi.", "error");
        }
    };

    return (
        <div className="bg-brand-bg dark:bg-brand-dark min-h-screen">
            <div className="max-w-screen-xl mx-auto px-6 py-16 md:py-24">
                {/* Added Breadcrumb to utilize onNavigateHome prop */}
                <div className="mb-12">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Assistance Pharmaceutique' }]} />
                </div>

                <div className="flex flex-col lg:flex-row gap-20">
                    {/* Information Section */}
                    <div className="w-full lg:w-1/2">
                        <span className="inline-block px-4 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-8">
                            Service Conseil
                        </span>
                        <h1 className="text-5xl md:text-6xl font-serif font-black text-gray-900 dark:text-white mb-10 tracking-tight leading-[1.1]">
                            Une question pour nos <span className="text-brand-primary">Experts</span> ?
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 leading-relaxed font-medium">
                            Nos pharmaciens diplômés vous répondent sous 2h pour toute question relative à votre protocole de soin ou à nos produits.
                        </p>

                        <div className="space-y-6">
                            {[
                                { icon: <PhoneIcon />, title: "Ligne Directe", content: "+216 55 263 522", sub: "Lun-Sam: 08h30 - 19h30" },
                                { icon: <MailIcon />, title: "Canal Email", content: "conseil@pharmanature.tn", sub: "Réponse sous 2h" },
                                { icon: <MapPinIcon />, title: "Officine Centrale", content: "Avenue de la Bourse, Tunis", sub: "Point de retrait disponible" }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-6 p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-50 dark:border-gray-700/50 shadow-sm">
                                    <div className="w-12 h-12 bg-brand-light text-brand-primary rounded-2xl flex items-center justify-center">
                                        {/* Fix: cast to React.ReactElement<{ className?: string }> to specify that icons accept className prop */}
                                        {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6" })}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">{item.title}</h4>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{item.content}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{item.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="w-full lg:w-1/2">
                        <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 md:p-16 shadow-2xl border border-gray-100 dark:border-gray-700/50 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-brand-primary"></div>
                            
                            <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-10">Formulaire de Consultation</h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <input 
                                    type="text" placeholder="VOTRE NOM COMPLET" required 
                                    className="w-full h-16 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-8 text-sm font-bold placeholder-gray-400 focus:ring-2 focus:ring-brand-primary"
                                    value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                                />
                                <input 
                                    type="email" placeholder="VOTRE ADRESSE EMAIL" required 
                                    className="w-full h-16 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-8 text-sm font-bold placeholder-gray-400 focus:ring-2 focus:ring-brand-primary"
                                    value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                                />
                                <textarea 
                                    placeholder="DÉCRIVEZ VOTRE BESOIN..." required rows={5}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-8 text-sm font-bold placeholder-gray-400 focus:ring-2 focus:ring-brand-primary resize-none"
                                    value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                                ></textarea>
                                
                                <button className="w-full bg-brand-primary text-white font-black py-5 rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all flex items-center justify-center gap-3 uppercase tracking-widest">
                                    <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                                    Transmettre ma demande
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

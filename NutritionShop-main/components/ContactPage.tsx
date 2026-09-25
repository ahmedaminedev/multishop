import React, { useState, useEffect } from 'react';
import { Breadcrumb } from './Breadcrumb';
import { PhoneIcon, MailIcon, PlusIcon, MinusIcon, FacebookIcon, TwitterIcon, InstagramIcon, LocationIcon, PaperAirplaneIcon, SparklesIcon } from './IconComponents';
import type { Store } from '../types';
import { useToast } from './ToastContext';
import { Logo } from './Logo';
import { api } from '../utils/api';

interface ContactPageProps {
    onNavigateHome: () => void;
    stores: Store[];
}

const FAQItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 dark:border-gray-800 last:border-0 overflow-hidden">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="flex w-full items-center justify-between text-left py-6 group transition-all" 
                aria-expanded={isOpen}
            >
                <span className={`text-lg font-serif italic font-black uppercase tracking-tighter transition-colors duration-300 ${isOpen ? 'text-brand-neon' : 'text-gray-900 dark:text-white group-hover:text-gray-400'}`}>
                    {question}
                </span>
                <span className={`flex h-10 w-10 items-center justify-center border-2 transition-all duration-500 ${isOpen ? 'bg-brand-neon border-brand-neon text-black rotate-180' : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'}`}>
                    {isOpen ? <MinusIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
                </span>
            </button>
            <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-10' : 'max-h-0 opacity-0'}`}
            >
                <div className="text-sm text-gray-600 dark:text-gray-400 font-mono leading-relaxed pl-6 border-l-2 border-brand-neon/30">
                    {children}
                </div>
            </div>
        </div>
    );
};

const ContactInfoItem: React.FC<{ icon: React.ReactNode; title: string; content: React.ReactNode; label: string }> = ({ icon, title, content, label }) => (
    <div className="relative group p-6 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 hover:border-brand-neon transition-all duration-500 shadow-sm overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-brand-neon transition-all duration-500"></div>
        <div className="flex items-start gap-5 relative z-10">
            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-brand-neon group-hover:text-black group-hover:border-brand-neon transition-all shadow-inner">
                {icon}
            </div>
            <div className="flex-grow">
                <span className="text-[9px] font-black text-brand-neon uppercase tracking-[0.3em] mb-1 block opacity-0 group-hover:opacity-100 transition-opacity">
                    {label}
                </span>
                <h4 className="text-gray-900 dark:text-white font-serif font-black italic uppercase text-lg mb-1 tracking-tight">{title}</h4>
                <div className="text-gray-500 dark:text-gray-400 font-mono text-[11px] leading-relaxed uppercase tracking-wider group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                    {content}
                </div>
            </div>
        </div>
        <div className="absolute -bottom-2 -right-2 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-12 h-12" }) : icon}
        </div>
    </div>
);

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigateHome, stores }) => {
    const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        document.title = `CONTACT HQ - IronFuel Nutrition`;
        window.scrollTo(0,0);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.name.trim() || !formState.email.trim() || !formState.message.trim()) {
            addToast("Paramètres requis invalides.", "warning");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.sendMessage(formState);
            setFormState({ name: '', email: '', subject: '', message: '' });
            addToast("Transmission enregistrée au QG.", "success");
        } catch (error: any) {
            addToast("Erreur lors de l'envoi du signal.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-[#050505] font-sans min-h-screen pb-32 relative overflow-hidden transition-colors duration-300">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 dark:opacity-10 pointer-events-none"></div>

            <div className="relative h-[450px] lg:h-[600px] w-full overflow-hidden">
                <div className="absolute inset-0">
                    <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000&auto=format&fit=crop" alt="Contact Hero" className="w-full h-full object-cover filter grayscale contrast-125" />
                    <div className="absolute inset-0 bg-black/60"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-[#050505] via-transparent to-transparent"></div>
                </div>
                
                <div className="relative z-10 h-full max-w-screen-2xl mx-auto px-6 flex flex-col justify-center pb-24">
                    <div className="mb-10"><Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Support HQ' }]} /></div>
                    <div className="animate-fadeIn">
                        <span className="inline-flex items-center gap-3 bg-brand-neon text-black px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em] mb-6 transform -skew-x-12">
                            <span className="skew-x-12 inline-block">SIGNAL OPÉRATIONNEL</span>
                        </span>
                        <h1 className="text-6xl md:text-9xl font-serif font-black italic text-white uppercase leading-[0.8] tracking-tighter drop-shadow-2xl">
                            TALK TO <span className="text-brand-neon">HQ</span>
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 relative z-20">
                <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col lg:flex-row">
                    
                    <div className="w-full lg:w-[60%] p-8 lg:p-20 relative bg-white dark:bg-transparent">
                        <div className="absolute top-0 left-0 w-2 h-full bg-brand-neon"></div>
                        <h2 className="text-3xl font-serif font-black italic uppercase text-gray-900 dark:text-white mb-4 tracking-tighter">Débriefing Client</h2>
                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="group relative">
                                    <input type="text" name="name" value={formState.name} onChange={handleChange} className="peer w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-800 py-3 text-gray-900 dark:text-white font-mono text-sm focus:border-brand-neon focus:outline-none transition-colors placeholder-transparent" placeholder="NOM" required />
                                    <label className="absolute left-0 -top-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-xs peer-focus:-top-4 peer-focus:text-brand-neon">Identifiant / Nom</label>
                                </div>
                                <div className="group relative">
                                    <input type="email" name="email" value={formState.email} onChange={handleChange} className="peer w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-800 py-3 text-gray-900 dark:text-white font-mono text-sm focus:border-brand-neon focus:outline-none transition-colors placeholder-transparent" placeholder="EMAIL" required />
                                    <label className="absolute left-0 -top-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-xs peer-focus:-top-4 peer-focus:text-brand-neon">Canal Email</label>
                                </div>
                            </div>
                            
                            <div className="group relative">
                                <select name="subject" value={formState.subject} onChange={handleChange} className="peer w-full bg-white dark:bg-black border-b-2 border-gray-200 dark:border-gray-800 py-3 text-gray-900 dark:text-white font-mono text-xs focus:border-brand-neon focus:outline-none appearance-none cursor-pointer uppercase">
                                    <option value="">Sélectionnez un sujet</option>
                                    <option>Conseil Nutrition & Protocoles</option>
                                    <option>Logistique & Livraison</option>
                                    <option>Garantie & Retours</option>
                                    <option>Partenariat Athlète</option>
                                </select>
                                <label className="absolute left-0 -top-4 text-[10px] font-black uppercase tracking-widest text-brand-neon">Objet de la Mission</label>
                            </div>

                            <textarea name="message" rows={5} value={formState.message} onChange={handleChange} className="peer w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 p-6 text-gray-900 dark:text-white font-mono text-sm focus:border-brand-neon focus:outline-none transition-colors resize-none placeholder-gray-400" placeholder="VOTRE MESSAGE..." required />

                            <button type="submit" disabled={isSubmitting} className="group relative inline-flex items-center justify-center bg-black dark:bg-white text-white dark:text-black font-black uppercase text-xs tracking-[0.3em] py-6 px-12 transform -skew-x-12 hover:bg-brand-neon dark:hover:bg-brand-neon hover:text-black transition-all duration-300 w-full md:w-auto shadow-2xl">
                                <span className="relative z-10 flex items-center gap-3 skew-x-12">
                                    {isSubmitting ? 'TRANSMISSION...' : 'Initier l\'envoi'} <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                                </span>
                            </button>
                        </form>
                    </div>

                    <div className="w-full lg:w-[40%] bg-gray-50 dark:bg-black p-8 lg:p-12 border-l border-gray-200 dark:border-gray-800">
                        <div className="space-y-12">
                            <div>
                                <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.5em] mb-10 border-l-4 border-brand-neon pl-4">Intel & Contacts</h3>
                                <div className="space-y-4">
                                    <ContactInfoItem label="Live Comms" icon={<PhoneIcon className="w-5 h-5"/>} title="Radio Freq" content={<a href="tel:+21655263522" className="hover:text-brand-neon transition-colors">+216 55 263 522</a>} />
                                    <ContactInfoItem label="Secured Channel" icon={<MailIcon className="w-5 h-5"/>} title="Signal HQ" content={<a href="mailto:hq@ironfuel.tn" className="hover:text-brand-neon transition-colors">hq@ironfuel.tn</a>} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

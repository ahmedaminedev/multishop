
import React, { useState, useEffect } from 'react';
import { Breadcrumb } from './Breadcrumb';
import { PhoneIcon, MailIcon, PlusIcon, MinusIcon, FacebookIcon, TwitterIcon, InstagramIcon, LocationIcon, ClockIcon } from './IconComponents';
import type { Store } from '../types';
import { useToast } from './ToastContext';

interface ContactPageProps {
    onNavigateHome: () => void;
    stores: Store[];
}

const FAQItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="flex w-full items-center justify-between text-left py-6 group" 
                aria-expanded={isOpen}
            >
                <span className={`text-lg font-serif transition-colors duration-300 ${isOpen ? 'text-rose-600 font-bold' : 'text-gray-800 dark:text-gray-200 group-hover:text-rose-500'}`}>
                    {question}
                </span>
                <span className={`ml-6 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${isOpen ? 'bg-rose-600 text-white rotate-180' : 'bg-rose-50 dark:bg-gray-800 text-rose-400 group-hover:bg-rose-100'}`}>
                    {isOpen ? <MinusIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
                </span>
            </button>
            <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-8' : 'max-h-0 opacity-0'}`}
            >
                <p className="text-base text-gray-500 dark:text-gray-400 font-light leading-relaxed pr-12 pl-4 border-l-2 border-rose-100 dark:border-gray-700">
                    {children}
                </p>
            </div>
        </div>
    );
};

const ContactInfoItem: React.FC<{ icon: React.ReactNode; title: string; content: React.ReactNode }> = ({ icon, title, content }) => (
    <div className="flex items-start gap-5">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-rose-300 flex-shrink-0 backdrop-blur-sm">
            {icon}
        </div>
        <div>
            <h4 className="text-white font-serif font-bold text-lg mb-1">{title}</h4>
            <div className="text-gray-300 font-light text-sm leading-relaxed opacity-90">
                {content}
            </div>
        </div>
    </div>
);

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigateHome, stores }) => {
    const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
    const { addToast } = useToast();

    useEffect(() => {
        document.title = `Contact - Cosmetics Shop`;
        window.scrollTo(0,0);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formState.name.trim() || !formState.email.trim() || !formState.message.trim()) {
            addToast("Merci de remplir tous les champs obligatoires pour que nous puissions vous répondre.", "warning");
            return;
        }

        // Simulation d'envoi
        setTimeout(() => {
            setFormState({ name: '', email: '', subject: '', message: '' });
            addToast("Message envoyé avec succès. Notre équipe vous répondra sous 24h.", "success");
        }, 1000);
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-950 font-sans min-h-screen pb-20">
            {/* Hero Section Artistique */}
            <div className="relative h-[400px] lg:h-[500px] w-full overflow-hidden">
                <div className="absolute inset-0">
                    <img 
                        src="https://images.unsplash.com/photo-1596462502278-27bfdd403cc2?q=80&w=2000&auto=format&fit=crop" 
                        alt="Contact Hero" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-950"></div>
                </div>
                <div className="relative z-10 h-full max-w-screen-xl mx-auto px-6 flex flex-col justify-center pb-20">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Contact' }]} />
                    <div className="mt-8 animate-fadeInUp">
                        <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-[0.2em] mb-4 border border-white/10">
                            Service Client
                        </span>
                        <h1 className="text-5xl lg:text-7xl font-serif text-white font-bold tracking-tight drop-shadow-lg">
                            Parlons <span className="italic text-rose-200">Beauté</span>
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content: Floating Card Design */}
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20">
                <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row">
                    
                    {/* Left: Contact Form (Light) */}
                    <div className="w-full lg:w-3/5 p-8 lg:p-16">
                        <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">Envoyez-nous un message</h2>
                        <p className="text-gray-500 font-light mb-10">Remplissez le formulaire ci-dessous, notre équipe d'experts vous répondra dans les plus brefs délais.</p>
                        
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="group relative">
                                    <input 
                                        type="text" 
                                        id="name" 
                                        name="name" 
                                        value={formState.name} 
                                        onChange={handleChange} 
                                        className="peer w-full border-b-2 border-gray-200 dark:border-gray-700 bg-transparent py-3 text-gray-900 dark:text-white placeholder-transparent focus:border-rose-500 focus:outline-none transition-colors" 
                                        placeholder="Votre Nom"
                                        required
                                    />
                                    <label htmlFor="name" className="absolute left-0 -top-3.5 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-rose-500">Votre Nom</label>
                                </div>
                                <div className="group relative">
                                    <input 
                                        type="email" 
                                        id="email" 
                                        name="email" 
                                        value={formState.email} 
                                        onChange={handleChange} 
                                        className="peer w-full border-b-2 border-gray-200 dark:border-gray-700 bg-transparent py-3 text-gray-900 dark:text-white placeholder-transparent focus:border-rose-500 focus:outline-none transition-colors" 
                                        placeholder="Email"
                                        required
                                    />
                                    <label htmlFor="email" className="absolute left-0 -top-3.5 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-rose-500">Email</label>
                                </div>
                            </div>
                            
                            <div className="group relative">
                                <select 
                                    name="subject" 
                                    value={formState.subject} 
                                    onChange={handleChange}
                                    className="peer w-full border-b-2 border-gray-200 dark:border-gray-700 bg-transparent py-3 text-gray-900 dark:text-white focus:border-rose-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="" disabled hidden></option>
                                    <option className="text-gray-900">Conseils beauté personnalisés</option>
                                    <option className="text-gray-900">Suivi de ma commande</option>
                                    <option className="text-gray-900">Retour & Remboursement</option>
                                    <option className="text-gray-900">Partenariat / Presse</option>
                                    <option className="text-gray-900">Autre demande</option>
                                </select>
                                <label className={`absolute left-0 text-xs text-gray-500 transition-all ${formState.subject ? '-top-3.5 text-xs text-rose-500' : 'top-3 text-base text-gray-400'} pointer-events-none`}>Sujet de votre demande</label>
                            </div>

                            <div className="group relative">
                                <textarea 
                                    name="message" 
                                    rows={4} 
                                    value={formState.message} 
                                    onChange={handleChange}
                                    className="peer w-full border-b-2 border-gray-200 dark:border-gray-700 bg-transparent py-3 text-gray-900 dark:text-white placeholder-transparent focus:border-rose-500 focus:outline-none transition-colors resize-none"
                                    placeholder="Message"
                                    required
                                ></textarea>
                                <label className="absolute left-0 -top-3.5 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-rose-500">Comment pouvons-nous vous aider ?</label>
                            </div>

                            <button 
                                type="submit" 
                                className="group relative overflow-hidden bg-black dark:bg-white text-white dark:text-black font-bold uppercase text-xs tracking-[0.2em] py-5 px-10 rounded-full hover:shadow-2xl hover:shadow-rose-500/20 transition-all duration-300 w-full md:w-auto"
                            >
                                <span className="relative z-10">Envoyer le message</span>
                                <div className="absolute inset-0 h-full w-full scale-0 rounded-full transition-all duration-300 group-hover:scale-100 group-hover:bg-rose-600"></div>
                            </button>
                        </form>
                    </div>

                    {/* Right: Info Section (Dark/Contrast) */}
                    <div className="w-full lg:w-2/5 bg-gray-900 text-white p-8 lg:p-16 relative overflow-hidden flex flex-col justify-between">
                        {/* Decorative Circle */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-500 rounded-full opacity-20 blur-3xl pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent opacity-50 pointer-events-none"></div>

                        <div className="relative z-10 space-y-12">
                            <div>
                                <h3 className="text-xs font-bold text-rose-400 uppercase tracking-[0.25em] mb-8">Coordonnées</h3>
                                <div className="space-y-8">
                                    <ContactInfoItem 
                                        icon={<PhoneIcon className="w-5 h-5"/>} 
                                        title="Téléphone" 
                                        content={<a href="tel:+21655263522" className="hover:text-rose-300 transition-colors">+216 55 263 522<br/><span className="text-xs opacity-60">Lun - Dim : 09h - 20h</span></a>} 
                                    />
                                    <ContactInfoItem 
                                        icon={<MailIcon className="w-5 h-5"/>} 
                                        title="Email" 
                                        content={<a href="mailto:contact@cosmeticsshop.tn" className="hover:text-rose-300 transition-colors">contact@cosmeticsshop.tn<br/><span className="text-xs opacity-60">Réponse sous 24h ouvrées</span></a>} 
                                    />
                                    <ContactInfoItem 
                                        icon={<LocationIcon className="w-5 h-5"/>} 
                                        title="Siège Social" 
                                        content="Rue de la Feuille d'Érable<br/>Les Berges du Lac 2, Tunis" 
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-rose-400 uppercase tracking-[0.25em] mb-6">Suivez-nous</h3>
                                <div className="flex gap-4">
                                    <SocialLink icon={<InstagramIcon className="w-5 h-5"/>} />
                                    <SocialLink icon={<FacebookIcon className="w-5 h-5"/>} />
                                    <SocialLink icon={<TwitterIcon className="w-5 h-5"/>} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-24 max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-rose-500 font-bold uppercase tracking-widest text-xs">Aide & Support</span>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white mt-3">Questions Fréquentes</h2>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-2 border border-gray-100 dark:border-gray-800">
                        <div className="px-6">
                            <FAQItem question="Quels sont les délais de livraison ?">
                                Nous expédions vos produits avec le plus grand soin sous 24h. La livraison prend généralement 2 à 3 jours ouvrables sur le Grand Tunis et 3 à 5 jours pour le reste de la Tunisie. La livraison est offerte dès 300 DT d'achat.
                            </FAQItem>
                            <FAQItem question="Comment effectuer un retour ?">
                                Votre satisfaction est notre priorité. Vous disposez de 14 jours pour changer d'avis. Le produit doit être intact, non ouvert et dans son emballage d'origine. Contactez notre service client pour recevoir votre bon de retour prépayé.
                            </FAQItem>
                            <FAQItem question="Vos produits sont-ils authentiques ?">
                                Absolument. Cosmetics Shop est revendeur agréé de toutes les marques présentes sur notre site. Nous travaillons en direct avec les maisons mères pour vous garantir une authenticité et une traçabilité totale.
                            </FAQItem>
                            <FAQItem question="Puis-je obtenir des échantillons ?">
                                L'expérience de découverte est essentielle. Chaque commande est accompagnée de 3 échantillons offerts, soigneusement sélectionnés par nos expertes beauté en fonction de votre profil.
                            </FAQItem>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SocialLink: React.FC<{ icon: React.ReactNode }> = ({ icon }) => (
    <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300">
        {icon}
    </a>
);

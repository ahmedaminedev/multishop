
import React, { useState, useEffect } from 'react';
import { Breadcrumb } from './Breadcrumb';
import { BuildingOfficeIcon, PhoneIcon, MailIcon, ClockIcon, PlusIcon, MinusIcon, FacebookIcon, TwitterIcon, InstagramIcon, LocationIcon } from './IconComponents';
import type { Store } from '../types';
import { useToast } from './ToastContext'; // Import Toast context

interface ContactPageProps {
    onNavigateHome: () => void;
    stores: Store[];
}

const FAQItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-200 dark:border-gray-700 py-4">
            <dt>
                <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-start justify-between text-left text-gray-400" aria-expanded={isOpen}>
                    <span className="text-base font-medium text-gray-900 dark:text-gray-100">{question}</span>
                    <span className="ml-6 flex h-7 items-center">
                        {isOpen ? <MinusIcon className="h-6 w-6" /> : <PlusIcon className="h-6 w-6" />}
                    </span>
                </button>
            </dt>
            {isOpen && (
                <dd className="mt-2 pr-12">
                    <p className="text-base text-gray-600 dark:text-gray-300">{children}</p>
                </dd>
            )}
        </div>
    );
};

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; content: React.ReactNode }> = ({ icon, title, content }) => (
    <div className="flex items-center text-left p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg transition-all duration-300">
        <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full mr-4">
            {icon}
        </div>
        <div>
            <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            <div className="mt-1 text-gray-600 dark:text-gray-300 text-sm">{content}</div>
        </div>
    </div>
);


export const ContactPage: React.FC<ContactPageProps> = ({ onNavigateHome, stores }) => {
    const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        document.title = `Contactez-nous - Electro Shop`;
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation Stricte
        if (!formState.name.trim()) {
            addToast("Le nom est obligatoire.", "error");
            return;
        }
        if (!formState.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
            addToast("Format d'email invalide.", "error");
            return;
        }
        if (!formState.subject.trim()) {
            addToast("Veuillez sélectionner un sujet.", "error");
            return;
        }
        if (!formState.message.trim()) {
            addToast("Le message ne peut pas être vide.", "error");
            return;
        }

        console.log('Form submitted:', formState);
        setIsSubmitted(true);
        setFormState({ name: '', email: '', subject: '', message: '' });
        addToast("Message envoyé avec succès !", "success");
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-950">
            {/* Header */}
            <div className="relative bg-gray-800 py-24 sm:py-32">
                 <img src="https://picsum.photos/seed/contact/1920/1080" alt="Customer support representative" className="absolute inset-0 h-full w-full object-cover brightness-50"/>
                 <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">Contactez-nous</h1>
                        <p className="mt-6 text-lg leading-8 text-gray-300">
                            Une question, une suggestion ou besoin d'aide ? Notre équipe est là pour vous répondre.
                        </p>
                    </div>
                 </div>
            </div>

            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                <div className="mb-16">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Contactez-nous' }]} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-2xl shadow-xl">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-8">Envoyez-nous un message</h2>
                        {isSubmitted ? (
                            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md" role="alert">
                                <p className="font-bold">Message envoyé !</p>
                                <p>Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <InputField id="name" name="name" label="Nom complet" type="text" value={formState.name} onChange={handleChange} required />
                                <InputField id="email" name="email" label="Adresse e-mail" type="email" value={formState.email} onChange={handleChange} required />
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sujet</label>
                                    <select id="subject" name="subject" value={formState.subject} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 bg-white dark:bg-gray-700" required>
                                        <option value="">Sélectionnez un sujet</option>
                                        <option>Question sur un produit</option>
                                        <option>Suivi de commande</option>
                                        <option>Service après-vente</option>
                                        <option>Autre</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                                    <textarea id="message" name="message" rows={4} value={formState.message} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 bg-white dark:bg-gray-700" required></textarea>
                                </div>
                                <div>
                                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                                        Envoyer le message
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Right Column: Info */}
                    <div className="space-y-8 sticky top-24">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Nos Coordonnées</h3>
                            <div className="space-y-4">
                               <InfoCard icon={<PhoneIcon className="w-6 h-6"/>} title="Appelez-nous" content={<a href="tel:+216-55-263-522" className="hover:text-red-500 dark:hover:text-red-400 transition-colors">+216 55 263 522</a>} />
                               <InfoCard icon={<MailIcon className="w-6 h-6"/>} title="Envoyez un e-mail" content={<a href="mailto:contact@electroshop.com" className="hover:text-red-500 dark:hover:text-red-400 transition-colors">contact@electroshop.com</a>} />
                               
                               <h4 className="font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-2 border-b dark:border-gray-700 pb-2">Visitez nos magasins</h4>
                               <div className="max-h-64 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                   {stores.map(store => (
                                       <div key={store.id} className="flex items-start gap-3 text-sm">
                                           <LocationIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                           <div>
                                               <span className="font-bold text-gray-800 dark:text-gray-200">{store.name}</span>
                                               <p className="text-gray-600 dark:text-gray-400 text-xs">{store.address}, {store.city}</p>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
                             <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">Suivez-nous</h3>
                             <div className="flex justify-center space-x-6">
                                <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors" aria-label="Facebook"><FacebookIcon className="h-8 w-8"/></a>
                                <a href="#" className="text-gray-400 hover:text-sky-500 transition-colors" aria-label="Twitter"><TwitterIcon className="h-8 w-8"/></a>
                                <a href="#" className="text-gray-400 hover:text-pink-600 transition-colors" aria-label="Instagram"><InstagramIcon className="h-8 w-8"/></a>
                             </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-24 bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-2xl shadow-xl">
                    <div className="mx-auto max-w-4xl">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white text-center">Questions Fréquemment Posées</h2>
                        <dl className="mt-8 space-y-2">
                           <FAQItem question="Quels sont les délais de livraison ?">
                                Nos délais de livraison standard sont de 2 à 3 jours ouvrables pour Tunis et de 3 à 5 jours pour les autres régions de la Tunisie.
                           </FAQItem>
                           <FAQItem question="Comment puis-je suivre ma commande ?">
                                Une fois votre commande expédiée, vous recevrez un e-mail avec un lien de suivi. Vous pouvez également suivre votre commande depuis la section "Suivi de commande" de notre site.
                           </FAQItem>
                           <FAQItem question="Quelle est votre politique de retour ?">
                                Vous pouvez retourner un produit dans les 7 jours suivant la réception s'il est dans son emballage d'origine et n'a pas été utilisé. Veuillez consulter notre page "Conditions de vente" for plus de détails.
                           </FAQItem>
                           <FAQItem question="Proposez-vous une garantie sur vos produits ?">
                                Oui, tous nos produits sont couverts par la garantie officielle du fabricant en Tunisie. La durée et les conditions de la garantie varient selon le produit et la marque.
                           </FAQItem>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};


const InputField: React.FC<{ id: string; name: string; label: string; type: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; }> = 
({ id, name, label, type, value, onChange, required }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input 
            type={type} 
            name={name} 
            id={id} 
            value={value}
            onChange={onChange}
            required={required}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 bg-white dark:bg-gray-700" 
        />
    </div>
);

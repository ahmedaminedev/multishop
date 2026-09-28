
import React from 'react';

interface FooterProps {
    onNavigateToPrivacy?: () => void;
    onNavigateToDataDeletion?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToPrivacy, onNavigateToDataDeletion }) => {
    return (
        <footer className="bg-gray-800 dark:bg-black/50 text-white mt-12">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-lg font-bold mb-4">Electro Shop</h3>
                        <p className="text-sm text-gray-400">Votre destination pour l'électronique et l'électroménager de qualité en Tunisie.</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Informations</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="text-gray-400 hover:text-white">Qui sommes-nous ?</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white">Nos magasins</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white">Conditions de vente</a></li>
                            <li>
                                <a 
                                    href="#/privacy-policy" 
                                    onClick={(e) => { e.preventDefault(); onNavigateToPrivacy?.(); }} 
                                    className="text-gray-400 hover:text-white"
                                >
                                    Politique de confidentialité
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#/data-deletion" 
                                    onClick={(e) => { e.preventDefault(); onNavigateToDataDeletion?.(); }} 
                                    className="text-gray-400 hover:text-white"
                                >
                                    Suppression des données
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Service Client</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="text-gray-400 hover:text-white">Contactez-nous</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white">Suivi de commande</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white">FAQs</a></li>
                        </ul>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
                        <p className="text-sm text-gray-400 mb-4">Abonnez-vous pour recevoir nos promotions.</p>
                        <form className="flex">
                            <input type="email" placeholder="Votre email" className="w-full rounded-l-md px-4 py-2 text-gray-800 dark:bg-gray-700 dark:text-white border-0 focus:ring-2 focus:ring-red-500" />
                            <button className="bg-red-600 rounded-r-md px-4 font-semibold hover:bg-red-700">S'inscrire</button>
                        </form>
                    </div>
                </div>
            </div>
            <div className="bg-gray-900 dark:bg-black py-4">
                 <p className="text-center text-sm text-gray-500">&copy; {new Date().getFullYear()} Electro Shop. Tous droits réservés.</p>
            </div>
        </footer>
    );
};


import React, { useEffect } from 'react';
import { Breadcrumb } from './Breadcrumb';

interface PrivacyPolicyPageProps {
    onNavigateHome: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigateHome }) => {
    useEffect(() => {
        document.title = "Politique de Confidentialité - Electro Shop";
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Politique de Confidentialité' }]} />
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8 prose dark:prose-invert max-w-none">
                    <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Politique de Confidentialité</h1>
                    <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : 27 Octobre 2023</p>

                    <h3>1. Introduction</h3>
                    <p>Bienvenue sur Electro Shop. Nous nous engageons à protéger la confidentialité de vos informations personnelles. Cette politique explique comment nous collectons, utilisons et protégeons vos données lorsque vous utilisez notre site web et nos services.</p>

                    <h3>2. Collecte des Données</h3>
                    <p>Nous collectons les informations suivantes lorsque vous utilisez notre plateforme :</p>
                    <ul>
                        <li><strong>Informations fournies par vous :</strong> Nom, adresse email, numéro de téléphone, adresse de livraison lors de l'inscription ou de la commande.</li>
                        <li><strong>Données de connexion (OAuth) :</strong> Si vous choisissez de vous connecter via Google ou Facebook, nous recevons votre nom, prénom, adresse email et photo de profil publique.</li>
                        <li><strong>Données de navigation :</strong> Cookies et journaux de connexion pour améliorer votre expérience utilisateur.</li>
                    </ul>

                    <h3>3. Utilisation des Données</h3>
                    <p>Vos données sont utilisées pour :</p>
                    <ul>
                        <li>Traiter vos commandes et assurer la livraison.</li>
                        <li>Vous permettre d'accéder à votre espace client via l'authentification sécurisée.</li>
                        <li>Communiquer avec vous concernant vos commandes ou demandes de support.</li>
                        <li>Améliorer nos services et personnaliser votre expérience.</li>
                    </ul>

                    <h3>4. Partage des Données</h3>
                    <p>Nous ne vendons pas vos données personnelles. Elles peuvent être partagées uniquement avec :</p>
                    <ul>
                        <li>Nos prestataires logistiques pour la livraison.</li>
                        <li>Nos partenaires de paiement sécurisé pour les transactions.</li>
                        <li>Les autorités légales si la loi l'exige.</li>
                    </ul>

                    <h3>5. Sécurité</h3>
                    <p>Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles (chiffrement SSL, hachage des mots de passe) pour protéger vos données contre tout accès non autorisé.</p>

                    <h3>6. Vos Droits</h3>
                    <p>Conformément à la réglementation, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Vous pouvez exercer ces droits en nous contactant ou via votre espace profil.</p>

                    <h3>7. Contact</h3>
                    <p>Pour toute question concernant cette politique, veuillez nous contacter à : <a href="mailto:contact@electroshop.com" className="text-red-600 hover:underline">contact@electroshop.com</a></p>
                </div>
            </div>
        </div>
    );
};

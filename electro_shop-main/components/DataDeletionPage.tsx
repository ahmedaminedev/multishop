
import React, { useEffect } from 'react';
import { Breadcrumb } from './Breadcrumb';

interface DataDeletionPageProps {
    onNavigateHome: () => void;
}

export const DataDeletionPage: React.FC<DataDeletionPageProps> = ({ onNavigateHome }) => {
    useEffect(() => {
        document.title = "Suppression des Données - Electro Shop";
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Suppression des Données' }]} />
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8 prose dark:prose-invert max-w-none">
                    <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Instructions de Suppression des Données Utilisateur</h1>
                    
                    <p>Conformément aux règles de la plateforme Facebook et Google, ainsi qu'au RGPD, vous avez le droit de demander la suppression de vos données personnelles stockées sur Electro Shop.</p>

                    <h3>Comment demander la suppression de vos données ?</h3>
                    <p>Si vous souhaitez supprimer votre compte et toutes les données associées, veuillez suivre l'une des méthodes ci-dessous :</p>

                    <h4>Option 1 : Via l'Espace Mon Compte</h4>
                    <ol>
                        <li>Connectez-vous à votre compte Electro Shop.</li>
                        <li>Accédez à la section <strong>Mon Profil</strong> > <strong>Sécurité</strong>.</li>
                        <li>Cliquez sur le bouton <strong>"Supprimer mon compte"</strong> en bas de page.</li>
                        <li>Confirmez votre choix. Vos données seront supprimées de nos systèmes actifs immédiatement.</li>
                    </ol>

                    <h4>Option 2 : Par Email</h4>
                    <p>Envoyez un email à notre équipe de support à l'adresse suivante :</p>
                    <p className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md font-mono text-center">
                        <a href="mailto:support@electroshop.com" className="text-red-600 hover:underline">support@electroshop.com</a>
                    </p>
                    <p>Veuillez utiliser l'adresse email associée à votre compte et indiquer "Demande de suppression de compte" en objet.</p>

                    <h3>Quelles données sont supprimées ?</h3>
                    <p>Une fois la demande traitée, nous supprimerons :</p>
                    <ul>
                        <li>Vos informations de profil (Nom, Email, Photo, Téléphone).</li>
                        <li>Vos adresses enregistrées.</li>
                        <li>L'historique de vos connexions.</li>
                        <li>Vos jetons d'authentification (Google/Facebook).</li>
                    </ul>
                    <p><em>Note : Certaines données de commande peuvent être conservées à des fins comptables et légales pour une durée déterminée.</em></p>
                </div>
            </div>
        </div>
    );
};

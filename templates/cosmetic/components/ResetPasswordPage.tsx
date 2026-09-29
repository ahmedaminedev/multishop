
import React, { useState } from 'react';
import { LockIcon, EyeIcon, EyeSlashIcon } from './IconComponents';
import { useToast } from './ToastContext';

interface ResetPasswordPageProps {
    onNavigateHome: () => void;
    token: string;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigateHome, token }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password.length < 6) {
            addToast("Le mot de passe doit contenir au moins 6 caractères.", "error");
            return;
        }

        if (password !== confirmPassword) {
            addToast("Les mots de passe ne correspondent pas.", "error");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });
            const data = await response.json();

            if (response.ok) {
                // Stocker le nouveau token si retourné (auto-login)
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                addToast("Mot de passe réinitialisé avec succès !", "success");
                setTimeout(onNavigateHome, 2000);
            } else {
                throw new Error(data.message || "Erreur de réinitialisation.");
            }
        } catch (error: any) {
            addToast(error.message, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Nouveau Mot de Passe</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nouveau mot de passe</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><LockIcon className="w-5 h-5"/></span>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2.5 pl-10 pr-10 focus:ring-red-500 focus:border-red-500"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPassword ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                            </button>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmer mot de passe</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><LockIcon className="w-5 h-5"/></span>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2.5 pl-10 pr-10 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-red-600 text-white font-bold py-3 rounded-md hover:bg-red-700 transition-colors disabled:opacity-70"
                    >
                        {isLoading ? 'Traitement...' : 'Réinitialiser'}
                    </button>
                </form>
            </div>
        </div>
    );
};
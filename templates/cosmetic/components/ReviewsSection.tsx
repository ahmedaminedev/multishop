
import React, { useState, useEffect, useMemo } from 'react';
import type { Review } from '../types';
import { StarIcon } from './IconComponents';
import { api } from '../utils/api';
import { useToast } from './ToastContext';

interface ReviewsSectionProps {
    targetId: number;
    targetType: 'product' | 'pack';
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ targetId, targetType }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        
        const loadReviews = async () => {
            try {
                const data = await api.getReviews(targetType, targetId);
                setReviews(data);
            } catch (error) {
                console.error("Error loading reviews", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadReviews();
    }, [targetId, targetType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setIsSubmitting(true);
        try {
            const newReview = await api.createReview({
                targetId,
                targetType,
                rating,
                comment
            });
            setReviews([newReview, ...reviews]);
            setComment('');
            setRating(5);
            addToast("Merci pour votre avis !", "success");
        } catch (error: any) {
            addToast(error.message || "Erreur lors de l'envoi de l'avis", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const averageRating = useMemo(() => {
        return reviews.length > 0 
            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
            : "0.0";
    }, [reviews]);

    const ratingDistribution = useMemo(() => {
        const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            // @ts-ignore
            if (dist[r.rating] !== undefined) dist[r.rating]++;
        });
        return dist;
    }, [reviews]);

    return (
        <section className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 p-8 md:p-12 lg:p-16 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 to-orange-300"></div>
            
            <div className="text-center mb-12">
                <span className="text-rose-500 font-bold tracking-[0.2em] text-xs uppercase">Avis Vérifiés</span>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white mt-3">L'expérience Cliente</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                {/* Left: Summary & Stats */}
                <div className="lg:col-span-4 flex flex-col justify-center">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-700">
                        <span className="text-7xl font-serif font-bold text-gray-900 dark:text-white">{averageRating}</span>
                        <div className="flex justify-center text-yellow-400 my-4 gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon key={star} className={`w-6 h-6 ${star <= Number(averageRating) ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                            ))}
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">{reviews.length} avis déposés</p>
                    </div>

                    {/* Bars Distribution */}
                    <div className="mt-8 space-y-3">
                        {[5, 4, 3, 2, 1].map(num => {
                            // @ts-ignore
                            const count = ratingDistribution[num];
                            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                            return (
                                <div key={num} className="flex items-center gap-3 text-sm">
                                    <span className="font-bold w-3">{num}</span>
                                    <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                    <span className="text-gray-400 w-8 text-right">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Reviews List & Form */}
                <div className="lg:col-span-8">
                    {/* Form Block */}
                    <div className="mb-12 bg-gray-50 dark:bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        {isLoggedIn ? (
                            <form onSubmit={handleSubmit}>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Partagez votre avis</h3>
                                <div className="mb-4">
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Note globale</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                type="button"
                                                key={star}
                                                onClick={() => setRating(star)}
                                                className="focus:outline-none transition-transform hover:scale-110"
                                            >
                                                <StarIcon className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Votre commentaire</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={3}
                                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-rose-500 focus:border-rose-500 transition-shadow p-4 text-sm"
                                        placeholder="Qu'avez-vous pensé de ce produit ?"
                                        required
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-rose-600 dark:hover:bg-rose-400 dark:hover:text-white transition-colors disabled:opacity-50 shadow-lg"
                                >
                                    {isSubmitting ? 'Publication...' : 'Publier mon avis'}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-gray-600 dark:text-gray-300 mb-4">Vous possédez ce produit ? Connectez-vous pour partager votre expérience.</p>
                                <a href="/#/login" className="inline-block bg-white border border-gray-200 text-gray-900 px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors">
                                    Se connecter
                                </a>
                            </div>
                        )}
                    </div>

                    {/* List */}
                    <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {isLoading ? (
                            <div className="text-center text-gray-500 py-10">Chargement des avis...</div>
                        ) : reviews.length > 0 ? (
                            reviews.map((review) => (
                                <div key={review._id} className="pb-8 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0 animate-fadeIn">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900/50 dark:to-rose-800/50 flex items-center justify-center text-rose-600 dark:text-rose-300 font-bold text-lg shadow-sm">
                                                {review.userName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{review.userName}</p>
                                                <div className="flex text-yellow-400 text-xs mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <StarIcon key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-gray-200 dark:text-gray-700'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400 font-medium bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">
                                            {new Date(review.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 font-light leading-relaxed pl-16 text-sm">
                                        "{review.comment}"
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <p className="text-gray-400 italic">Aucun avis pour le moment. Soyez le premier !</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

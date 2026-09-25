
import React, { useState, useEffect, useMemo } from 'react';
import type { Review } from '../types';
import { CheckCircleIcon, SparklesIcon, StarIcon, UserIcon } from './IconComponents';
import { api } from '../utils/api';
import { useToast } from './ToastContext';

interface ReviewsSectionProps {
    targetId: number;
    targetType: 'product' | 'pack';
}

const RatingBar: React.FC<{ label: string; percentage: number }> = ({ label, percentage }) => (
    <div className="flex items-center gap-4 group">
        <span className="text-[10px] font-black text-gray-400 w-4 font-mono">{label}</span>
        <div className="flex-grow h-1.5 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden relative">
            <div 
                className="absolute top-0 left-0 h-full bg-brand-primary transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(5,150,105,0.2)]"
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
        <span className="text-[10px] font-bold text-gray-400 w-8 text-right font-mono">{percentage}%</span>
    </div>
);

const HealthStars: React.FC<{ rating: number; size?: string }> = ({ rating, size = "w-4 h-4" }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
            <StarIcon 
                key={s} 
                className={`${size} ${s <= rating ? 'text-brand-primary' : 'text-gray-200 dark:text-gray-800'}`} 
            />
        ))}
    </div>
);

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
        api.getReviews(targetType, targetId).then(setReviews).finally(() => setIsLoading(false));
    }, [targetId, targetType]);

    const stats = useMemo(() => {
        const counts = [0, 0, 0, 0, 0, 0];
        reviews.forEach(r => counts[Math.round(r.rating)]++);
        const total = reviews.length || 1;
        return {
            avg: reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0",
            dist: [5, 4, 3, 2, 1].map(num => ({
                label: num.toString(),
                percentage: Math.round((counts[num] / total) * 100)
            }))
        };
    }, [reviews]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;
        setIsSubmitting(true);
        try {
            const newReview = await api.createReview({ targetId, targetType, rating, comment });
            setReviews([newReview, ...reviews]);
            setComment('');
            setRating(5);
            addToast("AVIS ENREGISTRÉ DANS VOTRE DOSSIER", "success");
        } catch (error: any) {
            addToast("ERREUR LORS DE LA TRANSMISSION", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-24 border-t border-gray-100 dark:border-gray-900">
            <div className="max-w-7xl mx-auto px-4">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24 items-center">
                    <div className="lg:col-span-4 text-center lg:text-left">
                        <span className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Pharmacovigilance</span>
                        <h2 className="text-5xl font-serif font-black text-gray-900 dark:text-white leading-tight">
                            RAPPORTS <br/> <span className="text-brand-primary italic">CONSEIL</span>
                        </h2>
                        <div className="inline-flex items-center gap-2 bg-brand-light dark:bg-white/5 border border-brand-primary/10 px-4 py-2 rounded-full mt-6">
                            <CheckCircleIcon className="w-4 h-4 text-brand-primary" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{reviews.length} Patients ont validé la cure</span>
                        </div>
                    </div>

                    <div className="lg:col-span-3 flex flex-col items-center justify-center p-10 bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Indice de Vitalité</p>
                        <span className="text-7xl font-serif font-black text-gray-900 dark:text-white tracking-tighter">{stats.avg}</span>
                        <div className="mt-4">
                            <HealthStars rating={Math.round(Number(stats.avg))} size="w-5 h-5" />
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-4 px-4 lg:px-12">
                        {stats.dist.map(d => (
                            <RatingBar key={d.label} label={d.label} percentage={d.percentage} />
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
                    
                    <div className="lg:col-span-1">
                        <div className="sticky top-32">
                            <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-8">Partager votre <span className="text-brand-primary">expérience</span></h3>
                            
                            {isLoggedIn ? (
                                <form onSubmit={handleSubmit} className="space-y-8 p-10 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border border-gray-100 dark:border-white/5">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Évaluation du soin</label>
                                        <div className="flex justify-between gap-2">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <button 
                                                    key={s} type="button" onClick={() => setRating(s)} 
                                                    className={`flex-1 h-12 flex items-center justify-center font-bold rounded-xl border transition-all ${s <= rating ? 'bg-brand-primary border-brand-primary text-white shadow-lg' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'}`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Avis Expert</label>
                                        <textarea
                                            value={comment} onChange={(e) => setComment(e.target.value)}
                                            className="w-full bg-white dark:bg-gray-900 border-none rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-brand-primary outline-none text-gray-900 dark:text-white h-40 resize-none"
                                            placeholder="DÉCRIVEZ LES BIENFAITS RESSENTIS..." required
                                        />
                                    </div>

                                    <button 
                                        type="submit" disabled={isSubmitting} 
                                        className="w-full bg-brand-primary text-white font-black py-5 uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all"
                                    >
                                        {isSubmitting ? 'TRANSMISSION...' : 'TRANSMETTRE MON AVIS'}
                                    </button>
                                </form>
                            ) : (
                                <div className="p-12 bg-white dark:bg-white/5 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/10 text-center">
                                    <UserIcon className="w-10 h-10 mx-auto mb-6 text-gray-300" />
                                    <p className="text-sm font-medium text-gray-500 leading-relaxed uppercase tracking-widest">
                                        Identifiez-vous pour <br/> partager votre avis expert.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-12">
                        {reviews.length > 0 ? (
                            reviews.map((review, i) => (
                                <div key={review._id} className="group animate-fadeInUp">
                                    <div className="bg-white dark:bg-transparent border-b border-gray-100 dark:border-gray-800 pb-12 transition-all">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-brand-light dark:bg-gray-800 flex items-center justify-center font-serif font-black text-xl rounded-2xl text-brand-primary shadow-sm">
                                                    {review.userName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-bold text-gray-900 dark:text-white uppercase text-sm tracking-widest">{review.userName}</h4>
                                                        <span className="bg-brand-primary/10 text-brand-primary text-[8px] font-black px-2 py-0.5 uppercase tracking-tighter rounded-full">Patient Certifié</span>
                                                    </div>
                                                    <p className="text-[10px] font-medium text-gray-400 uppercase mt-1">Soin administré le : {new Date(review.date).toLocaleDateString('fr-FR')}</p>
                                                </div>
                                            </div>
                                            <div className="bg-brand-light dark:bg-white/5 px-4 py-2 rounded-xl border border-brand-primary/10">
                                                <HealthStars rating={review.rating} />
                                            </div>
                                        </div>
                                        
                                        <div className="relative pl-8 border-l-4 border-brand-primary/20">
                                            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium leading-relaxed italic">
                                                "{review.comment}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-80 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-black/20 rounded-[3rem]">
                                <SparklesIcon className="w-12 h-12 text-gray-200 dark:text-gray-800 mb-4 animate-pulse" />
                                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gray-400">Aucun protocole évalué pour le moment</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

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
        <span className="text-[10px] font-black text-gray-500 w-4 font-mono">{label}</span>
        <div className="flex-grow h-1.5 bg-gray-100 dark:bg-gray-800 rounded-none overflow-hidden relative">
            <div 
                className="absolute top-0 left-0 h-full bg-brand-neon transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(204,255,0,0.5)]"
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
        <span className="text-[10px] font-bold text-gray-400 w-8 text-right font-mono">{percentage}%</span>
    </div>
);

const ImpactStars: React.FC<{ rating: number; size?: string }> = ({ rating, size = "w-4 h-4" }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
            <StarIcon 
                key={s} 
                className={`${size} ${s <= rating ? 'text-brand-neon' : 'text-gray-200 dark:text-gray-800'}`} 
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
            addToast("FEEDBACK ENREGISTRÉ DANS LA BASE", "success");
        } catch (error: any) {
            addToast("ERREUR DE TRANSMISSION", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-20 border-t border-gray-100 dark:border-gray-900">
            <div className="max-w-7xl mx-auto px-4">
                
                {/* --- HEADER : PERFORMANCE DASHBOARD --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 items-center">
                    <div className="lg:col-span-4 text-center lg:text-left">
                        <span className="text-brand-neon font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Field Intelligence</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-black italic text-gray-900 dark:text-white uppercase mb-6 tracking-tighter">
                            RAPPORTS <br/> <span className="text-brand-neon">D'IMPACT</span>
                        </h2>
                        <div className="inline-flex items-center gap-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 px-4 py-2 rounded-none slant">
                            <span className="slant-reverse flex items-center gap-2">
                                <CheckCircleIcon className="w-4 h-4 text-brand-neon" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{reviews.length} Athlètes ont validé</span>
                            </span>
                        </div>
                    </div>

                    <div className="lg:col-span-3 flex flex-col items-center justify-center p-8 bg-black dark:bg-brand-gray border-2 border-brand-neon/20 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-brand-neon/30 animate-pulse"></div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 font-mono">Performance Score</p>
                        <span className="text-7xl font-black text-white font-mono tracking-tighter leading-none">{stats.avg}</span>
                        <div className="mt-4">
                            <ImpactStars rating={Math.round(Number(stats.avg))} size="w-5 h-5" />
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-3 px-4 lg:px-12">
                        {stats.dist.map(d => (
                            <RatingBar key={d.label} label={d.label} percentage={d.percentage} />
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    
                    {/* --- LEFT: SUBMIT FORM --- */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32">
                            <h3 className="text-xl font-serif font-black italic uppercase text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                                <span className="w-2 h-6 bg-brand-neon slant"></span>
                                Nouveau Rapport
                            </h3>
                            
                            {isLoggedIn ? (
                                <form onSubmit={handleSubmit} className="space-y-8 p-8 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-xl">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Note de Mission</label>
                                        <div className="flex justify-between gap-2">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <button 
                                                    key={s} 
                                                    type="button" 
                                                    onClick={() => setRating(s)} 
                                                    className={`flex-1 h-12 flex items-center justify-center font-black transition-all border-2 ${s <= rating ? 'bg-brand-neon border-brand-neon text-black' : 'bg-transparent border-gray-200 dark:border-gray-800 text-gray-400'}`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Débriefing Technique</label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            className="w-full bg-white dark:bg-black border-2 border-gray-100 dark:border-gray-800 p-4 text-xs font-mono focus:border-brand-neon outline-none text-gray-900 dark:text-white uppercase placeholder-gray-400 h-32"
                                            placeholder="VOTRE EXPÉRIENCE AVEC L'UNITÉ..."
                                            required
                                        />
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting} 
                                        className="w-full bg-black dark:bg-white text-white dark:text-black font-black py-5 uppercase tracking-[0.2em] text-[10px] hover:bg-brand-neon hover:text-black transition-all slant shadow-2xl"
                                    >
                                        <span className="slant-reverse block">{isSubmitting ? 'TRANSMISSION...' : 'TRANSMETTRE LE RAPPORT'}</span>
                                    </button>
                                </form>
                            ) : (
                                <div className="p-10 bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 text-center">
                                    <UserIcon className="w-8 h-8 mx-auto mb-4 text-gray-300" />
                                    <p className="text-[10px] font-mono uppercase text-gray-500 leading-relaxed">
                                        Identifiez-vous pour <br/> soumettre un rapport technique.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- RIGHT: FEED OF REVIEWS --- */}
                    <div className="lg:col-span-2 space-y-8">
                        {reviews.length > 0 ? (
                            reviews.map((review, i) => (
                                <div key={review._id} className="group animate-fadeInUp" style={{ animationDelay: `${i * 100}ms` }}>
                                    <div className="bg-white dark:bg-transparent border-b border-gray-100 dark:border-gray-800 pb-10 transition-all">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-900 flex items-center justify-center font-serif font-black italic text-xl border border-brand-neon text-brand-neon slant">
                                                    <span className="slant-reverse">{review.userName.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-widest">{review.userName}</h4>
                                                        <span className="bg-brand-neon/10 text-brand-neon text-[8px] font-black px-2 py-0.5 uppercase tracking-tighter border border-brand-neon/30">Athlète Vérifié</span>
                                                    </div>
                                                    <p className="text-[9px] font-mono text-gray-400 uppercase mt-1">Date d'impact : {new Date(review.date).toLocaleDateString('fr-FR')}</p>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-white/5 px-3 py-2 rounded-none border border-gray-100 dark:border-white/10">
                                                <ImpactStars rating={review.rating} />
                                            </div>
                                        </div>
                                        
                                        <div className="relative pl-6 border-l-2 border-brand-neon/20">
                                            <p className="text-base text-gray-600 dark:text-gray-300 font-medium leading-relaxed italic">
                                                "{review.comment}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-80 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-black/20">
                                <SparklesIcon className="w-12 h-12 text-gray-200 dark:text-gray-800 mb-4 animate-pulse" />
                                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gray-400">Aucun log opérationnel détecté</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
